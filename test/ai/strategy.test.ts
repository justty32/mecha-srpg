import test from "node:test";
import assert from "node:assert/strict";
import type { StrategyCtx } from "../../src/ai/index.ts";
import { createDefaultStrategy, emptyKnowledge, updateKnowledge, maskedState } from "../../src/ai/index.ts";
import type { StubUnit } from "./stub-rules.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

function unit(id: string, owner: string, x: number, y: number): StubUnit {
  return { id, owner, pos: { x, y }, abilities: ["stub:ability/claw"], perception: 30 };
}

function context(units: StubUnit[]): StrategyCtx {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 20, height: 7, units }, 41);
  const know = updateKnowledge(q, s, "blue", emptyKnowledge());
  return { q, s, view: maskedState(q, s, "blue", know), slot: "blue", know, params: {} };
}

test("strategy：stance 隨兵力比切換，弱勢准許撤退", () => {
  for (const [enemies, stance, allowRetreat] of [[1, "attack", false], [2, "defend", false], [3, "hold", true]] as const) {
    const ctx = context([unit("a", "blue", 1, 1), ...Array.from({ length: enemies }, (_, i) => unit(`e${i}`, "red", 6 + i, 1))]);
    const plans = createDefaultStrategy().roundPlan(ctx);
    assert.equal(plans[0]!.stance, stance);
    assert.equal(plans[0]!.allowRetreat, allowRetreat);
  }
  const ctx = context([unit("a", "blue", 1, 1), unit("b", "blue", 1, 2),
    ...Array.from({ length: 4 }, (_, i) => unit(`e${i}`, "red", 6 + i, 1))]);
  ctx.s.units.b!.parts.torso!.layers[0]!.hp = 20;
  ctx.view = maskedState(ctx.q, ctx.s, ctx.slot, ctx.know);
  const plans = createDefaultStrategy().roundPlan(ctx);
  assert.equal(plans[0]!.stance, "defend");
  assert.equal(plans[0]!.protect, "b");
});

test("strategy：接敵登記遵守每個敵人的上限", () => {
  const ctx = context([...Array.from({ length: 7 }, (_, i) => unit(`a${i}`, "blue", i + 1, 1)),
    unit("e0", "red", 8, 4), unit("e1", "red", 9, 4)]);
  const strategy = createDefaultStrategy();
  const plans = strategy.roundPlan(ctx);
  assert.equal(plans.length, 7);
  assert.equal(plans.filter((a) => a.target === "e0").length, 3);
  assert.equal(plans.filter((a) => a.target === "e1").length, 3);
  assert.equal(plans.filter((a) => a.target === undefined).length, 1);
  ctx.params.maxEngage = 1;
  assert.equal(strategy.roundPlan(ctx).filter((a) => a.target !== undefined).length, 2);
});

test("strategy：focus 選高價值目標，同分依 id，距離差超過 2 優先近敵", () => {
  const ctx = context([unit("a", "blue", 1, 1), unit("low", "red", 3, 1),
    { ...unit("high", "red", 4, 1), grade: "SSS" }]);
  const strategy = createDefaultStrategy();
  assert.equal(strategy.roundPlan(ctx)[0]!.target, "high");
  ctx.s.units.high!.pos = { x: 10, y: 1 };
  ctx.view = maskedState(ctx.q, ctx.s, ctx.slot, ctx.know);
  assert.equal(strategy.roundPlan(ctx)[0]!.target, "low");
  const tied = context([unit("a", "blue", 1, 1), unit("z", "red", 3, 1), unit("b", "red", 4, 1)]);
  assert.equal(strategy.roundPlan(tied)[0]!.target, "b");
});
