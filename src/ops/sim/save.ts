import { canonicalJson, fnv1a64 } from "../../core/eventlog.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import type { CampaignState, OpsCommand } from "../state/types.ts";
import type { BattleRunner } from "../time/index.ts";
import { VERBS } from "../text/index.ts";
import { replayCampaign } from "./replay.ts";
export type CampaignBlob = { start: string; seed: number; commands: OpsCommand[]; snapshotHash: string };
export function campaignHash(value: unknown): string { return fnv1a64(canonicalJson(value)); }
export function createCampaignBlob(start: string, seed: number, commands: readonly OpsCommand[], state: CampaignState): CampaignBlob {
  return { start, seed, commands: structuredClone([...commands]), snapshotHash: campaignHash(state) };
}
export function serializeCampaign(blob: CampaignBlob): string { return JSON.stringify(blob); }
export function parseCampaign(source: string): CampaignBlob {
  const raw: unknown = JSON.parse(source);
  if (!raw || typeof raw !== "object") throw new Error("invalid-campaign-blob");
  const blob = raw as Partial<CampaignBlob>;
  if (typeof blob.start !== "string" || !blob.start || !Number.isSafeInteger(blob.seed) || blob.seed! < 0 ||
      !Array.isArray(blob.commands) || !blob.commands.every(cmd => cmd && typeof cmd === "object" && VERBS.some(v => v.v === cmd.v)) ||
      typeof blob.snapshotHash !== "string" || !/^[0-9a-f]{16}$/.test(blob.snapshotHash)) throw new Error("invalid-campaign-blob");
  return blob as CampaignBlob;
}
export function loadCampaign(db: ContentDB, world: WorldDB, input: string | CampaignBlob, battle?: BattleRunner): CampaignState {
  const blob = parseCampaign(typeof input === "string" ? input : serializeCampaign(input));
  const state = replayCampaign(db, world, blob.start, blob.seed, blob.commands, battle);
  if (campaignHash(state) !== blob.snapshotHash) throw new Error("snapshot-hash-mismatch");
  return state;
}
