import { pickWeighted } from "../../core/rng.ts";
import type { CampaignState, OpsCtx, WorldActionDef } from "../state/types.ts";
import type { OpsScope } from "../content/cond.ts";
import { evalOpsCond, evalOpsNum } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";

// SPEC-GAP：冷卻按 actor/card 分開保存；drawDays 防止同一日重入抽第二張。
export type ActionsState = CampaignState & { actionCooldowns?: Record<string, number>; actionDrawDays?: Record<string, number> };
export function actionsDaily2(s: CampaignState, ctx: OpsCtx): void {
  const state = s as ActionsState;
  const actors: { id: string; kind: WorldActionDef["actor"]; scope: OpsScope }[] = [
    ...Object.keys(s.factions).sort().filter(id => s.factions[id]!.alive && (ctx.world.require("faction-ops", s.factions[id]!.def).actionLanes?.includes("world") ?? true)).map(id => ({ id, kind: "faction" as const, scope: { faction: id, tags: ctx.world.require("faction-ops", s.factions[id]!.def).tags } })),
    ...(s.clock.phase === "spring" ? Object.keys(s.rifts).sort().filter(id => !["closed", "sealed", "receding"].includes(s.rifts[id]!.phase)).map(id => ({ id, kind: "rift" as const, scope: { rift: id, node: s.rifts[id]!.site } })) : []),
    { id: "world", kind: "world" as const, scope: {} },
  ].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  for (const actor of actors) {
    if (state.actionDrawDays?.[actor.id] === s.clock.day) continue;
    const cards = ctx.world.all("action").filter(card => card.lane !== "war" && card.actor === actor.kind && (state.actionCooldowns?.[`${actor.id}|${card.id}`] ?? 0) <= s.clock.day && evalOpsCond(s, ctx, card.valid, actor.scope))
      .map(card => ({ card, weight: evalOpsNum(s, ctx, card.weight, actor.scope) })).filter(item => item.weight > 0);
    (state.actionDrawDays ??= {})[actor.id] = s.clock.day;
    if (!cards.length) continue;
    const { card } = pickWeighted(s.rng, cards, c => c.weight), firstRequest = s.pendingContracts.length;
    applyOpsEffects(s, ctx, card.effects, actor.scope);
    for (const request of s.pendingContracts.slice(firstRequest)) {
      // 保留來源，交由段 2 的 contractsDaily2 建立 offered 快照；world 不跨入 contracts。
      Object.assign(request, actor.scope.faction ? { issuer: actor.scope.faction } : {}, actor.scope.rift ? { rift: actor.scope.rift, place: actor.scope.place ?? actor.scope.node } : {});
    }
    (state.actionCooldowns ??= {})[`${actor.id}|${card.id}`] = s.clock.day + card.cooldownDays;
    ctx.emit("WorldAction", { actor: actor.id, action: card.id });
  }
}
