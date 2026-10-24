import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { createBattle } from "../../rules/index.ts";
import type { GameEvent } from "../../core/events.ts";
import { eventText, unitName } from "./text.ts";

const { db } = loadContentDirs(["content/base"]);
const state = createBattle(db, scenarioToSetup(db, "scenario/skirmish-whitegloves", 1).setup, 1);
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
test("text：人物、機體、能力、部位、效果均引用內容名稱", () => {
  assert.ok(unitName(db, state, id).includes(frame.name));
  assert.ok(unitName(db, state, id).includes(db.require("person", state.persons[person]!.def).name));
  assert.ok(eventText(db, state, event("AbilityUsed"))!.text.includes(ability.name));
  assert.ok(eventText(db, state, event("PartBroken"))!.text.includes(part.name));
  assert.ok(eventText(db, state, event("EffectApplied"))!.text.includes(effect.name));
});
