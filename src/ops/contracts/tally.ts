import type { CampaignState, ContractState, OpsCtx } from "../state/types.ts";
import { evalOpsCond, evalOpsNum } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";

export type UnitDiedEvent = { type: string; payload: Record<string, unknown> };
export function tallyHeads(contract: ContractState, unitDiedEvents: readonly UnitDiedEvent[]): number {
  if (contract.settled || !["active", "stage"].includes(contract.status)) return Object.values(contract.heads).reduce((a, b) => a + b, 0);
  // 出戰層傳入這份契約的敵軍死亡事件；頭數以戰役內唯一 unit id 去重。
  const ids = unitDiedEvents.filter(e => e.type === "UnitDied" && typeof e.payload.unit === "string").map(e => e.payload.unit as string).sort();
  for (const id of ids) if (!Object.hasOwn(contract.heads, id)) Object.defineProperty(contract.heads, id, { value: 1, enumerable: true, configurable: true, writable: true });
  return Object.keys(contract.heads).sort().reduce((sum, id) => sum + contract.heads[id]!, 0);
}
export function settleContract(s: CampaignState, ctx: OpsCtx, id: string, outcome: "done" | "failed" | "partial", rewardFactor = 1): void {
  const c = s.contracts[id];
  if (!c || c.settled || !["active", "stage"].includes(c.status)) return;
  const template = ctx.world.require("contract", c.template), scope = { contract: id, faction: c.issuer, node: c.target.node, ...(c.target.rift ? { rift: c.target.rift } : {}) };
  const stage = template.stages?.[c.stageIdx];
  if (outcome === "done" && stage && c.stageIdx + 1 < template.stages!.length) {
    applyOpsEffects(s, ctx, stage.effects ?? [], scope);
    c.stageIdx++; c.status = "stage";
    const days = template.stages![c.stageIdx]?.days;
    if (days !== undefined) c.deadlineDay = s.clock.day + days;
    ctx.emit("ContractStage", { contract: id, stage: c.stageIdx });
    return;
  }
  c.settled = true; c.status = outcome === "failed" ? "failed" : "done";
  const ref = eventRef(ctx.emit(outcome === "failed" ? "ContractFailed" : "ContractDone", { contract: id, partial: outcome === "partial" ? 1 : 0 }));
  if (outcome !== "failed") {
    const heads = Object.keys(c.heads).sort().reduce((sum, unit) => sum + c.heads[unit]!, 0);
    const bonus = (template.pay.bonus ?? []).filter(b => evalOpsCond(s, ctx, b.cond, scope)).reduce((sum, b) => sum + evalOpsNum(s, ctx, b.amount, scope), 0);
    // 半額是 spec 明定的部分成功；預付扣一次，尾款不足不另造負收入。
    const earned = (c.terms.total + c.terms.perHead * heads + bonus) * (outcome === "partial" ? 0.5 : rewardFactor);
    post(s, ctx, { account: "cash", delta: Math.max(0, earned - (c.paidAdvance ? c.terms.advance : 0)), reason: "contract", ref });
    if (stage) applyOpsEffects(s, ctx, stage.effects ?? [], scope);
  }
  applyOpsEffects(s, ctx, outcome === "failed" ? template.onFail : template.onComplete, scope);
}
