import type { MoraleStage } from "../core/types-def.ts";
import type { BattleState } from "../core/types-state.ts";
import type { AiCtx, AiParams } from "./policy.ts";
import type { RulesQuery } from "./rules-query.ts";
import { isHostileSlot } from "./hostility.ts";

export const DEFAULTS = { individualRetreatMinRound: 3 };

export function individualRetreatReady(q: RulesQuery, s: BattleState, id: string, params: AiParams): boolean {
  if (s.round >= (params.individualRetreatMinRound ?? DEFAULTS.individualRetreatMinRound)) return true;
  const person = q.commanderOf(s, id);
  // SPEC-GAP：進場帶傷／低士氣先觀察；本場自己受火、受創或士氣惡化即可提早撤離。
  return s.log.events.some(e => e.round > 0 && (
    e.type === "LayerDamaged" && e.payload.unit === id && Number(e.payload.amount) > 0
    || e.type === "MoraleChanged" && person && e.payload.person === person
      && e.payload.from !== e.payload.to && ["breaking", "fleeing"].includes(String(e.payload.to))
    || ["Hit", "Miss"].includes(e.type) && e.payload.target === id
      && typeof e.payload.unit === "string" && !!s.units[e.payload.unit]
      && isHostileSlot(q, s, s.units[id]!.owner, s.units[e.payload.unit]!.owner)
  ));
}

type RetreatParams = { retreatForceRatio: number; retreatMinRound: number; retreatDamage: number };

export function shouldRetreat(ctx: AiCtx, morale: MoraleStage | undefined, ratio: number, params: RetreatParams, unit: string): boolean {
  if (morale === "breaking" || morale === "fleeing") return individualRetreatReady(ctx.q, ctx.s, unit, ctx.params);
  if (ctx.s.round < params.retreatMinRound) return false;
  const friendly = (id: string): boolean => !!ctx.s.units[id]
    && !isHostileSlot(ctx.q, ctx.s, ctx.slot, ctx.s.units[id]!.owner);
  let max = 0, hp = 0;
  for (const id of Object.keys(ctx.s.units).sort().filter(friendly)) {
    max += ctx.q.partDefs(ctx.s, id).reduce((sum, part) => sum + ctx.q.layerDefs(ctx.s, id, part.id).reduce((n, l) => n + l.hp, 0), 0);
    if (ctx.s.rt?.unitStatus[id] !== "dead") hp += Object.values(ctx.s.units[id]!.parts).reduce((sum, part) => sum + part.layers.reduce((n, l) => n + l.hp, 0), 0);
  }
  // SPEC-GAP：總 HP 損失以全部友軍層的內容上限為基準；死亡單位剩餘層視為 0。
  const damage = max > 0 ? Math.max(0, Math.min(1, 1 - hp / max)) : 0;
  let hurt = damage > 0, outgoing = false, incoming = false;
  for (const event of ctx.s.log.events) {
    const actor = event.payload.unit, target = event.payload.target;
    if (event.type === "LayerDamaged" && typeof actor === "string" && friendly(actor)) hurt = true;
    if (!["Hit", "Miss"].includes(event.type) || typeof actor !== "string" || typeof target !== "string") continue;
    const a = ctx.s.units[actor], b = ctx.s.units[target];
    if (!a || !b || !isHostileSlot(ctx.q, ctx.s, a.owner, b.owner)) continue;
    if (friendly(actor)) outgoing = true;
    if (friendly(target)) incoming = true;
  }
  return (hurt || outgoing && incoming) && (ratio < params.retreatForceRatio || damage >= params.retreatDamage);
}
