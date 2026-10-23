import test from "node:test";
import assert from "node:assert/strict";
import type { Command } from "../../src/core/types-state.ts";
import { createFactionAI, startRound, runUnitTurn, observeEvents, policyIds } from "../../src/ai/index.ts";
import type { StubUnit } from "./stub-rules.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

function battle(seed: number, mixed: boolean): { commands: Command[]; rounds: number } {
  const rules = createStubRules();
  const units: StubUnit[] = ["blue", "red"].flatMap((owner) => Array.from({ length: 3 }, (_, i) => ({
    id: `${owner}${i}`, owner, pos: { x: owner === "blue" ? 1 : 6, y: i * 2 + 1 },
    abilities: ["stub:ability/claw", "stub:ability/rifle"], perception: 12, ap: 3,
    tags: i === 0 ? ["spawner"] : [],
  })));
  const s = makeStubBattle({ width: 8, height: 7, exits: [{ x: 0, y: 3 }, { x: 7, y: 3 }], units }, seed);
  const unitPolicies: Record<string, string> = mixed ? { blue0: "tactical", blue1: "berserk", blue2: "swarm",
    red0: "sentinel", red1: "flee", red2: "scripted" } : {};
  const ais = ["blue", "red"].map((slot) => createFactionAI({ slot, seed, unitPolicies,
    memory: { blue2: { parent: "blue0" }, red2: { script: [{ kind: "wait", actor: "red2" }] } } }));
  const commands: Command[] = [];
  for (let round = 0; round < 10; round++) {
    rules.startRound(s);
    for (const ai of ais) startRound(ai, rules.q, s);
    for (const unit of Object.keys(s.units).sort()) {
      if (!rules.q.isActive(s, unit)) continue;
      const ai = ais.find((faction) => faction.slot === s.units[unit]!.owner)!;
      const from = s.log.events.length;
      commands.push(...runUnitTurn(ai, rules.q, s, unit, rules.exec));
      const events = s.log.events.slice(from);
      for (const observer of ais) if (observer !== ai) observeEvents(observer, rules.q, s, events);
    }
  }
  return { commands, rounds: s.round };
}

test("smoke：DN-M-02、DN-M-12 資料尺寸下兩陣營各 3 單位 AI 對 AI 跑 10 輪", () => {
  const result = battle(71, false);
  assert.equal(result.rounds, 10);
  assert.ok(result.commands.some((cmd) => cmd.actor.startsWith("blue")));
  assert.ok(result.commands.some((cmd) => cmd.actor.startsWith("red")));
  assert.ok(result.commands.some((cmd) => cmd.kind === "useAbility"));
});

test("smoke：同 seed 跑兩次的指令序列 JSON.stringify 相同", () => {
  const first = battle(73, false);
  const second = battle(73, false);
  assert.ok(first.commands.length > 0);
  assert.equal(JSON.stringify(first.commands), JSON.stringify(second.commands));
});

test("smoke：六種已登記 policy 混用跑 10 輪不拋錯", () => {
  for (const id of ["tactical", "berserk", "swarm", "sentinel", "flee", "scripted"]) assert.ok(policyIds().includes(id));
  const result = battle(79, true);
  assert.equal(result.rounds, 10);
  assert.ok(result.commands.length > 0);
  assert.ok(result.commands.some((cmd) => cmd.actor === "red2" && cmd.kind === "wait"));
});
