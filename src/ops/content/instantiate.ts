import type { ContentDB } from "../../content/contentdb.ts";
import type { PoolDecl } from "../../core/types-def.ts";
import type { MechState, PersonState, PoolState } from "../../core/types-state.ts";
import { evalNum, objectRefs } from "../../core/numexpr.ts";

// SPEC-GAP：戰鬥工廠不屬允許依賴，營運僅建立未裝部件、未入座的核心實體。
// 無上限池不能在存檔放 Infinity；以 MAX_SAFE_INTEGER 作有限表示，不更改 core 型別。
export function instantiatePools(declarations: readonly PoolDecl[], attrs: Record<string, number>, tags: readonly string[] = []): Record<string, PoolState> {
  const pools: Record<string, PoolState> = {};
  const grouped = new Map<string, PoolDecl[]>();
  for (const d of declarations) grouped.set(d.id, [...(grouped.get(d.id) ?? []), d]);
  const ctx = { ref: objectRefs({ self: { attrs, pools } }), hasTag: (tag: string) => tags.includes(tag) };
  for (const id of [...grouped.keys()].sort()) pools[id] = { cur: 0, max: 0, regen: 0, band: -1 };
  for (const id of [...grouped.keys()].sort()) {
    const ds = grouped.get(id)!, d = ds[0]!, pool = pools[id]!;
    pool.max = ds.some(v => v.max === null) ? Number.MAX_SAFE_INTEGER : ds.reduce((sum, v) => sum + evalNum(v.max!, ctx), 0);
    pool.regen = ds.reduce((sum, v) => sum + evalNum(v.regen, ctx), 0);
    pool.cur = Math.max(d.min, evalNum(d.initial, ctx));
    if (d.capKind === "hard") pool.cur = Math.min(pool.cur, pool.max);
    if (![pool.cur, pool.max, pool.regen].every(Number.isFinite)) throw new Error(`池溢位：${id}`);
  }
  return pools;
}
export function instantiatePerson(db: ContentDB, id: string, def: string): PersonState {
  const d = db.require("person", def);
  return { id, def: d.id, attrsBase: { ...d.attrs }, pools: instantiatePools(d.pools, d.attrs, d.tags), contribs: [], effects: [], morale: "steady",
    will: { burden: 0, resonance: {}, ...(d.kind === "soul" ? { soulTree: { nodes: [], research: 0, companionship: 0 } } : {}) }, xp: 0, level: 1 };
}
export function instantiateMech(db: ContentDB, id: string, frameId: string): MechState {
  const frame = db.require("frame", frameId), body = db.require("bodyplan", frame.bodyPlan);
  const mech: MechState = { id, frame: frame.id, owner: "player", pos: { x: 0, y: 0 }, parts: {}, pools: instantiatePools(frame.pools, frame.baseAttrs, frame.tags),
    contribs: [], effects: [], seats: {}, controlMode: "none", cooldowns: {}, sustained: [] };
  for (const part of [...body.parts].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) {
    mech.parts[part.id] = { layers: part.layers.map(layer => ({ hp: layer.hp, broken: false })), broken: false,
      components: Object.fromEntries([...part.slots].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map(slot => [slot.id, null])) };
    for (const seat of part.seats ?? []) mech.seats[seat.id] = null;
  }
  return mech;
}
