import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { createAgent, emptyKnowledge, getPolicy, maskedState, scoreCandidate, takeTurn, updateKnowledge } from "../../src/ai/index.ts";
import type { AiCtx, AiParams, TurnEnv } from "../../src/ai/index.ts";
import { createStubRules, loadStubAbilities, makeStubBattle } from "./stub-rules.ts";
import type { StubUnit } from "./stub-rules.ts";

const rifle = "stub:ability/rifle";
const unit = (id: string, owner: string, x: number, abilities: string[] = [], ap = 6): StubUnit =>
  ({ id, owner, pos: { x, y: 1 }, abilities, ap, perception: 40 });
function setup(units: StubUnit[], params: AiParams = {}, rules = createStubRules()): TurnEnv {
  const s = makeStubBattle({ width: 40, height: 3, units }, 1), slot = units[0]!.owner;
  return { ...rules, s, slot, know: updateKnowledge(rules.q, s, slot, emptyKnowledge()), assignment: null, params, rng: createRng(1, 101) };
}
function context(env: TurnEnv): AiCtx {
  return { ...env, view: maskedState(env.q, env.s, env.slot, env.know), danger: {} };
}

test("swarm 在截斷前篩母體距離，半徑內仍有前進候選", () => {
  const env = setup([unit("a", "enemy", 10), { ...unit("mother", "enemy", 9), tags: ["spawner"] }, unit("b", "player", 17)],
    { maxMoves: 1, objMoves: 0, leash: 3, band: 1 });
  const commands = takeTurn(env, createAgent("a", "swarm"));
  assert.ok(commands.some(c => c.kind === "move"));
  assert.ok(env.s.units.a!.pos.x > 10);
  assert.ok(env.q.distance(env.s.units.a!.pos, env.s.units.mother!.pos) <= 3);
});

test("可見敵人優先，失聯追 lastSeen，無情報才回中央且不讀隱藏位置", () => {
  const env = setup([unit("a", "player", 25), unit("b", "enemy", 35)], { maxMoves: 1, objMoves: 0, band: 1 });
  env.know = { visible: [], lastSeen: { b: { cell: { x: 32, y: 1 }, round: 0 } }, revealed: {} };
  const ctx = context(env), agent = createAgent("a", "tactical");
  const right = { cmd: { kind: "move" as const, actor: "a", path: [{ x: 26, y: 1 }] } };
  const left = { cmd: { kind: "move" as const, actor: "a", path: [{ x: 24, y: 1 }] } };
  Object.defineProperty(env.s.units.b!, "pos", { get() { throw Error("讀取了隱藏位置"); }, configurable: true });
  assert.ok(scoreCandidate(ctx, agent, right) > scoreCandidate(ctx, agent, left));
  const moves = getPolicy("tactical").propose(ctx, agent).filter(c => c.cmd.kind === "move");
  assert.ok(moves.length > 0);
  assert.ok(moves.every(c => c.cmd.kind === "move" && c.cmd.path.at(-1)!.x > 25));
  ctx.know = emptyKnowledge();
  assert.ok(scoreCandidate(ctx, agent, left) > scoreCandidate(ctx, agent, right));
  ctx.know = { visible: ["c"], lastSeen: { b: { cell: { x: 32, y: 1 }, round: 0 } }, revealed: {} };
  ctx.view.units.c = { ...structuredClone(ctx.view.units.a!), id: "c", owner: "enemy", pos: { x: 22, y: 1 } };
  ctx.view.rt!.unitStatus.c = "active";
  assert.ok(scoreCandidate(ctx, agent, left) > scoreCandidate(ctx, agent, right));
});

test("ball／line／cone 皆補低成本站位並保留施放 AP", () => {
  for (const kind of ["ball", "line", "cone"] as const) {
    const abilities = loadStubAbilities(), ability = abilities[rifle]!;
    ability.target = { kind, range: { min: 1, max: 3 }, radius: 0, los: true, friendly: "no" };
    ability.costs = [{ owner: "mech", pool: "ap", amount: 2 }];
    ability.ai.tactics = { attackArea: 1 };
    const env = setup([unit("a", "player", 1, [rifle]), unit("b", "enemy", 7)],
      { maxMoves: 1, objMoves: 0, band: 1 }, createStubRules(abilities));
    const ctx = context(env), candidates = getPolicy("tactical").propose(ctx, createAgent("a", "tactical"));
    const shot = candidates.find(c => c.move && c.cmd.kind === "useAbility");
    assert.ok(shot?.move, kind);
    const path = env.q.pathTo(ctx.view, "a", shot.move)!;
    const moved = env.q.previewCommand(ctx.view, { kind: "move", actor: "a", path });
    assert.ok(moved.result.ok, kind);
    assert.ok(moved.state.units.a!.pools.ap!.cur >= 2, kind);
    assert.ok(env.q.previewCommand(moved.state, shot.cmd).result.ok, kind);
  }
});
