import type { Id } from "../core/ids.ts";
import type { ConductRule, DamageType, LayerType, PartId } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { chance } from "../core/rng.ts";
import { emit, evalCtxFor, partDefs, seatsOf, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { applyEffect } from "./effects.ts";
import { signal } from "./hooks.ts";

export function conductRules(ctx: Ctx, unitId: Id, partId: PartId): ConductRule[] {
  return [...(partDefs(ctx, unitId).find(p => p.id === partId)?.conduct ?? []),
    ...unit(ctx, unitId).effects.slice().sort((a, b) => a.uid - b.uid)
      .filter(e => e.owner.part === undefined || e.owner.part === partId)
      .flatMap(e => ctx.db.require("effect", e.effect).conduct ?? [])];
}

export function conduct(ctx: Ctx, unitId: Id, partId: PartId, when: ConductRule["when"],
  layerType: LayerType | null, info: { damageType: DamageType; amount: number; conductBonus: number }): void {
  for (const rule of conductRules(ctx, unitId, partId)) {
    if (rule.when !== when || (rule.layer !== undefined && rule.layer !== layerType)) continue;
    for (const seat of seatsOf(ctx, unitId)) {
      if (rule.to !== "allSeats" && rule.to !== seat.role) continue;
      const target = { unit: unitId, person: seat.person, part: partId };
      const probability = Math.max(0, Math.min(1, evalNum(rule.chance ?? 1, evalCtxFor(ctx, target)) + info.conductBonus));
      if (probability <= 0 || (probability < 1 && !chance(ctx.s.rng, probability))) continue;
      for (const effect of rule.effects) applyEffect(ctx, effect, target, unitId);
      const payload = { unit: unitId, part: partId, person: seat.person, when, layerType };
      emit(ctx, "Conducted", payload);
      signal(ctx, "conducted", { ...payload, damageType: info.damageType, amount: info.amount });
    }
  }
}
