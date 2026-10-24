import { chance } from "../../core/rng.ts";
import { evalNum, objectRefs } from "../../core/numexpr.ts";
import type { EffectInstance } from "../../core/types-state.ts";
import type { CampaignState, OpsCtx, OpsEffect } from "../state/types.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { evalOpsNum } from "./cond.ts";
import type { OpsScope } from "./cond.ts";

function entity<T extends { id: string }>(items: Record<string, T>, id: string): T {
  const item = Object.hasOwn(items, id) ? items[id] : undefined;
  if (!item) throw new Error(`缺少營運實體：${id}`);
  return item;
}
function applyCoreEffect(s: CampaignState, ctx: OpsCtx, input: Extract<OpsEffect, { applyEffect: unknown }>["applyEffect"], scope: OpsScope): void {
  const target = input.target === "person" ? entity(s.roster.persons, input.id) : entity(s.mechs, input.id);
  const ref = typeof input.effect === "string" ? { effect: input.effect } : input.effect;
  const def = ctx.db.require("effect", ref.effect);
  if (def.scope !== input.target) throw new Error(`效果 ${def.id} scope 不符合 ${input.target}`);
  if (ref.chance !== undefined && !chance(s.rng, evalOpsNum(s, ctx, ref.chance, scope))) return;
  const params = Object.fromEntries(Object.keys(ref.params ?? {}).sort().map(key => [key, evalOpsNum(s, ctx, ref.params![key]!, scope)]));
  const attrs = "attrsBase" in target ? target.attrsBase : ctx.db.require("frame", target.frame).baseAttrs;
  const ev = { ref: objectRefs({ self: { attrs, pools: target.pools }, params }), hasTag: (tag: string) => ("attrsBase" in target ? ctx.db.require("person", target.def) : ctx.db.require("frame", target.frame)).tags.includes(tag) };
  const remaining = def.clock.kind === "permanent" || def.clock.kind === "whileSource" ? null : evalNum(def.clock.n ?? 0, ev);
  const magnitude = evalNum(def.magnitude ?? 1, ev);
  const existing = target.effects.find(e => e.effect === def.id);
  if (existing && def.stack.policy === "ignore") return;
  if (existing && def.stack.policy !== "separate") {
    if (def.stack.policy === "refresh") { existing.remaining = remaining; existing.magnitude = magnitude; }
    else if (def.stack.policy === "stack") { existing.stacks = Math.min(def.stack.max ?? Number.MAX_SAFE_INTEGER, existing.stacks + 1); existing.remaining = remaining; }
    else {
      if (def.stack.mergeOp === "sumDur") existing.remaining = existing.remaining === null || remaining === null ? null : existing.remaining + remaining;
      else existing.magnitude = def.stack.mergeOp === "maxMag" ? Math.max(existing.magnitude, magnitude) : existing.magnitude + magnitude;
    }
    return;
  }
  const uid = ++s.effectCounter;
  const effect: EffectInstance = { uid, effect: def.id, source: input.source ?? input.id, scope: def.scope,
    owner: input.target === "person" ? { person: input.id } : { unit: input.id }, remaining, magnitude, stacks: 1, contribIds: [], ...(Object.keys(params).length ? { params } : {}) };
  // SPEC-GAP：營運只預掛效果實例與貢獻，不執行戰場鉤子；日數時鐘交給 crew。
  for (let i = 0; i < def.contribs.length; i++) {
    const id = `ops-effect-${uid}-${i}`;
    target.contribs.push({ ...structuredClone(def.contribs[i]!), id, source: effect.source });
    effect.contribIds.push(id);
  }
  target.effects.push(effect);
}

export function applyOpsEffect(s: CampaignState, ctx: OpsCtx, effect: OpsEffect, scope: OpsScope = {}): boolean {
  const num = (expr: Parameters<typeof evalOpsNum>[2]) => evalOpsNum(s, ctx, expr, scope);
  if ("ledger" in effect) {
    const entry = effect.ledger, delta = num(entry.delta);
    // 拒絕的 stock 支出不能留下來源或 Posted 事件。
    if (entry.account.startsWith("stock:") && (s.ledger.balances[entry.account] ?? 0) + delta < 0) return false;
    const ref = entry.ref ?? (entry.counter ? undefined : eventRef(ctx.emit("OpsEffectApplied", { account: entry.account, delta })));
    return post(s, ctx, { ...entry, delta, ...(ref ? { ref } : {}) });
  }
  if ("rep" in effect) {
    for (const key of Object.keys(effect.rep).sort()) {
      const id = key === "issuer" ? scope.faction ?? (scope.contract ? s.contracts[scope.contract]?.issuer : undefined) : key;
      const def = id ? ctx.world.get("faction-ops", id) : undefined;
      const faction = id ? s.factions[def?.id ?? id] : undefined;
      if (!faction) throw new Error(`缺少勢力：${key}`);
      faction.rep = Math.min(100, Math.max(-100, faction.rep + num(effect.rep[key]!)));
    }
  } else if ("flag" in effect) s.flags[effect.flag] = num(effect.value ?? 1);
  else if ("mood" in effect) {
    for (const key of Object.keys(effect.mood).sort()) {
      const ids = key === "all" ? Object.keys(s.roster.employment).sort() : Object.keys(s.roster.persons).sort().filter(id => id === key || s.roster.persons[id]!.def === ctx.db.get("person", key)?.id);
      if (!ids.length && key !== "all") throw new Error(`缺少人物：${key}`);
      const delta = num(effect.mood[key]!);
      for (const id of ids) { const employee = s.roster.employment[id]; if (employee) employee.mood = Math.min(3, Math.max(-3, employee.mood + delta)); }
    }
  } else if ("techHours" in effect) {
    const total = s.techHours + num(effect.techHours);
    if (!Number.isFinite(total) || total < 0) throw new Error("工時池超界");
    s.techHours = total;
  } else if ("spawnContract" in effect) {
    const def = ctx.world.require("contract", effect.spawnContract);
    s.pendingContracts.push({ template: def.id, ...(effect.near ? { near: effect.near } : {}) });
  } else if ("spawnEvent" in effect) s.pendingEvents.push(ctx.world.require("event", effect.spawnEvent).id);
  else if ("setNode" in effect) {
    const id = ctx.world.require("node", effect.setNode.id).id, node = s.nodes[id];
    if (!node) throw new Error(`缺少節點狀態：${id}`);
    Object.assign(node, structuredClone(effect.setNode.patch), { def: node.def });
  } else if ("setRift" in effect) {
    const rift = entity(s.rifts, effect.setRift.id);
    Object.assign(rift, structuredClone(effect.setRift.patch), { id: rift.id });
  } else if ("nameMech" in effect) {
    const { mech, name, by } = effect.nameMech;
    entity(s.mechs, mech);
    if (!name.trim()) throw new Error("機甲名稱不可空白");
    (s.roster.names[mech] ??= []).push({ name, by, day: s.clock.day });
    ctx.emit("Named", { mech, by, index: s.roster.names[mech]!.length - 1 });
  } else if ("applyEffect" in effect) applyCoreEffect(s, ctx, effect.applyEffect, scope);
  else throw new Error("未知 OpsEffect");
  return true;
}
export function applyOpsEffects(s: CampaignState, ctx: OpsCtx, effects: readonly OpsEffect[], scope: OpsScope = {}): boolean {
  for (const effect of effects) if (!applyOpsEffect(s, ctx, effect, scope)) return false;
  return true;
}
