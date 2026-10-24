import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, startBattle, currentActor, tryCommand } from "../../src/rules/index.ts";
import type { Command } from "../../src/core/types-state.ts";
import { scenarioToSetup, runBattle } from "../../src/sim/run.ts";
import { db, sample, scenarioId } from "./helpers.ts";

test("scenarioToSetup：八單位部署格不同且都在各自部署區", () => {
  const sim = scenarioToSetup(db, scenarioId, 1);
  const map = db.require("map", db.require("scenario", scenarioId).map);
  assert.equal(sim.setup.units.length, 8);
  assert.equal(new Set(sim.setup.units.map(u => `${u.pos.x},${u.pos.y}`)).size, 8);
  for (const u of sim.setup.units) assert.ok(map.deployZones[u.owner]!.some(at => at.x === u.pos.x && at.y === u.pos.y));
  const persons = sim.setup.units.flatMap(u => u.persons ?? []);
  assert.equal(new Set(persons.map(p => p.id)).size, persons.length);
});

test("runBattle：同 seed 的指令與 hash 一致", () => {
  const a = sample().run, b = sample().run;
  assert.deepEqual(a.commands, b.commands);
  assert.equal(a.hash, b.hash);
  assert.equal(a.stopped, "outcome");
  assert.equal(a.state.round, 3);
});

test("runBattle：不同 seed 的 hash 不同", () => {
  assert.notEqual(sample(1).run.hash, sample(2).run.hash);
});

test("runBattle：script 依序送指令，用完後送 end", () => {
  const sim = scenarioToSetup(db, scenarioId, 1, { rounds: 2 });
  const initial = createBattle(db, sim.setup, 1);
  startBattle({ db, s: initial });
  const actor = currentActor(initial)!;
  const slot = initial.units[actor]!.owner;
  const commands: Command[] = [{ kind: "wait", actor }];
  assert.ok(tryCommand({ db, s: initial }, commands[0]!).ok);
  while (initial.units[currentActor(initial)!]!.owner !== slot) {
    assert.ok(tryCommand({ db, s: initial }, { kind: "end", actor: currentActor(initial)! }).ok);
  }
  commands.push({ kind: "end", actor: currentActor(initial)! });
  const run = runBattle({ db, sim, seed: 1, players: {
    player: { kind: "script", commands: slot === "player" ? commands : [] },
    enemy: { kind: "script", commands: slot === "enemy" ? commands : [] },
  } });
  const issued = run.commands.filter(c => initial.units[c.actor]!.owner === slot);
  assert.deepEqual(issued.slice(0, commands.length), commands);
  assert.ok(issued.slice(commands.length).length > 0);
  assert.ok(issued.slice(commands.length).every(c => c.kind === "end"));
  assert.equal(run.rejected, 0);
  assert.equal(run.stopped, "outcome");
});

test("runBattle：AI 指令 rejected 為零", () => {
  const run = sample(3).run;
  assert.ok(run.commands.length > 0);
  assert.equal(run.rejected, 0);
});
