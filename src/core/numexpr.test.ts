import { test } from "node:test";
import assert from "node:assert/strict";
import type { Cond, NumExpr } from "./types-def.ts";
import { REF_ROOTS, NumExprError, evalNum, evalCond, objectRefs, collectRefs, checkNumExpr, checkCond } from "./numexpr.ts";

const ctx = {
  ref: objectRefs({ self: { power: 5 }, target: { armor: 3 }, battle: { round: 2 } }),
  hasTag: (tag: string) => tag === "pilot",
};

test("數字原樣回傳，非有限結果拋 NumExprError", () => {
  for (const value of [0, -0, -2, 3.5]) assert.equal(evalNum(value, ctx), value);
  for (const value of [NaN, Infinity, -Infinity]) assert.throws(() => evalNum(value, ctx), NumExprError);
  assert.throws(() => evalNum({ product: [Number.MAX_VALUE, 2] }, ctx), NumExprError);
});

test("ref 先乘加再依 min／max 夾限", () => {
  assert.equal(evalNum({ ref: "self.power" }, ctx), 5);
  assert.equal(evalNum({ ref: "self.power", mul: 2, add: 3 }, ctx), 13);
  assert.equal(evalNum({ ref: "self.power", mul: 2, add: 3, min: 15, max: 20 }, ctx), 15);
  assert.equal(evalNum({ ref: "self.power", mul: 2, add: 3, min: 0, max: 10 }, ctx), 10);
  assert.equal(evalNum({ ref: "self.power", mul: 0, add: 0, min: 0, max: 0 }, ctx), 0);
});

test("sum 支援巢狀式，空陣列為零", () => {
  assert.equal(evalNum({ sum: [] }, ctx), 0);
  assert.equal(evalNum({ sum: [1, { ref: "self.power" }, { sum: [2, 3] }] }, ctx), 11);
});

test("product 支援巢狀式，空陣列為一", () => {
  assert.equal(evalNum({ product: [] }, ctx), 1);
  assert.equal(evalNum({ product: [2, { ref: "self.power" }, { sum: [1, 2] }] }, ctx), 30);
});

test("pick 只求值條件所選分支", () => {
  const missing: NumExpr = { ref: "self.missing" };
  assert.equal(evalNum({ pick: { if: {}, then: 7, else: missing } }, ctx), 7);
  assert.equal(evalNum({ pick: { if: { any: [] }, then: missing, else: 8 } }, ctx), 8);
});

test("cmp 五種運算子皆按數字比較", () => {
  const rows: [NonNullable<Cond["cmp"]>["op"], number, number, boolean][] = [
    ["<", 2, 3, true], ["<", 3, 3, false], ["<=", 3, 3, true], ["<=", 4, 3, false],
    ["==", 3, 3, true], ["==", 2, 3, false], [">=", 3, 3, true], [">=", 2, 3, false],
    [">", 4, 3, true], [">", 3, 3, false],
  ];
  for (const [op, a, b, expected] of rows) assert.equal(evalCond({ cmp: { a, op, b } }, ctx), expected);
  assert.equal(evalCond({ cmp: { a: { ref: "self.power" }, op: ">", b: { ref: "target.armor" } } }, ctx), true);
});

test("tag 透過 hasTag 判斷，缺少 callback 會拋錯", () => {
  assert.equal(evalCond({ tag: "pilot" }, ctx), true);
  assert.equal(evalCond({ tag: "enemy" }, ctx), false);
  assert.throws(() => evalCond({ tag: "pilot" }, { ref: ctx.ref }), NumExprError);
});

test("not／all／any 與同層鍵採 AND，涵蓋空條件", () => {
  assert.equal(evalCond({}, ctx), true);
  assert.equal(evalCond({ all: [] }, ctx), true);
  assert.equal(evalCond({ any: [] }, ctx), false);
  assert.equal(evalCond({ not: {} }, ctx), false);
  assert.equal(evalCond({ not: { any: [] } }, ctx), true);
  assert.equal(evalCond({ all: [{ tag: "pilot" }, { not: { tag: "enemy" } }] }, ctx), true);
  assert.equal(evalCond({ all: [{ tag: "pilot" }, { tag: "enemy" }] }, ctx), false);
  assert.equal(evalCond({ any: [{ tag: "enemy" }, { tag: "pilot" }] }, ctx), true);
  assert.equal(evalCond({ tag: "pilot", not: { tag: "enemy" }, all: [], any: [{}], cmp: { a: 1, op: ">", b: 2 } }, ctx), false);
});

test("objectRefs 解析巢狀自有鍵，缺路徑與非有限數值帶路徑拋錯", () => {
  const ref = objectRefs({ self: { value: 3, text: "3", bad: Infinity, nested: null } });
  assert.equal(ref("self.value"), 3);
  for (const path of ["missing.value", "self.nope", "self.text", "self.bad", "self.nested.x", "self.toString", "toString"]) {
    assert.throws(() => ref(path), (error: unknown) => error instanceof NumExprError && error.message.includes(path));
  }
});

test("collectRefs 遍歷條件與所有分支，排序並去重", () => {
  const expr: NumExpr = { pick: {
    if: { not: { all: [{ cmp: { a: { ref: "battle.round" }, op: "<", b: 4 } }] } },
    then: { sum: [{ ref: "self.power" }, { ref: "self.power" }] },
    else: { product: [{ ref: "target.armor" }, 2] },
  } };
  assert.deepEqual(collectRefs(expr), ["battle.round", "self.power", "target.armor"]);
  assert.deepEqual(collectRefs({ any: [{ cmp: { a: expr, op: "==", b: { ref: "layer.hp" } } }] }),
    ["battle.round", "layer.hp", "self.power", "target.armor"]);
  assert.deepEqual(collectRefs(3), []);
});

test("checkNumExpr 抓壞根、未知鍵、形狀與遞迴路徑", () => {
  assert.deepEqual(REF_ROOTS, ["self", "target", "part", "layer", "battle", "rng"]);
  for (const root of REF_ROOTS) assert.deepEqual(checkNumExpr({ ref: `${root}.value`, mul: 1, add: 0, min: 0, max: 10 }), []);
  assert.deepEqual(checkNumExpr({ pick: { if: {}, then: { sum: [] }, else: { product: [2] } } }), []);
  const errors = checkNumExpr({ sum: [{ ref: "wrong.value", typo: 1, mul: Infinity }] });
  assert.ok(errors.some((error) => error.startsWith("$.sum[0].ref:")));
  assert.ok(errors.some((error) => error.startsWith("$.sum[0].typo:")));
  assert.ok(errors.some((error) => error.startsWith("$.sum[0].mul:")));
  for (const bad of [null, [], {}, "1", Infinity, { sum: 1 }, { sum: [], product: [] }, { ref: 2 }, { pick: { then: 1 } }]) {
    assert.ok(checkNumExpr(bad, "ability.cost").length > 0);
    assert.ok(checkNumExpr(bad, "ability.cost").every((error) => error.startsWith("ability.cost")));
  }
});

test("checkCond 驗證複合條件、比較子式、未知鍵與子路徑", () => {
  assert.deepEqual(checkCond({}), []);
  assert.deepEqual(checkCond({ tag: "pilot", not: {}, all: [], any: [{}], cmp: { a: 1, op: "<=", b: { ref: "self.power" } } }), []);
  const errors = checkCond({ any: [{ cmp: { a: 1, op: "!=", b: { ref: "bad.x" }, extra: true } }] });
  for (const suffix of ["op", "b.ref", "extra"]) {
    assert.ok(errors.some((error) => error.startsWith(`$.any[0].cmp.${suffix}:`)));
  }
  for (const bad of [null, [], { tag: 1 }, { not: null }, { all: {} }, { any: 1 }, { cmp: {} }, { cmp: null }, { unknown: true }]) {
    assert.ok(checkCond(bad, "condition").length > 0);
    assert.ok(checkCond(bad, "condition").every((error) => error.startsWith("condition")));
  }
});
