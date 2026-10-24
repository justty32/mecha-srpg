import type { CampaignEvent, CampaignState } from "./types.ts";

export const EVENT_TYPES = ["DayStart", "DaySummary", "RiftPhase", "PlaceBlighted", "PlaceReclaimed", "Arrived", "Encounter", "EventOffered", "Chosen",
  "JobDone", "WearWarning", "BrokeLoose", "Sustained", "Stiffened", "Mounted", "MyceliumOvergrown", "Suppressed", "Devoured", "MoltStarted", "Molted", "Brooded", "Mutated", "Accompanied", "NodeMastered", "WagePaid", "WageOwed", "InterestPosted", "Posted",
  "ContractOffered", "ContractAccepted", "ContractDone", "ContractFailed", "ContractCancelled", "ContractExpired", "Hired", "Left", "Died",
  "BattleResolved", "Woken", "Named", "CampaignEnd", "LostMech", "CampaignStarted", "OpsEffectApplied", "Resupplied",
  "DebtArrears", "DebtCured", "MechSeized", "DebtCleared", "SeleneEmbargo", "DebtDemand", "DebtCollection", "DebtUltimatum", "DebtBorrowed"] as const;

// SPEC-GAP：CampaignEvent 無 id；帳本來源統一為 event-<seq>，不占實體 idCounter。
export function eventRef(event: CampaignEvent): string { return `event-${event.seq}`; }
export function emit(s: Pick<CampaignState, "clock" | "log">, type: string, payload: Record<string, unknown> = {}): CampaignEvent {
  for (const [key, value] of Object.entries(payload)) {
    // 方格事件只額外允許具名的座標快照；其他 payload 仍維持純量契約。
    if ((key === "cell" || key === "loc") && value && typeof value === "object") {
      const raw = value as Record<string, unknown>, cell = (key === "cell" ? raw : raw.cell) as Record<string, unknown> | undefined;
      if (cell && Number.isSafeInteger(cell.x) && Number.isSafeInteger(cell.y) &&
        (key === "cell" || typeof raw.map === "string" && typeof raw.region === "string")) continue;
    }
    if (!(typeof value === "string" || typeof value === "number" && Number.isFinite(value))) throw new Error(`事件 payload.${key} 只准 id 與有限數字`);
  }
  const event = { seq: s.log.length, day: s.clock.day, type, payload: structuredClone(payload) };
  s.log.push(event);
  return event;
}
