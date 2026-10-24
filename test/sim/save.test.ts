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
