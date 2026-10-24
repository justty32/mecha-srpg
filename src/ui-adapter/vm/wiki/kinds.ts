import type { CategoryGroup } from "./types.ts";

const KIND_LABELS: Record<string, string> = {
  frame: "機體", component: "部件", ability: "能力", effect: "效果", bodyplan: "構型",
  person: "人物（駕駛員／機魂）", soultree: "機魂天賦樹", terrain: "地形", map: "地圖",
  scenario: "情境", faction: "勢力", species: "怪獸族", monster: "怪獸", aiprofile: "AI 策略",
  curve: "成長曲線", node: "節點", contract: "契約", "faction-ops": "勢力營運",
  market: "市場", event: "事件", room: "艙室", job: "工作", research: "研究", route: "航線",
  rift: "裂隙", service: "設施", encounter: "遭遇", dialogue: "對話", name: "命名表",
  beast: "生物系", character: "人物", place: "地點", era: "時代",
  registries: "登記表", rules: "規則常數", base: "內容包",
  action: "營運行動", background: "出身背景", beasts: "生物系族別", calendar: "曆法", ferry: "渡輪",
  keymap: "營運鍵位", names: "命名表", recruit: "招募池", ship: "船艦", start: "開局設定", templates: "範本",
};

const KIND_ORDER: Partial<Record<CategoryGroup, readonly string[]>> = {
  game: ["frame", "component", "ability", "effect", "bodyplan", "species", "monster", "person", "soultree",
    "faction", "terrain", "map", "scenario", "aiprofile", "curve", "registries", "rules", "base"],
  lore: ["faction", "character", "event", "place", "era"],
  ops: ["node", "contract", "faction-ops", "market", "event"],
};

export function kindOrder(group: CategoryGroup, kind: string): number {
  const order = KIND_ORDER[group] ?? [];
  const rank = order.indexOf(kind);
  return rank >= 0 ? rank : order.length + (Object.hasOwn(KIND_LABELS, kind) ? 0 : 1);
}

export const GRADE_ORDER: readonly string[] = ["D", "C", "B", "A", "S", "SS", "SSS"];

export function kindLabel(kind: string): string {
  return Object.hasOwn(KIND_LABELS, kind) ? KIND_LABELS[kind]! : kind;
}

export function categoryGroup(pack: string, path: string): CategoryGroup {
  if (pack === "lore") return "lore";
  if (pack === "base") return path.startsWith("world/") ? "ops" : "game";
  return "other";
}

export function facetLabel(name: string): string {
  const labels: Record<string, string> = {
    grade: "等級", family: "族", faction: "勢力", era: "時代", tag: "標籤", cls: "類別", kind: "種類",
  };
  return Object.hasOwn(labels, name) ? labels[name]! : name;
}
