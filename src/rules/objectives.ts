import type { Objective } from "../core/types-def.ts";
import type { BattleOutcome } from "../core/types-state.ts";
import type { Ctx } from "./state.ts";
import { distance, emit, hostileSlots, isActive, rt, unit } from "./state.ts";
import { onSignal } from "./hooks.ts";

export function objectiveDone(ctx: Ctx, o: Objective): boolean {
  const runtime = rt(ctx.s), target = typeof o.params.unit === "string" ? o.params.unit : undefined;
  switch (o.kind) {
    case "eliminate": {
      const slots = Array.isArray(o.params.slots) ? o.params.slots : undefined;
      return !Object.keys(ctx.s.units).sort().some(id => isActive(ctx, id) && unit(ctx, id).owner !== "berserk"
        && (slots ? slots.includes(unit(ctx, id).owner) : hostileSlots(ctx, o.for, unit(ctx, id).owner)));
    }
    case "survive": return typeof o.params.rounds === "number" && ctx.s.round >= o.params.rounds;
    case "capture": return !!target && runtime.unitStatus[target] === "captured" && unit(ctx, target).owner === o.for;
    case "killTarget": {
      const targets = new Set([...(Array.isArray(o.params.units)
        ? o.params.units.filter((id): id is string => typeof id === "string") : []), ...(target ? [target] : [])]);
      return targets.size > 0 && [...targets].every(id => runtime.unitStatus[id] === "dead");
    }
    case "reachExit": return !!target && !!ctx.s.units[target] && unit(ctx, target).owner === o.for
      && (runtime.unitStatus[target] === "retreated" || (isActive(ctx, target) && runtime.exits.some(c => distance(c, unit(ctx, target).pos) === 0)));
    // SPEC-GAP：hold／escort 的區域、進度與護送完成條件未定，永不自動完成。
    case "hold": case "escort": return false;
  }
}

export function evaluateObjectives(ctx: Ctx, atRoundEnd: boolean): BattleOutcome | null {
  const runtime = rt(ctx.s);
  if (runtime.outcome) return runtime.outcome;
  const slots = Object.keys(ctx.s.factions).sort().filter(s => s !== "berserk");
  const objectives: Objective[] = runtime.objectives.length ? runtime.objectives : slots.map(slot => ({ kind: "eliminate", params: {}, for: slot, onComplete: "win" }));
  for (const o of objectives) {
    if (o.onComplete === "continue" || (o.kind === "survive" && !atRoundEnd) || !objectiveDone(ctx, o)) continue;
    // SPEC-GAP：多人 lose 未指定勝方；採仍有 active 單位的其他 slot 字典序第一名。
    const winner = o.onComplete === "win" ? o.for : slots.find(slot => slot !== o.for && Object.keys(ctx.s.units).sort().some(id => isActive(ctx, id) && unit(ctx, id).owner === slot)) ?? null;
    runtime.outcome = { winner, reason: o.kind };
    break;
  }
  if (!runtime.outcome && atRoundEnd && runtime.maxRounds !== null && ctx.s.round >= runtime.maxRounds) runtime.outcome = { winner: null, reason: "timeout" };
  if (runtime.outcome) emit(ctx, "BattleEnd", runtime.outcome);
  return runtime.outcome;
}

onSignal("roundEnd", "people.objectives.round", 100, ctx => { evaluateObjectives(ctx, true); });
onSignal("unitDied", "people.objectives.death", 100, ctx => { evaluateObjectives(ctx, false); });
onSignal("unitRemoved", "people.objectives.removal", 100, ctx => { evaluateObjectives(ctx, false); });
