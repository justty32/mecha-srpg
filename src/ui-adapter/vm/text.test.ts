import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { createSession } from "../../sim/session.ts";
import type { GameEvent } from "../../core/events.ts";
import { eventText } from "./text.ts";

const { db } = loadContentDirs(["content/base"]);
const state = createSession({ db, sim: scenarioToSetup(db, "scenario/skirmish-whitegloves", 1), seed: 1 }).state;
const id = "player-0", u = state.units[id]!, person = Object.values(u.seats).find(x => x)!;
const frame = db.require("frame", u.frame), ability = db.all("ability")[0]!;
const part = db.require("bodyplan", frame.bodyPlan).parts[0]!, effect = db.all("effect")[0]!;
function event(type: string): GameEvent {
  return { seq: 1, round: 1, type, payload: { unit: id, target: "enemy-0", person, owner: id,
    ability: ability.id, part: part.id, layerType: part.layers[0]!.type, effect: effect.id,
    amount: 5, to: type === "Moved" ? [2, 3] : "shaken", winner: "player" } };
}

test("text：指定十三種事件各產生中文", () => {
  for (const type of ["TurnStart", "Moved", "AbilityUsed", "Hit", "Miss", "LayerDamaged", "LayerBroken",
    "PartBroken", "EffectApplied", "UnitDied", "MoraleChanged", "RoundStart", "BattleEnd"]) {
    const line = eventText(db, state, event(type));
    assert.ok(line, type); assert.match(line.text, /\p{Script=Han}/u); assert.equal(line.seq, 1);
  }
  assert.equal(eventText(db, state, event("PoolChanged")), null);
});


test("BattleEnd：reason或detail擊退補中性撤離說明，平局與非擊退不變", () => {
  for (const winner of ["player", "enemy"]) for (const key of ["reason", "detail"]) {
    const evt = event("BattleEnd"); evt.payload = { winner, [key]: "repelled" };
    assert.equal(eventText(db, state, evt)!.text, `戰鬥結束，${winner}陣營獲勝——對方判斷戰況不利，撤離戰場`);
  }
  const evt = event("BattleEnd"); evt.payload = { winner: "player", reason: "eliminate" };
  assert.equal(eventText(db, state, evt)!.text, "戰鬥結束，player陣營獲勝");
  evt.payload = { winner: null, reason: "repelled" };
  assert.equal(eventText(db, state, evt)!.text, "戰鬥結束，平局");
});
