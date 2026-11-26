import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createBattle, exitsFor, retreatCellsFor } from "../../src/rules/index.ts";
import { createRulesQuery } from "../../src/ai/adapters/rules-adapter.ts";
import { createStubRules, makeStubBattle } from "../ai/stub-rules.ts";

const { db } = loadContentDirs(["content/base"]);
function state(width = 4, height = 3) {
  return createBattle(db, { id: "exits", map: { width, height, fill: "terrain/plain", exits: [] }, units: [], objectives: [] }, 1);
}

test("雙查詢、adapter及stub三方出口與空slot優先，純讀且回副本", () => {
  const s = state();
  s.rt!.exits = [{ x: 1, y: 0 }];
  s.rt!.exitsBySlot = { player: [{ x: 0, y: 1 }], enemy: [{ x: 3, y: 1 }], third: [] };
  const stub = makeStubBattle({ width: 4, height: 3, units: [], exits: s.rt!.exits, exitsBySlot: s.rt!.exitsBySlot }, 1);
  const q = createRulesQuery(db), sq = createStubRules({}).q;
  for (const [snapshot, query] of [[s, q], [stub, sq]] as const) {
    for (const blocked of [false, true]) {
      snapshot.rt!.noRetreat = blocked;
      const before = structuredClone(snapshot);
      for (const [slot, expected] of Object.entries({ player: [{ x: 0, y: 1 }], enemy: [{ x: 3, y: 1 }], third: [], missing: [{ x: 1, y: 0 }] })) {
        assert.deepEqual(query.exitsFor(snapshot, slot), expected);
        assert.deepEqual(query.retreatCellsFor(snapshot, slot), blocked ? [] : expected);
        const copy = query.exitsFor(snapshot, slot);
        if (copy.length) copy[0]!.x = 99;
        const retreatCopy = query.retreatCellsFor(snapshot, slot);
        if (retreatCopy.length) retreatCopy[0]!.x = 99;
      }
      assert.deepEqual(snapshot, before);
    }
  }
});

test("舊圖四邊角落去重且y/x排序；缺runtime查詢不初始化", () => {
  for (const [width, height] of [[4, 3], [1, 3], [3, 1], [1, 1]]) {
    const s = state(width!, height!), before = structuredClone(s), expected = [];
    for (let y = 0; y < height!; y++) for (let x = 0; x < width!; x++) {
      if (x === 0 || y === 0 || x === width! - 1 || y === height! - 1) expected.push({ x, y });
    }
    assert.deepEqual(exitsFor(s, "enemy"), []);
    assert.deepEqual(retreatCellsFor(s, "enemy"), expected);
    assert.deepEqual(s, before);
    assert.equal(Object.hasOwn(s.rt!, "exitsBySlot"), false);
    assert.equal(Object.hasOwn(s.rt!, "deployZones"), false);
    delete s.rt;
    const withoutRuntime = structuredClone(s);
    assert.deepEqual(exitsFor(s, "enemy"), []);
    assert.deepEqual(retreatCellsFor(s, "enemy"), expected);
    assert.deepEqual(s, withoutRuntime);
  }
});

test("派生四邊、總距離與同距優先序，slot及格固定排序且不改來源", async () => {
  const { materializeExits } = await import("../../src/sim/exits.ts");
  const map = structuredClone(db.require("map", "map/skirmish-20"));
  map.width = 9; map.height = 9;
  map.deployZones = { zTop: [{ x: 4, y: 0 }], aLeft: [{ x: 0, y: 4 }],
    right: [{ x: 8, y: 4 }], bottom: [{ x: 4, y: 8 }], tie: [{ x: 4, y: 4 }],
    total: [{ x: 0, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 1 }], empty: [] };
  delete map.exitsBySlot;
  const before = structuredClone(map), result = materializeExits(map)!;
  const vertical = (x: number) => Array.from({ length: 9 }, (_, y) => ({ x, y }));
  const horizontal = (y: number) => Array.from({ length: 9 }, (_, x) => ({ x, y }));
  assert.deepEqual(Object.keys(result), ["aLeft", "bottom", "right", "tie", "total", "zTop"]);
  assert.deepEqual(result.aLeft, vertical(0)); assert.deepEqual(result.right, vertical(8));
  assert.deepEqual(result.zTop, horizontal(0)); assert.deepEqual(result.bottom, horizontal(8));
  assert.deepEqual(result.tie, vertical(0)); assert.deepEqual(result.total, horizontal(0));
  assert.deepEqual(materializeExits(map), result);
  assert.deepEqual(map, before);
  map.deployZones = { rightTop: [{ x: 8, y: 0 }], topBottom: [{ x: 4, y: 0 }] };
  map.width = 9; map.height = 1;
  assert.deepEqual(materializeExits(map)!.rightTop, [{ x: 8, y: 0 }]);
  assert.deepEqual(materializeExits(map)!.topBottom, Array.from({ length: 9 }, (_, x) => ({ x, y: 0 })));
  map.width = 1; map.height = 3; map.deployZones = { single: [{ x: 0, y: 1 }] };
  assert.deepEqual(materializeExits(map)!.single, Array.from({ length: 3 }, (_, y) => ({ x: 0, y })));
});

test("手標含空陣列優先，缺部署不捏造；直接BattleSetup不派生", async () => {
  const { materializeExits } = await import("../../src/sim/exits.ts");
  const map = structuredClone(db.require("map", "map/skirmish-20"));
  map.exitsBySlot = { player: [], enemy: [{ x: 1, y: 1 }], third: [] };
  const before = structuredClone(map), result = materializeExits(map)!;
  assert.deepEqual(result, map.exitsBySlot); result.enemy![0]!.x = 99;
  assert.deepEqual(map, before);
  delete map.exitsBySlot; map.deployZones = { empty: [] };
  assert.equal(materializeExits(map), undefined);
  const direct = createBattle(db, { id: "direct", map: { width: 4, height: 3,
    fill: "terrain/plain", exits: [{ x: 1, y: 0 }], deployZones: { enemy: [{ x: 3, y: 1 }] } },
    units: [], objectives: [] }, 1);
  assert.equal(Object.hasOwn(direct.rt!, "exitsBySlot"), false);
  assert.deepEqual(exitsFor(direct, "enemy"), [{ x: 1, y: 0 }]);
});

test("正式圖skirmish敵右邊、combined單格共用不省略整邊、三方出口界內", async () => {
  const { scenarioToSetup } = await import("../../src/sim/run.ts");
  for (const id of ["scenario/skirmish-whitegloves", "scenario/combined-arms-battlefield", "scenario/nairobi-joint-cordon", "scenario/kj-quay-rise"]) {
    const source = db.require("scenario", id), map = db.require("map", source.map), before = structuredClone(map);
    const sim = scenarioToSetup(db, id, 1), again = scenarioToSetup(db, id, 2);
    assert.deepEqual(sim.setup.map.exitsBySlot, again.setup.map.exitsBySlot);
    assert.deepEqual(sim.setup.map.exits, map.exits);
    for (const [slot, zone] of Object.entries(map.deployZones)) {
      if (!zone.length) continue;
      const exits = sim.setup.map.exitsBySlot![slot]!;
      assert.ok(exits.length > 0);
      assert.ok(exits.every(c => c.x >= 0 && c.y >= 0 && c.x < map.width && c.y < map.height));
    }
    if (id.includes("skirmish"))
      assert.deepEqual(sim.setup.map.exitsBySlot!.enemy,
        Array.from({ length: map.height }, (_, y) => ({ x: map.width - 1, y })));
    if (id.includes("combined-arms")) {
      const enemy = map.deployZones.enemy!;
      assert.deepEqual([
        enemy.reduce((sum, c) => sum + c.x, 0),
        enemy.reduce((sum, c) => sum + map.width - 1 - c.x, 0),
        enemy.reduce((sum, c) => sum + c.y, 0),
        enemy.reduce((sum, c) => sum + map.height - 1 - c.y, 0),
      ], [71, 44, 41, 44]);
      assert.deepEqual(sim.setup.map.exitsBySlot!.enemy,
        Array.from({ length: map.width }, (_, x) => ({ x, y: 0 })));
      assert.equal(map.exits.length, 1);
      assert.deepEqual(sim.setup.map.exitsBySlot!.player,
        Array.from({ length: map.height }, (_, y) => ({ x: 0, y })));
    }
    assert.deepEqual(map, before);
  }
});

test("同邊單格共用出口不省略整邊，無部署scenario保持舊fallback與欄位缺省", async () => {
  const { scenarioToSetup } = await import("../../src/sim/run.ts");
  const { materializeExits } = await import("../../src/sim/exits.ts");
  const map = structuredClone(db.require("map", "map/skirmish-20"));
  map.deployZones = { player: [{ x: 1, y: 10 }] };
  map.exits = [{ x: 0, y: 10 }];
  delete map.exitsBySlot;
  assert.deepEqual(materializeExits(map)!.player, Array.from({ length: map.height }, (_, y) => ({ x: 0, y })));
  map.deployZones = {};
  const source = db.require("scenario", "scenario/skirmish-whitegloves");
  const sim = scenarioToSetup(db, { ...source, slots: {}, objectives: [], mapDef: map }, 1);
  assert.equal(Object.hasOwn(sim.setup.map, "exitsBySlot"), false);
  assert.deepEqual(sim.setup.map.exits, [{ x: 0, y: 10 }]);
  assert.deepEqual(exitsFor(createBattle(db, sim.setup, 1), "missing"), map.exits);
});


test("正式護送與突破任務保留原逐格出口，目標owner不誤走部署邊", async () => {
  const { scenarioToSetup } = await import("../../src/sim/run.ts");
  let checked = 0;
  for (const scenario of db.all("scenario")) {
    if (!scenario.objectives.some(o => o.kind === "escort" || o.kind === "reachExit")) continue;
    const map = db.require("map", scenario.map), before = structuredClone(map);
    const { setup } = scenarioToSetup(db, scenario.id, 1);
    for (const objective of setup.objectives ?? []) {
      if (objective.kind !== "escort" && objective.kind !== "reachExit") continue;
      const ids = Array.isArray(objective.params.units) ? objective.params.units
        : typeof objective.params.unit === "string" ? [objective.params.unit] : [];
      assert.ok(ids.length > 0, scenario.id);
      const slots = new Set([objective.for]);
      for (const id of ids) {
        const target = setup.units.find(unit => unit.id === id);
        assert.ok(target, `${scenario.id}: ${id}`);
        slots.add(target!.owner);
      }
      for (const slot of slots) {
        assert.deepEqual(map.exitsBySlot?.[slot], map.exits, `${scenario.id}: explicit ${slot}`);
        assert.deepEqual(setup.map.exitsBySlot?.[slot], map.exits, `${scenario.id}: runtime ${slot}`);
      }
      checked++;
    }
    assert.deepEqual(map, before);
  }
  assert.equal(checked, 20);
});

test("真實車隊必須向東抵達原出口，西部署邊不算護送完成", async () => {
  const { scenarioToSetup } = await import("../../src/sim/run.ts");
  const { objectiveDone } = await import("../../src/rules/objectives.ts");
  const { setup } = scenarioToSetup(db, "scenario/convoy-run", 1);
  const s = createBattle(db, setup, 1), ctx = { db, s };
  const goal = s.rt!.objectives.find(o => o.kind === "escort")!;
  const targets = ["convoy-0", "convoy-1"];
  targets.forEach((id, i) => { s.units[id]!.pos = { x: 0, y: i + 1 }; });
  assert.equal(objectiveDone(ctx, goal), false);
  targets.forEach((id, i) => { s.units[id]!.pos = { x: 79, y: i + 1 }; });
  assert.equal(objectiveDone(ctx, goal), true);
  assert.deepEqual(retreatCellsFor(s, "convoy"), exitsFor(s, "player"));
});
