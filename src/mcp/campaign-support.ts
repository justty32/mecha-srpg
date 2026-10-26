import { placeAt } from "../ops/war/loc.ts";
import type { WorldDB } from "../ops/content/worlddb.ts";
import type { CampaignState, OpsCommand } from "../ops/state/types.ts";
import type { BattleRunner, CmdResult } from "../ops/time/index.ts";
import { defaultBattleRunner } from "../ops/sim/index.ts";
import type { CampaignCommand } from "../ops/sim/campaign.ts";
import { ToolError } from "./tool.ts";
import type { JsonSchema } from "./tool.ts";

export type Session = { id: string; start: string; seed: number; state: CampaignState; commands: CampaignCommand[]; viewed: number;
  pending?: { battle: string; cmd: Extract<OpsCommand, { v: "sortie" }>; sortie: BattleRecord["sortie"] } };
export type BattleRecord = NonNullable<CampaignCommand["battle"]>;
export const idSchema: JsonSchema = { type: "string", description: "campaign_new／load 回傳的 id" };
export const seedSchema: JsonSchema = { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER };
export const startSchema: JsonSchema = { type: "string", default: "default" };

// actions 與省略 sortie 的 begin 共用同一份候選，避免選到不同編成。
export function sortieOptions(state: CampaignState, world: WorldDB): { sortie: Extract<OpsCommand, { v: "sortie" }>["sortie"]; label: string; disabled?: string }[] {
  const units = state.hangar.bays.flatMap(m => { const mech = m ? state.mechs[m] : undefined;
    return mech && (mech.seats.pilot || mech.crew === "ai") ? [{ mech: mech.id, seats: { ...mech.seats },
      controlMode: mech.seats.pilot ? "pilot" as const : Object.values(mech.seats).some(Boolean) ? mech.controlMode : "scripted" as const,
      ...(mech.crew === "ai" ? { crew: "ai" as const } : {}) }] : []; });
  if (state.pendingBattle) {
    const selected = state.pendingBattle.units.length ? state.pendingBattle.units : units;
    return [{ sortie: { units: selected }, label: "出戰", ...(!selected.length ? { disabled: "機庫沒有已派駕駛的機甲；先 assign" } : {}) }];
  }
  return Object.values(state.contracts).filter(c => ["active", "stage"].includes(c.status) && c.target.place === placeAt(state, { world }, state.ship.pos)).map(c => ({
    sortie: { contract: c.id, place: c.target.place, loc: state.ship.pos, units }, label: `出戰契約 ${c.id}（${units.length} 台）`,
    ...(!units.length ? { disabled: "機庫沒有已派駕駛的機甲；先 assign" } : {}),
  }));
}
export function requireIdle(s: Session): void {
  if (s.pending) throw new ToolError("出戰進行中：先 campaign_sortie_finish 或 campaign_sortie_cancel");
}

export function integer(value: unknown, label: string, min = 0): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) throw new ToolError(`${label} 必須是不小於 ${min} 的安全整數。`);
  return value;
}
export function startId(value: unknown): string {
  const start = value ?? "default";
  if (typeof start !== "string" || !start.trim()) throw new ToolError("start 必須是開局名稱。");
  return start.includes("/") ? start : `start/${start}`;
}
export function explain(code: string): string {
  const messages: Record<string, string> = {
    "pending-choice": "要先 choose 處理待選事件。", "invalid-choice": "請選擇畫面列出的選項序號。",
    "choice-disabled": "此選項的條件尚未成立。", "name-required": "此選項需要另行輸入名稱，請選擇其他選項。",
    "invalid-days": "天數必須是正整數。", "no-exit": "目前房間沒有這個出口。",
    "not-offered": "這份契約目前無法承接。", "empty-sortie": "請在 sortie.units 提供出戰機甲、seats 與 controlMode。",
    "pending-encounter": "請先處理待選事件或出戰。", "insufficient-cash": "現金不足。",
    "insufficient-fuel": "燃料不足。", "ship-not-overhead": "船不在目標上空，請先航行或關閉 shipOverhead。",
    "not-docked": "請先在目標節點停泊。", "inactive-contract": "出戰契約尚未承接或已結束。",
  };
  return messages[code] ?? "指令未符合目前條件；請查看畫面與 campaign_actions，調整參數後重試。";
}

// 與 runCampaign 相同：記錄生成後 RNG、戰果與效果流水號，重播不重新抽戰鬥。
export function recordingBattle(record: CampaignCommand, runner: BattleRunner = defaultBattleRunner): BattleRunner {
  return (state, ctx, sortie) => {
    const outcome = runner(state, ctx, sortie) as CmdResult & { result?: BattleRecord["result"] };
    const result = outcome.ok && outcome.result ? structuredClone(outcome.result) : undefined;
    if (result) for (const entry of [...result.units, ...result.persons]) for (const pool of Object.values(entry.state.pools)) {
      if (pool.max === Infinity) pool.max = Number.MAX_SAFE_INTEGER;
    }
    record.battle = { sortie: structuredClone(sortie), outcome: outcome.ok ? { ok: true } : { ok: false, error: outcome.error },
      ...(result ? { result } : {}), rng: structuredClone(state.rng), effectCounter: state.effectCounter };
    return outcome;
  };
}

export function battleSummary(record: CampaignCommand) {
  const battle = record.battle, result = battle?.result;
  if (!battle || !result) return undefined;
  const units = new Set(battle.sortie.units.map(u => u.mech));
  const people = new Set(battle.sortie.units.flatMap(u => Object.values(u.seats)));
  return { winner: result.winner ?? "none", outcome: result.winner === "player" ? "勝利" : result.winner ? "敗北" : "未分勝負",
    rounds: result.rounds,
    losses: { mechs: result.units.filter(u => units.has(u.id) && ["dead", "derelict-lost"].includes(u.status)).map(u => u.id),
      persons: result.persons.filter(p => people.has(p.id) && (p.status === "dead" || p.state.pools.hp?.cur === 0)).map(p => p.id) } };
}

