import type { Id } from "../core/ids.ts";
import type { DamageType, InjuryRow, LayerType } from "../core/types-def.ts";
import { chance, pickWeighted } from "../core/rng.ts";
import type { Ctx } from "./state.ts";
import { constant, emit, person, unit } from "./state.ts";
import { applyEffect } from "./effects.ts";
import { changePool } from "./pools.ts";
import { onSignal, signal } from "./hooks.ts";
import { moraleEvent } from "./morale.ts";

export function injuryCandidates(ctx: Ctx, damageType: DamageType, layerType: LayerType | null, permanent: boolean): InjuryRow[] {
  // SPEC-GAP：空過濾陣列視為不限類型，null 層僅匹配不限層的列。
  return ctx.db.rules.injuries.filter(row => row.permanent === permanent && row.weight > 0
    && (!row.damageTypes.length || row.damageTypes.includes(damageType))
    && (!row.layerTypes.length || (layerType !== null && row.layerTypes.includes(layerType))));
}

export function resolveConductInjury(ctx: Ctx, personId: Id, info: { damageType: DamageType; layerType: LayerType | null; amount: number }): void {
  const p = person(ctx, personId), hp = p.pools.hp;
  const damage = Math.max(0, info.amount * constant(ctx, "conductDamageFactor"));
  if (hp) changePool(ctx, { person: personId }, "hp", -damage, "conduct");
  let candidates = injuryCandidates(ctx, info.damageType, info.layerType, false);
  let injury = candidates.length ? pickWeighted(ctx.s.rng, candidates, row => row.weight) : undefined;
  if (hp && damage >= constant(ctx, "permanentThreshold") * hp.max) {
    if (chance(ctx.s.rng, constant(ctx, "permanentChance"))) {
      candidates = injuryCandidates(ctx, info.damageType, info.layerType, true);
      if (candidates.length) injury = pickWeighted(ctx.s.rng, candidates, row => row.weight);
    }
    moraleEvent(ctx, "heavyInjury", [personId]);
  }
  if (injury) applyEffect(ctx, injury.effect, { person: personId }, `injury:${personId}`);
}

export function killPerson(ctx: Ctx, personId: Id, unitId: Id | null): void {
  const p = person(ctx, personId);
  if (ctx.s.log.events.some(e => e.type === "PersonDied" && e.payload.person === personId)) return;
  const uid = unitId ?? p.seat?.mech ?? null;
  if (p.pools.hp) p.pools.hp.cur = 0;
  if (uid !== null) {
    const u = unit(ctx, uid);
    for (const seat of Object.keys(u.seats).sort()) if (u.seats[seat] === personId) u.seats[seat] = null;
  }
  delete p.seat;
  emit(ctx, "PersonDied", { person: personId, unit: uid });
  signal(ctx, "personDied", { person: personId, unit: uid });
}

onSignal("conducted", "people.injury.conduct", 0, (ctx, p) => {
  if (typeof p.person === "string" && typeof p.damageType === "string" && typeof p.amount === "number") {
    resolveConductInjury(ctx, p.person, { damageType: p.damageType, layerType: typeof p.layerType === "string" ? p.layerType : null, amount: p.amount });
  }
});
onSignal("poolDepleted", "people.injury.death", 0, (ctx, p) => {
  if (p.kind === "person" && p.pool === "hp" && typeof p.owner === "string") killPerson(ctx, p.owner, person(ctx, p.owner).seat?.mech ?? null);
});
