import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { newCampaign, createOpsCtx } from "../../../ops/content/start.ts";
import { gridOf, findPath, terrainAt, footprintOf, cellKey } from "../../../ops/world/grid.ts";
import { applyCommand } from "../../../ops/time/index.ts";
import { cmdSail, moveDaily3 } from "../../../ops/world/move.ts";
import { allPlaces, worldRules } from "../../../ops/world/places.ts";
import { createWorldUi, regionLabelAnchors, WorldViewModel, estimateDirectTravel, remainingPlaceDays } from "./world.ts";
import { buildSnapshot, type ViewState } from "./snapshot.ts";
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
  // 開局第 0 天先處理開場劇情（待選期間航向會被擋）。
  for (let i = 0; c.snapshot().prompt && i < 10; i++) c.dispatch({ type: "cmd", cmd: { v: "choose", choice: c.snapshot().prompt!.choices.find(x => x.enabled)!.n } });
  assert.equal(c.snapshot().prompt, null);
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


test("視窗更新沿用縮圖與索引且可視資料等同全新模型", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world), ui = createWorldUi(s);
  const vm = new WorldViewModel(s, ctx, ui), before = vm.snapshot();
  ui.viewport = { x: 2, y: 3, w: 12, h: 9 }; ui.zoom = .5; ui.showMinimap = false;
  const moved = vm.snapshot(true, before.actions);
  assert.equal(moved.minimap, before.minimap);
  assert.equal(moved.actions, before.actions);
  assert.deepEqual(moved, new WorldViewModel(s, ctx, ui).snapshot());
  const target = { map: ui.map, region: "", cell: { ...ui.cursor } };
  const preview = vm.pathPreview(target);
  assert.equal(vm.pathPreview(target), preview, "同狀態同目的地沿用路徑");
  const selected = new WorldViewModel(s, ctx, ui, vm);
  assert.equal(selected.pathPreview(target), preview, "hover後點格沿用同一狀態路徑");
  const fresh = new WorldViewModel(s, ctx, ui);
  assert.notEqual(fresh.pathPreview(target), preview, "沒有明確沿用時重新計算");
});


test("地點預覽停在首個城域格，同城域為零天零油", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world);
  const place = allPlaces(s, ctx).find(p => p.name.includes("孟買"))!;
  assert.ok(place);
  s.ship.pos = { map: place.map, region: "", cell: { x: 117, y: 100 } };
  s.actors = {}; s.pendingChoices = []; delete s.pendingEncounter; delete s.pendingBattle;
  // 此案隔離城域提早抵達；燃料倍數另以已知蝕深驗證。
  s.patches = {};
  for (const map of Object.values(s.maps)) { map.blight = {}; map.known = {}; }
  for (const cell of footprintOf(place)) s.maps[place.map]!.known[cellKey(cell)] = { day: s.clock.day, actors: [] };
  const ui = createWorldUi(s); ui.cursor = { ...place.at };
  const preview = new WorldViewModel(s, ctx, ui).pathPreview({ map: place.map, region: "", cell: place.at });
  assert.ok(preview.cells.length > 0);
  assert.ok(footprintOf(place).some(c => cellKey(c) === cellKey(preview.cells.at(-1)!)));
  assert.equal(cmdSail(s, ctx, { v: "sail", to: place.id }).ok, true);
  const fuel = s.ship.fuel.cur;
  const view: ViewState = { tab: "contracts", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false };
  assert.equal(buildSnapshot(s, ctx, view).header.route!.daysLeft, preview.days, "未開地圖也顯示到城域的預估");
  assert.equal(remainingPlaceDays(s, ctx), preview.days);
  let days = 0;
  while (s.ship.path && days < 10) { moveDaily3(s, ctx); days++; }
  assert.equal(days, preview.days);
  assert.equal(fuel - s.ship.fuel.cur, preview.fuel);
  assert.deepEqual(s.ship.pos.cell, preview.cells.at(-1));
  assert.equal(buildSnapshot(s, ctx, view).header.route, null, "到達後回到無航程狀態");
  const arrivedUi = createWorldUi(s); arrivedUi.cursor = { ...place.at };
  const arrived = new WorldViewModel(s, ctx, arrivedUi).snapshot();
  assert.equal(arrived.preview.days, 0); assert.equal(arrived.preview.fuel, 0);
  assert.equal(arrived.actions.find(b => b.id === "map:sail")!.action.type, "cmd");
});


test("單圖航程燃料按已知深蝕移動日加倍，不從未知蝕塊補情報", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world);
  s.ship.pos.cell = { x: 10, y: 10 }; s.actors = {}; s.patches = {};
  for (const map of Object.values(s.maps)) { map.blight = {}; map.known = {}; }
  const target = { map: s.ship.pos.map, region: "", cell: { x: 11, y: 10 } };
  const known = s.maps[target.map]!.known;
  known[cellKey(target.cell)] = { day: s.clock.day, actors: [], blight: { rift: "test", patch: "test", depth: "core" } };
  const core = new WorldViewModel(s, ctx, createWorldUi(s)).pathPreview(target);
  assert.equal(core.days, 1); assert.equal(core.fuel, worldRules(ctx).travel.fuelPerDay * 2);
  delete known[cellKey(target.cell)];
  const unknown = new WorldViewModel(s, ctx, createWorldUi(s)).pathPreview(target);
  assert.equal(unknown.fuel, worldRules(ctx).travel.fuelPerDay);
});


test("剩餘直航估算計入carry，新航程仍從零開始", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world);
  s.ship.pos.cell = { x: 10, y: 10 }; s.patches = {};
  for (const map of Object.values(s.maps)) { map.blight = {}; map.known = {}; }
  const cells = Array.from({ length: 20 }, (_, i) => ({ x: 11 + i, y: 10 }));
  const fromZero = estimateDirectTravel(s, ctx, s.ship.pos.map, cells);
  assert.ok(fromZero.days > 1);
  assert.equal(estimateDirectTravel(s, ctx, s.ship.pos.map, cells, 10000).days, 1);
  s.ship.mpCarry = 10000;
  assert.deepEqual(estimateDirectTravel(s, ctx, s.ship.pos.map, cells), fromZero, "新起航不挪用舊carry");
});

test("關閉迷霧不把未知地點格的精確航行命令改成地點", () => {
  // 新 WorldDB 身分擁有獨立 grid cache，暗格只屬於本案。
  const isolatedWorld = { ...world };
  const s = newCampaign(db, isolatedWorld, "start/default", 3), ctx = createOpsCtx(s, db, isolatedWorld);
  const place = allPlaces(s, ctx)[0]!, cell = footprintOf(place)[0]!;
  const grid = gridOf(isolatedWorld, place.map);
  grid.dark[cell.y * grid.width + cell.x] = 1;
  delete s.maps[place.map]!.known[cellKey(cell)];
  const ui = createWorldUi(s); ui.map = place.map; ui.cursor = { ...cell }; ui.layers.fog = false;
  const vm = new WorldViewModel(s, ctx, ui);
  assert.deepEqual(vm.sail().to, cell);
});


test("預估深蝕油不足只警告，航行按鈕最終以真指令合法性為準", () => {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world);
  s.ship.pos.cell = { x: 10, y: 10 }; s.actors = {}; s.patches = {}; s.pendingChoices = [];
  delete s.pendingEncounter; delete s.pendingBattle;
  for (const map of Object.values(s.maps)) { map.blight = {}; map.known = {}; }
  const ui = createWorldUi(s); ui.cursor = { x: 11, y: 10 };
  s.maps[ui.map]!.known[cellKey(ui.cursor)] = { day: s.clock.day, actors: [], blight: { rift: "test", patch: "test", depth: "core" } };
  const view: ViewState = { map: ui, tab: "world", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false };
  for (const fuel of [1, 0]) {
    s.ship.fuel.cur = fuel; s.ledger.balances["stock:fuel"] = fuel;
    const snapshot = buildSnapshot(s, ctx, view), grid = snapshot.world.grid!;
    assert.equal(grid.preview.fuel, worldRules(ctx).travel.fuelPerDay * 2);
    assert.match(grid.preview.note, /預估燃料不足/);
    const action = grid.actions.find(b => b.id === "map:sail")!;
    assert.equal(action.action.type, "cmd");
    if (action.action.type === "cmd") assert.equal(action.enabled, applyCommand(s, db, world, action.action.cmd).result.ok);
    assert.equal(action.enabled, fuel === 1);
  }
});
