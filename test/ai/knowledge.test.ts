import test from "node:test";
import assert from "node:assert/strict";
import { emptyKnowledge, ownUnits, updateKnowledge, publicLayers, reveal, observe, knownLayers, maskedState } from "../../src/ai/knowledge.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

function setup() {
  const rules = createStubRules();
  const s = makeStubBattle({ width: 12, height: 3, units: [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, perception: 2, abilities: ["stub:ability/scan"] },
    { id: "b", owner: "e", pos: { x: 2, y: 2 }, abilities: [] },
    { id: "c", owner: "e", pos: { x: 8, y: 0 }, abilities: [] },
  ] }, 1);
  s.units.b!.parts.torso!.layers[1]!.hp = 7;
  return { ...rules, s };
}

test("DC-C09 knowledge：共享感測內可見、視野外遮蔽，僅 active 本方感測", () => {
  const { q, s } = setup();
  assert.deepEqual(ownUnits(q, s, "p"), ["a"]);
  assert.deepEqual(updateKnowledge(q, s, "p", emptyKnowledge()).visible, ["b"]);
  s.units.a!.pos = { x: 6, y: 0 };
  assert.deepEqual(updateKnowledge(q, s, "p", emptyKnowledge()).visible, ["c"]);
  s.rt!.unitStatus.a = "dead";
  assert.deepEqual(updateKnowledge(q, s, "p", emptyKnowledge()).visible, []);
});

test("knowledge lastSeen 在 ttl 邊界保留、過期移除，移除死亡或不存在的揭露", () => {
  const { q, s } = setup();
  const prev = reveal(q, s, updateKnowledge(q, s, "p", emptyKnowledge()), "b");
  prev.revealed.absent = {};
  s.units.a!.pos = { x: 11, y: 0 };
  s.round = 3;
  assert.deepEqual(updateKnowledge(q, s, "p", prev).lastSeen.b, { cell: { x: 2, y: 2 }, round: 0 });
  s.round = 4;
  s.rt!.unitStatus.b = "dead";
  const next = updateKnowledge(q, s, "p", prev);
  assert.equal(next.lastSeen.b, undefined);
  assert.deepEqual(next.revealed, {});
});

test("DC-T08 publicLayers 只公開外層 HP，未偵察內層為 null", () => {
  const { q, s } = setup();
  s.units.b!.parts.torso!.layers[0]!.hp = 11;
  assert.deepEqual(publicLayers(q, s, "b").torso, [
    { type: "armor", max: 40, hp: 11 }, { type: "structure", max: 30, hp: null },
  ]);
  assert.deepEqual(knownLayers(q, s, emptyKnowledge(), "b", "torso"), publicLayers(q, s, "b").torso);
});

test("DC-T08 observe 本方 scan 能力揭露內層實值，敵方事件不揭露", () => {
  const { q, exec, s } = setup();
  const result = exec(s, { kind: "useAbility", actor: "a", ability: "stub:ability/scan", target: { unit: "b" } });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const next = observe(q, s, emptyKnowledge(), "p", result.events);
  assert.equal(knownLayers(q, s, next, "b", "torso")[1]!.hp, 7);
  assert.deepEqual(observe(q, s, emptyKnowledge(), "e", result.events).revealed, {});
});

test("DC-C09 maskedState 刪不可見敵人、order、status，未偵察內層估滿 HP", () => {
  const { q, s } = setup();
  const k = updateKnowledge(q, s, "p", emptyKnowledge());
  const view = maskedState(q, s, "p", k);
  assert.equal(view.units.c, undefined);
  assert.equal(view.rt!.unitStatus.c, undefined);
  assert.deepEqual(view.order, ["a", "b"]);
  assert.deepEqual(view.units.b!.parts.torso!.layers[1], { hp: 30, broken: false });
  const scanned = maskedState(q, s, "p", reveal(q, s, k, "b"));
  assert.equal(scanned.units.b!.parts.torso!.layers[1]!.hp, 7);
  assert.deepEqual(view.units.a, s.units.a);
});

test("knowledge 純函式不改輸入，回傳資料可獨立修改", () => {
  const { q, s } = setup();
  const k = updateKnowledge(q, s, "p", emptyKnowledge()), before = structuredClone({ s, k });
  const next = updateKnowledge(q, s, "p", k);
  next.lastSeen.b!.cell.x = 99;
  const revealed = reveal(q, s, k, "b");
  knownLayers(q, s, revealed, "b", "torso")[1]!.hp = 999;
  assert.equal(revealed.revealed.b!.torso![1]!.hp, 7);
  observe(q, s, k, "p", []).visible.push("other");
  publicLayers(q, s, "b").torso![0]!.hp = 0;
  maskedState(q, s, "p", k).units.a!.pos.x = 99;
  assert.deepEqual({ s, k }, before);
});
