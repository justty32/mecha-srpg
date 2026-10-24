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
  none: "無人控制", disabled: "失能", berserk: "失控", instinct: "本能" };

const pick = (table: Record<string, string>, v: string): string => table[v] ?? v;
export const roleLabel = (v: string): string => pick(ROLE, v);
export const moraleLabel = (v: string): string => pick(MORALE, v);
export const statusLabel = (v: string): string => pick(STATUS, v);
export const controlLabel = (v: string): string => pick(CONTROL, v);
/** 情境標題：ScenarioDef 沒有 name 欄（SPEC-GAP），取 id 末段。 */
export const scenarioTitle = (id: string): string => `戰鬥：${id.replace(/^.*\//u, "")}`;
