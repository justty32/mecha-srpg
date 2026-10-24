import { placeLoc } from "../war/loc.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLedger } from "../state/ledger.ts";
import { cmdTrade, marketPrice, marketsDaily7 } from "./market.ts";
import { fixture, day } from "./test-support.ts";
test("market：基價乘狀態、聲望及節點局勢；弦月固定 seed 刷新", () => {
  const { s, ctx } = fixture(), market = ctx.world.require("market", "market/dhaka"), item = market.lists[0]!.items[0]!;
  s.factions[ctx.world.require("faction-ops", "faction-ops/migrant-crew").id]!.rep = 50;
  s.places[market.place]!.flags.push("besieged"); assert.equal(marketPrice(s, ctx, market, item, 0.5), 300 * 0.5 * 0.9 * 1.5);
  const a = fixture(), b = fixture();
  for (const f of [a, b]) { day(f.s, f.ctx, 6); marketsDaily7(f.s, f.ctx); }
  assert.deepEqual(a.s, b.s); const before = structuredClone(a.s); marketsDaily7(a.s, a.ctx); assert.deepEqual(a.s, before);
});
test("market：每次買賣兩筆帳、批次拒絕原子性與帳本守恆", () => {
  const { s, ctx } = fixture(); const count = s.ledger.entries.length;
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: "market/dhaka", buy: ["stock:fuel"] }), { ok: true });
  assert.equal(s.ledger.entries.length, count + 2); assert.equal(s.ledger.balances["stock:fuel"], 41);
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: "market/dhaka", sell: ["stock:fuel"] }), { ok: true });
  assert.equal(s.ledger.entries.length, count + 4); assert.equal(s.ledger.balances.cash, 1200); assert.deepEqual(checkLedger(s), []);
  const before = structuredClone(s); assert.equal(cmdTrade(s, ctx, { v: "trade", market: "market/dhaka", buy: ["stock:fuel", "missing"] }).ok, false); assert.deepEqual(s, before);
});

import { instantiateMech } from "../content/instantiate.ts";
import type { MarketState } from "./market.ts";
import { leakModel } from "../war/rnd.ts";
import { factionId, relationKey } from "../war/relations.ts";
import { marketListings } from "./market.ts";
test("market：篩選器排除未開放機型，流出後刷新可售且不改內容", () => {
  const { s, ctx } = fixture(), market = ctx.world.require("market", "market/war-armory"), model = ctx.world.require("model", "model/union-at12");
  marketsDaily7(s, ctx);
  assert.equal((s as MarketState).markets![market.id]!.stock[model.frame], undefined);
  leakModel(s, ctx, model.id);
  delete (s as MarketState).markets![market.id]; marketsDaily7(s, ctx);
  assert.equal((s as MarketState).markets![market.id]!.stock[model.frame], 2);
  assert.ok((s as MarketState).markets![market.id]!.dynamic?.some(l => l.item.model === model.id));
  assert.ok(marketListings(s, ctx, market).some(l => l.item.model === model.id));
  assert.equal(model.exportPolicy, "restricted"); assert.equal(model.generic, false);
  for (const tier of ["SS", "SSS"] as const) {
    const world = { ...ctx.world, all: ((kind: Parameters<typeof ctx.world.all>[0]) => kind === "model" ? [{ ...model, tier, generic: true }] : ctx.world.all(kind)) as typeof ctx.world.all };
    const graded = { ...market, id: "test-market-grade", lists: [{ kind: "frame" as const, items: [], filters: [{ filter: { tierMax: "S" as const }, weight: 1, stockMax: 1, basePrice: 1000 }] }] };
    assert.equal(marketListings(s, { ...ctx, world }, graded).length, 0);
    const permitted = { ...graded, lists: [{ ...graded.lists[0]!, filters: [{ ...graded.lists[0]!.filters[0]!, filter: { tierMax: tier } }] }] };
    assert.equal(marketListings(s, { ...ctx, world }, permitted).length, 1);
  }
});
test("market：新型上市一潮月內乘 1.5，之後回到基價", () => {
  const { s, ctx } = fixture(), model = ctx.world.require("model", "model/bulwark-i");
  s.ship.pos = placeLoc(s, ctx, ctx.world.require("market", "market/war-armory").place);
  s.models![model.id] = { def: model.id, by: "generic", releasedDay: 1 };
  day(s, ctx, 1); s.ledger.balances.cash = 5000;
  const before = s.ledger.balances.cash;
  assert.equal(cmdTrade(s, ctx, { v: "trade", market: "market/war-armory", buy: [model.frame] }).ok, true);
  assert.equal(before - s.ledger.balances.cash, 1500);
  day(s, ctx, 29); const after = s.ledger.balances.cash;
  assert.equal(cmdTrade(s, ctx, { v: "trade", market: "market/war-armory", buy: [model.frame] }).ok, true);
  assert.equal(after - s.ledger.balances.cash, 1000);
});
test("market：restricted 機甲轉賣成功才流出，maker rep 扣 15，拒絕交易保持原子性", () => {
  for (const latest of [false, true]) {
  const { s, ctx } = fixture(), model = ctx.world.require("model", "model/union-fr7"), newer = ctx.world.require("model", "model/union-fr8"), id = "resale-test";
  if (latest) s.models![newer.id] = { def: newer.id, releasedDay: 1, by: model.maker };
  s.ship.pos = placeLoc(s, ctx, ctx.world.require("market", "market/war-armory").place);
  s.mechs[id] = instantiateMech(ctx.db, id, model.frame); s.inventory.mechs.push(id); s.hangar.bays.push(id);
  const maker = factionId(s, ctx, model.maker)!, rep = s.factions[maker]!.rep, before = structuredClone(s);
  assert.equal(cmdTrade(s, ctx, { v: "trade", market: "market/war-armory", sell: [id], buy: ["missing"] }).ok, false);
  assert.deepEqual(s, before);
  assert.equal(cmdTrade(s, ctx, { v: "trade", market: "market/war-armory", sell: [id] }).ok, true);
  assert.equal(s.factions[maker]!.rep, rep - 15); assert.equal(s.mechs[id], undefined);
  const leaked = s.log.filter(e => e.type === "TechLeaked");
  assert.equal(leaked.length, 1); assert.equal(leaked[0]!.payload.model, latest ? newer.id : model.id);
  assert.deepEqual(checkLedger(s), []);
  }
});
test("market：護航補貨並解除加價、scarcity 一潮月、封港停止交易刷新", () => {
  const { s, ctx } = fixture(), market = ctx.world.require("market", "market/dhaka"), node = s.places[market.place]!;
  marketsDaily7(s, ctx); const stock = (s as MarketState).markets![market.id]!.stock;
  stock["stock:fuel"] = 0; node.flags.push("war-supplied", "besieged"); marketsDaily7(s, ctx);
  assert.equal((s as MarketState).markets![market.id]!.stock["stock:fuel"], 120);
  assert.equal(node.flags.includes("besieged"), false);
  node.flags.push("scarcity"); marketsDaily7(s, ctx);
  assert.equal((s as MarketState).markets![market.id]!.stock["stock:fuel"], 108);
  day(s, ctx, 28); marketsDaily7(s, ctx); assert.equal(node.flags.includes("scarcity"), false);
  node.flags.push("blockaded"); const before = structuredClone(s);
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: "market/dhaka", buy: ["stock:fuel"] }), { ok: false, error: "blockaded" });
  assert.deepEqual(s, before); day(s, ctx, 34);
  const old = structuredClone((s as MarketState).markets![market.id]); marketsDaily7(s, ctx);
  assert.deepEqual((s as MarketState).markets![market.id], old);
  assert.equal(marketPrice(s, ctx, market, market.lists[0]!.items[0]!), Infinity);
});
test("market：trade 互列夥伴已釋出可售機型並折價，restricted 不因條約外流", () => {
  const { s, ctx } = fixture(), market = ctx.world.require("market", "market/war-armory"), model = ctx.world.require("model", "model/union-at12");
  const maker = factionId(s, ctx, model.maker)!, owner = Object.keys(s.factions).find(id => id !== maker && s.factions[id]!.forces)!;
  s.places[market.place]!.ownerOverride = ctx.world.require("faction-ops", owner).faction;
  s.relations![relationKey(owner, maker)] = { a: owner, b: maker, value: 0, baseline: 0, state: "neutral", since: 0, weariness: 0, grievances: [],
    treaties: [{ def: ctx.world.require("treaty", "treaty/trade").id, signedDay: 0, endDay: 168 }] };
  marketsDaily7(s, ctx); assert.equal((s as MarketState).markets![market.id]!.stock[model.frame], undefined);
  leakModel(s, ctx, model.id); delete (s as MarketState).markets![market.id]; marketsDaily7(s, ctx);
  s.ship.pos = placeLoc(s, ctx, market.place); s.ledger.balances.cash = 5000; s.factions[owner]!.rep = 0;
  assert.equal(cmdTrade(s, ctx, { v: "trade", market: market.id, buy: [model.frame] }).ok, true);
  assert.equal(s.ledger.balances.cash, 4100);
});
