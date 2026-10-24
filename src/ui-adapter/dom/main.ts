// ui-adapter/dom/main — 瀏覽器入口（唯一接線處）：載內容 → 建 controller → 掛 DOM。
// URL 參數：?scenario=<id 或 debug-big>&seed=<n>&size=<大地圖邊長>；預設 scenario/skirmish-whitegloves、seed 1。
import "./style.css";
import "./shell.css";
import { loadBrowserContent } from "../content-browser.ts";
import { BattleController, BattleSession, bigMapSim, controllerForScenario } from "../vm/index.ts";
import { DEFAULT_KEYMAP, resolveKey } from "../vm/keymap.ts";
import type { AnimMode, KeyInput, UiAction } from "../vm/types.ts";
import type { AppRoute } from "../vm/wiki/types.ts";
import { formatRoute } from "../vm/route.ts";
import { mountShell } from "./shell.ts";
import type { WikiMount } from "./wiki/mount.ts";
import { mountBattle } from "./render.ts";
import type { BattleView } from "./render.ts";

const modules = import.meta.glob("/content/base/**/*.json", { eager: true });

function readSetting(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeSetting(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* 儲存不可用時，本次設定仍有效。 */ }
}

function animationSetting(value: string | null): AnimMode | null {
  return value === "on" || value === "fast" || value === "off" ? value : null;
}

function start(root: HTMLElement, navigate: (hash: string) => void): ((key: KeyInput) => boolean) | undefined {
  const { db, errors } = loadBrowserContent(modules);
  if (errors.length) {
    root.textContent = `內容載入失敗：${errors.length} 個錯誤（第一個：${errors[0]!.file} ${errors[0]!.message}）`;
    return;
  }
  const params = new URLSearchParams(location.search);
  const seed = Number(params.get("seed") ?? 1) || 1;
  const scenario = params.get("scenario") ?? "scenario/skirmish-whitegloves";
  let controller: BattleController;
  if (scenario === "debug-big") {
    const size = Math.max(121, Number(params.get("size") ?? 160) || 160);
    const session = new BattleSession({ db, sim: bigMapSim(db, size, seed), seed, autoAdvance: false });
    controller = new BattleController({ session, title: `大地圖測試 ${size}×${size}` });
  } else controller = controllerForScenario(db, scenario, seed);
  root.textContent = "";
  let anim: AnimMode = animationSetting(params.get("anim")) ?? animationSetting(readSetting("mecha-srpg.ui.anim")) ?? "on";
  const storedZoom = readSetting("mecha-srpg.ui.zoom");
  const zoom: number | "auto" = storedZoom && storedZoom.trim() && Number.isFinite(Number(storedZoom)) && Number(storedZoom) >= 12 && Number(storedZoom) <= 96
    ? Number(storedZoom) : "auto";
  // mountBattle 可能在掛載當下就回呼（例：量到容器大小送 resize），所以 view 先宣告、回呼裡判空。
  let view: BattleView | null = null;
  let timer: number | null = null;
  let latest = controller.snapshot();
  const schedule = (): void => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    if (!latest.busy) return;
    const fast = anim === "fast" || (anim === "on" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const pause = anim === "off" ? 0 : fast ? 150 : 450;
    timer = window.setTimeout(() => { timer = null; send({ type: "step" }); }, Math.max(view?.fxBusyMs() ?? 0, pause));
  };
  const send = (action: UiAction): void => {
    if (action.type === "navigate") {
      navigate(formatRoute(action.page === "wiki" ? { page: "wiki", view: { v: "home" } } : { page: action.page }));
      return;
    }
    if (view?.apply(action)) return;
    if (action.type === "skip" || (latest.busy && (action.type === "cancel" || action.type === "confirm"))) view?.skipFx();
    latest = controller.dispatch(action);
    view?.render(latest);
    schedule();
  };
  const onKey = (key: KeyInput): boolean => {
    const action = resolveKey(DEFAULT_KEYMAP, key);
    if (!action) return false;
    send(action);
    return true;
  };
  view = mountBattle(root, {
    anim, zoom,
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
  schedule();
  // e2e／除錯掛鉤；settle 與玩家按「跳過」走同一條路。
  (window as unknown as { __battle?: unknown }).__battle = {
    snapshot: () => controller.snapshot(), settle: () => send({ type: "skip" }),
  };
  return onKey;
}

const root = document.getElementById("app");
if (root) {
  let battleStarted = false;
  let battleKey: ((key: KeyInput) => boolean) | undefined;
  let wiki: WikiMount | null = null;
  let loading: Promise<void> | null = null;
  let latestRoute: AppRoute = { page: "battle" };
  const shell = mountShell(root, {
    getWiki: () => wiki,
    onBattleKey: key => battleKey?.(key) ?? false,
    onRoute: (route, pages) => {
      latestRoute = route;
      if (route.page === "battle" && !battleStarted) {
        battleStarted = true;
        try { battleKey = start(pages.battle, hash => shell.navigate(hash)); }
        catch (e) { pages.battle.textContent = `啟動失敗：${e instanceof Error ? e.message : String(e)}`; console.error(e); }
      }
      if (route.page !== "wiki") return;
      if (wiki) { wiki.show(route.view); return; }
      if (loading) return;
      pages.wiki.textContent = "百科載入中…";
      loading = import("./wiki/boot.ts").then(({ bootWiki }) => {
        wiki = bootWiki(pages.wiki, (hash, replace) => shell.navigate(hash, replace));
        if (latestRoute.page === "wiki") wiki.show(latestRoute.view);
      }).catch((e: unknown) => {
        pages.wiki.textContent = `百科載入失敗：${e instanceof Error ? e.message : String(e)}`;
        console.error(e);
      });
    },
  });
}
