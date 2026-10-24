import type { Account, CampaignState, LedgerEntry, OpsCtx } from "./types.ts";
import { eventRef } from "./events.ts";

export type PostEntry = Omit<LedgerEntry, "seq" | "day">;
export function isAccount(value: unknown): value is Account { return typeof value === "string" && /^(cash|debt|stock:[A-Za-z0-9][A-Za-z0-9._-]*)$/.test(value); }
export function foldBalances(entries: readonly LedgerEntry[]): Record<Account, number> {
  const balances: Record<Account, number> = { cash: 0, debt: 0 };
  for (const e of entries) balances[e.account] = (balances[e.account] ?? 0) + e.delta;
  return balances;
}
export function post(s: Pick<CampaignState, "ledger" | "clock" | "log">, ctx: Pick<OpsCtx, "emit">, entry: PostEntry): boolean {
  if (!isAccount(entry.account) || entry.counter !== undefined && !isAccount(entry.counter) || !Number.isFinite(entry.delta) || !entry.reason.trim()) throw new Error("非法帳目");
  if (!entry.counter && !s.log.some(e => eventRef(e) === entry.ref)) throw new Error("外源帳缺少 CampaignEvent ref");
  const balance = (s.ledger.balances[entry.account] ?? 0) + entry.delta;
  if (!Number.isFinite(balance)) throw new Error("帳目溢位");
  if (entry.account.startsWith("stock:") && balance < 0) return false;
  const e: LedgerEntry = { ...entry, seq: s.ledger.entries.length, day: s.clock.day };
  s.ledger.entries.push(e);
  s.ledger.balances[e.account] = balance;
  ctx.emit("Posted", { seq: e.seq, account: e.account, delta: e.delta, ...(e.ref ? { ref: e.ref } : {}) });
  return true;
}
export function checkLedger(s: Pick<CampaignState, "ledger" | "log">): string[] {
  const errors: string[] = [], folded = foldBalances(s.ledger.entries);
  for (const key of [...new Set([...Object.keys(folded), ...Object.keys(s.ledger.balances)])].sort()) {
    const account = key as Account, value = s.ledger.balances[account];
    if (!isAccount(account) || !Number.isFinite(value) || value !== folded[account]) errors.push(`balance mismatch: ${account}`);
    if (account.startsWith("stock:") && value !== undefined && value < 0) errors.push(`negative stock: ${account}`);
  }
  const sources = new Set(s.log.map(eventRef));
  const running: Partial<Record<Account, number>> = {};
  for (const e of s.ledger.entries) {
    if (!e.counter && (!e.ref || !sources.has(e.ref))) errors.push(`missing source: ${e.seq}`);
    if (!isAccount(e.account) || !Number.isFinite(e.delta) || e.counter !== undefined && !isAccount(e.counter)) errors.push(`invalid entry: ${e.seq}`);
    running[e.account] = (running[e.account] ?? 0) + e.delta;
    if (e.account.startsWith("stock:") && running[e.account]! < 0) errors.push(`negative stock entry: ${e.seq}`);
  }
  return errors;
}
