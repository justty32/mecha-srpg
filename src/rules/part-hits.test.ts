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


import { resolveAbility } from "./attack.ts";
import { applyPartHits, partHitInfo } from "./part-hits.ts";
import { nextFloat } from "../core/rng.ts";
import { previewCommand, tryCommand } from "./command.ts";
function bodyFixture(edit?: (d: Parameters<NonNullable<Parameters<typeof fixture>[0]>>[0]) => void): Ctx {
  return fixture(d => {
    d.body.targetRadius = 2;
    d.body.parts[0]!.layers = [{ type: "armor", hp: 100, ablative: true, structural: true, resist: {}, passThrough: {} }];
    d.ability.partAim!.penalty = 0; d.ability.packets = [{ type: "kinetic", amount: 100 }];
    for (const id of ["arm", "leg", "remote"]) { const p = structuredClone(d.body.parts[0]!); p.id = id; p.seats = []; p.functions = []; d.body.parts.push(p); }
    d.body.partAdjacency = { core: ["arm", "leg"] };
    edit?.(d);
  });
}
const health = (ctx: Ctx, part: string) => unit(ctx, "b").parts[part]!.layers.reduce((sum, l) => sum + l.hp, 0);
const damage = (ctx: Ctx) => ctx.s.log.events.filter(e => e.type === "LayerDamaged").reduce((sum, e) => sum + Number(e.payload.amount), 0);

test("spread保留一份總預算，分兩三部位，missing鄰居份額丟棄", () => {
  const ctx = bodyFixture(d => { d.ability.partPattern = { kind: "spread", fractions: [0.5, 0.3, 0.2], selection: "adjacent" }; });
  resolveAbility(ctx, "a", "ability/test", { unit: "b", part: "core" });
  assert.deepEqual([health(ctx, "core"), health(ctx, "arm"), health(ctx, "leg"), health(ctx, "remote")], [50, 70, 80, 100]);
  assert.equal(damage(ctx), 100);
  assert.equal(ctx.s.log.events.filter(e => e.type === "Hit").length, 1);
  const missing = bodyFixture(d => { d.body.partAdjacency = {}; d.ability.partPattern = { kind: "spread", fractions: [0.5, 0.5], selection: "adjacent" }; });
  resolveAbility(missing, "a", "ability/test", { unit: "b", part: "arm" });
  assert.equal(damage(missing), 50); assert.equal(health(missing, "core"), 100);
});

test("多部位crit只擲一次，未宣告pattern保持一處；preview與實判同源", () => {
  const ctx = bodyFixture(d => { d.ability.partPattern = { kind: "spread", fractions: [0.5, 0.3, 0.2], selection: "exposed" }; d.ability.packets[0]!.crit = 1; });
  const before = structuredClone(ctx.s), rng = structuredClone(ctx.s.rng);
  nextFloat(rng); nextFloat(rng); // 一次命中＋一次crit；指定主位不另選part。
  const cmd = { kind: "useAbility" as const, actor: "a", ability: "ability/test", target: { unit: "b", part: "core" } };
  const preview = previewCommand(ctx, cmd); assert.equal(preview.result.ok, true); assert.deepEqual(ctx.s, before);
  assert.equal(tryCommand(ctx, cmd).ok, true); assert.deepEqual(ctx.s, preview.state);
  assert.deepEqual(ctx.s.rng, rng); assert.equal(damage(ctx), 150);
  const single = bodyFixture(); resolveAbility(single, "a", "ability/test", { unit: "b", part: "arm" });
  assert.equal(health(single, "core"), 100); assert.equal(health(single, "leg"), 100);
});

test("penetrate只用真remaining與falloff，無圖/抵抗阻隔/吸收完都不跳遠端", () => {
  const ctx = bodyFixture(d => { d.body.parts.find(p => p.id === "arm")!.layers[0]!.hp = 10; d.ability.partPattern = { kind: "penetrate", maxParts: 3, falloff: 0.5, selection: "adjacent" }; d.ability.packets[0]!.amount = 30; });
  resolveAbility(ctx, "a", "ability/test", { unit: "b", part: "arm" });
  assert.equal(health(ctx, "arm"), 0); assert.equal(health(ctx, "core"), 90); assert.equal(health(ctx, "remote"), 100);
  const missing = bodyFixture(d => { d.body.partAdjacency = {}; d.body.parts.find(p => p.id === "arm")!.layers[0]!.hp = 10; d.ability.partPattern = { kind: "penetrate", maxParts: 3, falloff: 1, selection: "adjacent" }; });
  resolveAbility(missing, "a", "ability/test", { unit: "b", part: "arm" }); assert.equal(health(missing, "core"), 100);
  const blocked = bodyFixture();
  applyPartHits(blocked, "a", "b", "arm", { type: "kinetic", amount: 100, reach: ["chitin"] }, { kind: "penetrate", maxParts: 3, falloff: 1, selection: "adjacent" });
  assert.equal(damage(blocked), 0); assert.equal(health(blocked, "core"), 100);
});

test("穿透visited不重打部位，maxParts封頂，ordinary query不預測隨機主位", () => {
  const ctx = bodyFixture(d => { d.body.partAdjacency = { arm: ["leg"], leg: ["remote"], remote: ["arm"] }; for (const p of d.body.parts.filter(p => p.id !== "core")) p.layers[0]!.hp = 5; });
  const pattern = { kind: "penetrate" as const, maxParts: 2 as const, falloff: 0.5, selection: "adjacent" as const };
  applyPartHits(ctx, "a", "b", "arm", { type: "kinetic", amount: 100 }, pattern);
  assert.equal(ctx.s.log.events.filter(e => e.type === "PartHit").length, 2);
  assert.equal(health(ctx, "remote"), 5);
  const ordinary = partHitInfo(ctx, "b", undefined, pattern);
  assert.deepEqual(ordinary.partHits, []); assert.equal(ordinary.maxParts, 2);
});

import "./flow.ts";
test("盾先承傷：完整吸收後方零傷，穿出只將remaining衰減送原入口", () => {
  const defense = { kind: "block" as const, part: "arm", charges: 2, applies: true, overloaded: false, damageFactor: 1 };
  const pattern = { kind: "penetrate" as const, maxParts: 2 as const, falloff: 0.5, selection: "adjacent" as const };
  const held = bodyFixture(d => { d.body.partAdjacency = {}; });
  applyPartHits(held, "a", "b", "core", { type: "kinetic", amount: 30 }, pattern, defense);
  assert.equal(health(held, "arm"), 70); assert.equal(health(held, "core"), 100);
  const passed = bodyFixture(d => { d.body.partAdjacency = {}; });
  const plan = partHitInfo(passed, "b", "core", pattern, defense);
  assert.deepEqual(plan.partHits.map(p => [p.part, p.primary, p.conditional]), [["arm", true, false], ["core", false, true]]);
  applyPartHits(passed, "a", "b", "core", { type: "kinetic", amount: 150 }, pattern, defense);
  assert.equal(health(passed, "arm"), 0); assert.equal(health(passed, "core"), 75); assert.equal(health(passed, "leg"), 100);
});

test("多部位的hit/always每unit一次，核心死立即停止旁波且死亡一次", () => {
  const debuff = bodyFixture(d => { d.ability.partPattern = { kind: "spread", fractions: [0.5, 0.3, 0.2], selection: "exposed" }; d.effect.stack.policy = "separate"; d.ability.effects = [{ on: "hit", apply: [d.effect.id] }, { on: "always", apply: [d.effect.id] }]; });
  resolveAbility(debuff, "a", "ability/test", { unit: "b", part: "core" });
  assert.equal(person(debuff, "b-pilot").effects.length, 2);
  const killed = bodyFixture(d => { d.ability.partPattern = { kind: "spread", fractions: [0.5, 0.3, 0.2], selection: "exposed" }; d.ability.packets[0]!.amount = 300; });
  resolveAbility(killed, "a", "ability/test", { unit: "b", part: "core" });
  assert.equal(rt(killed.s).unitStatus.b, "dead"); assert.equal(health(killed, "arm"), 100);
  assert.equal(killed.s.log.events.filter(e => e.type === "UnitDied").length, 1);
});
