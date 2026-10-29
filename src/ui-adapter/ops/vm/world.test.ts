import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { newCampaign, createOpsCtx } from "../../../ops/content/start.ts";
import { gridOf, findPath, terrainAt } from "../../../ops/world/grid.ts";
import { worldRules } from "../../../ops/world/places.ts";
import { createWorldUi, regionLabelAnchors, WorldViewModel } from "./world.ts";
import { OpsController } from "./controller.ts";
const { db, world } = loadWorldDirs(["content/base"]);

test("區域標籤只取最大四連通片內實格，不把凹形中心或孤島當錨點", () => {
  const region = new Uint16Array(7 * 5);
  const main = [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2], [2, 2]];
  for (const [x, y] of [...main, [6, 4]]) region[y! * 7 + x!] = 1;
  region[4] = 2; region[7 + 5] = 2; // 對角接觸不能合成四連通片。
  const labels = regionLabelAnchors({ width: 7, height: 5, region, regionKeys: ["", "c-shaped", "diagonal"] });
  assert.deepEqual(labels, [{ id: "c-shaped", at: { x: 0, y: 1 } }, { id: "diagonal", at: { x: 4, y: 0 } }]);
});

test("區域錨點不隨平移縮放改選，未知anchor不因關閉迷霧洩露", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world), ui = createWorldUi(s);
  const first = new WorldViewModel(s, ctx, ui).snapshot().regionLabels!;
  assert.ok(first.length > 0);
  assert.equal(new Set(first.map(label => label.id)).size, first.length);
  const grid = gridOf(world, ui.map);
  for (const label of first) {
    assert.equal(grid.regionKeys[grid.region[label.at.y * grid.width + label.at.x]!], label.id);
    assert.ok(!grid.dark[label.at.y * grid.width + label.at.x] || s.maps[ui.map]?.known[`${label.at.x},${label.at.y}`]);
  }
  ui.viewport = { x: 0, y: 0, w: 7, h: 5 }; ui.zoom = .5; ui.layers.fog = false;
  assert.deepEqual(new WorldViewModel(s, ctx, ui).snapshot().regionLabels, first);
  ui.zoom = .25;
  assert.deepEqual(new WorldViewModel(s, ctx, ui).snapshot().regionLabels, first);
  ui.layers.region = false;
  assert.deepEqual(new WorldViewModel(s, ctx, ui).snapshot().regionLabels, []);
});

test("世界游標到地點 Enter 航向 id；空格 Enter 航向座標", () => {
  const c = new OpsController({ db, world, seed: 3 });
  c.dispatch({ type: "tab", tab: "world" });
  const p = world.require("place", "place/chittagong");
  c.dispatch({ type: "mapCursor", ...p.at });
  assert.deepEqual(c.key({ key: "Enter" }), { type: "cmd", cmd: { v: "sail", to: p.id } });
  const cell = { x: p.at.x + 3, y: p.at.y };
  c.dispatch({ type: "mapCursor", ...cell });
  assert.deepEqual(c.key({ key: "Enter" }), { type: "cmd", cmd: { v: "sail", to: cell } });
});

test("世界 pathPreview 天數與 findPath 一致；空 blight／actors 可畫", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world);
  s.actors = {}; s.patches = {};
  for (const m of Object.values(s.maps)) { m.blight = {}; m.known = {}; }
  const ui = createWorldUi(s), g = gridOf(world, ui.map), cfg = worldRules(ctx).grid;
  const to = { x: s.ship.pos.cell.x + 4, y: s.ship.pos.cell.y };
  assert.ok(terrainAt(g, to).airCost !== null);
  const mp = cfg.shipMp * (s.clock.phase === "spring" ? cfg.mpMods.spring : s.clock.phase === "neap" ? cfg.mpMods.neap : 1);
  const expected = findPath(g, s.ship.pos.cell, to, { layer: "air", mp });
  assert.ok(expected);
  const vm = new WorldViewModel(s, ctx, ui), preview = vm.pathPreview({ map: ui.map, region: "", cell: to });
  assert.equal(preview.days, expected.days);
  assert.deepEqual(preview.cells, expected.cells);
  const snap = vm.snapshot();
  assert.equal(snap.cells.length, snap.viewport.w * snap.viewport.h);
  assert.ok(snap.cells.every(c => !c.classes.includes("has-actor") && !c.classes.some(k => k.startsWith("blight-"))));
});
