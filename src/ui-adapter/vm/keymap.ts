import defaults from "./keymap.json" with { type: "json" };
import type { KeyInput, KeymapFile, UiAction } from "./types.ts";

export const DEFAULT_KEYMAP: KeymapFile = defaults as KeymapFile;

export function normalizeKey(k: KeyInput): string {
  const key = k.key.length === 1 ? k.key.toLowerCase() : k.key;
  return `${k.ctrlKey ? "Ctrl+" : ""}${k.altKey ? "Alt+" : ""}${k.shiftKey ? "Shift+" : ""}${key}`;
}

function canonical(binding: string): string {
  const plus = binding.endsWith("+"), parts = (plus ? binding.slice(0, -1) : binding).split("+");
  const key = plus ? "+" : parts.pop()!;
  return normalizeKey({ key, ctrlKey: parts.includes("Ctrl"), altKey: parts.includes("Alt"), shiftKey: parts.includes("Shift") });
}

export function parseAction(action: string): UiAction | null {
  const [type, value, extra] = action.split(":");
  if (extra !== undefined) return null;
  if (type === "nav") return value === "battle" || value === "wiki" || value === "ops" ? { type: "navigate", page: value } : null;
  if (type === "cursor" || type === "scroll") {
    if (!value || !/^-?\d+,-?\d+$/u.test(value)) return null;
    const [dx, dy] = value.split(",").map(Number);
    return Number.isSafeInteger(dx) && Number.isSafeInteger(dy) ? { type, dx: dx!, dy: dy! } : null;
  }
  if (type === "abilitySlot") return value && /^[1-9]$/u.test(value) ? { type, n: Number(value) } : null;
  if (type === "zoom") return value === "1" || value === "-1" || value === "0" ? { type, dir: Number(value) as 1 | -1 | 0 } : null;
  if (value !== undefined) return null;
  switch (type) {
    case "confirm": case "cancel": case "nextUnit": case "centerActive": case "beginMove":
    case "standby": case "defer": case "skip": case "step": case "cycleAnim":
    case "endTurn": case "eject": case "retreat": case "toggleHelp": return { type };
    default: return null;
  }
}

export function resolveKey(map: KeymapFile, k: KeyInput): UiAction | null {
  const key = normalizeKey(k);
  const binding = map.bindings.find(b => b.keys.some(value => canonical(value) === key));
  return binding ? parseAction(binding.action) : null;
}

export function keyLabel(map: KeymapFile, action: string): string | undefined {
  const key = map.bindings.find(b => b.action === action)?.keys[0];
  if (key === undefined) return undefined;
  if (key === "+") return "+";
  return canonical(key).split("+").map(part => ({ Shift: "⇧", Escape: "Esc", " ": "Space",
    ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }[part] ?? (part.length === 1 ? part.toUpperCase() : part)))
    .join("").replace(/^Ctrl/u, "Ctrl+").replace(/Alt/u, "Alt+");
}

export function validateKeymap(map: KeymapFile): string[] {
  const errors: string[] = [], used = new Set<string>();
  if (map.version !== 1) errors.push("不支援的鍵位版本");
  for (const binding of map.bindings) {
    if (!parseAction(binding.action)) errors.push(`未知操作：${binding.action}`);
    for (const key of binding.keys) {
      const normalized = canonical(key);
      if (used.has(normalized)) errors.push(`重複快捷鍵：${normalized}`);
      used.add(normalized);
    }
  }
  return errors;
}
