import test from "node:test";
import assert from "node:assert/strict";
import { addRift, fixture } from "./test-support.ts";
import { actionsDaily2 } from "./actions.ts";
import { contractsDaily2 } from "../contracts/lifecycle.ts";
import { cmdTrade, marketListings } from "./market.ts";
import { placeLoc } from "../war/loc.ts";
import { factionId } from "../war/relations.ts";
import { repGate } from "../war/rnd.ts";
import type { MarketDef } from "../state/types.ts";

test("第三刃五機型歸屬第三刃，聲望門檻依級別而非鹽鷗", () => {
  const { s, ctx } = fixture(), maker = ctx.db.require("faction", "faction/third-blade");
  assert.equal(maker.relations[ctx.db.require("faction", "faction/salt-gull-hunters").id], "hostile");
  for (const [name, tier, gate] of [
    ["swordfish-iii", "C", 20], ["swordfish-v5", "B", 35], ["binary-swordfish", "A", 55],
    ["needlefish-ii", "C", 20], ["skate-iv", "B", 35],
  ] as const) {
    const model = ctx.world.require("model", `model/thirdblade-${name}`);
    assert.equal(model.maker, maker.id);
    assert.equal(factionId(s, ctx, model.maker), ctx.world.require("faction-ops", "faction-ops/third-blade").id);
    assert.notEqual(model.maker, ctx.db.require("faction", "faction/salt-gull-hunters").id);
    assert.equal(model.tier, tier);
    assert.equal(repGate(s, ctx, model), gate);
  }
});

test("第三刃在新加坡 presence 發包，契約種能進池且不佔地不駐軍", () => {
  const { s, ctx } = fixture(), def = ctx.world.require("faction-ops", "faction-ops/third-blade");
  const port = ctx.world.require("place", "place/singapore"), owners = structuredClone(s.places);
  assert.deepEqual(def.presence, [port.id]);
  assert(def.tags.includes("presence-board"));
  assert.deepEqual(def.territory, []);
  assert.deepEqual(def.roster, []);
  assert.deepEqual(def.actionLanes, ["world"]);
  assert.deepEqual(s.factions[def.id]!.territoryNow, []);
  assert.equal(s.factions[def.id]!.forces, undefined);
  actionsDaily2(s, ctx);
  contractsDaily2(s, ctx);
  assert(Object.values(s.contracts).some(c => c.issuer === def.id && c.target.place === port.id &&
    c.template === ctx.world.require("contract", "contract/defend-citywall").id && c.status === "offered"));
  addRift(s, ctx, { site: port.id, at: placeLoc(s, ctx, port.id) });
  s.contracts = {};
  for (const id of def.contractKinds) {
    const template = ctx.world.require("contract", id);
    assert(template.issuerKinds.includes(def.scale));
    assert(s.factions[def.id]!.rep >= template.requiresRep);
    s.pendingContracts.push({ template: template.id, issuer: def.id, near: "territory" });
  }
  contractsDaily2(s, ctx);
  for (const id of def.contractKinds) assert(Object.values(s.contracts).some(c =>
    c.issuer === def.id && c.template === id && c.target.place === port.id && c.status === "offered"), id);
  assert.deepEqual(s.places, owners);
});

test("B 級鰩魚交易需要第三刃聲望 35，鹽鷗聲望不能代替", () => {
  const { s, ctx } = fixture(), model = ctx.world.require("model", "model/thirdblade-skate-iv");
  const maker = ctx.world.require("faction-ops", "faction-ops/third-blade");
  const saltGull = ctx.world.require("faction-ops", "faction-ops/salt-gull-hunters");
  // 既有市場只有 C 級通用篩選器；沿 rep-gate 的固定清單手法隔離交易門檻。
  const original = ctx.world.require("market", "market/war-armory");
  const market: MarketDef = { ...original, lists: [{ kind: "frame", items: [
    { def: model.frame, weight: 1, stockMax: 2, basePrice: 1000 },
  ] }] };
  const tradeCtx = { ...ctx, world: { ...ctx.world,
    get: ((kind, id) => kind === "market" && (id === market.id || id === "market/war-armory") ? market : ctx.world.get(kind, id)) as typeof ctx.world.get,
  } };
  s.ship.pos = placeLoc(s, ctx, market.place);
  s.ledger.balances.cash = 100000;
  assert(marketListings(s, tradeCtx, market).some(l => l.item.def === model.frame));
  const buy = () => cmdTrade(s, tradeCtx, { v: "trade", market: market.id, buy: [model.frame] });
  for (const [thirdBladeRep, saltGullRep] of [[0, 0], [34, 100]]) {
    s.factions[maker.id]!.rep = thirdBladeRep!;
    s.factions[saltGull.id]!.rep = saltGullRep!;
    const before = structuredClone(s);
    assert.deepEqual(buy(), { ok: false, error: "reputation-required" });
    assert.deepEqual(s, before);
  }
  s.factions[maker.id]!.rep = 35;
  s.factions[saltGull.id]!.rep = 0;
  assert.deepEqual(buy(), { ok: true });
  assert(s.inventory.mechs.some(id => s.mechs[id]!.frame === model.frame));
});
