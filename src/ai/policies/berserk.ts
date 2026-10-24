import type { Cell } from "../../core/types-def.ts";
import type { Agent, AiCtx } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { tacticWeights } from "../score.ts";
import { pursuitCells } from "../knowledge.ts";
import { proposeTactical } from "./tactical.ts";

const DEFAULTS = { berserkAttack: 10, berserkDistance: 1, friendlyFirePenalty: 0 };

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
        if (c.cmd.target?.unit === agent.unit) return false;
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
      const target = c.cmd.target?.unit ? ctx.view.units[c.cmd.target.unit]?.pos : c.cmd.target?.cell;
      const pos = c.move ?? ctx.view.units[agent.unit]!.pos;
      return (ctx.params.berserkAttack ?? DEFAULTS.berserkAttack) + distanceWeight / (1 + (target ? ctx.q.distance(pos, target) : 0));
    }
    if (c.cmd.kind === "move") return distanceWeight / (1 + nearest(ctx, agent, c.cmd.path.at(-1) ?? ctx.view.units[agent.unit]!.pos));
    return 0;
  },
});
