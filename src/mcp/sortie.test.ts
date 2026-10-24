import test from "node:test";
import assert from "node:assert/strict";
import { createMcpServer } from "./server.ts";
import { createEnv } from "./tool.ts";
import type { ToolResult } from "./tool.ts";
import type { OpsCommand } from "../ops/state/types.ts";
import { runCampaign, defaultBattleRunner } from "../ops/sim/index.ts";

const env = createEnv();
let fixture: { seed: number; before: OpsCommand[]; command: Extract<OpsCommand, { v: "sortie" }> } | undefined;
function sortieFixture() {
  if (fixture) return fixture;
  const { db, world } = env.world();
  for (let seed = 1; seed <= 7; seed++) {
    const run = runCampaign({ db, world, seed, start: "default", months: 1, policy: "greedy", battle: defaultBattleRunner });
    const index = run.commands.findIndex(c => c.v === "sortie" && c.battle?.outcome.ok);
    if (index < 0) continue;
    const commands = run.commands.map(({ battle: _, ...cmd }) => cmd);
    fixture = { seed, before: commands.slice(0, index), command: commands[index] as Extract<OpsCommand, { v: "sortie" }> };
    return fixture;
  }
  throw new Error("seed 1–7 找不到可出戰點");
}
function data(result: ToolResult): Record<string, any> {
  assert.ok(!result.isError, JSON.stringify(result));
  assert.ok(result.structuredContent);
  return result.structuredContent;
}
function summary(result: ToolResult): string { return (result.content[0] as { text: string }).text; }
async function setup() {
  const server = createMcpServer(env), f = sortieFixture();
  const call = async (name: string, args: Record<string, unknown>): Promise<ToolResult> => {
    const response = JSON.parse((await server.handle(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })))!);
    assert.ok(!response.error, JSON.stringify(response));
    return response.result;
  };
  const { id } = data(await call("campaign_new", { seed: f.seed }));
  // 策略記錄可能包含被拒絕的命令；保留它們才能重建同一份歷史。
  for (const command of f.before) await call("campaign_act", { id, command });
  const saved = data(await call("campaign_save", { id }));
  return { call, id: id as string, command: f.command, before: saved.blob };
}

test("互動觀戰與 campaign_act 自動出戰的 campaignHash、勝負及輪數相同", async () => {
  const { call, id, command, before } = await setup();
  const other = data(await call("campaign_load", { blob: before })).id;
  const automated = data(await call("campaign_act", { id, command }));
  const started = data(await call("campaign_sortie_begin", { id: other, sortie: command.sortie, spectate: true, autoAdvance: false }));
  let observed = started;
  for (let guard = 0; guard < 100 && !observed.outcome; guard++) observed = data(await call("battle_step_ai", { id: started.battle, until: "end" }));
  assert.ok(observed.outcome);
  const finished = data(await call("campaign_sortie_finish", { id: other }));
  assert.equal(finished.battle.winner, automated.battle.winner);
  assert.equal(finished.battle.rounds, automated.battle.rounds);
  assert.equal(data(await call("campaign_save", { id: other })).blob.snapshotHash,
    data(await call("campaign_save", { id })).blob.snapshotHash);
});

test("玩家 battle_act 親手出戰後 campaign_save → campaign_load 重播 hash 相同", async () => {
  const { call, id, command } = await setup();
  const startedResult = await call("campaign_sortie_begin", { id, sortie: command.sortie });
  const started = data(startedResult);
  let observed = started, sent = 0, firstAction = "";
  for (let guard = 0; guard < 2000 && !observed.outcome; guard++) {
    if (observed.current?.playerTurn) {
      const legal = data(await call("battle_legal_actions", { id: started.battle }));
      const target = legal.abilities.flatMap((a: { targets: { action: any }[] }) => a.targets)
        .find((t: { action: { target?: { unit?: string } } }) => t.action.target?.unit?.startsWith(`${started.sortie.id}/`));
      const action = target?.action ?? legal.options.find((o: { action: { kind: string } }) => o.action.kind === "end").action;
      const acted = await call("battle_act", { id: started.battle, action });
      observed = data(acted); sent++;
      if (!firstAction) firstAction = `battle_act ${JSON.stringify(action)}\n${summary(acted).split("\n").slice(0, 3).join("\n")}`;
    } else observed = data(await call("battle_step_ai", { id: started.battle, until: "human" }));
  }
  assert.ok(sent > 0);
  assert.ok(observed.outcome);
  const finished = data(await call("campaign_sortie_finish", { id }));
  const saved = data(await call("campaign_save", { id }));
  const loaded = data(await call("campaign_load", { blob: JSON.stringify(saved.blob) }));
  const replayed = data(await call("campaign_save", { id: loaded.id }));
  assert.equal(replayed.blob.snapshotHash, saved.blob.snapshotHash);
  console.log(`親手出戰節錄\n${summary(startedResult).split("\n").slice(0, 2).join("\n")}\n${firstAction}\n成功 battle_act：${sent} 次\nfinish：${JSON.stringify(finished.battle)}\ncampaign_save hash=${saved.blob.snapshotHash}\ncampaign_load hash=${replayed.blob.snapshotHash}`);
});

test("pending 鎖住 act／advance、拒絕未完戰鬥 finish，cancel 後 campaignHash 不變", async () => {
  const { call, id, command, before } = await setup();
  data(await call("campaign_sortie_begin", { id, sortie: command.sortie, autoAdvance: false }));
  assert.equal((await call("campaign_act", { id, command: { v: "look" } })).isError, true);
  assert.equal((await call("campaign_advance", { id, days: 1 })).isError, true);
  const unfinished = await call("campaign_sortie_finish", { id });
  assert.equal(unfinished.isError, true);
  assert.match(summary(unfinished), /戰鬥尚未結束：第 .* 輪，輪到/);
  data(await call("campaign_sortie_cancel", { id }));
  assert.equal(data(await call("campaign_save", { id })).blob.snapshotHash, before.snapshotHash);
});
