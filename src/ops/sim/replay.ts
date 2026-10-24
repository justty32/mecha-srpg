import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { newCampaign } from "../content/start.ts";
import type { CampaignState, OpsCommand } from "../state/types.ts";
import { applyCommand } from "../time/index.ts";
import type { BattleRunner } from "../time/index.ts";

// SPEC-GAP：v1 依交接書重跑戰鬥；runSortie 從營運 RNG 抽 seed，重播須注入同一 runner。
export function replayCampaign(db: ContentDB, world: WorldDB, start: string, seed: number, commands: readonly OpsCommand[], battle?: BattleRunner): CampaignState {
  let state = newCampaign(db, world, start.includes("/") ? start : `start/${start}`, seed);
  for (const command of commands) state = applyCommand(state, db, world, command, { battle }).state;
  return state;
}
