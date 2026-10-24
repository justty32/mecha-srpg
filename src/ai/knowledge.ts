import type { Id } from "../core/ids.ts";
import type { FactionSlot, PartId } from "../core/types-def.ts";
import type { BattleState, FactionKnowledge, LayerKnowledge } from "../core/types-state.ts";
import type { GameEvent } from "../core/events.ts";
import { cloneBattleState } from "../core/clone-state.ts";
import type { RulesQuery } from "./rules-query.ts";
import type { AiCtx } from "./policy.ts";
import { isHostileSlot } from "./hostility.ts";

const DEFAULTS = { ttl: 3 };

export function emptyKnowledge(): FactionKnowledge {
  return { visible: [], lastSeen: {}, revealed: {} };
}

// 追敵候選與評分共用：可見敵人優先，其次最後所見，完全無情報才探索中央。
export function pursuitCells(ctx: AiCtx, actor: Id, hostileOnly = true) {
  const { q, view, know } = ctx;
  const visible = Object.keys(view.units).sort().filter(id => id !== actor && q.isActive(view, id)
    && (!hostileOnly || q.hostile(view, actor, id))).map(id => view.units[id]!.pos);
  if (visible.length) return visible;
  const remembered = Object.keys(know.lastSeen).sort().filter(id => {
    // 陣營是公開資料；位置只取情報快照，絕不回讀 s.units[id].pos。
    const owner = ctx.s.units[id]?.owner;
    return !know.visible.includes(id) && (!hostileOnly || (owner !== undefined && isHostileSlot(q, view, ctx.slot, owner)));
  }).map(id => know.lastSeen[id]!.cell);
  return remembered.length ? remembered : [{ x: Math.floor(view.map.width / 2), y: Math.floor(view.map.height / 2) }];
}

export function ownUnits(q: RulesQuery, s: BattleState, slot: FactionSlot): Id[] {
  return Object.keys(s.units).sort().filter(id => s.units[id]!.owner === slot && q.isActive(s, id));
}

export function updateKnowledge(q: RulesQuery, s: BattleState, slot: FactionSlot, prev: FactionKnowledge, ttl: number = DEFAULTS.ttl): FactionKnowledge {
  const own = ownUnits(q, s, slot);
  const visible = Object.keys(s.units).sort().filter(id => s.units[id]!.owner !== slot && q.isActive(s, id) &&
    own.some(observer => q.distance(s.units[observer]!.pos, s.units[id]!.pos) <= q.perception(s, observer)));
  const next = emptyKnowledge();
  next.visible = visible;
  for (const id of [...new Set([...Object.keys(prev.lastSeen), ...visible])].sort()) {
    if (visible.includes(id)) next.lastSeen[id] = { cell: { ...s.units[id]!.pos }, round: s.round };
    else if (s.round - prev.lastSeen[id]!.round <= ttl) next.lastSeen[id] = structuredClone(prev.lastSeen[id]!);
  }
  for (const id of Object.keys(prev.revealed).sort()) {
    if (s.units[id] && q.isActive(s, id)) next.revealed[id] = structuredClone(prev.revealed[id]!);
  }
  return next;
}

export function publicLayers(q: RulesQuery, s: BattleState, unitId: Id): Record<PartId, LayerKnowledge[]> {
  return Object.fromEntries(q.partDefs(s, unitId).map(p => [p.id, q.layerDefs(s, unitId, p.id).map((l, i) => ({
    type: l.type, max: l.hp, hp: i === 0 ? s.units[unitId]!.parts[p.id]!.layers[i]!.hp : null,
  }))]));
}

export function reveal(q: RulesQuery, s: BattleState, k: FactionKnowledge, unitId: Id): FactionKnowledge {
  const next = structuredClone(k);
  if (!s.units[unitId]) return next;
  next.revealed[unitId] = Object.fromEntries(q.partDefs(s, unitId).map(p => [p.id,
    q.layerDefs(s, unitId, p.id).map((l, i) => ({ type: l.type, max: l.hp, hp: s.units[unitId]!.parts[p.id]!.layers[i]!.hp })),
  ]));
  return next;
}

export function observe(q: RulesQuery, s: BattleState, k: FactionKnowledge, slot: FactionSlot, events: readonly GameEvent[]): FactionKnowledge {
  let next = structuredClone(k);
  for (const event of events) {
    const { unit, ability, target } = event.payload;
    if (event.type === "AbilityUsed" && typeof unit === "string" && s.units[unit]?.owner === slot &&
      typeof ability === "string" && typeof target === "string" && q.abilityDef(ability).tags.includes("scan")) {
      next = reveal(q, s, next, target);
    }
  }
  return next;
}

export function knownLayers(q: RulesQuery, s: BattleState, k: FactionKnowledge, unitId: Id, partId: PartId): LayerKnowledge[] {
  return structuredClone(k.revealed[unitId]?.[partId] ?? publicLayers(q, s, unitId)[partId] ?? []);
}

export function maskedState(q: RulesQuery, s: BattleState, slot: FactionSlot, k: FactionKnowledge, prediction = false): BattleState {
  const view = prediction && q.predictionState ? q.predictionState(s) : cloneBattleState(s);
  for (const id of Object.keys(view.units).sort()) {
    const unit = view.units[id]!;
    if (unit.owner === slot) continue;
    if (!k.visible.includes(id)) {
      delete view.units[id];
      if (view.rt) delete view.rt.unitStatus[id];
      continue;
    }
    for (const partId of Object.keys(unit.parts).sort()) {
      const known = knownLayers(q, s, k, id, partId);
      unit.parts[partId]!.layers = known.map(l => ({ hp: l.hp ?? l.max, broken: l.hp === null ? false : l.hp <= 0 }));
    }
  }
  view.order = view.order.filter(id => !!view.units[id]);
  return view;
}
