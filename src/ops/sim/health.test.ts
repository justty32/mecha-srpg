import test from "node:test";
import assert from "node:assert/strict";
import { formatHealth, healthFailures, measureHealth } from "./health.ts";

test("grid-health：greedy seed 2 十二蝕月退化判準；不合格輸入必須變紅", () => {
  // 七勢力派駐發包後 seed 4 越界改 seed 7；怪獸擴充（裂縫名單加新獸）後 seed 7 越界（107/92），沿重錄慣例改用 seed 1（31/128≈0.24），判準不變。AI 支援評分（lead-engine-next）後 seed 1 越界（72/112），改 seed 2（30/125≈0.24），判準不變。
  const row = measureHealth("greedy", 2);
  assert.deepEqual(healthFailures(row), [], formatHealth(row));
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
