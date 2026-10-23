import test from "node:test";
import assert from "node:assert/strict";
import { dangerAt, dangerMap, threatOf } from "../../src/ai/danger.ts";
import { emptyKnowledge } from "../../src/ai/knowledge.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

test("danger 包含射程加移動可達距離，超出與界外沒有危險", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 10, height: 10, units: [
    { id: "e", owner: "e", pos: { x: 1, y: 1 }, ap: 2, abilities: ["stub:ability/rifle"] },
  ] }, 1);
  const before = structuredClone(s), d = dangerMap(q, s, "p", emptyKnowledge());
  assert.equal(threatOf(q, s, "e"), 2);
  assert.equal(dangerAt(d, { x: 7, y: 7 }), 2);
  assert.equal(dangerAt(d, { x: 8, y: 7 }), 0);
  assert.equal(dangerAt(d, { x: -1, y: 0 }), 0);
  assert.deepEqual(s, before);
});

test("danger ZoC 僅距離 1 再加一半威脅", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 5, height: 5, units: [
    { id: "e", owner: "e", pos: { x: 2, y: 2 }, ap: 0, abilities: ["stub:ability/claw"] },
  ] }, 1);
  const d = dangerMap(q, s, "p", emptyKnowledge());
  assert.equal(threatOf(q, s, "e"), 1.5);
  assert.equal(dangerAt(d, { x: 1, y: 1 }), 2.25);
  assert.equal(dangerAt(d, { x: 2, y: 2 }), 1.5);
  assert.equal(dangerAt(d, { x: 4, y: 4 }), 0);
});

test("danger lastSeen 不在 view 才有半徑 2 的固定常數", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 6, height: 6, units: [
    { id: "visible", owner: "e", pos: { x: 5, y: 5 }, abilities: [] },
  ] }, 1);
  const k = emptyKnowledge();
  k.lastSeen.hidden = { cell: { x: 0, y: 0 }, round: 0 };
  k.lastSeen.visible = { cell: { x: 5, y: 5 }, round: 0 };
  const d = dangerMap(q, s, "p", k);
  assert.equal(dangerAt(d, { x: 2, y: 2 }), 1);
  assert.equal(dangerAt(d, { x: 3, y: 2 }), 0);
  assert.equal(dangerAt(d, { x: 5, y: 5 }), 0);
  assert.equal(Object.keys(d).length, 9);
});

test("danger 無攻擊能力、友方與非 active 不貢獻", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 5, height: 5, units: [
    { id: "scan", owner: "e", pos: { x: 0, y: 0 }, abilities: ["stub:ability/scan", "stub:ability/repair"] },
    { id: "dead", owner: "e", pos: { x: 1, y: 1 }, abilities: ["stub:ability/rifle"] },
    { id: "own", owner: "p", pos: { x: 3, y: 3 }, abilities: ["stub:ability/rifle"] },
  ] }, 1);
  s.rt!.unitStatus.dead = "dead";
  assert.equal(threatOf(q, s, "scan"), 0);
  assert.deepEqual(dangerMap(q, s, "p", emptyKnowledge()), {});
});
