import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createContentDB } from "../content/contentdb.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import type { AbilityDef, BodyPlanDef, EffectDef, FrameDef, PersonDef, TerrainDef } from "../core/types-def.ts";
import { newRuntime, makeUnit, rt, unit, person } from "./state.ts";
import type { Ctx } from "./state.ts";
const base = loadContentDirs(["content/base", "test/scenarios/pack"]).db;
function fixture(edit?: (d: { body: BodyPlanDef; frame: FrameDef; ability: AbilityDef; effect: EffectDef; pilot: PersonDef; terrain: TerrainDef }) => void): Ctx {
  const body: BodyPlanDef = { id: "cb:bodyplan/test", parts: [{ id: "core", name: "核心", exposure: 1,
    layers: [{ type: "armor", hp: 10, ablative: true, resist: {}, passThrough: {}, structural: false },
      { type: "cockpit-shell", hp: 20, ablative: true, resist: {}, passThrough: {}, structural: true }],
    slots: [], functions: ["core", "locomotion", "cockpit"], onLayerBroken: {}, onBroken: [], conduct: [],
    seats: [{ id: "pilot", accepts: ["pilot"] }] }] };
  const frame: FrameDef = { id: "cb:frame/test", name: "測試", cls: "mechanical", grade: "D", bodyPlan: body.id,
    baseAttrs: { initiative: 5 }, pools: [], innateAbilities: ["cb:ability/test"], repairPolicy: "repair-or-replace", tags: [] };
  const ability: AbilityDef = { id: "cb:ability/test", name: "測試攻擊", mode: "activated", costs: [{ owner: "person", pool: "ap", amount: 2 }],
    produces: [], require: [], target: { kind: "unit", range: { min: 1, max: 6 }, los: true, friendly: "no" }, accuracy: 0,
    partAim: { allowed: true, penalty: 10 }, packets: [{ type: "kinetic", amount: 12 }], effects: [], tags: [], ai: { tactics: {} } };
  const effect: EffectDef = { id: "cb:effect/test", name: "測試效果", scope: "person", clock: { kind: "ownerTurns", n: 1 },
    stack: { policy: "refresh" }, contribs: [], hooks: {}, tags: [], ui: { badge: "測" } };
  const pilot = structuredClone(base.require("person", "base:person/ren-kasai"));
  pilot.id = "cb:person/test"; pilot.attrs = { initiative: 10, accuracy: 70, evasion: 0 };
  const terrain = structuredClone(base.require("terrain", "terrain/plain")); terrain.id = "cb:terrain/test";
  edit?.({ body, frame, ability, effect, pilot, terrain });
  const db = createContentDB([{ id: "cb", version: "1", depends: [] }], base.registries, { ...base.rules, moraleEvents: [], injuries: [] },
    { bodyplan: { [body.id]: body }, frame: { [frame.id]: frame }, ability: { [ability.id]: ability },
      effect: { [effect.id]: effect }, person: { [pilot.id]: pilot }, terrain: { [terrain.id]: terrain } });
  const ctx: Ctx = { db, s: { round: 1, order: ["a", "b"], units: {}, persons: {},
    map: { def: "test", width: 5, height: 5, terrain: Array(25).fill(terrain.id), featureHp: {} },
    factions: {}, knowledge: {}, rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
  for (const [i, id] of ["a", "b"].entries()) makeUnit(ctx, { id, frame: frame.id, owner: id, pos: { x: i + 1, y: 1 },
    persons: [{ id: `${id}-pilot`, def: pilot.id, seat: "pilot" }] });
  rt(ctx.s).active = "a";
  return ctx;
}

import { movementBudget, locomotionOf, stepCost, moveAlong, reachable } from "./movement.ts";
import { addContrib } from "./contribs.ts";
test("逐格付 AP；付不起停在上一格、不扣半步", () => {
  const ctx = fixture(d => { d.terrain.moveCost.leg = 2; });
  person(ctx, "a-pilot").pools.ap!.cur = 3;
  moveAlong(ctx, "a", [{ x: 1, y: 2 }, { x: 1, y: 3 }]);
  assert.deepEqual(unit(ctx, "a").pos, { x: 1, y: 2 });
  assert.equal(person(ctx, "a-pilot").pools.ap!.cur, 1);
  assert.equal(ctx.s.log.events.filter(e => e.type === "Moved").length, 1);
});
test("onEnter 進格掛效果後定身停止", () => {
  const ctx = fixture(d => { d.effect.scope = "mech"; d.effect.tags = ["rooted"]; d.terrain.onEnter = [d.effect.id]; });
  moveAlong(ctx, "a", [{ x: 1, y: 2 }, { x: 1, y: 3 }]);
  assert.deepEqual(unit(ctx, "a").pos, { x: 1, y: 2 });
  assert.equal(unit(ctx, "a").effects.length, 1);
  assert.deepEqual(ctx.s.log.events.map(e => e.type), ["PoolChanged", "Moved", "EffectApplied"]);
});
test("locomotion 毀損、阻格與 Dijkstra 預覽不改狀態", () => {
  const ctx = fixture(); person(ctx, "a-pilot").pools.ap!.cur = 2;
  const before = structuredClone(ctx.s), cells = reachable(ctx, "a");
  assert.equal(cells["1,3"], 2); assert.equal(cells["2,1"], undefined); assert.equal(cells["4,4"], undefined);
  assert.deepEqual(ctx.s, before);
  assert.equal(stepCost(ctx, "a", { x: 1, y: 1 }, { x: 2, y: 1 }), null);
  unit(ctx, "a").parts.core!.broken = true;
  assert.equal(locomotionOf(ctx, "a"), null);
  assert.deepEqual(reachable(ctx, "a"), { "1,1": 0 });
});
test("離開敵人鄰格觸發免費 AP 反應，每動作一次", () => {
  const ctx = fixture(d => { d.ability.mode = "reaction"; d.ability.tags = ["melee"]; d.ability.accuracy = 100;
    d.ability.trigger = { event: "enemyLeavesAdjacent", oncePer: "action" }; });
  const ap = person(ctx, "b-pilot").pools.ap!.cur;
  moveAlong(ctx, "a", [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }]);
  assert.equal(person(ctx, "b-pilot").pools.ap!.cur, ap);
  assert.equal(ctx.s.log.events.filter(e => e.type === "AbilityUsed").length, 1);
  assert.ok(unit(ctx, "a").parts.core!.layers[0]!.broken);
});

test("實際移動累積motion，付不起的步伐不計入", () => {
  const ctx = fixture(); person(ctx, "a-pilot").pools.ap!.cur = 1;
  moveAlong(ctx, "a", [{ x: 1, y: 2 }, { x: 1, y: 3 }]);
  assert.deepEqual(unit(ctx, "a").motion, { dx: 0, dy: 1 });
  assert.deepEqual(unit(ctx, "a").pos, { x: 1, y: 2 });
});

test("翼毀後回落健全腿，腿也毀才失去移動，legacy沿舊", () => {
  const ctx = fixture(d => {
    d.frame.tags = ["flight"];
    d.body.parts[0]!.mobility = ["leg"];
    const wing = structuredClone(d.body.parts[0]!); wing.id = "wing"; wing.seats = []; wing.functions = ["locomotion"]; wing.mobility = ["flight"]; d.body.parts.push(wing);
  });
  assert.equal(locomotionOf(ctx, "a"), "flight");
  unit(ctx, "a").parts.wing!.broken = true;
  assert.equal(locomotionOf(ctx, "a"), "leg");
  unit(ctx, "a").parts.core!.broken = true;
  assert.equal(locomotionOf(ctx, "a"), null);
  assert.equal(locomotionOf(fixture(), "a"), "leg");
});

test("整回合多move與AP回復不能繞額度，五級2..6皆保留", () => {
  const path = [{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 1 }, { x: 3, y: 0 }];
  for (const budget of [2, 3, 4, 5, 6]) {
    const level = fixture(d => { d.frame.moveBudget = budget; });
    assert.equal(movementBudget(level, "a").effective, budget);
    moveAlong(level, "a", path);
    assert.equal(unit(level, "a").moveSpent, budget);
    assert.deepEqual(unit(level, "a").pos, path[budget - 1]);
  }
  const ctx = fixture();
  moveAlong(ctx, "a", [{ x: 1, y: 2 }, { x: 1, y: 3 }]);
  person(ctx, "a-pilot").pools.ap!.cur = 9;
  moveAlong(ctx, "a", [{ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }]);
  assert.deepEqual(unit(ctx, "a").pos, { x: 3, y: 3 });
  assert.equal(unit(ctx, "a").moveSpent, 4);
  assert.equal(person(ctx, "a-pilot").pools.ap!.cur, 7);
  assert.equal(movementBudget(ctx, "a").remaining, 0);
  assert.deepEqual(reachable(ctx, "a"), { "3,3": 0 });
});

test("地形成本最少1且query與執行共用，粗地形同時耗AP與移動點", () => {
  const free = fixture(d => { d.terrain.moveCost.leg = 0; });
  assert.equal(stepCost(free, "a", { x: 1, y: 1 }, { x: 1, y: 2 }), 1);
  assert.equal(reachable(free, "a")["1,3"], 2);
  moveAlong(free, "a", [{ x: 1, y: 2 }, { x: 1, y: 3 }]);
  assert.equal(unit(free, "a").moveSpent, 2);
  const rough = fixture(d => { d.terrain.moveCost.leg = 2; });
  moveAlong(rough, "a", [{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }]);
  assert.deepEqual(unit(rough, "a").pos, { x: 1, y: 3 });
  assert.equal(unit(rough, "a").moveSpent, 4);
  assert.equal(person(rough, "a-pilot").pools.ap!.cur, 5);
});

test("完整度只取移動部位結構層，盔甲受損不冒充腿傷", () => {
  const ctx = fixture();
  unit(ctx, "a").parts.core!.layers[0]!.hp = 0;
  assert.equal(movementBudget(ctx, "a").effective, 4);
  unit(ctx, "a").parts.core!.layers[1]!.hp = 10;
  assert.equal(movementBudget(ctx, "a").integrity, 0.5);
  assert.equal(movementBudget(ctx, "a").effective, 3);
  unit(ctx, "a").parts.core!.broken = true;
  assert.equal(movementBudget(ctx, "a").effective, 0);
});

test("未宣告載重容量不罰，超重按真裝配mass扣且壞配件仍有重量", () => {
  for (const capacity of [undefined, 1]) {
    const ctx = fixture(d => { d.frame.moveLoadCapacity = capacity; d.body.parts[0]!.slots = [{ id: "load", type: "weaponMount", size: 9 }]; });
    const component = { ...base.require("component", "component/autocannon-30"), id: "cb:component/weight", mass: 6, pools: [], abilities: [] };
    const original = ctx.db;
    ctx.db = { ...original, require: ((kind: string, id: string) => kind === "component" && id === component.id ? component : original.require(kind as "frame", id)) as typeof original.require };
    unit(ctx, "a").parts.core!.components.load = component.id;
    unit(ctx, "a").parts.core!.layers.push({ hp: 0, broken: true });
    const info = movementBudget(ctx, "a");
    assert.equal(info.mass, 6); assert.equal(info.capacity, capacity ?? null);
    assert.equal(info.loadPenalty, capacity === undefined ? 0 : 1);
    assert.equal(info.effective, capacity === undefined ? 4 : 3);
  }
});

import { createBattle } from "./flow.ts";
test("怪獸species.moveBudget確實傳入合成frame，不掉回default4", () => {
  const species = { ...base.require("species", "species/tidewolf"), moveBudget: 6 };
  const db = { ...base, require: ((kind: string, id: string) => kind === "species" && [species.id, "species/tidewolf"].includes(id) ? species : base.require(kind as "frame", id)) as typeof base.require };
  const s = createBattle(db, { id: "monster-move", map: { width: 3, height: 3, fill: "terrain/plain", exits: [] }, units: [{ id: "beast", owner: "a", pos: { x: 1, y: 1 }, monster: { species: species.id, grade: "D" } }], objectives: [] }, 1);
  assert.equal(movementBudget({ db, s }, "beast").base, 6);
});

test("途中反應毀移動肢後停止，未實走路徑不扣AP或移動點", () => {
  const ctx = fixture(d => {
    d.body.parts[0]!.functions = ["core", "cockpit"]; d.body.parts[0]!.exposure = 0;
    const leg = structuredClone(d.body.parts[0]!); leg.id = "leg"; leg.seats = []; leg.functions = ["locomotion"]; leg.mobility = ["leg"]; leg.exposure = 1; d.body.parts.push(leg);
    d.ability.mode = "reaction"; d.ability.tags = ["melee"]; d.ability.trigger = { event: "enemyLeavesAdjacent", oncePer: "action" }; d.ability.packets[0]!.amount = 100;
  });
  moveAlong(ctx, "a", [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }]);
  assert.equal(unit(ctx, "a").parts.leg!.broken, true);
  assert.deepEqual(unit(ctx, "a").pos, { x: 0, y: 1 });
  assert.equal(unit(ctx, "a").moveSpent, 1);
  assert.equal(person(ctx, "a-pilot").pools.ap!.cur, 8);
  assert.equal(movementBudget(ctx, "a").effective, 0);
});
