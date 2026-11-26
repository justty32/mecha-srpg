import type { Cell, FactionSlot } from "../core/types-def.ts";
import type { BattleState } from "../core/types-state.ts";

export function exitsFor(s: BattleState, slot: FactionSlot): Cell[] {
  const bySlot = s.rt?.exitsBySlot;
  const cells = bySlot && Object.hasOwn(bySlot, slot) ? bySlot[slot]! : s.rt?.exits ?? [];
  return cells.map(c => ({ ...c }));
}

export function retreatCellsFor(s: BattleState, slot: FactionSlot): Cell[] {
  if (s.rt?.noRetreat) return [];
  const cells = exitsFor(s, slot);
  // 明列空陣列刻意禁用出口；只有舊圖的空共用出口回退四邊。
  if (cells.length || (s.rt?.exitsBySlot && Object.hasOwn(s.rt.exitsBySlot, slot))) return cells;
  const { width, height } = s.map;
  for (let y = 0; y < height; y++) {
    if (y === 0 || y === height - 1) {
      for (let x = 0; x < width; x++) cells.push({ x, y });
    } else if (width > 0) {
      cells.push({ x: 0, y });
      if (width > 1) cells.push({ x: width - 1, y });
    }
  }
  return cells;
}
