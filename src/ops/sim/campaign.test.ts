import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../world/test-support.ts";
import { runCampaign } from "./campaign.ts";
import { checkInvariants } from "./invariants.ts";
import { idle } from "./policies.ts";
import { gridOf, terrainAt } from "../world/grid.ts";

test("船位置不變量：存在的圖與可進格；未知圖和不可進格會被擋", () => {
  const { s, ctx } = fixture(), original = structuredClone(s.ship.pos);
  assert.deepEqual(checkInvariants(s, ctx.world), []);
  s.ship.pos.map = "map/missing";
  assert.ok(checkInvariants(s, ctx.world).some(error => error.startsWith("missing ship map")));
  s.ship.pos = structuredClone(original);
  const map = gridOf(ctx.world, original.map);
  s.ship.pos.cell = { x: map.width, y: 0 };
  assert.ok(checkInvariants(s, ctx.world).includes("ship outside map"));
  // 船毀後使用地面通行；潮海不可進。
  const hull = s.ship.hull.cur;
  s.ship.hull.cur = 0;
  const blocked = Array.from({ length: map.width * map.height }, (_, index) => ({ x: index % map.width, y: Math.floor(index / map.width) }))
    .find(cell => terrainAt(map, cell).groundCost === null)!;
  assert.ok(blocked);
  s.ship.pos.cell = blocked;
  assert.ok(checkInvariants(s, ctx.world).includes("ship on impassable cell"));
  s.ship.pos = original; s.ship.hull.cur = hull;
  assert.deepEqual(checkInvariants(s, ctx.world), []);
});
test("idle 12 蝕月：每天不變量全空；長時間 wait 在駕駛員歸零終局當天停止", () => {
  const { s, ctx } = fixture(); let days = 0;
  const result = runCampaign({ ...ctx, start: "default", seed: 7, months: 12, policy: "idle", onDay(state) { assert.deepEqual(checkInvariants(state), []); days++; } });
  const ends = result.state.log.filter(e => e.type === "CampaignEnd");
  assert.equal(ends.length, 1);
  assert.equal(ends[0]!.payload.reason, "no-pilots");
  const endDay = ends[0]!.day, calendar = ctx.world.require("calendar", result.state.calendar);
  assert.ok(endDay > s.clock.day && endDay < s.clock.day + 12 * calendar.daysPerMonth);
  assert.equal(result.state.clock.day, endDay);
  assert.equal(days, endDay - s.clock.day);
  assert.equal(result.summary.length, Math.floor(days / calendar.daysPerMonth));
  assert.ok(result.state.log.every(event => event.day <= endDay));
  assert.equal(result.state.pendingTicks, 0);
  assert.equal(result.state.log.at(-1)?.type, "DaySummary");
  assert.equal(result.state.log.at(-1)?.day, endDay);
  // 同一條測試也確認檢查器確實會擋錯帳、斷引用與 mastery 越界。
  s.ledger.balances.cash++; s.restraint.beasts["missing"] = { mech: "missing", kind: "live", wear: 0, vitality: 100, bond: {} };
  s.roster.mastery.bad = { node: 2 }; const errors = checkInvariants(s);
  assert(errors.some(e => e.includes("balance mismatch"))); assert(errors.some(e => e.includes("missing beast"))); assert(errors.some(e => e.includes("mastery")));
  // 長時間 wait：一次跨越 12 蝕月的 wait 也必須在終局當天截斷。
  const completedDays: number[] = [], start = fixture().s.clock.day;
  const target = start + 12 * calendar.daysPerMonth;
  const waited = runCampaign({ ...ctx, start: "default", seed: 1, months: 12,
    onDay(state) { completedDays.push(state.clock.day); },
    policy(st, c) { const command = idle(st, c); return command.v === "wait" ? { v: "wait", days: Math.max(1, target - st.clock.day) } : command; } });
  const waitEnds = waited.state.log.filter(e => e.type === "CampaignEnd");
  assert.equal(waitEnds.length, 1);
  assert.equal(waitEnds[0]!.payload.reason, "no-pilots");
  const waitEnd = waitEnds[0]!.day;
  assert.ok(waitEnd > start && waitEnd < target, "長wait必須被駕駛歸零終局提早截斷");
  assert.equal(waited.state.clock.day, waitEnd);
  assert.equal(completedDays.at(-1), waitEnd);
  assert.ok(completedDays.every(day => day <= waitEnd));
  assert.ok(waited.state.log.every(event => event.day <= waitEnd), "終局後不可再開新日或產生後續事件");
  assert.equal(waited.state.pendingTicks, 0);
  assert.equal(waited.state.log.at(-1)?.type, "DaySummary");
  assert.equal(waited.state.log.at(-1)?.day, waitEnd);
});
test("continueAfterEnd：終局後世界照走，原政策不再行動", () => {
  const { ctx } = fixture(); let policyAfterEnd = 0;
  const result = runCampaign({ ...ctx, start: "default", seed: 1, months: 12, continueAfterEnd: true,
    policy(s, c) {
      if (s.log.some(e => e.type === "CampaignEnd")) policyAfterEnd++;
      return idle(s, c);
    } });
  assert.equal(result.state.clock.day, 336);
  assert.equal(policyAfterEnd, 0);
  assert.equal(result.state.log.filter(e => e.type === "CampaignEnd").length, 1);
  assert.equal(result.state.log.filter(e => e.type === "CampaignEnd" && e.payload.reason === "no-pilots").length, 1);
  assert.ok(result.state.log.some(e => e.type === "DaySummary" && e.day > 90));
});
