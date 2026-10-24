import test from "node:test";
import assert from "node:assert/strict";
import type { Command } from "../../src/core/types-state.ts";
import { createRng } from "../../src/core/rng.ts";
import type { Agent, AiCtx, Candidate } from "../../src/ai/index.ts";
import { createAgent, emptyKnowledge, updateKnowledge, maskedState, dangerMap, getPolicy, policyIds, selectCandidate, takeTurn } from "../../src/ai/index.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import type { StubBattle } from "./stub-rules.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

test("base 所有 aiprofile 的 policy 都已登記", () => {
  const { db, errors } = loadContentDirs(["content/base"]);
  assert.deepEqual(errors, []);
  const registered = policyIds();
  for (const profile of db.all("aiprofile")) {
    assert.ok(registered.includes(profile.policy), `${profile.id} 指向未登記的 policy ${profile.policy}`);
  }
});

function setup(spec: StubBattle) {
  const { q, exec } = createStubRules();
  const s = makeStubBattle(spec, 17);
  const know = updateKnowledge(q, s, "blue", emptyKnowledge());
  const view = maskedState(q, s, "blue", know);
  const ctx: AiCtx = { q, s, view, slot: "blue", know, danger: dangerMap(q, view, "blue", know),
    assignment: null, params: { band: 1, dangerK: 0 }, rng: createRng(19, 101) };
  return { ctx, exec };
}

function choose(ctx: AiCtx, agent: Agent): Candidate {
  const policy = getPolicy(agent.policy);
  const chosen = selectCandidate(ctx.rng, policy.propose(ctx, agent).map((c) => ({ c, score: policy.score(ctx, agent, c) })), policy.band ?? 1);
  assert.ok(chosen);
  return chosen;
}

test("tactical：DN-M-12 射程內優先攻擊，僅經 RulesQuery 預覽", () => {
  const { ctx } = setup({ width: 9, height: 5, units: [
    { id: "a", owner: "blue", pos: { x: 2, y: 2 }, abilities: ["stub:ability/rifle"] },
    { id: "b", owner: "red", pos: { x: 3, y: 2 }, abilities: ["stub:ability/claw"] },
  ] });
  const before = JSON.stringify(ctx.s);
  const c = choose(ctx, createAgent("a", "tactical"));
  assert.equal(c.cmd.kind, "useAbility");
  assert.equal(c.cmd.target?.unit, "b");
  assert.equal(c.move, undefined);
  assert.equal(JSON.stringify(ctx.s), before);
});

test("tactical：射程外會移動接近", () => {
  const { ctx } = setup({ width: 10, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 1, y: 1 }, abilities: ["stub:ability/claw"], ap: 2, perception: 20 },
    { id: "b", owner: "red", pos: { x: 7, y: 1 }, abilities: ["stub:ability/claw"] },
  ] });
  const c = choose(ctx, createAgent("a", "tactical"));
  assert.equal(c.cmd.kind, "move");
  assert.ok(ctx.q.distance(c.cmd.path.at(-1)!, ctx.view.units.b!.pos) < ctx.q.distance(ctx.view.units.a!.pos, ctx.view.units.b!.pos));
});

test("berserk：只剩友方時仍以合法範圍能力攻擊友方", () => {
  const { ctx, exec } = setup({ width: 6, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 1, y: 1 }, abilities: ["stub:ability/mortar"], ap: 2 },
    { id: "b", owner: "blue", pos: { x: 3, y: 1 }, abilities: ["stub:ability/claw"] },
  ] });
  const c = choose(ctx, createAgent("a", "berserk"));
  assert.equal(c.cmd.kind, "useAbility");
  assert.deepEqual(c.cmd.target?.cell, ctx.view.units.b!.pos);
  assert.equal(exec(ctx.s, c.cmd).ok, true);
  assert.ok(ctx.s.log.events.some((ev) => (ev.type === "Hit" || ev.type === "Miss") && ev.payload.target === "b"));
});

test("swarm：離母體太遠時朝母體移動", () => {
  const { ctx } = setup({ width: 12, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 8, y: 1 }, abilities: ["stub:ability/claw"], ap: 2 },
    { id: "parent", owner: "blue", pos: { x: 1, y: 1 }, abilities: [], tags: ["spawner"] },
  ] });
  const agent = createAgent("a", "swarm");
  const c = choose(ctx, agent);
  assert.equal(c.cmd.kind, "move");
  assert.ok(ctx.q.distance(c.cmd.path.at(-1)!, ctx.view.units.parent!.pos) < 7);
  assert.ok(getPolicy("swarm").propose(ctx, agent).every((candidate) => candidate.cmd.kind === "move"));
});

test("sentinel：不離開守點追逐射程外敵人", () => {
  const { ctx } = setup({ width: 10, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 1, y: 1 }, abilities: ["stub:ability/claw"], perception: 20 },
    { id: "b", owner: "red", pos: { x: 7, y: 1 }, abilities: ["stub:ability/claw"] },
  ] });
  const agent = createAgent("a", "sentinel");
  const c = choose(ctx, agent);
  assert.equal(c.cmd.kind, "end");
  assert.deepEqual(agent.memory.home, ctx.view.units.a!.pos);
  assert.ok(getPolicy("sentinel").propose(ctx, agent).every((candidate) => !candidate.move && candidate.cmd.kind !== "move"));
  // 離開守點後（守點比現位離敵人更遠）仍會走回守點。
  const away = setup({ width: 10, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 4, y: 1 }, abilities: ["stub:ability/claw"], perception: 20 },
    { id: "b", owner: "red", pos: { x: 8, y: 1 }, abilities: ["stub:ability/claw"] },
  ] });
  const back = choose(away.ctx, createAgent("a", "sentinel", { home: { x: 1, y: 1 } }));
  assert.equal(back.cmd.kind, "move");
  assert.ok(back.cmd.kind === "move" && away.ctx.q.distance(back.cmd.path.at(-1)!, { x: 1, y: 1 }) < 3);
});

test("flee：在 exit 上選 retreat", () => {
  const { ctx } = setup({ width: 8, height: 3, exits: [{ x: 0, y: 1 }], units: [
    { id: "a", owner: "blue", pos: { x: 0, y: 1 }, abilities: ["stub:ability/claw"] },
    { id: "b", owner: "red", pos: { x: 3, y: 1 }, abilities: ["stub:ability/claw"] },
  ] });
  assert.equal(choose(ctx, createAgent("a", "flee")).cmd.kind, "retreat");
});

test("flee：不在 exit 上時遠離敵人", () => {
  const { ctx } = setup({ width: 10, height: 3, exits: [{ x: 9, y: 1 }], units: [
    { id: "a", owner: "blue", pos: { x: 3, y: 1 }, abilities: ["stub:ability/claw"], ap: 2 },
    { id: "b", owner: "red", pos: { x: 2, y: 1 }, abilities: ["stub:ability/claw"] },
  ] });
  const c = choose(ctx, createAgent("a", "flee"));
  assert.equal(c.cmd.kind, "move");
  assert.ok(ctx.q.distance(c.cmd.path.at(-1)!, ctx.view.units.b!.pos) > 1);
});

test("scripted：依序執行步驟、覆寫 actor、用完 end", () => {
  const { ctx, exec } = setup({ width: 5, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 0, y: 1 }, abilities: [] },
  ] });
  const script: Command[] = [
    { kind: "move", actor: "ignored", path: [{ x: 1, y: 1 }] },
    { kind: "move", actor: "ignored", path: [{ x: 2, y: 1 }] },
  ];
  const agent = createAgent("a", "scripted", { script });
  const commands = takeTurn({ ...ctx, exec }, agent);
  assert.deepEqual(commands, [...script.map((cmd) => ({ ...cmd, actor: "a" })), { kind: "end", actor: "a" }]);
  assert.equal(agent.memory.step, 3);
  assert.equal(script[0]!.actor, "ignored");
});
