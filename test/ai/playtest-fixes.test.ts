import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import type { AiCtx, AiParams, TurnEnv } from "../../src/ai/index.ts";
import { createAgent, createDefaultStrategy, emptyKnowledge, getPolicy, maskedState,
  registerPolicy, scoreCandidate, selectCandidate, takeTurn, updateKnowledge } from "../../src/ai/index.ts";
import { createStubRules, loadStubAbilities, makeStubBattle } from "./stub-rules.ts";
import type { StubUnit } from "./stub-rules.ts";

const rifle = "stub:ability/rifle";
function setup(units: StubUnit[], params: AiParams = {}, rules = createStubRules()): TurnEnv {
  const s = makeStubBattle({ width: 40, height: 3, exits: [{ x: 0, y: 1 }], units }, 1);
  const slot = units[0]!.owner, know = updateKnowledge(rules.q, s, slot, emptyKnowledge());
  return { ...rules, s, slot, know, assignment: null, params, rng: createRng(1, 101) };
}
function context(env: TurnEnv): AiCtx {
  return { ...env, view: maskedState(env.q, env.s, env.slot, env.know), danger: {} };
}
const unit = (id: string, owner: string, x: number, abilities: string[] = [], ap = 6): StubUnit =>
  ({ id, owner, pos: { x, y: 1 }, abilities, ap, perception: 40 });

test("flee 離出口 33 格仍前進，評分計入相對危險變化", () => {
  const env = setup([unit("a", "convoy", 33, [], 3)], { fleeExitDistance: 1 });
  const commands = takeTurn(env, createAgent("a", "flee"));
  assert.equal(commands.filter(c => c.kind === "move").length, 1);
  assert.equal(env.s.units.a!.pos.x, 30);
  const ctx = context(setup([unit("a", "convoy", 33, [], 3)], { fleeExitDistance: 0, dangerK: 1 }));
  ctx.danger = { "33,1": 5, "32,1": 2 };
  assert.equal(getPolicy("flee").score(ctx, createAgent("a", "flee"),
    { cmd: { kind: "move", actor: "a", path: [{ x: 32, y: 1 }] } }), 3);
});

test("flee 站上出口即撤離，保留 fleeRetreat 參數", () => {
  const env = setup([unit("a", "convoy", 0)], { fleeRetreat: 77 });
  const agent = createAgent("a", "flee");
  assert.equal(getPolicy("flee").score(context(env), agent, { cmd: { kind: "retreat", actor: "a" } }), 77);
  assert.deepEqual(takeTurn(env, agent), [{ kind: "retreat", actor: "a" }]);
  assert.equal(env.s.rt!.unitStatus.a, "retreated");
});

test("純移動預設最多一次、可設 0／2，移動後出手不受此額度限制", () => {
  const original = getPolicy("tactical");
  try {
    registerPolicy({ id: "tactical", band: 1,
      propose(ctx, agent) {
        const x = ctx.view.units[agent.unit]!.pos.x;
        return [{ cmd: { kind: "move", actor: agent.unit, path: [{ x: x === 1 ? 2 : 1, y: 1 }] } }];
      }, score: () => 1,
    });
    for (const limit of [undefined, 0, 2]) {
      const env = setup([unit("a", "p", 1)], limit === undefined ? {} : { maxPureMoves: limit });
      const commands = takeTurn(env, createAgent("a", "tactical"));
      assert.equal(commands.filter(c => c.kind === "move").length, limit ?? 1);
      assert.equal(commands.at(-1)?.kind, "end");
    }
    registerPolicy({ id: "tactical", band: 1,
      propose: (_ctx, agent) => [{ move: { x: 2, y: 1 },
        cmd: { kind: "useAbility", actor: agent.unit, ability: rifle, target: { unit: "b" } } }],
      score: () => 1,
    });
    const env = setup([unit("a", "p", 1, [rifle]), unit("b", "e", 4)], { maxPureMoves: 0 });
    const commands = takeTurn(env, createAgent("a", "tactical"), { maxActions: 1 });
    assert.deepEqual(commands.map(c => c.kind), ["move", "useAbility", "end"]);
  } finally { registerPolicy(original); }
});

test("護衛射程內的微小正收益攻擊不被 End 的 0.01 分壓過", () => {
  const abilities = loadStubAbilities();
  abilities[rifle]!.packets = [{ type: "physical", amount: 1 }];
  abilities[rifle]!.ai.tactics = { attack: 0.01 };
  const env = setup([unit("a", "ally", 1, [rifle], 2), unit("b", "enemy", 4)],
    { attack: 0.8, protect: 2, maxMoves: 0, objMoves: 0, band: 1 }, createStubRules(abilities));
  const shot = { cmd: { kind: "useAbility" as const, actor: "a", ability: rifle, target: { unit: "b" } } };
  assert.equal(env.q.checkAbility(env.s, "a", rifle, { unit: "b" }), null);
  const value = scoreCandidate(context(env), createAgent("a", "tactical"), shot);
  assert.ok(value > 0 && value < 0.01);
  assert.equal(takeTurn(env, createAgent("a", "tactical"))[0]?.kind, "useAbility");
});

test("第三方選擇隨距離與集火，互換 ally／enemy 標籤不改評分或目標", () => {
  const choices = [];
  for (const swapped of [false, true]) {
    const env = setup([unit("a", "third", 1, [rifle], 2),
      unit("b", swapped ? "enemy" : "ally", 3, [rifle]),
      unit("z", swapped ? "ally" : "enemy", 5, [rifle])], { maxMoves: 0, objMoves: 0, focusBonus: 3 });
    const ctx = context(env), agent = createAgent("a", "tactical");
    ctx.assignment = createDefaultStrategy().roundPlan(ctx)[0]!;
    const scored = getPolicy("tactical").propose(ctx, agent)
      .filter(c => c.cmd.kind === "useAbility").map(c => ({ c, score: scoreCandidate(ctx, agent, c) }));
    choices.push({ assignment: ctx.assignment.target, scored, selected: selectCandidate(ctx.rng, scored, 1) });
    assert.equal(ctx.assignment.target, "b");
    assert.deepEqual(choices.at(-1)!.selected?.cmd, { kind: "useAbility", actor: "a", ability: rifle, target: { unit: "b" } });
  }
  assert.deepEqual(choices[0], choices[1]);
});

test("能進射程時保留出手 AP，尚不可接敵時繼續前進", () => {
  const env = setup([unit("a", "enemy", 1, [rifle], 6), unit("b", "player", 7)],
    { maxMoves: 1, band: 1 });
  const commands = takeTurn(env, createAgent("a", "tactical"));
  assert.ok(commands.some(c => c.kind === "useAbility" && c.target?.unit === "b"));
  assert.ok(commands.filter(c => c.kind === "move").every(c => c.path.every(cell => cell.x >= 1)));
  const far = setup([unit("a", "enemy", 1, [rifle], 4), unit("b", "player", 12)],
    { maxMoves: 1, band: 1 });
  assert.equal(takeTurn(far, createAgent("a", "tactical"))[0]?.kind, "move");
  assert.ok(far.s.units.a!.pos.x > 1);
});
