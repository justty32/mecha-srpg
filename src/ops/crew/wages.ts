import type { CampaignState, OpsCtx } from "../state/types.ts";
import { post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import { expense, fail, monthDays, mood, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

export function ledgerDaily6(s: CampaignState, ctx: OpsCtx): void {
  const ids = Object.keys(s.roster.employment).sort(), days = monthDays(s, ctx), cfg = rules(ctx);
  const due = ids.reduce((sum, id) => sum + s.roster.employment[id]!.wage / days, 0);
  const paid = Math.min(due, Math.max(0, s.ledger.balances.cash));
  const ratio = due > 0 ? paid / due : 1;
  expense(s, ctx, "cash", paid, "WagePaid", { amount: paid });
  for (const id of ids) {
    const e = s.roster.employment[id]!, owed = e.wage / days * (1 - ratio);
    if (owed > 0) { e.owed += owed; mood(s, id, -1); ctx.emit("WageOwed", { person: id, amount: owed }); }
    else if (e.wage > 0) mood(s, id, 1);
  }
  const rt = peekCrew(s);
  const node = ctx.world.get("node", s.ship.at);
  if (!s.ship.route && node && ["city", "ferry-port", "lunar-base"].includes(node.kind)) expense(s, ctx, "cash", cfg.dockFee, "DockFee", { node: node.id });
  if (s.clock.dom === 1) {
    for (const id of Object.keys(rt?.rentals ?? {}).sort()) expense(s, ctx, "cash", rt!.rentals[id]!, "SoulRent", { person: id });
    if (s.clock.phase === "spring" && s.ledger.balances.debt > 0) {
      const amount = s.ledger.balances.debt * cfg.interestRate;
      const ref = eventRef(ctx.emit("InterestPosted", { amount }));
      post(s, ctx, { account: "debt", delta: amount, reason: "interest", ref });
    }
  }
}
// TODO(2026-10-24 裁示)：活捕無馴化／餵養，待 spec 改寫
// 保留既有支出程式，不由 ledgerDaily6 呼叫。
function retiredFeedExpense(s: CampaignState, ctx: OpsCtx): void {
  const rt = peekCrew(s);
  if (rt?.feedDue) { expense(s, ctx, "stock:feed", rt.feedDue, "FeedConsumed"); rt.feedDue = 0; }
}
export function cmdPay(s: CampaignState, ctx: OpsCtx, cmd: Command<"pay">): CmdResult {
  const e = s.roster.employment[cmd.account];
  const owed = cmd.account === "debt" ? s.ledger.balances.debt : e?.owed;
  if (owed === undefined) return fail("unknown-account");
  if (!Number.isFinite(cmd.amount) || cmd.amount <= 0 || cmd.amount > owed) return fail("invalid-amount");
  if (s.ledger.balances.cash < cmd.amount) return fail("insufficient-cash");
  if (cmd.account === "debt") {
    post(s, ctx, { account: "cash", delta: -cmd.amount, counter: "debt", reason: "debt-payment" });
    post(s, ctx, { account: "debt", delta: -cmd.amount, counter: "cash", reason: "debt-payment" });
  } else { expense(s, ctx, "cash", cmd.amount, "WagePaid", { person: cmd.account, amount: cmd.amount }); e!.owed -= cmd.amount; mood(s, cmd.account, 1); }
  return ok;
}
