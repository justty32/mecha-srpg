import { test } from "node:test";
import assert from "node:assert/strict";
import { pressureDaily2, poisson } from "./pressure.ts";
import { fixture, day, addRift } from "./test-support.ts";
import { worldRules } from "./places.ts";
test("pressure：每日與蝕域月累積；平日不開裂縫", () => {
  const { s, ctx } = fixture(); addRift(s, ctx);
  day(s, ctx, 2); const rng = structuredClone(s.rng); pressureDaily2(s, ctx);
  const rules = worldRules(ctx).pressure;
  assert.equal(s.pressure, rules.daily + rules.blightPerMonth / ctx.world.require("calendar", s.calendar).daysPerMonth);
  assert.equal(Object.keys(s.rifts).length, 1); assert.deepEqual(s.rng, rng);
  assert.equal(poisson(s.rng, 0), 0); assert.throws(() => poisson(s.rng, -1));
});
test("pressure：大潮泊松與落點可重播、落點不重疊", () => {
  const a = fixture(), b = fixture();
  for (const { s, ctx } of [a, b]) { s.pressure = 40000; day(s, ctx, 14); pressureDaily2(s, ctx); }
  assert.deepEqual(a.s, b.s); const rifts = Object.values(a.s.rifts); assert.ok(rifts.length > 0);
  assert.equal(new Set(rifts.map(r => r.site)).size, rifts.length);
  for (const r of rifts) { assert.ok(a.s.places[r.site]); assert.equal(r.phase, "opening"); assert.ok(["D", "C", "B", "A", "S"].includes(r.width)); }
});
