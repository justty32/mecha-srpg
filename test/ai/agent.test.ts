import test from "node:test";
import assert from "node:assert/strict";
import type { Command } from "../../src/core/types-state.ts";
import { createRng } from "../../src/core/rng.ts";
import type { TurnEnv } from "../../src/ai/index.ts";
import { createAgent, emptyKnowledge, updateKnowledge, policyFor, registerPolicy, takeTurn } from "../../src/ai/index.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

function setup(): TurnEnv {
  const { q, exec } = createStubRules();
  const s = makeStubBattle({ width: 10, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 0, y: 1 }, abilities: [], ap: 8,
      commander: { id: "pilot", morale: "fleeing" } },
  ] }, 31);
  s.persons.pilot!.morale = "steady";
  return { q, exec, s, slot: "blue", know: updateKnowledge(q, s, "blue", emptyKnowledge()),
    assignment: null, params: {}, rng: createRng(31, 101) };
}

test("policyFor：berserk 與 fleeing 接管，失控優先", () => {
  const { q, s } = setup();
  s.round = 3;
  assert.equal(policyFor(q, s, "a", "sentinel"), "sentinel");
  s.persons.pilot!.morale = "fleeing";
  assert.equal(policyFor(q, s, "a", "sentinel"), "flee");
  s.rt!.noRetreat = true;
  assert.equal(policyFor(q, s, "a", "sentinel"), "sentinel");
  s.rt!.noRetreat = false;
  assert.equal(policyFor(q, s, "a", "sentinel"), "flee");
  s.units.a!.controlMode = "berserk";
  assert.equal(policyFor(q, s, "a", "sentinel"), "berserk");
});

test("agent：被拒候選剔除後重選", () => {
  const env = setup();
  const attempted: string[] = [];
  const execute = env.exec;
  env.exec = (s, cmd) => { attempted.push(cmd.kind); return execute(s, cmd); };
  registerPolicy({ id: "test-reselect", band: 1,
    propose: (_ctx, agent) => [
      { cmd: { kind: "eject", actor: agent.unit } },
      { cmd: { kind: "move", actor: agent.unit, path: [{ x: 1, y: 1 }] } },
    ],
    score: (_ctx, _agent, c) => c.cmd.kind === "eject" ? 2 : 1,
  });
  const commands = takeTurn(env, createAgent("a", "test-reselect"), { maxActions: 1 });
  assert.deepEqual(attempted, ["eject", "move", "end"]);
  assert.deepEqual(commands.map((cmd) => cmd.kind), ["move", "end"]);
  assert.deepEqual(env.s.units.a!.pos, { x: 1, y: 1 });
});

test("agent：回傳只含成功指令且以 end 結尾；PW-07 不呼叫 precommit", () => {
  const env = setup();
  let precommits = 0;
  let completed = 0;
  registerPolicy({ id: "test-partial-move", band: 1,
    propose: (_ctx, agent) => [
      { move: { x: 1, y: 1 }, cmd: { kind: "eject", actor: agent.unit } },
      { cmd: { kind: "end", actor: agent.unit } },
    ],
    score: (_ctx, _agent, c) => c.cmd.kind === "eject" ? 2 : 1,
    precommit: () => { precommits++; throw new Error("本版不可宣告意圖"); },
    onExecuted: () => { completed++; },
  });
  const commands = takeTurn(env, createAgent("a", "test-partial-move"));
  assert.deepEqual(commands, [
    { kind: "move", actor: "a", path: [{ x: 1, y: 1 }] }, { kind: "end", actor: "a" },
  ]);
  assert.equal(completed, 1);
  assert.equal(precommits, 0);
  assert.equal(env.s.rt!.actionSeq, commands.length);
});

test("agent：maxActions 限制成功候選數並補 end", () => {
  const env = setup();
  const script: Command[] = Array.from({ length: 5 }, (_, i) => ({ kind: "move", actor: "a", path: [{ x: i + 1, y: 1 }] }));
  const agent = createAgent("a", "scripted", { script });
  const commands = takeTurn(env, agent, { maxActions: 2 });
  assert.deepEqual(commands.map((cmd) => cmd.kind), ["move", "move", "end"]);
  assert.deepEqual(env.s.units.a!.pos, { x: 2, y: 1 });
  assert.equal(agent.memory.step, 2);
});

test("agent：noRetreat的fleeing駕駛仍使用合法攻擊，普通場仍選flee", () => {
  const { q, exec } = createStubRules();
  const s = makeStubBattle({ width: 4, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 1, y: 1 }, abilities: ["stub:ability/rifle"], ap: 4, commander: { id: "pilot", morale: "fleeing" } },
    { id: "b", owner: "red", pos: { x: 2, y: 1 }, abilities: [] },
  ] }, 31);
  s.round = 3;
  assert.equal(policyFor(q, s, "a", "tactical"), "flee");
  s.rt!.noRetreat = true;
  assert.equal(policyFor(q, s, "a", "tactical"), "tactical");
  assert.equal(q.checkAbility(s, "a", "stub:ability/rifle", { unit: "b" }), null);
  const env: TurnEnv = { q, exec, s, slot: "blue", know: updateKnowledge(q, s, "blue", emptyKnowledge()),
    assignment: { unit: "a", stance: "attack", allowRetreat: false }, params: { band: 1, dangerK: 0 }, rng: createRng(31, 101) };
  const commands = takeTurn(env, createAgent("a", "tactical"), { maxActions: 1 });
  assert.ok(commands.some(c => c.kind === "useAbility"));
  assert.equal(commands.some(c => c.kind === "retreat"), false);
});


function searching() {
  const env = setup();
  env.s.rt!.deployZones = { red: [{ x: 9, y: 1 }] };
  env.params = { band: 1, dangerK: 0 };
  return { env, agent: createAgent("a", "tactical", { keep: 7 }) };
}

test("agent搜索：首次propose前初始化、成功後按真終點推進，拒絕不提交", async () => {
  const { readSearchMemory } = await import("../../src/ai/search.ts");
  for (const actualX of [null, 1, 4]) {
    const { env, agent } = searching();
    // stub感知5；x=4已可搜索敵部署，但送出的path故意指向另一格。
    let sawInitial = false;
    env.exec = (s, cmd) => {
      sawInitial ||= !!readSearchMemory(agent);
      if (actualX === null) return { ok: false, rejection: { code: "test-reject" } };
      if (cmd.kind === "move") s.units.a!.pos = { x: actualX, y: 1 };
      return { ok: true, events: [] };
    };
    takeTurn(env, agent, { maxActions: 1, maxRetries: 1 });
    assert.equal(sawInitial, true);
    assert.equal(readSearchMemory(agent)!.visited.length > 0, actualX === 4);
    assert.equal(agent.memory.keep, 7);
  }
});

test("agent搜索：frame有效policy與參數一致，前置move成功主命令拒絕仍提交", async () => {
  const { getPolicy } = await import("../../src/ai/policy.ts");
  const { readSearchMemory } = await import("../../src/ai/search.ts");
  const tactical = getPolicy("tactical");
  const { env, agent } = searching();
  env.q = { ...env.q, frameAiProfile: () => ({ policy: "tactical", params: { intent: 3, search: 1 } }) };
  const seen: boolean[] = [];
  registerPolicy({ ...tactical, propose(ctx) {
    seen.push(ctx.searchEnabled === true && ctx.params.intent === 3);
    return [{ move: { x: 4, y: 1 }, cmd: { kind: "eject", actor: "a" } }];
  }, score(ctx) { seen.push(ctx.searchEnabled === true && ctx.params.intent === 3); return 1; } });
  const attempted: string[] = [];
  env.exec = (s, cmd) => {
    attempted.push(cmd.kind);
    if (cmd.kind === "eject") return { ok: false, rejection: { code: "test-reject" } };
    if (cmd.kind === "move") s.units.a!.pos = { x: 4, y: 1 };
    return { ok: true, events: [] };
  };
  try {
    const commands = takeTurn(env, agent, { maxActions: 1, maxRetries: 1 });
    assert.deepEqual(attempted, ["move", "eject", "end"]);
    assert.deepEqual(commands.map(c => c.kind), ["move", "end"]);
    assert.ok(readSearchMemory(agent)!.visited.length > 0);
    assert.ok(seen.length >= 2 && seen.every(Boolean));
  } finally { registerPolicy(tactical); }
});

test("agent搜索：禁搜frame、陣營守區與專用策略不建立記憶", () => {
  for (const kind of ["search0", "guard", "sentinel"] as const) {
    const { env, agent } = searching();
    if (kind === "search0") env.q = { ...env.q, frameAiProfile: () => ({ policy: "tactical", params: { search: 0 } }) };
    if (kind === "guard") env.params.intent = 3;
    if (kind === "sentinel") agent.policy = "sentinel";
    takeTurn(env, agent, { maxActions: 1 });
    assert.equal(agent.memory.search, undefined);
  }
});
