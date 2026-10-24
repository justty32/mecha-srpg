import test from "node:test";
import assert from "node:assert/strict";
import { scenarioToSetup } from "../../sim/index.ts";
import { createOpsCtx } from "../content/start.ts";
import { generateScenario } from "./scenario.ts";
import { fixture } from "./test-support.ts";

test("接下 clear 契約後的 ScenarioDef 可由 scenarioToSetup 載入", () => {
  const { s, ctx, sortie } = fixture();
  const def = generateScenario(s, ctx, sortie);
  const sim = scenarioToSetup(ctx.db, def, def.seed!);
  assert.ok(sim.setup.units.some(u => u.owner === "player"));
  assert.ok(sim.setup.units.some(u => u.owner === "enemy"));
  assert.equal(sim.setup.map.width * sim.setup.map.height, sim.setup.map.cells!.length);
  assert.ok(def.objectives.some(o => o.kind === "eliminate" && o.for === "player"));
});
test("同 state 與 rng 生成深相等情境", () => {
  const { s, ctx, sortie } = fixture(), copy = structuredClone(s), other = createOpsCtx(copy, ctx.db, ctx.world);
  const before = structuredClone(s.rng);
  assert.deepEqual(generateScenario(s, ctx, sortie), generateScenario(copy, other, sortie));
  assert.deepEqual(s.rng, copy.rng);
  assert.notDeepEqual(s.rng, before);
});
