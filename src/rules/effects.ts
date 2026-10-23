import type { Id } from "../core/ids.ts";
import type { Cell, EffectDef, EffectRef, FactionSlot, PartId } from "../core/types-def.ts";
import type { EffectInstance } from "../core/types-state.ts";
import { evalNum } from "../core/numexpr.ts";
import { chance, d100 } from "../core/rng.ts";
import { addContrib, removeContrib, personAttr, unitAttr } from "./contribs.ts";
import type { Owner } from "./contribs.ts";
import { emit, evalCtxFor, person, personTags, rt, unit, unitTags } from "./state.ts";
import type { Ctx } from "./state.ts";
import { runActions } from "./hooks.ts";

export type EffectTarget = { unit?: Id; person?: Id; part?: PartId; layer?: number; cell?: Cell; faction?: FactionSlot };

function container(ctx: Ctx, scope: EffectDef["scope"], target: EffectTarget): EffectInstance[] {
  if (scope === "person") return person(ctx, target.person!).effects;
  if (scope === "mech" || scope === "part" || scope === "layer") return unit(ctx, target.unit!).effects;
  return rt(ctx.s).fieldEffects;
}
function all(ctx: Ctx): EffectInstance[] {
  return [...Object.keys(ctx.s.units).sort().flatMap(id => unit(ctx, id).effects),
    ...Object.keys(ctx.s.persons).sort().flatMap(id => person(ctx, id).effects), ...rt(ctx.s).fieldEffects]
    .sort((a, b) => a.uid - b.uid);
}
function owner(inst: EffectInstance): Owner | null {
  if (inst.scope === "person") return { person: inst.owner.person! };
  if (["mech", "part", "layer"].includes(inst.scope)) return { unit: inst.owner.unit! };
  return null;
}
function ownerId(inst: EffectInstance): string {
  const o = owner(inst);
  return o ? "person" in o ? o.person : o.unit : "field";
}
function matches(inst: EffectInstance, target: EffectTarget): boolean {
  const o = inst.owner;
  return (target.person === undefined || o.person === target.person)
    && (target.unit === undefined || o.unit === target.unit)
    && (target.part === undefined || o.part === target.part)
    && (target.layer === undefined || o.layer === target.layer)
    && (target.faction === undefined || o.faction === target.faction)
    && (target.cell === undefined || (o.cell?.x === target.cell.x && o.cell?.y === target.cell.y));
}
function install(ctx: Ctx, inst: EffectInstance): void {
  const def = ctx.db.require("effect", inst.effect);
  container(ctx, inst.scope, inst.owner).push(inst);
  const o = owner(inst);
  // SPEC-GAP：field 沒有 contribs 容器，僅執行鉤子與時鐘，不套屬性貢獻。
  if (o) for (const c of def.contribs) inst.contribIds.push(addContrib(ctx, o, { ...c, source: `fx:${inst.uid}` }));
  runActions(ctx, def.hooks.onApply ?? [], { inst, self: inst.owner, source: inst.source });
  emit(ctx, "EffectApplied", { uid: inst.uid, effect: inst.effect, owner: ownerId(inst), part: inst.owner.part ?? null, source: inst.source });
}
export function applyEffect(ctx: Ctx, ref: EffectRef, target: EffectTarget, source: Id): EffectInstance | null {
  const r = typeof ref === "string" ? { effect: ref } : ref;
  const def = ctx.db.require("effect", r.effect), ev = evalCtxFor(ctx, target);
  if (r.chance !== undefined && !chance(ctx.s.rng, evalNum(r.chance, ev))) return null;
  const tags = target.person ? personTags(ctx, target.person) : target.unit ? unitTags(ctx, target.unit) : [];
  if (def.immuneTags?.some(tag => tags.includes(tag))) return null;
  if (def.save) {
    const attr = target.person ? personAttr(ctx, target.person, def.save.attr)
      : target.unit ? unitAttr(ctx, target.unit, def.save.attr) : 0;
    if (d100(ctx.s.rng) < attr - evalNum(def.save.dc, ev)) return null;
  }
  // 容器作用域正規化，避免傳入 unit+person 時混淆人物與機體。
  const location: EffectTarget = def.scope === "person" ? { person: target.person }
    : def.scope === "mech" ? { unit: target.unit }
    : def.scope === "part" ? { unit: target.unit, part: target.part }
    : def.scope === "layer" ? { unit: target.unit, part: target.part, layer: target.layer }
    : def.scope === "cell" ? { cell: target.cell ? { ...target.cell } : undefined }
    : def.scope === "faction" ? { faction: target.faction } : {};
  const list = container(ctx, def.scope, location);
  const same = (e: EffectInstance) => e.uid >= 0 && e.effect === def.id
    && container(ctx, e.scope, e.owner) === list
    && (!def.perPartSeparate || e.owner.part === location.part);
  if (ctx.s.pending.some(same)) return null;
  const existing = list.filter(same).sort((a, b) => a.uid - b.uid), first = existing[0];
  const field = ["cell", "faction", "battle"].includes(def.scope);
  const remaining = !field && ["permanent", "whileSource"].includes(def.clock.kind) ? null : evalNum(def.clock.n ?? 1, ev);
  const magnitude = evalNum(def.magnitude ?? 1, ev);
  if (first) {
    if (def.stack.policy === "ignore") return first;
    if (def.stack.policy === "refresh") { first.remaining = remaining; return first; }
    if (def.stack.policy === "stack" && existing.length >= (def.stack.max ?? Infinity)) return null;
    if (def.stack.policy === "merge") {
      // SPEC-GAP：merge 未指定運算時採 sumMag；量只存 magnitude，不隱式縮放 contribs。
      if (def.stack.mergeOp === "sumDur") first.remaining = first.remaining === null || remaining === null ? null : first.remaining + remaining;
      else if (def.stack.mergeOp === "maxMag") first.magnitude = Math.max(first.magnitude, magnitude);
      else first.magnitude += magnitude;
      first.stacks++;
      return first;
    }
  }
  const inst: EffectInstance = { uid: rt(ctx.s).nextUid++, effect: def.id, source, scope: def.scope,
    owner: location, remaining, magnitude, stacks: 1, contribIds: [] };
  if (r.params) inst.params = Object.fromEntries(Object.keys(r.params).sort().map(key => [key, evalNum(r.params![key]!, ev)]));
  // SPEC-GAP：凍結 runtime 無 dispatch depth 欄；pending 的負 uid 暫存標記只在同步鉤子期間存在。
  if (ctx.s.pending.some(e => e.uid < 0)) ctx.s.pending.push(inst);
  else install(ctx, inst);
  return inst;
}
export function removeEffect(ctx: Ctx, uid: number, reason: string): boolean {
  const pending = ctx.s.pending.findIndex(e => e.uid === uid && e.uid >= 0);
  const inst = all(ctx).find(e => e.uid === uid);
  if (pending >= 0) ctx.s.pending.splice(pending, 1);
  if (!inst) return pending >= 0;
  const list = container(ctx, inst.scope, inst.owner);
  list.splice(list.indexOf(inst), 1);
  const o = owner(inst);
  if (o) for (const id of inst.contribIds) removeContrib(ctx, o, id);
  runActions(ctx, ctx.db.require("effect", inst.effect).hooks.onExpire ?? [], { inst, self: inst.owner, source: inst.source });
  emit(ctx, "EffectExpired", { uid, effect: inst.effect, owner: ownerId(inst), reason });
  return true;
}
export function removeBySource(ctx: Ctx, source: Id): number {
  const instances = [...all(ctx), ...ctx.s.pending.filter(e => e.uid >= 0)].filter(e => e.source === source);
  return instances.reduce((n, e) => n + Number(removeEffect(ctx, e.uid, "source-removed")), 0);
}
export function removeByTags(ctx: Ctx, target: EffectTarget, tags: string[]): number {
  const instances = [...effectsOf(ctx, target), ...ctx.s.pending.filter(e => e.uid >= 0 && matches(e, target))]
    .filter(e => ctx.db.require("effect", e.effect).tags.some(tag => tags.includes(tag)));
  return instances.reduce((n, e) => n + Number(removeEffect(ctx, e.uid, "tags-removed")), 0);
}
export function tickEffects(ctx: Ctx, kind: "ownerTurns" | "rounds", target: EffectTarget | "field"): void {
  const instances = target === "field" ? [...rt(ctx.s).fieldEffects].sort((a, b) => a.uid - b.uid) : effectsOf(ctx, target);
  for (const inst of instances) {
    const field = ["cell", "faction", "battle"].includes(inst.scope);
    if ((field ? "rounds" : ctx.db.require("effect", inst.effect).clock.kind) !== kind || inst.remaining === null) continue;
    if (--inst.remaining <= 0) removeEffect(ctx, inst.uid, "expired");
  }
}
export function consumeUse(ctx: Ctx, uid: number): void {
  const inst = all(ctx).find(e => e.uid === uid);
  if (inst && !["cell", "faction", "battle"].includes(inst.scope)
    && ctx.db.require("effect", inst.effect).clock.kind === "uses" && inst.remaining !== null
    && --inst.remaining <= 0) removeEffect(ctx, uid, "expired");
}
export function effectsOf(ctx: Ctx, target: EffectTarget): EffectInstance[] {
  const instances = target.person ? person(ctx, target.person).effects : target.unit ? unit(ctx, target.unit).effects : rt(ctx.s).fieldEffects;
  return instances.filter(e => matches(e, target)).sort((a, b) => a.uid - b.uid);
}
export function hasEffectTag(ctx: Ctx, target: EffectTarget, tag: string): boolean {
  return effectsOf(ctx, target).some(e => ctx.db.require("effect", e.effect).tags.includes(tag));
}
export function flushPending(ctx: Ctx): void {
  if (ctx.s.pending.some(e => e.uid < 0)) return;
  // 安裝 onApply 期間仍留在 pending，阻止同鍵重入；不同鍵維持先進先出。
  while (ctx.s.pending.length) {
    const inst = ctx.s.pending[0]!;
    install(ctx, inst);
    const index = ctx.s.pending.indexOf(inst);
    if (index >= 0) ctx.s.pending.splice(index, 1);
  }
}
