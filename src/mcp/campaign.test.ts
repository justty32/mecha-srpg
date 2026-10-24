import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignTools } from "./campaign.ts";
import { createEnv } from "./tool.ts";
import type { ToolResult } from "./tool.ts";
import type { OpsCommand, Screen } from "../ops/state/types.ts";
import { runCampaign, campaignHash, defaultBattleRunner } from "../ops/sim/index.ts";
import { mkdirSync, readFileSync } from "node:fs";
import { relative, join } from "node:path";

function setup() {
  const env = createEnv(), tools = createCampaignTools(env);
  const call = async (name: string, args: Record<string, unknown>) => {
    const tool = tools.find(t => t.name === name);
    assert.ok(tool, name);
    return await tool.handler(args);
  };
  return { env, call };
}
function data(result: ToolResult): Record<string, any> {
  assert.ok(!result.isError, JSON.stringify(result));
  assert.ok(result.structuredContent);
  return result.structuredContent;
}

test("campaign_new / view：獨立 session、精簡畫面與 log 游標", async () => {
  const { call } = setup();
  const first = data(await call("campaign_new", { seed: 7 }));
  assert.equal(first.id, "c1");
  assert.ok(first.room.title);
  assert.ok(first.panels.ledger.some((r: { account: string }) => r.account === "cash"));
  assert.ok(first.log.length);
  assert.equal(first.rng, undefined);
  assert.equal(data(await call("campaign_new", { seed: 8, start: "start/default" })).id, "c2");
  assert.deepEqual(data(await call("campaign_view", { id: "c1" })).log, []);
  await call("campaign_advance", { id: "c1", days: 1 });
  const view = data(await call("campaign_view", { id: "c1", log: 1 }));
  assert.equal(view.log.length, 1);
  assert.ok(view.logOmitted > 0);
  assert.deepEqual(data(await call("campaign_view", { id: "c1" })).log, []);
  assert.equal(data(await call("campaign_view", { id: "c2" })).clock.day, first.clock.day);
});

test("campaign_actions / act：原樣 cmd、中文解析、錯誤與 candidates", async () => {
  const { call } = setup(), { id } = data(await call("campaign_new", { seed: 7 }));
  const actions = data(await call("campaign_actions", { id }));
  assert.equal(actions.verbs, undefined);
  assert.ok(data(await call("campaign_actions", { id, verbs: true })).verbs.some((v: { v: string }) => v.v === "sortie"));
  // map 指令補上世界圖（ops 本身不輸出）。
  const mapped = data(await call("campaign_act", { id, command: { v: "map" } }));
  assert.ok(mapped.view.panels.worldMap.length && mapped.view.panels.worldMap.every((n: { days: number }) => n.days > 0));
  const action = (actions.actions as Screen["actions"]).find(a => !a.disabled && a.cmd.v === "go")!;
  const moved = data(await call("campaign_act", { id, command: action.cmd }));
  assert.equal(moved.view.room.id, (action.cmd as Extract<OpsCommand, { v: "go" }>).room);
  data(await call("campaign_act", { id, text: "看" }));
  assert.equal((await call("campaign_act", { id, command: { v: "look" }, text: "看" })).isError, true);
  const error = await call("campaign_act", { id, text: "看 person" });
  assert.equal(error.isError, true);
  assert.ok((error.structuredContent!.candidates as string[]).length > 1);
  const invalid = await call("campaign_act", { id, command: { v: "choose", choice: 999 } });
  assert.equal(invalid.isError, true);
  assert.equal(invalid.structuredContent!.error, "invalid-choice");
});

test("campaign_advance：待選事件提前停、事件截斷與 choose 接續", async () => {
  const { call } = setup(), { id, clock } = data(await call("campaign_new", { seed: 7 }));
  const advance = data(await call("campaign_advance", { id, days: 30 }));
  assert.ok(advance.advancedDays < 30);
  assert.equal(advance.stoppedForChoice, true);
  assert.equal(advance.view.clock.day - clock.day, advance.advancedDays);
  assert.ok(advance.eventLog.length <= 20);
  assert.ok(advance.logOmitted >= 0);
  const result = await call("campaign_view", { id });
  assert.match((result.content[0] as { text: string }).text, /^要先 choose/);
  const choice = (data(await call("campaign_actions", { id })).actions as Screen["actions"]).find(a => a.cmd.v === "choose" && !a.disabled)!;
  data(await call("campaign_act", { id, command: choice.cmd }));
  assert.equal((await call("campaign_advance", { id, days: 0 })).isError, true);
});

test("campaign_auto：seed 7 greedy 一潮月 hash 等於直接 runCampaign", async () => {
  const { env, call } = setup(), { db, world } = env.world();
  const actual = data(await call("campaign_auto", { seed: 7, months: 1, policy: "greedy" }));
  const expected = runCampaign({ db, world, seed: 7, months: 1, start: "default", policy: "greedy", battle: defaultBattleRunner });
  assert.equal(actual.hash, campaignHash(expected.state));
  assert.deepEqual(actual.summary, expected.summary);
  assert.equal(actual.commandCount, expected.commands.length);
  assert.equal(actual.final.cash, expected.state.ledger.balances.cash);
  assert.equal(actual.final.debt, expected.state.ledger.balances.debt);
  assert.equal(actual.final.persons, Object.keys(expected.state.roster.persons).length);
  for (const policy of ["idle", "random"]) data(await call("campaign_auto", { seed: 7, months: 1, policy, battles: false }));
});

test("new → actions.cmd → act → save → load：日期與 cash 相同；close 隔離 session", async () => {
  const { env, call } = setup(), { id } = data(await call("campaign_new", { seed: 7 }));
  const action = (data(await call("campaign_actions", { id })).actions as Screen["actions"]).find(a => !a.disabled && a.cmd.v === "wait")!;
  assert.ok(action);
  data(await call("campaign_act", { id, command: action.cmd }));
  const saved = data(await call("campaign_save", { id }));
  const loaded = data(await call("campaign_load", { blob: saved.blob }));
  assert.notEqual(loaded.id, id);
  const before = data(await call("campaign_view", { id }));
  const after = data(await call("campaign_view", { id: loaded.id }));
  assert.deepEqual(after.clock, before.clock);
  const cash = (v: typeof before) => v.panels.ledger.find((r: { account: string }) => r.account === "cash").balance;
  assert.equal(cash(after), cash(before));
  const dir = `/tmp/cx-mcp-ops/save-${Date.now()}`;
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "campaign.json");
  data(await call("campaign_save", { id, path: relative(env.root, path) }));
  assert.deepEqual(JSON.parse(readFileSync(path, "utf8")), saved.blob);
  assert.deepEqual(data(await call("campaign_load", { path })).clock, before.clock);
  data(await call("campaign_load", { blob: JSON.stringify(saved.blob) }));
  assert.equal((await call("campaign_load", { blob: saved.blob, path })).isError, true);
  assert.equal((await call("campaign_load", { blob: { ...saved.blob, snapshotHash: "0000000000000000" } })).isError, true);
  assert.equal(data(await call("campaign_close", { id })).closed, true);
  assert.equal((await call("campaign_view", { id })).isError, true);
  data(await call("campaign_view", { id: loaded.id }));
});

test("campaign_act sortie：真實 AI 戰果與記錄可存檔重播", async () => {
  const { env, call } = setup(), { world } = env.world();
  const initial = data(await call("campaign_new", { seed: 1 })), { id } = initial;
  const pilots = initial.panels.roster.filter((p: { role: string }) => p.role === "pilot");
  const units = initial.panels.hangar.map((m: { id: string; seats: Record<string, string | null> }, i: number) => ({
    mech: m.id, seats: { ...m.seats, pilot: pilots[i].id }, controlMode: "pilot",
  }));
  for (const unit of units) data(await call("campaign_act", { id, command: { v: "assign", person: unit.seats.pilot, seat: { mech: unit.mech, seat: "pilot" } } }));
  const promptChoice = (actions: Screen["actions"]) => {
    const choices = actions.filter(a => a.cmd?.v === "choose" && !a.disabled);
    // 遭遇交涉保留原等待目標與航線；一般事件仍採第一個合法選項。
    return choices.find(a => a.cmd.v === "choose" && a.cmd.choice === 3 && a.label.includes("交涉")) ?? choices[0];
  };
  let view = data(await call("campaign_advance", { id, days: 28 })).view;
  let evadeDays = 0;
  for (let i = 0; view.prompt && i < 200; i++) {
    const choice = promptChoice(data(await call("campaign_actions", { id })).actions)!;
    if (view.pendingEncounter && choice.cmd.v === "choose" && choice.cmd.choice === 1) evadeDays++;
    const acted = data(await call("campaign_act", { id, command: choice.cmd }));
    view = acted.view;
  }
  assert.equal(view.clock.day, 28 + evadeDays);
  // 世界內容（事件／契約）持續增加，第 28 天不一定剛好有契約：逐日推進（處理待選）直到能承接，最多 30 天。
  const actionsNow = async () => data(await call("campaign_actions", { id })).actions as Screen["actions"];
  // 本案走一般契約航行與出戰；join 還需要作戰階段與部隊資格，另有履約測試。
  const normalAccept = (actions: Screen["actions"]) => actions.find(a => {
    if (a.cmd.v !== "accept" || a.disabled) return false;
    const id = a.cmd.contract, contract = view.panels.contracts.find((c: { id: string }) => c.id === id);
    // 承接時仍在期限內，不代表航行後能履約；保留兩日給途中事件。
    return contract && world.require("contract", contract.template).kind !== "join" && contract.travel
      && view.clock.day + contract.travel.days + 2 <= contract.deadlineDay;
  });
  let accept = normalAccept(await actionsNow());
  for (let i = 0; !accept && i < 60; i++) {
    const choice = promptChoice(await actionsNow());
    view = data(await call(choice ? "campaign_act" : "campaign_advance", choice ? { id, command: choice.cmd } : { id, days: 1 })).view;
    accept = normalAccept(await actionsNow());
  }
  assert.ok(accept);
  view = data(await call("campaign_act", { id, command: accept.cmd })).view;
  const active = view.panels.contracts.find((c: { status: string }) => c.status === "active");
  // 節點委託可能就在船所在地（already-there），此時不必航行。
  const sailed = await call("campaign_act", { id, command: { v: "sail", to: active.target } });
  if (sailed.isError) assert.match(JSON.stringify(sailed.structuredContent), /already-there/);
  else view = data(sailed).view;
  for (let i = 0; i < 90 && !view.pendingBattle && (view.prompt || view.panels.ship?.[0]?.place !== active.target); i++) {
    const choice = promptChoice(await actionsNow());
    const resail = !choice && !view.panels.ship?.[0]?.destination && view.panels.ship?.[0]?.place !== active.target;
    view = data(await call(choice || resail ? "campaign_act" : "campaign_advance", choice ? { id, command: choice.cmd }
      : resail ? { id, command: { v: "sail", to: active.target } } : { id, days: 1 })).view;
  }

  if (!view.pendingBattle) assert.ok(view.panels.contracts.some((c: { id: string; status: string }) =>
    c.id === active.id && c.status === "active"), `抵達時契約已失效：${active.id} day=${view.clock.day}`);
  const battle = data(await call("campaign_act", { id, command: { v: "sortie", sortie: view.pendingBattle
    ? { units } : { contract: active.id, place: active.target, units } } }));
  assert.ok(battle.battle.rounds > 0);
  assert.ok(Array.isArray(battle.battle.losses.mechs));
  assert.ok(Array.isArray(battle.battle.losses.persons));
  const saved = data(await call("campaign_save", { id }));
  const record = saved.blob.commands.find((cmd: { battle?: unknown }) => cmd.battle)?.battle;
  assert.ok(record?.result);
  const loaded = data(await call("campaign_load", { blob: JSON.stringify(saved.blob) }));
  assert.deepEqual(loaded.clock, battle.view.clock);
  assert.equal(data(await call("campaign_save", { id: loaded.id })).blob.snapshotHash, saved.blob.snapshotHash);
});
