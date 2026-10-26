import type { Id } from "../core/ids.ts";
import { GRADES } from "../core/types-def.ts";
import type { AbilityDef, Cell, FactionSlot } from "../core/types-def.ts";
import type { BattleState, Command } from "../core/types-state.ts";
import { createRng } from "../core/rng.ts";
import type { RulesQuery } from "./rules-query.ts";
import type { AiCtx, Agent, Candidate } from "./policy.ts";
import { dangerAt, threatOf } from "./danger.ts";
import { isHostileSlot } from "./hostility.ts";
import { shouldRetreat } from "./retreat.ts";
import { OBJECTIVE_DEFAULTS, objectiveInfo, objectiveMoveValue, objectiveTargetFactor } from "./objectives.ts";
import type { AiParams } from "./policy.ts";
import { pursuitCells } from "./knowledge.ts";
import { isSupport, supportKind, supportDelta, supportCost, supportUsed, SUPPORT_DEFAULTS } from "./support.ts";

const DEFAULTS = {
  survive: 1, heal: 1, buff: 0.5, attack: 1, disable: 0.5, debuff: 0.5, capture: 0, protect: 1, scout: 0.3,
  retreat: 1, focusBonus: 1.5, friendlyFirePenalty: 1, enemyBuffPenalty: 1, reposition: 0.3, waitScore: 0, endScore: 0.01,
  ejectBelow: 0.15, moveCost: 0.01, dangerK: 0.01, band: 0.8,
  tries: 3, scriptedPreviewSeed: 1026, previewSeed: 1000, previewStream: 7, forceFloor: 1e-6,
  retreatForceRatio: 0.5, retreatMinRound: 3, retreatDamage: 0.35,
  objCapture: 2, captureValue: 1, debuffControl: 0.5, debuffAttr: 0.02, debuffMark: 0.25,
  objHpScale: 200, partAimProgress: 1,
};

export const TACTICS: readonly string[] = ["attack", "attackArea", "disable", "heal", "buff", "debuff", "escape", "protect", "capture", "scout"];

export function tacticWeights(q: RulesQuery, s: BattleState, actor: Id, abilityId: Id): Record<string, number> {
  const tactics = q.abilityDef(abilityId).ai.tactics;
  return Object.fromEntries(Object.keys(tactics).sort().map(t => [t, q.evalNum(s, tactics[t]!, actor)]));
}

function remainingHp(q: RulesQuery, s: BattleState, unitId: Id): number {
  return q.partDefs(s, unitId).reduce((sum, p) => sum + (s.units[unitId]?.parts[p.id]?.layers ?? []).reduce((n, l) => n + l.hp, 0), 0);
}

// 死亡規則要求 core 全毀；沒有 structural 層的部位不會因受傷而毀損。
// 只讀知識快照，未偵察的內層仍以公開最大 HP 估計。
export function lethalParts(q: RulesQuery, view: BattleState, unitId: Id) {
  return q.partDefs(view, unitId).filter(part => part.functions.includes("core")
    && !view.units[unitId]?.parts[part.id]?.broken
    && q.layerDefs(view, unitId, part.id).some(layer => layer.structural));
}

export function hpFraction(q: RulesQuery, s: BattleState, unitId: Id): number {
  const max = q.partDefs(s, unitId).reduce((sum, p) => sum + q.layerDefs(s, unitId, p.id).reduce((n, l) => n + l.hp, 0), 0);
  return max > 0 ? Math.max(0, Math.min(1, remainingHp(q, s, unitId) / max)) : 0;
}

export type PreviewOutcome = { damage: Record<Id, number>; killed: Id[]; hitRuns: number; runs: number };

export function previewOutcome(q: RulesQuery, view: BattleState, cmd: Command, move?: Cell, tries: number = DEFAULTS.tries,
  inspect?: (preview: ReturnType<RulesQuery["previewCommand"]>, before: BattleState) => void): PreviewOutcome {
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
  // 無人機常落在最低命中率；補一個首骰為 0 的固定樣本，避免武器被估成零傷害。
  const samples = tries + (state.units[cmd.actor]?.controlMode === "scripted" ? 1 : 0);
  for (let i = 0; i < samples; i++) {
    const preview = q.previewCommand({ ...state, rng: createRng(i === tries ? DEFAULTS.scriptedPreviewSeed : DEFAULTS.previewSeed + i, DEFAULTS.previewStream) }, cmd);
    const { result } = preview;
    outcome.runs++;
    if (!result.ok) continue;
    inspect?.(preview, state);
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

function valueWithFocus(q: RulesQuery, view: BattleState, target: Id, focus: Id | undefined, bonus: number, factor = 1): number {
  return (1 + GRADES.indexOf(q.unitGrade(view, target))) * (1 + threatOf(q, view, target)) *
    (1.5 - hpFraction(q, view, target)) * (target === focus ? bonus : 1) * factor;
}

export function targetValue(q: RulesQuery, view: BattleState, target: Id, focus?: Id, objective?: { slot: FactionSlot; params: AiParams }): number {
  return valueWithFocus(q, view, target, focus, objective?.params.focusBonus ?? DEFAULTS.focusBonus,
    objective ? objectiveTargetFactor(objectiveInfo(q, view, objective.slot), target, objective.params) : 1);
}

export function forceRatio(q: RulesQuery, s: BattleState, view: BattleState, slot: FactionSlot): number {
  const force = (state: BattleState, own: boolean): number => Object.keys(state.units).sort()
    .filter(id => !isHostileSlot(q, state, slot, state.units[id]!.owner) === own && q.isActive(state, id))
    .reduce((sum, id) => sum + threatOf(q, state, id) * hpFraction(q, state, id), 0);
  return force(s, true) / Math.max(DEFAULTS.forceFloor, force(view, false));
}

export function want(ctx: AiCtx, unitId: Id, target?: Id): Record<string, number> {
  // SPEC-GAP：profile params 僅允許數值，以契約固定公式套用係數。
  const p = { ...DEFAULTS, ...ctx.params }, survive = (1 - hpFraction(ctx.q, ctx.s, unitId)) * p.survive;
  const commander = ctx.q.commanderOf(ctx.s, unitId);
  const morale = commander ? ctx.s.persons[commander]?.morale : undefined;
  return {
    survive, attack: p.attack, attackArea: p.attack, disable: p.disable, debuff: p.debuff,
    capture: p.capture + (target && objectiveInfo(ctx.q, ctx.view, ctx.slot).spare.includes(target) ? p.objCapture : 0),
    protect: p.protect, heal: p.heal, buff: p.buff,
    scout: ctx.know.visible.length === 0 ? p.scout : p.scout * 0.2, escape: survive,
    retreat: shouldRetreat(ctx, morale, forceRatio(ctx.q, ctx.s, ctx.view, ctx.slot), p, unitId) ? p.retreat : 0,
  };
}

// RulesQuery 不暴露 EffectDef：由真預覽安裝的 contribs 與 unitTags 讀取其公開效果。
// refresh／ignore 不產生新實例或 stacks，重複價值為零；merge／stack 仍計新增部分。
function debuffValues(q: RulesQuery, before: BattleState, after: BattleState, actor: Id, def: AbilityDef,
  p: typeof DEFAULTS, targets: Set<Id>): Record<Id, number> {
  const refs = new Set(def.effects.filter(g => g.on === "hit" || g.on === "always")
    .flatMap(g => g.apply.map(r => typeof r === "string" ? r : r.effect)));
  const values: Record<Id, number> = {};
  for (const id of targets) {
    const u = after.units[id];
    if (!u) continue;
    const owners = [u, ...Object.values(u.seats).flatMap(pid => pid && after.persons[pid] ? [after.persons[pid]!] : [])];
    const old = [before.units[id]!, ...Object.values(before.units[id]!.seats)
      .flatMap(pid => pid && before.persons[pid] ? [before.persons[pid]!] : [])].flatMap(o => o.effects);
    const baseline = { ...after, units: { ...after.units, [id]: { ...u, effects: [] } } };
    const baseTags = q.unitTags(baseline, id);
    for (const owner of owners) for (const inst of owner.effects) {
      if (inst.source !== actor || !refs.has(inst.effect)) continue;
      const previous = old.find(e => e.uid === inst.uid);
      if (previous && inst.stacks <= previous.stacks) continue;
      const isolated = { ...after, units: { ...after.units, [id]: { ...u, effects: [inst] } } };
      const tags = q.unitTags(isolated, id).filter(t => !baseTags.includes(t));
      let value = tags.reduce((sum, tag) => sum + (tag === "marked" ? p.debuffMark
        : ["stagger", "suppressed", "jammed", "numb", "restraint"].includes(tag) ? p.debuffControl : 0), 0);
      for (const c of owner.contribs.filter(c => inst.contribIds.includes(c.id) && c.path.includes(".attrs."))) {
        const n = q.evalNum(after, c.value, id);
        const loss = c.op === "add" ? -n : c.op === "mul" ? 1 - n
          : c.op === "min" || c.op === "set" ? q.evalNum(before, { ref: c.path }, id) - n : 0;
        value += p.debuffAttr * Math.max(0, loss);
      }
      values[id] = (values[id] ?? 0) + value;
    }
  }
  return values;
}

function captureProximity(q: RulesQuery, view: BattleState, id: Id): number {
  const parts = q.partDefs(view, id).filter(p => p.functions.includes("locomotion"));
  const max = parts.reduce((n, p) => n + q.layerDefs(view, id, p.id).reduce((n, l) => n + l.hp, 0), 0);
  const hp = parts.reduce((n, p) => n + (view.units[id]!.parts[p.id]?.layers ?? []).reduce((n, l) => n + l.hp, 0), 0);
  return max > 0 ? Math.max(0, Math.min(1, 1 - hp / max)) : 0;
}

export function scoreCandidate(ctx: AiCtx, agent: Agent, c: Candidate): number {
  const { q, view } = ctx, p = { ...DEFAULTS, ...ctx.params }, cmd = c.cmd;
  const actor = view.units[agent.unit];
  if (!actor) return -Infinity;
  const needs = want(ctx, agent.unit, cmd.kind === "useAbility" ? cmd.target?.unit : undefined);
  if (cmd.kind === "wait") return p.waitScore;
  if (cmd.kind === "end") return p.endScore;
  if (cmd.kind === "retreat") return objectiveInfo(q, view, ctx.slot).exitUnits.includes(agent.unit)
    && view.rt?.exits.some(c => q.distance(c, actor.pos) === 0)
    ? Math.max(needs.retreat! * 10, (ctx.params.objExit ?? OBJECTIVE_DEFAULTS.objExit) * 10) : needs.retreat! * 10;
  if (cmd.kind === "eject") return hpFraction(q, ctx.s, agent.unit) < p.ejectBelow && ctx.assignment?.allowRetreat ? needs.survive! * 5 : 0;
  const destination = c.move ?? (cmd.kind === "move" ? cmd.path.at(-1) : undefined) ?? actor.pos;
  const objectiveMove = objectiveMoveValue(ctx, agent.unit, actor.pos, destination);
  // 原地等待也承受現有威脅；只扣移動增加的危險，避免原地攻擊被無條件壓成負分。
  const danger = p.dangerK * Math.max(0, dangerAt(ctx.danger, destination) - dangerAt(ctx.danger, actor.pos));
  if (cmd.kind === "move") {
    const targets = pursuitCells(ctx, agent.unit);
    const nearest = (cell: Cell): number => Math.min(...targets.map(target => q.distance(cell, target)));
    return p.reposition * (nearest(actor.pos) - nearest(destination)) - danger + objectiveMove;
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
  const def = q.abilityDef(cmd.ability), target = cmd.target?.unit ?? (def.target.kind === "self" ? agent.unit : undefined);
  const support = isSupport(def) ? supportKind(ctx, def, agent.unit) : undefined;
  if (support && supportUsed(agent, view.round, cmd.ability)) return -Infinity;
  let supportValue = 0, offensiveChanged = false;
  const areaTargets = new Set<Id>(), effects: Record<Id, number> = {}, hits: Record<Id, number> = {};
  const inspectEffects = def.effects.length > 0 && (def.ai.tactics.debuff !== undefined || def.ai.tactics.disable !== undefined);
  const outcome = previewOutcome(q, state, cmd, undefined, DEFAULTS.tries, ({ result, state: after }, before) => {
    if (!result.ok) return;
    if (support?.measured) supportValue += supportDelta(ctx, agent.unit, def, before, after);
    if (support?.measured && support.offensive) offensiveChanged ||= Object.keys(before.units).some(id => after.units[id]
      && (["accuracy", "initiative"] as const).some(attr => q.roleAttr(after, id, attr) > q.roleAttr(before, id, attr)));
    const affected = new Set<Id>();
    for (const e of result.events) if ((e.type === "Hit" || e.type === "Miss") && e.payload.unit === cmd.actor
      && e.payload.ability === cmd.ability && typeof e.payload.target === "string") {
      areaTargets.add(e.payload.target); affected.add(e.payload.target);
      if (e.type === "Hit") hits[e.payload.target] = (hits[e.payload.target] ?? 0) + 1;
    }
    if (inspectEffects) for (const [id, value] of Object.entries(debuffValues(q, before, after, agent.unit, def, p, affected))) {
      effects[id] = (effects[id] ?? 0) + value;
    }
  }), weights = tacticWeights(q, state, agent.unit, cmd.ability);
  const hit = target ? q.hitChance(state, agent.unit, cmd.ability, target, cmd.target?.part) / 100 : 1;
  const damageValue = (id: Id): number => {
    if (!state.units[id]) return 0;
    const info = objectiveInfo(q, view, ctx.slot);
    const factor = objectiveTargetFactor(info, id, ctx.params);
    const value = valueWithFocus(q, state, id, ctx.assignment?.target, p.focusBonus, factor);
    const damage = outcome.damage[id] ?? 0;
    const core = id === target && cmd.target?.part && q.hostile(state, agent.unit, id)
      ? lethalParts(q, state, id).find(part => part.id === cmd.target!.part) : undefined;
    const hp = core ? state.units[id]!.parts[core.id]!.layers.reduce((sum, layer) => sum + layer.hp, 0)
      : remainingHp(q, state, id);
    const ratio = damage / Math.max(1, hp) * (core ? p.partAimProgress : 1);
    return value * Math.min(2, factor > 1 ? Math.max(ratio, damage / Math.max(1, p.objHpScale)) : ratio) +
      (outcome.killed.includes(id) ? value * (info.spare.includes(id) ? -(ctx.params.objSpare ?? OBJECTIVE_DEFAULTS.objSpare) : 1) : 0);
  };
  let score = 0, oldSupport = 0;
  for (const tactic of Object.keys(weights).sort()) {
    let value = 0;
    if (["attack", "disable", "debuff", "capture"].includes(tactic)) {
      value = target ? damageValue(target) : 0;
      if (tactic === "capture" && target && state.units[target]) {
        value += p.captureValue * captureProximity(q, state, target) * targetValue(q, state, target,
          ctx.assignment?.target, { slot: ctx.slot, params: ctx.params });
      }
      if (tactic === "debuff" || tactic === "disable") {
        for (const id of target ? [target] : [...areaTargets]) {
          if (!state.units[id]) continue;
          const effect = (effects[id] ?? 0) / Math.max(1, hits[id] ?? 0) * targetValue(q, state, id,
            ctx.assignment?.target, { slot: ctx.slot, params: ctx.params });
          value += (effect + (target ? 0 : damageValue(id))) * (target ? 1 : q.hitChance(state, agent.unit, cmd.ability, id) / 100)
            * (q.hostile(state, agent.unit, id) ? 1 : -p.friendlyFirePenalty);
        }
      }
      if (tactic === "disable" && target && cmd.target?.part) {
        const part = q.partDefs(state, target).find(part => part.id === cmd.target!.part);
        if (part?.functions.some(f => def.ai.targetPref?.parts?.includes(f))) value *= 1.5;
      }
    } else if (tactic === "attackArea") {
      for (const id of [...new Set([...Object.keys(outcome.damage), ...outcome.killed])].sort()) {
        value += damageValue(id) * (q.hostile(state, agent.unit, id) ? 1 : -p.friendlyFirePenalty);
      }
    } else if (["heal", "buff", "protect"].includes(tactic)) {
      if (["ball", "line", "cone"].includes(def.target.kind)) {
        for (const id of areaTargets) if (state.units[id]) {
          value += (1.5 - hpFraction(q, state, id)) * (q.hostile(state, agent.unit, id) ? -p.enemyBuffPenalty : 1);
        }
      } else if (target && state.units[target] && !q.hostile(state, agent.unit, target)) value = 1.5 - hpFraction(q, state, target);
    } else if (tactic === "scout") {
      value = 1 + Object.keys(ctx.know.lastSeen).sort().filter(id => !ctx.know.visible.includes(id)).length;
    } else if (tactic === "escape") {
      value = Math.max(0, dangerAt(ctx.danger, actor.pos) - dangerAt(ctx.danger, destination));
    }
    const term = weights[tactic]! * (needs[tactic] ?? 0) * value * hit;
    if (support?.measured && ["heal", "buff", "protect"].includes(tactic)) oldSupport += term;
    else score += term;
  }
  if (support?.measured) {
    const sp = { ...SUPPORT_DEFAULTS, ...ctx.params };
    const benefit = supportValue / Math.max(1, outcome.runs);
    const multiplier = Math.max((weights.buff ?? 0) * p.buff * sp.supportBuffScale,
      (weights.protect ?? 0) * p.protect, (weights.heal ?? 0) * p.heal, (weights.escape ?? 0) * sp.supportEscape);
    const measured = multiplier * benefit - supportCost(ctx, agent.unit, def, state);
    const useful = support.offensive && offensiveChanged ? Math.max(measured, oldSupport) : measured;
    // 位移進展仍可用純 Move；無收益施法不得靠任務分／逃離分復活。
    if (useful <= 0 && !["attack", "attackArea", "disable", "debuff", "scout"].some(t => (weights[t] ?? 0) > 0)) return -Infinity;
    score += useful;
  }
  return score - p.moveCost * steps - danger + objectiveMove;
}
