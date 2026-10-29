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

import { computeOrder, initiativeOf, startBattle, beginTurn, endTurn, advance, currentActor } from "./turn.ts";
import { tryCommand } from "./command.ts";
import { applyEffect } from "./effects.ts";
import { onSignal } from "./hooks.ts";
test("排序同分 id 字典序與 fatigue 修正，不重複加 frame", () => {
  const ctx = fixture();
  assert.deepEqual(computeOrder(ctx), ["a", "b"]); assert.equal(initiativeOf(ctx, "a"), 15);
  person(ctx, "a-pilot").pools.fatigue!.cur = 20;
  assert.equal(initiativeOf(ctx, "a"), 13); assert.deepEqual(computeOrder(ctx), ["b", "a"]);
});
test("DC-T06 Wait 一輪一次、移隊尾且恢復不再更新資源", () => {
  const ctx = fixture(); person(ctx, "a-pilot").pools.ap!.cur = 3;
  assert.equal(tryCommand(ctx, { kind: "wait", actor: "a" }).ok, true);
  assert.deepEqual(ctx.s.order, ["b", "a"]); assert.equal(currentActor(ctx.s), "b");
  endTurn(ctx);
  assert.equal(currentActor(ctx.s), "a"); assert.equal(person(ctx, "a-pilot").pools.ap!.cur, 3);
  assert.deepEqual(tryCommand(ctx, { kind: "wait", actor: "a" }), { ok: false, rejection: { code: "wait-used" } });
  assert.equal(ctx.s.log.events.filter(e => e.type === "TurnStart").at(-1)!.payload.resumed, true);
});
test("ownerTurns 效果在資源更新前撤除", () => {
  const ctx = fixture(d => { d.effect.contribs = [{ path: "self.pools.ap.regen", op: "set", value: 0, source: "test" }]; });
  person(ctx, "a-pilot").pools.ap!.cur = 0;
  applyEffect(ctx, "effect/test", { person: "a-pilot" }, "test");
  beginTurn(ctx, "a", false);
  assert.equal(person(ctx, "a-pilot").pools.ap!.cur, 9);
  const events = ctx.s.log.events;
  assert.ok(events.findIndex(e => e.type === "EffectExpired") < events.findIndex(e => e.type === "PoolChanged" && e.payload.pool === "ap"));
});
test("輪始事件、輪末信號定局後停止 advance", () => {
  const ctx = fixture(); ctx.s.round = 0; rt(ctx.s).active = null;
  onSignal("roundEnd", "cb-turn-stop", 0, c => { if (c === ctx) rt(c.s).outcome = { winner: "a", reason: "test" }; });
  startBattle(ctx);
  assert.equal(ctx.s.round, 1); assert.equal(currentActor(ctx.s), "a");
  assert.deepEqual(ctx.s.log.events.slice(0, 3).map(e => e.type), ["BattleStart", "RoundStart", "TurnStart"]);
  endTurn(ctx); endTurn(ctx);
  const count = ctx.s.log.events.length; advance(ctx);
  assert.equal(currentActor(ctx.s), null); assert.equal(ctx.s.log.events.length, count);
});

test("自身新回合清motion，wait恢復同回合不先清掉", () => {
  const ctx = fixture(); unit(ctx, "a").motion = { dx: 1, dy: 2 }; unit(ctx, "a").moveSpent = 3;
  beginTurn(ctx, "a", true);
  assert.deepEqual(unit(ctx, "a").motion, { dx: 1, dy: 2 });
  assert.equal(unit(ctx, "a").moveSpent, 3);
  beginTurn(ctx, "a", false);
  assert.deepEqual(unit(ctx, "a").motion, { dx: 0, dy: 0 });
  assert.equal(unit(ctx, "a").moveSpent, 0);
});
