import defaults from "./keymap-wiki.json" with { type: "json" };
import { normalizeKey } from "../keymap.ts";
import type { KeyInput, KeymapFile } from "../types.ts";

export const WIKI_KEYMAP: KeymapFile = defaults as KeymapFile;

// SPEC-GAP：契約未定 WikiKeyAction 的形狀，沿用資料檔 action 字串。
export type WikiKeyAction = "nav:battle" | "wiki:search" | "wiki:home" | "wiki:timeline"
  | "wiki:relations" | "wiki:sidebar" | "wiki:help" | "wiki:blur";

export function parseWikiAction(action: string): WikiKeyAction | null {
  switch (action) {
    case "nav:battle": case "wiki:search": case "wiki:home": case "wiki:timeline":
    case "wiki:relations": case "wiki:sidebar": case "wiki:help": case "wiki:blur": return action;
    default: return null;
  }
}

export function resolveWikiKey(key: KeyInput): WikiKeyAction | null {
  const normalized = normalizeKey(key);
  const binding = WIKI_KEYMAP.bindings.find(row => row.keys.some(value => {
    const parts = value.split("+");
    return normalizeKey({ key: parts.pop()!, shiftKey: parts.includes("Shift"),
      ctrlKey: parts.includes("Ctrl"), altKey: parts.includes("Alt") }) === normalized;
  }));
  return binding ? parseWikiAction(binding.action) : null;
}

export function wikiKeyHints(): { label: string; keys: string[] }[] {
  return WIKI_KEYMAP.bindings.map(({ label, keys }) => ({ label, keys: [...keys] }));
}
