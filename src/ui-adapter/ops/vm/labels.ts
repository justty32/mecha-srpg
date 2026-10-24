import type { ContentDB } from "../../../content/contentdb.ts";
import type { WorldDB } from "../../../ops/content/worlddb.ts";
import type { CampaignState } from "../../../ops/state/types.ts";
import { entityName } from "../../../ops/text/parse.ts";

const labels: Record<string, string> = {
  spring: "大潮", neap: "小潮", ordinary: "平潮", pilot: "駕駛", technician: "技師", medic: "醫護", crew: "船員", soul: "機魂", human: "人類",
  opening: "初開", anchored: "定錨", unanchored: "失錨", sealing: "封閉中", sealed: "已封", receding: "退潮", closed: "消散",
  title: "稱號", registry: "登記號", nickname: "小名", dread: "惡名", epithet: "二名",
  offered: "待接", active: "進行中", stage: "階段中", done: "完成", failed: "失敗", cancelled: "已放棄", expired: "已過期",
  cash: "現金", debt: "債務", "stock:flesh": "屍體材料", "stock:fuel": "燃料", "stock:scrap": "廢料", "stock:core": "核心",
  clear: "清剿", seal: "封縫", reclaim: "收復", escort: "護送", scout: "偵察", rival: "獵團交戰", survey: "調查", defend: "防衛", smuggle: "走私",
  city: "城邦", outpost: "據點", port: "港口", "rift-site": "裂縫口", beacon: "燈標", wild: "荒野", ruin: "遺跡", "ferry-port": "渡口", "lunar-base": "月面基地", shallow: "淺蝕", deep: "深蝕", core: "核區",
  hangar: "機庫", restraint: "拘束艙", dormant: "休眠", live: "活體", corpse: "整屍", component: "部件", frame: "機體", carcass: "整屍",
  fuel: "燃料", material: "材料", ticket: "支援券", "soul-rental": "機魂租賃", ammo: "彈藥", air: "空路", ground: "陸路", ferry: "渡航",
  repair: "修理", rebuild: "重建", research: "研究", graft: "移植", incubate: "孕育", install: "安裝", mod: "改裝", restrain: "拘束維護", mount: "屍體改裝", embalm: "防腐", prune: "修剪",
  alive: "生還", dead: "死亡", retreated: "撤離", "derelict-recovered": "棄機回收", "derelict-lost": "機體流失", captured: "被俘",
  ship: "船艙", world: "世界圖", contracts: "契約", roster: "名冊", mechs: "機體", ledger: "帳本", market: "市場", calendar: "潮曆",
  insect: "蟲族", beast: "獸族", alien: "異形", mycel: "菌絲", mycelium: "菌絲", passenger: "乘員",
};
export const label = (id: string): string => labels[id] ?? id;
const errors: Record<string, string> = {
  "invalid-choice": "沒有這個選項", "choice-disabled": "選項條件尚未成立", "name-required": "請輸入名字", "effect-rejected": "效果條件未成立", "no-exit": "無法從此處前往該房間",
  "unknown-target": "找不到目標", "unknown-person": "找不到人物", "person-not-here": "人物不在這裡", "no-topic": "目前沒有可談的話題", "pending-choice": "先回應事件",
  "invalid-days": "天數必須為正整數", "no-battle-runner": "尚未建立戰場", "invalid-slot": "無效存檔欄位", "cannot-devour": "此獸無法投屍", "invalid-amount": "數量不符需求",
  "already-sustained": "本期已維持", "insufficient-flesh": "屍體材料不足", "unknown-account": "找不到帳戶", "insufficient-cash": "現金不足", "invalid-job": "無效工作",
  "invalid-priority": "無效工作順序", "invalid-beast-job": "此生物不適用該工作", "missing-grade-cost": "缺少等級成本", "missing-corpse-frame": "缺少屍體機架",
  "invalid-repair-target": "無效修理部位", "invalid-repair-kind": "修理種類不符損傷", "missing-repair-coefficients": "缺少修理配方", "unknown-research": "找不到研究", "research-done": "研究已完成",
  "research-prerequisite": "研究前置未滿足", "missing-job-recipe": "缺少工作配方", "missing-soul-template": "缺少機魂模板", "no-berth": "沒有空床位", "invalid-install-target": "無效安裝目標",
  "repair-only": "此機體只能修理", "unknown-component": "找不到部件", "no-compatible-slot": "沒有相容插槽", "missing-modification-result": "缺少改裝產物", "invalid-job-cost": "工作成本無效",
  "job-already-queued": "已排入工時佇列", "unknown-job": "找不到工作", "not-spring-night": "須等到大潮之夜", "not-dormant": "此機體未休眠", "cannot-wake": "無法喚醒此機體",
  "already-bound": "已有認主機體", "resonance-too-low": "共鳴或功績不足", "no-seat": "沒有可用座位", "missing-name-table": "缺少命名表", "unknown-mech": "找不到機體", "unknown-namer": "找不到命名者", "empty-name": "名字不可空白",
  "invalid-role": "無效職務", "seat-locked": "座位受認主關係限制", "dormant": "機體休眠中", "seat-occupied": "座位已有人", "unknown-seat": "找不到座位", "seat-incompatible": "人物與座位不相容",
  "captured-requires-instinct": "活捕獸須以無人本能模式出戰", "unknown-soul-node": "找不到機魂節點", "node-already-open": "節點已開啟", "node-prerequisite": "節點前置未滿足", "research-required": "需要先完成研究",
  "invalid-companions": "陪伴人物不符", "node-not-open": "節點尚未開啟", "slot-used": "今日陪伴時段已用", "unknown-candidate": "找不到招募候選人", "not-docked": "須抵達當地", "invalid-terms": "僱用條件無效", "unpaid-wages": "須先付清欠薪",
  "unknown-place": "找不到地點", "no-place": "此格沒有可停泊的地點", "unknown-actor": "找不到行動者", "unknown-node": "找不到節點", "empty-sortie": "請至少編入一台機體", "ship-not-overhead": "飛船尚未抵達出戰地點", "insufficient-supplies": "出戰補給不足", "inactive-contract": "契約尚未生效", "wrong-target": "出戰目標不符契約",
  "mech-not-in-hangar": "機體不在可出戰艙位", "duplicate-mech": "機體重複編入", "job-in-progress": "機體正在施工", "unknown-frame": "找不到機架", "beast-unavailable": "獸體磨損過高或正在蛻皮", "missing-restraint": "缺少拘束裝置",
  "person-dead": "人物已死亡或失去行動能力", "withering": "人物正在凋零", "duplicate-person": "同一人物不可佔多個座位", "pending-encounter": "先處理遭遇事件", "pending-battle": "先處理待命戰鬥",
  "in-transit": "航行中", "overloaded": "飛船超載", "no-route": "沒有可通行航線", "already-there": "已在目的地", "insufficient-fuel": "燃料不足", "unknown-market": "找不到市場", "market-unavailable": "市場目前不可用",
  "expired": "契約已過期", "issuer-unavailable": "委託方或聲望條件不符", "no-buyback": "此市場不收購", "unknown-item": "找不到商品", "unsupported-item": "此商品尚不支援交易",
  "item-unavailable": "物品已占用或不可出售", "invalid-price": "商品價格無效", "out-of-stock": "商品已售罄", "insufficient-stock": "持有數量不足",
  "invalid-party": "探勘隊伍不符條件", "no-event": "沒有可觸發事件", "not-at-ruin": "尚未抵達遺跡", "not-ruin": "目標不是遺跡", "invalid-max-steps": "戰鬥步數上限無效", "sortie-mismatch": "戰場編成與營運紀錄不符",
  "not-offered": "契約已非待接狀態", "unknown-contract": "找不到契約", "insufficient-reputation": "聲望不足", "invalid-ask": "無效談判條件", "not-active": "契約未生效",
};
export const rejection = (code: string): string => errors[code] ?? `指令被拒：（${code}）`;
export function displayName(s: CampaignState, db: ContentDB, world: WorldDB, id: string): string {
  const named = entityName(id, s, world);
  if (s.roster.names[id]?.length) return named;
  const p = s.roster.persons[id]; if (p) return db.require("person", p.def).name;
  const m = s.mechs[id]; if (m) return db.require("frame", m.frame).name;
  for (const kind of ["person", "frame", "component", "faction", "species", "monster"] as const) {
    const def = db.get(kind, id); if (def?.name) return def.name;
  }
  const faction = world.get("faction-ops", id); if (faction) return db.require("faction", faction.faction).name;
  return labels[id] ?? named;
}
