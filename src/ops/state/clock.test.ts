import { test } from "node:test";
import assert from "node:assert/strict";
import { clock } from "./clock.ts";
import type { CalendarDef } from "./types.ts";
const cal: CalendarDef = { id: "calendar/tide", daysPerMonth: 28, spring: [1, 15], neap: [7, 21], special: [] };
test("clock：dom 與潮相對照", () => {
  for (const [day, dom, phase] of [[0, 1, "spring"], [6, 7, "neap"], [14, 15, "spring"], [20, 21, "neap"], [27, 28, "ordinary"], [28, 1, "spring"]] as const) {
    assert.deepEqual(clock(day, cal), { day, dom, phase, month: Math.floor(day / 28) });
  }
});
test("clock：改 calendar 週期生效", () => {
  assert.deepEqual(clock(11, { ...cal, daysPerMonth: 10, spring: [2], neap: [5] }), { day: 11, month: 1, dom: 2, phase: "spring" });
  assert.throws(() => clock(0, { ...cal, daysPerMonth: 0 }));
});
