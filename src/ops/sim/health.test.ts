import test from "node:test";
import assert from "node:assert/strict";
import { healthFailures, measureHealth } from "./health.ts";

test("grid-health：greedy seed 1 十二潮月退化判準；不合格輸入必須變紅", () => {
  const row = measureHealth("greedy", 1);
  assert.deepEqual(healthFailures(row), []);
  assert.ok(healthFailures({ ...row, blight12: row.land * 0.15 }).includes("blight12>=15%"));
  assert.ok(healthFailures({ ...row, actorsMin: 39 }).includes("actors-outside-40..200"));
  assert.ok(healthFailures({ ...row, encounters: row.sailingDays }).includes("encounters-outside-0.1..0.4"));
  assert.ok(healthFailures({ ...row, encounters: 2 }).includes("greedy-encounters<3"));
  assert.ok(healthFailures({ ...row, sailingDays: 0, encounters: 0 }).includes("encounters-outside-0.1..0.4"));
  assert.ok(healthFailures({ ...row, maxEncounters: 3 }).includes("daily-encounters>2"));
  assert.ok(healthFailures({ ...row, months: 24, cashLast: 0 }).includes("cash24<=0"));
  assert.ok(healthFailures({ ...row, months: 24, endDay: 1 }).includes("ended-before-month24"));
  assert.deepEqual(healthFailures({ ...row, policy: "idle", sailingDays: 0, encounters: 0 }), []);
});
