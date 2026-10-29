import type { CellKey, Id } from "../core/ids.ts";
import { cellKey } from "../core/ids.ts";
import type { Cell, LocomotionClass, TerrainDef } from "../core/types-def.ts";
import { evalCond, evalNum } from "../core/numexpr.ts";
import { cloneBattleState } from "../core/clone-state.ts";
import { commanderOf, constant, distance, emit, evalCtxFor, frameView, hostile, inBounds, isActive, layerDefs, partDefs, person, rt, seatsOf, terrainAt, unit, unitAt } from "./state.ts";
import type { Ctx } from "./state.ts";
import { applyEffect, hasEffectTag } from "./effects.ts";
import { dispatchHook } from "./hooks.ts";
import { canPay, pay, poolDecls } from "./pools.ts";
import type { Cost } from "./pools.ts";
import { abilitiesOf, checkAbility, resolveCosts } from "./command.ts";
import { resolveAbility } from "./attack.ts";

export function locomotionOf(ctx: Ctx, unitId: Id): LocomotionClass | null {
  const parts = partDefs(ctx, unitId), u = unit(ctx, unitId);
  const preferred = frameView(ctx, unitId).tags.find(t => Object.hasOwn(ctx.db.registries.locomotion, t)) ?? "leg";
  if (parts.some(p => p.mobility !== undefined)) {
    const available = parts.filter(p => !u.parts[p.id]!.broken).flatMap(p => p.mobility ?? []);
    const minimum = ctx.db.require("bodyplan", frameView(ctx, unitId).bodyPlan).mobilityMinimum ?? {};
    const valid = [...new Set(available)].filter(kind => available.filter(c => c === kind).length >= (minimum[kind] ?? 1));
    return valid.includes(preferred) ? preferred : valid[0] ?? null;
  }
  // 舊bodyplan未宣告mobility時沿用locomotion功能，不改舊內容。
  return parts.some(p => p.functions.includes("locomotion") && !u.parts[p.id]!.broken) ? preferred : null;
}

export type MovementBudget = { base: number; mass: number; capacity: number | null; loadPenalty: number; integrity: number;
  effective: number; spent: number; remaining: number; apRemaining: number; reachableBudget: number };

/** 同一回合的總移動額度與實際消耗；AP回復不會回復此額度。 */
export function movementBudget(ctx: Ctx, id: Id): MovementBudget {
  const u = unit(ctx, id), frame = frameView(ctx, id), constants = ctx.db.rules.constants;
  const base = frame.moveBudget ?? constants.moveBudgetDefault ?? 4;
  const capacity = frame.moveLoadCapacity ?? null;
  const mass = Object.values(u.parts).reduce((total, part) => total + Object.values(part.components).reduce((n, component) => n + (component ? ctx.db.require("component", component).mass : 0), 0), 0);
  const loadPenalty = capacity === null ? 0 : Math.ceil(Math.max(0, mass - capacity) / Math.max(Number.EPSILON, constants.moveLoadStep ?? 5));
  const loco = locomotionOf(ctx, id) ?? frame.tags.find(tag => Object.hasOwn(ctx.db.registries.locomotion, tag)) ?? "leg";
  const parts = partDefs(ctx, id), explicit = parts.some(part => part.mobility !== undefined);
  const movers = parts.filter(part => explicit ? part.mobility?.includes(loco) : part.functions.includes("locomotion"));
  let current = 0, maximum = 0;
  for (const part of movers) for (const [index, layer] of layerDefs(ctx, id, part.id).entries()) if (layer.structural) {
    maximum += layer.hp;
    current += Math.max(0, Math.min(layer.hp, u.parts[part.id]!.layers[index]!.hp));
  }
  const integrity = maximum > 0 ? Math.max(0, Math.min(1, current / maximum)) : 1;
  const effective = canMove(ctx, id) ? Math.floor(Math.max(0, base - loadPenalty) * (0.5 + 0.5 * integrity)) : 0;
  const spent = u.moveSpent ?? 0, remaining = Math.max(0, effective - spent);
  const pid = commanderOf(ctx, id), mechOwner = !pid || ["scripted", "instinct"].includes(u.controlMode);
  const owner = mechOwner ? { unit: id } : { person: pid! }, pools = mechOwner ? u.pools : person(ctx, pid!).pools;
  const pool = pools.ap, decl = poolDecls(ctx, owner).find(d => d.id === "ap");
  const apRemaining = !pool || !decl ? 0 : Math.max(0, decl.inverted ? pool.max - pool.cur : pool.cur - decl.min);
  return { base, mass, capacity, loadPenalty, integrity, effective, spent, remaining, apRemaining, reachableBudget: Math.min(remaining, apRemaining) };
}

function terrainCost(ctx: Ctx, loco: LocomotionClass, from: TerrainDef, to: TerrainDef): number | null {
  const cost = to.moveCost[loco];
  return cost === null || cost === undefined ? null : Math.max(1, cost + Math.max(0, to.height - from.height) * constant(ctx, "moveHeightCost"));
}

export function stepCost(ctx: Ctx, unitId: Id, from: Cell, to: Cell): number | null {
  const loco = locomotionOf(ctx, unitId);
  if (!loco || !inBounds(ctx.s, from) || !inBounds(ctx.s, to) || distance(from, to) !== 1) return null;
  const occupant = unitAt(ctx, to);
  if (occupant !== null && occupant !== unitId) return null;
  return terrainCost(ctx, loco, terrainAt(ctx, from), terrainAt(ctx, to));
}

function apCost(ctx: Ctx, id: Id, amount: number): Cost[] {
  return [{ owner: commanderOf(ctx, id) === null ? "mech" : "person", pool: "ap", amount }];
}
function stopped(ctx: Ctx, id: Id): boolean {
  // SPEC-GAP：定身標記採 immobilized／rooted；部位毀損仍由 locomotionOf 判定。
  return !isActive(ctx, id) || locomotionOf(ctx, id) === null || hasEffectTag(ctx, { unit: id }, "immobilized") || hasEffectTag(ctx, { unit: id }, "rooted");
}
/** 可移動功能與狀態資格；不含本次AP餘額，供預付迴避共用。 */
export function canMove(ctx: Ctx, id: Id): boolean { return !stopped(ctx, id); }
function reactions(ctx: Ctx, mover: Id, from: Cell, to: Cell): void {
  for (const enemy of Object.keys(ctx.s.units).sort()) {
    if (!isActive(ctx, enemy) || !hostile(ctx, enemy, mover) || enemy === mover
      || distance(unit(ctx, enemy).pos, from) !== 1 || distance(unit(ctx, enemy).pos, to) <= 1) continue;
    const candidates = abilitiesOf(ctx, enemy).map(id => ctx.db.require("ability", id))
      .filter(a => a.mode === "reaction" && a.trigger?.event === "enemyLeavesAdjacent" && a.tags.includes("melee"))
      .sort((a, b) => {
        const ap = (id: Id) => resolveCosts(ctx, enemy, id).filter(c => c.pool === "ap").reduce((n, c) => n + c.amount, 0);
        return ap(a.id) - ap(b.id) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      });
    for (const a of candidates) {
      const pid = a.actorRole ? seatsOf(ctx, enemy).find(s => s.role === a.actorRole)?.person ?? null : commanderOf(ctx, enemy);
      const ev = evalCtxFor(ctx, { unit: enemy, ...(pid ? { person: pid } : {}) }, { unit: mover });
      const key = `reaction:${enemy}:${a.id}:${a.trigger!.oncePer}`;
      const stamp = a.trigger!.oncePer === "action" ? rt(ctx.s).actionSeq : ctx.s.round;
      if (rt(ctx.s).reactUsed[key] === stamp || (a.trigger!.cond && !evalCond(a.trigger!.cond, ev))) continue;
      // 離格反應在進格後執行，合法距離以離開前的位置判斷；只在副本上做免費 AP 檢查。
      const probe: Ctx = { db: ctx.db, s: cloneBattleState(ctx.s) };
      unit(probe, mover).pos = { ...from };
      const check = checkAbility(probe, enemy, a.id, { unit: mover });
      if (check && check.code !== "cannot-pay") continue;
      const costs = resolveCosts(ctx, enemy, a.id).filter(c => c.pool !== "ap");
      if (!canPay(ctx, enemy, pid, costs)) continue;
      rt(ctx.s).reactUsed[key] = stamp;
      pay(ctx, enemy, pid, costs, "reaction");
      if (a.cooldown !== undefined) unit(ctx, enemy).cooldowns[a.id] = evalNum(a.cooldown, ev);
      rt(ctx.s).reactUsed[`uses:${enemy}:${a.id}`] = (rt(ctx.s).reactUsed[`uses:${enemy}:${a.id}`] ?? 0) + 1;
      emit(ctx, "AbilityUsed", { unit: enemy, ability: a.id, target: mover, part: null });
      resolveAbility(ctx, enemy, a.id, { unit: mover });
      break;
    }
    if (stopped(ctx, mover)) break;
  }
}

export function moveAlong(ctx: Ctx, unitId: Id, path: Cell[]): void {
  for (const to of path) {
    if (stopped(ctx, unitId)) break;
    const u = unit(ctx, unitId), from = { ...u.pos }, amount = stepCost(ctx, unitId, from, to);
    if (amount === null) break;
    const pid = commanderOf(ctx, unitId), costs = apCost(ctx, unitId, amount);
    if ((u.moveSpent ?? 0) + amount > movementBudget(ctx, unitId).effective || !canPay(ctx, unitId, pid, costs)) break;
    pay(ctx, unitId, pid, costs, "move");
    u.moveSpent = (u.moveSpent ?? 0) + amount;
    u.pos = { ...to };
    u.motion = { dx: (u.motion?.dx ?? 0) + to.x - from.x, dy: (u.motion?.dy ?? 0) + to.y - from.y };
    emit(ctx, "Moved", { unit: unitId, from: [from.x, from.y], to: [to.x, to.y], cost: amount });
    for (const ref of terrainAt(ctx, to).onEnter) applyEffect(ctx, ref,
      { unit: unitId, ...(pid ? { person: pid } : {}), cell: to, faction: u.owner }, terrainAt(ctx, to).id);
    dispatchHook(ctx, "onMove", { unit: unitId });
    if (!isActive(ctx, unitId)) break;
    reactions(ctx, unitId, from, to);
  }
}

export function reachable(ctx: Ctx, unitId: Id): Record<CellKey, number> {
  const start = unit(ctx, unitId).pos, result: Record<CellKey, number> = { [cellKey(start.x, start.y)]: 0 };
  if (stopped(ctx, unitId)) return result;
  const budget = movementBudget(ctx, unitId).reachableBudget;
  // 搜尋期間狀態不變；避免每條邊重算機體與全場佔位。
  const loco = locomotionOf(ctx, unitId)!;
  const occupied = new Map<string, Id>();
  for (const id of Object.keys(ctx.s.units).sort()) {
    const status = rt(ctx.s).unitStatus[id], pos = unit(ctx, id).pos, key = cellKey(pos.x, pos.y);
    if ((status === "active" || status === "derelict") && !occupied.has(key)) occupied.set(key, id);
  }
  const terrains = new Map<number, ReturnType<typeof terrainAt>>();
  const terrain = (cell: Cell) => {
    const index = cell.y * ctx.s.map.width + cell.x;
    let value = terrains.get(index);
    if (!value) { value = terrainAt(ctx, cell); terrains.set(index, value); }
    return value;
  };
  const costOf = (from: Cell, to: Cell): number | null => {
    if (!inBounds(ctx.s, from) || !inBounds(ctx.s, to) || distance(from, to) !== 1) return null;
    const occupant = occupied.get(cellKey(to.x, to.y));
    if (occupant !== undefined && occupant !== unitId) return null;
    return terrainCost(ctx, loco, terrain(from), terrain(to));
  };
  const queue = [{ cell: start, cost: 0 }];
  type Entry = typeof queue[number];
  // 與原排序完全相同的優先序，維持等成本格子的插入順序。
  const compare = (a: Entry, b: Entry) => a.cost - b.cost || a.cell.y - b.cell.y || a.cell.x - b.cell.x;
  const push = (entry: Entry) => {
    let i = queue.length;
    queue.push(entry);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (compare(queue[parent]!, entry) <= 0) break;
      queue[i] = queue[parent]!; i = parent;
    }
    queue[i] = entry;
  };
  const pop = (): Entry => {
    const first = queue[0]!, last = queue.pop()!;
    if (queue.length) {
      let i = 0;
      while (i * 2 + 1 < queue.length) {
        let child = i * 2 + 1;
        if (child + 1 < queue.length && compare(queue[child + 1]!, queue[child]!) < 0) child++;
        if (compare(last, queue[child]!) <= 0) break;
        queue[i] = queue[child]!; i = child;
      }
      queue[i] = last;
    }
    return first;
  };
  while (queue.length) {
    const current = pop();
    if (current.cost !== result[cellKey(current.cell.x, current.cell.y)]) continue;
    for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
      const next = { x: current.cell.x + x, y: current.cell.y + y }, cost = costOf(current.cell, next);
      if (cost === null) continue;
      const total = current.cost + cost, key = cellKey(next.x, next.y);
      if (total > budget || total >= (result[key] ?? Infinity)) continue;
      result[key] = total; push({ cell: next, cost: total });
    }
  }
  return result;
}
