import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import type { Grade } from "../core/types-def.ts";
import { makeUnit, newRuntime, rt, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { damageFactor, modifiedAmount, resolveAbility } from "./attack.ts";
import { applyPacket, isDead, runLayers } from "./layers.ts";
import { applyEffect } from "./effects.ts";
import { attackKind, damageBonus, resistance, weaponEssence } from "./resistance.ts";

const db = loadContentDirs(["content/base"]).db;
const packet = { type: "kinetic", amount: 100 };
function battle(frame: string, monster: { species: string; grade: Grade }): Ctx {
  const ctx: Ctx = { db, s: { round: 1, rng: createRng(1), map: { def: "test", width: 3, height: 3, terrain: Array(9).fill("base:terrain/plain"), featureHp: {} },
    units: {}, persons: {}, order: [], knowledge: {}, pending: [], factions: {}, log: createLog(), rt: newRuntime() } };
  makeUnit(ctx, { id: "a", frame, crew: "remote", owner: "player", pos: { x: 0, y: 0 } });
  makeUnit(ctx, { id: "b", monster, owner: "enemy", pos: { x: 1, y: 0 } });
  return ctx;
}

test("抵抗性：精粹等級每低一級減半，同級與高級全額（武器等級缺省取機體等級）", () => {
  // hound-mk2 是 C 級機體；同一招打不同等級的獸。
  const expect: [Grade, number][] = [["D", 100], ["C", 100], ["B", 50], ["A", 25], ["S", 12.5]];
  for (const [grade, amount] of expect) {
    const ctx = battle("frame/hound-mk2", { species: "species/tidewolf", grade });
    assert.equal(weaponEssence(ctx, "a", "ability/mx-frame-strike"), "C");
    assert.equal(modifiedAmount(ctx, "a", "ability/mx-frame-strike", packet, "b"), amount, `C 打 ${grade}`);
    assert.equal(resistance(ctx, "a", "ability/mx-frame-strike", "b")?.reach, undefined);
  }
  // D 級機體打 B 級獸：低兩級 ×0.25。
  assert.equal(modifiedAmount(battle("frame/bulwark-i", { species: "species/tidewolf", grade: "B" }), "a", "ability/mx-frame-strike", packet, "b"), 25);
});

test("抵抗性：能力宣告 essence 覆蓋機體等級；只對 kaiju，打機甲全額", () => {
  const ctx = battle("frame/bulwark-i", { species: "species/tidewolf", grade: "B" });
  const strike = { ...db.require("ability", "ability/mx-frame-strike"), essence: "B" as Grade };
  const withEssence: Ctx = { s: ctx.s, db: { ...db, require: ((kind: string, id: string) =>
    kind === "ability" && db.require("ability", id).id === strike.id ? strike : db.require(kind as "ability", id)) as typeof db.require } };
  assert.equal(weaponEssence(withEssence, "a", "ability/mx-frame-strike"), "B");
  assert.equal(modifiedAmount(withEssence, "a", "ability/mx-frame-strike", packet, "b"), 100);
  assert.equal(modifiedAmount(ctx, "a", "ability/mx-frame-strike", packet, "b"), 25);
  makeUnit(ctx, { id: "c", frame: "frame/selene-eclipse-moonless", crew: "remote", owner: "enemy", pos: { x: 2, y: 2 } });
  assert.equal(resistance(ctx, "a", "ability/mx-frame-strike", "c"), null);
  assert.equal(modifiedAmount(ctx, "a", "ability/mx-head-vulcan", packet, "c"), 100);
});

test("凡鐵：外甲 ×conventionalFactor、內層與核 0，打再多次也殺不了獸", () => {
  const ctx = battle("frame/hound-mk2", { species: "species/hound", grade: "D" });
  const r = resistance(ctx, "a", "ability/mx-head-vulcan", "b")!;
  assert.equal(weaponEssence(ctx, "a", "ability/mx-head-vulcan"), null);
  assert.equal(r.factor, 0.1);
  assert.deepEqual(r.reach, ["armor", "chitin", "resonant-shell"]);
  assert.equal(modifiedAmount(ctx, "a", "ability/mx-head-vulcan", packet, "b"), 10);
  // 打穿外甲後剩下的量不進肉；外甲已毀時一點都進不去。
  const heart = () => unit(ctx, "b").parts.heart!.layers;
  for (let i = 0; i < 20; i++) applyPacket(ctx, "b", "heart", { type: "kinetic", amount: 1000 * r.factor, armorPen: 0.5, reach: r.reach }, "a");
  assert.equal(heart()[0]!.broken, true);
  assert.deepEqual(heart().slice(1).map(l => l.hp), [40, 50]);
  assert.equal(isDead(ctx, "b"), false);
  // 無核心機（鐵偶）的精粹武器也算凡鐵。
  unit(ctx, "a").core = false;
  assert.equal(resistance(ctx, "a", "ability/mx-frame-strike", "b")?.factor, 0.1);
  // 實際結算：反覆命中，心臟的肉與核維持滿血。
  const live = battle("frame/hound-mk2", { species: "species/hound", grade: "D" });
  unit(live, "b").pos = { x: 2, y: 0 };
  for (let i = 0; i < 40; i++) resolveAbility(live, "a", "ability/mx-iron-burst", { unit: "b", part: "heart" });
  const hits = live.s.log.events.filter(e => e.type === "LayerDamaged" && e.payload.unit === "b");
  assert.ok(hits.length > 0);
  assert.ok(hits.every(e => ["chitin"].includes(e.payload.layerType as string)), "凡鐵只傷外甲");
  assert.deepEqual(unit(live, "b").parts.heart!.layers.slice(1).map(l => l.hp), [40, 50]);
  assert.equal(isDead(live, "b"), false);
});

test("runLayers reach：碰到不在清單的層即停，layerFilter 不能繞過", () => {
  const layer = (type: string, hp: number) => ({ def: { type, hp, ablative: true, resist: {}, passThrough: {}, structural: true }, hp, broken: false });
  const out = runLayers([layer("chitin", 5), layer("flesh", 50), layer("organ", 20)], { type: "kinetic", amount: 30, reach: ["chitin"] });
  assert.deepEqual(out.layers.map(l => l.hp), [0, 50, 20]);
  assert.equal(out.remaining, 0);
  const skip = runLayers([layer("chitin", 5), layer("flesh", 50)], { type: "kinetic", amount: 30, reach: ["chitin"], layerFilter: ["flesh"] });
  assert.deepEqual(skip.layers.map(l => l.hp), [5, 50]);
});

test("情境 rules.conventionalFactor 覆蓋凡鐵外甲倍率", () => {
  const ctx = battle("frame/hound-mk2", { species: "species/hound", grade: "D" });
  rt(ctx.s).conventionalFactor = 0.3;
  assert.equal(modifiedAmount(ctx, "a", "ability/mx-head-vulcan", packet, "b"), 30);
});

test("強化打擊／強化遠程：近戰與遠程分開增傷，暫值在效果檔", () => {
  const ctx = battle("frame/hound-mk2", { species: "species/tidewolf", grade: "C" });
  assert.equal(attackKind(ctx, "a", "ability/mx-frame-strike"), "melee");
  assert.equal(attackKind(ctx, "a", "ability/mx-head-vulcan"), "ranged");
  const melee = db.require("effect", "effect/pa-melee-boost").contribs[0]!.value as number;
  const ranged = db.require("effect", "effect/pa-ranged-boost").contribs[0]!.value as number;
  applyEffect(ctx, "effect/pa-melee-boost", { unit: "a" }, "a");
  assert.equal(damageBonus(ctx, "a", "ability/mx-frame-strike"), melee);
  assert.equal(damageBonus(ctx, "a", "ability/mx-head-vulcan"), 1);
  assert.equal(damageFactor(ctx, "a", "ability/mx-frame-strike", "b"), melee);
  applyEffect(ctx, "effect/pa-ranged-boost", { unit: "a" }, "a");
  assert.equal(damageBonus(ctx, "a", "ability/mx-head-vulcan"), ranged);
  assert.ok(melee > 1 && ranged > 1);
});
