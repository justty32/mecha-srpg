import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { scenarioToSetup, runBattle } from "../../src/sim/run.ts";
import { createBattle } from "../../src/rules/flow.ts";
import { roleAttr } from "../../src/rules/contribs.ts";
import { commanderOf } from "../../src/rules/state.ts";
const { db, errors } = loadContentDirs(["content/base"]);
assert.deepEqual(errors, []);

test("預設4v4沿正式積極profile，準度45只對本情境無人物scripted", () => {
  const scenario = db.require("scenario", "scenario/skirmish-whitegloves");
  const sim = scenarioToSetup(db, scenario.id, 1), state = createBattle(db, sim.setup, 1), ctx = { db, s: state };
  assert.equal(scenario.rounds, 20);
  assert.equal(sim.setup.noRetreat, true);
  assert.equal(state.rt!.noRetreat, true);
  assert.equal(scenario.slots.player!.units.length, 4);
  assert.equal(scenario.slots.enemy!.units.length, 4);
  assert.ok(scenario.slots.enemy!.units.every(u => u.mech === "base:frame/moji-tern" && u.core === false && u.crew === "remote"));
  assert.equal(sim.setup.rules!.scriptedAccuracyBase, 45);
  for (const slot of ["player", "enemy"]) {
    assert.equal(scenario.slots[slot]!.ai, "base:aiprofile/demo-hardclash");
    assert.equal(sim.slotProfiles[slot]!.policy, "tactical");
    assert.equal(sim.slotProfiles[slot]!.params.band, 1);
  }
  assert.equal(roleAttr(ctx, { unit: "enemy-0" }, "accuracy"), 45);
  const pid = commanderOf(ctx, "player-0")!;
  const accuracy = roleAttr(ctx, { unit: "player-0", person: pid }, "accuracy");
  const other = structuredClone(state); delete other.rt!.scriptedAccuracyBase;
  assert.equal(roleAttr({ db, s: other }, { unit: "player-0", person: pid }, "accuracy"), accuracy);
  assert.equal(roleAttr({ db, s: other }, { unit: "enemy-0" }, "accuracy"), 0);
});

test("真default seed1使用正式profile在20回合內有勝方（60只揭露真終局）", () => {
  const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1, { rounds: 60 });
  const run = runBattle({ db, sim, seed: 1 });
  assert.equal(run.stopped, "outcome");
  assert.equal(run.commands.some(c => c.kind === "retreat" || c.kind === "eject"), false);
  assert.notEqual(run.result?.reason, "timeout");
  assert.ok(run.result?.winner !== null && run.result !== null);
  assert.ok(["player", "enemy"].some(slot => sim.setup.units.filter(u => u.owner === slot).every(u => run.state.rt!.unitStatus[u.id] === "dead")));
  assert.ok(run.state.round <= 20, `default seed1 ended at ${run.state.round}`);
});
