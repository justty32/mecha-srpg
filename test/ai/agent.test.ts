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
  assert.equal(policyFor(q, s, "a", "sentinel"), "sentinel");
  s.persons.pilot!.morale = "fleeing";
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
