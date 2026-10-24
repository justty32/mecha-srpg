import test from "node:test";
import assert from "node:assert/strict";
import { classifyOutcome } from "./outcome.ts";
import { fixture, result } from "./test-support.ts";

test("分類讀撤離欄位／reason，舊戰果用單位推斷並計 killRatio", () => {
  const { s, sortie, mech } = fixture();
  const battle = result(), own = structuredClone(s.mechs[mech]!);
  battle.units = [{ id: mech, status: "alive", state: own },
    { id: "enemy-dead", status: "dead", state: { ...own, owner: "enemy" } },
    { id: "enemy-retreated", status: "retreated", state: { ...own, owner: "enemy" } }];
  assert.deepEqual(classifyOutcome(battle, sortie), { outcome: "repelled", killRatio: .5 });
  battle.units[2]!.status = "alive";
  assert.equal(classifyOutcome({ ...battle, withdrawn: ["enemy"] }, sortie).outcome, "repelled");
  assert.equal(classifyOutcome({ ...battle, reason: "repelled" }, sortie).outcome, "repelled");
  assert.equal(classifyOutcome({ ...battle, withdrawn: ["player"] }, sortie).outcome, "withdrew");
  assert.equal(classifyOutcome({ ...battle, reason: "withdrew" }, sortie).outcome, "withdrew");
  battle.units[0]!.status = "retreated";
  assert.equal(classifyOutcome(battle, sortie).outcome, "withdrew");
  battle.units[0]!.id = "player-0";
  assert.equal(classifyOutcome(battle, sortie).outcome, "withdrew");
  battle.units = [];
  assert.equal(classifyOutcome(battle, sortie).outcome, "win");
  assert.equal(classifyOutcome({ ...battle, winner: "ally" }, sortie).outcome, "win");
  assert.equal(classifyOutcome({ ...battle, winner: null, reason: "timeout" }, sortie).outcome, "timeout");
  assert.equal(classifyOutcome({ ...battle, winner: "enemy" }, sortie).outcome, "lost");
});
