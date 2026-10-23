import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng, nextU32, nextFloat, nextInt, rollInt, d100, chance, pickWeighted, cloneRng } from "./rng.ts";

test("PCG32 seed 42、stream 54 的參考序列", () => {
  const rng = createRng(42, 54);
  assert.deepEqual(Array.from({ length: 6 }, () => nextU32(rng)), [
    0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e,
  ]);
});

test("預設 stream 的 seed 12345 參考序列與 seed 範圍", () => {
  const rng = createRng(12345);
  assert.deepEqual(Array.from({ length: 5 }, () => nextU32(rng)), [
    4127262169, 3468701408, 2272573525, 4086873097, 895617009,
  ]);
  for (const value of [-1, 0.5, NaN, Infinity, 2 ** 53 + 2]) {
    assert.throws(() => createRng(value), RangeError);
    assert.throws(() => createRng(0, value), RangeError);
  }
  assert.match(createRng(2 ** 53, 2 ** 53).state, /^[0-9a-f]{16}$/);
  assert.match(createRng(0, 0).inc, /^[0-9a-f]{16}$/);
});

test("RngState JSON 往返與 clone 都能接續，且互不共用狀態", () => {
  const rng = createRng(9);
  nextU32(rng);
  const restored = JSON.parse(JSON.stringify(rng));
  const copy = cloneRng(rng);
  assert.notStrictEqual(copy, rng);
  for (let i = 0; i < 20; i++) {
    const expected = nextU32(rng);
    assert.equal(nextU32(restored), expected);
    assert.equal(nextU32(copy), expected);
  }
  const before = rng.state;
  nextU32(copy);
  assert.equal(rng.state, before);
});

test("nextFloat 與 chance 消耗同一個 uint32 並使用嚴格小於", () => {
  const rng = createRng(42);
  const reference = cloneRng(rng);
  const value = nextU32(reference) / 2 ** 32;
  assert.equal(nextFloat(rng), value);
  assert.ok(value >= 0 && value < 1);
  assert.equal(chance(createRng(42), value), false);
  assert.equal(chance(createRng(42), value + 0.0001), true);
  assert.equal(chance(rng, 0), false);
  assert.equal(chance(rng, 1), true);
});

test("nextInt 拒絕法排除低端餘數，且涵蓋合法邊界", () => {
  const rng = createRng(42);
  const reference = cloneRng(rng);
  const n = 2 ** 31 + 1;
  const first = nextU32(reference);
  const rejected = nextU32(reference);
  const third = nextU32(reference);
  assert.ok(rejected < 2 ** 32 % n);
  assert.equal(nextInt(rng, n), first % n);
  assert.equal(nextInt(rng, n), third % n);
  assert.deepEqual(rng, reference);
  assert.equal(nextInt(rng, 1), 0);
  assert.equal(nextInt(createRng(42), 2 ** 32), 0xa15c02b7);
  for (const bound of [0, -1, 1.5, NaN, Infinity, 2 ** 32 + 1]) {
    assert.throws(() => nextInt(rng, bound), RangeError);
  }
});

test("rollInt 包含負端點與兩個邊界", () => {
  const rng = createRng(7);
  const values = Array.from({ length: 100 }, () => rollInt(rng, -2, 2));
  assert.ok(values.every((value) => Number.isInteger(value) && value >= -2 && value <= 2));
  assert.ok(values.includes(-2) && values.includes(2));
  assert.equal(rollInt(rng, 3, 3), 3);
  assert.throws(() => rollInt(rng, 2, 1), RangeError);
  assert.throws(() => rollInt(rng, 0.5, 2), RangeError);
});

test("d100 一千次皆落於 0..99 且等於 nextInt(100)", () => {
  const rng = createRng(13);
  const reference = cloneRng(rng);
  for (let i = 0; i < 1000; i++) {
    const value = d100(rng);
    assert.ok(Number.isInteger(value) && value >= 0 && value <= 99);
    assert.equal(value, nextInt(reference, 100));
  }
});

test("pickWeighted 依累積權重選取並拒絕非法權重", () => {
  const rng = createRng(42);
  assert.equal(pickWeighted(rng, [0, 1, 3], (value) => value), 3);
  assert.equal(pickWeighted(rng, ["zero", "only"], (value) => value === "only" ? 1 : 0), "only");
  for (const weights of [[], [0, 0], [-1, 2], [Infinity], [NaN]]) {
    assert.throws(() => pickWeighted(rng, weights, (value) => value), RangeError);
  }
});
