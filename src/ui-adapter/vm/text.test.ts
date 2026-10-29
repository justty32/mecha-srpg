import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { createSession } from "../../sim/session.ts";
import type { GameEvent } from "../../core/events.ts";
import { eventText, unitName } from "./text.ts";

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
test("text：人物、機體、能力、部位、效果均引用內容名稱", () => {
  assert.ok(unitName(db, state, id).includes(frame.name));
  assert.ok(unitName(db, state, id).includes(db.require("person", state.persons[person]!.def).name));
  assert.ok(eventText(db, state, event("AbilityUsed"))!.text.includes(ability.name));
  assert.ok(eventText(db, state, event("PartBroken"))!.text.includes(part.name));
  assert.ok(eventText(db, state, event("EffectApplied"))!.text.includes(effect.name));
});

test("text：真防禦顯示承傷部位與剩次，不誤稱未命中", () => {
  for (const [type, word] of [["DefensePrepared", "準備"], ["AttackBlocked", "盾擋"], ["AttackParried", "招架"], ["DefenseOverloaded", "破勢"]]) {
    const e = event(type!); e.payload = { ...e.payload, actor: "enemy-0", kind: "block", charges: 1 };
    const text = eventText(db, state, e)!.text;
    assert.ok(text.includes(word!)); assert.ok(text.includes(part.name));
    assert.equal(/未命中|DefensePrepared|AttackBlocked|AttackParried|DefenseOverloaded/u.test(text), false);
    if (type !== "DefenseOverloaded") assert.match(text, /1 次/u);
  }
  assert.equal(eventText(db, state, event("PartHit")), null);
});

test("text：投石與回收引用內容名稱，分辨失血、生體死亡及機械擊毀", () => {
  const copy = structuredClone(state);
  copy.map.objects = [{ id: "internal-wreck-123", name: "破損機砲殘骸", kind: "wreck", at: { x: 0, y: 0 }, collected: true }];
  const collected = event("BattlefieldObjectCollected"); collected.payload.object = "internal-wreck-123";
  assert.match(eventText(db, copy, collected)!.text, /回收破損機砲殘骸/u);
  assert.equal(/internal-wreck-123/u.test(eventText(db, copy, collected)!.text), false);
  assert.match(eventText(db, copy, event("DebrisThrown"))!.text, /投擲碎石/u);
  assert.match(eventText(db, copy, event("UnitDied"))!.text, /被擊毀/u);
  const died = event("UnitDied"); died.payload.unit = "player-2";
  const blood = copy.units["player-2"]!.pools.blood!;
  blood.cur = 0;
  assert.match(eventText(db, copy, died)!.text, /失血死亡/u);
  blood.cur = 50;
  const biological = eventText(db, copy, died)!.text;
  assert.match(biological, /死亡/u); assert.equal(/失血|擊毀/u.test(biological), false);
});
