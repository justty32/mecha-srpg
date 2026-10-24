import test from "node:test";
import assert from "node:assert/strict";
import { hashLog } from "../../src/core/eventlog.ts";
import { replay, verifyReplay, ReplayError, rerunAiAndCompare } from "../../src/sim/replay.ts";
import { db, sample } from "./helpers.ts";

test("replay：skirmish-whitegloves 指令重播 hash 相同", () => {
  const { sim, run } = sample();
  assert.equal(hashLog(replay(db, sim.setup, 1, run.commands).log), run.hash);
  assert.deepEqual(verifyReplay(db, { setup: sim.setup, seed: 1, commands: run.commands, hash: run.hash }), { ok: true, hash: run.hash });
  assert.equal(verifyReplay(db, { setup: sim.setup, seed: 1, commands: run.commands, hash: "wrong" }).ok, false);
});

test("replay：rift-edge-nest 指令重播 hash 相同", () => {
  const { sim, run } = sample(1, "scenario/rift-edge-nest");
  assert.equal(run.rejected, 0);
  assert.equal(hashLog(replay(db, sim.setup, 1, run.commands).log), run.hash);
});

test("replay：竄改指令時 ReplayError 帶正確 index", () => {
  const { sim, run } = sample();
  const commands = structuredClone(run.commands), index = 2;
  commands[index] = { kind: "end", actor: "missing-unit" };
  assert.throws(() => replay(db, sim.setup, 1, commands), error => {
    assert.ok(error instanceof ReplayError);
    assert.equal(error.index, index);
    assert.deepEqual(error.command, commands[index]);
    assert.equal(error.code, "bad-actor");
    return true;
  });
});

test("rerunAiAndCompare：同 seed 為 ok，差異定位到第一條", () => {
  const { sim, run } = sample();
  assert.deepEqual(rerunAiAndCompare({ db, sim, seed: 1 }, run.commands), { ok: true, firstDiff: null });
  const expected = structuredClone(run.commands);
  expected[0] = { kind: "end", actor: "missing-unit" };
  assert.deepEqual(rerunAiAndCompare({ db, sim, seed: 1 }, expected), { ok: false, firstDiff: 0 });
});
