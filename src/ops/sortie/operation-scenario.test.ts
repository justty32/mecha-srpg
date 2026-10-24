import test from "node:test";
import assert from "node:assert/strict";
import { mercFixture } from "../war/merc-fixture.ts";
import { generateScenario } from "./scenario.ts";
import { sortieBattleSetup } from "./run.ts";
import { runBattle } from "../../sim/index.ts";
for (const command of ["independent", "attached", "mixed"] as const) test(`operation 合編 ${command} 與 ID 對位`, () => {
  const { s, ctx, c, sortie } = mercFixture(); c.merc!.terms.command = command; const so = sortie();
  const prepared = sortieBattleSetup(s, ctx, so); assert(prepared.ok); const { sim, scenario } = prepared;
  const attached = sim.setup.units.filter(u => u.id.endsWith("/attached"));
  assert.equal(attached.length > 0, command !== "independent"); assert(attached.length <= 3);
  assert.equal(!!scenario.slots.ally, command !== "attached");
  if (command !== "attached") { assert.deepEqual(scenario.slots.player!.allies, ["ally"]); assert.deepEqual(scenario.slots.ally!.allies, ["player"]); }
  assert(sim.setup.units.some(u => u.id === so.units[0]!.mech)); assert.equal(new Set(sim.setup.units.map(u => u.id)).size, sim.setup.units.length);
  assert(attached.every(u => u.persons?.length));
});
test("BattleResult.units 包含 ally；真 sim 邊界", () => {
  const { s, ctx, c, sortie } = mercFixture(); c.merc!.terms.command = "independent"; const so = sortie();
  const prepared = sortieBattleSetup(s, ctx, so); assert(prepared.ok); prepared.sim.setup.maxRounds = 1;
  const run = runBattle({ db: ctx.db, sim: prepared.sim, seed: prepared.seed }); assert(run.result);
  assert(run.result.units.some(u => u.state.owner === "ally"));
  assert.equal(run.result.units.length, prepared.sim.setup.units.length);
});
test("軍令 optional 與人類敵軍來自 ModelDef.frame", () => { const { s, ctx, c, model, sortie } = mercFixture(); c.merc!.terms.orders = [{ kind: "survive", params: { rounds: 2 }, optional: true }]; const sc = generateScenario(s, ctx, sortie()); assert(sc.objectives.some(o => o.onComplete === "continue" && o.kind === "survive")); assert(sc.slots.enemy!.units.every(u => u.mech === ctx.world.require("model", model).frame)); });
test("裂獸敵方保留契約快照、情境生成決定性", () => { const { s, ctx, c, op, sortie } = mercFixture(); delete op.target.faction; c.target.snapshot = { family: "insect", width: "D", depth: "shallow", anchorAge: 0, phase: "opening" }; const so = sortie(); const a = generateScenario(structuredClone(s), ctx, so), b = generateScenario(structuredClone(s), ctx, so); assert.deepEqual(a, b); assert(a.slots.enemy!.units.every(u => u.monster)); });
