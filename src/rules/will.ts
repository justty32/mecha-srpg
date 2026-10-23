import type { Id } from "../core/ids.ts";
import type { ControlMode, ResonanceReq } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { d100 } from "../core/rng.ts";
import type { Ctx } from "./state.ts";
import { commanderOf, constant, evalCtxFor, frameView, person, rt, unit } from "./state.ts";
import { roleAttr } from "./contribs.ts";
import { changePool } from "./pools.ts";
import { onSignal } from "./hooks.ts";
import { applyEffect, removeBySource } from "./effects.ts";
import { setControl } from "./control.ts";

export function resonanceScore(ctx: Ctx, personId: Id, req: ResonanceReq): number {
  const def = ctx.db.require("person", person(ctx, personId).def);
  const beliefs = [...new Set(req.beliefs)].sort();
  const denominator = beliefs.length + (req.deeds?.length ?? 0);
  // SPEC-GAP：凍結 WillState 沒有 deeds/rejects；deeds 未完成，不推測戰績。
  if (!denominator) return 1;
  const score = beliefs.reduce((sum, belief) => sum + Number(def.will.beliefs.includes(belief)) + (def.will.resonanceAffinity?.[belief] ?? 0), 0);
  return Math.max(0, Math.min(1, score / denominator));
}

export function refreshResonance(ctx: Ctx, unitId: Id): void {
  const commander = commanderOf(ctx, unitId);
  if (!commander) return;
  const u = unit(ctx, unitId), f = frameView(ctx, unitId), p = person(ctx, commander);
  p.will.resonance[u.frame] = f.resonance ? resonanceScore(ctx, commander, f.resonance) : 0;
  for (const part of Object.keys(u.parts).sort()) for (const slot of Object.keys(u.parts[part]!.components).sort()) {
    const id = u.parts[part]!.components[slot];
    if (!id) continue;
    const c = ctx.db.require("component", id);
    if (c.resonance) p.will.resonance[id] = resonanceScore(ctx, commander, c.resonance);
  }
}

export function burdenOf(ctx: Ctx, unitId: Id): number {
  const u = unit(ctx, unitId), commander = commanderOf(ctx, unitId);
  const ev = evalCtxFor(ctx, { unit: unitId, ...(commander ? { person: commander } : {}) });
  let value = evalNum(frameView(ctx, unitId).burden ?? 0, ev);
  for (const part of Object.keys(u.parts).sort()) {
    const p = u.parts[part]!;
    if (p.broken) continue;
    const slots = Object.keys(p.components).sort().filter(s => p.components[s]);
    const withHp = slots.filter(s => ctx.db.require("component", p.components[s]!).hp !== undefined);
    for (const slot of slots) {
      const index = withHp.indexOf(slot);
      if (index >= 0 && p.layers[p.layers.length - withHp.length + index]?.broken) continue;
      value += evalNum(ctx.db.require("component", p.components[slot]!).burden ?? 0, ev);
    }
  }
  return value;
}

export function goBerserk(ctx: Ctx, unitId: Id): void {
  const u = unit(ctx, unitId), runtime = rt(ctx.s);
  if (Object.hasOwn(runtime.berserkFrom, unitId)) return;
  runtime.berserkFrom[unitId] = u.owner;
  setControl(ctx, unitId, "berserk", "burden");
  u.owner = "berserk";
  applyEffect(ctx, "effect/berserk", { unit: unitId }, `berserk:${unitId}`);
}

export function recoverBerserk(ctx: Ctx, unitId: Id): void {
  const runtime = rt(ctx.s), from = runtime.berserkFrom[unitId];
  if (from === undefined) return;
  unit(ctx, unitId).owner = from;
  delete runtime.berserkFrom[unitId];
  removeBySource(ctx, `berserk:${unitId}`);
  // SPEC-GAP：runtime 只保存原 owner；從既有事件取回原模式，不加凍結欄位。
  const event = ctx.s.log.events.findLast(e => e.type === "ControlChanged" && e.payload.unit === unitId && e.payload.to === "berserk");
  setControl(ctx, unitId, (event?.payload.from as ControlMode | undefined) ?? "pilot", "recovered");
}

export function burdenTick(ctx: Ctx, unitId: Id): void {
  const commander = commanderOf(ctx, unitId);
  if (!commander) return;
  const p = person(ctx, commander), pool = p.pools.burden;
  if (!pool) return;
  const wasBerserk = Object.hasOwn(rt(ctx.s).berserkFrom, unitId);
  changePool(ctx, { person: commander }, "burden", burdenOf(ctx, unitId), "burden");
  p.will.burden = pool.cur;
  const limit = pool.max, resolve = roleAttr(ctx, { person: commander, unit: unitId }, "resolve");
  if (wasBerserk) {
    if (pool.cur < limit || d100(ctx.s.rng) < resolve) recoverBerserk(ctx, unitId);
  } else if (pool.cur >= 1.5 * limit || (pool.cur >= limit && d100(ctx.s.rng) >= resolve - (pool.cur - limit) / limit * constant(ctx, "berserkCheckK"))) {
    goBerserk(ctx, unitId);
  }
}

onSignal("turnStartPre", "people.will.resonance", 20, (ctx, p) => { if (typeof p.unit === "string") refreshResonance(ctx, p.unit); });
onSignal("turnStartPost", "people.will.burden", 0, (ctx, p) => { if (typeof p.unit === "string" && !p.resumed) burdenTick(ctx, p.unit); });
