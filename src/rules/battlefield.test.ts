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
    slots: [], functions: ["core", "locomotion", "cockpit", "manipulator"], onLayerBroken: {}, onBroken: [], conduct: [],
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


import { tryCommand, previewCommand } from "./command.ts";
import { killUnit } from "./attack.ts";
import { damageTerrain } from "./battlefield.ts";
import { cloneBattleState } from "../core/clone-state.ts";

test("拾取預覽隔離，成功扣1AP套效果，重複拾取原子拒絕", () => {
  const ctx = fixture();
  ctx.s.map.objects = [{ id: "supply", name: "補給", kind: "pickup", at: { x: 1, y: 2 }, effects: ["effect/test"] }];
  const cmd = { kind: "interact" as const, actor: "a", object: "supply" }, before = cloneBattleState(ctx.s);
  const preview = previewCommand(ctx, cmd);
  assert.equal(preview.result.ok, true);
  assert.deepEqual(ctx.s, before);
  assert.equal(tryCommand(ctx, cmd).ok, true);
  assert.equal(person(ctx, "a-pilot").pools.ap!.cur, before.persons["a-pilot"]!.pools.ap!.cur - 1);
  assert.equal(ctx.s.map.objects[0]!.collected, true);
  assert.equal(person(ctx, "a-pilot").effects.length, 1);
  const collected = cloneBattleState(ctx.s);
  assert.equal(tryCommand(ctx, cmd).ok, false);
  assert.deepEqual(ctx.s, collected);
});

test("遠距、缺效果、AP不足皆不改狀態或RNG", () => {
  for (const failure of ["range", "effect", "ap"] as const) {
    const ctx = fixture();
    ctx.s.map.objects = [{ id: "supply", name: "補給", kind: "pickup", at: failure === "range" ? { x: 4, y: 4 } : { x: 1, y: 2 }, effects: [failure === "effect" ? "effect/missing" : "effect/test"] }];
    if (failure === "ap") person(ctx, "a-pilot").pools.ap!.cur = 0;
    const before = cloneBattleState(ctx.s);
    assert.equal(tryCommand(ctx, { kind: "interact", actor: "a", object: "supply" }).ok, false);
    assert.deepEqual(ctx.s, before);
  }
});

test("破壞地物換地形清hp，不覆寫物件，非破壞格不變", () => {
  const ctx = fixture(d => { d.terrain.destructible = { hp: 20, becomes: "terrain/test" }; });
  // 目的地可破壞，故新地形重新初始化hp。
  damageTerrain(ctx, { x: 2, y: 2 }, 12, "a");
  assert.equal(ctx.s.map.featureHp["2,2"], 8);
  damageTerrain(ctx, { x: 2, y: 2 }, 8, "a");
  assert.equal(ctx.s.map.featureHp["2,2"], 20);
  assert.equal(ctx.s.log.events.filter(e => e.type === "FeatureDestroyed").length, 1);
});

test("一般攻擊選地物、ball周邊破壞不靠命中骰", () => {
  const ctx = fixture(d => { d.terrain.destructible = { hp: 20, becomes: "terrain/test" }; });
  const rng = structuredClone(ctx.s.rng);
  assert.equal(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { cell: { x: 2, y: 2 } } }).ok, true);
  assert.equal(ctx.s.map.featureHp["2,2"], 8);
  assert.deepEqual(ctx.s.rng, rng);
  const ball = fixture(d => { d.ability.target.kind = "ball"; d.ability.target.radius = 1; d.terrain.destructible = { hp: 20, becomes: "terrain/test" }; });
  assert.equal(tryCommand(ball, { kind: "useAbility", actor: "a", ability: "ability/test", target: { cell: { x: 3, y: 3 } } }).ok, true);
  assert.equal(Object.keys(ball.s.map.featureHp).length, 9);
  assert.equal(ball.s.map.featureHp["3,3"], 8);
});

test("死亡物件獨立、可複製，重複死亡不重複產生", () => {
  const ctx = fixture(), terrain = [...ctx.s.map.terrain];
  killUnit(ctx, "b", "a"); killUnit(ctx, "b", "a");
  assert.equal(ctx.s.map.objects!.length, 1);
  assert.equal(ctx.s.map.objects![0]!.kind, "wreck");
  assert.equal(ctx.s.map.objects![0]!.sourceUnit, "b");
  assert.deepEqual(ctx.s.map.terrain, terrain);
  const clone = cloneBattleState(ctx.s); clone.map.objects![0]!.at.x = 4;
  assert.notEqual(clone.map.objects![0]!.at.x, ctx.s.map.objects![0]!.at.x);
});

test("三種回收有實益：碎石投擲傷層、殘骸材料不重複", () => {
  const ctx = fixture();
  ctx.s.map.objects = [
    { id: "stone", name: "碎石", kind: "debris", at: { x: 1, y: 2 }, debris: 2 },
    { id: "wreck", name: "殘骸", kind: "wreck", at: { x: 1, y: 2 }, salvage: { "stock:scrap": 2 } },
    { id: "corpse", name: "屍體", kind: "corpse", at: { x: 1, y: 2 }, salvage: { "stock:flesh": 1 } },
  ];
  person(ctx, "a-pilot").pools.ap!.cur = 20;
  for (const object of ["stone", "wreck", "corpse"]) assert.equal(tryCommand(ctx, { kind: "interact", actor: "a", object }).ok, true);
  assert.equal(ctx.s.map.debrisAmmo!.a, 2);
  assert.equal(ctx.s.map.salvage!.length, 2);
  const hp = unit(ctx, "b").parts.core!.layers.reduce((sum, l) => sum + l.hp, 0);
  assert.equal(tryCommand(ctx, { kind: "throwDebris", actor: "a", target: "b" }).ok, true);
  assert.equal(ctx.s.map.debrisAmmo!.a, 1);
  assert.ok(unit(ctx, "b").parts.core!.layers.reduce((sum, l) => sum + l.hp, 0) < hp);
  const before = cloneBattleState(ctx.s);
  assert.equal(tryCommand(ctx, { kind: "interact", actor: "a", object: "corpse" }).ok, false);
  assert.deepEqual(ctx.s, before);
});

test("投石不足彈藥、AP、遠距和LOS拒絕不變更狀態", () => {
  for (const failure of ["ammo", "ap", "range", "los"] as const) {
    const ctx = fixture(d => { if (failure === "los") d.terrain.blocksLos = true; });
    ctx.s.map.debrisAmmo = { a: failure === "ammo" ? 0 : 1 };
    if (failure === "ap") person(ctx, "a-pilot").pools.ap!.cur = 0;
    if (failure === "range") { unit(ctx, "a").pos = { x: 0, y: 0 }; unit(ctx, "b").pos = { x: 4, y: 4 }; }
    if (failure === "los") unit(ctx, "b").pos = { x: 3, y: 1 };
    const before = cloneBattleState(ctx.s);
    assert.equal(tryCommand(ctx, { kind: "throwDebris", actor: "a", target: "b" }).ok, false);
    assert.deepEqual(ctx.s, before);
  }
});

test("真補給增加charge並封頂，滿池及缺池原子拒絕", () => {
  const setup = (charge = true) => fixture(d => {
    d.effect.id = "cb:effect/battlefield-resupply";
    d.effect.scope = "mech";
    d.effect.hooks = { onApply: [{ do: "pool", owner: "mech", pool: "charge", delta: 20 }] };
    if (charge) d.frame.pools = [{ id: "charge", name: "電荷", min: 0, max: 100, capKind: "hard", inverted: false, initial: 90, regen: 0, bands: [] }];
  });
  const ctx = setup();
  ctx.s.map.objects = [{ id: "charge", name: "電荷補給", kind: "pickup", at: { x: 1, y: 2 }, effects: ["effect/battlefield-resupply"] }];
  assert.equal(tryCommand(ctx, { kind: "interact", actor: "a", object: "charge" }).ok, true);
  assert.equal(unit(ctx, "a").pools.charge!.cur, 100);
  for (const full of [true, false]) {
    const bad = setup(full);
    if (full) unit(bad, "a").pools.charge!.cur = 100;
    bad.s.map.objects = [{ id: "charge", name: "補給", kind: "pickup", at: { x: 1, y: 2 }, effects: ["effect/battlefield-resupply"] }];
    const before = cloneBattleState(bad.s);
    assert.equal(tryCommand(bad, { kind: "interact", actor: "a", object: "charge" }).ok, false);
    assert.deepEqual(bad.s, before);
  }
});

test("怪獸死亡產corpse且回收戰果保留真實來源與owner", async () => {
  const state = createBattle(base, { id: "real-corpse", map: { width: 4, height: 4, fill: "terrain/plain", exits: [] }, units: [
    { id: "a", owner: "a", frame: "frame/hound-mk2", pos: { x: 1, y: 1 }, persons: [{ id: "pilot", def: "person/ren-kasai", seat: "pilot" }] },
    { id: "b", owner: "b", monster: { species: "species/tidewolf", grade: "D" }, pos: { x: 2, y: 1 } },
    { id: "c", owner: "b", monster: { species: "species/tidewolf", grade: "D" }, pos: { x: 3, y: 3 } },
  ], objectives: [] }, 42);
  const ctx = { db: base, s: state }; startBattle(ctx);
  assert.equal(rt(state).active, "a");
  killUnit(ctx, "b", "a");
  const corpse = ctx.s.map.objects![0]!;
  assert.equal(corpse.kind, "corpse");
  assert.equal(corpse.salvage!["stock:flesh"], base.rules.constants.battlefieldCorpseSalvage);
  const collected = tryCommand(ctx, { kind: "interact", actor: "a", object: corpse.id });
  assert.equal(collected.ok, true, JSON.stringify(collected));
  // 不綁winner：撤離或失敗也把帶走的材料交營運政策判斷。
  killUnit(ctx, "a", "c");
  assert.equal(rt(ctx.s).outcome!.winner, "b");
  const { battleResult } = await import("./flow.ts");
  const result = battleResult(ctx)!;
  assert.deepEqual(result.loot[0], { fromUnit: "b", owner: "a", collected: true, components: [], materials: corpse.salvage });
});

test("掩體崩塌後命中與preview即時同步新cover", async () => {
  const { hitChance } = await import("./attack.ts");
  const ctx = fixture(d => { d.ability.aim = { dispersion: 2, trackingDelay: 0.1, projectileSpeed: 20 }; d.terrain.cover = 35; d.terrain.destructible = { hp: 20, becomes: "terrain/plain" }; });
  const plain = base.require("terrain", "terrain/plain");
  const original = ctx.db;
  ctx.db = { ...original, get: ((kind: Parameters<typeof original.get>[0], id: string) => kind === "terrain" && [plain.id, "terrain/plain"].includes(id) ? plain : original.get(kind, id)) as typeof original.get,
    require: ((kind: Parameters<typeof original.require>[0], id: string) => kind === "terrain" && [plain.id, "terrain/plain"].includes(id) ? plain : original.require(kind, id)) as typeof original.require };
  const before = hitChance(ctx, "a", "ability/test", "b");
  damageTerrain(ctx, unit(ctx, "b").pos, 20, "a");
  const after = hitChance(ctx, "a", "ability/test", "b");
  assert.ok(after > before);
  const preview = previewCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { unit: "b" } });
  assert.equal(preview.result.ok, true);
  if (preview.result.ok) assert.equal(preview.result.events.find(e => ["Hit", "Miss"].includes(e.type))!.payload.chance, after);
});

test("投石沿用凡鐵外甲倍率與內核零傷害，機甲保留物理精粹語意", () => {
  const setup = (conventional: boolean) => {
    const ctx = fixture(d => { d.frame.tags = ["kaiju"]; });
    unit(ctx, "a").core = !conventional;
    ctx.s.map.debrisAmmo = { a: 3 };
    person(ctx, "a-pilot").pools.ap!.cur = 20;
    return ctx;
  };
  const ctx = setup(true), command = { kind: "throwDebris" as const, actor: "a", target: "b" };
  const amount = base.rules.constants.battlefieldDebrisDamage!;
  const before = cloneBattleState(ctx.s), preview = previewCommand(ctx, command);
  assert.equal(preview.result.ok, true);
  assert.deepEqual(ctx.s, before);
  assert.equal(tryCommand(ctx, command).ok, true);
  assert.deepEqual(ctx.s, preview.state);
  assert.equal(unit(ctx, "b").parts.core!.layers[0]!.hp, 10 - amount * base.rules.constants.conventionalFactor!);
  const target = unit(ctx, "b").parts.core!;
  target.layers[0]!.hp = 0; target.layers[0]!.broken = true;
  assert.equal(tryCommand(ctx, command).ok, true);
  assert.equal(target.layers[1]!.hp, 20);
  assert.equal(rt(ctx.s).unitStatus.b, "active");
  const mech = setup(false), inner = unit(mech, "b").parts.core!;
  inner.layers[0]!.hp = 0; inner.layers[0]!.broken = true;
  assert.equal(tryCommand(mech, command).ok, true);
  assert.equal(inner.layers[1]!.hp, 20 - amount);
});

import { applyPacket } from "./layers.ts";
import { regenTick } from "./pools.ts";
import { applyEffect, removeByTags } from "./effects.ts";
import { createBattle } from "./flow.ts";
import { startBattle } from "./turn.ts";
function bleedingFixture(blood: boolean): Ctx {
  return fixture(d => {
    const arm = structuredClone(d.body.parts[0]!); arm.id = "arm"; arm.seats = []; arm.functions = ["manipulator"]; arm.onBroken = [d.effect.id]; d.body.parts.push(arm);
    d.effect.scope = "part"; d.effect.perPartSeparate = true; d.effect.clock = { kind: "permanent" }; d.effect.tags = ["bleeding"];
    d.effect.contribs = [{ path: "self.pools.blood.regen", op: "add", value: -6, source: d.effect.id }];
    if (blood) d.frame.pools = [{ id: "blood", name: "血", min: 0, max: 100, capKind: "hard", inverted: false, initial: 12, regen: 0, bands: [], vital: true }];
  });
}

test("斷肢才流血，vital耗盡真死且死亡事件只有一次；機械無血跳過", () => {
  const ctx = bleedingFixture(true);
  regenTick(ctx, { unit: "a" }); assert.equal(unit(ctx, "a").pools.blood!.cur, 12);
  applyPacket(ctx, "a", "arm", { type: "kinetic", amount: 30 }, "b");
  assert.equal(unit(ctx, "a").parts.arm!.broken, true);
  assert.equal(unit(ctx, "a").pools.blood!.regen, -6);
  regenTick(ctx, { unit: "a" }); assert.equal(unit(ctx, "a").pools.blood!.cur, 6);
  regenTick(ctx, { unit: "a" }); assert.equal(rt(ctx.s).unitStatus.a, "dead");
  regenTick(ctx, { unit: "a" });
  assert.equal(ctx.s.log.events.filter(e => e.type === "UnitDied" && e.payload.unit === "a").length, 1);
  const mechanical = bleedingFixture(false);
  assert.doesNotThrow(() => applyPacket(mechanical, "a", "arm", { type: "kinetic", amount: 30 }, "b"));
  assert.equal(unit(mechanical, "a").effects.length, 0);
  assert.equal(rt(mechanical.s).unitStatus.a, "active");
});

test("止血移除part傷勢與負regen，不回血或長回肢體", () => {
  const ctx = bleedingFixture(true);
  applyPacket(ctx, "a", "arm", { type: "kinetic", amount: 30 }, "b");
  regenTick(ctx, { unit: "a" });
  assert.equal(removeByTags(ctx, { unit: "a" }, ["bleeding"]), 1);
  assert.equal(unit(ctx, "a").pools.blood!.regen, 0);
  regenTick(ctx, { unit: "a" });
  assert.equal(unit(ctx, "a").pools.blood!.cur, 6);
  assert.equal(unit(ctx, "a").parts.arm!.broken, true);
});

test("器官映射真的禁技能，無手拒碎石但可收材料", () => {
  const ctx = fixture(d => { d.body.abilityParts = { [d.ability.id]: { parts: ["core"], min: 1 } }; });
  assert.equal(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { unit: "b" } }).ok, true);
  unit(ctx, "a").parts.core!.broken = true;
  const before = cloneBattleState(ctx.s);
  assert.equal(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: "ability/test", target: { unit: "b" } }).ok, false);
  assert.deepEqual(ctx.s, before);
  ctx.s.map.objects = [{ id: "stone", name: "石", kind: "debris", at: { x: 1, y: 2 }, debris: 1 }, { id: "scrap", name: "料", kind: "wreck", at: { x: 1, y: 2 }, salvage: { scrap: 1 } }];
  assert.equal(tryCommand(ctx, { kind: "interact", actor: "a", object: "stone" }).ok, false);
  assert.equal(tryCommand(ctx, { kind: "interact", actor: "a", object: "scrap" }).ok, true);
});
