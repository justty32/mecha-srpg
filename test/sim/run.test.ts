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

test("scripted AI／遙控低命中率仍能選用武器，機體 AP 扣款且可重播", () => {
  const scenario = structuredClone(db.require("scenario", scenarioId));
  scenario.slots.player!.units = [{ mech: "frame/moji-tern", crew: "ai", at: { x: 4, y: 4 } }];
  scenario.slots.enemy!.units = [{ mech: "frame/moji-tern", crew: "remote", core: false, at: { x: 5, y: 4 } }];
  scenario.objectives = []; scenario.rounds = 2;
  const sim = scenarioToSetup(db, scenario, 1), run = runBattle({ db, sim, seed: 1 });
  for (const id of ["player-0", "enemy-0"]) {
    assert(run.commands.some(c => c.kind === "useAbility" && c.actor === id));
    assert(run.state.log.events.some(e => e.type === "PoolChanged" && e.payload.owner === id && e.payload.pool === "ap" && e.payload.reason === "ability"));
    assert.equal(run.state.units[id]!.controlMode, "scripted");
    assert.equal(Object.values(run.state.units[id]!.seats).filter(Boolean).length, 0);
  }
  const replay = runBattle({ db, sim, seed: 1, players: { player: { kind: "script", commands: run.commands.filter(c => c.actor === "player-0") },
    enemy: { kind: "script", commands: run.commands.filter(c => c.actor === "enemy-0") } } });
  assert.equal(replay.hash, run.hash);
  assert.equal(replay.state.units["enemy-0"]!.core, false); assert.equal(replay.state.units["enemy-0"]!.crew, "remote");
});
