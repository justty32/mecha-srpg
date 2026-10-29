import type { ContentDB } from "../../../../../src/content/contentdb.ts";
import type { BattleState, Command } from "../../../../../src/core/types-state.ts";
import type { GameEvent } from "../../../../../src/core/events.ts";
import type { BattleSetup } from "../../../../../src/rules/flow.ts";
import { createBattle } from "../../../../../src/rules/flow.ts";
import { startBattle } from "../../../../../src/rules/turn.ts";
import { abilitiesOf, tryCommand } from "../../../../../src/rules/command.ts";
import { frameView, layerDefs, partDefs, rt, seatsOf } from "../../../../../src/rules/state.ts";
import type { Ctx } from "../../../../../src/rules/state.ts";
import { poolDecls } from "../../../../../src/rules/pools.ts";
import { hashLog } from "../../../../../src/core/eventlog.ts";

type Provider = { part: string; slot: string; component: string };
export type Baseline = { id: string; owner: string; modes: string[]; damageAbilities: string[]; intrinsic: string[]; providers: Record<string, Provider[]> };
export type UnitSeverity = { id: string; owner: string; status: string; deadWithEvent: boolean; coreRatio: number | null; vitalRatio: number | null;
  brokenImportantIds: string[]; lostMobility: boolean; lostMobilityModes: string[]; lostDamageAbilities: string[]; permanentReasons: Record<string, string[]>;
  severeReason: string[]; severe: boolean };
const canonical = (db: ContentDB, id: string) => db.require("ability", id).id;
function modes(ctx: Ctx, id: string): string[] {
  const body = ctx.db.require("bodyplan", frameView(ctx, id).bodyPlan), parts = partDefs(ctx, id), u = ctx.s.units[id]!;
  if (!parts.some(p => p.mobility !== undefined)) return parts.some(p => p.functions.includes("locomotion") && !u.parts[p.id]!.broken)
    ? [frameView(ctx, id).tags.find(t => Object.hasOwn(ctx.db.registries.locomotion, t)) ?? "leg"] : [];
  const live = parts.filter(p => !u.parts[p.id]!.broken).flatMap(p => p.mobility ?? []);
  return [...new Set(live)].filter(kind => live.filter(k => k === kind).length >= (body.mobilityMinimum?.[kind] ?? 1));
}
export function baselines(ctx: Ctx, ids: string[]): Baseline[] {
  return ids.map(id => {
    const u = ctx.s.units[id]!, intrinsic = [...frameView(ctx, id).innateAbilities];
    for (const seat of seatsOf(ctx, id)) { const p = ctx.s.persons[seat.person]!; intrinsic.push(...(ctx.db.require("person", p.def).abilities ?? []), ...(p.abilities ?? [])); }
    const damageAbilities = abilitiesOf(ctx, id).filter(a => ctx.db.require("ability", a).packets.length > 0), providers: Record<string, Provider[]> = {};
    for (const [part, state] of Object.entries(u.parts)) for (const [slot, component] of Object.entries(state.components)) if (component)
      for (const ability of ctx.db.require("component", component).abilities) (providers[canonical(ctx.db, ability)] ??= []).push({ part, slot, component });
    return { id, owner: u.owner, modes: modes(ctx, id), damageAbilities, intrinsic: intrinsic.map(a => canonical(ctx.db, a)), providers };
  });
}
function providerState(ctx: Ctx, id: string, provider: Provider): { alive: boolean; destroyed: boolean } {
  const part = ctx.s.units[id]!.parts[provider.part];
  if (!part || part.components[provider.slot] !== provider.component) return { alive: false, destroyed: false };
  const slots = Object.keys(part.components).sort().filter(s => part.components[s] && ctx.db.require("component", part.components[s]!).hp !== undefined);
  const index = slots.indexOf(provider.slot), layer = index < 0 ? undefined : part.layers[part.layers.length - slots.length + index];
  const destroyed = part.broken || !!layer?.broken;
  return { alive: !destroyed, destroyed };
}
export function classifyUnit(ctx: Ctx, initial: Baseline, deadIds: ReadonlySet<string> = new Set()): UnitSeverity {
  const id = initial.id, u = ctx.s.units[id]!, body = ctx.db.require("bodyplan", frameView(ctx, id).bodyPlan), parts = partDefs(ctx, id);
  let coreHp = 0, coreMax = 0;
  for (const part of parts.filter(p => p.functions.includes("core"))) for (const [index, layer] of layerDefs(ctx, id, part.id).entries()) if (layer.structural) {
    coreMax += layer.hp; coreHp += Math.max(0, Math.min(layer.hp, u.parts[part.id]!.layers[index]!.hp));
  }
  const coreRatio = coreMax > 0 ? coreHp / coreMax : null;
  const ratios = poolDecls(ctx, { unit: id }).filter(d => d.vital).flatMap(d => {
    const pool = u.pools[d.id]; return pool && Number.isFinite(pool.max) && pool.max > d.min ? [Math.max(0, Math.min(1, (pool.cur - d.min) / (pool.max - d.min)))] : [];
  });
  const vitalRatio = ratios.length ? Math.min(...ratios) : null;
  const nowModes = modes(ctx, id), lostMobilityModes = initial.modes.filter(mode => !nowModes.includes(mode));
  const reasons: Record<string, string[]> = {};
  const note = (part: string, why: string) => { const list = reasons[part] ??= []; if (!list.includes(why)) list.push(why); };
  for (const part of parts) if (u.parts[part.id]!.broken) for (const mode of lostMobilityModes)
    if (part.mobility?.includes(mode) || !parts.some(p => p.mobility !== undefined) && part.functions.includes("locomotion")) note(part.id, `lost-mobility:${mode}`);
  const lostDamageAbilities: string[] = [];
  for (const ability of initial.damageAbilities) {
    const requirement = body.abilityParts?.[ability] ?? body.abilityParts?.[ability.replace(/^[^:]+:/u, "")];
    const missingParts = requirement?.parts.filter(part => u.parts[part]?.broken) ?? [];
    const mappedLost = !!requirement && requirement.parts.filter(part => u.parts[part] && !u.parts[part]!.broken).length < requirement.min;
    const providers = initial.providers[ability] ?? [], states = providers.map(provider => providerState(ctx, id, provider));
    const weaponLost = !initial.intrinsic.includes(ability) && providers.length > 0 && !states.some(state => state.alive);
    if (!mappedLost && !weaponLost) continue;
    lostDamageAbilities.push(ability);
    if (mappedLost) for (const part of missingParts) note(part, `ability-parts:${ability}`);
    if (weaponLost) for (const [index, provider] of providers.entries()) if (states[index]!.destroyed) note(provider.part, `weapon-destroyed:${provider.slot}:${ability}`);
  }
  const brokenImportantIds = Object.keys(reasons).sort(), severeReason: string[] = [];
  if (coreRatio !== null && coreRatio <= 0.3) severeReason.push("A:core-structural<=30%");
  if (vitalRatio !== null && vitalRatio <= 0.3) severeReason.push("B:vital<=30%");
  if (brokenImportantIds.length >= 2 && (lostMobilityModes.length > 0 || lostDamageAbilities.length > 0)) severeReason.push("C:two-permanent-functional-parts");
  const status = rt(ctx.s).unitStatus[id] ?? "unknown";
  return { id, owner: initial.owner, status, deadWithEvent: status === "dead" && deadIds.has(id), coreRatio, vitalRatio, brokenImportantIds,
    lostMobility: lostMobilityModes.length > 0, lostMobilityModes, lostDamageAbilities, permanentReasons: reasons,
    severeReason: status === "active" ? severeReason : [], severe: status === "active" && severeReason.length > 0 };
}
function audit(ctx: Ctx, initial: Baseline[], deadIds: ReadonlySet<string>) {
  const units = initial.map(unit => classifyUnit(ctx, unit, deadIds));
  const sides = [...new Set(initial.map(unit => unit.owner))].map(side => {
    const group = units.filter(unit => unit.owner === side);
    return { side, qualifies: group.length === 4 && group.every(unit => unit.deadWithEvent || unit.severe), annihilated: group.length === 4 && group.every(unit => unit.deadWithEvent), units: group };
  });
  return { round: ctx.s.round, sides };
}
export function analyzeSeverity(db: ContentDB, setup: BattleSetup, seed: number, commands: Command[], expectedHash: string) {
  const state = createBattle(db, setup, seed), ctx = { db, s: state }; startBattle(ctx);
  const ids = setup.units.filter(unit => ["player", "enemy"].includes(unit.owner)).map(unit => unit.id), initial = baselines(ctx, ids), deadIds = new Set<string>();
  if (initial.filter(unit => unit.owner === "player").length !== 4 || initial.filter(unit => unit.owner === "enemy").length !== 4) throw new Error("severity audit requires original 4v4");
  let previous = audit(ctx, initial, deadIds);
  if (previous.sides.some(side => side.qualifies || side.units.some(unit => unit.severe))) throw new Error("initial healthy army incorrectly classified severe");
  const initialAudit = previous, recent: GameEvent[] = [];
  const lifePools = new Set(initial.flatMap(unit => poolDecls(ctx, { unit: unit.id }).filter(p => p.vital).map(p => p.id)));
  const physical = (events: GameEvent[]) => events.filter(event => ["LayerDamaged", "LayerBroken", "PartBroken", "UnitDied"].includes(event.type) || event.type === "PoolChanged" && lifePools.has(String(event.payload.pool)));
  let first: { round: number; side: string; kind: string; before: typeof previous; at: typeof previous; beforeEvents: GameEvent[]; atEvents: GameEvent[]; afterEvents: GameEvent[] } | null = null;
  let trueEliminationRound: number | null = null, trueEliminationSide: string | null = null, invalidRetreatOrEject = 0;
  for (const command of commands) {
    const result = tryCommand(ctx, command); if (!result.ok) throw new Error(`severity replay rejected:${result.rejection.code}`);
    for (const event of result.events) {
      if (event.type === "UnitDied" && typeof event.payload.unit === "string") deadIds.add(event.payload.unit);
      if (["Retreated", "Ejected"].includes(event.type)) invalidRetreatOrEject++;
    }
    const relevant = physical(result.events), now = audit(ctx, initial, deadIds), qualified = now.sides.filter(side => side.qualifies), eliminated = now.sides.find(side => side.annihilated);
    if (eliminated && trueEliminationRound === null) { trueEliminationRound = state.round; trueEliminationSide = eliminated.side; }
    if (first && first.afterEvents.length < 8) first.afterEvents.push(...relevant.slice(0, 8 - first.afterEvents.length));
    if (!first && qualified.length) first = { round: state.round, side: qualified.length > 1 ? "both" : qualified[0]!.side,
      kind: qualified.every(side => side.annihilated) ? "annihilation" : "all-survivors-severe", before: previous, at: now,
      beforeEvents: recent.slice(-8), atEvents: relevant, afterEvents: [] };
    recent.push(...relevant); if (recent.length > 8) recent.splice(0, recent.length - 8);
    previous = now;
  }
  const replayHash = hashLog(state.log); if (replayHash !== expectedHash) throw new Error(`severity replay hash mismatch:${replayHash}:${expectedHash}`);
  return { definition: "core-structural-or-vital<=30%-or-two-permanent-functional-parts-v1", initialAudit, firstQualifyingRound: first?.round ?? null,
    firstQualifyingSide: first?.side ?? null, qualifyingSideMeans: "the suppressed side, not the winner", firstKind: first?.kind ?? null, threshold: first,
    trueEliminationRound, trueEliminationSide, invalidRetreatOrEject, within10: first !== null && first.round <= 10 && invalidRetreatOrEject === 0, finalAudit: previous, replayHash };
}
