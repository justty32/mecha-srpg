// ai/policy — 可插拔策略介面、登記表、前段加權抽選（ai.md §三層、§第 4 步；AI-01／AI-03／TM-26）。
// 凍結契約：lead-impl-ai 寫死；policies/*.ts 載入時呼叫 registerPolicy 把自己掛上。
// Policy 是純函式插件：propose／score 不改任何狀態，隨機只用 ctx.rng（AI 專用串流，不是 s.rng）。

import type { Id, CellKey } from "../core/ids.ts";
import type { Cell, FactionSlot } from "../core/types-def.ts";
import type { BattleState, Command, FactionKnowledge, RngState } from "../core/types-state.ts";
import { pickWeighted } from "../core/rng.ts";
import type { RulesQuery } from "./rules-query.ts";

/** 危險圖：格 → 危險值（已知敵人射程＋移動＋ZoC 疊成，AI-18）。缺鍵＝0。 */
export type DangerMap = Record<CellKey, number>;

/** 陣營層給單位的分工（ai.md §三層；AI-06 stance、AI-15 接敵登記）。 */
export type Stance = "attack" | "defend" | "hold";
export type Assignment = {
  unit: Id;
  stance: Stance;
  target?: Id;          // 優先目標（集火）
  hold?: Cell;          // 要守的格
  protect?: Id;         // 要護的友方單位
  allowRetreat: boolean;
};

/** aiprofile 的 params（AiProfileDef.params）。SPEC-GAP：spec 寫 want 是 NumExpr，型別只給 number，改為係數表。 */
export type AiParams = Record<string, number>;

/** 一次決策的唯讀上下文。view 是知識狀態（knowledge.maskedState），估值與 preview 一律在 view 上跑。 */
export type AiCtx = {
  q: RulesQuery;
  s: BattleState;
  view: BattleState;
  slot: FactionSlot;
  know: FactionKnowledge;
  danger: DangerMap;
  assignment: Assignment | null;
  params: AiParams;
  rng: RngState;
};

/** 單位層代理的資料部分；決策迴圈在 agent.ts 的 takeTurn。 */
export type Agent = { unit: Id; policy: Id; memory: Record<string, unknown> };

/** 候選：可選的先移動到 move，再下 cmd（AI-09／TM-23：候選自帶目標，評估與執行同一目標）。 */
export type Candidate = { move?: Cell; cmd: Command };

export interface Policy {
  id: Id;
  /** 前段比例：取 score >= top × band 的候選加權抽；省略＝params.band ?? 0.8；berserk／scripted 用 1。 */
  band?: number;
  propose(ctx: AiCtx, agent: Agent): Candidate[];
  score(ctx: AiCtx, agent: Agent, c: Candidate): number;
  /** 意圖宣告（telegraph）的可選鉤子；本版不呼叫（PW-07，見 REPORT）。 */
  precommit?(ctx: AiCtx, agent: Agent): Candidate | null;
  /** 候選執行成功後由 agent 呼叫；只准改 agent.memory（scripted 用來推進步驟）。 */
  onExecuted?(agent: Agent, c: Candidate): void;
}

const REGISTRY: Record<string, Policy> = {};

export function registerPolicy(p: Policy): void {
  REGISTRY[p.id] = p;
}

/** 已登記的 policy id，排序。 */
export function policyIds(): Id[] {
  return Object.keys(REGISTRY).sort();
}

/** 未登記的 id 退回 "tactical"（SPEC-GAP：base 的 aiprofile 寫 policy "pack-hunter"，不在六個預設之內）。 */
export function getPolicy(id: Id): Policy {
  const p = REGISTRY[id] ?? REGISTRY["tactical"];
  if (!p) throw new Error(`policy 未登記：${id}（tactical 也未載入）`);
  return p;
}

/** 候選的決定性排序鍵。 */
export function candidateKey(c: Candidate): string {
  return JSON.stringify([c.move ? [c.move.x, c.move.y] : null, c.cmd]);
}

export type Scored = { c: Candidate; score: number };

/**
 * 第 4 步・選擇：依分數降冪（同分依 candidateKey 升冪）排序，取 score > 0 且 score >= top × band 的前段，
 * 按分數加權抽一個（band >= 1 時直接取最高）。無正分候選＝null（呼叫端改下 End）。
 */
export function selectCandidate(rng: RngState, scored: readonly Scored[], band: number): Candidate | null {
  const sorted = scored
    .filter((x) => Number.isFinite(x.score) && x.score > 0)
    .sort((a, b) => b.score - a.score || (candidateKey(a.c) < candidateKey(b.c) ? -1 : candidateKey(a.c) > candidateKey(b.c) ? 1 : 0));
  const top = sorted[0];
  if (!top) return null;
  if (band >= 1) return top.c;
  const front = sorted.filter((x) => x.score >= top.score * band);
  return pickWeighted(rng, front, (x) => x.score).c;
}
