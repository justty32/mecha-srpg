// ui-adapter/ops/dom/render — 營運畫面 DOM：只畫 OpsSnapshot，點擊與按鍵轉成 OpsUiAction／OpsKeyInput 交回。
// 佈局：頂列（日期、潮相、錢、位置、航程、燃料、船體＋推進鈕）常駐；左欄分頁＋裂縫／佇列小表；主區依 tab；右欄記錄。
// 疊層（prompt／編成／戰果／說明）蓋在上面，不改變底下面板位置。
import type { OpsKeyInput, OpsSnapshot, OpsUiAction } from "../vm/types.ts";
import { mountTooltip } from "../../dom/tooltip.ts";
import { buttonRow, changeCache, el, meter, registeredAction, type ActionRegistry } from "./ui.ts";
import { createTabs } from "./tabs.ts";
import { createOverlays } from "./overlays.ts";

export type OpsMountOptions = { onAction(a: OpsUiAction): void; onKey(k: OpsKeyInput): boolean };
export type OpsView = { render(s: OpsSnapshot): void; setActive(on: boolean): void; destroy(): void };

const money = (n: number): string => `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("en-US")}`;

export function mountOps(root: HTMLElement, opts: OpsMountOptions): OpsView {
  const doc = root.ownerDocument;
  const registry: ActionRegistry = new WeakMap();
  const changed = changeCache();
  let active = true;
  let destroyed = false;

  const shell = el(doc, "div", "", "ops-view");
  shell.dataset.ui = "ops";
  const part = <K extends keyof HTMLElementTagNameMap>(tag: K, ui: string, cls = ""): HTMLElementTagNameMap[K] => {
    const node = el(doc, tag, "", cls);
    node.dataset.ui = ui;
    return node;
  };
  const header = part("header", "ops-header");
  const facts = el(doc, "div", "", "ops-facts");
  const time = el(doc, "div", "", "ops-time");
  const helpToggle = part("button", "ops-help-toggle", "ops-plain");
  helpToggle.type = "button";
  helpToggle.textContent = "?";
  helpToggle.dataset.tip = "快捷鍵說明";
  helpToggle.setAttribute("aria-label", "快捷鍵說明");
  registry.set(helpToggle, { type: "toggleHelp" });
  header.append(facts, time, helpToggle);
  const message = part("p", "ops-message");
  message.setAttribute("role", "status");
  const over = part("p", "ops-over");
  const layout = el(doc, "div", "", "ops-layout");
  const left = el(doc, "aside", "", "ops-left");
  const tabs = part("nav", "ops-tabs");
  tabs.setAttribute("aria-label", "營運分頁");
  const rifts = part("section", "ops-rifts", "ops-card");
  const queue = part("section", "ops-queue", "ops-card");
  left.append(tabs, rifts, queue);
  const main = part("main", "ops-main");
  const logPanel = el(doc, "aside", "", "ops-log-panel");
  const log = part("ol", "ops-log");
  log.setAttribute("aria-label", "營運記錄");
  logPanel.append(el(doc, "h2", "記錄"), log);
  layout.append(left, main, logPanel);
  const overlayLayer = el(doc, "div", "", "ops-overlays");
  shell.append(header, message, over, layout, overlayLayer);
  root.append(shell);

  const panes = createTabs(main, registry, opts.onAction);
  const overlays = createOverlays(overlayLayer, registry, opts.onAction);
  const tooltip = mountTooltip(shell);

  const paintHeader = (s: OpsSnapshot): void => {
    const h = s.header;
    const fact = (label: string, value: string, cls = ""): HTMLElement => {
      const node = el(doc, "span", "", `ops-fact${cls ? ` ${cls}` : ""}`);
      node.append(el(doc, "small", label), el(doc, "b", value));
      return node;
    };
    const date = fact("日期", h.dateText, `phase-${h.phase}`);
    date.dataset.ui = "ops-date";
    const fuel = meter(doc, "燃料", h.fuel.cur, h.fuel.max, "fuel");
    const hull = meter(doc, "船體", h.hull.cur, h.hull.max, "hull");
    facts.replaceChildren(date, fact("蝕相", h.phaseName, `phase-${h.phase}`),
      fact("現金", money(h.cash), h.cash < 0 ? "neg" : ""), fact("債", money(h.debt), h.debt > 0 ? "neg" : ""),
      fact("所在", `${h.location}${h.docked ? "（停泊）" : ""}`),
      fact("航程", h.route ? `→ ${h.route.toName}・剩 ${h.route.daysLeft} 天` : "—"),
      fact("蝕壓", String(h.pressure)), fuel, hull);
  };
  const paintSide = (s: OpsSnapshot): void => {
    rifts.replaceChildren(el(doc, "h3", `裂縫（${s.panels.rifts.length}）`));
    if (!s.panels.rifts.length) rifts.append(el(doc, "p", "無已知裂縫", "muted"));
    const ul = el(doc, "ul", "", "ops-mini");
    for (const r of s.panels.rifts) ul.append(el(doc, "li", `${r.nodeName}・${r.phaseName}・${r.width}`));
    rifts.append(ul);
    queue.replaceChildren(el(doc, "h3", `工時佇列（${s.panels.queue.length}）`));
    if (!s.panels.queue.length) queue.append(el(doc, "p", "佇列是空的", "muted"));
    for (const q of s.panels.queue) queue.append(meter(doc, q.text, Math.round(q.progress * 100), 100));
  };
  const paintLog = (s: OpsSnapshot): void => {
    log.replaceChildren(...s.log.map(line => {
      const li = el(doc, "li", "", `kind-${line.kind}`);
      li.dataset.kind = line.kind;
      li.append(el(doc, "span", `D${line.day}`, "ops-log-day"), el(doc, "span", line.text));
      return li;
    }));
    log.scrollTop = log.scrollHeight;
  };

  const click = (event: MouseEvent): void => {
    const hit = registeredAction(registry, event.target, shell);
    if (hit) opts.onAction(hit.action);
  };
  const keydown = (event: KeyboardEvent): void => {
    if (!active || destroyed || shell.closest("[hidden]")) return;
    const target = event.target as HTMLElement | null;
    const typing = !!target?.matches?.("input, textarea, select") || !!doc.activeElement?.matches("input, textarea, select");
    if (typing && event.key !== "Escape") return;
    // 可點列表項的 Enter／空白 → 選取（不是全域快捷鍵）。
    if ((event.key === "Enter" || event.key === " ") && target?.classList?.contains("ops-pick") && shell.contains(target)) {
      const action = registry.get(target);
      if (action) { event.preventDefault(); opts.onAction(action); return; }
    }
    if (opts.onKey({ key: event.key, ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey })) event.preventDefault();
  };
  shell.addEventListener("click", click);
  doc.addEventListener("keydown", keydown);

  return {
    render(s) {
      if (destroyed) return;
      if (changed("header", s.header)) paintHeader(s);
      if (changed("time", s.timeButtons)) time.replaceChildren(buttonRow(doc, s.timeButtons, registry));
      if (changed("tabs", s.tabs)) tabs.replaceChildren(buttonRow(doc, s.tabs, registry, "ops-buttons ops-tab-list"));
      if (changed("side", s.panels)) paintSide(s);
      if (changed("log", s.log)) paintLog(s);
      panes.paint(s);
      overlays.paint(s);
      message.hidden = s.message === null;
      message.textContent = s.message ?? "";
      over.hidden = !s.over;
      over.textContent = s.over ? "戰役已結束。" : "";
      shell.classList.toggle("has-overlay", !!(s.prompt || s.sortie || s.report || s.showHelp));
      helpToggle.setAttribute("aria-expanded", String(s.showHelp));
      tooltip.refresh();
    },
    setActive(on) {
      active = on;
      shell.hidden = !on;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      doc.removeEventListener("keydown", keydown);
      shell.removeEventListener("click", click);
      panes.destroy();
      tooltip.destroy();
      shell.remove();
    },
  };
}
