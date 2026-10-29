import type { Id } from "../core/ids.ts";
import type { PartId } from "../core/types-def.ts";
import type { Ctx, Rejection } from "./state.ts";
import { commanderOf, distance, emit, evalCtxFor, frameView, isActive, layerDefs, partDefs, seatsOf, unit } from "./state.ts";
import { evalNum } from "../core/numexpr.ts";
import { applyEffect } from "./effects.ts";
import { damageFactor } from "./attack.ts";
import { attackKind } from "./resistance.ts";

export type DefenseInfo = { kind: "block" | "parry"; part: PartId; charges: number; applies: boolean; overloaded: boolean; damageFactor: number };

export function defensePart(ctx: Ctx, actor: Id, kind: "block" | "parry"): PartId | null {
  const u = unit(ctx, actor);
  for (const part of partDefs(ctx, actor)) {
    const state = u.parts[part.id]!;
    if (state.broken) continue;
    if (kind === "block" && layerDefs(ctx, actor, part.id).some((layer, i) => layer.type === "shield" && !state.layers[i]!.broken && state.layers[i]!.hp > 0)) return part.id;
    if (kind === "parry") {
      const slots = Object.keys(state.components).sort().filter(slot => state.components[slot]);
      const hpSlots = slots.filter(slot => ctx.db.require("component", state.components[slot]!).hp !== undefined);
      for (const slot of slots) {
        const component = ctx.db.require("component", state.components[slot]!);
        if (!component.tags.includes("melee") && !component.abilities.some(id => ctx.db.require("ability", id).tags.includes("melee"))) continue;
        const index = hpSlots.indexOf(slot);
        if (index >= 0 && state.layers[state.layers.length - hpSlots.length + index]?.broken) continue;
        return part.id;
      }
    }
  }
  return null;
}

export function checkDefense(ctx: Ctx, actor: Id, ability: Id): Rejection | null {
  const def = ctx.db.require("ability", ability).defense;
  return def && !defensePart(ctx, actor, def.kind) ? { code: "require-failed", detail: `no-${def.kind}-part` } : null;
}

export function prepareDefense(ctx: Ctx, actor: Id, ability: Id): void {
  const def = ctx.db.require("ability", ability).defense;
  if (!def) return;
  const part = defensePart(ctx, actor, def.kind);
  if (!part) return;
  unit(ctx, actor).defense = { ability, kind: def.kind, part, charges: def.charges };
  emit(ctx, "DefensePrepared", { unit: actor, ability, kind: def.kind, part, charges: def.charges });
}

/** 純預覽與實際消耗共用，沒有額外招架骰。 */
export function inspectDefense(ctx: Ctx, actor: Id, abilityId: Id, target: Id, actualImpact?: number): DefenseInfo | null {
  const u = unit(ctx, target), prepared = u.defense;
  if (!prepared || prepared.charges <= 0 || !isActive(ctx, target) || u.parts[prepared.part]?.broken) return null;
  const def = ctx.db.get("ability", prepared.ability)?.defense;
  if (!def || defensePart(ctx, target, prepared.kind) !== prepared.part) return null;
  const ability = ctx.db.require("ability", abilityId);
  if (!ability.packets.length) return null;
  const pid = ability.actorRole ? seatsOf(ctx, actor).find(s => s.role === ability.actorRole)?.person : commanderOf(ctx, actor);
  const ev = evalCtxFor(ctx, { unit: actor, ...(pid ? { person: pid } : {}) }, { unit: target });
  const share = ability.partPattern?.kind === "spread" ? ability.partPattern.fractions[0]! : 1;
  const impact = actualImpact ?? ability.packets.reduce((sum, p) => sum + Math.max(0, evalNum(p.amount, ev)) * damageFactor(ctx, actor, abilityId, target), 0) * share;
  const radius = (id: Id) => ctx.db.require("bodyplan", frameView(ctx, id).bodyPlan).targetRadius ?? 1;
  const sizeRatio = radius(actor) / Math.max(Number.EPSILON, radius(target));
  const canParry = prepared.kind !== "parry" || attackKind(ctx, actor, abilityId) === "melee" && distance(unit(ctx, actor).pos, u.pos) <= 1 && ability.packets.every(p => ["kinetic", "pierce"].includes(p.type));
  const overloaded = impact > def.maxImpact || sizeRatio > def.maxSizeRatio;
  return { kind: prepared.kind, part: prepared.part, charges: prepared.charges, applies: canParry && !overloaded, overloaded,
    damageFactor: prepared.kind === "parry" ? def.damageFactor ?? 0.5 : 1 };
}

export function interceptDefense(ctx: Ctx, actor: Id, ability: Id, target: Id, actualImpact?: number): DefenseInfo | null {
  const info = inspectDefense(ctx, actor, ability, target, actualImpact);
  if (!info) return null;
  const u = unit(ctx, target), prepared = u.defense!;
  if (info.overloaded) {
    delete u.defense;
    const def = ctx.db.require("ability", prepared.ability).defense!;
    for (const effect of def.onOverload ?? []) applyEffect(ctx, effect, { unit: target }, actor);
    emit(ctx, "DefenseOverloaded", { unit: target, actor, kind: info.kind, part: info.part });
  } else if (info.applies) {
    prepared.charges--;
    if (prepared.charges <= 0) delete u.defense;
    emit(ctx, info.kind === "block" ? "AttackBlocked" : "AttackParried", { unit: target, actor, part: info.part, charges: Math.max(0, prepared.charges) });
  }
  return info;
}
