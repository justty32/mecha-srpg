import type { Id } from "../core/ids.ts";
import { GRADES } from "../core/types-def.ts";
import type { Cell, FactionSlot } from "../core/types-def.ts";
import type { BattleState, Command } from "../core/types-state.ts";
import { createRng } from "../core/rng.ts";
import type { RulesQuery } from "./rules-query.ts";
import type { AiCtx, Agent, Candidate } from "./policy.ts";
import { dangerAt, threatOf } from "./danger.ts";
import { isHostileSlot } from "./hostility.ts";
import { shouldRetreat } from "./retreat.ts";

const DEFAULTS = {
  survive: 1, heal: 1, buff: 0.5, attack: 1, disable: 0.5, debuff: 0.5, capture: 0, protect: 1, scout: 0.3,
  retreat: 1, focusBonus: 1.5, friendlyFirePenalty: 1, reposition: 0.3, waitScore: 0, endScore: 0.01,
  ejectBelow: 0.15, moveCost: 0.01, dangerK: 0.01, band: 0.8,
  tries: 3, previewSeed: 1000, previewStream: 7, forceFloor: 1e-6,
  retreatForceRatio: 0.5, retreatMinRound: 3, retreatDamage: 0.35,
};

export const TACTICS: readonly string[] = ["attack", "attackArea", "disable", "heal", "buff", "debuff", "escape", "protect", "capture", "scout"];

export function tacticWeights(q: RulesQuery, s: BattleState, actor: Id, abilityId: Id): Record<string, number> {
  const tactics = q.abilityDef(abilityId).ai.tactics;
  return Object.fromEntries(Object.keys(tactics).sort().map(t => [t, q.evalNum(s, tactics[t]!, actor)]));
}

function remainingHp(q: RulesQuery, s: BattleState, unitId: Id): number {
  return q.partDefs(s, unitId).reduce((sum, p) => sum + (s.units[unitId]?.parts[p.id]?.layers ?? []).reduce((n, l) => n + l.hp, 0), 0);
}

export function hpFraction(q: RulesQuery, s: BattleState, unitId: Id): number {
  const max = q.partDefs(s, unitId).reduce((sum, p) => sum + q.layerDefs(s, unitId, p.id).reduce((n, l) => n + l.hp, 0), 0);
  return max > 0 ? Math.max(0, Math.min(1, remainingHp(q, s, unitId) / max)) : 0;
}

export type PreviewOutcome = { damage: Record<Id, number>; killed: Id[]; hitRuns: number; runs: number };

export function previewOutcome(q: RulesQuery, view: BattleState, cmd: Command, move?: Cell, tries: number = DEFAULTS.tries): PreviewOutcome {
  const outcome: PreviewOutcome = { damage: {}, killed: [], hitRuns: 0, runs: 0 };
  let state = view;
  if (move) {
    const path = q.pathTo(view, cmd.actor, move);
    if (path === null) return outcome;
    const moved = q.previewCommand(view, { kind: "move", actor: cmd.actor, path });
    if (!moved.result.ok) return outcome;
    state = moved.state;
  }
  const killed = new Set<Id>();
  for (let i = 0; i < tries; i++) {
    const { result } = q.previewCommand({ ...state, rng: createRng(DEFAULTS.previewSeed + i, DEFAULTS.previewStream) }, cmd);
    outcome.runs++;
    if (!result.ok) continue;
    const hit = result.events.some(e => e.type === "Hit");
    if (hit) outcome.hitRuns++;
    for (const event of result.events) {
      const { unit, amount } = event.payload;
      if (typeof unit !== "string") continue;
      if (event.type === "UnitDied") killed.add(unit);
      if (hit && event.type === "LayerDamaged" && typeof amount === "number") outcome.damage[unit] = (outcome.damage[unit] ?? 0) + amount;
    }
  }
  if (outcome.hitRuns > 0) {
    outcome.damage = Object.fromEntries(Object.keys(outcome.damage).sort().map(id => [id, outcome.damage[id]! / outcome.hitRuns]));
  }
  outcome.killed = [...killed].sort();
  return outcome;
}

function valueWithFocus(q: RulesQuery, view: BattleState, target: Id, focus: Id | undefined, bonus: number): number {
  return (1 + GRADES.indexOf(q.unitGrade(view, target))) * (1 + threatOf(q, view, target)) *
    (1.5 - hpFraction(q, view, target)) * (target === focus ? bonus : 1);
}

export function targetValue(q: RulesQuery, view: BattleState, target: Id, focus?: Id): number {
  // SPEC-GAP：公開簽名沒有 params，獨立查詢用預設值；候選評分由私有 helper 帶入 profile.focusBonus。
  return valueWithFocus(q, view, target, focus, DEFAULTS.focusBonus);
}

export function forceRatio(q: RulesQuery, s: BattleState, view: BattleState, slot: FactionSlot): number {
  const force = (state: BattleState, own: boolean): number => Object.keys(state.units).sort()
    .filter(id => !isHostileSlot(q, state, slot, state.units[id]!.owner) === own && q.isActive(state, id))
    .reduce((sum, id) => sum + threatOf(q, state, id) * hpFraction(q, state, id), 0);
  return force(s, true) / Math.max(DEFAULTS.forceFloor, force(view, false));
}

export function want(ctx: AiCtx, unitId: Id): Record<string, number> {
  // SPEC-GAP：profile params 僅允許數值，以契約固定公式套用係數。
  const p = { ...DEFAULTS, ...ctx.params }, survive = (1 - hpFraction(ctx.q, ctx.s, unitId)) * p.survive;
  const commander = ctx.q.commanderOf(ctx.s, unitId);
  const morale = commander ? ctx.s.persons[commander]?.morale : undefined;
  return {
    survive, attack: p.attack, attackArea: p.attack, disable: p.disable, debuff: p.debuff, capture: p.capture,
    protect: ctx.assignment?.protect ? p.protect : 0, heal: p.heal, buff: p.buff,
    scout: ctx.know.visible.length === 0 ? p.scout : p.scout * 0.2, escape: survive,
    retreat: shouldRetreat(ctx, morale, forceRatio(ctx.q, ctx.s, ctx.view, ctx.slot), p) ? p.retreat : 0,
  };
}

export function scoreCandidate(ctx: AiCtx, agent: Agent, c: Candidate): number {
  const { q, view } = ctx, p = { ...DEFAULTS, ...ctx.params }, cmd = c.cmd;
  const actor = view.units[agent.unit];
  if (!actor) return -Infinity;
  const needs = want(ctx, agent.unit);
  if (cmd.kind === "wait") return p.waitScore;
  if (cmd.kind === "end") return p.endScore;
  if (cmd.kind === "retreat") return needs.retreat! * 10;
  if (cmd.kind === "eject") return hpFraction(q, ctx.s, agent.unit) < p.ejectBelow && ctx.assignment?.allowRetreat ? needs.survive! * 5 : 0;
  const destination = c.move ?? (cmd.kind === "move" ? cmd.path.at(-1) : undefined) ?? actor.pos;
  // 原地等待也承受現有威脅；只扣移動增加的危險，避免原地攻擊被無條件壓成負分。
  const danger = p.dangerK * Math.max(0, dangerAt(ctx.danger, destination) - dangerAt(ctx.danger, actor.pos));
  if (cmd.kind === "move") {
    const enemies = Object.keys(view.units).sort().filter(id => isHostileSlot(q, view, ctx.slot, view.units[id]!.owner) && q.isActive(view, id));
    // 尚未接敵時朝公開地圖中央偵察，不讀取視野外單位的位置。
    const center = { x: Math.floor(view.map.width / 2), y: Math.floor(view.map.height / 2) };
    const nearest = (cell: Cell): number => enemies.length ? Math.min(...enemies.map(id => q.distance(cell, view.units[id]!.pos))) : q.distance(cell, center);
    return p.reposition * (nearest(actor.pos) - nearest(destination)) - danger;
  }
  let state = view, steps = 0;
  if (c.move) {
    const path = q.pathTo(view, agent.unit, c.move);
    if (path === null) return -Infinity;
    steps = path.length;
    const moved = q.previewCommand(view, { kind: "move", actor: agent.unit, path });
    if (!moved.result.ok) return -Infinity;
    state = moved.state;
  }
  const outcome = previewOutcome(q, state, cmd), weights = tacticWeights(q, state, agent.unit, cmd.ability);
  const def = q.abilityDef(cmd.ability), target = cmd.target?.unit ?? (def.target.kind === "self" ? agent.unit : undefined);
  const hit = target ? q.hitChance(state, agent.unit, cmd.ability, target, cmd.target?.part) / 100 : 1;
  const damageValue = (id: Id): number => {
    if (!state.units[id]) return 0;
    const value = valueWithFocus(q, state, id, ctx.assignment?.target, p.focusBonus);
    return value * Math.min(2, (outcome.damage[id] ?? 0) / Math.max(1, remainingHp(q, state, id))) +
      (outcome.killed.includes(id) ? value : 0);
  };
  let score = 0;
  for (const tactic of Object.keys(weights).sort()) {
    let value = 0;
    if (["attack", "disable", "debuff", "capture"].includes(tactic)) {
      value = target ? damageValue(target) : 0;
      if (tactic === "disable" && target && cmd.target?.part) {
        const part = q.partDefs(state, target).find(part => part.id === cmd.target!.part);
        if (part?.functions.some(f => def.ai.targetPref?.parts?.includes(f))) value *= 1.5;
      }
    } else if (tactic === "attackArea") {
      for (const id of [...new Set([...Object.keys(outcome.damage), ...outcome.killed])].sort()) {
        value += damageValue(id) * (q.hostile(state, agent.unit, id) ? 1 : -p.friendlyFirePenalty);
      }
    } else if (["heal", "buff", "protect"].includes(tactic)) {
      if (target && state.units[target] && !q.hostile(state, agent.unit, target)) value = 1.5 - hpFraction(q, state, target);
    } else if (tactic === "scout") {
      value = 1 + Object.keys(ctx.know.lastSeen).sort().filter(id => !ctx.know.visible.includes(id)).length;
    } else if (tactic === "escape") {
      value = Math.max(0, dangerAt(ctx.danger, actor.pos) - dangerAt(ctx.danger, destination));
    }
    score += weights[tactic]! * (needs[tactic] ?? 0) * value * hit;
  }
  return score - p.moveCost * steps - danger;
}
