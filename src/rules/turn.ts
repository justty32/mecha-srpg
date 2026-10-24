import type { Id } from "../core/ids.ts";
import type { BattleState } from "../core/types-state.ts";
import { evalNum } from "../core/numexpr.ts";
import { commanderOf, constant, emit, evalCtxFor, isActive, layerDefs, person, rt, seatsOf, terrainAt, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { roleAttr } from "./contribs.ts";
import { applyEffect, tickEffects } from "./effects.ts";
import { dispatchHook, signal } from "./hooks.ts";
import { canPay, changePool, pay, regenTick } from "./pools.ts";

export function initiativeOf(ctx: Ctx, unitId: Id): number {
  const pid = commanderOf(ctx, unitId);
  const fatigue = pid ? person(ctx, pid).pools.fatigue?.cur ?? 0 : unit(ctx, unitId).pools.fatigue?.cur ?? 0;
  // roleAttr 已合併機體屬性與 contribs，不重複加 frame.baseAttrs。
  return roleAttr(ctx, { unit: unitId, ...(pid ? { person: pid } : {}) }, "initiative") - fatigue * constant(ctx, "fatigueInitiativeK");
}
export function computeOrder(ctx: Ctx): Id[] {
  return Object.keys(ctx.s.units).sort().filter(id => isActive(ctx, id))
    .sort((a, b) => initiativeOf(ctx, b) - initiativeOf(ctx, a) || (a < b ? -1 : a > b ? 1 : 0));
}
export function startBattle(ctx: Ctx): void {
  emit(ctx, "BattleStart", { units: Object.keys(ctx.s.units).sort() });
  startRound(ctx);
}
export function startRound(ctx: Ctx): void {
  const runtime = rt(ctx.s);
  if (runtime.outcome) { runtime.active = null; return; }
  runtime.active = null;
  ctx.s.round++;
  runtime.acted = []; runtime.waited = []; runtime.waitUsed = [];
  emit(ctx, "RoundStart", { round: ctx.s.round });
  for (const id of Object.keys(ctx.s.units).sort()) tickEffects(ctx, "rounds", { unit: id });
  for (const id of Object.keys(ctx.s.persons).sort()) tickEffects(ctx, "rounds", { person: id });
  tickEffects(ctx, "rounds", "field");
  signal(ctx, "roundStart", { round: ctx.s.round });
  ctx.s.order = computeOrder(ctx);
  if (runtime.outcome) return;
  const first = ctx.s.order[0];
  if (first) beginTurn(ctx, first, false);
}
export function beginTurn(ctx: Ctx, unitId: Id, resumed: boolean): void {
  const runtime = rt(ctx.s);
  if (runtime.outcome) { runtime.active = null; return; }
  runtime.active = unitId;
  emit(ctx, "TurnStart", { unit: unitId, resumed });
  if (!resumed) {
    signal(ctx, "turnStartPre", { unit: unitId });
    dispatchHook(ctx, "onTurnStart", { unit: unitId });
    for (const seat of seatsOf(ctx, unitId)) dispatchHook(ctx, "onTurnStart", { person: seat.person });
    const u = unit(ctx, unitId), terrain = terrainAt(ctx, u.pos), pid = commanderOf(ctx, unitId);
    for (const effect of terrain.onTurnStart) applyEffect(ctx, effect,
      { unit: unitId, ...(pid ? { person: pid } : {}), cell: u.pos, faction: u.owner }, terrain.id);
    tickEffects(ctx, "ownerTurns", { unit: unitId });
    for (const seat of seatsOf(ctx, unitId)) tickEffects(ctx, "ownerTurns", { person: seat.person });
    regenTick(ctx, { unit: unitId });
    for (const seat of seatsOf(ctx, unitId)) regenTick(ctx, { person: seat.person });
    for (const id of Object.keys(u.cooldowns).sort()) u.cooldowns[id] = Math.max(0, u.cooldowns[id]! - 1);
    for (const part of Object.keys(u.parts).sort()) {
      const state = u.parts[part]!, defs = layerDefs(ctx, unitId, part);
      for (const [i, def] of defs.entries()) {
        if (def.regen === undefined) continue;
        const layer = state.layers[i]!, ev = evalCtxFor(ctx, { unit: unitId });
        let amount = Math.min(def.hp - layer.hp, Math.max(0, evalNum(def.regen, ev)));
        if (def.regenPool) amount = Math.min(amount, u.pools[def.regenPool]?.cur ?? 0);
        if (amount <= 0) continue;
        if (def.regenPool) changePool(ctx, { unit: unitId }, def.regenPool, -amount, "layer-regen");
        layer.hp += amount; layer.broken = layer.hp <= 0;
      }
    }
  }
  signal(ctx, "turnStartPost", { unit: unitId, resumed });
  if (runtime.outcome) { runtime.active = null; return; }
  if (!isActive(ctx, unitId) || ["none", "disabled"].includes(unit(ctx, unitId).controlMode)) endTurn(ctx);
}
export function endTurn(ctx: Ctx): void {
  const runtime = rt(ctx.s), id = runtime.active;
  if (id === null) return;
  // 戰局已定（撤離／死亡觸發勝負）後不再跑回合末鉤子或寫事件：BattleEnd 必為最後一筆。
  if (runtime.outcome) { runtime.active = null; return; }
  const u = unit(ctx, id);
  dispatchHook(ctx, "onTurnEnd", { unit: id });
  for (const seat of seatsOf(ctx, id)) dispatchHook(ctx, "onTurnEnd", { person: seat.person });
  for (const aid of [...u.sustained].sort()) {
    const a = ctx.db.require("ability", aid);
    const pid = a.actorRole ? seatsOf(ctx, id).find(s => s.role === a.actorRole)?.person ?? null : commanderOf(ctx, id);
    const ev = evalCtxFor(ctx, { unit: id, ...(pid ? { person: pid } : {}) });
    const costs = (a.sustain?.drain ?? []).map(c => ({ ...c, amount: evalNum(c.amount, ev) }));
    if (canPay(ctx, id, pid, costs)) pay(ctx, id, pid, costs, "sustain-drain");
    else signal(ctx, "poolDepleted", { owner: id, kind: "unit", pool: costs[0]?.pool ?? "" });
  }
  signal(ctx, "turnEnd", { unit: id });
  emit(ctx, "TurnEnd", { unit: id });
  if (!runtime.acted.includes(id)) runtime.acted.push(id);
  runtime.active = null;
  advance(ctx);
}

const advancing = new WeakSet<BattleState>();
export function advance(ctx: Ctx): void {
  const runtime = rt(ctx.s);
  if (runtime.outcome) { runtime.active = null; return; }
  if (advancing.has(ctx.s)) return;
  advancing.add(ctx.s);
  try {
    while (!runtime.outcome) {
      // 輪中生成的單位只追加隊尾，不重新排序。
      for (const id of Object.keys(ctx.s.units).sort()) if (isActive(ctx, id) && !ctx.s.order.includes(id)) ctx.s.order.push(id);
      const next = ctx.s.order.find(id => isActive(ctx, id) && !runtime.acted.includes(id));
      if (next) {
        const resumed = runtime.waited.includes(next);
        runtime.waited = runtime.waited.filter(id => id !== next);
        beginTurn(ctx, next, resumed);
        if (runtime.active !== null) return;
      } else {
        runtime.active = null;
        emit(ctx, "RoundEnd", { round: ctx.s.round });
        signal(ctx, "roundEnd", { round: ctx.s.round });
        if (runtime.outcome) return;
        // SPEC-GAP：無可接受指令單位、且無人物線定局時停在輪末，避免無限遞迴空轉。
        // 有 maxRounds 時照輪推進（停機單位可能在自己 TurnStart 回穩，到上限必以 timeout 定局），只有無上限時才停。
        if (rt(ctx.s).maxRounds === null && !Object.keys(ctx.s.units).sort().some(id => isActive(ctx, id) && !["none", "disabled"].includes(unit(ctx, id).controlMode))) return;
        startRound(ctx);
        if (runtime.active !== null) return;
      }
    }
    runtime.active = null;
  } finally { advancing.delete(ctx.s); }
}
export function currentActor(s: BattleState): Id | null { return rt(s).active; }
