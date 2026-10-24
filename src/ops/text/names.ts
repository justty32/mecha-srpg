import { placeDef } from "../world/places.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";

// parse 與事件模板保留既有三參數介面；開局／命令 context 登記不可變內容，不保存活動狀態。
const databases = new WeakMap<WorldDB, ContentDB>();
export function registerTextDB(world: WorldDB, db: ContentDB): void { databases.set(world, db); }
export function textContext(world: WorldDB): OpsCtx | undefined {
  const db = databases.get(world);
  return db ? { db, world, emit: () => { throw new Error("文字查詢不可寫入事件"); } } : undefined;
}
const labels: Record<string, string> = {
  clear: "清剿", seal: "封印", reclaim: "收復", escort: "護送", scout: "偵察", rival: "處理同業", survey: "奪回遺物", defend: "守城", smuggle: "走私", join: "參戰",
  repair: "修理", rebuild: "重建", research: "研究", graft: "嫁接", incubate: "培育", install: "安裝", mod: "改裝", restrain: "拘束維護", mount: "整屍改裝", embalm: "防腐", prune: "修剪",
  opening: "開口", anchored: "坐錨", sealing: "封印中", unanchored: "拔錨", receding: "退潮", sealed: "封印", closed: "閉合",
  insect: "蟲族", beast: "獸族", alien: "異形", mycelium: "菌絲",
  cash: "幣", debt: "船債", "stock:flesh": "屍料", "stock:fuel": "燃料", "stock:scrap": "廢鐵", "stock:chitin": "甲殼", "stock:core-C": "丙級魂核", "stock:core-S": "特級魂核", "stock:crystal": "裂晶", "stock:ammo": "彈藥", "stock:inventory": "實物庫存",
  hostile: "敵對", cold: "冷淡", neutral: "中立", friendly: "友好", allied: "同盟", war: "交戰",
  muster: "集結", march: "行軍", engage: "交火", resolve: "結算", aftermath: "善後", aborted: "中止", failed: "失敗", done: "完成",
  player: "我方", enemy: "敵方", ally: "盟軍", none: "無", world: "世界", full: "全額補給", field: "野戰補給", arsenal: "軍械補給",
};
export type TextState = CampaignState & { text?: { room?: string; names?: Record<string, string> } };
export function entityName(id: string, state: TextState, world: WorldDB): string {
  const names = state.roster.names[id] ?? [], latest = (kind: string) => names.filter(n => n.kind === kind).at(-1)?.name;
  const nickname = latest("nickname"), epithet = latest("epithet");
  const named = state.text?.names?.[id] ?? (nickname ? [epithet, nickname].filter(Boolean).join("・") : latest("title") ?? latest("registry") ?? names.at(-1)?.name);
  if (named?.trim()) return named;
  if (labels[id]) return labels[id]!;
  const db = databases.get(world), person = state.roster.persons[id];
  if (person) return db?.get("person", person.def)?.name ?? "船員";
  const mech = state.mechs[id];
  if (mech) {
    const siblings = Object.values(state.mechs).filter(m => m.frame === mech.frame).sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
    return `${entityName(mech.frame, state, world)} ${siblings.findIndex(m => m.id === id) + 1} 號`;
  }
  const actor = state.actors[id];
  if (actor) {
    const kinds = { force: "作戰部隊", patrol: "巡邏隊", caravan: "商隊", swarm: "裂獸群", band: "獵團" };
    return `${world.get("actor", actor.def ?? `actor/${actor.kind}`)?.name ?? kinds[actor.kind]} ${actor.id.split(/[-/]/).at(-1)}`;
  }
  const rift = state.rifts[id];
  if (rift) {
    const site = state.places[rift.site]?.dyn;
    if (site) return site.name;
    const family = world.get("rift", rift.family)?.family ?? rift.family;
    return `${entityName(rift.site, state, world)}的${labels[family] ?? "異界"}裂縫`;
  }
  const contract = state.contracts[id];
  if (contract) {
    const template = world.get("contract", contract.template);
    return template?.name ?? `${labels[template?.kind ?? ""] ?? "委託"}：${entityName(contract.target.place, state, world)}`;
  }
  const job = state.jobs.find(j => j.id === id);
  if (job) return `${labels[job.kind] ?? "工作"}：${job.target === id ? "指定對象" : entityName(job.target, state, world)}`;
  const faction = world.get("faction-ops", id);
  if (faction) return db?.get("faction", faction.faction)?.name ?? "委託勢力";
  const model = world.get("model", id);
  if (model) return db?.get("frame", model.frame)?.name ?? `${entityName(model.lineage, state, world)} ${model.mark} 型`;
  const operation = state.operations?.[id];
  if (operation) return entityName(operation.def, state, world);
  const place = placeDef(state, { world }, id);
  if (place) return place.name;
  for (const kind of ["map", "room", "research", "background", "model", "lineage", "operation", "market", "contract"] as const) {
    const def = world.get(kind, id);
    if (def && "name" in def && typeof def.name === "string" && def.name.trim()) return def.name;
    if (def && "title" in def && typeof def.title === "string") return def.title;
    if (kind === "market" && def && "place" in def) return `${entityName(def.place, state, world)}市場`;
    if (kind === "contract" && def && "kind" in def) return `${labels[def.kind] ?? "委託"}契約`;
  }
  for (const kind of ["person", "frame", "component", "faction", "species", "monster"] as const) {
    const def = db?.get(kind, id); if (def?.name) return def.name;
  }
  // 舊存檔／已移除實體只留可讀類別與序號，不能把內部路徑顯示給玩家。
  if (/\p{Script=Han}/u.test(id)) return id.replaceAll("/", "・").trim() || "未具名對象";
  const kind = id.replace(/^[^:]+:/, "").split(/[/-]/)[0] ?? "";
  const short: Record<string, string> = { person: "船員", candidate: "應徵者", mech: "機甲", frame: "機型", faction: "勢力", place: "地點", rift: "裂縫", contract: "契約", job: "工作", model: "機型", operation: "作戰", lineage: "血統", treaty: "條約", action: "勢力行動", component: "部件" };
  return `${id.startsWith("stock:") ? "庫存" : short[kind] ?? "未具名對象"}${id.match(/\d+$/)?.[0] ? ` ${id.match(/\d+$/)![0]} 號` : ""}`;
}
