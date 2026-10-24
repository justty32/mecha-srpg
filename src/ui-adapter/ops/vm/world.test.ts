import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { newCampaign, createOpsCtx } from "../../../ops/content/start.ts";
import { gridOf, findPath, terrainAt } from "../../../ops/world/grid.ts";
import { worldRules } from "../../../ops/world/places.ts";
import { createWorldUi, WorldViewModel } from "./world.ts";
import { OpsController } from "./controller.ts";
const { db, world } = loadWorldDirs(["content/base"]);

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
