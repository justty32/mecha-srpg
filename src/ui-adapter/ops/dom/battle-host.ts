import { commandPreferences } from "../../dom/command-preferences.ts";
import { battleShortcutForAction } from "../../dom/command-shortcuts.ts";
// ui-adapter/ops/dom/battle-host — 營運出戰時掛戰鬥畫面（仿 src/ui-adapter/dom/main.ts 的 start()，不改那個檔）。
// 演出計時 step、skip、動畫／縮放設定讀寫與戰鬥頁同一組 localStorage 鍵；分出勝負後出現「返回營運」（Enter）。
import "../../dom/style.css";
import type { BattleController } from "../../vm/index.ts";
import { DEFAULT_KEYMAP, resolveKey } from "../../vm/keymap.ts";
import type { AnimMode, KeyInput, UiAction, UiSnapshot } from "../../vm/types.ts";
import { mountBattle } from "../../dom/render.ts";
import type { BattleView } from "../../dom/render.ts";

export type BattleHost = { destroy(): void };

function readSetting(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeSetting(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* 儲存不可用時，本次設定仍有效。 */ }
}
const animSetting = (v: string | null): AnimMode | null => v === "on" || v === "fast" || v === "off" ? v : null;

export function hostBattle(root: HTMLElement, controller: BattleController, opts: { spectate: boolean; onDone(): void }): BattleHost {
  const doc = root.ownerDocument;
  const params = new URLSearchParams(location.search);
  let anim: AnimMode = animSetting(params.get("anim")) ?? animSetting(readSetting("mecha-srpg.ui.anim")) ?? "on";
  const storedZoom = readSetting("mecha-srpg.ui.zoom");
  const zoom: number | "auto" = storedZoom && storedZoom.trim() && Number.isFinite(Number(storedZoom)) && Number(storedZoom) >= 12 && Number(storedZoom) <= 96
    ? Number(storedZoom) : "auto";
  const layer = doc.createElement("div");
  layer.className = "ops-view ops-battle-host";
  layer.dataset.ui = "ops-battle";
  const bar = doc.createElement("div");
  bar.className = "ops-battle-bar";
  const back = doc.createElement("button");
  back.type = "button";
  back.dataset.ui = "battle-return";
  back.textContent = "返回營運";
  const kbd = doc.createElement("kbd");
  kbd.textContent = "Enter";
  back.append(kbd);
  back.title = "戰鬥已分出勝負：回營運並登錄戰果（快捷鍵：Enter）";
  back.hidden = true;
  bar.append(back);
  const stage = doc.createElement("div");
  stage.className = "ops-battle-stage";
  layer.append(bar, stage);
  root.append(layer);

  let view: BattleView | null = null;
  let timer: number | null = null;
  let destroyed = false;
  const shortcutStore = commandPreferences("battle");
  let latest: UiSnapshot = controller.snapshot();
  const done = (): boolean => latest.outcome !== null;
  const finish = (): void => { if (!destroyed && done()) opts.onDone(); };
  back.addEventListener("click", finish);
  const schedule = (): void => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    if (destroyed || !latest.busy) return;
    const fast = anim === "fast" || (anim === "on" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const pause = anim === "off" ? 0 : fast ? 150 : 450;
    timer = window.setTimeout(() => { timer = null; send({ type: "step" }); }, Math.max(view?.fxBusyMs() ?? 0, pause));
  };
  const send = (action: UiAction): void => {
    if (destroyed) return;
    // 戰鬥頁的跨頁導航（wiki 線）在營運出戰中不適用。
    if ((action as { type: string }).type === "navigate") return;
    if (view?.apply(action)) return;
    if (action.type === "skip" || (latest.busy && (action.type === "cancel" || action.type === "confirm"))) view?.skipFx();
    const shortcutId = battleShortcutForAction(controller.snapshot(), action);
    latest = controller.dispatch(action);
    if (shortcutId) shortcutStore.record(shortcutId);
    view?.render(latest);
    back.hidden = !done();
    schedule();
  };
  const onKey = (key: KeyInput): boolean => {
    if (done() && key.key === "Enter") { finish(); return true; }
    const action = resolveKey(DEFAULT_KEYMAP, key);
    if (!action) return false;
    send(action);
    return true;
  };
  view = mountBattle(stage, {
    anim, zoom, shortcutStore,
    onSettings: settings => {
      anim = settings.anim;
      writeSetting("mecha-srpg.ui.anim", settings.anim);
      writeSetting("mecha-srpg.ui.zoom", String(settings.zoom));
      schedule();
    },
    onAction: send,
    onKey,
  });
  view.render(latest);
  back.hidden = !done();
  schedule();
  // e2e 掛鉤；spectate 時全 AI，settle 與按「跳過」同一條路。
  const hook = { snapshot: () => controller.snapshot(), settle: () => send({ type: "skip" }), spectate: opts.spectate };
  (window as unknown as { __opsBattle?: unknown }).__opsBattle = hook;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (timer !== null) window.clearTimeout(timer);
      view?.destroy();
      layer.remove();
      const w = window as unknown as { __opsBattle?: unknown };
      if (w.__opsBattle === hook) delete w.__opsBattle;
    },
  };
}
