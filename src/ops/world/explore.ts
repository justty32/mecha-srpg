import type { CampaignState, OpsCommand, OpsCtx } from "../state/types.ts";
import { evalOpsCond } from "../content/cond.ts";
import { worldRules } from "./nodes.ts";
import type { CmdResult } from "./nodes.ts";

// SPEC-GAP：Prompt 未保留隊伍／層數；以可序列化的探索脈絡供 choose 編排續鏈。
export type ExploreState = CampaignState & { exploration?: { node: string; party: string[]; layer: number } };
export function cmdExplore(s: CampaignState, ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "explore" }>): CmdResult {
  const node = ctx.world.get("node", cmd.ruin), cfg = worldRules(ctx).travel;
  if (!node?.ruin || node.kind !== "ruin") return { ok: false, error: "not-ruin" };
  if (s.ship.at !== node.id || s.ship.route) return { ok: false, error: "not-at-ruin" };
  if (s.pendingBattle || s.pendingChoices.length) return { ok: false, error: "pending-encounter" };
  if (cmd.party.length < cfg.partyMin || cmd.party.length > cfg.partyMax || new Set(cmd.party).size !== cmd.party.length ||
      cmd.party.some(id => !s.roster.persons[id] || s.roster.dead.some(p => p.person === id))) return { ok: false, error: "invalid-party" };
  const event = ctx.world.get("event", node.ruin.seedTable);
  if (!event || !evalOpsCond(s, ctx, event.when, { node: node.id })) return { ok: false, error: "no-event" };
  (s as ExploreState).exploration = { node: node.id, party: [...cmd.party], layer: 0 };
  s.pendingChoices.push({ text: event.text, choices: structuredClone(event.choices), event: event.id });
  s.pendingTicks++;
  ctx.emit("EventOffered", { event: event.id, node: node.id });
  return { ok: true };
}
