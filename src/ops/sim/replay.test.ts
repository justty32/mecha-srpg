import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../world/test-support.ts";
import { runCampaign } from "./campaign.ts";
import { replayCampaign } from "./replay.ts";
import { campaignHash, createCampaignBlob, serializeCampaign, parseCampaign, loadCampaign } from "./save.ts";
import { defaultBattleRunner } from "./battle.ts";
test("同輸入與同 runner 重播 state hash 相等", () => {
  const { ctx } = fixture();
  const result = runCampaign({ ...ctx, start: "default", seed: 7, months: 2, policy: "greedy", battle: defaultBattleRunner });
  assert(result.state.log.some(e => e.type === "BattleResolved"));
  const a = replayCampaign(ctx.db, ctx.world, "default", 7, result.commands, defaultBattleRunner);
  const b = replayCampaign(ctx.db, ctx.world, "default", 7, result.commands, defaultBattleRunner);
  assert.equal(campaignHash(a), campaignHash(result.state)); assert.equal(campaignHash(a), campaignHash(b));
});
test("存檔序列化來回重播校驗；被改過的 hash 拒載", () => {
  const { ctx } = fixture();
  const result = runCampaign({ ...ctx, start: "default", seed: 1, months: 2, policy: "idle" });
  const blob = createCampaignBlob("default", 1, result.commands, result.state), source = serializeCampaign(blob);
  assert.deepEqual(parseCampaign(source), blob);
  assert.equal(campaignHash(loadCampaign(ctx.db, ctx.world, source)), blob.snapshotHash);
  assert.throws(() => loadCampaign(ctx.db, ctx.world, { ...blob, snapshotHash: "0".repeat(16) }), /snapshot-hash-mismatch/);
});
