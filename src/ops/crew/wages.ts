import { isDocked } from "../world/move.ts";
import { placeAt } from "../war/loc.ts";
import { placeDef } from "../world/places.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { expense, fail, monthDays, mood, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";
import { cmdPayDebt, debtMonth } from "./debt.ts";

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
  const node = placeDef(s, ctx, (placeAt(s, ctx, s.ship.pos) ?? ""));
  if (isDocked(s, ctx) && node && ["city", "port", "lunar-base"].includes(node.kind)) expense(s, ctx, "cash", cfg.dockFee * (s.debtState?.arrears && s.debtState.arrears >= 3 ? cfg.sanctionFeeMult : 1), "DockFee", { node: node.id });
  if (s.clock.dom === 1) {
    for (const id of Object.keys(rt?.rentals ?? {}).sort()) expense(s, ctx, "cash", rt!.rentals[id]!, "SoulRent", { person: id });
    if (s.clock.phase === "spring") debtMonth(s, ctx);
  }
}
export function cmdPay(s: CampaignState, ctx: OpsCtx, cmd: Command<"pay">): CmdResult {
  const e = s.roster.employment[cmd.account];
  const owed = cmd.account === "debt" ? s.ledger.balances.debt : e?.owed;
  if (owed === undefined) return fail("unknown-account");
  if (!Number.isFinite(cmd.amount) || cmd.amount <= 0 || cmd.amount > owed) return fail("invalid-amount");
  if (s.ledger.balances.cash < cmd.amount) return fail("insufficient-cash");
  if (cmd.account === "debt") return cmdPayDebt(s, ctx, cmd);
  else { expense(s, ctx, "cash", cmd.amount, "WagePaid", { person: cmd.account, amount: cmd.amount }); e!.owed -= cmd.amount; mood(s, cmd.account, 1); }
  return ok;
}
