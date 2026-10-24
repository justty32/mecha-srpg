import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLedger, foldBalances, post } from "./ledger.ts";
import { emit, eventRef } from "./events.ts";
import type { CampaignState } from "./types.ts";

function fixture() {
  const s: Pick<CampaignState, "clock" | "ledger" | "log"> = { clock: { day: 0, month: 0, dom: 1, phase: "spring" }, ledger: { entries: [], balances: { cash: 0, debt: 0 } }, log: [] };
  const ctx = { emit: (type: string, payload?: Record<string, unknown>) => emit(s, type, payload) };
  const ref = eventRef(ctx.emit("CampaignStarted"));
  return { s, ctx, ref };
}
test("ledger：折疊相等，外源 ref 必須存在", () => {
  const { s, ctx, ref } = fixture();
  post(s, ctx, { account: "cash", delta: 100, reason: "opening", ref });
  post(s, ctx, { account: "stock:flesh", delta: 3, reason: "opening", ref });
  assert.deepEqual(s.ledger.balances, foldBalances(s.ledger.entries));
  assert.deepEqual(checkLedger(s), []);
  assert.throws(() => post(s, ctx, { account: "cash", delta: 1, reason: "missing" }));
  s.ledger.entries[0]!.ref = "event-999";
  assert.match(checkLedger(s).join(), /missing source/);
});
test("ledger：負存量拒絕且不記帳不發事件", () => {
  const { s, ctx, ref } = fixture(), before = structuredClone(s);
  assert.equal(post(s, ctx, { account: "stock:flesh", delta: -1, reason: "devour", ref }), false);
  assert.deepEqual(s, before);
});
test("ledger：買賣兩筆互填 counter", () => {
  const { s, ctx } = fixture();
  post(s, ctx, { account: "cash", delta: -10, counter: "stock:flesh", reason: "buy" });
  post(s, ctx, { account: "stock:flesh", delta: 2, counter: "cash", reason: "buy" });
  post(s, ctx, { account: "cash", delta: 5, counter: "stock:flesh", reason: "sell" });
  post(s, ctx, { account: "stock:flesh", delta: -1, counter: "cash", reason: "sell" });
  assert.deepEqual(s.ledger.entries.map(e => e.counter), ["stock:flesh", "cash", "stock:flesh", "cash"]);
  assert.deepEqual(s.ledger.balances, { cash: -5, debt: 0, "stock:flesh": 1 });
  assert.deepEqual(checkLedger(s), []);
});
test("ledger：竄改 balances 被抓", () => {
  const { s } = fixture(); s.ledger.balances.cash = 999;
  assert.match(checkLedger(s).join(), /balance mismatch: cash/);
});
