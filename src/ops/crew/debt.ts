import type { CampaignState, OpsCtx } from "../state/types.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { detach, fail, ok, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

const selene = "faction-ops/selene-whitegloves";
type DebtState = NonNullable<CampaignState["debtState"]>;

function state(s: CampaignState): DebtState {
  return s.debtState ??= { arrears: 0, due: 0, paid: 0, seized: [] };
}

function cleared(s: CampaignState, ctx: OpsCtx): void {
  if (s.ledger.balances.debt > 0) return;
  const debt = state(s);
  if (debt.credit) return;
  debt.credit = { limit: rules(ctx).creditLimit };
  ctx.emit("DebtCleared", { limit: debt.credit.limit });
}

function payment(s: CampaignState, ctx: OpsCtx, amount: number, reason: string): void {
  post(s, ctx, { account: "cash", delta: -amount, counter: "debt", reason });
  post(s, ctx, { account: "debt", delta: -amount, counter: "cash", reason });
  const debt = state(s);
  const before = debt.paid;
  debt.paid += Math.min(amount, Math.max(0, debt.due - debt.paid));
  if (debt.arrears > 0 && before < debt.due && debt.paid >= debt.due) {
    debt.arrears--;
    ctx.emit("DebtCured", { arrears: debt.arrears });
    if (debt.arrears < 3) ctx.emit("SeleneEmbargo", { active: 0 });
  }
  cleared(s, ctx);
}

function marketValue(s: CampaignState, ctx: OpsCtx, mechId: string): number {
  const frame = ctx.db.require("frame", s.mechs[mechId]!.frame);
  const grades = ["D", "C", "B", "A", "S", "SS", "SSS"];
  return Math.max(0, ...ctx.world.all("market").flatMap(m => m.lists.filter(l => l.kind === "frame").flatMap(l => [
    ...l.items.filter(i => ctx.db.get("frame", i.def)?.id === frame.id).map(i => i.basePrice ?? 0),
    ...(l.filters ?? []).filter(i => grades.indexOf(frame.grade) <= grades.indexOf(i.filter.tierMax)).map(i => i.basePrice ?? 0),
  ])));
}

function seize(s: CampaignState, ctx: OpsCtx): void {
  const reserved = new Set([
    ...(s.pendingBattle?.units.map(u => u.mech) ?? []),
    ...(s.pendingBattle?.injected.filter(e => e.target === "mech").map(e => e.id) ?? []),
    ...Object.values(s.contracts).flatMap(c => c.loans ?? []),
    ...s.restraint.slots.filter((id): id is string => id !== null),
    ...Object.keys(s.restraint.beasts),
    ...s.restraint.carcasses.map(c => c.id),
  ]);
  const choice = s.inventory.mechs.filter(id => s.mechs[id] && !reserved.has(id))
    .map(id => ({ id, value: marketValue(s, ctx, id) }))
    .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id))[0];
  if (!choice) return;
  const mech = s.mechs[choice.id]!;
  for (const person of Object.values(mech.seats)) if (person) detach(s, person);
  const credit = Math.min(s.ledger.balances.debt, choice.value * rules(ctx).seizeCreditRatio);
  const ref = eventRef(ctx.emit("MechSeized", { mech: choice.id, value: choice.value, credit }));
  if (credit) post(s, ctx, { account: "debt", delta: -credit, reason: "debt-seizure", ref });
  s.inventory.mechs = s.inventory.mechs.filter(id => id !== choice.id);
  s.hangar.bays = s.hangar.bays.map(id => id === choice.id ? null : id);
  s.hangar.dormant = s.hangar.dormant.filter(id => id !== choice.id);
  for (const room of Object.values(s.ship.rooms)) room.items = room.items.filter(id => id !== choice.id);
  s.jobs = s.jobs.filter(job => job.target !== choice.id);
  delete s.roster.names[choice.id];
  delete s.mechs[choice.id];
  state(s).seized.push(choice.id);
  cleared(s, ctx);
}

export function debtMonth(s: CampaignState, ctx: OpsCtx): void {
  if (s.log.some(e => e.type === "CampaignEnd" && e.payload.reason === "ship-seized")) return;
  const debt = state(s), cfg = rules(ctx);
  if (debt.due > 0 && debt.paid < debt.due) {
    debt.arrears++;
    const faction = s.factions[ctx.world.require("faction-ops", selene).id];
    if (faction) faction.rep = Math.max(-100, faction.rep - cfg.arrearsRepPenalty);
    ctx.emit("DebtArrears", { arrears: debt.arrears, due: debt.due, paid: debt.paid });
    if (debt.arrears === 1) { ctx.emit("DebtDemand", { arrears: 1 }); s.pendingEvents.push(ctx.world.require("event", "event/debt-demand").id); }
    if (debt.arrears === 2) { ctx.emit("DebtCollection", { arrears: 2 }); s.pendingEvents.push(ctx.world.require("event", "event/debt-collection").id); seize(s, ctx); }
    if (debt.arrears === 3) ctx.emit("SeleneEmbargo", { active: 1 });
    if (debt.arrears === 4) { ctx.emit("DebtUltimatum", { arrears: 4 }); s.pendingEvents.push(ctx.world.require("event", "event/debt-ultimatum").id); }
    if (debt.arrears >= 5) ctx.emit("CampaignEnd", { reason: "ship-seized" });
  } else if (debt.due > 0) {
    debt.arrears = 0;
  }
  const principal = s.ledger.balances.debt;
  if (principal <= 0) { debt.due = 0; debt.paid = 0; cleared(s, ctx); return; }
  const interest = principal * (debt.credit ? cfg.creditRate : cfg.interestRate);
  const ref = eventRef(ctx.emit("InterestPosted", { amount: interest }));
  post(s, ctx, { account: "debt", delta: interest, reason: "interest", ref });
  debt.due = Math.max(interest, principal / cfg.amortMonths);
  debt.paid = 0;
  if (s.ledger.balances.cash >= debt.due) payment(s, ctx, debt.due, "debt-installment");
}

export function cmdPayDebt(s: CampaignState, ctx: OpsCtx, cmd: Command<"pay">): CmdResult {
  if (!Number.isFinite(cmd.amount) || cmd.amount <= 0 || cmd.amount > s.ledger.balances.debt) return fail("invalid-amount");
  if (s.ledger.balances.cash < cmd.amount) return fail("insufficient-cash");
  payment(s, ctx, cmd.amount, "debt-payment");
  return ok;
}

export function cmdBorrow(s: CampaignState, ctx: OpsCtx, cmd: Command<"borrow">): CmdResult {
  const credit = s.debtState?.credit;
  if (!credit) return fail("credit-locked");
  if (!Number.isFinite(cmd.amount) || cmd.amount <= 0) return fail("invalid-amount");
  if (cmd.amount > credit.limit - s.ledger.balances.debt) return fail("credit-limit");
  post(s, ctx, { account: "cash", delta: cmd.amount, counter: "debt", reason: "credit-borrow" });
  post(s, ctx, { account: "debt", delta: cmd.amount, counter: "cash", reason: "credit-borrow" });
  ctx.emit("DebtBorrowed", { amount: cmd.amount });
  return ok;
}
