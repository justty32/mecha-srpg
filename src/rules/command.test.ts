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

import { tryCommand, previewCommand, abilitiesOf, checkAbility, resolveCosts } from "./command.ts";
import { commandHandler } from "./hooks.ts";
test("① require 與 actor 拒絕完全不扣費、不耗 RNG", () => {
  const ctx = fixture(d => { d.ability.require = [{ tag: "unavailable" }]; });
  const before = structuredClone(ctx.s);
  assert.deepEqual(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { unit: "b" } }), { ok: false, rejection: { code: "require-failed" } });
  assert.deepEqual(tryCommand(ctx, { kind: "end", actor: "b" }), { ok: false, rejection: { code: "not-active" } });
  assert.deepEqual(ctx.s, before);
});
test("② 範圍、部位、LOS 拒絕不扣任何東西", () => {
  for (const reason of ["out-of-range", "bad-part", "no-los"] as const) {
    const ctx = fixture(d => { if (reason === "out-of-range") d.ability.target.range.max = 0;
      if (reason === "no-los") d.terrain.blocksLos = true; });
    if (reason === "no-los") unit(ctx, "b").pos = { x: 3, y: 1 };
    const before = structuredClone(ctx.s);
    assert.deepEqual(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { unit: "b", ...(reason === "bad-part" ? { part: "missing" } : {}) } }), { ok: false, rejection: { code: reason } });
    assert.deepEqual(ctx.s, before);
  }
});
test("③ 所有成本一起判斷，缺池／不足拒絕且查詢無副作用", () => {
  const ctx = fixture(d => { d.ability.costs.push({ owner: "mech", pool: "missing", amount: 1 }); });
  const before = structuredClone(ctx.s);
  assert.deepEqual(abilitiesOf(ctx, "a"), ["cb:ability/test"]);
  assert.deepEqual(resolveCosts(ctx, "a", "ability/test").map(c => c.amount), [2, 1]);
  assert.deepEqual(checkAbility(ctx, "a", "ability/test", { unit: "b" }), { code: "cannot-pay" });
  assert.deepEqual(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { unit: "b" } }), { ok: false, rejection: { code: "cannot-pay" } });
  assert.deepEqual(ctx.s, before);
});
test("④ 未命中不退費、冷卻與次數入帳，preview 不改原狀態", () => {
  const ctx = fixture(d => { d.ability.aim = { dispersion: 100, trackingDelay: 0.1, projectileSpeed: 20 }; d.ability.cooldown = 2; d.ability.usesPerBattle = 1; });
  const before = structuredClone(ctx.s);
  const cmd = { kind: "useAbility" as const, actor: "a", ability: "ability/test", target: { unit: "b" } };
  const preview = previewCommand(ctx, cmd);
  assert.deepEqual(ctx.s, before); assert.equal(preview.result.ok, true);
  const result = tryCommand(ctx, cmd); assert.equal(result.ok, true);
  assert.deepEqual(ctx.s, preview.state); assert.equal(person(ctx, "a-pilot").pools.ap!.cur, 7);
  assert.equal(unit(ctx, "a").cooldowns["cb:ability/test"], 2);
  assert.ok(ctx.s.log.events.some(e => e.type === "Miss"));
  assert.deepEqual(checkAbility(ctx, "a", "ability/test", { unit: "b" }), { code: "cooldown" });
  unit(ctx, "a").cooldowns["cb:ability/test"] = 0;
  assert.deepEqual(checkAbility(ctx, "a", "ability/test", { unit: "b" }), { code: "uses-exhausted" });
});
test("未登記的 eject 回 unsupported，非法路徑不動狀態", () => {
  const ctx = fixture(), before = structuredClone(ctx.s);
  // 本檔不載入 people-flow；登記表的缺席本身就是契約案例。
  if (!commandHandler("eject")) assert.deepEqual(tryCommand(ctx, { kind: "eject", actor: "a" }), { ok: false, rejection: { code: "unsupported" } });
  assert.deepEqual(tryCommand(ctx, { kind: "move", actor: "a", path: [{ x: 4, y: 4 }] }), { ok: false, rejection: { code: "bad-path" } });
  assert.deepEqual(ctx.s, before);
});
