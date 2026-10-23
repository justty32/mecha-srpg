import type { CellKey, Id } from "../core/ids.ts";
import { cellKey } from "../core/ids.ts";
import type { Cell, LocomotionClass } from "../core/types-def.ts";
import { evalCond, evalNum } from "../core/numexpr.ts";
import { commanderOf, constant, distance, emit, evalCtxFor, frameView, hostile, inBounds, isActive, partDefs, person, rt, seatsOf, terrainAt, unit, unitAt } from "./state.ts";
import type { Ctx } from "./state.ts";
import { applyEffect, hasEffectTag } from "./effects.ts";
import { dispatchHook } from "./hooks.ts";
import { canPay, pay, poolDecls } from "./pools.ts";
import type { Cost } from "./pools.ts";
import { abilitiesOf, checkAbility, resolveCosts } from "./command.ts";
import { resolveAbility } from "./attack.ts";

export function locomotionOf(ctx: Ctx, unitId: Id): LocomotionClass | null {
  if (!partDefs(ctx, unitId).some(p => p.functions.includes("locomotion") && !unit(ctx, unitId).parts[p.id]!.broken)) return null;
  // SPEC-GAP（契約）：未標登記類別的機體採 leg。
  return frameView(ctx, unitId).tags.find(t => Object.hasOwn(ctx.db.registries.locomotion, t)) ?? "leg";
}

export function stepCost(ctx: Ctx, unitId: Id, from: Cell, to: Cell): number | null {
  const loco = locomotionOf(ctx, unitId);
  if (!loco || !inBounds(ctx.s, from) || !inBounds(ctx.s, to) || distance(from, to) !== 1) return null;
  const occupant = unitAt(ctx, to);
  if (occupant !== null && occupant !== unitId) return null;
  const terrain = terrainAt(ctx, to), cost = terrain.moveCost[loco];
  if (cost === null || cost === undefined) return null;
  return Math.max(0, cost + Math.max(0, terrain.height - terrainAt(ctx, from).height) * constant(ctx, "moveHeightCost"));
}

function apCost(ctx: Ctx, id: Id, amount: number): Cost[] {
  return [{ owner: commanderOf(ctx, id) === null ? "mech" : "person", pool: "ap", amount }];
}
function stopped(ctx: Ctx, id: Id): boolean {
  // SPEC-GAP：定身標記採 immobilized／rooted；部位毀損仍由 locomotionOf 判定。
  return !isActive(ctx, id) || locomotionOf(ctx, id) === null || hasEffectTag(ctx, { unit: id }, "immobilized") || hasEffectTag(ctx, { unit: id }, "rooted");
}
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
      const probe: Ctx = { db: ctx.db, s: structuredClone(ctx.s) };
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
    if (!canPay(ctx, unitId, pid, costs)) break;
    pay(ctx, unitId, pid, costs, "move");
    u.pos = { ...to };
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
  const pid = commanderOf(ctx, unitId), owner = pid ? { person: pid } : { unit: unitId };
  const pool = pid ? person(ctx, pid).pools.ap : unit(ctx, unitId).pools.ap;
  const decl = poolDecls(ctx, owner).find(d => d.id === "ap");
  if (!pool || !decl) return result;
  const budget = decl.inverted ? pool.max - pool.cur : pool.cur - decl.min;
  const queue = [{ cell: start, cost: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost || a.cell.y - b.cell.y || a.cell.x - b.cell.x);
    const current = queue.shift()!;
    if (current.cost !== result[cellKey(current.cell.x, current.cell.y)]) continue;
    for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
      const next = { x: current.cell.x + x, y: current.cell.y + y }, cost = stepCost(ctx, unitId, current.cell, next);
      if (cost === null) continue;
      const total = current.cost + cost, key = cellKey(next.x, next.y);
      if (total > budget || total >= (result[key] ?? Infinity)) continue;
      result[key] = total; queue.push({ cell: next, cost: total });
    }
  }
  return result;
}
