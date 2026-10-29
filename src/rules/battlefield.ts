import { cloneBattleState } from "../core/clone-state.ts";
import type { Id } from "../core/ids.ts";
import { cellKey } from "../core/ids.ts";
import type { Cell } from "../core/types-def.ts";
import type { Ctx, Rejection } from "./state.ts";
import { resistance } from "./resistance.ts";
import { roleAttr } from "./contribs.ts";
import { applyPacket, isDead } from "./layers.ts";
import { damageFactor, killUnit, pickPart } from "./attack.ts";
import { commanderOf, distance, emit, hostile, inBounds, isActive, partDefs, rt, terrainAt, unit } from "./state.ts";
import { applyEffect } from "./effects.ts";
import { canPay, pay } from "./pools.ts";

/** 物件不佔地形格；拒絕時完全不變更 AP、RNG、日誌或物件。 */
export function interact(ctx: Ctx, actor: Id, objectId: string): Rejection | null {
  // 完整預演效果與資源鉤子，任何失效引用／缺池均在扣費之前拒絕。
  try {
    const rejected = executeInteract({ db: ctx.db, s: cloneBattleState(ctx.s) }, actor, objectId);
    if (rejected) return rejected;
  } catch { return { code: "bad-target", detail: "invalid-object-effect" }; }
  return executeInteract(ctx, actor, objectId);
}
function executeInteract(ctx: Ctx, actor: Id, objectId: string): Rejection | null {
  if (!ctx.s.units[actor]) return { code: "bad-actor" };
  if (!isActive(ctx, actor) || rt(ctx.s).active !== actor) return { code: "not-active" };
  const object = ctx.s.map.objects?.find(o => o.id === objectId);
  if (!object || !inBounds(ctx.s, object.at) || object.collected || (!object.effects?.length && !object.debris && !Object.values(object.salvage ?? {}).some(n => n > 0))) return { code: "bad-target" };
  const u = unit(ctx, actor), pid = commanderOf(ctx, actor);
  if (object.debris && !hasManipulator(ctx, actor)) return { code: "require-failed", detail: "no-manipulator" };
  if (distance(u.pos, object.at) > 1) return { code: "out-of-range" };
  if (["none", "disabled"].includes(u.controlMode)) return { code: "no-commander" };
  const cost = [{ owner: "person" as const, pool: "ap", amount: ctx.db.rules.constants.battlefieldInteractApCost ?? 1 }];
  if (!pid || !canPay(ctx, actor, pid, cost)) return { code: "cannot-pay" };
  for (const ref of object.effects ?? []) {
    const effect = ctx.db.get("effect", typeof ref === "string" ? ref : ref.effect);
    if (!effect || ["part", "layer"].includes(effect.scope)) return { code: "bad-target" };
  }
  const resupply = (object.effects ?? []).some(ref => (typeof ref === "string" ? ref : ref.effect).endsWith("effect/battlefield-resupply"));
  if (resupply && (!u.pools.charge || u.pools.charge.cur >= u.pools.charge.max) && !object.debris && !Object.values(object.salvage ?? {}).some(n => n > 0)) return { code: "bad-target", detail: "resupply-unneeded" };
  rt(ctx.s).actionSeq++;
  pay(ctx, actor, pid, cost, "interact");
  for (const ref of object.effects ?? []) applyEffect(ctx, ref, { unit: actor, person: pid, cell: object.at, faction: u.owner }, actor);
  if (object.debris) (ctx.s.map.debrisAmmo ??= {})[actor] = (ctx.s.map.debrisAmmo?.[actor] ?? 0) + object.debris;
  if (object.salvage) (ctx.s.map.salvage ??= []).push({ object: object.id, ...(object.sourceUnit ? { fromUnit: object.sourceUnit } : {}), owner: u.owner, materials: { ...object.salvage } });
  object.collected = true;
  emit(ctx, "BattlefieldObjectCollected", { unit: actor, object: object.id, x: object.at.x, y: object.at.y });
  return null;
}

export function damageTerrain(ctx: Ctx, at: Cell, amount: number, actor: Id): void {
  const terrain = terrainAt(ctx, at), destructible = terrain.destructible;
  if (!destructible || amount <= 0) return;
  const key = cellKey(at.x, at.y), hp = Math.max(0, (ctx.s.map.featureHp[key] ?? destructible.hp) - amount);
  ctx.s.map.featureHp[key] = hp;
  emit(ctx, "FeatureDamaged", { unit: actor, x: at.x, y: at.y, terrain: terrain.id, amount, hp });
  if (hp > 0) return;
  const next = ctx.db.require("terrain", destructible.becomes);
  ctx.s.map.terrain[at.y * ctx.s.map.width + at.x] = next.id;
  delete ctx.s.map.featureHp[key];
  if (next.destructible) ctx.s.map.featureHp[key] = next.destructible.hp;
  const objectId = `debris:${key}`;
  const objects = ctx.s.map.objects ??= [];
  if (!objects.some(o => o.id === objectId)) objects.push({ id: objectId, name: "崩塌碎石", kind: "debris", at: { ...at }, debris: ctx.db.rules.constants.battlefieldDebrisCount ?? 1 });
  emit(ctx, "FeatureDestroyed", { unit: actor, x: at.x, y: at.y, from: terrain.id, to: next.id });
}

export function leaveRemains(ctx: Ctx, id: Id): void {
  const u = unit(ctx, id);
  if (u.frame === ctx.db.get("frame", "frame/infantry")?.id || ctx.db.get("frame", u.frame)?.tags.includes("infantry")) return;
  const objects = ctx.s.map.objects ??= [];
  if (objects.some(o => o.sourceUnit === id)) return;
  const kind = rt(ctx.s).monsters[id] ? "corpse" : "wreck";
  let objectId = `remains:${id}`;
  while (objects.some(o => o.id === objectId)) objectId += ":1";
  objects.push({ id: objectId, name: kind === "corpse" ? "遺骸" : "機體殘骸", kind, at: { ...u.pos }, sourceUnit: id, salvage: { [kind === "corpse" ? "stock:flesh" : "stock:scrap"]: ctx.db.rules.constants[kind === "corpse" ? "battlefieldCorpseSalvage" : "battlefieldWreckSalvage"] ?? 5 } });
}

function hasManipulator(ctx: Ctx, actor: Id): boolean {
  return partDefs(ctx, actor).some(part => part.functions.includes("manipulator") && !unit(ctx, actor).parts[part.id]!.broken);
}

export function throwDebris(ctx: Ctx, actor: Id, target: Id): Rejection | null {
  if (!hasManipulator(ctx, actor)) return { code: "require-failed", detail: "no-manipulator" };
  if (!ctx.s.units[target] || !isActive(ctx, target) || !hostile(ctx, actor, target)) return { code: "bad-target" };
  const u = unit(ctx, actor), pid = commanderOf(ctx, actor);
  // 以規則狀態重算與情報層相同的共享視距，不依賴session的快照更新（重播也一致）。
  if (ctx.s.knowledge[u.owner] && !Object.keys(ctx.s.units).some(observer => {
    if (!isActive(ctx, observer) || unit(ctx, observer).owner !== u.owner) return false;
    const commander = commanderOf(ctx, observer);
    return distance(unit(ctx, observer).pos, unit(ctx, target).pos) <= roleAttr(ctx, { unit: observer, ...(commander ? { person: commander } : {}) }, "perception");
  })) return { code: "bad-target" };
  if (distance(u.pos, unit(ctx, target).pos) > (ctx.db.rules.constants.battlefieldDebrisRange ?? 3)) return { code: "out-of-range" };
  const to = unit(ctx, target).pos;
  let x = u.pos.x, y = u.pos.y;
  const dx = Math.abs(to.x - x), dy = -Math.abs(to.y - y), sx = x < to.x ? 1 : -1, sy = y < to.y ? 1 : -1;
  let error = dx + dy;
  while (x !== to.x || y !== to.y) {
    const twice = error * 2;
    if (twice >= dy) { error += dy; x += sx; }
    if (twice <= dx) { error += dx; y += sy; }
    if ((x !== to.x || y !== to.y) && terrainAt(ctx, { x, y }).blocksLos) return { code: "no-los" };
  }
  if ((ctx.s.map.debrisAmmo?.[actor] ?? 0) < 1) return { code: "cannot-pay", detail: "debris" };
  const cost = [{ owner: "person" as const, pool: "ap", amount: ctx.db.rules.constants.battlefieldDebrisApCost ?? 1 }];
  if (!pid || !canPay(ctx, actor, pid, cost)) return { code: "cannot-pay" };
  const part = pickPart(ctx, target);
  rt(ctx.s).actionSeq++;
  pay(ctx, actor, pid, cost, "throwDebris");
  ctx.s.map.debrisAmmo![actor]!--;
  // 無能力的物理投擲沿用機體精粹／凡鐵判定、全局倍率與可觸及層，不繞過巨獸抵抗性。
  const reach = resistance(ctx, actor, null, target)?.reach;
  const amount = (ctx.db.rules.constants.battlefieldDebrisDamage ?? 12) * damageFactor(ctx, actor, null, target);
  applyPacket(ctx, target, part, { type: "kinetic", amount, armorPen: 0, resistPen: 0, ...(reach ? { reach } : {}) }, actor);
  emit(ctx, "DebrisThrown", { unit: actor, target, part });
  if (isActive(ctx, target) && isDead(ctx, target)) killUnit(ctx, target, actor);
  return null;
}
