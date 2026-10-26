import type { AbilityDef, EffectDef } from "../core/types-def.ts";
import type { BattleState } from "../core/types-state.ts";
import type { Agent, AiCtx } from "./policy.ts";
import { dangerAt } from "./danger.ts";

// SPEC-GAP 補（2026-10-26 lead-engine-next）：支援只計實際邊際收益，參數沿 profile 覆寫。
export const SUPPORT_DEFAULTS = {
  supportDangerScale: 3, supportDefense: 6, supportEvasionUnit: 20, supportWoundBoost: 1,
  supportHeal: 6, supportHeatStart: 0.6, supportHeatUrgent: 1, supportRelief: 12,
  supportBandBonus: 0.5, supportAssignmentBonus: 0.25, supportBuffScale: 2,
  supportEscape: 1, supportApCost: 0.08, supportPoolCost: 0.1,
};

export function isSupport(def: AbilityDef): boolean {
  return ["buff", "protect", "heal", "escape"].some(t => def.ai.tactics[t] !== undefined);
}

/** 只展開施放時會安裝的效果及 onApply；不預借未來 tick。 */
export function supportEffects(ctx: AiCtx, def: AbilityDef): EffectDef[] {
  const seen = new Set<string>(), result: EffectDef[] = [];
  const visit = (id: string): void => {
    if (seen.has(id)) return;
    seen.add(id);
    const effect = ctx.q.effectDef(id);
    result.push(effect);
    for (const h of effect.hooks.onApply ?? []) if (h.do === "apply") {
      for (const r of h.effects) visit(typeof r === "string" ? r : r.effect);
    }
  };
  for (const g of def.effects) if (g.on !== "miss") for (const r of g.apply) visit(typeof r === "string" ? r : r.effect);
  return result;
}

export function supportKind(ctx: AiCtx, def: AbilityDef, actor: string): { measured: boolean; offensive: boolean; relief: string[]; pools: string[] } {
  const effects = supportEffects(ctx, def);
  const pools = [...new Set([...def.produces.filter(c => c.owner === "mech").map(c => c.pool),
    ...effects.flatMap(e => (e.hooks.onApply ?? []).flatMap(h => h.do === "pool" && h.owner === "mech" ? [h.pool] : []))])];
  const relief = [...new Set(effects.flatMap(e => (e.hooks.onApply ?? []).flatMap(h =>
    h.do === "pool" && h.owner === "mech" && ctx.q.evalNum(ctx.view, h.delta, actor) < 0 ? [h.pool] : [])))];
  return {
    measured: def.ai.tactics.heal !== undefined || pools.length > 0 || effects.some(e => e.contribs.some(c => c.path.endsWith(".evasion"))),
    offensive: effects.some(e => e.contribs.some(c => c.path.endsWith(".accuracy") || c.path.endsWith(".initiative"))),
    relief, pools,
  };
}

const clamp = (x: number): number => Math.max(0, Math.min(1, x));
export function supportDelta(ctx: AiCtx, actor: string, def: AbilityDef, before: BattleState, after: BattleState): number {
  const { q } = ctx, p = { ...SUPPORT_DEFAULTS, ...ctx.params }, kind = supportKind(ctx, def, actor);
  let total = 0;
  for (const id of Object.keys(before.units).sort()) {
    const old = before.units[id]!, u = after.units[id];
    if (!u) continue;
    // 真失控對自己仍可自護；其餘受益者照敵我關係扣分。
    const hostile = id !== actor && q.hostile(before, actor, id);
    const maxHp = q.partDefs(before, id).reduce((sum, part) => sum + q.layerDefs(before, id, part.id).reduce((n, l) => n + l.hp, 0), 0);
    let hp = 0, healed = 0;
    for (const [part, state] of Object.entries(old.parts)) state.layers.forEach((l, i) => {
      hp += l.hp;
      healed += Math.max(0, Math.min(q.layerDefs(before, id, part)[i]?.hp ?? l.hp, u.parts[part]?.layers[i]?.hp ?? l.hp) - l.hp);
    });
    const danger = dangerAt(ctx.danger, u.pos), d = danger / (danger + p.supportDangerScale);
    let value = maxHp > 0 ? p.supportHeal * healed / maxHp * (1 + d) : 0;
    let allowDefense = kind.relief.length === 0;
    for (const decl of q.poolDecls(before, id)) {
      if (!kind.pools.includes(decl.id)) continue;
      const a = old.pools[decl.id], b = u.pools[decl.id];
      if (!a || !b || !Number.isFinite(a.max) || a.max <= 0) continue;
      // 自付成本不是卸載效果；先補回會造成下降的成本。
      const paid = id === actor ? def.costs.filter(c => c.owner === "mech" && c.pool === decl.id)
        .reduce((n, c) => n + q.evalNum(before, c.amount, actor), 0) : 0;
      const delta = decl.inverted ? Math.max(0, a.cur - b.cur - paid) : Math.max(0, b.cur - a.cur);
      const need = decl.inverted ? clamp((a.cur / a.max - p.supportHeatStart) / (p.supportHeatUrgent - p.supportHeatStart)) : 1;
      if (decl.inverted && delta > 0 && need > 0) allowDefense = true;
      value += p.supportRelief * delta / a.max * need * (1 + p.supportBandBonus * Math.max(0, a.band - b.band));
    }
    if (allowDefense) {
      const evasion = Math.max(0, q.roleAttr(after, id, "evasion") - q.roleAttr(before, id, "evasion"));
      value += p.supportDefense * d * clamp(evasion / p.supportEvasionUnit) * (1 + p.supportWoundBoost * (1 - (maxHp > 0 ? clamp(hp / maxHp) : 1)));
    }
    total += value * (hostile ? -(ctx.params.enemyBuffPenalty ?? 1) : id === ctx.assignment?.protect ? 1 + p.supportAssignmentBonus : 1);
  }
  return total;
}

export function supportCost(ctx: AiCtx, actor: string, def: AbilityDef, before: BattleState): number {
  const p = { ...SUPPORT_DEFAULTS, ...ctx.params };
  return def.costs.reduce((sum, cost) => {
    const amount = ctx.q.evalNum(before, cost.amount, actor);
    const person = cost.owner === "person" ? ctx.q.commanderOf(before, actor) : null;
    const pool = (person ? before.persons[person] : before.units[actor])?.pools[cost.pool];
    return sum + (cost.pool === "ap" ? p.supportApCost * amount
      : pool && Number.isFinite(pool.max) && pool.max > 0 ? p.supportPoolCost * amount / pool.max : 0);
  }, 0);
}

type Used = { round: number; abilities: string[] };
export function supportUsed(agent: Agent, round: number, ability: string): boolean {
  const used = agent.memory.supportUsed as Used | undefined;
  return used?.round === round && used.abilities.includes(ability);
}
export function rememberSupport(agent: Agent, round: number, ability: string): void {
  const used = agent.memory.supportUsed as Used | undefined;
  agent.memory.supportUsed = { round, abilities: [...new Set([...(used?.round === round ? used.abilities : []), ability])] };
}
