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

import { hitChance, pickPart, modifiedAmount, resolveAbility } from "./attack.ts";
test("self 能力必中且不消耗命中 RNG，無單位目標也不擲命中骰", () => {
  const ctx = fixture(d => { d.ability.target = { kind: "self", range: { min: 0, max: 0 }, los: false, friendly: "yes" }; d.ability.packets = []; });
  const before = structuredClone(ctx.s.rng);
  assert.equal(hitChance(ctx, "a", "ability/test", "a"), 100);
  resolveAbility(ctx, "a", "ability/test", { part: "core" });
  assert.deepEqual(ctx.s.rng, before);
  assert.equal(ctx.s.log.events.filter(e => e.type === "Hit").length, 1);
  const empty = fixture(d => { d.ability.target.kind = "cell"; d.ability.packets = []; });
  const emptyRng = structuredClone(empty.s.rng);
  resolveAbility(empty, "a", "ability/test", { cell: { x: 4, y: 4 } });
  assert.deepEqual(empty.s.rng, emptyRng);
  assert.equal(empty.s.log.events.some(e => e.type === "Hit" || e.type === "Miss"), false);
});
test("命中夾在 5..95，指定部位懲罰", () => {
  const ctx = fixture();
  assert.equal(hitChance(ctx, "a", "ability/test", "b"), 70);
  assert.equal(hitChance(ctx, "a", "ability/test", "b", "core"), 60);
  person(ctx, "a-pilot").attrsBase.accuracy = 1000;
  assert.equal(hitChance(ctx, "a", "ability/test", "b"), 95);
  person(ctx, "a-pilot").attrsBase.accuracy = -1000;
  assert.equal(hitChance(ctx, "a", "ability/test", "b"), 5);
});
test("未指定依 exposure 抽、忽略已毀部位、指定不耗 RNG", () => {
  const ctx = fixture(d => { const leg = structuredClone(d.body.parts[0]!); leg.id = "leg"; leg.exposure = 3; leg.seats = []; d.body.parts.push(leg); });
  const before = structuredClone(ctx.s.rng);
  assert.equal(pickPart(ctx, "b", "core"), "core"); assert.deepEqual(ctx.s.rng, before);
  assert.equal(pickPart(ctx, "b"), "leg");
  unit(ctx, "b").parts.leg!.broken = true;
  assert.equal(pickPart(ctx, "b"), "core");
});
test("DN-W-14 conventional-arms 對 kaiju 十分之一，修正後才暴擊", () => {
  const ctx = fixture(d => { d.frame.tags = ["kaiju"]; d.ability.tags = ["conventional-arms"]; });
  assert.equal(modifiedAmount(ctx, "a", "ability/test", { type: "kinetic", amount: 100 }, "b"), 10);
  assert.equal(modifiedAmount(ctx, "a", "ability/test", { type: "kinetic", amount: 100, crit: 1 }, "b"), 10 * base.rules.constants.critFactor!);
  assert.equal(modifiedAmount(ctx, "a", null, { type: "kinetic", amount: 100 }, "b"), 100);
});
test("命中多 packet 立即跳過擊穿層，死亡事件一次且可重播", () => {
  const ctx = fixture(d => { d.ability.accuracy = 100; d.ability.packets = [{ type: "kinetic", amount: 12 }, { type: "kinetic", amount: 30 }]; });
  const copy: Ctx = { db: ctx.db, s: structuredClone(ctx.s) };
  resolveAbility(ctx, "a", "ability/test", { unit: "b", part: "core" });
  resolveAbility(copy, "a", "ability/test", { unit: "b", part: "core" });
  assert.deepEqual(ctx.s, copy.s);
  assert.equal(rt(ctx.s).unitStatus.b, "dead");
  assert.equal(ctx.s.log.events.filter(e => e.type === "UnitDied").length, 1);
  assert.deepEqual(ctx.s.log.events.filter(e => e.type === "LayerDamaged").map(e => e.payload.layer), [0, 1, 1]);
});


test("無核心凡鐵對 kaiju 傷害 ×0.1，有核心遙控保留武器傷害", () => {
  const db = loadContentDirs(["content/base"]).db;
  const ctx: Ctx = { db, s: { round: 1, rng: createRng(1), map: { def: "test", width: 3, height: 3, terrain: Array(9).fill("base:terrain/plain"), featureHp: {} },
    units: {}, persons: {}, order: [], knowledge: {}, pending: [], factions: {}, log: createLog(), rt: newRuntime() } };
  makeUnit(ctx, { id: "a", frame: "frame/hound-mk2", crew: "remote", owner: "player", pos: { x: 0, y: 0 } });
  makeUnit(ctx, { id: "b", monster: { species: "species/tidewolf", grade: "C" }, owner: "enemy", pos: { x: 1, y: 0 } });
  const packet = { type: "kinetic", amount: 100 };
  const driven = modifiedAmount(ctx, "a", "ability/mx-frame-strike", packet, "b");
  unit(ctx, "a").core = false;
  assert.equal(modifiedAmount(ctx, "a", "ability/mx-frame-strike", packet, "b"), driven * 0.1);
});
