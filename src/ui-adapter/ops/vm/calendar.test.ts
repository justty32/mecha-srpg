import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../../../ops/world/test-support.ts";
import { clock, skyAt } from "../../../ops/state/clock.ts";
import { GREAT_TIDE } from "../../../ops/state/omens.ts";
import { nextGreatTide, GREAT_TIDE_LOOKAHEAD } from "./calendar.ts";

test("nextGreatTide：找最近大潮、包含今日、無天象為 null，搜尋上限恰為 lookahead", () => {
  const { s, ctx } = fixture(), cal = ctx.world.require("calendar", s.calendar), defs = ctx.world.all("omen");
  const next = nextGreatTide(0, cal, defs)!;
  assert.ok(next.tide >= GREAT_TIDE);
  assert.equal(next.daysAway, next.day);
  for (let d = 0; d < next.day; d++) assert.ok(skyAt(d, cal, defs).clock.tide < GREAT_TIDE, `day ${d}`);
  assert.equal(next.tide, clock(next.day, cal, defs).tide);
  assert.deepEqual(next.omens.map(o => o.id), skyAt(next.day, cal, defs).omens);
  assert.equal(nextGreatTide(next.day, cal, defs)!.daysAway, 0);
  assert.equal(nextGreatTide(0, cal, []), null);
  const def = defs[0]!;
  // 簡化曆每一天都是漲潮，精確驗證搜尋邊界。
  const dailyCal = { ...cal, daysPerMonth: 1, spring: [1], neap: [] };
  const delayed = (day: number) => [{ ...def, cycle: undefined, emerge: undefined, at: [{ month: day, dom: 1 }], setTide: 3 }];
  assert.equal(nextGreatTide(0, dailyCal, delayed(GREAT_TIDE_LOOKAHEAD))!.daysAway, GREAT_TIDE_LOOKAHEAD);
  assert.equal(nextGreatTide(0, dailyCal, delayed(GREAT_TIDE_LOOKAHEAD + 1)), null);
});
