// ui-adapter/ops/dom/main — 營運頁接線（唯一 import vm 實作處）：載內容 → 建 OpsController → 掛營運 DOM；
// snapshot.battle 非 null 時藏起營運、另開一層掛戰鬥畫面，分出勝負按「返回營運」→ battleDone。
// URL：?seed=<n>（預設 1）&spectate=1（出戰全 AI 觀戰）。由殼的 #/ops 路由呼叫 mountOpsPage。
import "./ops.css";
import { packsFromGlob } from "../../content-browser.ts";
import { loadWorldPacks } from "../../../ops/content/load.ts";
import { OpsController } from "../vm/index.ts";
import type { OpsControllerOptions, OpsSnapshot, OpsUiAction } from "../vm/index.ts";
import { mountOps } from "./render.ts";
import { hostBattle, type BattleHost } from "./battle-host.ts";

const SAVE_KEY = "mecha-srpg.ops.save";
const modules = import.meta.glob("/content/base/**/*.json", { eager: true });

export function mountOpsPage(container: HTMLElement): { destroy(): void } {
  const doc = container.ownerDocument;
  const { db, world, errors } = loadWorldPacks(packsFromGlob(modules));
  if (errors.length) {
    throw new Error(`營運內容載入失敗：${errors.length} 個錯誤（第一個：${errors[0]!.file} ${errors[0]!.message}）`);
  }
  // 營運畫面自帶外距與滿版高度；殼給容器的 padding 會讓下緣超出視窗，掛載時歸零。
  container.style.padding = "0";
  const params = new URLSearchParams(location.search);
  const seed = Number(params.get("seed") ?? 1) || 1;
  const spectate = params.get("spectate") === "1";
  const options: OpsControllerOptions = { db, world, seed, spectate };
  let controller = new OpsController(options);
  let latest: OpsSnapshot = controller.snapshot();
  let notice: string | null = null;   // DOM 自己的提示（存讀檔），蓋在 snapshot.message 上
  let battle: BattleHost | null = null;
  const battleLayer = doc.createElement("div");
  battleLayer.className = "ops-battle-layer";

  const paint = (): void => {
    view.render(notice ? { ...latest, message: notice } : latest);
    if (latest.battle && !battle) {
      const bc = controller.battleController();
      if (!bc) { notice = "戰場建立失敗"; return; }
      view.setActive(false);
      battleLayer.hidden = false;
      battle = hostBattle(battleLayer, bc, { spectate: latest.battle.spectate, onDone: () => send({ type: "battleDone" }) });
    } else if (!latest.battle && battle) {
      battle.destroy();
      battle = null;
      battleLayer.hidden = true;
      view.setActive(true);
    }
  };
  const send = (action: OpsUiAction): void => {
    notice = null;
    latest = controller.dispatch(action);
    if (action.type === "cmd" && action.cmd.v === "save" && latest.message === null) {
      try {
        localStorage.setItem(SAVE_KEY, controller.serialize());
        notice = "已存檔";
      } catch (e) { notice = `存檔失敗：${e instanceof Error ? e.message : String(e)}`; }
    }
    paint();
  };
  const load = (): void => {
    let text: string | null = null;
    try { text = localStorage.getItem(SAVE_KEY); } catch { /* 儲存不可用 */ }
    if (!text) { notice = "沒有存檔"; paint(); return; }
    try {
      const next = OpsController.fromSave(options, text);
      battle?.destroy();
      battle = null;
      controller = next;
      latest = controller.snapshot();
      notice = "已讀檔";
    } catch (e) { notice = `讀檔失敗：${e instanceof Error ? e.message : String(e)}`; }
    paint();
  };

  const view = mountOps(container, {
    onAction: send,
    onKey: k => {
      // 殼把頁面藏起時不收（戰鬥 render.ts 同做法）。
      if (container.closest("[hidden]")) return false;
      const action = controller.key(k);
      if (!action) return false;
      send(action);
      return true;
    },
  });
  container.append(battleLayer);
  battleLayer.hidden = true;
  // 頂列「讀檔」：DOM 自有按鈕（不是 OpsButton，ops render 的登記表不認得它）。
  const loadButton = doc.createElement("button");
  loadButton.type = "button";
  loadButton.className = "ops-plain";
  loadButton.dataset.actionId = "dom:load";
  loadButton.textContent = "讀檔";
  loadButton.dataset.tip = "讀取瀏覽器裡的存檔（存檔：艦橋的「存檔」）";
  loadButton.addEventListener("click", load);
  container.querySelector('[data-ui="ops-header"]')?.insertBefore(loadButton, container.querySelector('[data-ui="ops-help-toggle"]'));
  paint();

  const hook = { snapshot: () => controller.snapshot(), dispatch: (a: OpsUiAction) => { send(a); return latest; } };
  (window as unknown as { __ops?: unknown }).__ops = hook;
  return {
    destroy() {
      battle?.destroy();
      view.destroy();
      battleLayer.remove();
      const w = window as unknown as { __ops?: unknown };
      if (w.__ops === hook) delete w.__ops;
    },
  };
}
