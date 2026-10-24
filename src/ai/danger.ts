import { cellKey } from "../core/ids.ts";
import type { Id } from "../core/ids.ts";
import type { Cell, FactionSlot } from "../core/types-def.ts";
import type { BattleState, FactionKnowledge } from "../core/types-state.ts";
import type { RulesQuery } from "./rules-query.ts";
import type { DangerMap } from "./policy.ts";
import { isHostileSlot } from "./hostility.ts";

// 契約查詢簽名沒有 ctx.params，這些係數依 §3 固定。
const DEFAULTS = { zoc: 0.5, lastSeenRadius: 2, lastSeenDanger: 1 };

export function threatOf(q: RulesQuery, s: BattleState, unitId: Id): number {
  let total = 0;
  for (const id of [...q.abilitiesOf(s, unitId)].sort()) {
    const tactics = q.abilityDef(id).ai.tactics;
    for (const key of ["attack", "attackArea", "disable"]) total += q.evalNum(s, tactics[key] ?? 0, unitId);
  }
  return Math.max(0, total);
}

export function dangerMap(q: RulesQuery, view: BattleState, slot: FactionSlot, know: FactionKnowledge): DangerMap {
  const d: DangerMap = {};
  function addAround(center: Cell, radius: number, value: (distance: number) => number): void {
    for (let y = Math.max(0, Math.ceil(center.y - radius)); y <= Math.min(view.map.height - 1, Math.floor(center.y + radius)); y++) {
      for (let x = Math.max(0, Math.ceil(center.x - radius)); x <= Math.min(view.map.width - 1, Math.floor(center.x + radius)); x++) {
        const c = { x, y }, distance = q.distance(center, c);
        if (!q.inBounds(view, c) || distance > radius) continue;
        const key = cellKey(x, y);
        d[key] = (d[key] ?? 0) + value(distance);
      }
    }
  }
  for (const id of Object.keys(view.units).sort()) {
    const unit = view.units[id]!;
    if (!isHostileSlot(q, view, slot, unit.owner) || !q.isActive(view, id)) continue;
    const attacks = [...q.abilitiesOf(view, id)].sort().filter(ability => {
      const t = q.abilityDef(ability).ai.tactics;
      return q.evalNum(view, t.attack ?? 0, id) > 0 || q.evalNum(view, t.attackArea ?? 0, id) > 0;
    });
    if (attacks.length === 0) continue;
    const range = Math.max(...attacks.map(a => q.abilityRange(view, id, a).max));
    let reach = 0;
    for (const key of Object.keys(q.reachable(view, id)).sort()) {
      const [x, y] = key.split(",").map(Number);
      reach = Math.max(reach, q.distance(unit.pos, { x: x!, y: y! }));
    }
    const threat = threatOf(q, view, id);
    addAround(unit.pos, reach + range, () => threat);
    addAround(unit.pos, 1, distance => distance === 1 ? threat * DEFAULTS.zoc : 0);
  }
  for (const id of Object.keys(know.lastSeen).sort()) {
    // SPEC-GAP：不可見者的能力未知，只在最後位置附近加入固定危險。
    if (!view.units[id]) addAround(know.lastSeen[id]!.cell, DEFAULTS.lastSeenRadius, () => DEFAULTS.lastSeenDanger);
  }
  return d;
}

export function dangerAt(d: DangerMap, cell: Cell): number {
  return d[cellKey(cell.x, cell.y)] ?? 0;
}
