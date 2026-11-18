import { EVENT_TYPES } from "../state/events.ts";
import type { CampaignEvent, CampaignState, Screen, TemplatesDef } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { entityName } from "./parse.ts";

export function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{([\w.-]+)\}/g, (_match, path: string) => {
    let value: unknown = values;
    for (const key of path.split(".")) {
      if (!value || typeof value !== "object" || ["__proto__", "prototype", "constructor"].includes(key) || !Object.hasOwn(value, key)) return "";
      value = (value as Record<string, unknown>)[key];
    }
    if (value && typeof value === "object" && "name" in value) value = value.name;
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
  });
}
export function templateEntries(world: WorldDB): TemplatesDef["entries"] {
  const entries: TemplatesDef["entries"] = {};
  // 後載 pack 優先；同 pack 依模板 id 排序，允許補充模板覆蓋地基佔位句。
  for (const pack of world.packs) for (const def of world.all("templates").filter(d => d.id.startsWith(`${pack.id}:`))) Object.assign(entries, def.entries);
  return entries;
}
export function eventLog(event: CampaignEvent, state: CampaignState, world: WorldDB): Screen["log"][number] {
  const template = templateEntries(world)[event.type];
  const values: Record<string, unknown> = { ...event.payload, day: event.day };
  for (const [key, value] of Object.entries(values)) if (typeof value === "number") values[key] = Number(value.toFixed(1));
  for (const [key, value] of Object.entries(event.payload)) if (typeof value === "string") values[key] = { id: value, name: entityName(value, state, world) };
  if (event.type === "Named" && typeof event.payload.mech === "string") {
    const index = typeof event.payload.index === "number" ? event.payload.index : undefined;
    const names = state.roster.names[event.payload.mech];
    values.name = index === undefined ? names?.at(-1)?.name : names?.[index]?.name;
  }
  // 舊事件可能省略對象（如離職後薪資紀錄）；逐欄提供可讀備援，保留 interpolate 的通用語意。
  for (const match of template?.text.matchAll(/\{([\w.-]+)\}/g) ?? []) {
    const key = match[1]!.split(".")[0]!;
    if (values[key] === undefined || values[key] === "") values[key] = { name: ({ person: "船員", node: "當地", mech: "機甲", to: "目的地", from: "原地", amount: "未記錄", days: "若干" } as Record<string, string>)[key] ?? "未記錄" };
  }
  const revealed = typeof event.payload.event === "string" ? world.get("event", event.payload.event) : undefined;
  if (event.type === "EventOffered" && template?.text === "有件事等你拍板。" && revealed) {
    return { day: event.day, text: revealed.text, kind: template.kind };
  }
  if (event.type === "Chosen" && template?.text === "你做了決定，船上的人照做。" && revealed &&
      typeof event.payload.choice === "number" && Number.isSafeInteger(event.payload.choice) && event.payload.choice >= 1) {
    const choice = revealed.choices[event.payload.choice - 1];
    if (choice) return { day: event.day, text: `你選擇：${choice.text}`, kind: template.kind };
  }
  return { day: event.day, text: template ? interpolate(template.text, values) : "天網收到一則新動態。", kind: template?.kind ?? "info" };
}

const backgroundSummary: Record<string, (count: number) => string> = {
  ActorSpawned: count => `天網收到 ${count} 則行動訊號。`,
  Sighted: count => `瞭望員回報 ${count} 則附近隊伍目擊情報，可到世界圖查看。`,
  WorldAction: count => `天網收到 ${count} 則勢力動向。`,
  ContractOffered: count => `艦橋收到 ${count} 份新契約，可到「契約」頁籤查看地點、報酬與期限。`,
};

/** 從尾端按呈現行取樣；只合併同日連續的同類背景訊息，不改事件歷史。 */
export function eventsLog(events: CampaignEvent[], state: CampaignState, world: WorldDB, limit = Infinity): Screen["log"] {
  const rows: Screen["log"] = [];
  for (let end = events.length - 1; end >= 0 && rows.length < limit;) {
    const event = events[end]!;
    let start = end;
    if (Object.hasOwn(backgroundSummary, event.type)) {
      while (start > 0 && events[start - 1]!.type === event.type && events[start - 1]!.day === event.day) start--;
    }
    const count = end - start + 1;
    rows.push(count > 1
      ? { day: event.day, text: backgroundSummary[event.type]!(count), kind: "info" }
      : eventLog(event, state, world));
    end = start - 1;
  }
  return rows.reverse();
}

export type OpsLogFilter = "important" | "contracts" | "money" | "crew" | "world" | "all";
export const OPS_LOG_FILTERS: { id: OpsLogFilter; label: string }[] = [
  { id: "important", label: "重點" }, { id: "contracts", label: "契約" }, { id: "money", label: "帳務" },
  { id: "crew", label: "船員與機體" }, { id: "world", label: "世界消息" }, { id: "all", label: "全部記錄" },
];

const mapOnlyEvents = new Set(["ActorSpawned", "ActorDespawned", "Sighted", "WorldAction"]);
const moneyEvents = new Set(["Posted", "WagePaid", "WageOwed", "InterestPosted", "FuelUsed", "LaneFare", "DockFee",
  "DebtArrears", "DebtCured", "DebtCleared", "DebtDemand", "DebtCollection", "DebtUltimatum", "DebtBorrowed", "MechSeized", "SeleneEmbargo", "Plundered", "Resupplied", "Traded", "SoulRent", "DaySummary"]);
const crewEvents = new Set(["JobDone", "JobStarted", "WearWarning", "BrokeLoose", "Sustained", "Stiffened", "Mounted", "MyceliumOvergrown", "Suppressed",
  "Devoured", "MoltStarted", "Molted", "Brooded", "Mutated", "Accompanied", "NodeMastered", "Hired", "Left", "Died", "AbilityGained", "SoulAwakened",
  "Woken", "Named", "LostMech", "CarcassSalvaged", "SalvageGained", "SalvageStashed", "Assigned", "GraftRejected", "SoulNodeOpened", "ResearchDone", "Levelled", "Withering", "Talked"]);
const worldEvents = new Set(["RiftPhase", "PlaceBlighted", "PlaceReclaimed", "CityLost", "PlaceTransferred", "RelationChanged", "WarDeclared",
  "TreatySigned", "TreatyBroken", "TreatyExpired", "OperationStarted", "OperationPhase", "OperationEngaged", "OperationResolved", "OperationFailed", "OperationAborted",
  "LineageOpened", "LineageStalled", "ModelReleased", "TechLeaked", "CaptainCreated", "CaravanLost"]);
const routineEvents = new Set(["DayStart", "DaySummary", "Posted", "WagePaid", "InterestPosted", "FuelUsed", "LaneFare", "DockFee", "Waiting",
  "SaveRequested", "LoadRequested", "Sustained", "Accompanied", "Talked", "OpsEffectApplied"]);

/** 網頁通知先依原始事件分類，再套呈現行數；MCP 與存檔保留原事件。 */
export function filterLogEvents(events: CampaignEvent[], state: CampaignState, filter: OpsLogFilter, world: WorldDB): CampaignEvent[] {
  const entries = templateEntries(world);
  const answered = new Set<CampaignEvent>();
  if (filter === "important" && entries.EventOffered?.text === "有件事等你拍板。" && entries.Chosen?.text === "你做了決定，船上的人照做。") {
    const pending = new Map<string, CampaignEvent[]>();
    for (const event of events) {
      if (event.type !== "EventOffered" && event.type !== "Chosen") continue;
      const def = typeof event.payload.event === "string" ? world.get("event", event.payload.event) : undefined;
      if (!def) {
        if (event.type === "Chosen") pending.clear();
        continue;
      }
      if (event.type === "EventOffered") pending.set(def.id, [...(pending.get(def.id) ?? []), event]);
      else if (typeof event.payload.choice === "number" && Number.isSafeInteger(event.payload.choice) && event.payload.choice >= 1 && def.choices[event.payload.choice - 1]) {
        const offers = pending.get(def.id);
        // 同事件同時存在多個未答提示時，舊紀錄沒有實例id可精確配對，全部保留。
        if (offers?.length === 1) { answered.add(offers[0]!); pending.delete(def.id); }
      } else pending.delete(def.id);
    }
  }
  const playerEvents = new Set<string>([...EVENT_TYPES, "Sailed", "Arrived", "EncounterOffered", "Intercepted", "Evaded", "Plundered", "TravelBlocked", "ContractContested", "Assigned", "JoinSettled", "OrderViolated", "Betrayed", "AllySupplied", "MechLoaned", "MechReturned", "MechLost", "ShellSeized", "ProxyExposed", "ReputationChanged", "WanchaoGateOffered", "WanchaoGateDeclined", "WanchaoWallResult"]);
  const ledgerReasons = new Set(state.ledger.entries.map(entry => entry.reason));
  const accepted = new Set(events.filter(e => e.type === "ContractAccepted").map(e => e.payload.contract));
  const playerRelated = (event: CampaignEvent) => event.payload.player === 1 || event.payload.actor === "player" ||
    Object.values(event.payload).some(value => typeof value === "string" &&
      (value in state.roster.persons || value in state.mechs || accepted.has(value) ||
        !!state.contracts[value] && state.contracts[value]!.status !== "offered" && state.contracts[value]!.status !== "expired"));
  return events.filter(event => {
    const type = event.type;
    if (answered.has(event)) return false;
    if (mapOnlyEvents.has(type) || type === "Posted") return false;
    if (filter === "all") return true;
    if (filter === "contracts") return type.startsWith("Contract") || ["JoinSettled", "OrderViolated", "Betrayed", "AllySupplied", "MechLoaned", "MechReturned", "MechLost"].includes(type);
    if (filter === "money") return moneyEvents.has(type) || ledgerReasons.has(type);
    if (filter === "crew") return crewEvents.has(type) || ["BattleResolved", "MechSeized", "MechLoaned", "MechReturned", "MechLost"].includes(type);
    if (filter === "world") return worldEvents.has(type) || type.startsWith("Wanchao");
    if (type === "ContractExpired") return accepted.has(event.payload.contract);
    if (type === "WagePaid" && typeof event.payload.person === "string") return true;
    if (routineEvents.has(type)) return false;
    if (worldEvents.has(type)) return playerRelated(event);
    if (playerEvents.has(type) || crewEvents.has(type) || moneyEvents.has(type) || ledgerReasons.has(type)) return true;
    // 新內容先按模板警示色保底，一般資訊仍可在全部記錄查閱。
    return entries[type]?.kind === "warn" || entries[type]?.kind === "blood";
  });
}
