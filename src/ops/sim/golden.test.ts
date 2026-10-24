import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fixture } from "../world/test-support.ts";
import type { OpsCommand } from "../state/types.ts";
import { replayCampaign } from "./replay.ts";
import { campaignHash } from "./save.ts";
test("黃金戰役固定指令的事件日誌 hash 相符", () => {
  const input = JSON.parse(readFileSync(`${import.meta.dirname}/fixtures/campaign.json`, "utf8")) as { start: string; seed: number; commands: OpsCommand[] };
  assert(input.commands.length >= 30 && input.commands.length <= 60);
  const { ctx } = fixture();
  const state = replayCampaign(ctx.db, ctx.world, input.start, input.seed, input.commands);
  const actual = { logHash: campaignHash(state.log), events: state.log.length, day: state.clock.day };
  const file = `${import.meta.dirname}/fixtures/campaign-hash.json`;
  if (process.env.GOLDEN_UPDATE === "1") writeFileSync(file, `${JSON.stringify(actual, null, 2)}\n`);
  assert.deepEqual(actual, JSON.parse(readFileSync(file, "utf8")));
  assert(state.log.some(e => e.type === "Chosen")); assert(state.log.some(e => e.type === "DaySummary"));
});
