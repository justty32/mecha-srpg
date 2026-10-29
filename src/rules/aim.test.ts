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
  const db = createContentDB([{ id: "cb", version: "1", depends: [] }], base.registries, { ...base.rules, constants: { ...base.rules.constants, attackAccuracyBonus: 0 }, moraleEvents: [], injuries: [] },
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


import { aimInfo } from "./aim.ts";
import { hitChance, resolveAbility } from "./attack.ts";
import { checkAbility } from "./command.ts";

test("圓形目標幾何：誤差落體內必100%，指定小部位降低，無5/95夾限", () => {
  const ctx = fixture(d => { d.pilot.attrs.accuracy = 50; d.body.targetRadius = 1; d.body.parts[0]!.targetRadius = 0.5; d.ability.aim = { dispersion: 0.5, trackingDelay: 0.1, projectileSpeed: 20 }; d.ability.partAim!.penalty = 0; });
  unit(ctx, "a").pos = { x: 0, y: 0 }; unit(ctx, "b").pos = { x: 2, y: 0 };
  assert.equal(hitChance(ctx, "a", "ability/test", "b"), 100);
  assert.equal(hitChance(ctx, "a", "ability/test", "b", "core"), 25);
  const info = aimInfo(ctx, "a", "ability/test", "b", "core");
  assert.deepEqual(info.aim, { radius: 0.5, error: 1, distance: 2, lateral: 0, maneuver: 0, cover: 0, skill: 1 });
  resolveAbility(ctx, "a", "ability/test", { unit: "b" });
  assert.equal(ctx.s.log.events.find(e => e.type === "Hit")!.payload.chance, 100);
});

test("靜止/沿射線移動同命中，真橫向移動與主動maneuver才擴誤差", () => {
  const ctx = fixture(d => { d.pilot.attrs.accuracy = 50; d.body.targetRadius = 0.5; });
  unit(ctx, "a").pos = { x: 0, y: 0 }; unit(ctx, "b").pos = { x: 4, y: 0 };
  const still = aimInfo(ctx, "a", "ability/test", "b");
  unit(ctx, "b").motion = { dx: 2, dy: 0 };
  assert.equal(aimInfo(ctx, "a", "ability/test", "b").chance, still.chance);
  unit(ctx, "b").motion = { dx: 0, dy: 2 };
  const moved = aimInfo(ctx, "a", "ability/test", "b");
  assert.equal(moved.aim.lateral, 1.5); assert.ok(moved.chance < still.chance);
  unit(ctx, "b").motion = { dx: 0, dy: 0 };
  person(ctx, "b-pilot").attrsBase.maneuver = 0.75;
  const active = aimInfo(ctx, "a", "ability/test", "b");
  assert.equal(active.aim.maneuver, 0.75); assert.ok(active.chance < still.chance);
  person(ctx, "b-pilot").attrsBase.maneuver = 0;
  person(ctx, "b-pilot").attrsBase.evasion = 1000;
  assert.equal(aimInfo(ctx, "a", "ability/test", "b").chance, still.chance);
});

test("掩體縮小有效半徑，完全遮蔽拒射；r=R=0不算必中", () => {
  const ctx = fixture(d => { d.pilot.attrs.accuracy = 50; d.body.targetRadius = 1; d.terrain.cover = 75; d.ability.aim = { dispersion: 0.5, trackingDelay: 0.1, projectileSpeed: 20 }; });
  unit(ctx, "a").pos = { x: 0, y: 0 }; unit(ctx, "b").pos = { x: 2, y: 0 };
  assert.equal(aimInfo(ctx, "a", "ability/test", "b").aim.radius, 0.5);
  assert.equal(hitChance(ctx, "a", "ability/test", "b"), 25);
  const hidden = fixture(d => { d.terrain.cover = 100; d.terrain.destructible = { hp: 10, becomes: d.terrain.id }; });
  assert.deepEqual(checkAbility(hidden, "a", "ability/test", { unit: "b" }), { code: "bad-target", detail: "fully-covered" });
  assert.equal(checkAbility(hidden, "a", "ability/test", { cell: { x: 2, y: 1 } }), null);
  const zero = fixture(d => { d.body.targetRadius = 0; d.ability.aim = { dispersion: 0, trackingDelay: 0, projectileSpeed: 20 }; });
  assert.equal(hitChance(zero, "a", "ability/test", "b"), 0);
});

test("rooted/immobilized共用移動資格，付費閃身拒絕且已付maneuver不再生效", async () => {
  const { applyEffect } = await import("./effects.ts");
  for (const tag of ["rooted", "immobilized"]) {
    const ctx = fixture(d => {
      d.body.targetRadius = 0.5; d.pilot.attrs.accuracy = 50; d.pilot.attrs.maneuver = 1.5;
      d.effect.scope = "mech"; d.effect.tags = [tag]; d.ability.target.kind = "self"; d.ability.effects = [{ on: "self", apply: [d.effect.id] }]; d.ability.tags = ["maneuver"];
    });
    unit(ctx, "b").motion = { dx: 0, dy: 2 };
    applyEffect(ctx, "effect/test", { unit: "a" }, "test");
    applyEffect(ctx, "effect/test", { unit: "b" }, "test");
    const before = structuredClone(ctx.s);
    assert.deepEqual(checkAbility(ctx, "a", "ability/test", { unit: "a" }), { code: "require-failed", detail: "no-sidestep-space" });
    const info = aimInfo(ctx, "a", "ability/test", "b");
    assert.equal(info.aim.maneuver, 0); assert.equal(info.aim.lateral, 0);
    assert.deepEqual(ctx.s, before);
  }
});

test("非整數chance保留浮點，同一nextFloat實骰不偷偷取整或加第二骰", async () => {
  const { nextFloat } = await import("../core/rng.ts");
  const ctx = fixture(d => { d.pilot.attrs.accuracy = 50; d.body.targetRadius = 0.53; d.ability.aim = { dispersion: 0.5, trackingDelay: 0.1, projectileSpeed: 20 }; });
  unit(ctx, "a").pos = { x: 0, y: 0 }; unit(ctx, "b").pos = { x: 2, y: 0 };
  const expectedRoll = nextFloat(structuredClone(ctx.s.rng)) * 100, chance = hitChance(ctx, "a", "ability/test", "b");
  assert.equal(Number.isInteger(chance), false);
  resolveAbility(ctx, "a", "ability/test", { unit: "b" });
  const event = ctx.s.log.events.find(e => ["Hit", "Miss"].includes(e.type))!;
  assert.equal(event.payload.chance, chance); assert.equal(event.payload.roll, expectedRoll);
  assert.equal(event.type === "Hit", expectedRoll < chance);
});
