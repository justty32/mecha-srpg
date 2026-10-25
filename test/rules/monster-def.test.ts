import test from "node:test";
import assert from "node:assert/strict";
import { loadPacks, readPackDir } from "../../src/content/loader.ts";
import { canonicalJson, fnv1a64 } from "../../src/core/eventlog.ts";
import { evalNum } from "../../src/core/numexpr.ts";
import { abilitiesOf, battleResult, capture, createBattle, evalCtxFor, frameView, makePerson, partDefs, rt, unitAttr, unitTags } from "../../src/rules/index.ts";
import type { BattleSetup } from "../../src/rules/index.ts";

const pack = readPackDir("content/base");
const original = loadPacks([pack]).db;
const body = original.require("bodyplan", original.require("species", "species/hound").bodyPlan);
const layers = body.parts[0]!.layers.map(l => ({ ...l, hp: l.hp + 17 }));
pack.files["monsters/engine-test.json"] = { id: "monster/engine-test", species: "species/hound", grade: "C",
  partsOverride: [{ id: body.parts[0]!.id, layers, name: "覆寫部位", conduct: [] }],
  extraAbilities: ["ability/restrain", "ability/restrain"], tags: ["engine-test", "kaiju"],
  attrMods: [{ source: "ability/restrain", path: "self.attrs.accuracy", op: "add", value: { product: [3, 2] } }] };
const loaded = loadPacks([pack]), db = loaded.db;
assert.deepEqual(loaded.errors, []);
function setup(withDef = true): BattleSetup {
  return { id: "monster-def-test", map: { width: 3, height: 1, fill: "terrain/plain", exits: [] }, objectives: [], units: [
    { id: "m", owner: "enemy", pos: { x: 0, y: 0 }, monster: { species: "species/hound", grade: "C", ...(withDef ? { def: "monster/engine-test" } : {}) } },
    { id: "a", owner: "player", pos: { x: 2, y: 0 }, frame: "frame/bio-hound" },
  ] };
}
function context(withDef = true) { return { db, s: createBattle(db, setup(withDef), 1) }; }

test("MonsterDef partsOverride 替換整欄並改變層 HP，其他部位不變且快取", () => {
  const ctx = context(), parts = partDefs(ctx, "m");
  assert.deepEqual(ctx.s.units.m!.parts[body.parts[0]!.id]!.layers.map(l => l.hp), layers.map(l => l.hp));
  assert.equal(parts[0]!.name, "覆寫部位");
  assert.deepEqual(parts.slice(1), body.parts.slice(1));
  assert.equal(partDefs(ctx, "m"), parts);
  assert.deepEqual(body.parts, original.require("bodyplan", body.id).parts);
});
test("MonsterDef extraAbilities 可用且去重穩定，tags 併入", () => {
  const ctx = context();
  assert.ok(abilitiesOf(ctx, "m").includes("base:ability/restrain"));
  const abilities = frameView(ctx, "m").innateAbilities;
  assert.deepEqual(abilities, [...new Set(abilities)].sort());
  assert.ok(unitTags(ctx, "m").includes("engine-test"));
});
test("MonsterDef attrMods 求值並以 MonsterDef id 作貢獻來源", () => {
  const ctx = context();
  assert.equal(unitAttr(ctx, "m", "accuracy"), 61);
  assert.equal(ctx.s.units.m!.contribs[0]!.source, "base:monster/engine-test");
  assert.equal(ctx.s.units.m!.contribs[0]!.value, 6);
});
test("BattleResult 怪獸 id 包含捕捉前與捕捉後，保留捕捉時 HP", () => {
  const ctx = context();
  rt(ctx.s).outcome = { winner: "player", reason: "test" };
  assert.equal(battleResult(ctx)!.units.find(u => u.id === "m")!.monster, "base:monster/engine-test");
  for (const part of partDefs(ctx, "m")) if (part.functions.includes("locomotion")) ctx.s.units.m!.parts[part.id]!.broken = true;
  const hp = ctx.s.units.m!.parts[body.parts[0]!.id]!.layers.map(l => l.hp);
  capture(ctx, "a", "m");
  assert.equal(rt(ctx.s).monsters.m, undefined);
  const result = battleResult(ctx)!.units.find(u => u.id === "m")!;
  assert.equal(result.status, "captured");
  assert.equal(result.monster, "base:monster/engine-test");
  assert.deepEqual(result.state.parts[body.parts[0]!.id]!.layers.map(l => l.hp), hp);
});
test("沒有 def 的舊 UnitInit 除新增核心標記外保持開工前狀態 hash", () => {
  const ctx = context(false);
  assert(Object.values(ctx.s.units).every(u => u.core === true));
  const priorShape = { ...ctx.s, units: Object.fromEntries(Object.entries(ctx.s.units).map(([id, { core, ...u }]) => [id, u])) };
  assert.equal(fnv1a64(canonicalJson(priorShape)), "659804c7a60fdc98");
  const changed = structuredClone(priorShape);
  changed.units.m!.parts[body.parts[0]!.id]!.layers[0]!.hp += 1;
  assert.notEqual(fnv1a64(canonicalJson(changed)), "659804c7a60fdc98");
  assert.deepEqual(ctx.s.units.m!.contribs, []);
  assert.equal(partDefs(ctx, "m"), db.require("bodyplan", body.id).parts);
});
test("人物 NumExpr 可讀獸緣，未提供屬性時沿用 0", () => {
  const ctx = context(false);
  const p = makePerson(ctx, "p", db.all("person").find(p => p.kind === "human")!.id);
  assert.equal(evalNum({ ref: "self.attrs.beastKin" }, evalCtxFor(ctx, { person: "p" })), 0);
  p.attrsBase.beastKin = 37;
  assert.equal(evalNum({ ref: "self.attrs.beastKin" }, evalCtxFor(ctx, { person: "p" })), 37);
  for (const id of ["beastKin", "shellKin"]) assert.ok(Object.hasOwn(db.registries.attrs, id));
});
