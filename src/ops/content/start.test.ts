import { test } from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "./load.ts";
import { newCampaign } from "./start.ts";
import { checkLedger } from "../state/ledger.ts";
import { instantiatePools } from "./instantiate.ts";

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
