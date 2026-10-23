import type { Id } from "../core/ids.ts";
import type { DamageType, LayerDef, LayerType, PartId } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { distance, emit, evalCtxFor, layerDefs, partDefs, person, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { applyEffect } from "./effects.ts";
import { dispatchHook, registerVerb, signal } from "./hooks.ts";
import { recomputePool } from "./pools.ts";
import { conduct } from "./conduct.ts";

export type LayerSlot = { def: LayerDef; hp: number; broken: boolean };
export type PacketIn = { type: DamageType; amount: number; armorPen?: number; resistPen?: number; layerFilter?: LayerType[] };
export type LayerStep = { index: number; amount: number; broke: boolean };

export function runLayers(layers: readonly LayerSlot[], p: PacketIn): { layers: LayerSlot[]; steps: LayerStep[]; remaining: number } {
  const result = layers.map(l => ({ ...l })), steps: LayerStep[] = [];
  let remaining = Math.max(0, p.amount);
  for (const [index, layer] of result.entries()) {
    if (remaining <= 0) break;
    const d = layer.def;
    if (layer.broken || (p.layerFilter && !p.layerFilter.includes(d.type))) continue;
    let pass = remaining * (d.passThrough[p.type] ?? 0), hit = remaining - pass;
    const bypass = hit * Math.max(0, Math.min(1, p.armorPen ?? 0));
    pass += bypass; hit -= bypass;
    hit *= 1 - Math.min(1, Math.max(0, (d.resist[p.type] ?? 0) - (p.resistPen ?? 0)));
    let amount: number;
    if (d.ablative) {
      amount = Math.min(hit, layer.hp);
      layer.hp -= amount;
      remaining = pass + hit - amount;
      layer.broken = layer.hp <= 0;
    } else {
      const reduced = Math.max(0, hit - (d.reduce?.flat ?? 0)) * (1 - (d.reduce?.pct ?? 0));
      amount = hit - reduced;
      remaining = pass + reduced;
    }
    steps.push({ index, amount, broke: layer.broken });
  }
  return { layers: result, steps, remaining };
}

export function applyPacket(ctx: Ctx, unitId: Id, partId: PartId, p: PacketIn, attacker: Id | null): LayerStep[] {
  const u = unit(ctx, unitId), part = u.parts[partId]!, defs = layerDefs(ctx, unitId, partId);
  const def = partDefs(ctx, unitId).find(d => d.id === partId)!;
  const steps: LayerStep[] = [];
  let remaining = p.amount;
  // SPEC-GAP：公開 PacketIn 未含 conductBonus；攻擊端以結構擴充攜帶，不改契約簽名。
  const bonus = (p as PacketIn & { conductBonus?: number }).conductBonus ?? 0;
  for (let index = 0; index < defs.length && remaining > 0; index++) {
    const d = defs[index]!, layer = part.layers[index]!;
    const result = runLayers([{ def: d, ...layer }], { ...p, amount: remaining });
    remaining = result.remaining;
    if (!result.steps.length) continue;
    const step = { ...result.steps[0]!, index };
    Object.assign(layer, { hp: result.layers[0]!.hp, broken: result.layers[0]!.broken });
    steps.push(step);
    const target = { unit: unitId, part: partId, layer: index };
    const payload = { unit: unitId, part: partId, layer: index, layerType: d.type };
    const info = { damageType: p.type, amount: step.amount, conductBonus: bonus };
    emit(ctx, "LayerDamaged", { ...payload, damageType: p.type, amount: step.amount, hp: layer.hp });
    if (step.broke) {
      emit(ctx, "LayerBroken", payload);
      for (const ref of def.onLayerBroken[d.type] ?? []) applyEffect(ctx, ref, target, attacker ?? unitId);
      dispatchHook(ctx, "onLayerBroken", { unit: unitId });
      signal(ctx, "layerBroken", payload);
      conduct(ctx, unitId, partId, "layerBroken", d.type, info);
      if (d.type === "component") {
        const slots = Object.keys(part.components).sort().filter(slot => {
          const id = part.components[slot];
          return id && ctx.db.require("component", id).hp !== undefined;
        });
        const slot = slots[index - (defs.length - slots.length)];
        if (slot) for (const ref of ctx.db.require("component", part.components[slot]!).onBroken ?? []) {
          applyEffect(ctx, ref, target, attacker ?? unitId);
        }
      }
      for (const pool of Object.keys(u.pools).sort()) recomputePool(ctx, { unit: unitId }, pool);
    }
    for (const ref of d.onHit ?? []) applyEffect(ctx, ref, target, attacker ?? unitId);
    conduct(ctx, unitId, partId, "layerHit", d.type, info);
  }
  const structural = defs.map((d, i) => d.structural ? i : -1).filter(i => i >= 0);
  // SPEC-GAP：沒有 structural 層的部位不因空集合而自動毀損。
  if (!part.broken && structural.length > 0 && structural.every(i => part.layers[i]!.broken)) {
    part.broken = true;
    emit(ctx, "PartBroken", { unit: unitId, part: partId });
    for (const ref of def.onBroken) applyEffect(ctx, ref, { unit: unitId, part: partId }, attacker ?? unitId);
    dispatchHook(ctx, "onPartBroken", { unit: unitId });
    signal(ctx, "partBroken", { unit: unitId, part: partId, attacker });
    conduct(ctx, unitId, partId, "partBroken", null, { damageType: p.type, amount: p.amount, conductBonus: bonus });
    for (const pool of Object.keys(u.pools).sort()) recomputePool(ctx, { unit: unitId }, pool);
  }
  // remaining 只供純演算法預覽；實際溢出不傳到其他部位。
  return steps;
}

export function isDead(ctx: Ctx, unitId: Id): boolean {
  const cores = partDefs(ctx, unitId).filter(p => p.functions.includes("core"));
  return cores.length > 0 && cores.every(p => unit(ctx, unitId).parts[p.id]!.broken);
}

registerVerb("damage", (ctx, action, hc) => {
  if (action.do !== "damage") return;
  const self = hc.self.unit ?? (hc.self.person ? person(ctx, hc.self.person).seat?.mech : undefined);
  const ids = action.target === "source" ? (ctx.s.units[hc.source] ? [hc.source] : [])
    : action.target === "adjacent" && self ? Object.keys(ctx.s.units).sort().filter(id => id !== self && distance(unit(ctx, self).pos, unit(ctx, id).pos) === 1)
    : action.target === "self" && self ? [self] : [];
  // SPEC-GAP：人物沒有層；damage target=seats 以 conducted 信號交人物線處理。
  if (action.target === "seats" && self) {
    for (const seat of Object.keys(unit(ctx, self).seats).sort()) {
      const pid = unit(ctx, self).seats[seat];
      if (pid) for (const packet of action.packets) signal(ctx, "conducted", { unit: self, part: hc.self.part ?? "", person: pid,
        when: "layerHit", layerType: null, damageType: packet.type, amount: evalNum(packet.amount, evalCtxFor(ctx, hc.self)) });
    }
  }
  for (const id of ids) {
    const part = hc.self.part && id === self ? hc.self.part : partDefs(ctx, id).find(p => !unit(ctx, id).parts[p.id]!.broken)?.id;
    if (!part) continue;
    const ev = evalCtxFor(ctx, hc.self, { unit: id });
    for (const packet of action.packets) applyPacket(ctx, id, part, { type: packet.type, amount: evalNum(packet.amount, ev),
      armorPen: evalNum(packet.armorPen ?? 0, ev), resistPen: evalNum(packet.resistPen ?? 0, ev), layerFilter: packet.layerFilter }, ctx.s.units[hc.source] ? hc.source : null);
  }
});
