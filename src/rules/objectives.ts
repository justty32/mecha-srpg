import type { Cell, Objective } from "../core/types-def.ts";
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
    // SPEC-GAP：護送目標明列 unit／units，全部存活到出口或已撤離才完成。
    case "escort": {
      const targets = [...new Set([...(Array.isArray(o.params.units)
        ? o.params.units.filter((id): id is string => typeof id === "string") : []), ...(target ? [target] : [])])];
      return targets.length > 0 && targets.every(id => !!ctx.s.units[id]
        && (runtime.unitStatus[id] === "retreated" || (isActive(ctx, id) && runtime.exits.some(c => distance(c, unit(ctx, id).pos) === 0))));
    }
    case "hold": return typeof o.params.rounds === "number" && o.params.rounds > 0
      && (runtime.holdProgress?.[JSON.stringify(o)]?.count ?? 0) >= o.params.rounds;
  }
}

function advanceHold(ctx: Ctx, o: Objective): void {
  const progress = rt(ctx.s).holdProgress ??= {}, key = JSON.stringify(o), previous = progress[key];
  if (previous?.round === ctx.s.round) return;
  // SPEC-GAP：zone 以格陣列定義；role:anchor 未定義，視同無 zone 的存活計時。
  const zone = Array.isArray(o.params.zone) ? o.params.zone.filter((c): c is Cell =>
    !!c && typeof c === "object" && "x" in c && "y" in c && typeof c.x === "number" && typeof c.y === "number") : undefined;
  const occupants = Object.keys(ctx.s.units).sort().filter(id => isActive(ctx, id)
    && (!zone || zone.some(c => distance(c, unit(ctx, id).pos) === 0)));
  const held = occupants.some(id => unit(ctx, id).owner === o.for)
    && (!zone || !occupants.some(id => hostileSlots(ctx, o.for, unit(ctx, id).owner)));
  progress[key] = { round: ctx.s.round, count: held ? (previous?.round === ctx.s.round - 1 ? previous.count : 0) + 1 : 0 };
}

export function evaluateObjectives(ctx: Ctx, atRoundEnd: boolean): BattleOutcome | null {
  const runtime = rt(ctx.s);
  if (runtime.outcome) return runtime.outcome;
  const slots = Object.keys(ctx.s.factions).sort().filter(s => s !== "berserk");
  const objectives: Objective[] = runtime.objectives.length ? runtime.objectives : slots.map(slot => ({ kind: "eliminate", params: {}, for: slot, onComplete: "win" }));
  for (const o of objectives) {
    if (o.kind === "hold" && atRoundEnd) advanceHold(ctx, o);
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
