import type { OpsCommand } from "../state/types.ts";

export type Verb = OpsCommand["v"];
// 每列只宣告一個動詞；複合參數以 JSON 保留完整的型別化編成／工作。
export const VERBS = [
  { v: "look", zh: "看", grammar: "[房間|人|機甲|契約|地點]" },
  { v: "talk", zh: "談", grammar: "人物 [話題]" },
  { v: "go", zh: "走", grammar: "房間" },
  { v: "map", zh: "圖", grammar: "" },
  { v: "sail", zh: "航", grammar: "地點|x,y|@行動者 [經 地點|x,y…]" },
  { v: "dock", zh: "泊", grammar: "" },
  { v: "drift", zh: "懸", grammar: "" },
  { v: "wait", zh: "等", grammar: "天數" },
  { v: "board", zh: "板", grammar: "[契約]" },
  { v: "accept", zh: "接", grammar: "[契約] 契約名 [加價|預付|按頭]" },
  { v: "drop", zh: "棄", grammar: "[契約] 契約名" },
  { v: "sortie", zh: "出戰", grammar: "[編成 JSON]" },
  { v: "assign", zh: "派", grammar: "人物 [機甲 [座位]] [職務 role]" },
  { v: "queue", zh: "排", grammar: "工作 JSON，或 repair|research|… 目標 [部位]" },
  { v: "reorder", zh: "序", grammar: "工作 優先序" },
  { v: "devour", zh: "投", grammar: "拘束艙機甲 數量" },
  { v: "accompany", zh: "陪", grammar: "機魂 陪伴者 [節點]" },
  { v: "trade", zh: "買賣", grammar: "市場 [買 物品…] [賣 物品…]" },
  { v: "hire", zh: "招", grammar: "候選人 id" },
  { v: "fire", zh: "解", grammar: "人物" },
  { v: "explore", zh: "探", grammar: "遺跡 [人物…]" },
  { v: "wake", zh: "喚", grammar: "休眠機甲 人物" },
  { v: "choose", zh: "選", grammar: "選項序號（從 1 起）" },
  { v: "pay", zh: "付", grammar: "債|人物 金額" },
  { v: "borrow", zh: "借", grammar: "金額（還清船債後開的信貸）" },
  { v: "save", zh: "存", grammar: "" },
  { v: "load", zh: "讀", grammar: "存檔槽（從 0 起）" },
  { v: "help", zh: "助", grammar: "[動詞]" },
] as const satisfies readonly { v: Verb; zh: string; grammar: string }[];

export function findVerb(word: string): Verb | undefined {
  return VERBS.find(entry => entry.v === word.toLowerCase() || entry.zh === word)?.v;
}
export const LEGAL_VERBS = VERBS.map(entry => `${entry.zh}/${entry.v}`).join("、");
