import { test } from "node:test";
import assert from "node:assert/strict";
import { eventRef } from "../state/events.ts";
import { checkLedger, post } from "../state/ledger.ts";
import { fixture } from "./test-support.ts";
import { resupplyDaily7 } from "./resupply.ts";

test("停泊時逐台補滿，總價入帳且帳本守恆", () => {
  const { s, ctx } = fixture();
  const mechs = Object.keys(s.mechs).sort().map(id => s.mechs[id]!);
  mechs[0]!.pools["ammo-30"]!.cur = 2;
  mechs[1]!.pools["ammo-30"]!.cur = 5;
  mechs[2]!.pools["ammo-30"]!.cur = 8;
  const cash = s.ledger.balances.cash;
  resupplyDaily7(s, ctx);
  assert.deepEqual(mechs.map(mech => mech.pools["ammo-30"]!.cur), [12, 12, 12]);
  assert.equal(cash - s.ledger.balances.cash, (10 + 7 + 4) * 2);
  assert.deepEqual(s.log.filter(event => event.type === "Resupplied").map(event => event.payload.rounds), [10, 7, 4]);
  assert.deepEqual(checkLedger(s), []);
});

test("現金不足時只補可支付的發數且現金非負", () => {
  const { s, ctx } = fixture();
  const mechs = Object.keys(s.mechs).sort().map(id => s.mechs[id]!);
  for (const mech of mechs) mech.pools["ammo-30"]!.cur = 0;
  const ref = eventRef(ctx.emit("Fixture", { cash: 5 }));
  post(s, ctx, { account: "cash", delta: 5 - s.ledger.balances.cash, reason: "fixture", ref });
  resupplyDaily7(s, ctx);
  assert.deepEqual(mechs.map(mech => mech.pools["ammo-30"]!.cur), [2, 0, 0]);
  assert.equal(s.ledger.balances.cash, 1);
  assert.ok(s.ledger.balances.cash >= 0);
  assert.deepEqual(checkLedger(s), []);
});

test("航行途中不補彈且 state 不變", () => {
  const { s, ctx } = fixture();
  Object.values(s.mechs)[0]!.pools["ammo-30"]!.cur = 0;
  s.ship.route = { to: "node/chittagong", daysLeft: 2 };
  const before = structuredClone(s);
  resupplyDaily7(s, ctx);
  assert.deepEqual(s, before);
});
