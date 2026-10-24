import type { Id } from "../core/ids.ts";
import type { Cell, PartId } from "../core/types-def.ts";
import type { BattleState, Command } from "../core/types-state.ts";
import { evalCond, evalNum } from "../core/numexpr.ts";
import { cloneBattleState } from "../core/clone-state.ts";
import { commanderOf, distance, emit, evalCtxFor, frameView, hostile, inBounds, isActive, person, rt, seatsOf, terrainAt, unit } from "./state.ts";
import type { Ctx, Rejection, Result } from "./state.ts";
import { addContrib, removeContribsBySource } from "./contribs.ts";
import { removeBySource } from "./effects.ts";
import { commandHandler, onSignal } from "./hooks.ts";
import { canPay, changePool, pay } from "./pools.ts";
import type { Cost } from "./pools.ts";
import { resolveAbility } from "./attack.ts";
import { advance, endTurn } from "./turn.ts";
import { locomotionOf, moveAlong } from "./movement.ts";

function actorPerson(ctx: Ctx, id: Id, aid: Id): Id | null {
  const a = ctx.db.require("ability", aid);
  return a.actorRole ? seatsOf(ctx, id).find(s => s.role === a.actorRole)?.person ?? null : commanderOf(ctx, id);
}
export function abilitiesOf(ctx: Ctx, unitId: Id): Id[] {
  const u = unit(ctx, unitId), ids = [...frameView(ctx, unitId).innateAbilities];
  for (const partId of Object.keys(u.parts).sort()) {
    const part = u.parts[partId]!;
    if (part.broken) continue;
    const slots = Object.keys(part.components).sort().filter(s => part.components[s]);
    const hpSlots = slots.filter(s => ctx.db.require("component", part.components[s]!).hp !== undefined);
    for (const slot of slots) {
      const index = hpSlots.indexOf(slot);
      if (index >= 0 && part.layers[part.layers.length - hpSlots.length + index]?.broken) continue;
      ids.push(...ctx.db.require("component", part.components[slot]!).abilities);
    }
  }
  return [...new Set(ids.map(id => ctx.db.require("ability", id).id))].sort();
}
export function resolveCosts(ctx: Ctx, unitId: Id, abilityId: Id): Cost[] {
  const a = ctx.db.require("ability", abilityId), pid = actorPerson(ctx, unitId, abilityId);
  const ev = evalCtxFor(ctx, { unit: unitId, ...(pid ? { person: pid } : {}) });
  return a.costs.map(c => ({ ...c, amount: evalNum(c.amount, ev) }));
}
function los(ctx: Ctx, from: Cell, to: Cell): boolean {
  let x = from.x, y = from.y;
  const dx = Math.abs(to.x - x), dy = -Math.abs(to.y - y), sx = x < to.x ? 1 : -1, sy = y < to.y ? 1 : -1;
  let error = dx + dy;
  while (x !== to.x || y !== to.y) {
    const twice = 2 * error;
    if (twice >= dy) { error += dy; x += sx; }
    if (twice <= dx) { error += dx; y += sy; }
    if (x === to.x && y === to.y) break;
    if (terrainAt(ctx, { x, y }).blocksLos) return false;
  }
  return true;
}
export function checkAbility(ctx: Ctx, unitId: Id, abilityId: Id, target?: { unit?: Id; cell?: Cell; part?: PartId }): Rejection | null {
  if (rt(ctx.s).outcome) return { code: "battle-over" };
  if (!ctx.s.units[unitId]) return { code: "bad-actor" };
  if (!isActive(ctx, unitId)) return { code: "not-active" };
  const a = ctx.db.get("ability", abilityId);
  if (!a || !abilitiesOf(ctx, unitId).includes(a.id)) return { code: "unknown-ability" };
  const pid = actorPerson(ctx, unitId, a.id), u = unit(ctx, unitId);
  if (["none", "disabled"].includes(u.controlMode) || (a.actorRole && !pid)) return { code: "no-commander" };
  if (a.mode === "passive") return { code: "require-failed" };
  if (target?.unit && (!ctx.s.units[target.unit] || !isActive(ctx, target.unit))) return { code: "bad-target" };
  const selected = a.target.kind === "self" ? unitId : target?.unit;
  const ev = evalCtxFor(ctx, { unit: unitId, ...(pid ? { person: pid } : {}) }, selected ? { unit: selected } : undefined);
  if (!a.require.every(c => evalCond(c, ev))) return { code: "require-failed" };
  if ((u.cooldowns[a.id] ?? 0) > 0) return { code: "cooldown" };
  if (a.usesPerBattle !== undefined && (rt(ctx.s).reactUsed[`uses:${unitId}:${a.id}`] ?? 0) >= a.usesPerBattle) return { code: "uses-exhausted" };
  if (target !== undefined || a.target.kind === "self") {
    if (["unit", "part"].includes(a.target.kind) && !selected) return { code: "bad-target" };
    if (a.target.kind === "self" && target?.unit && target.unit !== unitId) return { code: "bad-target" };
    const cell = selected ? unit(ctx, selected).pos : target?.cell;
    if (!cell || !inBounds(ctx.s, cell)) return { code: "bad-target" };
    if (selected && target?.cell && distance(cell, target.cell) !== 0) return { code: "bad-target" };
    if (selected && a.target.kind !== "self" && (a.target.friendly === "no" && !hostile(ctx, unitId, selected)
      || a.target.friendly === "only" && hostile(ctx, unitId, selected))) return { code: "bad-target" };
    const range = distance(u.pos, cell);
    if (range < evalNum(a.target.range.min, ev) || range > evalNum(a.target.range.max, ev)) return { code: "out-of-range" };
    if (a.target.los && !los(ctx, u.pos, cell)) return { code: "no-los" };
    if (a.target.kind === "part" && target?.part === undefined) return { code: "bad-part" };
    if (target?.part !== undefined && (!selected || !a.partAim?.allowed || !unit(ctx, selected).parts[target.part] || unit(ctx, selected).parts[target.part]!.broken)) return { code: "bad-part" };
  }
  if (!canPay(ctx, unitId, pid, resolveCosts(ctx, unitId, a.id))) return { code: "cannot-pay" };
  return null;
}

function stopSustain(ctx: Ctx, id: Id, aid: Id): void {
  const u = unit(ctx, id), source = `sustain:${id}:${aid}`;
  u.sustained = u.sustained.filter(a => a !== aid);
  removeContribsBySource(ctx, { unit: id }, source);
  for (const seat of seatsOf(ctx, id)) removeContribsBySource(ctx, { person: seat.person }, source);
  removeBySource(ctx, source);
}
export function tryCommand(ctx: Ctx, cmd: Command): Result {
  const runtime = rt(ctx.s), start = ctx.s.log.events.length;
  if (runtime.outcome) return { ok: false, rejection: { code: "battle-over" } };
  if (!ctx.s.units[cmd.actor]) return { ok: false, rejection: { code: "bad-actor" } };
  if (runtime.active !== cmd.actor || !isActive(ctx, cmd.actor)) return { ok: false, rejection: { code: "not-active" } };
  const u = unit(ctx, cmd.actor);
  if (["none", "disabled"].includes(u.controlMode) && !["end", "wait", "eject"].includes(cmd.kind)) return { ok: false, rejection: { code: "no-commander" } };
  let rejection: Rejection | null = null;
  if (cmd.kind === "useAbility") {
    rejection = checkAbility(ctx, cmd.actor, cmd.ability, cmd.target ?? {});
    if (rejection) return { ok: false, rejection };
    const a = ctx.db.require("ability", cmd.ability), pid = actorPerson(ctx, cmd.actor, a.id);
    if (a.mode === "reaction") return { ok: false, rejection: { code: "require-failed" } };
    const ev = evalCtxFor(ctx, { unit: cmd.actor, ...(pid ? { person: pid } : {}) });
    // 成本只求值一次；④ 後無論命中與否都不退費。
    const costs = resolveCosts(ctx, cmd.actor, a.id), cooldown = evalNum(a.cooldown ?? 0, ev);
    const produces = a.produces.map(c => ({ ...c, amount: evalNum(c.amount, ev) }));
    runtime.actionSeq++;
    pay(ctx, cmd.actor, pid, costs, "ability");
    u.cooldowns[a.id] = cooldown;
    runtime.reactUsed[`uses:${cmd.actor}:${a.id}`] = (runtime.reactUsed[`uses:${cmd.actor}:${a.id}`] ?? 0) + 1;
    emit(ctx, "AbilityUsed", { unit: cmd.actor, ability: a.id, target: cmd.target?.unit ?? null, part: cmd.target?.part ?? null });
    if (a.mode === "sustained" && u.sustained.includes(a.id)) stopSustain(ctx, cmd.actor, a.id);
    else {
      if (a.mode === "sustained") {
        u.sustained.push(a.id);
        for (const lock of a.sustain?.lock ?? []) {
          const owner = lock.owner === "mech" ? { unit: cmd.actor } : pid ? { person: pid } : null;
          if (owner) addContrib(ctx, owner, { path: `self.pools.${lock.pool}.max`, op: "add", value: -evalNum(lock.amount, ev), source: `sustain:${cmd.actor}:${a.id}` });
        }
      }
      resolveAbility(ctx, cmd.actor, a.id, cmd.target ?? {});
    }
    for (const c of produces) {
      const owner = c.owner === "mech" ? { unit: cmd.actor } : pid ? { person: pid } : null;
      if (owner) changePool(ctx, owner, c.pool, c.amount, "produces");
    }
  } else if (cmd.kind === "move") {
    if (!locomotionOf(ctx, cmd.actor)) return { ok: false, rejection: { code: "no-locomotion" } };
    let previous = u.pos;
    for (const cell of cmd.path) {
      if (!inBounds(ctx.s, cell) || distance(previous, cell) !== 1) return { ok: false, rejection: { code: "bad-path" } };
      previous = cell;
    }
    runtime.actionSeq++; moveAlong(ctx, cmd.actor, cmd.path);
  } else if (cmd.kind === "wait") {
    if (runtime.waitUsed.includes(cmd.actor)) return { ok: false, rejection: { code: "wait-used" } };
    runtime.actionSeq++;
    runtime.waitUsed.push(cmd.actor); runtime.waited.push(cmd.actor);
    emit(ctx, "Waited", { unit: cmd.actor });
    ctx.s.order = [...ctx.s.order.filter(id => id !== cmd.actor), cmd.actor];
    runtime.active = null; advance(ctx);
  } else if (cmd.kind === "end") { runtime.actionSeq++; endTurn(ctx); }
  else {
    const handler = commandHandler(cmd.kind);
    if (!handler) return { ok: false, rejection: { code: "unsupported" } };
    rejection = handler(ctx, cmd);
    if (rejection) return { ok: false, rejection };
    runtime.actionSeq++;
  }
  if (runtime.active !== null && !isActive(ctx, runtime.active)) endTurn(ctx);
  if (runtime.outcome) runtime.active = null;
  return { ok: true, events: ctx.s.log.events.slice(start) };
}
export function previewCommand(ctx: Ctx, cmd: Command): { result: Result; state: BattleState } {
  const state = cloneBattleState(ctx.s);
  return { result: tryCommand({ db: ctx.db, s: state }, cmd), state };
}

onSignal("poolDepleted", "combat-sustain", 0, (ctx, p) => {
  const id = p.kind === "person" ? ctx.s.persons[String(p.owner)]?.seat?.mech : String(p.owner);
  if (!id || !ctx.s.units[id]) return;
  for (const aid of [...unit(ctx, id).sustained].sort()) {
    const sustain = ctx.db.require("ability", aid).sustain;
    if (sustain?.removeOnZero && sustain.drain.some(c => c.pool === p.pool)) stopSustain(ctx, id, aid);
  }
});
