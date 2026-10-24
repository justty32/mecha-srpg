import type { Id } from "../core/ids.ts";
import type { FactionSlot } from "../core/types-def.ts";
import type { BattleState, Command, FactionKnowledge, RngState } from "../core/types-state.ts";
import type { RulesQuery, ExecCommand, QueryResult } from "./rules-query.ts";
import type { Agent, AiCtx, AiParams, Assignment, Candidate } from "./policy.ts";
import { candidateKey, getPolicy, selectCandidate } from "./policy.ts";
import { maskedState, observe, updateKnowledge } from "./knowledge.ts";
import { dangerMap } from "./danger.ts";

const DEFAULTS = { maxActions: 8, maxRetries: 3, maxPureMoves: 1, band: 0.8 };

export type TurnEnv = { q: RulesQuery; s: BattleState; slot: FactionSlot; know: FactionKnowledge; assignment: Assignment | null; params: AiParams; rng: RngState; exec: ExecCommand };
export type TurnOptions = { maxActions?: number; maxRetries?: number };

export function createAgent(unit: Id, policy: Id, memory?: Record<string, unknown>): Agent {
  return { unit, policy, memory: structuredClone(memory ?? {}) };
}

export function policyFor(q: RulesQuery, s: BattleState, unitId: Id, fallback: Id): Id {
  if (s.units[unitId]?.controlMode === "berserk") return "berserk";
  const commander = q.commanderOf(s, unitId);
  if (commander && s.persons[commander]?.morale === "fleeing") return "flee";
  return fallback;
}

export function takeTurn(env: TurnEnv, agent: Agent, opts?: TurnOptions): Command[] {
  const { q, s } = env;
  const commands: Command[] = [];
  let cachedContext: AiCtx | undefined;
  const execute = (cmd: Command): QueryResult => {
    // 指令可能改變世界；連拒絕分支也重新建立決策快照。
    cachedContext = undefined;
    const result = env.exec(s, cmd);
    if (result.ok) {
      commands.push(structuredClone(cmd));
      env.know = observe(q, s, updateKnowledge(q, s, env.slot, env.know), env.slot, result.events);
    }
    return result;
  };
  // 戰鬥已分出結果就不再下指令（規則會以 battle-over 拒絕，徒增 rejected）。
  const over = (): boolean => !!s.rt?.outcome;
  const end = (): Command[] => {
    if (!over()) execute({ kind: "end", actor: agent.unit });
    return commands;
  };
  const context = (): AiCtx => {
    if (cachedContext) return cachedContext;
    const view = maskedState(q, s, env.slot, env.know, true);
    const query = q.forSnapshot?.(view) ?? q;
    return cachedContext = { q: query, s, view, slot: env.slot, know: env.know,
      danger: dangerMap(query, view, env.slot, env.know), assignment: env.assignment, params: env.params, rng: env.rng };
  };
  if (!q.isActive(s, agent.unit)) return commands;
  const maxActions = Math.max(0, Math.floor(opts?.maxActions ?? DEFAULTS.maxActions));
  const maxRetries = Math.max(1, Math.floor(opts?.maxRetries ?? DEFAULTS.maxRetries));
  const maxPureMoves = Math.max(0, Math.floor(env.params.maxPureMoves ?? DEFAULTS.maxPureMoves));
  let pureMoves = 0;
  for (let action = 0; action < maxActions; action++) {
    if (over()) return commands;
    const policy = getPolicy(policyFor(q, s, agent.unit, agent.policy));
    let ctx = context();
    // PW-07：本版沒有意圖宣告，不呼叫 precommit。
    // 手寫腳本、逃跑與失控保持各自語意；純移動額度只約束戰術策略家族。
    const limitMoves = ["tactical", "sentinel", "swarm"].includes(policy.id);
    let candidates = policy.propose(ctx, agent).filter(c => !limitMoves || c.cmd.kind !== "move" || pureMoves < maxPureMoves);
    let failures = 0;
    const reject = (candidate: Candidate): void => {
      const key = candidateKey(candidate);
      candidates = candidates.filter((c) => candidateKey(c) !== key);
      failures++;
    };
    while (true) {
      if (failures >= maxRetries) return end();
      ctx = context();
      const scored = candidates.map((c) => ({ c, score: policy.score(ctx, agent, c) }));
      // End 是無可取行動時的退路，不能用固定小正分蓋過有效的低傷害攻擊。
      const canAct = scored.some(({ c, score }) => c.cmd.kind !== "end" && Number.isFinite(score) && score > 0);
      const candidate = selectCandidate(env.rng, canAct ? scored.filter(({ c }) => c.cmd.kind !== "end") : scored,
        policy.band ?? env.params.band ?? DEFAULTS.band);
      if (!candidate) return end();
      if (candidate.move && q.distance(s.units[agent.unit]!.pos, candidate.move) !== 0) {
        const path = q.pathTo(s, agent.unit, candidate.move);
        if (!path || !execute({ kind: "move", actor: agent.unit, path }).ok) {
          reject(candidate);
          continue;
        }
        if (!q.isActive(s, agent.unit)) return commands;
      }
      if (!execute(candidate.cmd).ok) {
        reject(candidate);
        continue;
      }
      if (candidate.cmd.kind === "move") pureMoves++;
      policy.onExecuted?.(agent, candidate);
      // SPEC-GAP：wait／retreat／eject 本身終止行動，不額外送 end，以免取消等待或對離場者下指令。
      if (["end", "wait", "retreat", "eject"].includes(candidate.cmd.kind) || !q.isActive(s, agent.unit)) return commands;
      break;
    }
  }
  return end();
}
