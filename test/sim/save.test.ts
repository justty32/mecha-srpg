import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import { createContentDB } from "../../src/content/contentdb.ts";
import { createSave, serializeSave, parseSave, loadSave, packHash } from "../../src/sim/save.ts";
import { runBattle, scenarioToSetup } from "../../src/sim/run.ts";
import { db, sample } from "./helpers.ts";

function fixture(snapshot = false) {
  const { sim, run } = sample();
  return createSave(db, { scenario: sim.scenario, seed: 1, setup: sim.setup, commands: run.commands,
    ...(snapshot ? { snapshot: run.state } : {}) });
}

function copyDefs(): Parameters<typeof createContentDB>[3] {
  return Object.fromEntries(CONTENT_KINDS.map(kind => [kind, Object.fromEntries(db.all(kind).map(def => [def.id, structuredClone(def)]))]));
}

test("save：serialize → parse 來回相等，拒絕壞形狀與版本", () => {
  const save = fixture();
  save.campaignBlob = { chapter: 3, special: { $sim: "number", value: "Infinity" } };
  assert.deepEqual(parseSave(serializeSave(save)), save);
  assert.throws(() => parseSave('{"version":2}'));
  assert.throws(() => parseSave(JSON.stringify({ ...save, commands: [{ kind: "teleport", actor: "x" }] })));
});

test("save：含 Infinity 池的 snapshot 可往返並通過重播驗證", () => {
  // base 未宣告無上限池；僅在記憶體複本將熱量 max 設 null，仍由規則產生 Infinity。
  const defs = copyDefs();
  defs.frame![db.require("frame", "frame/hound-mk2").id]!.pools[0]!.max = null;
  const unlimited = createContentDB([...db.packs], db.registries, db.rules, defs);
  const sim = scenarioToSetup(unlimited, "scenario/skirmish-whitegloves", 1, { rounds: 1 });
  const run = runBattle({ db: unlimited, sim, seed: 1 });
  const save = createSave(unlimited, { scenario: sim.scenario, seed: 1, setup: sim.setup, commands: run.commands, snapshot: run.state });
  const pools = [...Object.values(save.snapshot!.units), ...Object.values(save.snapshot!.persons)].flatMap(owner => Object.values(owner.pools));
  assert.ok(pools.some(pool => pool.max === Infinity));
  const parsed = parseSave(serializeSave(save));
  assert.deepEqual(parsed, save);
  assert.deepEqual(loadSave(unlimited, parsed, { verifySnapshot: true }), { state: save.snapshot, warnings: [] });
  parsed.snapshot!.round++;
  assert.throws(() => loadSave(unlimited, parsed, { verifySnapshot: true }), /snapshot/);
});

test("packHash：定義與規則內容改變都會改 hash", () => {
  const defs = copyDefs();
  const unchanged = createContentDB([...db.packs], db.registries, db.rules, defs);
  assert.equal(packHash(unchanged, "base"), packHash(db, "base"));
  defs.frame![db.require("frame", "frame/hound-mk2").id]!.name += " changed";
  const changed = createContentDB([...db.packs], db.registries, db.rules, defs);
  assert.notEqual(packHash(changed, "base"), packHash(db, "base"));
  const tables = structuredClone(db.rules);
  tables.constants.fatigueInitiativeK = (tables.constants.fatigueInitiativeK ?? 0) + 1;
  assert.notEqual(packHash(createContentDB([...db.packs], db.registries, tables, defs), "base"), packHash(changed, "base"));
});

test("save：pack hash 不符且無 snapshot 時拒載", () => {
  const save = fixture();
  save.contentPacks[0]!.hash = "0000000000000000";
  assert.throws(() => loadSave(db, save), /hash/);
});

test("save：pack hash 不符但有 snapshot 時載入並警告", () => {
  const save = fixture(true);
  save.contentPacks[0]!.hash = "0000000000000000";
  const loaded = loadSave(db, save, { verifySnapshot: true });
  assert.deepEqual(loaded.state, save.snapshot);
  assert.notStrictEqual(loaded.state, save.snapshot);
  assert.equal(loaded.warnings.length, 1);
  assert.match(loaded.warnings[0]!, /snapshot/);
});

test("save：新物件、回收與投石命令可serialize/parse/load並驗證重播", async () => {
  const { createBattle, startBattle, currentActor, tryCommand } = await import("../../src/rules/index.ts");
  const setup: import("../../src/rules/index.ts").BattleSetup = {
    id: "save-battlefield", map: { width: 4, height: 4, fill: "terrain/plain", exits: [], objects: [
      { id: "stone", name: "碎石", kind: "debris", at: { x: 1, y: 1 }, debris: 2 },
      { id: "wreck", name: "殘骸", kind: "wreck", at: { x: 1, y: 1 }, salvage: { "stock:scrap": 5 } },
    ] }, units: [
      { id: "a", owner: "player", frame: "frame/hound-mk2", pos: { x: 1, y: 1 }, persons: [{ id: "pilot", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "b", owner: "enemy", frame: "frame/hound-mk2", pos: { x: 2, y: 1 }, crew: "remote", core: false },
    ], objectives: [],
  };
  const state = createBattle(db, setup, 1), ctx = { db, s: state };
  startBattle(ctx);
  assert.equal(currentActor(state), "a");
  const commands: import("../../src/core/types-state.ts").Command[] = [
    { kind: "move", actor: "a", path: [{ x: 0, y: 1 }] },
    { kind: "interact", actor: "a", object: "stone" },
    { kind: "interact", actor: "a", object: "wreck" },
    { kind: "throwDebris", actor: "a", target: "b" },
  ];
  for (const command of commands) assert.equal(tryCommand(ctx, command).ok, true);
  const save = createSave(db, { scenario: null, seed: 1, setup, commands, snapshot: state });
  const parsed = parseSave(serializeSave(save));
  const loaded = loadSave(db, parsed, { verifySnapshot: true });
  assert.deepEqual(loaded.state, state);
  assert.deepEqual(loaded.state.units.a!.motion, { dx: -1, dy: 0 });
  assert.equal(loaded.state.map.objects![0]!.collected, true);
  assert.equal(loaded.state.map.debrisAmmo!.a, 1);
  assert.equal(loaded.state.map.salvage![0]!.materials["stock:scrap"], 5);
  assert.throws(() => parseSave(JSON.stringify({ ...save, commands: [{ kind: "interact", actor: "a", object: 42 }] })));
});

test("save：預付盾準備與實際motion保留，讀回可驗證同一重播", async () => {
  const { createBattle, startBattle, currentActor, tryCommand } = await import("../../src/rules/index.ts");
  const setup: import("../../src/rules/index.ts").BattleSetup = { id: "save-defense", map: { width: 4, height: 4, fill: "terrain/plain", exits: [] }, units: [
    { id: "a", owner: "player", frame: "frame/moji-tern", pos: { x: 1, y: 1 }, components: { "right-weapon": "component/mx-radiant-rifle", "left-weapon": "component/battlefield-shield" }, persons: [{ id: "pilot", def: "person/ren-kasai", seat: "pilot" }] },
    { id: "b", owner: "enemy", frame: "frame/moji-tern", pos: { x: 3, y: 1 }, core: false, crew: "remote" },
  ], objectives: [] };
  const state = createBattle(db, setup, 1), ctx = { db, s: state }; startBattle(ctx);
  assert.equal(currentActor(state), "a");
  const commands: import("../../src/core/types-state.ts").Command[] = [
    { kind: "useAbility", actor: "a", ability: "ability/mx-guard-stance", target: { unit: "a" } },
    { kind: "move", actor: "a", path: [{ x: 1, y: 2 }] },
  ];
  for (const command of commands) assert.equal(tryCommand(ctx, command).ok, true);
  const save = createSave(db, { scenario: null, seed: 1, setup, commands, snapshot: state });
  const loaded = loadSave(db, parseSave(serializeSave(save)), { verifySnapshot: true });
  assert.deepEqual(loaded.state.units.a!.motion, { dx: 0, dy: 1 });
  assert.equal(loaded.state.units.a!.moveSpent, 1);
  assert.equal(loaded.state.units.a!.defense!.kind, "block");
  assert.equal(loaded.state.units.a!.defense!.charges, 2);
  assert.deepEqual(loaded.state, state);
});
