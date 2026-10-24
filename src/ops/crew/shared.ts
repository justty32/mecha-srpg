import type { PersonState } from "../../core/types-state.ts";
import type { Account, CampaignState, Employment, OpsCommand, OpsCtx, ServiceDef } from "../state/types.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";

export type CmdResult = { ok: true } | { ok: false; error: string };
export type Command<V extends OpsCommand["v"]> = Extract<OpsCommand, { v: V }>;
export const ok: CmdResult = { ok: true };
export const fail = (error: string): CmdResult => ({ ok: false, error });
export const compareId = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
export type Candidate = { id: string; pool: string; node: string; background: string; culture: string; person: PersonState; fee: number; wage: number; traits: string[] };
// SPEC-GAP：地基缺少這些存檔欄位；只在 crew 定義交集，不改共用 types.ts。
export type CrewRuntime = {
  candidates: Record<string, Candidate>; recruitDays: Record<string, number>; cultures: Record<string, string>;
  companions: Record<string, { by: string; node: string; day: number }>; accompanied: Record<string, number>;
  bonds: Record<string, { person: string; seat: string; awayDays: number }>;
  molting: Record<string, { until: number; to: string }>; rentals: Record<string, number>;
  growth: Record<string, Record<string, number[]>>; perkPoints: Record<string, number>;
};
export type CrewState = CampaignState & { crew?: CrewRuntime };
export function peekCrew(s: CampaignState): CrewRuntime | undefined { return (s as CrewState).crew; }
export function crew(s: CampaignState): CrewRuntime {
  return (s as CrewState).crew ??= { candidates: {}, recruitDays: {}, cultures: {}, companions: {}, accompanied: {}, bonds: {}, molting: {}, rentals: {}, growth: {}, perkPoints: {} };
}
// SPEC-GAP：可調營運數值放 service/crew 的擴充欄位，與既有 WorldDB 載入器相容。
export type CrewRules = ServiceDef & { crew: {
  wageBase: number; leaveChance: number; interestRate: number; dockFee: number; rent: number;
  amortMonths: number; arrearsRepPenalty: number; seizeCreditRatio: number; sanctionFeeMult: number; creditLimit: number; creditRate: number;
  hpRegen: number; medbayMult: number; medicMult: number; soulNeedHours: number; defaultCulture: string;
  shipFuel: number; shipHull: number;
  withering?: string; grudge?: string;
} };
export function rules(ctx: OpsCtx): CrewRules["crew"] { return (ctx.world.require("service", "service/crew") as CrewRules).crew; }
export function monthDays(s: CampaignState, ctx: OpsCtx): number { return ctx.world.require("calendar", s.calendar).daysPerMonth; }
export function mood(s: CampaignState, id: string, delta: number): void {
  const e = s.roster.employment[id]; if (e) e.mood = Math.max(-3, Math.min(3, e.mood + delta));
}
export function expense(s: CampaignState, ctx: OpsCtx, account: Account, amount: number, reason: string, payload: Record<string, string | number> = {}): void {
  if (!amount) return;
  const ref = eventRef(ctx.emit(reason, payload));
  post(s, ctx, { account, delta: -amount, reason, ref });
}
export function detach(s: CampaignState, id: string): void {
  for (const key of Object.keys(s.mechs).sort()) for (const seat of Object.keys(s.mechs[key]!.seats).sort()) {
    if (s.mechs[key]!.seats[seat] === id) s.mechs[key]!.seats[seat] = null;
  }
  const p = s.roster.persons[id]; if (p) delete p.seat;
  const e = s.roster.employment[id]; if (e) delete e.seat;
}
export function employment(s: CampaignState, wage: number, role: Employment["role"] = "pilot"): Employment {
  return { since: s.clock.day, wage, role, owed: 0, mood: 0 };
}
