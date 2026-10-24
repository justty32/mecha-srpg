import { pickWeighted } from "../../core/rng.ts";
import type { CampaignState, OpsCtx, WorldActionDef } from "../state/types.ts";
import type { OpsScope } from "../content/cond.ts";
import type { ActionsState } from "../world/actions.ts";
import { evalOpsCond, evalOpsNum } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";
import { drive, dailyDrivers, allianceWeight, diplomacyRules } from "./drivers.ts";
import { treatiesDaily, canSignTreaty } from "./treaties.ts";
import { flushRelations2, hasTreaty } from "./relations.ts";
import { forcesDaily } from "./forces.ts";
import { operationAllowed, operationTargets } from "./operations.ts";
import { warFactionIds } from "./state.ts";
export * from "./types.ts";
export { initWar } from "./state.ts";
export { operationsDaily2c } from "./operations.ts";
export { rndMonthly2f } from "./rnd.ts";
export { changeRelation, relation, factionId, flushRelations2 } from "./relations.ts";
export function diplomacyDaily2b(s: CampaignState, ctx: OpsCtx): void {
  if (!s.relations) return;
  dailyDrivers(s, ctx); treatiesDaily(s, ctx); flushRelations2(s, ctx); forcesDaily(s, ctx);
}
const warCards = new WeakMap<OpsCtx["world"], WorldActionDef[]>();
export function warActionsDaily2d(s: CampaignState, ctx: OpsCtx): void {
  if (!s.warRng) return;
  if (s.clock.phase === "spring" && Object.values(s.rifts).filter(r => r.openedDay === s.clock.day).length >= 3)
    for (const r of Object.values(s.relations ?? {})) drive(s, ctx, "pressure-truce", r.a, r.b);
  const state = s as ActionsState;
  let cards = warCards.get(ctx.world);
  if (!cards) { cards = ctx.world.all("action").filter(c => c.lane === "war" && c.actor === "faction"); warCards.set(ctx.world, cards); }
  for (const actor of warFactionIds(s, ctx)) {
    const key = `war:${actor}`;
    if (state.actionDrawDays?.[key] === s.clock.day) continue;
    (state.actionDrawDays ??= {})[key] = s.clock.day;
    const candidates: { card: WorldActionDef; scope: OpsScope; weight: number }[] = [];
    for (const card of cards) {
      if (card.lane !== "war" || card.actor !== "faction" || (state.actionCooldowns?.[`${key}|${card.id}`] ?? 0) > s.clock.day) continue;
      const diplomatic = card.effects.some(e => "declareWar" in e || "treaty" in e);
      const scopes: OpsScope[] = diplomatic ? Object.values(s.relations ?? {}).filter(r => r.a === actor || r.b === actor).map(r => ({ faction: actor, targetFaction: r.a === actor ? r.b : r.a })) : [{ faction: actor }];
      for (const scope of scopes) {
        if (!evalOpsCond(s, ctx, card.valid, scope)) continue;
        let weight = evalOpsNum(s, ctx, card.weight, scope), valid = true;
        for (const effect of card.effects) {
          if ("startOperation" in effect) {
            const def = ctx.world.require("operation", effect.startOperation);
            const f = s.factions[actor]!;
            if (!f.forces || f.forces.supply < 40 || (f.ops?.length ?? 0) >= (f.scaleNow === "state" ? 2 : 1) || !def.actorScales.includes(f.scaleNow)) { valid = false; break; }
            weight *= evalOpsNum(s, ctx, def.weight, scope);
          }
          const r = scope.targetFaction ? s.relations?.[[actor, scope.targetFaction].sort().join("|")] : undefined;
          if ("declareWar" in effect && (!r || r.state === "war" || r.value > -60 || hasTreaty(s, ctx, r, "ceasefire") || hasTreaty(s, ctx, r, "nonaggression"))) valid = false;
          if ("treaty" in effect) {
            const def = ctx.world.require("treaty", effect.treaty.def);
            if (!r || !canSignTreaty(s, ctx, r, def)) valid = false;
            else if (def.kind === "ceasefire") {
              const cfg = diplomacyRules(ctx);
              if (r.weariness < cfg.truceAt) valid = false;
              else weight *= r.weariness / 20;
            } else if (def.kind === "alliance") weight *= allianceWeight(s, ctx, actor, scope.targetFaction!);
          }
        }
        if (valid && weight > 0) candidates.push({ card, scope, weight });
      }
    }
    if (!candidates.length) continue;
    // 按權重取候選，抽到作戰才解析目標；無目標的牌剔除再抽。
    // 這是拒絕抽樣，合法牌的相對機率不變，避免每日替所有休整勢力反覆尋路。
    while (candidates.length) {
      const selected = pickWeighted(s.warRng, candidates, c => c.weight), { card, scope } = selected;
      const valid = card.effects.every(e => {
        if (!("startOperation" in e)) return true;
        const def = ctx.world.require("operation", e.startOperation);
        return operationTargets(s, ctx, actor, def).some(t => operationAllowed(s, ctx, actor, def, t));
      });
      if (!valid) { candidates.splice(candidates.indexOf(selected), 1); continue; }
      applyOpsEffects(s, ctx, card.effects, scope);
      (state.actionCooldowns ??= {})[`${key}|${card.id}`] = s.clock.day + card.cooldownDays;
      if (card.effects.length) ctx.emit("WorldAction", { actor, action: card.id, lane: "war" });
      break;
    }
  }
  flushRelations2(s, ctx);
}
