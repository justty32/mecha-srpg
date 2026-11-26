import test from "node:test";
import assert from "node:assert/strict";
import { mercFixture } from "../war/merc-fixture.ts";
import { generateScenario } from "./scenario.ts";
import { sortieBattleSetup } from "./run.ts";
import { runBattle } from "../../sim/index.ts";
import { createOpsCtx } from "../content/start.ts";
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

for (const kind of ["seize", "escort", "relic-hunt"]) test(`operation ${kind} 出口保留任務方向、盟軍跟隨玩家且擴圖重建`, () => {
  const { s, ctx, c, op, sortie, model } = mercFixture();
  c.merc!.terms.command = "independent";
  op.def = ctx.world.require("operation", `operation/${kind}`).id;
  // 保留全部兵力，增加部署容量需求以確保擴圖分支受到覆蓋。
  op.force.units = [{ model, count: 200, readiness: 1 }];
  const so = sortie(), copy = structuredClone(s);
  const scenario = generateScenario(s, ctx, so), again = generateScenario(copy, createOpsCtx(copy, ctx.db, ctx.world), so), map = scenario.ops.map;
  assert.deepEqual(scenario, again);
  assert.ok(map.height >= scenario.slots.ally!.units.length);
  assert.ok(map.height >= 50);
  const playerX = kind === "seize" ? 0 : map.width - 1, enemyX = kind === "seize" ? map.width - 1 : 0;
  assert.deepEqual(map.exits, Array.from({ length: map.height }, (_, y) => ({ x: playerX, y })));
  assert.deepEqual(map.exitsBySlot!.player, map.exits);
  assert.deepEqual(map.exitsBySlot!.ally, map.exits);
  assert.deepEqual(map.exitsBySlot!.enemy, Array.from({ length: map.height }, (_, y) => ({ x: enemyX, y })));
  for (const cells of Object.values(map.exitsBySlot!))
    assert.ok(cells.every(c => c.x >= 0 && c.x < map.width && c.y >= 0 && c.y < map.height));
  if (kind !== "seize") assert.ok(scenario.objectives.some(o => o.for === "player" && ["escort", "reachExit"].includes(o.kind)));
});
