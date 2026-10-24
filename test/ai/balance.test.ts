import test from "node:test";
import assert from "node:assert/strict";
import type { BattleState } from "../../src/core/types-state.ts";
import { dangerMap } from "../../src/ai/danger.ts";
import { forceRatio, scoreCandidate } from "../../src/ai/score.ts";
import { createRng } from "../../src/core/rng.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";
import { createDefaultStrategy } from "../../src/ai/strategy.ts";
import { emptyKnowledge } from "../../src/ai/knowledge.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import { runBattle, scenarioToSetup } from "../../src/sim/run.ts";

test("同盟 slot 不貢獻危險、不被分派攻擊，兵力計入友方", () => {
  const { q: stub } = createStubRules();
  const q = { ...stub, hostileSlots: (_s: BattleState, a: string, b: string) => a !== b && (a === "enemy" || b === "enemy") };
  const s = makeStubBattle({ width: 10, height: 5, units: [
    { id: "a", owner: "blue", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle"] },
    { id: "ally", owner: "green", pos: { x: 1, y: 0 }, abilities: ["stub:ability/rifle"] },
    { id: "enemy", owner: "enemy", pos: { x: 4, y: 0 }, abilities: ["stub:ability/rifle"] },
  ] }, 1);
  const know = emptyKnowledge();
  const ctx = { q, s, view: s, slot: "blue", know, params: {} };
  const allies = { ...s, units: { a: s.units.a!, ally: s.units.ally! } };
  assert.deepEqual(dangerMap(q, allies, "blue", know), {});
  assert.equal(createDefaultStrategy().roundPlan({ ...ctx, view: allies })[0]!.target, undefined);
  assert.equal(forceRatio(q, s, s, "blue"), 2);
  assert.equal(createDefaultStrategy().roundPlan(ctx)[0]!.target, "enemy");
  assert.ok(Object.keys(dangerMap(q, s, "blue", know)).length > 0);
});

test("skirmish seed 1 原始情境 20 輪的 Wait 比例低於一半或分出勝負", () => {
  const { db, errors } = loadContentDirs(["content/base"]);
  assert.deepEqual(errors, []);
  const run = runBattle({ db, sim: scenarioToSetup(db, "scenario/skirmish-whitegloves", 1, { rounds: 20 }), seed: 1 });
  const turns = run.state.log.events.filter(e => e.type === "TurnEnd").length;
  const waits = run.commands.filter(c => c.kind === "wait").length;
  assert.ok(waits / Math.max(1, turns) < 0.5 || (run.result?.winner ?? null) !== null);
});

test("未接敵會朝中央偵察，既有危險不壓低原地攻擊，profile 可覆蓋係數", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 10, height: 5, units: [
    { id: "a", owner: "blue", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle"] },
    { id: "e", owner: "red", pos: { x: 2, y: 0 }, abilities: ["stub:ability/rifle"] },
  ] }, 1);
  const agent = { unit: "a", policy: "tactical", memory: {} };
  const ctx = { q, s, view: s, slot: "blue", know: emptyKnowledge(), assignment: null,
    danger: { "0,0": 100 }, params: { waitScore: 0, dangerK: 0.01 }, rng: createRng(1) };
  const attack = { cmd: { kind: "useAbility" as const, actor: "a", ability: "stub:ability/rifle", target: { unit: "e" } } };
  const score = scoreCandidate(ctx, agent, attack);
  assert.ok(score > 0);
  assert.equal(score, scoreCandidate({ ...ctx, danger: {} }, agent, attack));
  ctx.params.waitScore = 3;
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "wait", actor: "a" } }), 3);
  const unseen = { ...ctx, view: { ...s, units: { a: s.units.a! } }, danger: {}, params: {} };
  const moves = proposeTactical(unseen, agent).filter(c => c.cmd.kind === "move");
  assert.ok(moves.some(c => scoreCandidate(unseen, agent, c) > 0));
});
