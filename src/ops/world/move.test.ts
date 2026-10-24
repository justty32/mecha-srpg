import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalJson } from "../../core/eventlog.ts";
import { createWorldDB } from "../content/worlddb.ts";
import type { WorldTables } from "../content/worlddb.ts";
import { WORLD_KINDS } from "../content/load.ts";
import { createOpsCtx } from "../content/start.ts";
import { applyCommand } from "../time/commands.ts";
import { clock } from "../state/clock.ts";
import { checkLedger } from "../state/ledger.ts";
import type { CampaignState, WorldActionDef } from "../state/types.ts";
import { cmdDock, cmdDrift, cmdSail, moveDaily3, shortestPath } from "./move.ts";
import { gridOf, stepCost } from "./grid.ts";
import { locAt } from "../war/loc.ts";
import { fixture } from "./test-support.ts";
import type { WorldRules } from "./places.ts";

function sea() {
  const base = fixture(), tables = Object.fromEntries(WORLD_KINDS.map(k => [k, Object.fromEntries(base.ctx.world.all(k).map(d => [d.id, structuredClone(d)]))])) as WorldTables;
  for (const id of ["base:map/test-move", "base:map/test-other"]) (tables.map ??= {})[id] = { id, name: id, width: 60, height: 20, cellKm: 40, fog: "charted", riftRate: 0,
    legend: { ".": "base:wterrain/plain", "X": "base:wterrain/test-wall" }, base: { rows: Array.from({ length: 20 }, (_, y) => y === 2 ? ".20X.39" : ".60") } };
  (tables.wterrain ??= {})["base:wterrain/test-wall"] = { id: "base:wterrain/test-wall", name: "wall", glyph: "X", airCost: null, groundCost: null, sight: 0, encounter: 0, riftAffinity: 0, battlePool: [], flavor: "" };
  const rules = (tables.action!["base:action/ops-world"] as WorldActionDef & { rules: WorldRules }).rules;
  rules.grid.mpMods = { damaged: 1, spring: 1, neap: 1 }; rules.grid.blightEncounter = { shallow: 0, deep: 0, core: 0 };
  rules.pressure.poissonScale = 0;
  for (const [id, map, x] of [["base:place/test-port", "base:map/test-move", 2], ["base:place/test-exit", "base:map/test-other", 2], ["base:place/test-blight", "base:map/test-move", 4]] as const)
    (tables.place ??= {})[id] = { id, map, at: { x, y: 2 }, name: id, kind: "port", services: [], tags: [] };
  (tables.lane ??= {})["base:lane/test-cross"] = { id: "base:lane/test-cross", a: "base:place/test-port", b: "base:place/test-exit", kind: "orbital", days: 3, departDays: [7, 21], fare: 10, carriesShip: false, hazards: [], tags: [] };
  const world = createWorldDB(base.ctx.world.packs, tables), s = base.s, ctx = createOpsCtx(s, base.ctx.db, world);
  for (const id of ["base:place/test-port", "base:place/test-exit", "base:place/test-blight"]) s.places[id] = { def: id, wreckage: [], flags: [] };
  s.maps["base:map/test-move"] = { blight: {}, known: {} }; s.maps["base:map/test-other"] = { blight: {}, known: {} };
  s.ship.pos = locAt(ctx, "base:map/test-move", { x: 1, y: 2 }); s.clock.phase = "ordinary";
  return { s, ctx, tables };
}
function finish(s: CampaignState, ctx: ReturnType<typeof sea>["ctx"]): number {
  let days = 0;
  while (s.ship.path && days < 50) { moveDaily3(s, ctx); days++; }
  assert.equal(s.ship.path, undefined); return days;
}
test("move：連續航行總天數等於 ceil(Σcost/mp)，sail 不耗 tick 或燃料", () => {
  const { s, ctx } = sea(), target = locAt(ctx, s.ship.pos.map, { x: 28, y: 14 }), path = shortestPath(s, ctx, s.ship.pos, target)!;
  const map = gridOf(ctx.world, s.ship.pos.map); let from = s.ship.pos.cell, total = 0;
  for (const cell of path.legs[0]!.cells) { total += stepCost(map, { layer: "air", mp: 100 }, from, cell)!; from = cell; }
  const fuel = s.ship.fuel.cur, day = s.clock.day;
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: target.cell }), { ok: true });
  assert.equal(s.clock.day, day); assert.equal(s.ship.fuel.cur, fuel);
  assert.equal(finish(s, ctx), Math.ceil(total / 100)); assert.deepEqual(s.ship.pos, target);
});
test("move：直達不慢於中途懸停一天再走，停船清空 carry", () => {
  const direct = sea(), split = sea(), target = { x: 37, y: 2 };
  cmdSail(direct.s, direct.ctx, { v: "sail", to: target }); const days = finish(direct.s, direct.ctx);
  cmdSail(split.s, split.ctx, { v: "sail", to: { x: 14, y: 2 } }); const first = finish(split.s, split.ctx);
  assert.deepEqual(cmdDrift(split.s, split.ctx, { v: "drift" }), { ok: true }); assert.equal(split.s.ship.mpCarry, 0);
  cmdSail(split.s, split.ctx, { v: "sail", to: target }); assert(days <= first + 1 + finish(split.s, split.ctx));
});
test("move：每個移動日恰扣一次燃料，經過深蝕格當日乘二", () => {
  for (const deep of [false, true]) {
    const { s, ctx } = sea(), fuel = s.ship.fuel.cur;
    if (deep) s.places["base:place/test-blight"]!.blight = { rift: "test-rift", depth: "deep", sinceDay: 0 };
    cmdSail(s, ctx, { v: "sail", to: { x: 6, y: 2 } }); const before = s.ledger.entries.length;
    assert.equal(finish(s, ctx), 1);
    const entries = s.ledger.entries.slice(before).filter(e => e.reason === "travel");
    assert.equal(entries.length, 1); assert.equal(entries[0]!.delta, deep ? -2 : -1);
    assert.equal(s.ship.fuel.cur, fuel - (deep ? 2 : 1)); assert.deepEqual(checkLedger(s), []);
  }
});
test("move：航行中等7與七次等1事件序列相同", () => {
  const { s, ctx } = sea(); cmdSail(s, ctx, { v: "sail", to: { x: 58, y: 2 } });
  const settle = (state: CampaignState) => {
    let n = 0;
    while (state.pendingChoices.length && n++ < 100) state = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice: 1 }).state;
    assert.equal(state.pendingChoices.length, 0); return state;
  };
  const batch = settle(applyCommand(s, ctx.db, ctx.world, { v: "wait", days: 7 }).state);
  let singles = s;
  for (let i = 0; i < 7; i++) singles = settle(applyCommand(singles, ctx.db, ctx.world, { v: "wait", days: 1 }).state);
  assert.equal(canonicalJson(batch.log), canonicalJson(singles.log)); assert.deepEqual(batch.ship.pos, singles.ship.pos);
  assert.equal(batch.clock.day, 7);
});
test("move：pendingBattle與pendingChoices凍結位置與燃料", () => {
  for (const battle of [false, true]) {
    const { s, ctx } = sea(); cmdSail(s, ctx, { v: "sail", to: { x: 30, y: 2 } });
    if (battle) s.pendingBattle = { id: "pending", day: 0, loc: structuredClone(s.ship.pos), trigger: "ambush", units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: true }, injected: [] };
    else s.pendingChoices.push({ text: "wait", choices: [] });
    const before = structuredClone(s.ship); moveDaily3(s, ctx); assert.deepEqual(s.ship, before);
  }
});
test("move：船永不進不可進格，不能到達時不改狀態", () => {
  const { s, ctx, tables } = sea(); tables.map!["base:map/test-move"]!.base.rows[2] = ".20X.39";
  const before = structuredClone(s);
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: { x: 20, y: 2 } }), { ok: false, error: "no-route" }); assert.deepEqual(s, before);
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: { x: 40, y: 2 } }), { ok: true });
  const map = gridOf(ctx.world, s.ship.pos.map); let from = s.ship.pos.cell;
  for (const cell of s.ship.path!.cells) { assert.notEqual(stepCost(map, { layer: "air", mp: 100 }, from, cell), undefined); from = cell; }
  finish(s, ctx); assert.deepEqual(s.ship.pos.cell, { x: 40, y: 2 });
});
test("move：跨圖航道估計包含等船天數，到站收票價", () => {
  const { s, ctx } = sea(); s.ship.pos = locAt(ctx, "base:map/test-move", { x: 2, y: 2 });
  const target = "base:place/test-exit", path = shortestPath(s, ctx, s.ship.pos, target)!;
  assert.equal(path.days, 8); assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: target }), { ok: true });
  let days = 0;
  while (s.ship.path && days < 20) { days++; s.clock = clock(days, ctx.world.require("calendar", s.calendar)); moveDaily3(s, ctx); }
  assert.equal(days, path.days); assert.equal(s.ship.pos.map, "base:map/test-other");
  assert.equal(s.log.filter(e => e.type === "Waiting").length, 5);
  assert.equal(s.ledger.entries.filter(e => e.reason === "lane-fare").at(-1)?.delta, -10);
  assert.deepEqual(cmdDock(s, ctx, { v: "dock" }), { ok: true });
});
test("move：燃料不足與未知行動者拒絕，野外不能停泊", () => {
  const { s, ctx } = sea(); s.ship.fuel.cur = 0;
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: { x: 25, y: 2 } }), { ok: false, error: "insufficient-fuel" });
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: { actor: "missing" } }), { ok: false, error: "unknown-actor" });
  assert.deepEqual(cmdDock(s, ctx, { v: "dock" }), { ok: false, error: "no-place" });
});
