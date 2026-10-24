import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { createRng, nextInt } from "../../core/rng.ts";
import type { Cell } from "../../core/types-def.ts";
import type { MapDef, PlaceDef, WTerrainDef } from "../state/types.ts";
import { loadWorldDirs } from "../content/load.ts";
import { buildGridMap, cellKey, parseCellKey, idx, inBounds, decodeRow, gridOf, terrainAt, neighbors,
  chebyshev, octile, stepCost, findPath, floodFill, frontier, cellsWithin, footprintOf } from "./grid.ts";
import type { GridMap, Mover, CostFn } from "./grid.ts";

const air: Mover = { layer: "air", mp: 100 }, ground: Mover = { layer: "ground", mp: 60 };
const terrains: WTerrainDef[] = [
  ["plain", ".", 10, 10], ["ridge", "^", 14, 20], ["cloudwall", "A", 25, null],
  ["shoal", ",", 10, 14], ["tidesea", "~", 10, null], ["blocked", "#", null, null],
  ["cheap", "c", 1, 1], ["odd", "o", 3, 7],
].map(([name, glyph, airCost, groundCost]) => ({ id: `wterrain/${name}`, name: String(name), glyph: String(glyph),
  airCost: airCost as number | null, groundCost: groundCost as number | null,
  sight: 0, encounter: 1, riftAffinity: 1, battlePool: [], flavor: "測試" }));
function definition(rows: string[], extra: Partial<MapDef> = {}): MapDef {
  return { id: "map/test", name: "測試", width: rows[0]!.length, height: rows.length, cellKm: 40,
    fog: "charted", riftRate: 1, legend: Object.fromEntries(terrains.map(t => [t.glyph, t.id])), base: { rows }, ...extra };
}
function small(rows: string[], extra: Partial<MapDef> = {}): GridMap { return buildGridMap(definition(rows, extra), terrains); }
function verifyPath(map: GridMap, from: Cell, to: Cell, mover: Mover, cost?: CostFn): number | undefined {
  const result = findPath(map, from, to, mover, cost);
  assert.deepEqual(result, findPath(map, from, to, mover, cost), "同輸入逐格相同");
  if (!result) return undefined;
  let previous = from, total = 0;
  for (const cell of result.cells) {
    assert.ok(inBounds(map, cell));
    assert.equal(chebyshev(previous, cell), 1);
    const step = stepCost(map, mover, previous, cell, cost);
    assert.notEqual(step, undefined, "不踏進不可進格");
    total += step!; previous = cell;
  }
  assert.deepEqual(previous, to);
  assert.equal(total, result.cost);
  assert.equal(result.days, Math.ceil(total / mover.mp));
  return result.cost;
}
const cases: { name: string; rows: string[]; to: Cell; expected: number; mover?: Mover; road?: [number, number][]; cost?: CostFn }[] = [
  { name: "直線", rows: ["....."], to: { x: 4, y: 0 }, expected: 40 },
  { name: "縱線", rows: [".", ".", ".", "."], to: { x: 0, y: 3 }, expected: 30 },
  { name: "斜線", rows: ["...", "...", "..."], to: { x: 2, y: 2 }, expected: 28 },
  { name: "直斜混合", rows: ["....", "....", "...."], to: { x: 3, y: 2 }, expected: 38 },
  { name: "地面繞山", rows: [".^^^.", "....."], to: { x: 4, y: 0 }, mover: ground, expected: 48 },
  { name: "船繞雲嶂", rows: [".A.", "..."], to: { x: 2, y: 0 }, expected: 28 },
  { name: "穿淺灘", rows: [".,,."], to: { x: 3, y: 0 }, mover: ground, expected: 38 },
  { name: "船穿潮海", rows: [".~~."], to: { x: 3, y: 0 }, expected: 30 },
  { name: "地面繞潮海", rows: [".~.", ".~.", "..."], to: { x: 2, y: 0 }, mover: ground, expected: 48 },
  { name: "道路折半", rows: ["....."], to: { x: 4, y: 0 }, mover: ground, road: [[1, 0], [2, 0], [3, 0], [4, 0]], expected: 20 },
  { name: "船不受道路影響", rows: ["....."], to: { x: 4, y: 0 }, road: [[1, 0], [2, 0], [3, 0], [4, 0]], expected: 40 },
  { name: "成本回呼封格", rows: ["...", "...", "..."], to: { x: 2, y: 0 }, cost: (c, base) => c.x === 1 && c.y < 2 ? undefined : base, expected: 48 },
];
for (const example of cases) test(`已知最短成本：${example.name}`, () => {
  const map = small(example.rows, { road: example.road });
  assert.equal(verifyPath(map, { x: 0, y: 0 }, example.to, example.mover ?? air, example.cost), example.expected);
});
test("無路徑回 undefined；原地為零成本", () => {
  const map = small([".#.", ".#.", ".#."]);
  assert.equal(verifyPath(map, { x: 0, y: 0 }, { x: 2, y: 0 }, air), undefined);
  assert.equal(verifyPath(small([".~."]), { x: 0, y: 0 }, { x: 2, y: 0 }, ground), undefined);
  assert.deepEqual(findPath(map, { x: 0, y: 0 }, { x: 0, y: 0 }, air), { cells: [], cost: 0, days: 0 });
});

// 獨立 O(V²) Dijkstra oracle：不使用 A* 的堆、啟發式或 stepCost。
function dijkstra(map: GridMap, from: Cell, to: Cell, mover: Mover, cost?: CostFn): number | undefined {
  const entry = (i: number): number => {
    const terrain = map.terrains[map.base[i]!]!, base = mover.layer === "air" ? terrain.airCost : terrain.groundCost;
    if (base === null) return Infinity;
    const value = mover.layer === "ground" && map.road.has(i) ? base / 2 : base;
    return (cost ? cost({ x: i % map.width, y: Math.floor(i / map.width) }, value) : value) ?? Infinity;
  };
  const start = idx(map, from), goal = idx(map, to), n = map.base.length;
  if (!Number.isFinite(entry(start)) || !Number.isFinite(entry(goal))) return undefined;
  const distances = Array<number>(n).fill(Infinity), done = new Set<number>();
  distances[start] = 0;
  while (done.size < n) {
    let best = -1;
    for (let i = 0; i < n; i++) if (!done.has(i) && Number.isFinite(distances[i]) && (best < 0 || distances[i]! < distances[best]!)) best = i;
    if (best < 0) return undefined;
    if (best === goal) return distances[best];
    done.add(best);
    const x = best % map.width, y = Math.floor(best / map.width);
    for (let j = 0; j < n; j++) {
      const dx = Math.abs(j % map.width - x), dy = Math.abs(Math.floor(j / map.width) - y);
      if (done.has(j) || dx > 1 || dy > 1 || !dx && !dy) continue;
      const base = entry(j), step = dx && dy ? Math.round(base * 1.4) : base;
      distances[j] = Math.min(distances[j]!, distances[best]! + step);
    }
  }
  return undefined;
}
test("A* 成本等於 Dijkstra：固定 seed 隨機 200 張小圖", () => {
  const rng = createRng(40200), glyphs = [".", ".", "^", "A", ",", "~", "#", "c", "o"];
  for (let trial = 0; trial < 200; trial++) {
    const width = 4 + nextInt(rng, 7), height = 4 + nextInt(rng, 7);
    const rows = Array.from({ length: height }, () => Array.from({ length: width }, () => glyphs[nextInt(rng, glyphs.length)]!).join(""));
    const road: [number, number][] = [];
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (nextInt(rng, 8) === 0) road.push([x, y]);
    const map = small(rows, { road }), mover = trial % 2 ? air : ground;
    const from = { x: nextInt(rng, width), y: nextInt(rng, height) }, to = { x: nextInt(rng, width), y: nextInt(rng, height) };
    const cost: CostFn | undefined = trial % 3 ? undefined : (c, base) => (c.x + c.y) % 7 === 0 ? undefined : Math.max(0, base - 1);
    assert.equal(verifyPath(map, from, to, mover, cost), dijkstra(map, from, to, mover, cost), `trial ${trial}`);
  }
});
test("250×150 隨機圖 100 對平均 < 10 ms", () => {
  const rng = createRng(250150), glyphs = [".", ".", ".", "^", ",", "~", "A", "#"];
  const rows = Array.from({ length: 150 }, () => Array.from({ length: 250 }, () => glyphs[nextInt(rng, glyphs.length)]!).join(""));
  const map = small(rows), pairs: [Cell, Cell][] = [];
  const pick = (): Cell => {
    for (;;) {
      const cell = { x: nextInt(rng, 250), y: nextInt(rng, 150) };
      if (terrainAt(map, cell).airCost !== null) return cell;
    }
  };
  for (let i = 0; i < 100; i++) pairs.push([pick(), pick()]);
  const started = performance.now();
  const results = pairs.map(([from, to]) => findPath(map, from, to, air));
  const mean = (performance.now() - started) / pairs.length;
  console.log(`grid A* 250x150 / 100 pairs mean: ${mean.toFixed(3)} ms`);
  assert.ok(results.every(Boolean));
  assert.ok(mean < 10, `mean ${mean.toFixed(3)} ms >= 10 ms`);
});
test("RLE、八鄰、視野、frontier 與座標幾何", () => {
  assert.deepEqual(decodeRow("~2.^3", 6), ["~", "~", ".", "^", "^", "^"]);
  assert.throws(() => decodeRow(".2", 3), /length/);
  const map = small(["...", "...", "..."]), corner = { x: 0, y: 0 };
  assert.deepEqual(parseCellKey(cellKey({ x: -2, y: 4 })), { x: -2, y: 4 });
  assert.equal(idx(map, { x: 2, y: 1 }), 5);
  assert.equal(octile(corner, { x: 3, y: 2 }), 38);
  assert.deepEqual(neighbors(map, corner), [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]);
  assert.deepEqual(frontier(map, new Set(["0,0"])), neighbors(map, corner));
  assert.deepEqual(cellsWithin(map, corner, 1), [corner, ...neighbors(map, corner)]);
});
test("floodFill 連通、恰 size、可達上限與相同 seed 可重播", () => {
  const map = small(["...#.", "...#.", "...#."]), seed = { x: 0, y: 0 };
  const allow = (c: Cell) => terrainAt(map, c).groundCost !== null;
  const filled = floodFill(map, seed, 7, allow, createRng(42));
  assert.equal(filled.length, 7);
  assert.equal(new Set(filled.map(cellKey)).size, 7);
  filled.forEach((cell, i) => assert.ok(i === 0 || filled.slice(0, i).some(prior => chebyshev(prior, cell) === 1)));
  assert.deepEqual(filled, floodFill(map, seed, 7, allow, createRng(42)));
  assert.equal(floodFill(map, seed, 100, allow, createRng(42)).length, 9);
});
test("footprint 預設、奇數 size 與顯式 footprint 優先", () => {
  const place: PlaceDef = { id: "place/test", name: "測試", map: "map/test", at: { x: 2, y: 2 }, kind: "city", services: [], tags: [] };
  assert.deepEqual(footprintOf(place), [place.at]);
  const expanded = footprintOf({ ...place, size: 3 });
  assert.equal(expanded.length, 9);
  assert.deepEqual(expanded[0], { x: 1, y: 1 });
  assert.deepEqual(expanded.at(-1), { x: 3, y: 3 });
  assert.deepEqual(footprintOf({ ...place, size: 3, footprint: [{ x: 3, y: 2 }] }), [{ x: 3, y: 2 }]);
});
test("fixture 兩張圖、六地點、兩航道、各層與每個 WorldDB 的快取", () => {
  const { world, errors } = loadWorldDirs(["src/ops/world/fixtures/grid40"]);
  assert.deepEqual(errors, []);
  assert.equal(world.all("map").length, 2);
  assert.equal(world.all("place").length, 6);
  assert.deepEqual(world.all("lane").map(l => l.kind).sort(), ["air-lane", "orbital"]);
  const map = gridOf(world, "map/test40"), moon = gridOf(world, "map/test-moon");
  assert.equal(map.width, 40); assert.equal(map.height, 40);
  assert.equal(moon.width, 12); assert.equal(moon.height, 12);
  assert.equal(map.land, 26 * 40 + 6 * 6);
  assert.equal(map.regionKeys[map.region[idx(map, { x: 34, y: 12 })]!], "island");
  assert.ok(map.road.has(idx(map, { x: 4, y: 3 })));
  assert.equal(moon.dark[idx(moon, { x: 2, y: 2 })], 0);
  assert.equal(moon.dark[idx(moon, { x: 8, y: 2 })], 1);
  assert.equal(gridOf(world, "grid40:map/test40"), map);
  assert.notEqual(gridOf(loadWorldDirs(["src/ops/world/fixtures/grid40"]).world, "map/test40"), map);
  assert.equal(buildGridMap(definition([".."], { fog: "dark", darkRects: [] }), terrains).dark[0], 1);
});
