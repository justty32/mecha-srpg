import type { Cell } from "../../core/types-def.ts";
import type { Agent, AiCtx, Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { tacticWeights, hpFraction, previewOutcome } from "../score.ts";
import { isSupport, supportDelta, supportCost, supportUsed } from "../support.ts";
import { pursuitCells } from "../knowledge.ts";
import { proposeTactical } from "./tactical.ts";

const DEFAULTS = { berserkAttack: 10, berserkDistance: 1, friendlyFirePenalty: 0,
  berserkSupportBonusCap: 1, berserkDefenseThreshold: 1, berserkDefenseCap: 1.2 };

function selfSupport(ctx: AiCtx, agent: Agent, c: Candidate): { defense: number; offense: number; attack: number } {
  const empty = { defense: 0, offense: 0, attack: 0 };
  if (c.move || c.cmd.kind !== "useAbility") return empty;
  const cmd = c.cmd, def = ctx.q.abilityDef(cmd.ability);
  if (def.target.kind !== "self" || !isSupport(def) || supportUsed(agent, ctx.view.round, def.id)) return empty;
  let defense = 0, offense = 0, best = 0;
  const outcome = previewOutcome(ctx.q, ctx.view, cmd, undefined, 3, ({ state: after }, before) => {
    const cost = supportCost(ctx, agent.unit, def, before);
    defense += Math.max(0, supportDelta(ctx, agent.unit, def, before, after) - cost);
    const changed = (["accuracy", "initiative"] as const).some(attr => ctx.q.roleAttr(after, agent.unit, attr)
      > ctx.q.roleAttr(before, agent.unit, attr));
    if (!changed) return;
    let attack = 0;
    for (const ability of ctx.q.abilitiesOf(after, agent.unit)) {
      const a = ctx.q.abilityDef(ability), weights = tacticWeights(ctx.q, after, agent.unit, ability);
      if (a.target.kind === "self" || !((weights.attack ?? 0) > 0 || (weights.attackArea ?? 0) > 0)) continue;
      for (const id of Object.keys(after.units).sort()) {
        if (id === agent.unit || !ctx.q.isActive(after, id) || (hostileOnly(ctx, agent) && !ctx.q.hostile(after, agent.unit, id))) continue;
        const target = a.target.kind === "unit" || a.target.kind === "part" ? { unit: id } : { cell: after.units[id]!.pos };
        if (ctx.q.checkAbility(after, agent.unit, ability, target) === null) attack = Math.max(attack,
          (ctx.params.berserkAttack ?? DEFAULTS.berserkAttack) + (ctx.params.berserkDistance ?? DEFAULTS.berserkDistance)
            / (1 + ctx.q.distance(after.units[agent.unit]!.pos, after.units[id]!.pos)));
      }
    }
    if (attack > 0) {
      // 沿用攻擊增益舊公式，不模擬攻擊；仍須有實際新效果及付得起的後續攻擊。
      offense += Math.max(0, (tacticWeights(ctx.q, before, agent.unit, def.id).buff ?? 0)
        * (ctx.params.buff ?? 0.5) * (1.5 - hpFraction(ctx.q, before, agent.unit)) - cost);
      best = Math.max(best, attack);
    }
  });
  return { defense: defense / Math.max(1, outcome.runs), offense: offense / Math.max(1, outcome.runs), attack: best };
}

function hostileOnly(ctx: AiCtx, agent: Agent): boolean {
  // 只有可友傷的攻擊才追友軍，否則鄰接友軍會擋住所有追敵移動。
  return !ctx.q.abilitiesOf(ctx.view, agent.unit).some(id => {
    const def = ctx.q.abilityDef(id), weights = tacticWeights(ctx.q, ctx.view, agent.unit, id);
    return (def.mode === "activated" || def.mode === "sustained") && def.target.kind !== "self"
      && def.target.friendly !== "no" && ((weights.attack ?? 0) > 0 || (weights.attackArea ?? 0) > 0);
  });
}

function nearest(ctx: AiCtx, agent: Agent, cell: Cell): number {
  return Math.min(...pursuitCells(ctx, agent.unit, hostileOnly(ctx, agent)).map(target => ctx.q.distance(cell, target)));
}

registerPolicy({
  id: "berserk", band: 1,
  propose(ctx, agent) {
    const self = ctx.view.units[agent.unit];
    if (!self) return [];
    const attackCtx = { ...ctx, params: { ...ctx.params, friendlyFirePenalty: DEFAULTS.friendlyFirePenalty } };
    // SPEC-GAP：不覆寫規則的 friendly 限制，友傷必須有規則允許的能力（例如範圍攻擊）。
    return proposeTactical(attackCtx, agent, { hostileOnly: hostileOnly(ctx, agent) }).filter((c) => {
      if (c.cmd.kind === "useAbility") {
        if (c.cmd.target?.unit === agent.unit) {
          const benefit = selfSupport(ctx, agent, c);
          return benefit.defense > 0 || benefit.offense > 0;
        }
        const weights = tacticWeights(ctx.q, ctx.view, agent.unit, c.cmd.ability);
        return (weights.attack ?? 0) > 0 || (weights.attackArea ?? 0) > 0;
      }
      if (c.cmd.kind !== "move") return false;
      const cell = c.cmd.path.at(-1);
      return cell !== undefined && nearest(ctx, agent, cell) < nearest(ctx, agent, self.pos);
    });
  },
  score(ctx, agent, c) {
    const distanceWeight = ctx.params.berserkDistance ?? DEFAULTS.berserkDistance;
    if (c.cmd.kind === "useAbility") {
      if (ctx.q.abilityDef(c.cmd.ability).target.kind === "self") {
        const u = selfSupport(ctx, agent, c), p = { ...DEFAULTS, ...ctx.params };
        return u.offense > 0 ? Math.max(u.attack, p.berserkAttack) + Math.min(u.offense, p.berserkSupportBonusCap)
          : u.defense > 0 ? p.berserkAttack * Math.min(p.berserkDefenseCap, u.defense / p.berserkDefenseThreshold) : -Infinity;
      }
      const target = c.cmd.target?.unit ? ctx.view.units[c.cmd.target.unit]?.pos : c.cmd.target?.cell;
      const pos = c.move ?? ctx.view.units[agent.unit]!.pos;
      return (ctx.params.berserkAttack ?? DEFAULTS.berserkAttack) + distanceWeight / (1 + (target ? ctx.q.distance(pos, target) : 0));
    }
    if (c.cmd.kind === "move") return distanceWeight / (1 + nearest(ctx, agent, c.cmd.path.at(-1) ?? ctx.view.units[agent.unit]!.pos));
    return 0;
  },
});
