import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../world/test-support.ts";
import { runCampaign } from "./campaign.ts";
import { checkInvariants } from "./invariants.ts";
test("idle 12 潮月：每天不變量全空", () => {
  const { s, ctx } = fixture(); let days = 0;
  const result = runCampaign({ ...ctx, start: "default", seed: 7, months: 12, policy: "idle", onDay(state) { assert.deepEqual(checkInvariants(state), []); days++; } });
  assert.equal(days, 12 * 28); assert.equal(result.summary.length, 12);
  // 同一條測試也確認檢查器確實會擋錯帳、斷引用與 mastery 越界。
  s.ledger.balances.cash++; s.stable.pens.push({ mech: "missing", taming: "wild", tameDays: 0, hunger: 0, bond: {} });
  s.roster.mastery.bad = { node: 2 }; const errors = checkInvariants(s);
  assert(errors.some(e => e.includes("balance mismatch"))); assert(errors.some(e => e.includes("missing pen"))); assert(errors.some(e => e.includes("mastery")));
});
test("greedy 加不打戰鬥的假 runner 跑 6 潮月", () => {
  const { ctx } = fixture(); let calls = 0;
  const result = runCampaign({ ...ctx, start: "default", seed: 7, months: 6, policy: "greedy", battle: () => { calls++; return { ok: true }; } });
  assert(calls > 0); assert.equal(result.summary.length, 6); assert.deepEqual(checkInvariants(result.state), []);
});
test("random 三個 seed 各 6 潮月，每天不變量全空", () => {
  const { ctx } = fixture();
  for (const seed of [1, 7, 42]) {
    let days = 0;
    const result = runCampaign({ ...ctx, start: "default", seed, months: 6, policy: "random", onDay(s) { assert.deepEqual(checkInvariants(s), []); days++; } });
    assert.equal(result.summary.length, 6); assert.equal(days, 168);
  }
});
