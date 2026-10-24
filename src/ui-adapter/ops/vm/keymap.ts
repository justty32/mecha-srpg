import defaults from "./keymap-ui.json" with { type: "json" };
import type { WorldDB } from "../../../ops/content/worlddb.ts";
import type { KeymapDef } from "../../../ops/state/types.ts";
import type { OpsButton, OpsKeyInput, OpsSnapshot, OpsUiAction } from "./types.ts";
import { normalizeKey } from "../../vm/keymap.ts";
export type Binding = KeymapDef["bindings"][number];
export function canonicalKey(key: string): string {
  const plus = key.endsWith("+"), parts = (plus ? key.slice(0, -1) : key).split("+"), value = plus ? "+" : parts.pop()!;
  return normalizeKey({ key: value, ctrlKey: parts.includes("Ctrl"), altKey: parts.includes("Alt"), shiftKey: parts.includes("Shift") });
}
export function validateBindings(bindings: Binding[]): string[] {
  const used = new Set<string>(), errors: string[] = [];
  for (const b of bindings) for (const k of b.keys) {
    const id = `${b.context ?? (b.action.startsWith("choose:") ? "prompt" : "room")}:${canonicalKey(k)}`;
    if (used.has(id)) errors.push(`重複快捷鍵：${id}`); used.add(id);
  }
  return errors;
}
export function mergedBindings(world: WorldDB): Binding[] {
  const bindings = [...world.all("keymap").flatMap(k => k.bindings), ...defaults.bindings];
  const errors = validateBindings(bindings); if (errors.length) throw new Error(errors.join("\n"));
  return bindings;
}
export const keyText = (k: string): string => canonicalKey(k).split("+").map(p => p === "Escape" ? "Esc" : p.length === 1 ? p.toUpperCase() : p).join("+");
export function actionKey(a: OpsUiAction): string {
  if (a.type === "cmd") {
    const c = a.cmd; return c.v === "go" ? `go:${c.room}` : c.v === "choose" ? `choose:${c.choice}` : c.v;
  }
  if (a.type === "tab") return `tab:${a.tab}`;
  if (a.type === "advance") return a.until === "day" ? "wait" : "advance:event";
  if (a.type === "sortieLaunch") return `sortieLaunch:${a.mode}`;
  return a.type;
}
export function allButtons(s: OpsSnapshot): OpsButton[] {
  return [...s.tabs, ...s.timeButtons, ...s.roomButtons, ...(s.world.grid?.actions ?? []), ...(s.world.selected?.buttons ?? []),
    ...s.contracts.flatMap(c => c.buttons), ...s.mechs.flatMap(m => m.buttons), ...s.market.items.flatMap(i => i.buttons), ...(s.sortie?.buttons ?? [])];
}
export function bindButtons(s: OpsSnapshot, bindings: Binding[]): void {
  const context = s.prompt ? "prompt" : s.showHelp || s.report ? "overlay" : s.sortie ? "sortie" : s.tab === "world" ? "map" : "room";
  const buttons = context === "map" ? s.world.grid?.actions ?? [] : allButtons(s);
  for (const b of bindings.filter(b => (b.context ?? (b.action.startsWith("choose:") ? "prompt" : "room")) === context)) {
    const matches = buttons.filter(button => actionKey(button.action) === b.action);
    const button = matches.find(b => b.enabled) ?? matches[0];
    if (button && b.keys[0]) { button.key = keyText(b.keys[0]); button.tooltip += `\n快捷鍵：${button.key}`; }
  }
  if (context === "map") {
    const dock = buttons.find(b => b.id === "map:dock"), drift = buttons.find(b => b.id === "map:drift");
    const target = dock?.reason === "不在地點範圍內" ? drift : dock;
    const binding = bindings.find(b => b.context === "map" && b.action === "mapDockDrift");
    if (target && binding?.keys[0]) { target.key = keyText(binding.keys[0]); target.tooltip += `\n快捷鍵：${target.key}`; }
  }
  if (s.prompt) for (const c of s.prompt.choices) {
    const key = buttons.find(b => b.action.type === "cmd" && b.action.cmd.v === "choose" && b.action.cmd.choice === c.n)?.key;
    if (key) c.key = key;
  }
  s.keyHints = buttons.filter(b => b.key).map(b => ({ label: b.label, keys: [b.key!] }));
}
export function resolveButtonKey(s: OpsSnapshot, bindings: Binding[], k: OpsKeyInput): OpsUiAction | null {
  const normalized = normalizeKey(k);
  const context = s.prompt ? "prompt" : s.showHelp || s.report ? "overlay" : s.sortie ? "sortie" : s.tab === "world" ? "map" : "room";
  if (context === "map" && s.world.grid) {
    const binding = bindings.find(b => b.context === "map" && b.keys.some(key => canonicalKey(key) === normalized));
    if (!binding) return null;
    const g = s.world.grid, name = binding.action;
    if (name === "mapDockDrift") {
      const dock = g.actions.find(b => b.id === "map:dock")!;
      const drift = g.actions.find(b => b.id === "map:drift")!;
      const target = dock.reason === "不在地點範圍內" ? drift : dock;
      return target.enabled ? target.action : null;
    }
    const direct = g.actions.find(b => actionKey(b.action) === name);
    if (direct) return direct.enabled ? direct.action : null;
    const [kind, value] = name.split(":");
    if (kind === "mapMove" || kind === "mapScroll") {
      const [dx, dy] = value!.split(",").map(Number); return { type: kind, dx: dx!, dy: dy! };
    }
    if (kind === "mapZoom") return { type: "mapZoom", dir: Number(value) as -1 | 0 | 1 };
    if (kind === "mapNext") return { type: "mapNext", dir: Number(value) as -1 | 1 };
    if (name === "mapMinimap" || name === "mapCancel") return { type: name };
    return null;
  }
  const button = allButtons(s).find(b => b.enabled && b.key && bindings.some(binding => (binding.context ?? (binding.action.startsWith("choose:") ? "prompt" : "room")) === context && binding.action === actionKey(b.action) && binding.keys.some(key => canonicalKey(key) === normalized) && keyText(binding.keys[0]!) === b.key));
  if (button) return structuredClone(button.action);
  // 沒有對應按鈕的純畫面動作（Esc 關報告／說明、取消編成）：直接依鍵表回傳。
  const plain = bindings.find(b => (b.context ?? "room") === context && (b.action === "cancel" || b.action === "toggleHelp") && b.keys.some(key => canonicalKey(key) === normalized));
  return plain ? { type: plain.action as "cancel" | "toggleHelp" } : null;
}
