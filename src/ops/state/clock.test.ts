import { test } from "node:test";
import assert from "node:assert/strict";
import { clock } from "./clock.ts";
import type { CalendarDef } from "./types.ts";
const cal: CalendarDef = { id: "calendar/tide", daysPerMonth: 28, spring: [1, 15], neap: [7, 21] };
test("clock：dom 與潮相對照", () => {
  for (const [day, dom, phase, stage, tide] of [[0, 1, "spring", "spring", 2], [6, 7, "neap", "slack", 0], [14, 15, "spring", "spring", 2], [20, 21, "neap", "slack", 0], [27, 28, "ordinary", "rising", 1], [28, 1, "spring", "spring", 2]] as const) {
    assert.deepEqual(clock(day, cal), { day, dom, phase, month: Math.floor(day / 28), stage, tide, year: 1 });
  }
});
test("clock：改 calendar 週期生效", () => {
  assert.deepEqual(clock(11, { ...cal, daysPerMonth: 10, spring: [2], neap: [5] }), { day: 11, month: 1, dom: 2, phase: "spring", stage: "spring", tide: 2, year: 1 });
  assert.throws(() => clock(0, { ...cal, daysPerMonth: 0 }));
});
test("clock：蝕曆年由 epochMonth／monthsPerYear 算，元年為 1", () => {
  assert.equal(clock(0, { ...cal, epochMonth: 247, monthsPerYear: 13 }).year, 20);
  assert.equal(clock(13 * 28, { ...cal, epochMonth: 247, monthsPerYear: 13 }).year, 21);
});
