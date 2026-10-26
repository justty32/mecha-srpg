// ui-adapter/vm/labels — 引擎列舉值（座位、士氣、單位狀態、控制模式）的中文顯示名。
// 只管 UI 顯示；內容包的名稱（部位、能力、人物…）一律從 def.name 取，不放這裡。
import type { ContentDB } from "../../content/contentdb.ts";
const LAYER: Record<string, string> = { shield: "護盾", armor: "裝甲", chitin: "甲殼", flesh: "肉體", organ: "器官",
  "cockpit-shell": "駕駛艙殼", component: "組件", structure: "結構", "resonant-shell": "共鳴裝甲" };
export function layerTypeLabel(db: ContentDB, id: string): string {
  const name = db.registries["layer-types"][id]?.name;
  return name && name !== id ? name : LAYER[id] ?? id;
}
const ROLE: Record<string, string> = { pilot: "駕駛", soul: "機魂", passenger: "乘員" };
const MORALE: Record<string, string> = { steady: "穩定", shaken: "動搖", breaking: "崩潰邊緣", fleeing: "潰逃" };
const STATUS: Record<string, string> = { active: "作戰中", dead: "陣亡", retreated: "已撤離", derelict: "棄機", captured: "被俘" };
const CONTROL: Record<string, string> = { pilot: "駕駛控制", soul: "機魂控制", shared: "共同控制", contested: "爭奪控制",
  none: "無人控制", disabled: "失能", berserk: "失控", instinct: "本能", scripted: "無人（普通開）" };

const pick = (table: Record<string, string>, v: string): string => table[v] ?? v;
export const roleLabel = (v: string): string => pick(ROLE, v);
export const moraleLabel = (v: string): string => pick(MORALE, v);
export const statusLabel = (v: string): string => pick(STATUS, v);
export const controlLabel = (v: string): string => pick(CONTROL, v);
const POOL: Record<string, string> = { ap: "行動點", hp: "生命", heat: "熱量", charge: "蓄能", fatigue: "疲勞",
  "rune-round": "符文彈", "rune-shell": "符文砲彈" };
/** 特殊池未宣告時仍提供中文；已宣告的名稱優先由呼叫端取用。 */
export const poolLabel = (v: string): string => POOL[v] ?? "未命名資源";
const MOVEMENT: Record<string, string> = { leg: "步行", track: "履帶", hover: "潮行", flight: "飛行", burrow: "掘進" };
export const movementLabel = (v: string): string => pick(MOVEMENT, v);
export const frameClassLabel = (v: string): string => pick({ mechanical: "機械", bio: "生體", ancient: "古代機" }, v);
export const familyLabel = (v: string): string => pick({ alien: "異形", beast: "野獸", insect: "蟲類", mycelium: "菌絲" }, v);
export const targetShapeLabel = (v: string): string => pick({ self: "自身", unit: "單體", part: "單一部位", cell: "單格", ball: "球", line: "線", cone: "錐" }, v);
export const effectTimingLabel = (v: string): string => pick({ hit: "命中", miss: "未命中", self: "自身", cell: "目標格", always: "必定" }, v);
const FUNCTIONS: Record<string, string> = { core: "核心", cockpit: "駕駛艙", manipulator: "操作", sensor: "感測", locomotion: "移動", weaponMount: "武器掛載", spawner: "育幼" };
export function functionLabel(db: ContentDB, id: string): string {
  const name = db.registries["part-functions"][id]?.name;
  return name && name !== id ? name : FUNCTIONS[id] ?? "其他功能";
}
export function damageTypeLabel(db: ContentDB, id: string): string {
  const name = db.registries["damage-types"][id]?.name;
  const labels: Record<string, string> = { kinetic: "動能", acid: "酸蝕", energy: "能量", thermal: "熱能", pierce: "穿刺" };
  return name && name !== id ? name : labels[id] ?? "其他傷害";
}
/** 情境標題：ScenarioDef 沒有 name 欄（SPEC-GAP），取 id 末段。 */
export const scenarioTitle = (id: string): string => `戰鬥：${id.replace(/^.*\//u, "")}`;
