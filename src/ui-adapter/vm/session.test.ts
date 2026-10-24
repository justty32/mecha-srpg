import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { replay } from "../../sim/replay.ts";
import { hashLog } from "../../core/eventlog.ts";
import { BattleSession } from "./session.ts";

const { db } = loadContentDirs(["content/base"]);
const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1);
function session(): BattleSession { return new BattleSession({ db, sim, seed: 1 }); }
function end(s: BattleSession): void { assert.equal(s.submit({ kind: "end", actor: s.activeUnit()! }).ok, true); }

test("session：建立後輪到玩家或已分勝負", () => {
  const s = session(); assert.ok(s.isPlayerTurn() || s.outcome());
});
test("session：玩家結束回合後 AI 跑到玩家", () => {
  const s = session();
  for (let i = 0; i < 4 && !s.outcome(); i++) { end(s); assert.ok(s.isPlayerTurn() || s.outcome()); }
  assert.ok(s.commands.some(c => s.state.units[c.actor]!.owner !== s.playerSlot));
});
test("session：非玩家回合拒絕 submit", () => {
  const s = session(), before = hashLog(s.state.log), count = s.commands.length;
  s.state.rt!.active = "enemy-0";
  const result = s.submit({ kind: "end", actor: "enemy-0" });
  assert.deepEqual(result, { ok: false, rejection: { code: "not-active" } });
  assert.equal(s.commands.length, count); assert.equal(hashLog(s.state.log), before);
});
test("session：相同 seed 與指令的 hash 一致", () => {
  const a = session(), b = session();
  for (let i = 0; i < 8 && !a.outcome(); i++) { end(a); end(b); }
  assert.deepEqual(a.commands, b.commands); assert.equal(hashLog(a.state.log), hashLog(b.state.log));
});
test("session：全部成功指令可重播得到相同 hash", () => {
  const s = session();
  for (let i = 0; i < 8 && !s.outcome(); i++) end(s);
  assert.equal(hashLog(replay(db, sim.setup, 1, s.commands).log), hashLog(s.state.log));
});
