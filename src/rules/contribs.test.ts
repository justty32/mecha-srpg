import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import type { ContributionInstance } from "../core/types-state.ts";
import type { ContribOp } from "../core/types-def.ts";
import { makeUnit, newRuntime, person, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { addContrib, personAttr, removeContrib, removeContribsBySource, roleAttr, statValue, unitAttr } from "./contribs.ts";

const db = loadContentDirs(["content/base", "test/scenarios/pack"]).db;
function setup(): Ctx {
  const ctx: Ctx = { db, s: { round: 0, order: [], units: {}, persons: {},
    map: { def: "test", width: 1, height: 1, terrain: [], featureHp: {} }, factions: {}, knowledge: {},
    rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
  makeUnit(ctx, { id: "u", owner: "a", pos: { x: 0, y: 0 }, frame: "frame/hound-mk2",
    persons: [{ id: "p", def: "person/ren-kasai", seat: "pilot" }] });
  return ctx;
}

test("DC-T09 statValue 依 set→add→mul→min/max，表格涵蓋每種運算", () => {
  const cases: { ops: [ContribOp, number][]; expected: number }[] = [
    { ops: [], expected: 10 }, { ops: [["set", 4], ["set", 7]], expected: 7 },
    { ops: [["mul", 3], ["add", 2], ["set", 4]], expected: 18 },
    { ops: [["min", 12], ["mul", 3], ["add", 2], ["set", 4]], expected: 12 },
    { ops: [["max", 20], ["mul", 3], ["add", 2], ["set", 4]], expected: 20 },
    { ops: [["add", 1], ["add", 2], ["mul", 2], ["mul", 3]], expected: 78 },
  ];
  for (const { ops, expected } of cases) {
    const cs: ContributionInstance[] = ops.map(([op, value], i) => ({ id: `c${i}`, path: "x", op, value, source: "s" }));
    cs.push({ id: "ignored", path: "other", op: "set", value: 999, source: "s" });
    assert.equal(statValue(10, cs, "x"), expected);
  }
});

test("貢獻 NumExpr 在加入時求值並配置獨立遞增 id", () => {
  const ctx = setup();
  const a = addContrib(ctx, { person: "p" }, { path: "self.attrs.accuracy", op: "add", value: { ref: "self.attrs.initiative" }, source: "s" });
  const b = addContrib(ctx, { unit: "u" }, { path: "self.attrs.initiative", op: "add", value: 3, source: "s" });
  person(ctx, "p").attrsBase.initiative = 100;
  assert.equal(a, "c0"); assert.equal(b, "c1");
  assert.equal(personAttr(ctx, "p", "accuracy"), 62);
  assert.equal(unitAttr(ctx, "u", "initiative"), 9);
  assert.equal(person(ctx, "p").contribs[0]!.value, 7);
});

test("DC-T09 按 id 精確撤回、不影響同來源另一筆", () => {
  const ctx = setup(), owner = { person: "p" };
  const a = addContrib(ctx, owner, { path: "self.attrs.resolve", op: "add", value: 5, source: "same" });
  const b = addContrib(ctx, owner, { path: "self.attrs.resolve", op: "mul", value: 2, source: "same" });
  assert.equal(personAttr(ctx, "p", "resolve"), 106);
  assert.equal(removeContrib(ctx, owner, a), true); assert.equal(personAttr(ctx, "p", "resolve"), 96);
  assert.equal(removeContrib(ctx, owner, a), false);
  assert.equal(removeContrib(ctx, owner, b), true); assert.equal(personAttr(ctx, "p", "resolve"), 48);
});

test("來源撤除重算池 max/regen，hard 夾限而 soft 保留超載", () => {
  const ctx = setup();
  const a = addContrib(ctx, { person: "p" }, { path: "self.pools.ap.max", op: "add", value: -4, source: "lock" });
  const b = addContrib(ctx, { person: "p" }, { path: "self.pools.ap.regen", op: "mul", value: 0.5, source: "lock" });
  assert.equal(person(ctx, "p").pools.ap!.cur, 5); assert.equal(person(ctx, "p").pools.ap!.regen, 4.5);
  assert.deepEqual(removeContribsBySource(ctx, { person: "p" }, "lock"), [a, b]);
  assert.equal(person(ctx, "p").pools.ap!.max, 9); assert.equal(person(ctx, "p").pools.ap!.regen, 9);
  unit(ctx, "u").pools.heat!.cur = 110;
  addContrib(ctx, { unit: "u" }, { path: "self.pools.heat.max", op: "add", value: -50, source: "damage" });
  assert.equal(unit(ctx, "u").pools.heat!.max, 50); assert.equal(unit(ctx, "u").pools.heat!.cur, 110);
});

test("roleAttr 合併人物與機體，缺屬性與無人單位採零與機體值", () => {
  const ctx = setup();
  assert.equal(roleAttr(ctx, { person: "p" }, "initiative"), 13);
  assert.equal(roleAttr(ctx, { unit: "u", person: "p" }, "initiative"), 13);
  assert.equal(roleAttr(ctx, { unit: "u" }, "initiative"), 6);
  assert.equal(roleAttr(ctx, {}, "initiative"), 0);
  assert.equal(personAttr(ctx, "p", "unknown"), 0); assert.equal(unitAttr(ctx, "u", "unknown"), 0);
});
