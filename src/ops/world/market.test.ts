import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLedger } from "../state/ledger.ts";
import { cmdTrade, marketPrice, marketsDaily7 } from "./market.ts";
import { fixture, day } from "./test-support.ts";
test("market：基價乘狀態、聲望及節點局勢；弦月固定 seed 刷新", () => {
  const { s, ctx } = fixture(), market = ctx.world.require("market", "market/dhaka"), item = market.lists[0]!.items[0]!;
  s.factions[ctx.world.require("faction-ops", "faction-ops/migrant-crew").id]!.rep = 50;
  s.nodes[market.node]!.flags.push("besieged"); assert.equal(marketPrice(s, ctx, market, item, 0.5), 300 * 0.5 * 0.9 * 1.5);
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
