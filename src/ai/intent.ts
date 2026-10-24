import type { Cell, Objective } from "../core/types-def.ts";
import type { BattleState } from "../core/types-state.ts";
import type { AiCtx, AiParams, Assignment } from "./policy.ts";
import type { RulesQuery } from "./rules-query.ts";
import type { StrategyCtx } from "./strategy.ts";
import { forceRatio, hpFraction } from "./score.ts";
import { isHostileSlot } from "./hostility.ts";
import { shouldRetreat } from "./retreat.ts";

export const DEFAULTS = {
  intentGiveUpRatio: 0.55, intentGiveUpLoss: 0.6, intentMinRound: 4,
  intentStallRounds: 5, intentTravelPerRound: 4, intentExitReserve: 1,
  individualFleeHp: 0.25, pilotFleeHp: 0.2,
  commanderScatter: 0.6, humanCommanderScatter: 0.3,
  rotateHp: 0.45, rotatePool: 0.15, rotateRounds: 2, rotateCooldown: 3,
  retreatForceRatio: 0.5, retreatMinRound: 3, retreatDamage: 0.35,
};

// SPEC-GAP：params 只接受 number；intent 的 0..8 依下表對應，避免擴充 schema。
export const INTENTS = ["eliminate", "hunt", "guardNest", "hold", "escort", "reachExit", "killTarget", "capture", "survive"] as const;
export type Intent = { kind: typeof INTENTS[number]; source: "objective" | "profile" | "species" | "default"; objective?: Objective };
export type IntentMemory = {
  retreat?: boolean; commander?: string; leaderPerson?: string; leaderLost?: boolean;
  previousHp?: number; stalled?: number; lastRound?: number;
  rotations?: Record<string, { until: number; ready: number }>;
};
type Context = Pick<StrategyCtx, "q" | "s" | "view" | "slot" | "params">;
const own = (ctx: Context) => Object.keys(ctx.s.units).sort().filter(id => ctx.s.units[id]!.owner === ctx.slot);
const active = (ctx: Context) => own(ctx).filter(id => ctx.q.isActive(ctx.s, id));

export function retreatCells(s: BattleState): Cell[] {
  if (s.rt?.noRetreat) return [];
  if (s.rt?.exits.length) return s.rt.exits;
  // SPEC-GAP：未宣告出口時四邊皆可撤離；與 rules/flow.retreat 一致，不改目標的出口語意。
  const cells: Cell[] = [];
  for (let y = 0; y < s.map.height; y++) for (let x = 0; x < s.map.width; x++) {
    if (x === 0 || y === 0 || x === s.map.width - 1 || y === s.map.height - 1) cells.push({ x, y });
  }
  return cells;
}

function tags(q: RulesQuery, s: BattleState, id: string): string[] {
  return [...q.unitTags(s, id), ...(q.speciesIntent?.(s, id)?.behaviors ?? [])];
}
function monster(q: RulesQuery, s: BattleState, id: string): boolean {
  return !!s.rt?.monsters[id] || q.unitTags(s, id).includes("kaiju");
}
export function mobile(q: RulesQuery, s: BattleState, id: string): boolean {
  if (tags(q, s, id).some(t => ["anchored", "tide-anchor", "nest", "immobile"].includes(t))) return false;
  const pid = q.commanderOf(s, id), ap = (pid ? s.persons[pid]?.pools.ap : undefined) ?? s.units[id]!.pools.ap;
  if (ap && ap.max <= 0) return false;
  return q.partDefs(s, id).some(p => p.functions.includes("locomotion") && !s.units[id]!.parts[p.id]?.broken);
}
export function inferIntent(ctx: Context): Intent {
  const objective = ctx.s.rt?.objectives.find(o => o.for === ctx.slot && o.onComplete !== "lose");
  if (objective) return { kind: objective.kind, source: "objective", objective };
  const kind = INTENTS[ctx.params.intent ?? -1];
  if (kind) return { kind, source: "profile" };
  const creatures = own(ctx).filter(id => monster(ctx.q, ctx.s, id));
  if (creatures.length) {
    if (creatures.some(id => tags(ctx.q, ctx.s, id).includes("spawner") || ctx.q.partDefs(ctx.s, id).some(p => p.functions.includes("spawner")))) return { kind: "guardNest", source: "species" };
    if (creatures.some(id => tags(ctx.q, ctx.s, id).includes("territorial"))) return { kind: "hold", source: "species" };
    return { kind: "hunt", source: "species" };
  }
  return { kind: "eliminate", source: "default" };
}

export function selectCommander(ctx: Context): string | undefined {
  const { q, s } = ctx;
  return active(ctx).filter(id => {
    if (!monster(q, s, id)) return !!q.commanderOf(s, id);
    return tags(q, s, id).some(t => ["spawner", "tide-anchor", "anchored"].includes(t))
      || q.partDefs(s, id).some(p => p.functions.includes("spawner")) || ["S", "SS", "SSS"].includes(q.unitGrade(s, id));
  }).sort((a, b) => {
    const rank = (id: string) => {
      const pid = q.commanderOf(s, id), person = pid ? s.persons[pid] : undefined;
      return [person?.attrsBase.resolve ?? 0, person?.level ?? 0];
    };
    return rank(b)[0]! - rank(a)[0]! || rank(b)[1]! - rank(a)[1]! || a.localeCompare(b);
  })[0];
}

function needsRest(ctx: Context, id: string): boolean {
  const { q, s } = ctx, p = { ...DEFAULTS, ...ctx.params }, u = s.units[id]!;
  const pid = q.commanderOf(s, id), person = pid ? s.persons[pid] : undefined;
  const lowPool = q.abilitiesOf(s, id).some(a => q.abilityDef(a).costs.some(cost => {
    const pool = cost.owner === "person" ? person?.pools[cost.pool] : u.pools[cost.pool];
    return cost.pool !== "ap" && pool && pool.max > 0 && pool.cur / pool.max < p.rotatePool;
  }));
  const negative = tags(q, s, id).some(t => ["stagger", "suppressed", "jammed", "numb", "restraint"].includes(t))
    || [u, ...(person ? [person] : [])].some(o => o.contribs.some(c => c.path.includes(".attrs.")
      && (c.op === "add" ? q.evalNum(s, c.value, id) < 0 : c.op === "mul" && q.evalNum(s, c.value, id) < 1)));
  return hpFraction(q, s, id) < p.rotateHp || !!lowPool || negative || person?.morale === "shaken";
}

export function planIntent(ctx: Context, memory: IntentMemory, assignments: Assignment[]): void {
  const { q, s, view, slot } = ctx, p = { ...DEFAULTS, ...ctx.params }, intent = inferIntent(ctx);
  const friends = active(ctx), enemies = Object.keys(view.units).filter(id => q.isActive(view, id) && isHostileSlot(q, view, slot, view.units[id]!.owner));
  if (!memory.commander && !memory.leaderLost) {
    memory.commander = selectCommander(ctx);
    if (memory.commander) memory.leaderPerson = q.commanderOf(s, memory.commander) ?? undefined;
  }
  if (memory.commander && (s.rt?.unitStatus[memory.commander] === "dead"
    || memory.leaderPerson && s.log.events.some(e => e.type === "PersonDied" && e.payload.person === memory.leaderPerson))) memory.leaderLost = true;
  const hp = enemies.reduce((sum, id) => sum + Object.values(view.units[id]!.parts).reduce((n, part) => n + part.layers.reduce((n, l) => n + l.hp, 0), 0), 0);
  const damage = Math.max(0, (memory.previousHp ?? hp) - hp);
  if (memory.lastRound !== s.round) {
    memory.stalled = damage > 0 ? 0 : (memory.stalled ?? 0) + 1;
    memory.previousHp = hp; memory.lastRound = s.round;
  }
  const loss = own(ctx).length ? 1 - own(ctx).reduce((sum, id) => sum + (q.isActive(s, id) ? hpFraction(q, s, id) : 0), 0) / own(ctx).length : 0;
  const ratio = forceRatio(q, s, view, slot), exits = retreatCells(s);
  const travel = (cells: Cell[]) => cells.length && friends.length ? Math.min(...friends.flatMap(id => cells.map(c => q.distance(s.units[id]!.pos, c)))) / p.intentTravelPerRound : 0;
  const remaining = s.rt?.maxRounds == null ? Infinity : s.rt.maxRounds - s.round;
  const escape = Math.ceil(travel(exits)) + p.intentExitReserve;
  let needed = damage > 0 ? hp / damage : (memory.stalled ?? 0) >= p.intentStallRounds ? Infinity : 0;
  const o = intent.objective;
  if (intent.kind === "survive") needed = Math.max(0, Number(o?.params.rounds ?? 0) - s.round);
  if (intent.kind === "guardNest") needed = 0;
  if (intent.kind === "hold") {
    const count = o ? s.rt?.holdProgress?.[JSON.stringify(o)]?.count ?? 0 : 0;
    needed = Math.max(0, Number(o?.params.rounds ?? 0) - count);
    if (Array.isArray(o?.params.zone)) needed += travel(o.params.zone as Cell[]);
  }
  if (intent.kind === "escort" || intent.kind === "reachExit") needed = travel(s.rt?.exits ?? []);
  // 時間預算用於進攻目標；守住／生存不用為撤離預留時間。
  const offensive = !["survive", "hold", "guardNest"].includes(intent.kind);
  const impossible = needed > remaining - (offensive ? escape : 0);
  if (!memory.leaderLost && s.round >= p.intentMinRound && !s.rt?.noRetreat
    && (ratio < p.intentGiveUpRatio || loss >= p.intentGiveUpLoss || impossible)) memory.retreat = true;
  memory.rotations ??= {};
  const leaderAlive = memory.commander && q.isActive(s, memory.commander);
  for (const a of assignments) {
    if (!mobile(q, s, a.unit)) continue;
    if (memory.leaderLost) {
      // SPEC-GAP：以單位 id 穩定分位決定潰散，重播不額外消耗規則 RNG。
      let hash = [...a.unit].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
      hash = Math.imul(hash ^ hash >>> 16, 0x45d9f3b);
      const fraction = ((hash ^ hash >>> 16) >>> 0) / 0x100000000;
      const scatter = monster(q, s, a.unit) ? p.commanderScatter : p.humanCommanderScatter;
      a.intentMode = fraction < scatter ? "retreat" : "instinct";
      continue;
    }
    if (memory.retreat) { a.intentMode = "retreat"; continue; }
    // 母體只命令護巢／集結；王級沿既有 strategy.target 圍攻，不套人類輪替。
    if (leaderAlive && monster(q, s, a.unit) && intent.kind === "guardNest") {
      a.protect = memory.commander; a.intentMode = "gather"; continue;
    }
    if (!leaderAlive || monster(q, s, a.unit)) continue;
    let rotation = memory.rotations[a.unit];
    if ((!rotation || s.round >= rotation.ready) && needsRest(ctx, a.unit)) {
      rotation = memory.rotations[a.unit] = { until: s.round + p.rotateRounds, ready: s.round + p.rotateRounds + p.rotateCooldown };
    }
    if (rotation && s.round < rotation.until && needsRest(ctx, a.unit)) a.intentMode = "regroup";
  }
}

export function individualRetreat(ctx: AiCtx, id: string): boolean {
  const { q, s } = ctx;
  if (s.rt?.noRetreat || !mobile(q, s, id) || s.units[id]!.controlMode === "berserk") return false;
  const p = { ...DEFAULTS, ...q.speciesIntent?.(s, id)?.params, ...ctx.params };
  const pid = q.commanderOf(s, id), morale = pid ? s.persons[pid]?.morale : undefined;
  if (monster(q, s, id)) return hpFraction(q, s, id) < p.individualFleeHp;
  return !!pid && (hpFraction(q, s, id) < p.pilotFleeHp
    || (morale === "breaking" || morale === "fleeing") && shouldRetreat(ctx, morale, 1, p));
}
