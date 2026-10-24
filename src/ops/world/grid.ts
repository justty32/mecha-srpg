import { parseId } from "../../core/ids.ts";
import type { Id } from "../../core/ids.ts";
import type { Cell } from "../../core/types-def.ts";
import type { RngState } from "../../core/types-state.ts";
import { nextInt } from "../../core/rng.ts";
import type { MapDef, PlaceDef, WTerrainDef } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";

export type GridMap = { id: Id; width: number; height: number; base: Uint8Array; terrains: WTerrainDef[];
  region: Uint16Array; regionKeys: string[]; road: Set<number>; dark: Uint8Array; land: number };
export type Mover = { layer: "air" | "ground"; mp: number };
export type CostFn = (cell: Cell, terrainCost: number) => number | undefined;

export function cellKey(c: Cell): string { return `${c.x},${c.y}`; }
export function parseCellKey(k: string): Cell {
  if (!/^-?\d+,-?\d+$/.test(k)) throw new Error(`invalid cell key: ${k}`);
  const [x, y] = k.split(",").map(Number);
  return { x: x!, y: y! };
}
export function idx(map: GridMap, c: Cell): number { return c.y * map.width + c.x; }
export function inBounds(map: GridMap, c: Cell): boolean {
  return Number.isInteger(c.x) && Number.isInteger(c.y) && c.x >= 0 && c.y >= 0 && c.x < map.width && c.y < map.height;
}
export function decodeRow(row: string, width: number): string[] {
  if (!Number.isSafeInteger(width) || width < 0) throw new Error("invalid row width");
  const chars = Array.from(row), result: string[] = [];
  for (let i = 0; i < chars.length;) {
    const glyph = chars[i++]!;
    if (/\d/.test(glyph)) throw new Error("RLE glyph cannot be a digit");
    let digits = "";
    while (i < chars.length && /\d/.test(chars[i]!)) digits += chars[i++];
    const count = digits ? Number(digits) : 1;
    if (!Number.isSafeInteger(count) || count < 1 || result.length + count > width) throw new Error(`decoded row length exceeds width ${width} or invalid run`);
    for (let n = 0; n < count; n++) result.push(glyph);
  }
  if (result.length !== width) throw new Error(`decoded row length ${result.length} != width ${width}`);
  return result;
}

export function buildGridMap(def: MapDef, terrains: WTerrainDef[]): GridMap {
  if (!Number.isSafeInteger(def.width) || !Number.isSafeInteger(def.height) || def.width < 1 || def.height < 1) throw new Error("invalid map dimensions");
  if (def.base.rows.length !== def.height) throw new Error("base row count != height");
  if (def.region && def.region.rows.length !== def.height) throw new Error("region row count != height");
  // 只收圖例用到的地形；外部完整資料庫不受 Uint8 索引上限影響。
  const used: WTerrainDef[] = [], legend = new Map<string, number>();
  for (const [glyph, id] of Object.entries(def.legend)) {
    const terrain = terrains.find(t => t.id === id) ?? (!parseId(id)?.pack ? terrains.find(t => parseId(t.id)?.name === parseId(id)?.name) : undefined);
    if (!terrain) throw new Error(`missing wterrain ${id}`);
    let index = used.indexOf(terrain);
    if (index < 0) { index = used.length; used.push(terrain); }
    if (index > 255) throw new Error("too many map terrains");
    legend.set(glyph, index);
  }
  const regionKeys = ["", ...new Set(Object.values(def.region?.legend ?? {}).filter(Boolean))];
  if (regionKeys.length > 65536) throw new Error("too many regions");
  const regionIndex = new Map(regionKeys.map((key, i) => [key, i]));
  const length = def.width * def.height;
  const map: GridMap = { id: def.id, width: def.width, height: def.height, base: new Uint8Array(length), terrains: used,
    region: new Uint16Array(length), regionKeys, road: new Set(), dark: new Uint8Array(length), land: 0 };
  for (let y = 0; y < def.height; y++) {
    const row = decodeRow(def.base.rows[y]!, def.width);
    const regions = def.region && decodeRow(def.region.rows[y]!, def.width);
    for (let x = 0; x < def.width; x++) {
      const i = y * def.width + x, terrain = legend.get(row[x]!);
      if (terrain === undefined) throw new Error(`base unknown glyph ${row[x]}`);
      map.base[i] = terrain;
      if (parseId(used[terrain]!.id)?.name !== "tidesea") map.land++;
      if (regions && regions[x] !== " ") {
        const glyph = regions[x]!;
        if (!Object.hasOwn(def.region!.legend, glyph)) throw new Error(`region unknown glyph ${glyph}`);
        map.region[i] = regionIndex.get(def.region!.legend[glyph]!)!;
      }
    }
  }
  for (const [x, y] of def.road ?? []) if (inBounds(map, { x, y })) map.road.add(y * map.width + x);
  // 有矩形時以矩形定義暗區；沒有矩形才套用全圖 fog。
  if (!def.darkRects?.length && def.fog === "dark") map.dark.fill(1);
  for (const rect of def.darkRects ?? []) for (let y = Math.max(0, rect.y); y < Math.min(map.height, rect.y + rect.h); y++) {
    for (let x = Math.max(0, rect.x); x < Math.min(map.width, rect.x + rect.w); x++) map.dark[y * map.width + x] = 1;
  }
  return map;
}
const gridCache = new WeakMap<WorldDB, Map<Id, GridMap>>();
export function gridOf(world: WorldDB, mapId: Id): GridMap {
  let maps = gridCache.get(world);
  if (!maps) { maps = new Map(); gridCache.set(world, maps); }
  const def = world.require("map", mapId);
  let map = maps.get(def.id);
  if (!map) { map = buildGridMap(def, world.all("wterrain")); maps.set(def.id, map); }
  return map;
}
export function terrainAt(map: GridMap, c: Cell): WTerrainDef {
  if (!inBounds(map, c)) throw new RangeError(`cell outside map: ${cellKey(c)}`);
  return map.terrains[map.base[idx(map, c)]!]!;
}
export function neighbors(map: GridMap, c: Cell): Cell[] {
  const result: Cell[] = [];
  for (let y = c.y - 1; y <= c.y + 1; y++) for (let x = c.x - 1; x <= c.x + 1; x++) {
    if ((x !== c.x || y !== c.y) && inBounds(map, { x, y })) result.push({ x, y });
  }
  return result;
}
export function chebyshev(a: Cell, b: Cell): number { return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); }
export function octile(a: Cell, b: Cell): number {
  const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
  return 10 * Math.max(dx, dy) + 4 * Math.min(dx, dy);
}
function entryCost(map: GridMap, mover: Mover, c: Cell, cost?: CostFn): number | undefined {
  const terrain = terrainAt(map, c), base = mover.layer === "air" ? terrain.airCost : terrain.groundCost;
  if (base === null) return undefined;
  const terrainCost = mover.layer === "ground" && map.road.has(idx(map, c)) ? base / 2 : base;
  const result = cost ? cost(c, terrainCost) : terrainCost;
  if (result !== undefined && (!Number.isFinite(result) || result < 0)) throw new RangeError("entry cost must be finite and nonnegative");
  return result;
}
export function stepCost(map: GridMap, mover: Mover, from: Cell, to: Cell, cost?: CostFn): number | undefined {
  if (!inBounds(map, from) || !inBounds(map, to) || chebyshev(from, to) !== 1) return undefined;
  const base = entryCost(map, mover, to, cost);
  return base === undefined ? undefined : from.x !== to.x && from.y !== to.y ? Math.round(base * 1.4) : base;
}

type Entry = { i: number; g: number; f: number };
// i = y*width+x，因此 f 相同時用 i 排就是 (y,x) 字典序。
function before(a: Entry, b: Entry): boolean { return a.f < b.f || a.f === b.f && a.i < b.i; }
class MinHeap {
  items: Entry[] = [];
  push(item: Entry): void {
    let i = this.items.length;
    this.items.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!before(item, this.items[parent]!)) break;
      this.items[i] = this.items[parent]!; i = parent;
    }
    this.items[i] = item;
  }
  pop(): Entry {
    const result = this.items[0]!, last = this.items.pop()!;
    if (this.items.length) {
      let i = 0;
      while (2 * i + 1 < this.items.length) {
        let child = 2 * i + 1;
        if (child + 1 < this.items.length && before(this.items[child + 1]!, this.items[child]!)) child++;
        if (!before(this.items[child]!, last)) break;
        this.items[i] = this.items[child]!; i = child;
      }
      this.items[i] = last;
    }
    return result;
  }
}
export function findPath(map: GridMap, from: Cell, to: Cell, mover: Mover, cost?: CostFn):
  { cells: Cell[]; cost: number; days: number } | undefined {
  if (!inBounds(map, from) || !inBounds(map, to)) return undefined;
  if (!(mover.mp > 0) || !Number.isFinite(mover.mp)) throw new RangeError("mp must be positive and finite");
  const length = map.base.length, costs = new Float64Array(length);
  let minimum = Infinity;
  for (let i = 0; i < length; i++) {
    const value = entryCost(map, mover, { x: i % map.width, y: Math.floor(i / map.width) }, cost);
    costs[i] = value ?? Infinity;
    // 斜走四捨五入可能小於 base×1.4；取較小下界，仍以 octile 保證 admissible。
    if (value !== undefined) minimum = Math.min(minimum, value, Math.round(value * 1.4) / 1.4);
  }
  const start = idx(map, from), goal = idx(map, to);
  if (!Number.isFinite(costs[start]) || !Number.isFinite(costs[goal])) return undefined;
  if (start === goal) return { cells: [], cost: 0, days: 0 };
  const distance = new Float64Array(length).fill(Infinity), parent = new Int32Array(length).fill(-1);
  const open = new MinHeap(), scale = minimum / 10;
  distance[start] = 0; open.push({ i: start, g: 0, f: octile(from, to) * scale });
  while (open.items.length) {
    const current = open.pop();
    if (current.g !== distance[current.i]) continue;
    if (current.i === goal) {
      const cells: Cell[] = [];
      for (let i = goal; i !== start; i = parent[i]!) cells.push({ x: i % map.width, y: Math.floor(i / map.width) });
      return { cells: cells.reverse(), cost: current.g, days: Math.ceil(current.g / mover.mp) };
    }
    const cx = current.i % map.width, cy = Math.floor(current.i / map.width);
    for (let y = Math.max(0, cy - 1); y <= Math.min(map.height - 1, cy + 1); y++) {
      for (let x = Math.max(0, cx - 1); x <= Math.min(map.width - 1, cx + 1); x++) {
        if (x === cx && y === cy) continue;
        const i = y * map.width + x, base = costs[i]!;
        const g = current.g + (x !== cx && y !== cy ? Math.round(base * 1.4) : base);
        if (g >= distance[i]!) continue;
        distance[i] = g; parent[i] = current.i;
        open.push({ i, g, f: g + octile({ x, y }, to) * scale });
      }
    }
  }
  return undefined;
}
export function floodFill(map: GridMap, seed: Cell, size: number, allow: (c: Cell) => boolean, rng: RngState): Cell[] {
  if (!Number.isInteger(size) || size < 0) throw new RangeError("size must be a nonnegative integer");
  if (!size || !inBounds(map, seed) || !allow(seed)) return [];
  const result: Cell[] = [], pending = [{ ...seed }], seen = new Set([cellKey(seed)]);
  while (pending.length && result.length < size) {
    const choice = nextInt(rng, pending.length), cell = pending[choice]!;
    pending[choice] = pending[pending.length - 1]!; pending.pop(); result.push(cell);
    for (const next of neighbors(map, cell)) {
      const key = cellKey(next);
      if (seen.has(key)) continue;
      seen.add(key);
      if (allow(next)) pending.push(next);
    }
  }
  return result;
}
export function frontier(map: GridMap, cells: ReadonlySet<string>): Cell[] {
  const result = new Map<string, Cell>();
  for (const key of cells) for (const cell of neighbors(map, parseCellKey(key))) {
    const next = cellKey(cell);
    if (!cells.has(next)) result.set(next, cell);
  }
  return [...result.values()].sort((a, b) => a.y - b.y || a.x - b.x);
}
export function cellsWithin(map: GridMap, center: Cell, radius: number): Cell[] {
  const result: Cell[] = [];
  for (let y = Math.max(0, Math.ceil(center.y - radius)); y <= Math.min(map.height - 1, Math.floor(center.y + radius)); y++) {
    for (let x = Math.max(0, Math.ceil(center.x - radius)); x <= Math.min(map.width - 1, Math.floor(center.x + radius)); x++) result.push({ x, y });
  }
  return result;
}
export function footprintOf(def: PlaceDef): Cell[] {
  if (def.footprint) return def.footprint.map(c => ({ ...c }));
  const size = def.size ?? 1;
  if (!Number.isSafeInteger(size) || size < 1 || size % 2 !== 1) throw new Error("place size must be a positive odd integer");
  const result: Cell[] = [], radius = (size - 1) / 2;
  for (let y = def.at.y - radius; y <= def.at.y + radius; y++) for (let x = def.at.x - radius; x <= def.at.x + radius; x++) result.push({ x, y });
  return result;
}
