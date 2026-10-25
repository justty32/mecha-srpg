import type { Id } from "../core/ids.ts";
import type { PoolDecl, PoolId } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { emit, evalCtxFor, frameView, person, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { statValue } from "./contribs.ts";
import type { Owner } from "./contribs.ts";
import { applyEffect, removeBySource } from "./effects.ts";
import { signal } from "./hooks.ts";

function container(ctx: Ctx, owner: Owner) { return "person" in owner ? person(ctx, owner.person) : unit(ctx, owner.unit); }
function ownerId(owner: Owner): Id { return "person" in owner ? owner.person : owner.unit; }
export function poolDecls(ctx: Ctx, owner: Owner): PoolDecl[] {
  if ("person" in owner) return [...ctx.db.require("person", person(ctx, owner.person).def).pools];
  const u = unit(ctx, owner.unit), decls = [...frameView(ctx, owner.unit).pools];
  const components = Object.keys(u.parts).sort().flatMap(part => {
    const p = u.parts[part]!;
    const slots = Object.keys(p.components).sort().filter(slot => p.components[slot]);
    const withHp = slots.filter(slot => ctx.db.require("component", p.components[slot]!).hp !== undefined);
    return slots.flatMap(slot => {
      const def = ctx.db.require("component", p.components[slot]!);
      const index = withHp.indexOf(slot);
      const layer = index < 0 ? undefined : p.layers[p.layers.length - withHp.length + index];
      return p.broken || layer?.broken ? [] : [{ slot, def }];
    });
  }).sort((a, b) => a.slot < b.slot ? -1 : a.slot > b.slot ? 1 : 0);
  for (const c of components) decls.push(...c.def.pools);
  if (u.crew) for (const d of ctx.db.rules.cockpit?.crewPools[u.crew] ?? []) {
    if (!decls.some(existing => existing.id === d.id)) decls.push(d);
  }
  const merged = new Map<PoolId, PoolDecl>();
  for (const d of decls) {
    const old = merged.get(d.id);
    // SPEC-GAP：同名池除 max/regen 相加外，其餘欄位採第一個宣告。
    merged.set(d.id, old ? { ...old, max: old.max === null || d.max === null ? null : { sum: [old.max, d.max] },
      regen: { sum: [old.regen, d.regen] } } : { ...d });
  }
  return [...merged.keys()].sort().map(id => merged.get(id)!);
}
export function recomputePool(ctx: Ctx, owner: Owner, pool: PoolId): void {
  const state = container(ctx, owner), p = state.pools[pool];
  if (!p) return;
  const d = poolDecls(ctx, owner).find(d => d.id === pool);
  // SPEC-GAP：唯一供應部件毀損時保留池記錄，max/regen 歸零；夾限政策沿用原宣告。
  const fallback = d ?? ("unit" in owner ? Object.keys(unit(ctx, owner.unit).parts).sort().flatMap(part => {
    const components = unit(ctx, owner.unit).parts[part]!.components;
    return Object.keys(components).sort().flatMap(slot => components[slot] ? ctx.db.require("component", components[slot]!).pools : []);
  }).find(d => d.id === pool) : undefined);
  const ev = evalCtxFor(ctx, owner);
  p.max = statValue(d ? d.max === null ? Infinity : evalNum(d.max, ev) : 0, state.contribs, `self.pools.${pool}.max`);
  p.regen = statValue(d ? evalNum(d.regen, ev) : 0, state.contribs, `self.pools.${pool}.regen`);
  if (fallback?.capKind === "hard") p.cur = Math.max(fallback.min, Math.min(p.max, p.cur));
}
function depleted(ctx: Ctx, owner: Owner, d: PoolDecl): void {
  for (const effect of d.onDepleted ?? []) applyEffect(ctx, effect, owner, `depleted:${ownerId(owner)}:${d.id}`);
  // SPEC-GAP：維持能力的鎖與來源格式未在 core 契約定義；removeOnZero 由能力線訂閱此信號撤除。
  signal(ctx, "poolDepleted", { owner: ownerId(owner), kind: "person" in owner ? "person" : "unit", pool: d.id });
}
export function changePool(ctx: Ctx, owner: Owner, pool: PoolId, delta: number, reason: string): number {
  const p = container(ctx, owner).pools[pool], d = poolDecls(ctx, owner).find(d => d.id === pool);
  if (!p || !d) throw new Error(`缺少池：${ownerId(owner)}.${pool}`);
  const from = p.cur;
  p.cur = Math.max(d.min, d.capKind === "hard" ? Math.min(p.max, from + delta) : from + delta);
  const to = p.cur;
  emit(ctx, "PoolChanged", { owner: ownerId(owner), pool, from, to, reason });
  updateBand(ctx, owner, pool);
  if (from > d.min && to <= d.min) depleted(ctx, owner, d);
  return to - from;
}
export function updateBand(ctx: Ctx, owner: Owner, pool: PoolId): void {
  const p = container(ctx, owner).pools[pool], d = poolDecls(ctx, owner).find(d => d.id === pool);
  if (!p) return;
  const ev = evalCtxFor(ctx, owner);
  const band = d?.bands.findIndex(b => evalNum(b.from, ev) <= p.cur && (b.to === null || p.cur < evalNum(b.to, ev))) ?? -1;
  if (p.band === band) return;
  p.band = band;
  const source = `band:${ownerId(owner)}:${pool}`;
  removeBySource(ctx, source);
  for (const effect of d?.bands[band]?.effects ?? []) applyEffect(ctx, effect, owner, source);
}
export type Cost = { owner: "mech" | "person"; pool: PoolId; amount: number; allowOverload?: boolean };
function costOwner(ctx: Ctx, unitId: Id, personId: Id | null, cost: Cost): Owner | null {
  // 本能與無人控制沒有指令權者，人物成本由機體同名池支付。
  return cost.owner === "mech" || ["instinct", "scripted"].includes(unit(ctx, unitId).controlMode)
    ? { unit: unitId } : personId === null ? null : { person: personId };
}
export function canPay(ctx: Ctx, unitId: Id, personId: Id | null, costs: Cost[]): boolean {
  const balances = new Map<string, number>();
  for (const cost of costs) {
    const owner = costOwner(ctx, unitId, personId, cost);
    if (!owner || !Number.isFinite(cost.amount) || cost.amount < 0) return false;
    const p = container(ctx, owner).pools[cost.pool], d = poolDecls(ctx, owner).find(d => d.id === cost.pool);
    if (!p || !d) return false;
    const key = JSON.stringify(["person" in owner ? "person" : "mech", ownerId(owner), cost.pool]), cur = balances.get(key) ?? p.cur;
    const next = cur + (d.inverted ? cost.amount : -cost.amount);
    if (d.inverted ? next > p.max && !(cost.allowOverload && d.capKind === "soft") : next < d.min) return false;
    balances.set(key, next);
  }
  return true;
}
export function pay(ctx: Ctx, unitId: Id, personId: Id | null, costs: Cost[], reason: string): void {
  if (!canPay(ctx, unitId, personId, costs)) throw new Error("成本不可支付");
  for (const cost of costs) {
    const owner = costOwner(ctx, unitId, personId, cost)!;
    const d = poolDecls(ctx, owner).find(d => d.id === cost.pool)!;
    changePool(ctx, owner, cost.pool, d.inverted ? cost.amount : -cost.amount, reason);
  }
}
export function regenTick(ctx: Ctx, owner: Owner): void {
  for (const d of poolDecls(ctx, owner).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) {
    const p = container(ctx, owner).pools[d.id];
    if (!p) continue;
    const from = p.cur;
    p.cur += p.regen;
    if (d.decayCurve) {
      const ev = evalCtxFor(ctx, owner);
      p.cur += (evalNum(d.decayCurve.baseline, ev) - p.cur) * evalNum(d.decayCurve.rate, ev);
    }
    p.cur = Math.max(d.min, d.capKind === "hard" ? Math.min(p.cur, p.max) : p.cur);
    emit(ctx, "PoolChanged", { owner: ownerId(owner), pool: d.id, from, to: p.cur, reason: "regen" });
    updateBand(ctx, owner, d.id);
    if (p.cur <= d.min) depleted(ctx, owner, d);
  }
}
