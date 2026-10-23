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

import { locomotionOf, stepCost, moveAlong, reachable } from "./movement.ts";
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
