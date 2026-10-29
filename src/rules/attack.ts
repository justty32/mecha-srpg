import type { Id } from "../core/ids.ts";
import type { Cell, DamagePacket, PartId } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { chance, nextFloat, pickWeighted } from "../core/rng.ts";
import { commanderOf, constant, distance, emit, evalCtxFor, hostile, isActive, partDefs, rt, seatsOf, terrainAt, unit, unitAt, unitTags } from "./state.ts";
import type { Ctx, Subject } from "./state.ts";
import { applyPartHits, partHitInfo } from "./part-hits.ts";
import { interceptDefense } from "./defense.ts";
import { aimInfo } from "./aim.ts";
export { partHitInfo } from "./part-hits.ts";
export type { PartHitInfo } from "./part-hits.ts";
export { aimInfo } from "./aim.ts";
export { inspectDefense } from "./defense.ts";
export type { DefenseInfo } from "./defense.ts";
import { applyEffect } from "./effects.ts";
import type { EffectTarget } from "./effects.ts";
import { dispatchHook, signal } from "./hooks.ts";
import { applyPacket, isDead } from "./layers.ts";
import { damageBonus, resistance } from "./resistance.ts";

import { damageTerrain, leaveRemains } from "./battlefield.ts";

function subject(ctx: Ctx, id: Id, abilityId?: Id): Subject {
  const role = abilityId ? ctx.db.require("ability", abilityId).actorRole : undefined;
  const pid = role ? seatsOf(ctx, id).find(s => s.role === role)?.person : commanderOf(ctx, id);
  return { unit: id, ...(pid ? { person: pid } : {}) };
}

export function hitChance(ctx: Ctx, actor: Id, abilityId: Id, target: Id, part?: PartId): number {
  return aimInfo(ctx, actor, abilityId, target, part).chance;
}

export function pickPart(ctx: Ctx, target: Id, aimed?: PartId): PartId {
  const defs = partDefs(ctx, target), u = unit(ctx, target);
  if (aimed !== undefined) {
    if (!u.parts[aimed] || u.parts[aimed]!.broken) throw new Error(`無法瞄準部位：${aimed}`);
    return aimed;
  }
  const live = defs.filter(p => !u.parts[p.id]!.broken);
  // SPEC-GAP：姿態／方向未有資料欄位，倍率採 1；總 exposure=0 時以宣告首部位兜底。
  if (!live.length) return defs.find(p => p.functions.includes("core"))?.id ?? defs[0]!.id;
  if (live.every(p => p.exposure <= 0)) return live[0]!.id;
  return pickWeighted(ctx.s.rng, live, p => Math.max(0, p.exposure)).id;
}

/** 修正鏈的確定性部分（不擲暴擊）：攻方近戰／遠程增傷 → 全局修正表 → 抵抗性。估算（sim session）與結算共用。 */
export function damageFactor(ctx: Ctx, actor: Id | null, abilityId: Id | null, target: Id): number {
  let factor = 1;
  if (actor && abilityId) factor *= damageBonus(ctx, actor, abilityId, subject(ctx, actor, abilityId).person);
  const sourceTags = [...(actor ? unitTags(ctx, actor) : []), ...(abilityId ? ctx.db.require("ability", abilityId).tags : [])];
  const targetTags = unitTags(ctx, target);
  for (const row of ctx.db.rules.damageModifiers) {
    if (sourceTags.includes(row.sourceTag) && targetTags.includes(row.targetTag)) factor *= row.factor;
  }
  return factor * (resistance(ctx, actor, abilityId, target)?.factor ?? 1);
}

export function modifiedAmount(ctx: Ctx, actor: Id | null, abilityId: Id | null, packet: DamagePacket, target: Id): number {
  const ev = evalCtxFor(ctx, actor ? subject(ctx, actor, abilityId ?? undefined) : { unit: target }, { unit: target });
  let amount = evalNum(packet.amount, ev) * damageFactor(ctx, actor, abilityId, target);
  if (packet.crit !== undefined && chance(ctx.s.rng, evalNum(packet.crit, ev))) amount *= constant(ctx, "critFactor");
  return Math.max(0, amount);
}

export function killUnit(ctx: Ctx, id: Id, killer: Id | null): void {
  if (!isActive(ctx, id)) return;
  rt(ctx.s).unitStatus[id] = "dead";
  leaveRemains(ctx, id);
  emit(ctx, "UnitDied", { unit: id, killer });
  signal(ctx, "unitDied", { unit: id, killer });
  signal(ctx, "unitRemoved", { unit: id, status: "dead" });
}

export function resolveAbility(ctx: Ctx, actor: Id, abilityId: Id, target: { unit?: Id; cell?: Cell; part?: PartId }): void {
  const ability = ctx.db.require("ability", abilityId), self = subject(ctx, actor, abilityId);
  const center = target.cell ?? (target.unit ? unit(ctx, target.unit).pos : unit(ctx, actor).pos);
  const ev = evalCtxFor(ctx, self, target.unit ? { unit: target.unit } : undefined);
  let targets: Id[];
  if (ability.target.kind === "self") targets = [actor];
  else if (["ball", "line", "cone"].includes(ability.target.kind)) {
    const radius = evalNum(ability.target.radius ?? 0, ev), from = unit(ctx, actor).pos;
    // SPEC-GAP：line 用格中心共線；cone 用朝目標的八向扇區，radius 為端點寬度。
    targets = Object.keys(ctx.s.units).sort().filter(id => {
      if (!isActive(ctx, id)) return false;
      const pos = unit(ctx, id).pos;
      if (ability.target.kind === "ball") return distance(pos, center) <= radius;
      const dx = center.x - from.x, dy = center.y - from.y, px = pos.x - from.x, py = pos.y - from.y;
      const dot = px * dx + py * dy, len = dx * dx + dy * dy;
      return dot > 0 && dot <= len && Math.abs(px * dy - py * dx) <= radius * Math.max(1, distance(from, center));
    });
  } else if (["unit", "part"].includes(ability.target.kind) && target.cell && !target.unit) targets = [];
  else targets = target.unit ? [target.unit] : unitAt(ctx, center) ? [unitAt(ctx, center)!] : [];
  targets = targets.filter(id => ability.target.friendly === "yes" || (ability.target.friendly === "no" ? hostile(ctx, actor, id) : !hostile(ctx, actor, id)));
  const apply = (on: "hit" | "miss" | "always" | "self" | "cell", location: EffectTarget) => {
    for (const group of ability.effects.filter(e => e.on === on)) for (const ref of group.apply) {
      applyEffect(ctx, ref, location, actor);
    }
  };
  for (const id of targets) {
    if (!isActive(ctx, id)) continue;
    const probability = hitChance(ctx, actor, abilityId, id, target.part), roll = ability.target.kind === "self" || ability.target.friendly === "only" ? null : nextFloat(ctx.s.rng) * 100;
    const hit = roll === null || roll < probability;
    let part = hit ? pickPart(ctx, id, target.part) : null;
    const originalPart = part;
    const plan = hit ? partHitInfo(ctx, id, part!, ability.partPattern) : undefined;
    const hitEvent = emit(ctx, hit ? "Hit" : "Miss", { unit: actor, target: id, ability: ability.id, chance: probability, roll, part, originalPart });
    if (hit) {
      dispatchHook(ctx, "onHit", { unit: actor });
      if (self.person) dispatchHook(ctx, "onHit", { person: self.person });
      dispatchHook(ctx, "onBeingHit", { unit: id });
      for (const seat of seatsOf(ctx, id)) dispatchHook(ctx, "onBeingHit", { person: seat.person });
      const reach = resistance(ctx, actor, abilityId, id)?.reach;
      const packets = ability.packets.map(packet => {
        const packetEv = evalCtxFor(ctx, self, { unit: id });
        const input = { type: packet.type, amount: modifiedAmount(ctx, actor, abilityId, packet, id),
          armorPen: evalNum(packet.armorPen ?? 0, packetEv), resistPen: evalNum(packet.resistPen ?? 0, packetEv),
          layerFilter: packet.layerFilter, conductBonus: evalNum(packet.conductBonus ?? 0, packetEv), ...(reach ? { reach } : {}) };
        return input;
      });
      const share = ability.partPattern?.kind === "spread" ? ability.partPattern.fractions[0]! : 1;
      const defense = interceptDefense(ctx, actor, abilityId, id, packets.reduce((sum, packet) => sum + packet.amount, 0) * share);
      if (defense?.applies) part = defense.part;
      hitEvent.payload.part = part;
      for (const packet of packets) applyPartHits(ctx, actor, id, originalPart!, packet, ability.partPattern, defense, plan);
    }
    const defender = subject(ctx, id);
    const location = { ...defender, part: part ?? undefined, cell: unit(ctx, id).pos, faction: unit(ctx, id).owner };
    apply(hit ? "hit" : "miss", location);
    apply("always", location);
    if (isActive(ctx, id) && isDead(ctx, id)) {
      killUnit(ctx, id, actor);
    }
    signal(ctx, "abilityResolved", { actor, ability: ability.id, target: id, hit });
  }
  if (["cell", "ball", "line", "cone"].includes(ability.target.kind) || (["unit", "part"].includes(ability.target.kind) && target.cell && !target.unit)) {
    const from = unit(ctx, actor).pos, radius = evalNum(ability.target.radius ?? 0, ev);
    const amount = ability.packets.reduce((sum, packet) => sum + Math.max(0, evalNum(packet.amount, ev)), 0);
    // 格子與單位共用同一幾何；row-major 每格最多傷一次，不擲額外 RNG。
    for (let y = 0; y < ctx.s.map.height; y++) for (let x = 0; x < ctx.s.map.width; x++) {
      const pos = { x, y };
      let affected = distance(pos, center) === 0;
      if (ability.target.kind === "ball") affected = distance(pos, center) <= radius;
      else if (["line", "cone"].includes(ability.target.kind)) {
        const dx = center.x - from.x, dy = center.y - from.y, px = x - from.x, py = y - from.y;
        const dot = px * dx + py * dy, len = dx * dx + dy * dy;
        affected = dot > 0 && dot <= len && Math.abs(px * dy - py * dx) <= radius * Math.max(1, distance(from, center));
      }
      if (affected) damageTerrain(ctx, pos, amount, actor);
    }
  }
  apply("self", { ...self, cell: unit(ctx, actor).pos, faction: unit(ctx, actor).owner });
  apply("cell", { cell: center });
  if (!targets.length) signal(ctx, "abilityResolved", { actor, ability: ability.id, target: null, hit: false });
}
