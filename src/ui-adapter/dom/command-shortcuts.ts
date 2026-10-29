import type { CommandOption, UiAction, UiSnapshot } from "../vm/types.ts";
import type { OpsButton, OpsSnapshot, OpsUiAction } from "../ops/vm/types.ts";
import { allowedShortcutId, type CommandPreferenceStore } from "./command-preferences.ts";

export type ShortcutOption = { id: string; label: string; enabled: boolean; reason?: string };
export function battleShortcutCatalog(s: UiSnapshot): CommandOption[] {
  const blocked = !!(s.busy || s.confirm || s.showHelp || s.mode.kind === "part");
  return s.commands.filter(c => allowedShortcutId("battle", c.id) && (
    c.id === "move" ? c.action.type === "beginMove" :
    c.id === "standby" ? c.action.type === "standby" :
    c.id === "defer" ? c.action.type === "defer" :
    c.id === "end" ? c.action.type === "endTurn" :
    c.action.type === "beginAbility" && c.id === `ability:${c.action.ability}`
  )).map(c => ({ ...c, enabled: c.enabled && !blocked, reason: blocked ? "先完成目前操作或關閉說明" : c.reason }));
}
export function opsShortcutCatalog(s: OpsSnapshot): OpsButton[] {
  const blocked = !!(s.prompt || s.sortie || s.report || s.showHelp || s.battle || s.over);
  return [...s.tabs, ...(s.tab === "world" ? s.world.grid?.actions ?? [] : [])].filter(c => allowedShortcutId("ops", c.id) && (
    c.id.startsWith("tab:") ? c.action.type === "tab" && c.id === `tab:${c.action.tab}` :
    c.id === "map:center" ? c.action.type === "mapCenter" :
    c.id === "map:layers" ? c.action.type === "mapLayers" : c.action.type === "mapMaps"
  )).map(c => ({ ...c, enabled: c.enabled && !blocked, reason: blocked ? "先完成目前操作或關閉說明" : c.reason }));
}
export function battleShortcutForAction(s: UiSnapshot, action: UiAction): string | null {
  const catalog = battleShortcutCatalog(s);
  // 數字能力鍵必須先用當前 commands 排序解出能力；選部位時不算能力啟用。
  if (action.type === "abilitySlot") return catalog.filter(c => c.action.type === "beginAbility")[action.n - 1]?.enabled
    ? catalog.filter(c => c.action.type === "beginAbility")[action.n - 1]!.id : null;
  return catalog.find(c => c.enabled && JSON.stringify(c.action) === JSON.stringify(action))?.id ?? null;
}
export function opsShortcutForAction(s: OpsSnapshot, action: OpsUiAction): string | null {
  return opsShortcutCatalog(s).find(c => c.enabled && JSON.stringify(c.action) === JSON.stringify(action))?.id ?? null;
}
export function mountCommandShortcuts(root: HTMLElement, opts: {
  store: CommandPreferenceStore; catalog(): ShortcutOption[]; onActivate(id: string): void;
}): { render(): void; destroy(): void } {
  const doc = root.ownerDocument;
  const panel = doc.createElement("details"); panel.className = "command-shortcuts"; panel.dataset.ui = "command-shortcuts";
  const summary = doc.createElement("summary"); summary.textContent = "快捷操作";
  const content = doc.createElement("div");
  const status = doc.createElement("p"); status.className = "shortcut-status"; status.setAttribute("role", "status");
  panel.append(summary, content, status); root.append(panel);
  // 原生 button 的 Enter／空白只啟用該按鈕，不落入地圖全域確認鍵。
  panel.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && (event.target as Element | null)?.closest("button, summary")) event.stopPropagation();
  });
  let destroyed = false;
  const render = (): void => {
    if (destroyed) return;
    const focused = doc.activeElement && panel.contains(doc.activeElement)
      ? (doc.activeElement as HTMLElement).dataset.focusKey : undefined;
    const catalog = opts.catalog(), state = opts.store.state;
    content.replaceChildren();
    for (const [label, ids] of [["我的最愛", state.favorites], ["最近使用", state.recent], ["可釘選操作", catalog.map(c => c.id)]] as const) {
      const section = doc.createElement("section"); section.className = "shortcut-section";
      const heading = doc.createElement("h3"); heading.textContent = label; section.append(heading);
      const list = doc.createElement("div"); list.className = "shortcut-list";
      for (const id of ids) {
        const option = catalog.find(c => c.id === id);
        const row = doc.createElement("div"); row.className = "shortcut-row";
        const activate = doc.createElement("button"); activate.type = "button"; activate.className = "shortcut-activate";
        activate.dataset.focusKey = `${label}:activate:${id}`;
        activate.dataset.shortcutId = id; activate.textContent = option?.label ?? id; activate.disabled = !option?.enabled;
        activate.addEventListener("click", () => { if (opts.catalog().some(c => c.id === id && c.enabled)) opts.onActivate(id); });
        const pin = doc.createElement("button"); pin.type = "button"; pin.className = "shortcut-pin";
        pin.dataset.focusKey = `${label}:pin:${id}`;
        const pinned = state.favorites.includes(id); pin.textContent = pinned ? "★" : "☆";
        pin.setAttribute("aria-label", `${pinned ? "取消釘選" : "釘選"} ${option?.label ?? id}`); pin.setAttribute("aria-pressed", String(pinned));
        pin.addEventListener("click", () => {
          status.textContent = opts.store.togglePin(id) === "full" ? "我的最愛已滿 8 項，請先取消釘選其他操作。" : "";
        });
        row.append(activate, pin);
        if (!option?.enabled) {
          const reason = doc.createElement("small"); reason.className = "shortcut-reason";
          reason.textContent = option ? option.reason ?? "目前不可用" : "目前無此操作"; row.append(reason);
        }
        list.append(row);
      }
      if (!ids.length) { const empty = doc.createElement("p"); empty.className = "shortcut-empty"; empty.textContent = "尚無操作"; list.append(empty); }
      section.append(list); content.append(section);
    }
    if (focused) [...content.querySelectorAll<HTMLButtonElement>("button")].find(b => b.dataset.focusKey === focused)?.focus();
  };
  const unsubscribe = opts.store.subscribe(render); render();
  return { render, destroy() { destroyed = true; unsubscribe(); panel.remove(); } };
}
