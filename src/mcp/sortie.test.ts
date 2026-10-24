import test from "node:test";
import assert from "node:assert/strict";
import { createMcpServer } from "./server.ts";
import { createEnv } from "./tool.ts";
import type { ToolResult } from "./tool.ts";
import type { OpsCommand } from "../ops/state/types.ts";
// 固定 seed 與程序；候選 ID 只取自工具畫面，不依賴營運內容的生成順序。
const env = createEnv();
function data(result: ToolResult): Record<string, any> {
  assert.ok(!result.isError, JSON.stringify(result));
  assert.ok(result.structuredContent);
  return result.structuredContent;
}
function summary(result: ToolResult): string { return (result.content[0] as { text: string }).text; }
async function setup() {
  const server = createMcpServer(env);
  const call = async (name: string, args: Record<string, unknown>): Promise<ToolResult> => {
    const response = JSON.parse((await server.handle(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })))!);
    assert.ok(!response.error, JSON.stringify(response));
    return response.result;
  };
  let lastSummary = "";
  for (let seed = 1; seed <= 7; seed++) {
    const { id } = data(await call("campaign_new", { seed }));
    let assigned = false, accepted: string | undefined;
    // 每步最多送一條前置命令；第 120 步後仍讀一次畫面確認是否已可出戰。
    for (let step = 0; step <= 120; step++) {
      const screen = await call("campaign_view", { id }), view = data(screen);
      const actions = data(await call("campaign_actions", { id })).actions as { cmd?: OpsCommand; disabled?: string; preview?: { error?: string } }[];
      const enabled = actions.flatMap(a => !a.disabled && !a.preview?.error && a.cmd ? [a.cmd] : []);
      const choice = enabled.find(c => c.v === "choose");
      const sortie = enabled.find(c => c.v === "sortie");
      if (!view.prompt && assigned && sortie) {
        const saved = data(await call("campaign_save", { id }));
        return { call, id: id as string, command: sortie, before: saved.blob };
      }
      lastSummary = `seed=${seed}\n${summary(screen)}`;
      if (step === 120) break;
      let command: OpsCommand = { v: "wait", days: 1 };
      if (view.prompt) {
        assert.ok(choice, `沒有未停用的事件選項：\n${summary(screen)}`);
        command = choice;
      } else if (!assigned) {
        const hangar = view.panels.hangar as { id: string; dormant: boolean; seats: Record<string, string | null> }[];
        const roster = view.panels.roster as { id: string; role: string }[];
        const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);
        const mech = hangar.filter(m => !m.dormant && Object.hasOwn(m.seats, "pilot") && !m.seats.pilot).sort(byId)[0];
        const seated = new Set(hangar.flatMap(m => Object.values(m.seats)));
        const pilot = roster.filter(p => p.role === "pilot" && !seated.has(p.id)).sort(byId)[0];
        assert.ok(mech && pilot, `沒有可派的機甲與駕駛：\n${summary(screen)}`);
        command = { v: "assign", person: pilot.id, seat: { mech: mech.id, seat: "pilot" } };
        assigned = true;
      } else if (!accepted) {
        const accept = enabled.filter(c => c.v === "accept").sort((a, b) => a.contract.localeCompare(b.contract))[0];
        if (accept) { command = accept; accepted = accept.contract; }
      } else {
        const contract = view.panels.contracts?.find((c: { id: string }) => c.id === accepted);
        const sail = enabled.find(c => c.v === "sail" && c.to === contract?.target);
        const ship = view.panels.ship[0];
        // actions 未列航行時，依結構化契約目標組命令；航行中逐日等待。
        if (contract && ship.at !== contract.target && !ship.destination) command = sail ?? { v: "sail", to: contract.target };
      }
      data(await call("campaign_act", { id, command }));
    }
    data(await call("campaign_close", { id }));
  }
  throw new Error(`出戰 fixture 在 seed 1–7 各 120 步內未完成；最後畫面：\n${lastSummary}`);
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
