import type { Cell, Objective } from "../core/types-def.ts";
import type { BattleOutcome, BattleState } from "../core/types-state.ts";
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
    // SPEC-GAP：多人 lose 未指定勝方；採與敗方敵對、仍有 active 單位的 slot 字典序第一名（盟軍與敗方同敗）。
    const winner = o.onComplete === "win" ? o.for : slots.find(slot => slot !== o.for && hostileSlots(ctx, o.for, slot) && Object.keys(ctx.s.units).sort().some(id => isActive(ctx, id) && unit(ctx, id).owner === slot)) ?? null;
    runtime.outcome = { winner, reason: o.kind };
    const targets = Array.isArray(o.params.slots) ? o.params.slots : undefined;
    if (o.kind === "eliminate" && Object.keys(ctx.s.units).some(id => runtime.unitStatus[id] === "retreated"
      && (targets ? targets.includes(unit(ctx, id).owner) : hostileSlots(ctx, o.for, unit(ctx, id).owner)))) runtime.outcome.detail = "repelled";
    break;
  }
  // SPEC-GAP：多方同時符合時沿用既有字典序第一勝方；勝方須仍有 active，盟軍不算敵方。
  if (!runtime.outcome) for (const slot of slots) {
    const ids = Object.keys(ctx.s.units), enemies = ids.filter(id => hostileSlots(ctx, slot, unit(ctx, id).owner));
    if (ids.some(id => unit(ctx, id).owner === slot && isActive(ctx, id))
      && !enemies.some(id => isActive(ctx, id)) && enemies.some(id => runtime.unitStatus[id] === "retreated")) {
      runtime.outcome = { winner: slot, reason: "repelled", detail: "repelled" };
      break;
    }
  }
  if (!runtime.outcome && atRoundEnd && runtime.maxRounds !== null && ctx.s.round >= runtime.maxRounds) runtime.outcome = { winner: null, reason: "timeout" };
  // 指令／開局結算中途（死亡／撤離）定局時，BattleEnd 延到該次結算收尾才寫，讓同一指令的後續結算都在它之前。
  if (runtime.outcome) {
    if (!atRoundEnd && deferring.has(ctx.s)) pendingEnd.set(ctx.s, runtime.active);
    else emit(ctx, "BattleEnd", runtime.outcome);
  }
  return runtime.outcome;
}
// 暫態旗標（不進 BattleState、不進存檔）：只在 deferBattleEnd 包住的同步結算期間有效。
const deferring = new WeakSet<BattleState>(), pendingEnd = new WeakMap<BattleState, string | null>();
export function deferBattleEnd<T>(ctx: Ctx, fn: () => T): T {
  if (deferring.has(ctx.s)) return fn();
  deferring.add(ctx.s);
  try { return fn(); }
  finally {
    deferring.delete(ctx.s);
    const runtime = rt(ctx.s);
    if (pendingEnd.has(ctx.s) && runtime.outcome) {
      // 事件的 turn 沿用定局當下的行動者（與即時寫入時相同）。
      const active = runtime.active;
      runtime.active = pendingEnd.get(ctx.s)!;
      emit(ctx, "BattleEnd", runtime.outcome);
      runtime.active = active;
    }
    pendingEnd.delete(ctx.s);
  }
}

onSignal("roundEnd", "people.objectives.round", 100, ctx => { evaluateObjectives(ctx, true); });
onSignal("unitDied", "people.objectives.death", 100, ctx => { evaluateObjectives(ctx, false); });
onSignal("unitRemoved", "people.objectives.removal", 100, ctx => { evaluateObjectives(ctx, false); });
