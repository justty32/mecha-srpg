import type { CampaignState, OpsCtx } from "../state/types.ts";
import { workqueueDaily5 } from "./workqueue.ts";
import { soulDaily5 } from "./soul.ts";
import { medbayDaily5 } from "./medbay.ts";
import { hangarDaily5 } from "./hangar.ts";
import { rules } from "./shared.ts";

export function shipDaily5(s: CampaignState, ctx: OpsCtx): void {
  workqueueDaily5(s, ctx); soulDaily5(s, ctx); medbayDaily5(s, ctx); hangarDaily5(s, ctx);
  const cfg = rules(ctx);
  s.ship.fuel.cur = Math.max(0, Math.min(s.ship.fuel.max, s.ship.fuel.cur + s.ship.fuel.regen - cfg.shipFuel));
  s.ship.hull.cur = Math.max(0, Math.min(s.ship.hull.max, s.ship.hull.cur + s.ship.hull.regen - cfg.shipHull));
}
export { ledgerDaily6, cmdPay } from "./wages.ts";
export { recruitsDaily7, cmdHire, cmdFire } from "./recruit.ts";
export { rosterDaily7, rosterReturn, registerDeath, prepareGrowth } from "./roster.ts";
export { workqueueDaily5, cmdQueue, cmdReorder } from "./workqueue.ts";
export { hangarDaily5, cmdAssign } from "./hangar.ts";
// TODO(2026-10-24 裁示)：活捕無馴化／餵養，待 spec 改寫；不匯出 stableDaily5／cmdFeed。
export { soulDaily5, openSoulNode, cmdAccompany } from "./soul.ts";
export { medbayDaily5 } from "./medbay.ts";
export { cmdWake, applyName } from "./names.ts";
export type { NamingPrompt } from "./names.ts";
export type { CmdResult, CrewState, CrewRuntime, CrewRules, Candidate } from "./shared.ts";
export type { CrewJob, CrewJobDef } from "./workqueue.ts";
