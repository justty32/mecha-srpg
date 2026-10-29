/** 只保存穩定操作 id；遊戲命令與目標永不進入偏好。 */
export type ShortcutScope = "battle" | "ops";
export type CommandPreferenceState = { recent: string[]; favorites: string[] };
export type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;
export type CommandPreferenceStore = {
  readonly state: CommandPreferenceState;
  record(id: string): void;
  togglePin(id: string): "added" | "removed" | "full" | "invalid";
  subscribe(fn: () => void): () => void;
  destroy(): void;
};
export const PREFERENCE_KEY = "mecha-srpg.ui.shortcuts.v1";
const tabs = new Set(["ship", "world", "contracts", "roster", "mechs", "ledger", "market", "calendar"]);
export function allowedShortcutId(scope: ShortcutScope, id: string): boolean {
  return scope === "battle"
    ? ["move", "standby", "defer", "end"].includes(id) || /^ability:[a-zA-Z0-9_./:-]{1,200}$/.test(id)
    : (id.startsWith("tab:") && tabs.has(id.slice(4))) || ["map:center", "map:layers", "map:maps"].includes(id);
}
const empty = (): CommandPreferenceState => ({ recent: [], favorites: [] });
function clean(scope: ShortcutScope, value: unknown): CommandPreferenceState {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const ids = (input: unknown, max: number): string[] => Array.isArray(input)
    ? [...new Set(input.filter((id): id is string => typeof id === "string" && allowedShortcutId(scope, id)))].slice(0, max) : [];
  return { recent: ids(v.recent, 6), favorites: ids(v.favorites, 8) };
}
export function createCommandPreferenceStore(scope: ShortcutScope, storage?: PreferenceStorage | null): CommandPreferenceStore {
  let backend = storage;
  if (backend === undefined) { try { backend = globalThis.localStorage; } catch { backend = null; } }
  let data: Record<ShortcutScope, CommandPreferenceState> = { battle: empty(), ops: empty() };
  try {
    const raw: unknown = JSON.parse(backend?.getItem(PREFERENCE_KEY) ?? "null");
    if (raw && typeof raw === "object" && (raw as { version?: unknown }).version === 1) {
      const source = raw as Record<string, unknown>;
      data = { battle: clean("battle", source.battle), ops: clean("ops", source.ops) };
    }
  } catch { /* 儲存失效仍保留本次記憶體偏好。 */ }
  const listeners = new Set<() => void>();
  const update = (): void => {
    // 保留另一 scope 最近一次寫入，避免先掛載的畫面覆蓋它。
    try {
      const other = scope === "battle" ? "ops" : "battle";
      const disk = JSON.parse(backend?.getItem(PREFERENCE_KEY) ?? "null") as Record<string, unknown> | null;
      if (disk?.version === 1) data[other] = clean(other, disk[other]);
    } catch { /* 讀取／解析失敗時仍嘗試修復儲存內容。 */ }
    try {
      backend?.setItem(PREFERENCE_KEY, JSON.stringify({ version: 1, ...data }));
    } catch { /* write/getter 失敗不影響操作。 */ }
    listeners.forEach(fn => fn());
  };
  return {
    get state() { return { recent: [...data[scope].recent], favorites: [...data[scope].favorites] }; },
    record(id) { if (!allowedShortcutId(scope, id)) return; data[scope].recent = [id, ...data[scope].recent.filter(v => v !== id)].slice(0, 6); update(); },
    togglePin(id) {
      if (!allowedShortcutId(scope, id)) return "invalid";
      const pins = data[scope].favorites;
      if (pins.includes(id)) { data[scope].favorites = pins.filter(v => v !== id); update(); return "removed"; }
      if (pins.length >= 8) return "full";
      pins.push(id); update(); return "added";
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    destroy() { listeners.clear(); },
  };
}

const shared = new Map<ShortcutScope, CommandPreferenceStore>();
/** 同頁所有宿主共用 scope 實例，send 記一次，view 僅訂閱。 */
export function commandPreferences(scope: ShortcutScope): CommandPreferenceStore {
  let store = shared.get(scope);
  if (!store) { store = createCommandPreferenceStore(scope); shared.set(scope, store); }
  return store;
}
