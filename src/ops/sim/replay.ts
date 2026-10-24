import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { newCampaign } from "../content/start.ts";
import type { CampaignState } from "../state/types.ts";
import { applyCommand } from "../time/index.ts";
import type { BattleRunner } from "../time/index.ts";
import type { CampaignCommand } from "./campaign.ts";
import { canonicalJson } from "../../core/eventlog.ts";
import { applySortieResult } from "../sortie/run.ts";

// 保留 runner 參數相容舊呼叫；重播只消費紀錄，絕不呼叫外部 runner。
export function replayCampaign(db: ContentDB, world: WorldDB, start: string, seed: number, commands: readonly CampaignCommand[], _battle?: BattleRunner): CampaignState {
  let state = newCampaign(db, world, start.includes("/") ? start : `start/${start}`, seed);
  for (const command of commands) {
    const record = command.battle;
    let consumed = false;
    const battle: BattleRunner | undefined = record && ((s, ctx, sortie) => {
      if (canonicalJson(sortie) !== canonicalJson(record.sortie)) throw new Error("battle-record-sortie-mismatch");
      consumed = true;
      if (!record.outcome.ok) return record.outcome;
      s.rng = structuredClone(record.rng); s.effectCounter = record.effectCounter;
      if (record.result) applySortieResult(s, ctx, sortie, record.result);
      return record.outcome;
    });
    state = applyCommand(state, db, world, command, { battle }).state;
    if (record && !consumed) throw new Error("unused-battle-record");
  }
  return state;
}
