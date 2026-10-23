import type { Id } from "../core/ids.ts";
import type { FactionSlot, PartId } from "../core/types-def.ts";
import type { BattleState, FactionKnowledge, LayerKnowledge } from "../core/types-state.ts";
import type { GameEvent } from "../core/events.ts";
import type { RulesQuery } from "./rules-query.ts";

const DEFAULTS = { ttl: 3 };

export function emptyKnowledge(): FactionKnowledge {
  return { visible: [], lastSeen: {}, revealed: {} };
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

export function maskedState(q: RulesQuery, s: BattleState, slot: FactionSlot, k: FactionKnowledge): BattleState {
  const view = structuredClone(s);
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
