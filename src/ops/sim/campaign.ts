import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import type { CampaignState, OpsCommand, Sortie } from "../state/types.ts";
import type { BattleResult } from "../sortie/apply.ts";
import { applyCommand } from "../time/index.ts";
import type { BattleRunner, CmdResult } from "../time/index.ts";
import { dailySummary } from "../time/tick.ts";
import { checkInvariants } from "./invariants.ts";
import { policies } from "./policies.ts";
import type { Policy, PolicyName } from "./policies.ts";
export type MonthSummary = ReturnType<typeof dailySummary> & { month: number; day: number };
// SPEC-GAP：戰果附在指令紀錄；RNG／效果流水號保存情境生成消耗，重播不再生成情境。
export type CampaignCommand = OpsCommand & { battle?: { sortie: Sortie; outcome: CmdResult; result?: BattleResult;
  rng: CampaignState["rng"]; effectCounter: number } };
export type CampaignOptions = { db: ContentDB; world: WorldDB; start: string; seed: number; months: number;
  policy: Policy | PolicyName; battle?: BattleRunner; onDay?: (s: CampaignState) => void; continueAfterEnd?: boolean };

export function runCampaign(options: CampaignOptions): { state: CampaignState; commands: CampaignCommand[]; summary: MonthSummary[] } {
  const { db, world, start, seed, months, battle } = options;
  if (!Number.isSafeInteger(months) || months < 0) throw new RangeError("invalid-months");
  const policy = typeof options.policy === "string" ? policies[options.policy] : options.policy;
  if (!policy) throw new Error("unknown-policy");
  let state = newCampaign(db, world, start.includes("/") ? start : `start/${start}`, seed);
  const firstDay = state.clock.day, daysPerMonth = world.require("calendar", state.calendar).daysPerMonth;
  const target = firstDay + months * daysPerMonth;
  if (!Number.isSafeInteger(target)) throw new RangeError("invalid-months");
  const commands: CampaignCommand[] = [], summary: MonthSummary[] = [];
  const verify = (s: CampaignState) => {
    const errors = checkInvariants(s, world);
    if (errors.length) throw new Error(`seed=${seed} day=${s.clock.day}: ${errors.join("; ")}`);
  };
  verify(state);
  const execute = (cmd: OpsCommand) => {
    const record: CampaignCommand = structuredClone(cmd);
    commands.push(record);
    const recording: BattleRunner | undefined = battle && ((s, ctx, sortie) => {
      const outcome = battle(s, ctx, sortie) as CmdResult & { result?: BattleResult };
      const result = outcome.ok && outcome.result ? structuredClone(outcome.result) : undefined;
      // 營運回寫本就把無上限池轉為有限值；紀錄採相同表示，JSON 不遺失 Infinity。
      if (result) for (const entry of [...result.units, ...result.persons]) for (const pool of Object.values(entry.state.pools)) {
        if (pool.max === Infinity) pool.max = Number.MAX_SAFE_INTEGER;
      }
      record.battle = { sortie: structuredClone(sortie), outcome: outcome.ok ? { ok: true } : { ok: false, error: outcome.error },
        ...(result ? { result } : {}), rng: structuredClone(s.rng), effectCounter: s.effectCounter };
      return outcome;
    });
    const output = applyCommand(state, db, world, cmd, { battle: recording, onDay(s) {
      verify(s); options.onDay?.(s);
      const elapsed = s.clock.day - firstDay;
      if (elapsed > 0 && elapsed % daysPerMonth === 0 && s.clock.day <= target) summary.push({ month: elapsed / daysPerMonth, day: s.clock.day, ...dailySummary(s, createOpsCtx(s, db, world)) });
    } });
    state = output.state; verify(state);
    return output.result;
  };
  while ((state.clock.day < target || state.pendingChoices.length) &&
    (options.continueAfterEnd || !state.log.some(e => e.type === "CampaignEnd"))) {
    const beforeDay = state.clock.day, beforePrompt = JSON.stringify(state.pendingChoices);
    const ended = state.log.some(e => e.type === "CampaignEnd");
    const cmd = (ended ? policies.idle : policy)(structuredClone(state), createOpsCtx(state, db, world));
    const result = execute(cmd);
    if (state.pendingChoices.length) {
      if (!result.ok || beforePrompt === JSON.stringify(state.pendingChoices)) throw new Error(`policy-stalled seed=${seed} day=${state.clock.day} command=${JSON.stringify(cmd)}`);
      continue;
    }
    // SPEC-GAP：零耗日指令或假 runner 不得形成無限迴圈；每次策略行動後至少推進一天。
    if (state.clock.day === beforeDay && state.clock.day < target) execute({ v: "wait", days: 1 });
  }
  return { state, commands, summary };
}
