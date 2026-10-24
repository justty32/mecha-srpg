import type { CampaignState, OpsCtx, ResearchDef } from "../state/types.ts";

export function researchReady(s: CampaignState, ctx: OpsCtx, def: ResearchDef): boolean {
  return def.requires.every(id => { const d = ctx.world.get("research", id); return d ? s.research[d.id]?.done : !!s.flags[`unlocked:${id}`]; });
}
export function finishResearch(s: CampaignState, ctx: OpsCtx, id: string, hours: number): void {
  const def = ctx.world.require("research", id);
  const state = s.research[def.id] ??= { def: def.id, hoursDone: 0, coinPaid: false, done: false };
  state.hoursDone = Math.min(def.cost.techHours, hours); state.coinPaid = true;
  if (state.done || state.hoursDone < def.cost.techHours) return;
  state.done = true;
  for (const unlock of def.unlocks) s.flags[`unlocked:${unlock.id}`] = 1;
  ctx.emit("ResearchDone", { research: def.id });
}
