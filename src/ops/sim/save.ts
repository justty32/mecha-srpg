import { canonicalJson, fnv1a64 } from "../../core/eventlog.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import type { CampaignState } from "../state/types.ts";
import type { CampaignCommand } from "./campaign.ts";
import type { BattleRunner } from "../time/index.ts";
import { VERBS } from "../text/index.ts";
import { replayCampaign } from "./replay.ts";
import { rebuildBlightIndex } from "../world/blight.ts";
export type CampaignBlob = { start: string; seed: number; commands: CampaignCommand[]; snapshotHash: string };
export function campaignHash(value: unknown): string { return fnv1a64(canonicalJson(value)); }
export function createCampaignBlob(start: string, seed: number, commands: readonly CampaignCommand[], state: CampaignState): CampaignBlob {
  // 存檔是 JSON 資料：先經 JSON 正規化（丟掉值為 undefined 的鍵，例如規則層 effect owner 的空 part／layer），確保序列化來回逐位相等。
  return { start, seed, commands: JSON.parse(JSON.stringify(commands)) as CampaignCommand[], snapshotHash: campaignHash(state) };
}
export function serializeCampaign(blob: CampaignBlob): string { return JSON.stringify(blob); }
export function parseCampaign(source: string): CampaignBlob {
  const raw: unknown = JSON.parse(source);
  if (!raw || typeof raw !== "object") throw new Error("invalid-campaign-blob");
  const blob = raw as Partial<CampaignBlob>;
  if (typeof blob.start !== "string" || !blob.start || !Number.isSafeInteger(blob.seed) || blob.seed! < 0 ||
      !Array.isArray(blob.commands) || !blob.commands.every(cmd => cmd && typeof cmd === "object" && VERBS.some(v => v.v === cmd.v)) ||
      typeof blob.snapshotHash !== "string" || !/^[0-9a-f]{16}$/.test(blob.snapshotHash)) throw new Error("invalid-campaign-blob");
  for (const cmd of blob.commands) if (cmd.battle !== undefined) {
    const b = cmd.battle;
    if (cmd.v !== "sortie" || !b || typeof b !== "object" || !b.sortie || typeof b.sortie.id !== "string" ||
        !b.outcome || typeof b.outcome.ok !== "boolean" || (!b.outcome.ok && typeof b.outcome.error !== "string") ||
        !b.rng || !/^[0-9a-f]{16}$/.test(b.rng.state) || !/^[0-9a-f]{16}$/.test(b.rng.inc) ||
        !Number.isSafeInteger(b.effectCounter) || b.effectCounter < 0 ||
        (b.result !== undefined && (!b.result || !Array.isArray(b.result.units) || !Array.isArray(b.result.persons) ||
          !Array.isArray(b.result.loot) || !b.result.log || typeof b.result.log.hash !== "string" ||
          (b.result.events !== undefined && !Array.isArray(b.result.events))))) throw new Error("invalid-campaign-battle-record");
  }
  return blob as CampaignBlob;
}
export function loadCampaign(db: ContentDB, world: WorldDB, input: string | CampaignBlob, battle?: BattleRunner): CampaignState {
  const blob = parseCampaign(typeof input === "string" ? input : serializeCampaign(input));
  const state = replayCampaign(db, world, blob.start, blob.seed, blob.commands, battle);
  rebuildBlightIndex(state);
  if (campaignHash(state) !== blob.snapshotHash) throw new Error("snapshot-hash-mismatch");
  return state;
}
