import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { emptyKnowledge } from "../../src/ai/knowledge.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

// 規則線 fuzz 回報：AI 對沒有指令權的單位下 eject，必被拒（eject:no-commander）。沒有握指令權的人物就不提出棄機。
test("eject 只對有握指令權人物的單位提出", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 6, height: 3, units: [
    { id: "crewed", owner: "blue", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle"], commander: { id: "p1" } },
    { id: "drone", owner: "blue", pos: { x: 0, y: 2 }, abilities: ["stub:ability/rifle"] },
    { id: "e", owner: "red", pos: { x: 5, y: 1 }, abilities: ["stub:ability/rifle"] },
  ] }, 1);
  const ctx = { q, s, view: s, slot: "blue", know: emptyKnowledge(), assignment: null, danger: {}, params: {}, rng: createRng(1) };
  const ejects = (unit: string) => proposeTactical(ctx, { unit, policy: "tactical", memory: {} }).filter(c => c.cmd.kind === "eject").length;
  assert.equal(ejects("crewed"), 1);
  assert.equal(ejects("drone"), 0);
});
