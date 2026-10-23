import type { Id } from "../core/ids.ts";
import type { Cell, FactionSlot } from "../core/types-def.ts";
import type { BattleState, FactionKnowledge } from "../core/types-state.ts";
import type { GameEvent } from "../core/events.ts";
import type { RulesQuery } from "./rules-query.ts";
import type { AiParams, Assignment } from "./policy.ts";
import { ownUnits } from "./knowledge.ts";
import { forceRatio, hpFraction, targetValue } from "./score.ts";

const DEFAULTS = { attackRatio: 0.8, holdRatio: 0.4, maxEngage: 3, focusDistance: 2 };

export type Deploy = { unit: Id; cell: Cell };
export type StrategyCtx = { q: RulesQuery; s: BattleState; view: BattleState; slot: FactionSlot; know: FactionKnowledge; params: AiParams };
export interface Strategy { id: Id; deploy(ctx: StrategyCtx): Deploy[]; roundPlan(ctx: StrategyCtx): Assignment[]; onEvent(ev: GameEvent): void }

export function createDefaultStrategy(): Strategy {
  let engagements: Record<Id, Id> = {};
  return {
    id: "default",
    deploy({ q, s, slot }) {
      // SPEC-GAP：契約未提供部署區查詢，實際部署由 sim／情境負責。
      return ownUnits(q, s, slot).map((unit) => ({ unit, cell: { ...s.units[unit]!.pos } }));
    },
    roundPlan(ctx) {
      const { q, s, view, slot, params } = ctx;
      const own = ownUnits(q, s, slot);
      const enemies = Object.keys(view.units).sort().filter((id) => view.units[id]!.owner !== slot && q.isActive(view, id));
      const ratio = forceRatio(q, s, view, slot);
      const holdRatio = params.holdRatio ?? DEFAULTS.holdRatio;
      const stance = ratio >= (params.attackRatio ?? DEFAULTS.attackRatio) ? "attack" : ratio >= holdRatio ? "defend" : "hold";
      const priority = (id: Id): number => {
        const parts = view.units[id]!.parts;
        const hp = Object.keys(parts).sort().reduce((sum, key) => sum + parts[key]!.layers.reduce((n, layer) => n + layer.hp, 0), 0);
        return targetValue(q, view, id) / Math.max(1, hp);
      };
      const focus = [...enemies].sort((a, b) => priority(b) - priority(a) || (a < b ? -1 : a > b ? 1 : 0))[0];
      engagements = {};
      const counts: Record<Id, number> = {};
      return own.map((unit): Assignment => {
        const assignment: Assignment = { unit, stance, allowRetreat: ratio < holdRatio };
        const distance = (id: Id): number => q.distance(s.units[unit]!.pos, view.units[id]!.pos);
        const available = enemies.filter((id) => (counts[id] ?? 0) < (params.maxEngage ?? DEFAULTS.maxEngage))
          .sort((a, b) => distance(a) - distance(b) || (a < b ? -1 : a > b ? 1 : 0));
        let target = available[0];
        if (target && focus && available.includes(focus)
          && distance(focus) - distance(target) <= (params.focusDistance ?? DEFAULTS.focusDistance)) target = focus;
        if (target) {
          assignment.target = target;
          engagements[unit] = target;
          counts[target] = (counts[target] ?? 0) + 1;
        }
        if (stance === "defend") {
          const protect = own.filter((id) => id !== unit)
            .sort((a, b) => hpFraction(q, s, a) - hpFraction(q, s, b) || (a < b ? -1 : a > b ? 1 : 0))[0];
          if (protect) assignment.protect = protect;
        }
        return assignment;
      });
    },
    onEvent(ev) {
      if (ev.type !== "UnitDied" || typeof ev.payload.unit !== "string") return;
      for (const unit of Object.keys(engagements).sort()) {
        if (unit === ev.payload.unit || engagements[unit] === ev.payload.unit) delete engagements[unit];
      }
    },
  };
}
