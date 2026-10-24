import { requirePlace } from "../world/places.ts";
import { spawnActor } from "../world/actors.ts";
import { reveal } from "../world/fog.ts";
import { placeLoc } from "../war/loc.ts";
import { placesDaily2 } from "../world/places.ts";
import { clearPlaceBlight } from "../world/patches.ts";
import { startOperation } from "../war/operations.ts";
import { changeRelation, declareWar, factionId } from "../war/relations.ts";
import { signTreaty } from "../war/treaties.ts";
import { leakModel } from "../war/rnd.ts";
import { drive } from "../war/drivers.ts";
import { chance } from "../../core/rng.ts";
import { evalNum, objectRefs } from "../../core/numexpr.ts";
import type { EffectInstance } from "../../core/types-state.ts";
import type { CampaignState, OpsCtx, OpsEffect, CarcassState } from "../state/types.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { evalOpsNum } from "./cond.ts";
import type { OpsScope } from "./cond.ts";

export function beastSpecies(ctx: OpsCtx, frame: string) {
  const monster = ctx.db.get("monster", frame);
  return ctx.db.get("species", monster?.species ?? frame) ?? ctx.db.all("species").find(sp => sp.capture.frame === ctx.db.get("frame", frame)?.id || `base:frame/corpse-${sp.id.split("/").at(-1)}` === frame);
}
export function removeRestraint(s: CampaignState, id: string): void {
  s.restraint.slots = s.restraint.slots.map(value => value === id ? null : value);
  delete s.restraint.beasts[id]; s.restraint.carcasses = s.restraint.carcasses.filter(c => c.id !== id);
  s.inventory.mechs = s.inventory.mechs.filter(value => value !== id);
  for (const room of Object.values(s.ship.rooms)) room.items = room.items.filter(value => value !== id);
  s.jobs = s.jobs.filter(j => j.target !== id);
  delete s.mechs[id];
}
export function stiffen(s: CampaignState, ctx: OpsCtx, id: string): void {
  const mech = s.mechs[id], species = mech && beastSpecies(ctx, mech.frame), slot = s.restraint.slots.indexOf(id);
  if (!mech || !species || slot < 0) return;
  const cfg = ctx.world.require("beasts", `beasts/${species.family}`);
  const carcass: CarcassState = { id, species: species.id, grade: ctx.db.require("frame", mech.frame).grade, parts: structuredClone(mech.parts), decayPerDay: cfg.decay, slot };
  removeRestraint(s, id); s.restraint.slots[slot] = id; s.restraint.carcasses.push(carcass);
  ctx.emit("Stiffened", { mech: id });
}

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
    target.contribs.push({ ...structuredClone(def.contribs[i]!), id, source: effect.source, value: evalNum(def.contribs[i]!.value, ev) });
    effect.contribIds.push(id);
  }
  target.effects.push(effect);
}

export function applyOpsEffect(s: CampaignState, ctx: OpsCtx, effect: OpsEffect, scope: OpsScope = {}): boolean {
  // SPEC-GAP：模板效果用 $actor/$target/$place/$rift/$shell/$operation 綁定作戰脈絡。
  const op = scope.operation ? s.operations?.[scope.operation] : undefined;
  const bindings: Record<string, string | undefined> = { $actor: scope.faction, $target: scope.targetFaction, $node: scope.place ?? scope.node, $place: scope.place ?? scope.node, $rift: scope.rift, $shell: op?.target.shell, $operation: scope.operation };
  function bind(value: unknown): unknown {
    if (typeof value === "string" && Object.hasOwn(bindings, value)) {
      if (!bindings[value]) throw new Error(`missing war binding: ${value}`);
      return bindings[value];
    }
    if (Array.isArray(value)) return value.map(bind);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, bind(v)]));
    return value;
  }
  if (scope.operation || scope.targetFaction) effect = bind(effect) as OpsEffect;
  const num = (expr: Parameters<typeof evalOpsNum>[2]) => evalOpsNum(s, ctx, expr, scope);
  if ("reveal" in effect) return reveal(s, ctx, effect.reveal);
  if ("setGoal" in effect) {
    const actor = s.actors[effect.setGoal.actor];
    if (!actor) return false;
    actor.goal = structuredClone(effect.setGoal.goal); delete actor.path; return true;
  }
  if ("spawnActor" in effect) {
    const e = effect.spawnActor, faction = e.faction ?? scope.faction;
    const place = e.place ?? scope.place ?? scope.node;
    const territory = faction && s.factions[factionId(s, ctx, faction) ?? faction]?.territoryNow[0];
    const rift = s.rifts[e.rift ?? scope.rift ?? ""];
    const at = typeof e.at === "object" ? e.at : e.at === "rift" ? rift?.at : e.at === "territory" ? territory && placeLoc(s, ctx, territory) : place && placeLoc(s, ctx, place);
    return !!at && !!spawnActor(s, ctx, { kind: e.kind, at, ...(faction ? { faction } : {}), ...(e.def ? { def: e.def } : {}),
      ...(rift && e.kind === "swarm" ? { swarm: { rift: rift.id, family: rift.family, grades: [rift.width] } } : {}) });
  }
  if ("startOperation" in effect) return !!startOperation(s, ctx, effect.actor ?? scope.faction ?? "", effect.startOperation, effect.target);
  if ("opProgress" in effect) {
    const target = s.operations?.[effect.opProgress.operation ?? scope.operation ?? ""];
    if (!target) return false; target.progress = Math.max(0, Math.min(1, target.progress + num(effect.opProgress.delta))); return true;
  }
  if ("relation" in effect) { const e = effect.relation; return changeRelation(s, ctx, e.a, e.b, num(e.delta), e.reason); }
  if ("declareWar" in effect) return declareWar(s, ctx, effect.declareWar.a, effect.declareWar.b);
  if ("treaty" in effect) return signTreaty(s, ctx, effect.treaty.a, effect.treaty.b, effect.treaty.def);
  if ("leakModel" in effect) { leakModel(s, ctx, effect.leakModel.model, effect.leakModel.by); return true; }
  if ("forceLoss" in effect) {
    const e = effect.forceLoss, target = e.operation ? s.operations?.[e.operation]?.force : s.factions[e.faction ?? scope.faction ?? ""]?.forces;
    if (!target) return false;
    const loss = Math.min(1, Math.max(0, num(e.fraction)));
    for (const u of target.units) { u.count = Math.max(0, Math.round(u.count * (1 - loss))); u.readiness *= 1 - loss; } return true;
  }
  if ("transferPlace" in effect) {
    const node = requirePlace(s, ctx, effect.transferPlace.place).id, to = factionId(s, ctx, effect.transferPlace.to);
    if (!to || !s.places[node]) return false;
    const from = Object.keys(s.factions).sort().find(id => s.factions[id]!.territoryNow.includes(node)) ?? "none";
    for (const f of Object.values(s.factions)) f.territoryNow = f.territoryNow.filter(id => id !== node);
    s.factions[to]!.territoryNow.push(node); s.factions[to]!.territoryNow.sort();
    clearPlaceBlight(s, ctx, node);
    s.places[node]!.ownerOverride = ctx.world.require("faction-ops", to).faction;
    if (s.places[node]!.flags.includes("blight-lost")) s.places[node]!.blightOwnerBefore = ctx.world.require("faction-ops", to).faction;
    placesDaily2(s, ctx);
    ctx.emit("PlaceTransferred", { node, from, to }); return true;
  }
  if ("transferShell" in effect) {
    const shell = s.shells?.[effect.transferShell.shell], to = effect.transferShell.to === "player" ? "player" : factionId(s, ctx, effect.transferShell.to);
    if (!shell || !to) return false;
    const from = typeof shell.holder === "string" ? shell.holder : shell.holder.ruin;
    for (const f of Object.values(s.factions)) if (f.shells) f.shells = f.shells.filter(id => id !== shell.id);
    shell.holder = to; if (!shell.knownBy.includes(to)) shell.knownBy.push(to);
    s.factions[to]?.shells?.push(shell.id);
    ctx.emit("ShellSeized", { shell: shell.id, from, to });
    if (to !== "player") drive(s, ctx, "shell-envy", to, to); return true;
  }
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
      const ids = key === "all" ? Object.keys(s.roster.employment).sort() : s.roster.persons[key] ? [key]
        : Object.keys(s.roster.persons).sort().filter(id => s.roster.persons[id]!.def === ctx.db.get("person", key)?.id).slice(0, 1);
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
  else if ("setPlace" in effect) {
    const id = requirePlace(s, ctx, effect.setPlace.id).id, node = s.places[id];
    if (!node) throw new Error(`缺少節點狀態：${id}`);
    Object.assign(node, structuredClone(effect.setPlace.patch), { def: node.def });
    if (effect.setPlace.clearBlight) {
      clearPlaceBlight(s, ctx, id);
    }
  } else if ("setRift" in effect) {
    const rift = entity(s.rifts, effect.setRift.id);
    const before = rift.phase;
    Object.assign(rift, structuredClone(effect.setRift.patch), { id: rift.id });
    if (scope.operation && before !== rift.phase) ctx.emit("RiftPhase", { rift: rift.id, from: before, to: rift.phase });
  } else if ("nameMech" in effect) {
    const { mech, name, by } = effect.nameMech;
    entity(s.mechs, mech);
    if (!name.trim()) throw new Error("機甲名稱不可空白");
    (s.roster.names[mech] ??= []).push({ name, by, day: s.clock.day, kind: effect.nameMech.kind ?? "title" });
    ctx.emit("Named", { mech, by, index: s.roster.names[mech]!.length - 1 });
  } else if ("restraintChoice" in effect) {
    const input = effect.restraintChoice, beast = s.restraint.beasts[input.mech];
    if (!beast) return false;
    if (input.action === "kill") stiffen(s, ctx, input.mech);
    else if (input.action === "release") { removeRestraint(s, input.mech); ctx.emit("LostMech", { mech: input.mech }); }
    else {
      // SPEC-GAP：硬壓立即生效，技師工時記成優先欠工，次日先償還。
      s.flags.restraintHoursOwed = (s.flags.restraintHoursOwed ?? 0) + (input.hours ?? 0);
      beast.wear = input.wear ?? 60; s.flags[`looseDay:${input.mech}`] = s.clock.day;
      const tech = Object.keys(s.roster.employment).sort().find(id => s.roster.employment[id]!.role === "technician");
      if (tech && chance(s.rng, input.injuryChance ?? 0)) {
        const hp = s.roster.persons[tech]?.pools.hp;
        if (hp) hp.cur = Math.max(0, hp.cur - (input.injuryHp ?? 0));
      }
      ctx.emit("Suppressed", { mech: input.mech });
    }
  } else if ("salvage" in effect) {
    const { place: node, loot, carcass, keep } = effect.salvage;
    if (keep) {
      const slot = s.restraint.slots.indexOf(null); if (slot < 0) return false;
      s.restraint.slots[slot] = carcass.id; s.restraint.carcasses.push({ ...structuredClone(carcass), slot });
    } else {
      const ref = eventRef(ctx.emit("OpsEffectApplied", { carcass: carcass.id }));
      const overflow = { components: [] as typeof loot.components, materials: {} as typeof loot.materials, day: s.clock.day };
      const used = () => s.inventory.components.length + s.inventory.relics.length + Object.entries(s.ledger.balances).filter(([key]) => key.startsWith("stock:") && key !== "stock:fuel").reduce((sum, [, value]) => sum + value, 0);
      for (const c of loot.components) (used() < s.ship.capacity.cargo ? s.inventory.components : overflow.components).push(structuredClone(c));
      for (const account of Object.keys(loot.materials).sort() as (keyof typeof loot.materials)[]) {
        const amount = loot.materials[account]!, stored = Math.min(amount, Math.max(0, s.ship.capacity.cargo - used()));
        if (stored) post(s, ctx, { account, delta: stored, reason: "carcass-salvage", ref });
        if (stored < amount) overflow.materials[account] = amount - stored;
      }
      if (overflow.components.length || Object.keys(overflow.materials).length) s.places[node]?.wreckage.push(overflow);
    }
  } else if ("applyEffect" in effect) applyCoreEffect(s, ctx, effect.applyEffect, scope);
  else throw new Error("未知 OpsEffect");
  return true;
}
export function applyOpsEffects(s: CampaignState, ctx: OpsCtx, effects: readonly OpsEffect[], scope: OpsScope = {}): boolean {
  for (const effect of effects) if (!applyOpsEffect(s, ctx, effect, scope)) return false;
  return true;
}
