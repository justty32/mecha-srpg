import { placeAt } from "../../../ops/war/loc.ts";
import { allPlaces } from "../../../ops/world/places.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { campaignHash, parseCampaign } from "../../../ops/sim/save.ts";
import { OpsController } from "./index.ts";
import { allButtons } from "./keymap.ts";
import type { OpsSnapshot, OpsKeyInput } from "./types.ts";
const { db, world } = loadWorldDirs(["content/base"]);
const opts = { db, world, seed: 3, spectate: true };
function input(key: string): OpsKeyInput {
  const parts = key.split("+"), last = parts.pop()!;
  return { key: last === "Esc" ? "Escape" : last, altKey: parts.includes("Alt"), ctrlKey: parts.includes("Ctrl"), shiftKey: parts.includes("Shift") };
}
function verifySnapshot(c: OpsController, s: OpsSnapshot = c.snapshot()): void {
  const fields = ["header", "tab", "tabs", "timeButtons", "room", "roomButtons", "world", "contracts", "roster", "mechs", "ledger", "market", "calendar", "panels", "log", "prompt", "sortie", "battle", "report", "message", "keyHints", "showHelp", "over"];
  assert.deepEqual(Object.keys(s).sort(), fields.sort());
  function defined(value: unknown): void {
    assert.notEqual(value, undefined);
    if (value && typeof value === "object") for (const child of Object.values(value)) defined(child);
  }
  defined(s);
  for (const b of allButtons(s)) {
    assert.equal(typeof b.enabled, "boolean");
    if (!b.enabled) assert.ok(b.reason);
    if (b.enabled && b.key) assert.deepEqual(c.key(input(b.key)), b.action, b.id);
  }
  if (s.prompt) for (const b of allButtons(s)) if (!(b.action.type === "cmd" && b.action.cmd.v === "choose")) {
    assert.equal(b.enabled, false); assert.equal(b.reason, "先回應事件");
  }
  assert.equal(s.world.nodes.length, allPlaces(c.state, { world }).length);
  assert.equal(s.calendar.days.length, s.calendar.daysPerMonth);
}
function prompts(c: OpsController): void {
  for (let i = 0; c.snapshot().prompt && i < 30; i++) {
    const s = c.snapshot(); verifySnapshot(c, s);
    const choice = s.prompt!.choices.find(c => c.enabled && c.text === "交涉") ?? s.prompt!.choices.find(c => c.enabled); assert.ok(choice);
    c.dispatch({ type: "cmd", cmd: { v: "choose", choice: choice.n } });
  }
  assert.equal(c.snapshot().prompt, null);
}
function prepared(): { c: OpsController; contract: string } {
  const c = new OpsController(opts); verifySnapshot(c);
  for (let i = 0; !Object.values(c.state.contracts).some(c => c.status === "offered") && i < 30; i++) {
    prompts(c); c.dispatch({ type: "advance", until: "event" });
  }
  prompts(c);
  const contract = Object.values(c.state.contracts).find(c => c.status === "offered"); assert.ok(contract);
  c.dispatch({ type: "selectContract", contract: contract.id }); verifySnapshot(c);
  const accepted = c.dispatch({ type: "cmd", cmd: { v: "accept", contract: contract.id } }); assert.equal(accepted.message, null);
  c.dispatch({ type: "cmd", cmd: { v: "sail", to: contract.target.place } });
  for (let i = 0; placeAt(c.state, { world }, c.state.ship.pos) !== contract.target.place && i < 60; i++) {
    prompts(c);
    if (!c.state.ship.path) c.dispatch({ type: "cmd", cmd: { v: "sail", to: contract.target.place } });
    c.dispatch({ type: "advance", until: "event" });
  }
  prompts(c); assert.equal(placeAt(c.state, { world }, c.state.ship.pos), contract.target.place);
  c.dispatch({ type: "selectNode", node: contract.target.place }); verifySnapshot(c);
  const s = c.dispatch({ type: "sortieOpen", contract: contract.id });
  assert.ok(s.sortie); assert.equal(s.sortie.error, null); assert.ok(s.sortie.units.some(u => u.included)); verifySnapshot(c, s);
  return { c, contract: contract.id };
}
function finished(c: OpsController, contract: string): void {
  const s = c.snapshot(); assert.ok(s.report); assert.ok(s.report.lines.length);
  assert.equal(s.battle, null); assert.equal(c.battleController(), null);
  assert.ok(c.state.log.some(e => e.type === "BattleResolved"));
  assert.notEqual(c.state.contracts[contract]!.status, "active");
  verifySnapshot(c, s);
  const saved = c.serialize(), restored = OpsController.fromSave(opts, saved);
  assert.equal(campaignHash(restored.state), campaignHash(c.state));
  assert.ok(parseCampaign(saved).commands.some(cmd => cmd.battle?.result));
}
test("seed 3 完整 command 出戰、spectate skip、兩段回寫、戰果與重播", () => {
  const { c, contract } = prepared(), before = campaignHash(c.state);
  const s = c.dispatch({ type: "sortieLaunch", mode: "command" });
  assert.ok(s.battle); assert.equal(s.battle.spectate, true); assert.equal(campaignHash(c.state), before);
  assert.throws(() => c.serialize(), /完成戰鬥/);
  const battle = c.battleController()!; assert.ok(battle);
  assert.match(c.dispatch({ type: "battleDone" }).message!, /尚未分出勝負/);
  assert.equal(campaignHash(c.state), before);
  c.dispatch({ type: "advance", until: "day" }); assert.equal(campaignHash(c.state), before);
  for (let i = 0; !battle.session.outcome() && i < 1000; i++) battle.dispatch({ type: "skip" });
  assert.ok(battle.session.outcome());
  c.dispatch({ type: "battleDone" }); finished(c, contract);
  const after = campaignHash(c.state); c.dispatch({ type: "battleDone" }); assert.equal(campaignHash(c.state), after);
});
test("seed 3 完整 auto 出戰、戰果與 serialize/fromSave 雜湊一致", () => {
  const { c, contract } = prepared();
  c.dispatch({ type: "sortieLaunch", mode: "auto" }); finished(c, contract);
});
test("快照唯讀、鍵盤 disabled、編成取消與錯誤原因", () => {
  const c = new OpsController(opts), before = campaignHash(c.state);
  const s = c.snapshot(); s.header.cash = -999; const copy = c.state; copy.ledger.balances.cash = -999;
  assert.equal(campaignHash(c.state), before);
  assert.equal(c.dispatch({ type: "cmd", cmd: { v: "accept", contract: "missing" } }).message, "契約已非待接狀態");
  c.dispatch({ type: "advance", until: "event" }); assert.ok(c.snapshot().prompt);
  assert.equal(c.key({ key: "w" }), null); verifySnapshot(c);
  prompts(c);
  c.dispatch({ type: "toggleHelp" }); verifySnapshot(c);
  assert.deepEqual(c.key({ key: "Escape" }), { type: "cancel" }); c.dispatch({ type: "cancel" });
  c.dispatch({ type: "sortieOpen" }); verifySnapshot(c); c.dispatch({ type: "sortieCancel" }); assert.equal(c.snapshot().sortie, null);
});
test("ISS-042：spectate 互動出戰回寫含完整事件，計功／耗材與 auto 出戰一致", () => {
  const auto = prepared(), live = prepared();
  assert.equal(campaignHash(live.c.state), campaignHash(auto.c.state));
  auto.c.dispatch({ type: "sortieLaunch", mode: "auto" });
  live.c.dispatch({ type: "sortieLaunch", mode: "command" });
  const battle = live.c.battleController()!; assert.ok(battle);
  for (let i = 0; !battle.session.outcome() && i < 1000; i++) battle.dispatch({ type: "skip" });
  live.c.dispatch({ type: "battleDone" }); finished(live.c, live.contract);
  const recorded = (c: OpsController) => parseCampaign(c.serialize()).commands.findLast(cmd => cmd.battle?.result)!.battle!.result!;
  const a = recorded(auto.c), b = recorded(live.c);
  assert.ok(b.events?.length, "互動回寫的 BattleResult 應附 events");
  assert.equal(b.events!.length, a.events!.length);
  assert.deepEqual(live.c.state.contracts[live.contract], auto.c.state.contracts[auto.contract]);
  assert.deepEqual(live.c.state.inventory, auto.c.state.inventory);
  assert.deepEqual(live.c.state.ledger.balances, auto.c.state.ledger.balances);
  assert.equal(campaignHash(live.c.state), campaignHash(auto.c.state));
});
