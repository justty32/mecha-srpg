import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignTools } from "./campaign.ts";
import { createEnv } from "./tool.ts";
import type { ToolResult } from "./tool.ts";
import { runCampaign, defaultBattleRunner, campaignHash, loadCampaign } from "../ops/sim/index.ts";

function setup() {
  const env = createEnv(), tools = createCampaignTools(env);
  const call = async (name: string, args: Record<string, unknown>) => {
    const tool = tools.find(t => t.name === name); assert.ok(tool, name);
    return await tool.handler(args);
  };
  return { env, call };
}
function data(result: ToolResult): Record<string, any> {
  assert.ok(!result.isError, JSON.stringify(result));
  return result.structuredContent!;
}
function summary(result: ToolResult): string { return (result.content[0] as { text: string }).text; }

test("營運資訊：每台機庫部位百分比、駕駛名、look 詳情與 pending 選項", async () => {
  const { call } = setup(), initial = data(await call("campaign_new", { seed: 5 })), { id } = initial;
  const pilots = initial.panels.roster.filter((p: { role: string }) => p.role === "pilot");
  for (const [i, m] of initial.panels.hangar.entries()) data(await call("campaign_act", { id,
    command: { v: "assign", person: pilots[i].id, seat: { mech: m.id, seat: "pilot" } } }));
  const view = await call("campaign_view", { id }), hangar = data(view).panels.hangar;
  assert.equal(hangar.length, initial.panels.hangar.length);
  for (const [i, m] of hangar.entries()) {
    assert.equal(m.pilot, pilots[i].name);
    assert.ok(summary(view).includes(m.pilot));
    assert.ok(m.parts.length > 0);
    for (const p of m.parts) for (const l of p.layers) {
      assert.equal(l.percent, 100);
      assert.ok(summary(view).includes(`${l.percent}%`));
    }
  }
  const looked = await call("campaign_act", { id, command: { v: "look", target: hangar[0].id } });
  assert.ok(summary(looked).includes(hangar[0].name));
  assert.ok(data(looked).commandInfo.includes(hangar[0].name));
  assert.match(data(await call("campaign_act", { id, command: { v: "help" } })).commandInfo, /look/);
  const catalog = data(await call("campaign_actions", { id })).catalog;
  assert.ok(catalog.market.some((item: any) => item.cmd.v === "trade" && typeof item.price === "number"));
  assert.ok(catalog.research.some((item: any) => item.cmd.v === "queue" && item.requires && item.cost));
  const badId = await call("campaign_act", { id, text: "買 不存在" });
  assert.match(summary(badId), /可用的 id/);
  assert.ok((badId.structuredContent!.candidates as string[]).length <= 10);
  const pending = data(await call("campaign_advance", { id, days: 30 })).view.prompt;
  assert.ok(pending?.choices.length);
  const rejected = await call("campaign_act", { id, command: { v: "board" } });
  assert.equal(rejected.isError, true);
  assert.equal(rejected.structuredContent!.error, "pending-choice");
  assert.ok(summary(rejected).includes(pending.text));
  for (const choice of pending.choices) {
    assert.ok(summary(rejected).includes(choice.text));
    assert.ok(summary(rejected).includes(JSON.stringify({ v: "choose", choice: choice.n })));
  }
});

test("出戰資訊：actions／唯讀 preview 與自動戰果報告", async () => {
  const { env, call } = setup(), { db, world } = env.world();
  let seed = 1, run, index = -1;
  for (; seed <= 7; seed++) {
    run = runCampaign({ db, world, seed, start: "default", months: 1, policy: "greedy", battle: defaultBattleRunner });
    index = run.commands.findIndex(c => c.v === "sortie" && c.battle?.outcome.ok);
    if (index >= 0) break;
  }
  assert.ok(run && index >= 0);
  const { id } = data(await call("campaign_new", { seed }));
  for (const { battle: _, ...command } of run.commands.slice(0, index)) await call("campaign_act", { id, command });
  const command = run.commands[index]!; assert.equal(command.v, "sortie");
  for (const unit of (command as any).sortie.units) if (unit.seats.pilot) data(await call("campaign_act", { id,
    command: { v: "assign", person: unit.seats.pilot, seat: { mech: unit.mech, seat: "pilot" } } }));
  const before = data(await call("campaign_save", { id })).blob;
  // 遭遇待戰時仍可能列出已停用的契約出戰；本案驗證目前可執行的兩種出戰入口。
  const actions = data(await call("campaign_actions", { id })).actions.filter((a: any) => !a.disabled && (a.cmd?.v === "sortie" || a.tool === "campaign_sortie_begin"));
  assert.ok(actions.length >= 2);
  for (const action of actions) {
    assert.ok(action.preview.enemies.length > 0);
    assert.ok(action.preview.enemies.every((e: any) => e.name && e.grade && e.count > 0));
    assert.match(action.preview.objective, /殲滅|存活|控制|護送|捕獲|到達|擊毀/);
  }
  const preview = data(await call("campaign_sortie_preview", { id, sortie: (command as any).sortie })).preview;
  assert.ok(preview.map.width > 0 && preview.map.height > 0);
  assert.ok(preview.maxRounds > 0);
  const after = data(await call("campaign_save", { id })).blob;
  assert.equal(after.snapshotHash, before.snapshotHash);
  assert.equal(campaignHash(loadCampaign(db, world, before)), campaignHash(loadCampaign(db, world, after)));
  const { battle: _, ...cmd } = command;
  const result = await call("campaign_act", { id, command: cmd }), report = data(result).report;
  assert.match(summary(result), /現金變化：[+-]\d+\.\d{2}/);
  assert.equal(typeof report.cashDelta, "number");
  assert.deepEqual(report.mechs.map((m: any) => m.id), (command as any).sortie.units.map((u: any) => u.mech));
  for (const m of report.mechs) { assert.ok(m.status); assert.ok(summary(result).includes(m.name)); }
  assert.ok(Array.isArray(report.persons) && Array.isArray(report.destroyed) && Array.isArray(report.captured));
  assert.equal(report.lootCount, command.battle!.result!.loot.length);
});
