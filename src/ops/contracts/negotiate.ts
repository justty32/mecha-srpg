import { cloneRng, d100 } from "../../core/rng.ts";
import type { RngState } from "../../core/types-state.ts";
import type { Ask, ContractState, OpsCtx, WorldActionDef } from "../state/types.ts";

export type NegotiationPolicy = { annoyancePenalty: number; annoyanceMax: number; totalRaise: number; advanceRaise: number; perHeadShare: number; withdrawRep: number };
export type NegotiationState = { contract: ContractState; issuerRep: number; advanceMax: number; annoyanceMax: number; policy: NegotiationPolicy };
export type NegotiationResult = { state: NegotiationState; rng: RngState; success: boolean; withdrawn: boolean };
// SPEC-GAP：談判係數與預設厭煩上限由資料牌的 rules 提供，不在規則內寫平衡常數。
export function negotiationPolicy(ctx: OpsCtx): NegotiationPolicy {
  return (ctx.world.require("action", "action/ops-world") as WorldActionDef & { rules: { negotiation: NegotiationPolicy } }).rules.negotiation;
}
export function negotiate(state: NegotiationState, ask: Ask, rng: RngState): NegotiationResult {
  const next = structuredClone(state), nextRng = cloneRng(rng), c = next.contract, cfg = next.policy;
  if (c.status !== "offered") return { state: next, rng: nextRng, success: false, withdrawn: false };
  c.annoyance++;
  const success = d100(nextRng) < next.issuerRep - c.annoyance * cfg.annoyancePenalty;
  if (success) {
    if (ask === "total") c.terms.total *= 1 + cfg.totalRaise;
    else if (ask === "advance") c.terms.advance = Math.min(c.terms.total * next.advanceMax, c.terms.advance + c.terms.total * cfg.advanceRaise);
    else c.terms.perHead = c.terms.perHead > 0 ? c.terms.perHead * (1 + cfg.totalRaise) : c.terms.total * cfg.perHeadShare;
  } else c.annoyance++;
  const withdrawn = c.annoyance > next.annoyanceMax;
  if (withdrawn) { c.status = "cancelled"; c.settled = true; next.issuerRep = Math.max(-100, next.issuerRep - cfg.withdrawRep); }
  return { state: next, rng: nextRng, success, withdrawn };
}
