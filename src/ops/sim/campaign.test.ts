import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../world/test-support.ts";
import { runCampaign } from "./campaign.ts";
import { checkInvariants } from "./invariants.ts";
import { idle } from "./policies.ts";
import { gridOf, terrainAt } from "../world/grid.ts";
import { applySortieResult } from "../sortie/run.ts";
import type { BattleRunner } from "../time/index.ts";

const fakeBattle: BattleRunner = (state, ctx, sortie) => {
  applySortieResult(state, ctx, sortie, { winner: "player", reason: "eliminate", rounds: 3,
    units: [], persons: [], loot: [], log: { events: 0, hash: "campaign-test-fixed" } });
  return { ok: true };
};

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
test("idle 12 蝕月：每天不變量全空", () => {
  const { s, ctx } = fixture(); let days = 0;
  const result = runCampaign({ ...ctx, start: "default", seed: 7, months: 12, policy: "idle", onDay(state) { assert.deepEqual(checkInvariants(state), []); days++; } });
  // 世界軌跡重錄：新增 40 個招募池改變亂數消耗，seed 7 無駕駛員終局改為第 104 天，完成 3 蝕月。
  assert.equal(days, 104); assert.equal(result.summary.length, 3);
  assert.equal(result.state.log.filter(e => e.type === "CampaignEnd" && e.payload.reason === "no-pilots").length, 1);
  // 同一條測試也確認檢查器確實會擋錯帳、斷引用與 mastery 越界。
  s.ledger.balances.cash++; s.restraint.beasts["missing"] = { mech: "missing", kind: "live", wear: 0, vitality: 100, bond: {} };
  s.roster.mastery.bad = { node: 2 }; const errors = checkInvariants(s);
  assert(errors.some(e => e.includes("balance mismatch"))); assert(errors.some(e => e.includes("missing beast"))); assert(errors.some(e => e.includes("mastery")));
});
test("長時間 wait 在駕駛員歸零終局當天停止", () => {
  const { ctx } = fixture();
  const result = runCampaign({ ...ctx, start: "default", seed: 1, months: 12,
    policy(s, c) { const command = idle(s, c); return command.v === "wait" ? { v: "wait", days: Math.max(1, 336 - s.clock.day) } : command; } });
  assert.equal(result.state.clock.day, 132);
  assert.equal(result.state.pendingTicks, 0);
  assert.equal(result.state.log.at(-1)?.type, "DaySummary");
  assert.equal(result.state.log.filter(e => e.type === "CampaignEnd" && e.payload.reason === "no-pilots").length, 1);
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
test("greedy 加不打戰鬥的假 runner 跑 6 蝕月", () => {
  const { ctx } = fixture(); let calls = 0;
  const result = runCampaign({ ...ctx, start: "default", seed: 2, months: 6, policy: "greedy",
    battle: (state, battleCtx, sortie) => { calls++; return fakeBattle(state, battleCtx, sortie); } });
  assert(calls > 0); assert.equal(result.summary.length, 6); assert.deepEqual(checkInvariants(result.state), []);
});
test("random 三個 seed 各 6 蝕月，每天不變量全空", () => {
  const { ctx } = fixture();
  for (const seed of [1, 7, 42]) {
    let days = 0;
    const result = runCampaign({ ...ctx, start: "default", seed, months: 6, policy: "random", continueAfterEnd: true,
      battle: fakeBattle,
      onDay(s) { assert.deepEqual(checkInvariants(s), []); days++; } });
    assert.equal(result.summary.length, 6); assert.equal(days, 168);
  }
});
