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

import { conduct, conductRules } from "./conduct.ts";
import { applyEffect } from "./effects.ts";
import { onSignal } from "./hooks.ts";
test("DC-C04 傳導依 when／layer 匹配且只給 pilot", () => {
  const ctx = fixture(d => { d.body.parts[0]!.conduct = [{ when: "layerHit", layer: "cockpit-shell", to: "pilot", effects: [d.effect.id] }]; });
  const info = { damageType: "kinetic", amount: 7, conductBonus: 0 };
  conduct(ctx, "b", "core", "layerBroken", "cockpit-shell", info);
  conduct(ctx, "b", "core", "layerHit", "armor", info);
  assert.equal(ctx.s.log.events.length, 0);
  conduct(ctx, "b", "core", "layerHit", "cockpit-shell", info);
  assert.equal(person(ctx, "b-pilot").effects.length, 1); assert.equal(person(ctx, "a-pilot").effects.length, 0);
  assert.deepEqual(ctx.s.log.events.find(e => e.type === "Conducted")!.payload, { unit: "b", part: "core", person: "b-pilot", when: "layerHit", layerType: "cockpit-shell" });
});
test("PW-11 conducted 信號包含 amount，機體效果追加傳導規則", () => {
  const ctx = fixture(d => { d.effect.scope = "mech"; d.effect.conduct = [{ when: "partBroken", to: "allSeats", effects: [] }]; });
  applyEffect(ctx, "effect/test", { unit: "b" }, "a");
  assert.equal(conductRules(ctx, "b", "core").length, 1);
  let amount = -1;
  onSignal("conducted", "cb-test-amount", 0, (c, p) => { if (c === ctx) amount = Number(p.amount); });
  conduct(ctx, "b", "core", "partBroken", null, { damageType: "kinetic", amount: 13, conductBonus: 0 });
  assert.equal(amount, 13); assert.equal(ctx.s.log.events.filter(e => e.type === "Conducted").length, 1);
});
test("chance 與 conductBonus；不存在的座位不觸發", () => {
  const ctx = fixture(d => { d.body.parts[0]!.conduct = [
    { when: "layerHit", to: "pilot", effects: [], chance: 0 },
    { when: "layerHit", to: "soul", effects: [] }]; });
  conduct(ctx, "b", "core", "layerHit", "armor", { damageType: "kinetic", amount: 4, conductBonus: 0 });
  assert.equal(ctx.s.log.events.length, 0);
  conduct(ctx, "b", "core", "layerHit", "armor", { damageType: "kinetic", amount: 4, conductBonus: 1 });
  assert.equal(ctx.s.log.events.filter(e => e.type === "Conducted").length, 1);
});
