import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { clock } from "../state/clock.ts";
import { eventRef } from "../state/events.ts";
import { checkLedger, foldBalances, post } from "../state/ledger.ts";
import { cmdTrade } from "../world/market.ts";
import { applyCommand } from "../time/commands.ts";
import { debtMonth, cmdBorrow, cmdPayDebt } from "./debt.ts";
import { ledgerDaily6 } from "./wages.ts";
import { rules } from "./shared.ts";

const { db, world } = loadWorldDirs(["content/base"]);
function fixture() {
  const s = newCampaign(db, world, "start/default", 1), ctx = createOpsCtx(s, db, world);
  s.clock = clock(28, world.require("calendar", s.calendar));
  return { s, ctx };
}
function cash(s: ReturnType<typeof fixture>["s"], amount: number): void {
  const ctx = createOpsCtx(s, db, world), ref = eventRef(ctx.emit("Fixture", { amount }));
  post(s, ctx, { account: "cash", delta: amount - s.ledger.balances.cash, reason: "fixture", ref });
}

test("debt：最低額取利息與本金攤還較高者；有現金自動扣繳並守恆", () => {
  const { s, ctx } = fixture(), principal = s.ledger.balances.debt;
  cash(s, 5000); debtMonth(s, ctx);
  const due = Math.max(principal * rules(ctx).interestRate, principal / rules(ctx).amortMonths);
  assert.equal(s.debtState!.due, due); assert.equal(s.debtState!.paid, due);
  assert.equal(s.ledger.balances.debt, principal + principal * rules(ctx).interestRate - due);
  assert.equal(s.ledger.balances.cash, 5000 - due);
  assert.equal(s.ledger.entries.filter(e => e.reason === "debt-installment").length, 2);
  assert.deepEqual(s.ledger.balances, foldBalances(s.ledger.entries)); assert.deepEqual(checkLedger(s), []);
});

test("debt：現金不足欠繳降聲望；補足當期額度使欠繳退一級；提前還本降低下期最低額", () => {
  const { s, ctx } = fixture(), faction = s.factions[world.require("faction-ops", "faction-ops/selene-whitegloves").id]!;
  cash(s, 0); debtMonth(s, ctx);
  const firstDue = s.debtState!.due, rep = faction.rep;
  s.clock = clock(56, world.require("calendar", s.calendar)); debtMonth(s, ctx);
  assert.equal(s.debtState!.arrears, 1); assert.equal(faction.rep, rep - 10);
  assert.equal(s.log.at(-2)?.type === "DebtDemand" || s.log.some(e => e.type === "DebtDemand"), true);
  cash(s, 10000);
  assert.equal(cmdPayDebt(s, ctx, { v: "pay", account: "debt", amount: s.debtState!.due + 3000 }).ok, true);
  assert.equal(s.debtState!.arrears, 0); assert.equal(s.log.some(e => e.type === "DebtCured"), true);
  const principal = s.ledger.balances.debt;
  s.clock = clock(84, world.require("calendar", s.calendar)); debtMonth(s, ctx);
  assert.equal(s.debtState!.due, Math.max(principal * rules(ctx).interestRate, principal / rules(ctx).amortMonths));
  assert.ok(s.debtState!.due < firstDue);
  assert.deepEqual(s.ledger.balances, foldBalances(s.ledger.entries)); assert.deepEqual(checkLedger(s), []);
});

test("debt：二級扣押最高價可用機甲，市值六成抵債並清空席位", () => {
  const { s, ctx } = fixture();
  s.debtState = { arrears: 1, due: 100, paid: 0, seized: [] };
  cash(s, 0);
  const before = s.ledger.balances.debt;
  debtMonth(s, ctx);
  const event = s.log.find(e => e.type === "MechSeized")!;
  assert(event); assert.equal(s.debtState.arrears, 2);
  const interest = s.ledger.entries.filter(e => e.reason === "interest").at(-1)!.delta;
  assert.equal(before + interest - s.ledger.balances.debt, event.payload.credit);
  assert.equal(event.payload.credit, Number(event.payload.value) * rules(ctx).seizeCreditRatio);
  assert.ok(!s.inventory.mechs.includes(String(event.payload.mech)) && !s.mechs[String(event.payload.mech)]);
  assert.ok(s.debtState.seized.includes(String(event.payload.mech)));
  assert.deepEqual(checkLedger(s), []);
});

test("debt：扣押避開待出戰與契約借用機甲", () => {
  const { s, ctx } = fixture(), [loan, pending, available] = s.inventory.mechs;
  s.contracts.fixture = { id: "fixture", template: "fixture", issuer: "fixture", target: { node: s.ship.at }, status: "active", stageIdx: 0,
    offeredDay: 0, deadlineDay: 100, loans: [loan!] } as typeof s.contracts[string];
  s.pendingBattle = { id: "fixture", day: s.clock.day, node: s.ship.at, trigger: "ambush", units: [{ mech: pending!, seats: {}, controlMode: "none" }],
    supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] };
  s.debtState = { arrears: 1, due: 100, paid: 0, seized: [] }; cash(s, 0);
  debtMonth(s, ctx);
  assert.deepEqual(s.debtState.seized, [available]);
  assert.ok(s.mechs[loan!] && s.mechs[pending!]);
  assert.deepEqual(s.contracts.fixture!.loans, [loan]);
  assert.equal(s.pendingBattle.units[0]!.mech, pending);
});

test("debt：三級拒售、港費加倍，補繳後解除；四級通牒與次期扣船", () => {
  const { s, ctx } = fixture();
  s.ship.at = world.require("node", "node/singapore").id;
  s.debtState = { arrears: 3, due: 100, paid: 0, seized: [] };
  const market = world.require("market", "market/singapore").id;
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market, buy: ["stock:fuel"] }), { ok: false, error: "selene-embargo" });
  s.clock = clock(1, world.require("calendar", s.calendar));
  ledgerDaily6(s, ctx);
  assert.equal(s.ledger.entries.filter(e => e.reason === "DockFee").at(-1)!.delta, -rules(ctx).dockFee * 2);
  cash(s, 1000); assert.equal(cmdPayDebt(s, ctx, { v: "pay", account: "debt", amount: s.debtState.due }).ok, true);
  assert.equal(s.debtState.arrears, 2);
  assert.notDeepEqual(cmdTrade(s, ctx, { v: "trade", market, buy: ["stock:fuel"] }), { ok: false, error: "selene-embargo" });
  s.debtState = { arrears: 3, due: 100, paid: 0, seized: [] };
  debtMonth(s, ctx); assert.equal(s.debtState.arrears, 4);
  assert.ok(s.log.some(e => e.type === "DebtUltimatum"));
  cash(s, 0); s.debtState.paid = 0;
  debtMonth(s, ctx); assert.ok(s.log.some(e => e.type === "CampaignEnd" && e.payload.reason === "ship-seized"));
});

test("debt：還清開信貸，借款受額度約束", () => {
  const { s, ctx } = fixture();
  cash(s, 30000);
  assert.equal(cmdPayDebt(s, ctx, { v: "pay", account: "debt", amount: s.ledger.balances.debt }).ok, true);
  assert.equal(s.debtState!.credit!.limit, rules(ctx).creditLimit);
  assert.ok(s.log.some(e => e.type === "DebtCleared"));
  assert.deepEqual(cmdBorrow(s, ctx, { v: "borrow", amount: 6000 }), { ok: true });
  assert.equal(s.ledger.balances.debt, 6000);
  const before = structuredClone(s);
  assert.deepEqual(cmdBorrow(s, ctx, { v: "borrow", amount: 1 }), { ok: false, error: "credit-limit" });
  assert.deepEqual(s, before); assert.deepEqual(checkLedger(s), []);
  assert.deepEqual(applyCommand(s, db, world, { v: "borrow", amount: 1 }).result, { ok: false, error: "credit-limit" });
});
