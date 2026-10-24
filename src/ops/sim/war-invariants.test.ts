import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../world/test-support.ts";
import { applyCommand } from "../time/index.ts";
import type { CampaignState } from "../state/types.ts";
import { runCampaign } from "./campaign.ts";
import { replayCampaign } from "./replay.ts";
import { campaignHash } from "./save.ts";
import { applySortieResult } from "../sortie/run.ts";
import type { BattleResult } from "../sortie/apply.ts";
import { checkInvariants } from "./invariants.ts";
import { initialWarMetrics, updateWarMetrics } from "./war-metrics.ts";

const seeds = [1, 2, 3, 7, 17, 42] as const;
test("六 seed × idle/random/merc × 六潮月：逐日戰爭不變量", { timeout: 60000 }, () => {
  const { ctx } = fixture();
  for (const policy of ["idle", "random", "merc"] as const) for (const seed of seeds) {
    let metrics = initialWarMetrics(fixture(seed).s);
    const result = runCampaign({ ...ctx, start: "default", seed, months: 6, policy, continueAfterEnd: true,
      ...(policy === "merc" ? { battle: (state: CampaignState) => { delete state.pendingBattle; return { ok: true as const }; } } : {}),
      onDay(s) { assert.deepEqual(checkInvariants(s, ctx.world), [], `${policy}/${seed}/day${s.clock.day}`); metrics = updateWarMetrics(metrics, s); } });
    assert.equal(result.summary.length, 6);
    assert.deepEqual(metrics.errors, [], `${policy}/${seed}`);
  }
});

test("檢查器會攔下戰爭欄位與比例超界", () => {
  const { s, ctx } = fixture();
  const bad = structuredClone(s);
  const faction = Object.values(bad.factions).find(f => f.rnd)!;
  faction.rnd!.points = -1;
  const relation = Object.values(bad.relations!)[0]!; relation.value = 101;
  const model = Object.values(bad.models!)[0]!; model.def = "missing-model";
  const errors = checkInvariants(bad, ctx.world);
  assert(errors.some(e => e.startsWith("rnd points")));
  assert(errors.some(e => e.startsWith("relation out of range")));
  assert(errors.some(e => e.startsWith("missing model def")));
  const exceeded = structuredClone(s);
  for (const r of Object.values(exceeded.relations!)) r.state = "war";
  assert(updateWarMetrics(initialWarMetrics(s), exceeded).errors.includes("war ratio > 30%"));
  assert.deepEqual(checkInvariants(s, ctx.world), []);
});

test("七日等待與七次單日等待：作戰外交事件及 state 同值", () => {
  const { s, ctx } = fixture(3);
  const settle = (input: CampaignState) => {
    let state = input;
    while (state.pendingChoices.length) state = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice: 1 }).state;
    return state;
  };
  const batch = settle(applyCommand(s, ctx.db, ctx.world, { v: "wait", days: 7 }).state);
  let single = s;
  for (let i = 0; i < 7; i++) single = settle(applyCommand(single, ctx.db, ctx.world, { v: "wait", days: 1 }).state);
  assert.deepEqual(batch.log.filter(e => /Operation|Relation|Treaty/.test(e.type)), single.log.filter(e => /Operation|Relation|Treaty/.test(e.type)));
  assert.equal(campaignHash(batch), campaignHash(single));
});

test("外交變態只在第 2 段；研發事件只在潮月首日", () => {
  const { ctx } = fixture();
  const result = runCampaign({ ...ctx, start: "default", seed: 1, months: 6, policy: "idle", continueAfterEnd: true });
  const relations = result.state.log.filter(e => e.type === "RelationChanged");
  assert(relations.length > 0);
  assert(relations.every(e => e.payload.stage === 2));
  const rnd = result.state.log.filter(e => e.type === "ModelReleased");
  assert(rnd.length > 0);
  assert(rnd.every(e => e.day % 28 === 0));
});

test("含作戰與 join 戰鬥的重播不呼叫 runner，state 逐位元相同", { timeout: 30000 }, () => {
  const { ctx } = fixture();
  const battle: import("../time/index.ts").BattleRunner = (s, battleCtx, sortie) => {
    const result: BattleResult = { winner: "player", reason: "eliminate", rounds: 3, units: [], persons: [], loot: [], log: { events: 0, hash: "war-test-fixed" } };
    applySortieResult(s, battleCtx, sortie, result);
    return { ok: true, result };
  };
  const result = runCampaign({ ...ctx, start: "default", seed: 3, months: 4, policy: "merc", battle, continueAfterEnd: true });
  assert(result.state.log.some(e => e.type === "OperationEngaged"));
  assert(result.state.log.some(e => e.type === "ContractAccepted" && e.payload.kind === "join"));
  assert(result.state.log.some(e => e.type === "BattleResolved" && e.payload.operation));
  assert(result.commands.some(c => c.battle));
  const replayed = replayCampaign(ctx.db, ctx.world, "default", 3, result.commands,
    () => { throw new Error("battle reran"); });
  assert.equal(campaignHash(replayed), campaignHash(result.state));
});
