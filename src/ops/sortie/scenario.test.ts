import test from "node:test";
import assert from "node:assert/strict";
import { scenarioToSetup } from "../../sim/index.ts";
import { createOpsCtx } from "../content/start.ts";
import { generateScenario } from "./scenario.ts";
import { fixture } from "./test-support.ts";
import { createWorldDB } from "../content/worlddb.ts";

test("seal 守區避開敵軍初始格且從玩家初始格沿可通行地形可達", () => {
  const { s, ctx, sortie, contract } = fixture();
  contract.template = ctx.world.require("contract", "contract/seal").id;
  contract.target.snapshot!.depth = "core";
  const sc = generateScenario(s, ctx, sortie), sim = scenarioToSetup(ctx.db, sc, sc.seed!);
  const zone = sc.objectives.find(o => o.kind === "hold")!.params.zone as { x: number; y: number }[];
  assert.ok(zone.length > 0);
  assert.ok(zone.every(c => !sim.setup.units.some(u => u.owner === "enemy" && u.pos.x === c.x && u.pos.y === c.y)));
  const terrain = new Map(sim.setup.map.cells!.map(c => [`${c.at.x},${c.at.y}`, ctx.db.require("terrain", c.terrain)]));
  const reached = new Set<string>(), queue = sim.setup.units.filter(u => u.owner === "player").map(u => u.pos);
  for (const c of queue) reached.add(`${c.x},${c.y}`);
  for (let i = 0; i < queue.length; i++) {
    const at = queue[i]!;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const c = { x: at.x + dx, y: at.y + dy }, key = `${c.x},${c.y}`, cost = terrain.get(key)?.moveCost.leg;
      if (cost === null || cost === undefined || reached.has(key)) continue;
      reached.add(key); queue.push(c);
    }
  }
  assert.ok(zone.every(c => reached.has(`${c.x},${c.y}`)));
});

test("anchored clear 在錨在場時 killTarget 指向錨，opening 保持 eliminate", () => {
  for (const phase of ["anchored", "opening"] as const) {
    const { s, ctx, sortie, contract } = fixture();
    contract.target.snapshot!.depth = "core"; contract.target.snapshot!.phase = phase;
    const sc = generateScenario(s, ctx, sortie), sim = scenarioToSetup(ctx.db, sc, sc.seed!);
    if (phase === "opening") {
      assert.ok(sc.objectives.some(o => o.for === "player" && o.kind === "eliminate"));
      assert.ok(!sc.objectives.some(o => o.kind === "killTarget"));
    } else {
      const objective = sc.objectives.find(o => o.for === "player" && o.kind === "killTarget");
      assert.ok(objective);
      const anchor = ctx.world.require("rift", "rift/insect").anchor!;
      const index = sc.slots.enemy!.units.findIndex(u => u.monster === anchor);
      assert.equal(objective.params.unit, `enemy-${index}`);
      assert.ok(sim.setup.units.some(u => u.id === objective.params.unit));
    }
  }
});

test("核區契約依 opening 快照排除潮錨並殲滅先鋒，非 opening 保留潮錨", () => {
  for (const phase of ["opening", "anchored"] as const) {
    const { s, ctx, sortie, contract } = fixture();
    contract.template = ctx.world.require("contract", "contract/seal").id;
    const snapshot = contract.target.snapshot!;
    snapshot.depth = "core"; snapshot.phase = phase;
    // 現況與快照刻意不同，確保戰場使用接約時凍結的階段。
    s.rifts[sortie.rift!]!.phase = phase === "opening" ? "anchored" : "opening";
    const anchor = ctx.world.all("rift").find(def => def.family === snapshot.family)!.anchor;
    const scenario = generateScenario(s, ctx, sortie);
    const hasAnchor = scenario.slots.enemy!.units.some(unit => unit.monster === anchor);
    assert.equal(hasAnchor, phase !== "opening");
    if (phase === "opening") {
      assert.ok(scenario.slots.enemy!.units.length > 0);
      assert.deepEqual(scenario.objectives.map(objective => [objective.for, objective.kind]),
        [["player", "eliminate"], ["enemy", "eliminate"]]);
    } else assert.ok(scenario.objectives.some(objective => objective.for === "player" && objective.kind === "hold"));
  }
});

test("接下 clear 契約後的 ScenarioDef 可由 scenarioToSetup 載入", () => {
  const { s, ctx, sortie } = fixture();
  const def = generateScenario(s, ctx, sortie);
  const sim = scenarioToSetup(ctx.db, def, def.seed!);
  assert.ok(sim.setup.units.some(u => u.owner === "player"));
  assert.ok(sim.setup.units.some(u => u.owner === "enemy"));
  assert.equal(sim.setup.map.width * sim.setup.map.height, sim.setup.map.cells!.length);
  assert.ok(def.objectives.some(o => o.kind === "killTarget" && o.for === "player"));
});
test("同 state 與 rng 生成深相等情境", () => {
  const { s, ctx, sortie } = fixture(), copy = structuredClone(s), other = createOpsCtx(copy, ctx.db, ctx.world);
  const before = structuredClone(s.rng);
  assert.deepEqual(generateScenario(s, ctx, sortie), generateScenario(copy, other, sortie));
  assert.deepEqual(s.rng, copy.rng);
  assert.notDeepEqual(s.rng, before);
});

test("hold 缺 zone（含 anchor 與階段目標）展開可達守區，明列 zone 保留", () => {
  for (const params of [{ rounds: 5 }, { rounds: 5, role: "anchor" }, { rounds: 5, zone: [{ x: 2, y: 1 }] }]) {
    for (const staged of [false, true]) {
      const { s, ctx, sortie, contract } = fixture();
      const template = structuredClone(ctx.world.require("contract", "contract/seal"));
      template.objectives = [{ kind: "hold", params }];
      if (staged) template.stages = [{ objectives: template.objectives }];
      const overlay = createWorldDB(ctx.world.packs, { contract: { [template.id]: template } }), original = ctx.world;
      ctx.world = { ...original, require: (kind, id) => overlay.get(kind, id) ?? original.require(kind, id) };
      contract.template = template.id; contract.stageIdx = 0;
      const scenario = generateScenario(s, ctx, sortie);
      const hold = scenario.objectives.find(o => o.kind === "hold")!;
      if (params.zone) assert.deepEqual(hold.params.zone, params.zone);
      else {
        const zone = hold.params.zone as { x: number; y: number }[];
        assert.ok(zone.length > 0);
        assert.ok(zone.every(c => !scenario.ops.map.deployZones.enemy!.some(e => e.x === c.x && e.y === c.y)));
      }
      assert.equal(hold.params.rounds, 5);
      assert.deepEqual(template.objectives[0]!.params, params);
    }
  }
});

test("活捕 wear 70 的本能起點比 wear 0 高 10", async () => {
  const { instantiateMech } = await import("../content/instantiate.ts");
  const { admitBeast } = await import("../crew/restraint.ts");
  const { runBattle } = await import("../../sim/index.ts");
  const { s, ctx, sortie } = fixture();
  const mech = instantiateMech(ctx.db, "beast-sortie", "frame/bio-mite", { restraint: "component/shell-pin-restraint" });
  assert(admitBeast(s, ctx, mech)); sortie.units = [{ mech: mech.id, seats: {}, controlMode: "instinct" }];
  const values = [0, 70].map(wear => {
    s.restraint.beasts[mech.id]!.wear = wear;
    const scenario = generateScenario(s, ctx, sortie), sim = scenarioToSetup(ctx.db, scenario, scenario.seed!);
    const run = runBattle({ db: ctx.db, sim, seed: scenario.seed!, maxSteps: 0 });
    return run.state.units["player-0"]!.pools.instinct!.cur;
  });
  assert.equal(values[1]! - values[0]!, 10);
});
test("屍體改裝機帶駕駛員可出戰，活捕帶座位拒絕", async () => {
  const { instantiateMech } = await import("../content/instantiate.ts");
  const { validateSortie } = await import("./validate.ts");
  const { s, ctx, sortie, person } = fixture();
  const mech = instantiateMech(ctx.db, "corpse-sortie", "frame/corpse-mite"); s.mechs[mech.id] = mech;
  s.restraint.slots[0] = mech.id; s.restraint.beasts[mech.id] = { mech: mech.id, kind: "corpse", wear: 0, vitality: 0, bond: {} };
  sortie.units = [{ mech: mech.id, seats: { pilot: person }, controlMode: "pilot" }];
  assert.deepEqual(validateSortie(s, ctx, sortie), { ok: true });
  s.restraint.beasts[mech.id]!.kind = "live"; mech.frame = ctx.db.require("frame", "frame/bio-mite").id;
  assert.deepEqual(validateSortie(s, ctx, sortie), { ok: false, error: "captured-requires-instinct" });
});
