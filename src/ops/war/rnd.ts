import type { Id } from "../../core/ids.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { OperationState } from "./types.ts";
export function rndMonthly2f(_s: CampaignState, _ctx: OpsCtx): void {}
export function onOperationSuccess(_s: CampaignState, _ctx: OpsCtx, _op: OperationState): void {}
export function leakModel(_s: CampaignState, ctx: OpsCtx, model: Id, by?: Id): void {
  ctx.emit("TechLeaked", { model, ...(by ? { by } : {}) });
}
export function factionModelPool(s: CampaignState, ctx: OpsCtx, faction: Id): Id[] {
  const def = ctx.world.get("faction-ops", faction) ?? ctx.world.all("faction-ops").find(f => f.faction === faction);
  if (!def) return [];
  const released = s.factions[def.id]?.rnd?.released;
  if (released) return [...released].sort();
  return ctx.world.all("model").filter(m => (m.maker === def.faction || m.maker === def.id || m.generic) &&
    "month" in m.availableFrom && m.availableFrom.month <= s.clock.month).map(m => m.id);
}
