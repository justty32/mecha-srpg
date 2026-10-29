import type { UiSnapshot, UnitView } from "../vm/types.ts";

export function unitFixture(): UnitView {
  return {
    id: "test:unit", name: "蒼鷹一號", frameName: "斥候機", owner: "player", side: "self",
    pos: { x: 12, y: 18 }, controlMode: "pilot", status: "active", stale: false, seenRound: null,
    persons: [{ id: "test:pilot", name: "林霧", seat: "pilot", role: "主駕", morale: "穩定" }],
    parts: [{ id: "body", name: "軀幹", broken: false, layers: [
      { type: "armor", hp: 30, max: 60, broken: false, structural: false },
      { type: "core", hp: null, max: 40, broken: false, structural: true },
    ] }],
    pools: [{ id: "energy", name: "能源", cur: 8, max: 10 }],
    effects: [{ id: "test:guard", name: "防禦", stacks: 2, remaining: 1 }],
  };
}

/** 手造大地圖快照；只提供可視區，DOM 不應展開整張 160×160 地圖。 */
export function snapshotFixture(x = 12, y = 18, w = 30, h = 20): UiSnapshot {
  const selected = unitFixture();
  selected.pos = { x, y };
  return {
    title: "地月前線", round: 2, maxRounds: 30, activeUnit: selected.id, playerTurn: true,
    outcome: null, map: { width: 160, height: 160 }, viewport: { x, y, w, h },
    cells: Array.from({ length: w * h }, (_, i) => ({
      x: x + i % w, y: y + Math.floor(i / w),
      terrain: { id: "test:plain", name: "平原", glyph: "·", color: "#334455" },
      ...(i === 0 ? { unit: {
        id: selected.id, label: "蒼鷹", name: selected.name, owner: selected.owner,
        side: selected.side, active: true, hpRatio: 0.5, status: "active" as const,
      }, selected: true, cursor: true } : {}),
    })),
    dirty: "all", cursor: { x, y }, mode: { kind: "idle" }, selected,
    inspect: { x, y, terrainName: "平原", terrainNote: "開闊地帶", unit: selected },
    commands: [
      { id: "move", label: "移動", group: "move", key: "M", tooltip: "選擇目的地\n快捷鍵：M", enabled: true, active: true, action: { type: "beginMove" } },
      { id: "ability:test:beam", label: "光束", group: "ability", key: "1", tooltip: "消耗能源 12\n快捷鍵：1", reason: "能源不足", enabled: false, action: { type: "beginAbility", ability: "test:beam" } },
      { id: "end", label: "結束回合", group: "turn", key: "E", tooltip: "結束行動\n快捷鍵：E", enabled: true, action: { type: "endTurn" } },
    ],
    log: [
      { seq: 1, round: 1, kind: "turn", text: "第一輪開始" },
      { seq: 2, round: 2, kind: "damage", text: "蒼鷹受到傷害" },
    ],
    message: null, keyHints: [{ action: "endTurn", label: "結束回合", keys: ["e"] }], showHelp: false,
    quickMenu: null, confirm: null, busy: null, fx: { epoch: 0, items: [] },
  };
}
