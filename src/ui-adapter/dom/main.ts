// ui-adapter/dom/main — 瀏覽器入口（唯一接線處）：載內容 → 建 controller → 掛 DOM。
// URL 參數：?scenario=<id 或 debug-big>&seed=<n>&size=<大地圖邊長>；預設 scenario/skirmish-whitegloves、seed 1。
import "./style.css";
import { loadBrowserContent } from "../content-browser.ts";
import { BattleController, BattleSession, bigMapSim, controllerForScenario } from "../vm/index.ts";
import { mountBattle } from "./render.ts";
import type { BattleView } from "./render.ts";

const modules = import.meta.glob("/content/base/**/*.json", { eager: true });

function start(root: HTMLElement): void {
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
    const session = new BattleSession({ db, sim: bigMapSim(db, size, seed), seed });
    controller = new BattleController({ session, title: `大地圖測試 ${size}×${size}` });
  } else controller = controllerForScenario(db, scenario, seed);
  root.textContent = "";
  // mountBattle 可能在掛載當下就回呼（例：量到容器大小送 resize），所以 view 先宣告、回呼裡判空。
  let view: BattleView | null = null;
  view = mountBattle(root, {
    onAction: a => { const snap = controller.dispatch(a); view?.render(snap); },
    onKey: k => {
      const snap = controller.key(k);
      if (!snap) return false;
      view?.render(snap);
      return true;
    },
  });
  view.render(controller.snapshot());
  // 給 e2e／除錯用的唯讀掛鉤（不影響遊戲狀態）
  (window as unknown as { __battle?: unknown }).__battle = { snapshot: () => controller.snapshot() };
}

const root = document.getElementById("app");
if (root) {
  try { start(root); }
  catch (e) { root.textContent = `啟動失敗：${e instanceof Error ? e.message : String(e)}`; console.error(e); }
}
