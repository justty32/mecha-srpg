export * from "./rules-query.ts";
export * from "./policy.ts";
export * from "./knowledge.ts";
export * from "./danger.ts";
export * from "./score.ts";
export * from "./objectives.ts";
export * from "./strategy.ts";
export * from "./agent.ts";

import "./policies/tactical.ts";
import "./policies/berserk.ts";
import "./policies/swarm.ts";
import "./policies/sentinel.ts";
import "./policies/flee.ts";
import "./policies/scripted.ts";
import type { Id } from "../core/ids.ts";
import type { FactionSlot } from "../core/types-def.ts";
import type { BattleState, Command, FactionKnowledge, RngState } from "../core/types-state.ts";
import type { GameEvent } from "../core/events.ts";
import { createRng } from "../core/rng.ts";
import type { Agent, AiParams, Assignment } from "./policy.ts";
import type { RulesQuery, ExecCommand } from "./rules-query.ts";
import type { Strategy } from "./strategy.ts";
import { createDefaultStrategy } from "./strategy.ts";
import type { TurnEnv, TurnOptions } from "./agent.ts";
import { createAgent, takeTurn } from "./agent.ts";
import { emptyKnowledge, ownUnits, updateKnowledge, maskedState, observe } from "./knowledge.ts";

export const AI_RNG_STREAM = 101;
export type FactionAI = { slot: FactionSlot; strategy: Strategy; agents: Record<Id, Agent>; know: FactionKnowledge; rng: RngState;
  params: AiParams; defaultPolicy: Id; assignments: Record<Id, Assignment> };

export function createFactionAI(opts: { slot: FactionSlot; seed: number; policy?: Id; params?: AiParams;
  unitPolicies?: Record<Id, Id>; memory?: Record<Id, Record<string, unknown>> }): FactionAI {
  const defaultPolicy = opts.policy ?? "tactical";
  const agents: Record<Id, Agent> = {};
  // 尚未出場的指定單位也先保留代理，之後加入戰局時不會丟失其 policy／記憶。
  for (const unit of [...new Set([...Object.keys(opts.unitPolicies ?? {}), ...Object.keys(opts.memory ?? {})])].sort()) {
    agents[unit] = createAgent(unit, opts.unitPolicies?.[unit] ?? defaultPolicy, opts.memory?.[unit]);
  }
  return { slot: opts.slot, strategy: createDefaultStrategy(), agents, know: emptyKnowledge(),
    rng: createRng(opts.seed, AI_RNG_STREAM), params: { ...opts.params }, defaultPolicy, assignments: {} };
}

export function startRound(ai: FactionAI, q: RulesQuery, s: BattleState): void {
  ai.know = updateKnowledge(q, s, ai.slot, ai.know);
  const view = maskedState(q, s, ai.slot, ai.know);
  const plans = ai.strategy.roundPlan({ q, s, view, slot: ai.slot, know: ai.know, params: ai.params });
  ai.assignments = {};
  for (const assignment of plans) ai.assignments[assignment.unit] = assignment;
  for (const unit of ownUnits(q, s, ai.slot)) ai.agents[unit] ??= createAgent(unit, ai.defaultPolicy);
}

export function runUnitTurn(ai: FactionAI, q: RulesQuery, s: BattleState, unitId: Id, exec: ExecCommand, opts?: TurnOptions): Command[] {
  if (!s.units[unitId] || s.units[unitId]!.owner !== ai.slot || !q.isActive(s, unitId)) return [];
  const agent = ai.agents[unitId] ??= createAgent(unitId, ai.defaultPolicy);
  ai.know = updateKnowledge(q, s, ai.slot, ai.know);
  const env: TurnEnv = { q, s, slot: ai.slot, know: ai.know, assignment: ai.assignments[unitId] ?? null,
    params: ai.params, rng: ai.rng, exec: (state, cmd) => {
      const result = exec(state, cmd);
      if (result.ok) for (const ev of result.events) ai.strategy.onEvent(ev);
      return result;
    } };
  const commands = takeTurn(env, agent, opts);
  ai.know = env.know;
  return commands;
}

export function observeEvents(ai: FactionAI, q: RulesQuery, s: BattleState, events: readonly GameEvent[]): void {
  ai.know = observe(q, s, updateKnowledge(q, s, ai.slot, ai.know), ai.slot, events);
  for (const ev of events) ai.strategy.onEvent(ev);
}
