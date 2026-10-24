import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createContentDB } from "../../src/content/contentdb.ts";
import { planProbe, probe, snapshotDb } from "../../src/sim/probe.ts";
import { runBattle, scenarioToSetup } from "../../src/sim/run.ts";
import baselines from "../../src/sim/probe-baselines.json" with { type: "json" };

const { db, errors } = loadContentDirs(["content/base"]);
assert.equal(errors.length, 0);

test("frame 配同級摹機與怪獸，主角 defaultLoadout 與基準明寫配裝分開", () => {
  const plan = planProbe(db, "frame/longspear-v4");
  assert.equal(plan.pairings.length, 2);
  const hero = plan.pairings[0]!.scenario.slots.player!.units[0]!;
  assert.deepEqual(hero.components, db.require("frame", hero.mech!).defaultLoadout ?? {});
  assert.equal(plan.pairings[0]!.scenario.slots.enemy!.units[0]!.mech, baselines.grades.C.frame);
  assert.deepEqual(plan.pairings[0]!.scenario.slots.enemy!.units[0]!.components, baselines.grades.C.components);
  assert.equal(plan.pairings[1]!.scenario.slots.enemy!.units[0]!.monster, baselines.grades.C.monster);
});

test("monster 對同級兩台基準摹機", () => {
  const plan = planProbe(db, "monster/tidewolf-c");
  assert.equal(plan.pairings.length, 1);
  const enemies = plan.pairings[0]!.scenario.slots.enemy!.units;
  assert.equal(enemies.length, 2);
  assert.ok(enemies.every(u => db.require("frame", u.mech!).grade === "C"));
  assert.notDeepEqual(enemies[0]!.at, enemies[1]!.at);
});

test("ability 找第一個載體；component defaultLoadout 與 monster extraAbilities 也可找到", () => {
  const plan = planProbe(db, "ability/mx-head-vulcan");
  const candidates = db.all("frame").filter(f => f.innateAbilities.some(id => db.require("ability", id).id === plan.focusAbility)).map(f => f.id).sort();
  assert.equal(plan.carrier, candidates[0]);
  assert.equal(plan.pairings.length, 2);
  const snapshot = structuredClone(snapshotDb(db)), defs = snapshot[3];
  const frame = defs.frame![db.require("frame", "frame/longspear-v4").id]!;
  const original = db.require("ability", "ability/mx-head-vulcan");
  const ability = { ...original, id: "base:ability/probe-component" };
  defs.ability![ability.id] = ability;
  const component = { ...db.require("component", "component/autocannon-30"), id: "base:component/probe-component", abilities: [ability.id] };
  defs.component![component.id] = component;
  frame.defaultLoadout = { "left-weapon": component.id };
  assert.equal(planProbe(createContentDB(...snapshot), ability.id).carrier, frame.id);
  const extra = { ...original, id: "base:ability/probe-extra" };
  defs.ability![extra.id] = extra;
  const monster = defs.monster![db.require("monster", "monster/tidewolf-c").id]!;
  monster.extraAbilities = [extra.id];
  assert.equal(planProbe(createContentDB(...snapshot), extra.id).carrier, monster.id);
});

test("scenario 用情境 rounds，明寫 rounds 才覆寫", () => {
  const plan = planProbe(db, "scenario/quarry-duel");
  assert.equal(plan.pairings.length, 1);
  assert.equal(plan.pairings[0]!.scenario.rounds, db.require("scenario", "scenario/quarry-duel").rounds);
  assert.equal(planProbe(db, "scenario/quarry-duel", { rounds: 3 }).pairings[0]!.scenario.rounds, 3);
});

test("jobs 1 與 2 結果逐字相同，記憶體內容可跨 worker", async () => {
  const snapshot = structuredClone(snapshotDb(db));
  const id = db.require("scenario", "scenario/quarry-duel").id;
  snapshot[3].scenario![id]!.rounds = 2;
  const memoryDb = createContentDB(...snapshot), ids = [id, "monster/tidewolf-c"];
  const one = await probe(memoryDb, ids, { n: 2, jobs: 1, rounds: 2 });
  const two = await probe(memoryDb, ids, { n: 2, jobs: 2, rounds: 2 });
  assert.equal(JSON.stringify(one), JSON.stringify(two));
  assert.ok(one.results.every(r => r.pairings.every(p => p.exceptions === 0 && p.trials.length === 2)));
});

test("bands 能檢出超標記憶體內容；正常 HP 不誤報", () => {
  const clean = planProbe(db, "frame/longspear-v4");
  assert.ok(!clean.bands.some(b => b.field === "摹機總層 HP"));
  const snapshot = structuredClone(snapshotDb(db));
  const bodyId = db.require("bodyplan", db.require("frame", "frame/longspear-v4").bodyPlan).id;
  snapshot[3].bodyplan![bodyId]!.parts[0]!.layers[0]!.hp = 9999;
  const findings = planProbe(createContentDB(...snapshot), "frame/longspear-v4").bands;
  assert.ok(findings.some(b => b.field === "摹機總層 HP" && b.value > b.max && b.message.includes("C 級上限")));
  const bands = JSON.parse(readFileSync("wf/workflows/content/numeric-bands.json", "utf8")) as { rows: Record<string, string>[] };
  bands.rows.find(r => r.類別 === "摹機" && r.指標 === "總層 HP")!.C = "1–20000";
  bands.rows.find(r => r.類別 === "摹機" && r.指標 === "總層 HP")!["建議區間與硬上限"] = "C 硬上限 500";
  mkdirSync("/tmp/cx-gb-probe", { recursive: true });
  writeFileSync("/tmp/cx-gb-probe/test-bands.json", JSON.stringify(bands));
  const custom = planProbe(createContentDB(...snapshot), "frame/longspear-v4", { bands: "/tmp/cx-gb-probe/test-bands.json" });
  assert.ok(!custom.bands.some(b => b.field === "摹機總層 HP"));
  assert.ok(custom.bands.some(b => b.field === "摹機總層 HP 硬上限" && b.max === 500));
});

test("JSON 形狀與 AbilityUsed 計數、從未使用能力一致", async () => {
  const result = await probe(db, ["frame/longspear-v4"], { n: 1, jobs: 1, rounds: 2 });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.equal(result.version, 1);
  assert.ok(result.uncheckedBands.length > 0);
  assert.equal(result.bandsSource, "wf/workflows/content/numeric-bands.json");
  const p = result.results[0]!.pairings[0]!;
  assert.equal(p.n, 1); assert.equal(p.exceptions, 0);
  assert.equal(p.winRate + p.lossRate + p.drawRate, 1);
  assert.equal(p.trials[0]!.seed, 1);
  assert.equal(typeof p.averageRounds, "number");
  const pairing = planProbe(db, "frame/longspear-v4", { rounds: 2 }).pairings[0]!;
  const run = runBattle({ db, sim: scenarioToSetup(db, pairing.scenario, 1), seed: 1 });
  const events = run.state.log.events.filter(e => e.type === "AbilityUsed" && db.require("ability", String(e.payload.ability)).mode !== "reaction");
  assert.equal(Object.values(p.abilityUses).reduce((s, n) => s + n, 0), events.length);
  assert.ok(p.neverUsedAbilities.every(id => !p.protagonistAbilityUses[id]));
});
