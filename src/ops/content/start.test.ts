import { test } from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "./load.ts";
import { newCampaign } from "./start.ts";
import { checkLedger } from "../state/ledger.ts";
import { instantiatePools } from "./instantiate.ts";
import { readPackDir } from "../../content/loader.ts";
import { loadWorldPacks } from "./load.ts";
import { checkWorld } from "./check.ts";
import { generateScenario } from "../sortie/scenario.ts";
import type { SortieScenario } from "../sortie/scenario.ts";
import { fixture } from "../sortie/test-support.ts";
import { createBattle } from "../../rules/flow.ts";
import { abilitiesOf } from "../../rules/command.ts";

test("開局裝備含部件層與彈藥，舊字串合法，錯槽／缺部件能被檢查擋下", () => {
  const pack = readPackDir("content/base"), loaded = loadWorldPacks([pack]);
  const s = newCampaign(loaded.db, loaded.world, "start/default", 7), mech = Object.values(s.mechs)[0]!;
  assert.equal(mech.parts["right-arm"]!.components["right-weapon"], "base:component/autocannon-30");
  assert.equal(mech.parts["right-arm"]!.layers.at(-1)!.hp, 20);
  assert.equal(mech.pools["ammo-30"]!.cur, 12);
  const battle = createBattle(loaded.db, { id: "armed", map: { width: 2, height: 2, fill: "terrain/plain", exits: [] }, objectives: [], units: [
    { id: "armed", owner: "player", frame: mech.frame, pos: { x: 0, y: 0 }, components: { "right-weapon": "component/autocannon-30" } }] }, 7);
  assert.ok(abilitiesOf({ db: loaded.db, s: battle }, "armed").includes("base:ability/burst-30"));
  const start = pack.files["world/campaign-start/default.json"] as { mechs: unknown[] };
  start.mechs = ["frame/hound-mk2"];
  const legacy = loadWorldPacks([pack]);
  assert.deepEqual(checkWorld(legacy.db, legacy.world).errors, []);
  assert.equal(Object.values(newCampaign(legacy.db, legacy.world, "start/default", 7).mechs)[0]!.parts["right-arm"]!.components["right-weapon"], null);
  for (const components of [{ cockpit: "component/autocannon-30" }, { "right-weapon": "component/missing" }]) {
    start.mechs = [{ frame: "frame/hound-mk2", components }];
    const bad = loadWorldPacks([pack]);
    assert.ok(checkWorld(bad.db, bad.world).errors.length > 0);
  }
});
test("ops 情境有內容輪數上限，部署欄與出口不重疊", () => {
  const { s, ctx, sortie } = fixture(), scenario = generateScenario(s, ctx, sortie) as SortieScenario;
  assert.equal(scenario.rounds, ctx.db.rules.constants.opsBattleMaxRounds);
  assert.ok(scenario.ops.map.deployZones.player!.every(c => c.x === 1 || c.x === 2));
  assert.ok(scenario.ops.map.exits.every(c => c.x === 0));
  assert.ok(scenario.ops.map.deployZones.enemy!.every(c => c.x === scenario.ops.map.width - 1));
});

test("start：JSON 往返相等、帳本不變量與 seeded 開局", () => {
  const { db, world } = loadWorldDirs(["content/base"]), s = newCampaign(db, world, "start/default", 7);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
  assert.deepEqual(checkLedger(s), []);
  assert.deepEqual(newCampaign(db, world, "start/default", 7), s);
  assert.notDeepEqual(newCampaign(db, world, "start/default", 8).rng, s.rng);
  assert.equal(s.ledger.balances.cash, 1200); assert.equal(s.ledger.balances.debt, 24000);
  assert.equal(Object.keys(s.roster.persons).length, 7);
  assert.ok(Object.values(s.roster.mastery).every(nodes => Object.values(nodes).every(value => value === 0)));
});
test("instantiate：開局機甲有部位、池與空座位，無上限池仍可 JSON 化", () => {
  const { db, world } = loadWorldDirs(["content/base"]), s = newCampaign(db, world, "start/default", 7);
  assert.equal(Object.keys(s.mechs).length, 3);
  for (const mech of Object.values(s.mechs)) {
    assert.ok(Object.keys(mech.parts).length > 0); assert.ok(Object.keys(mech.pools).length > 0);
    assert.equal(mech.parts.torso!.layers[0]!.hp, 60);
    assert.equal(mech.pools.heat!.max, 100);
    assert.ok(Object.values(mech.seats).every(p => p === null));
  }
  const pools = instantiatePools([{ id: "unlimited", name: "無上限", min: 0, max: null, initial: 3, regen: 0, capKind: "soft", inverted: false, bands: [] }], {});
  assert.deepEqual(JSON.parse(JSON.stringify(pools)), pools);
});
