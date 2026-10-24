import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../core/rng.ts";
import { checkLedger, post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import { fixture, day, addRift } from "../world/test-support.ts";
import { actionsDaily2 } from "../world/actions.ts";
import { offerContract, contractsDaily2, contractsDaily7, cmdAccept, cmdDrop } from "./lifecycle.ts";
import { negotiate, negotiationPolicy } from "./negotiate.ts";
import { tallyHeads, settleContract } from "./tally.ts";

test("contracts：offered 快照獨立、並行接受、到期與取消追回預付", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx, { phase: "anchored" });
  const c = offerContract(s, ctx, "contract/clear", "faction-ops/migrant-crew", { place: r.site, rift: r.id })!;
  const snapshot = structuredClone(c.target.snapshot); r.width = "B"; r.anchorAge = 9; r.phase = "unanchored";
  assert.deepEqual(c.target.snapshot, snapshot);
  const second = offerContract(s, ctx, "contract/seal", "faction-ops/migrant-crew", { place: r.site, rift: r.id })!;
  c.terms.advance = 200;
  assert.equal(cmdAccept(s, ctx, { v: "accept", contract: c.id }).ok, true); assert.equal(cmdAccept(s, ctx, { v: "accept", contract: second.id }).ok, true);
  post(s, ctx, { account: "cash", delta: -s.ledger.balances.cash + 50, reason: "test-spend", ref: eventRef(ctx.emit("OpsEffectApplied")) });
  assert.equal(cmdDrop(s, ctx, { v: "drop", contract: c.id }).ok, true); assert.equal(s.ledger.balances.cash, 0); assert.equal(s.ledger.balances.debt, 24150);
  const before = structuredClone(s); assert.equal(cmdDrop(s, ctx, { v: "drop", contract: c.id }).ok, false); assert.deepEqual(s, before);
  day(s, ctx, second.deadlineDay + 1); contractsDaily7(s, ctx); assert.equal(second.status, "failed"); assert.deepEqual(checkLedger(s), []);
  const f = fixture(); addRift(f.s, f.ctx); actionsDaily2(f.s, f.ctx); contractsDaily2(f.s, f.ctx);
  assert.ok(Object.keys(f.s.contracts).length > 0); assert.equal(f.s.pendingContracts.length, 0);
});
test("contracts：談判成功／失敗、厭煩撤回與純函式 RNG", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx), c = offerContract(s, ctx, "contract/clear", "faction-ops/migrant-crew", { place: r.site, rift: r.id })!;
  const policy = negotiationPolicy(ctx), rng = createRng(7), before = structuredClone({ c, rng });
  const state = { contract: c, issuerRep: 100, advanceMax: 0.3, annoyanceMax: 3, policy };
  const success = negotiate(state, "total", rng); assert.equal(success.success, true); assert.equal(success.state.contract.annoyance, 1); assert.equal(success.state.contract.terms.total, c.terms.total * 1.1);
  const failure = negotiate({ ...state, issuerRep: -100 }, "advance", rng); assert.equal(failure.success, false); assert.equal(failure.state.contract.annoyance, 2);
  const withdrawn = negotiate(failure.state, "perHead", failure.rng); assert.equal(withdrawn.withdrawn, true); assert.equal(withdrawn.state.contract.status, "cancelled");
  assert.deepEqual({ c, rng }, before);
});
test("contracts：同一單位一頭、部分成功半額、付款與 rep 只結一次", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx), c = offerContract(s, ctx, "contract/clear", "faction-ops/migrant-crew", { place: r.site, rift: r.id })!;
  cmdAccept(s, ctx, { v: "accept", contract: c.id }); c.terms.perHead = 10;
  const dead = { type: "UnitDied", payload: { unit: "enemy-1" } };
  assert.equal(tallyHeads(c, [dead, dead, { type: "Captured", payload: { unit: "enemy-2" } }]), 1);
  assert.equal(tallyHeads(c, [dead, { type: "UnitDied", payload: { unit: "enemy-2" } }]), 2);
  settleContract(s, ctx, c.id, "partial"); assert.equal(s.ledger.balances.cash, 1200 + (c.terms.total + 20) / 2); assert.equal(s.factions[c.issuer]!.rep, 5);
  const before = structuredClone(s); settleContract(s, ctx, c.id, "done"); assert.deepEqual(s, before); assert.deepEqual(checkLedger(s), []);
});
