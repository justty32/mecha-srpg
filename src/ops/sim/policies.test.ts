import test from "node:test";
import assert from "node:assert/strict";
import { fixture, result } from "../sortie/test-support.ts";
import { applyBattleResult } from "../sortie/apply.ts";
import { applyCommand } from "../time/index.ts";
import { createOpsCtx } from "../content/start.ts";
import { placeLoc } from "../war/loc.ts";
import { greedy, merc, random } from "./policies.ts";
import { checkActorContacts } from "../world/encounter.ts";
import type { MarketState } from "../world/market.ts";

test("greedy 在野外且沒有契約或待戰時不憑空出戰；低油在市場用交易補給", () => {
  const { s, ctx } = fixture(); s.contracts = {}; s.pendingChoices = []; delete s.pendingBattle;
  s.ship.pos.cell = { x: 131, y: 91 }; s.ship.drifting = true;
  assert.notEqual(greedy(s, ctx).v, "sortie");
  s.ship.pos = placeLoc(s, ctx, "place/dhaka"); s.ship.drifting = false;
  s.ship.fuel.cur = 2; s.ledger.balances["stock:fuel"] = 2;
  const command = greedy(s, ctx); assert.equal(command.v, "trade");
  const next = applyCommand(s, ctx.db, ctx.world, command); assert.equal(next.result.ok, true);
  assert.ok(next.state.ship.fuel.cur > 2); assert.ok(next.state.ledger.balances.cash < s.ledger.balances.cash);
});

test("random 有補給時隨機航行、航程中等待，政策不改寫狀態", () => {
  const { s, ctx } = fixture(); s.contracts = {}; s.pendingChoices = []; delete s.pendingBattle;
  s.ship.pos = placeLoc(s, ctx, "place/dhaka"); s.ship.drifting = false;
  s.ship.fuel.cur = s.ship.fuel.max; s.ledger.balances["stock:fuel"] = s.ship.fuel.max;
  const before = structuredClone(s), cmd = random(s, ctx);
  assert.deepEqual(s, before); assert.equal(cmd.v, "sail");
  const voyage = applyCommand(s, ctx.db, ctx.world, cmd);
  assert.equal(voyage.result.ok, true); assert.ok(voyage.state.ship.path);
  assert.deepEqual(random(voyage.state, createOpsCtx(voyage.state, ctx.db, ctx.world)), { v: "wait", days: 1 });
});

test("merc 履約航行遇伏擊且無可戰單位時撤離，不等待同一天", () => {
  const { s, ctx, sortie, contract } = fixture();
  contract.operation = "operation-test";
  s.hangar.bays = [];
  s.ship.path = { cells: [sortie.loc.cell], legs: [{ map: sortie.loc.map, cells: [sortie.loc.cell] }], to: { place: contract.target.place }, via: [] };
  s.pendingBattle = { ...sortie, loc: structuredClone(s.ship.pos), trigger: "ambush", units: [] };
  const command = merc(s, ctx);
  assert.deepEqual(command, { v: "drift" });
  const escaped = applyCommand(s, ctx.db, ctx.world, command);
  assert.equal(escaped.result.ok, true);
  assert.equal(escaped.state.pendingBattle, undefined);
  assert.equal(escaped.state.ship.path, undefined);
  const resumed = applyCommand(escaped.state, ctx.db, ctx.world, { v: "wait", days: 1 });
  assert.equal(resumed.state.clock.day, s.clock.day + 1);
});

test("greedy 同契約連續兩次平手後 drop，一次平手仍可出戰", () => {
  const { s, ctx, sortie, contract } = fixture(), battle = result();
  s.ship.pos = placeLoc(s, ctx, contract.target.place);
  battle.winner = null; battle.reason = "timeout";
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(contract.consecutiveDraws, 1);
  assert.equal(greedy(s, ctx).v, "sortie");
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(contract.consecutiveDraws, 1);
  applyBattleResult(s, ctx, { ...sortie, id: "second-draw" }, battle);
  assert.equal(contract.consecutiveDraws, 2);
  const cmd = greedy(s, ctx);
  assert.deepEqual(cmd, { v: "drop", contract: contract.id });
  const dropped = applyCommand(s, ctx.db, ctx.world, cmd);
  assert.equal(dropped.result.ok, true);
  assert.equal(dropped.state.contracts[contract.id]!.status, "cancelled");
});

test("greedy 不派出戰會注入 morale-shaken 的乘員，mood 零仍可派", () => {
  for (const mood of [-2, -1, 0]) {
    const { s, ctx, contract } = fixture();
    s.ship.pos = placeLoc(s, ctx, contract.target.place);
    for (const employment of Object.values(s.roster.employment)) employment.mood = mood;
    const before = structuredClone(s), cmd = greedy(s, ctx);
    assert.deepEqual(s, before);
    assert.equal(cmd.v, mood < 0 ? "sail" : "sortie", `mood=${mood}`);
    if (cmd.v === "sail") assert.ok(ctx.world.all("market").some(m => m.place === cmd.to));
  }
});

test("greedy 單機結構層剩半血不出戰，超過半血仍可派", () => {
  for (const ratio of [0.5, 0.51]) {
    const { s, ctx, contract, mech } = fixture();
    s.ship.pos = placeLoc(s, ctx, contract.target.place); s.hangar.bays = [mech];
    const unit = s.mechs[mech]!, body = ctx.db.require("bodyplan", ctx.db.require("frame", unit.frame).bodyPlan);
    const part = body.parts.find(p => p.layers.some(l => l.structural))!;
    const layer = part.layers.findIndex(l => l.structural);
    unit.parts[part.id]!.layers[layer]!.hp = part.layers[layer]!.hp * ratio;
    // 已排但尚未開工，避免本案只驗到 repairJob 的優先順序。
    s.jobs.push({ id: "await-repair", kind: "repair", target: mech, part: part.id, layer,
      needHours: 2, doneHours: 0, materials: {}, paid: false, priority: 0 });
    assert.equal(greedy(s, ctx).v, ratio <= 0.5 ? "wait" : "sortie", `ratio=${ratio}`);
  }
});

test("greedy 不派核心、腿、武器毀損或無彈機，沒有能戰鬥的機甲就返補給城", () => {
  for (const damage of ["torso", "legs", "right-arm", "weapon", "ammo", "empty", "working"] as const) {
    const { s, ctx, mech, contract } = fixture();
    s.ship.pos = placeLoc(s, ctx, contract.target.place);
    const unit = s.mechs[mech]!;
    // 開局機體自帶內建頭吼（innateAbilities）；本案只驗部件武器，故此處清空內建能力。
    if (damage === "right-arm" || damage === "weapon" || damage === "ammo" || damage === "empty") {
      const db = ctx.db, frameId = unit.frame;
      ctx.db = { ...db, require: ((kind: string, id: string) => kind === "frame" && id === frameId
        ? { ...db.require("frame", id), innateAbilities: [] } : (db.require as (a: string, b: string) => unknown)(kind, id)) as typeof db.require };
    }
    if (damage === "ammo") unit.pools["ammo-30"]!.cur = 0;
    else if (damage === "empty") unit.parts["right-arm"]!.components["right-weapon"] = null;
    else if (damage === "weapon") {
      const layer = unit.parts["right-arm"]!.layers.at(-1)!; layer.hp = 0; layer.broken = true;
    } else if (damage !== "working") unit.parts[damage]!.broken = true;
    if (damage === "working") s.jobs.push({ id: "working", kind: "repair", target: mech, part: "torso", layer: 0,
      needHours: 2, doneHours: 1, materials: {}, paid: true, priority: 0 });
    const cmd = greedy(s, ctx);
    assert.equal(cmd.v, "sortie", damage);
    if (cmd.v !== "sortie") throw new Error("expected sortie");
    assert.ok(cmd.sortie.units!.length > 0);
    assert.ok(cmd.sortie.units!.every(u => u.mech !== mech), damage);
    s.hangar.bays = [mech];
    const returning = greedy(s, ctx); assert.equal(returning.v, "sail", damage);
    if (returning.v === "sail") assert.ok(ctx.world.all("market").some(m => m.place === returning.to));
    assert.equal(applyCommand(s, ctx.db, ctx.world, returning).result.ok, true);
  }
});

test("random 沒有 battle runner 時僅選交涉或迴避，待戰以付費 drift 處理", () => {
  const { s, ctx, sortie } = fixture(); s.actors = {};
  s.ship.drifting = true;
  const noBattle = Object.assign(ctx, { battleAvailable: false });
  s.actors.test = { id: "test", kind: "swarm", faction: "enemy", pos: structuredClone(s.ship.pos), mp: 60, str: 10,
    goal: { type: "idle" }, stance: "hostile", born: 0, flags: [] };
  checkActorContacts(s, ctx);
  assert.deepEqual(random(s, noBattle), { v: "choose", choice: 1 });
  s.actors.test.kind = "patrol";
  const command = random(s, noBattle); assert.equal(command.v, "choose");
  if (command.v === "choose") assert.ok([1, 3].includes(command.choice));
  const ready = { ...ctx, battleAvailable: true };
  s.actors.test.str = 0; assert.deepEqual(greedy(s, ready), { v: "choose", choice: 3 });
  s.actors.test.str = Number.MAX_SAFE_INTEGER; assert.deepEqual(greedy(s, ready), { v: "choose", choice: 3 });
  s.actors.test.kind = "swarm"; s.actors.test.str = 1;
  assert.deepEqual(greedy(s, ready), { v: "choose", choice: 1 }, "低 str 也不代表鄰近裂獸群能安全獲利");
  delete s.pendingEncounter; s.pendingBattle = { ...sortie, trigger: "intercept", actors: ["test"] };
  assert.deepEqual(random(s, noBattle), { v: "drift" });
  const escaped = applyCommand(s, ctx.db, ctx.world, random(s, noBattle));
  assert.equal(escaped.result.ok, true); assert.ok(escaped.state.ship.fuel.cur < s.ship.fuel.cur);
  s.pendingBattle = { ...sortie, trigger: "ambush" }; s.ship.fuel.cur = 0; s.ledger.balances["stock:fuel"] = 0;
  const withRunner = random(s, ready); assert.equal(withRunner.v, "sortie");
  assert.equal(applyCommand(s, ctx.db, ctx.world, withRunner, { battle(state) { delete state.pendingBattle; return { ok: true }; } }).result.ok, true);
});

test("greedy 對受損層排 repair／rebuild，交給既有 queue 計價且不重複排程", () => {
  for (const hp of [25, 0]) {
    const { s, ctx, mech } = fixture();
    s.hangar.bays = [mech];
    s.mechs[mech]!.parts.legs!.layers[0]!.hp = hp;
    s.mechs[mech]!.parts.legs!.broken = hp === 0;
    s.contracts = {};
    const before = structuredClone(s), cmd = greedy(s, ctx);
    assert.deepEqual(s, before);
    assert.deepEqual(cmd, { v: "queue", job: { kind: hp === 0 ? "rebuild" : "repair", target: mech, part: "legs", layer: 0 } });
    const queued = applyCommand(s, ctx.db, ctx.world, cmd);
    assert.equal(queued.result.ok, true);
    assert.equal(queued.state.jobs.length, 1);
    assert.ok(queued.state.jobs[0]!.needHours > 0);
    assert.ok(Object.values(queued.state.jobs[0]!.materials).some(n => n! > 0));
    assert.notEqual(greedy(queued.state, createOpsCtx(queued.state, ctx.db, ctx.world)).v, "queue");
  }
});

test("greedy 維修缺料會用現金在市場買料，政策不直接改帳本", () => {
  const { s, ctx, mech } = fixture(); s.contracts = {}; delete s.pendingBattle;
  s.ship.pos = placeLoc(s, ctx, "place/chittagong"); s.ship.drifting = false;
  s.mechs[mech]!.parts.legs!.layers[0]!.hp -= 10;
  const queued = applyCommand(s, ctx.db, ctx.world, { v: "queue", job: { kind: "repair", target: mech, part: "legs", layer: 0 } }).state;
  queued.ledger.balances["stock:scrap"] = 0;
  const before = structuredClone(queued), command = greedy(queued, createOpsCtx(queued, ctx.db, ctx.world));
  assert.deepEqual(queued, before); assert.equal(command.v, "trade");
  if (command.v === "trade") assert.ok(command.buy?.every(id => id === "stock:scrap"));
  const out = applyCommand(queued, ctx.db, ctx.world, command);
  assert.equal(out.result.ok, true);
  assert.ok(out.state.ledger.balances.cash < queued.ledger.balances.cash);
  assert.ok(out.state.ledger.balances["stock:scrap"]! > 0);
  const empty = structuredClone(queued) as MarketState;
  empty.markets = { "base:market/chittagong": { refreshedDay: empty.clock.day, stock: { "stock:fuel": 120, "stock:scrap": 0 } } };
  const procurement = greedy(empty, createOpsCtx(empty, ctx.db, ctx.world));
  assert.equal(procurement.v, "sail", "長期缺貨時去有貨的市場，不能無限等待");
  assert.equal(applyCommand(empty, ctx.db, ctx.world, procurement).result.ok, true);
  const restocking = structuredClone(empty);
  restocking.clock.dom = ctx.world.require("calendar", empty.calendar).neap[0]! - 1;
  assert.deepEqual(greedy(restocking, createOpsCtx(restocking, ctx.db, ctx.world)), { v: "wait", days: 1 }, "明天補貨比航程快，留港等待");
  // 近港缺料、只能遠航買料時，先買足往返燃料，避免採購把船困在野外。
  const far = structuredClone(queued) as MarketState;
  far.ship.pos = placeLoc(far, ctx, "place/dhaka"); far.ship.fuel.cur = 12; far.ledger.balances["stock:fuel"] = 12;
  far.markets = Object.fromEntries(ctx.world.all("market").map(m => [m.id, { refreshedDay: far.clock.day,
    stock: Object.fromEntries(m.lists.flatMap(list => list.items).map(item => [item.def,
      item.def === "stock:scrap" && !m.id.endsWith("/old-array") ? 0 : item.stockMax])) }]));
  const supply = greedy(far, createOpsCtx(far, ctx.db, ctx.world));
  assert.equal(supply.v, "trade");
  if (supply.v === "trade") assert.ok(supply.buy?.every(id => id === "stock:fuel"));
});
