import type { UiSnapshot, UiAction, KeyInput, AnimMode } from "../vm/types.ts";
import { createBoard } from "./board.ts";
import { createPanels, element } from "./panels.ts";
import { mountTooltip } from "./tooltip.ts";
import { anchorViewport, fitCellSize, zoomStep } from "./zoom.ts";
import { createFx } from "./fx.ts";
import { createMenus } from "./menus.ts";

export type MountOptions = {
  onAction(a: UiAction): void;
  onKey(k: KeyInput): boolean;
  cellSize?: number;
  anim?: AnimMode;
  zoom?: number | "auto";
  onSettings?(s: { anim: AnimMode; zoom: number | "auto" }): void;
};
export type BattleView = {
  render(s: UiSnapshot): void;
  apply(a: UiAction): boolean;
  skipFx(): void;
  fxBusyMs(): number;
  destroy(): void;
};

export function mountBattle(root: HTMLElement, opts: MountOptions): BattleView {
  const doc = root.ownerDocument;
  const host = doc.defaultView;
  let zoom: number | "auto" = typeof opts.zoom === "number" && Number.isFinite(opts.zoom) && opts.zoom >= 12 && opts.zoom <= 96
    ? opts.zoom : opts.cellSize && Number.isFinite(opts.cellSize) && opts.cellSize > 0 ? Math.max(12, Math.min(96, opts.cellSize)) : "auto";
  let cellSize = typeof zoom === "number" ? zoom : 32;
  let anim = opts.anim ?? "on";
  const shell = element(doc, "div", "", "battle-view");
  const anchor = <K extends keyof HTMLElementTagNameMap>(tag: K, name: string): HTMLElementTagNameMap[K] => {
    const node = element(doc, tag);
    node.dataset.ui = name;
    return node;
  };
  const topbar = anchor("header", "topbar");
  const title = element(doc, "h1");
  const round = anchor("span", "round");
  const turn = element(doc, "span");
  const position = anchor("span", "viewport-pos");
  const helpToggle = anchor("button", "help-toggle");
  helpToggle.type = "button";
  helpToggle.textContent = "?";
  helpToggle.setAttribute("aria-label", "快捷鍵說明");
  topbar.append(title, round, turn, position, helpToggle);
  const layout = element(doc, "div", "", "battle-layout");
  const field = element(doc, "section", "", "battle-field");
  const frame = element(doc, "div", "", "board-frame");
  const viewport = element(doc, "div", "", "board-viewport");
  const board = anchor("div", "board");
  board.setAttribute("aria-label", "戰場");
  const stage = element(doc, "div", "", "board-stage");
  const fxLayer = anchor("div", "fx-layer");
  stage.append(board, fxLayer);
  viewport.append(stage);
  const scrollActions = new Map<string, UiAction>([
    ["scroll-up", { type: "scroll", dx: 0, dy: -10 }],
    ["scroll-down", { type: "scroll", dx: 0, dy: 10 }],
    ["scroll-left", { type: "scroll", dx: -10, dy: 0 }],
    ["scroll-right", { type: "scroll", dx: 10, dy: 0 }],
  ]);
  for (const [name, label] of [["scroll-up", "↑"], ["scroll-down", "↓"], ["scroll-left", "←"], ["scroll-right", "→"]]) {
    const button = anchor("button", name!);
    button.type = "button";
    button.textContent = label!;
    button.setAttribute("aria-label", `捲動 ${label} 10 格`);
    frame.append(button);
  }
  frame.append(viewport);
  const commands = anchor("nav", "commands");
  commands.setAttribute("aria-label", "戰鬥指令");
  const message = anchor("p", "message");
  message.setAttribute("role", "status");
  const messageSlot = element(doc, "div", "", "battle-message-slot");
  messageSlot.append(message);
  const outcome = anchor("section", "outcome");
  outcome.setAttribute("role", "status");
  const help = anchor("section", "help");
  const unit = anchor("section", "unit");
  const inspect = anchor("section", "inspect");
  const logPanel = element(doc, "section", "", "log-panel");
  const log = anchor("ol", "log");
  log.setAttribute("aria-label", "戰鬥記錄");
  logPanel.append(element(doc, "h2", "戰鬥記錄"), log);
  const sidebar = element(doc, "aside", "", "battle-sidebar");
  sidebar.setAttribute("aria-label", "部位與傷勢");
  const parts = anchor("section", "parts");
  const partsBody = anchor("div", "parts-body");
  parts.append(partsBody); sidebar.append(parts);
  const commandPanel = element(doc, "aside", "", "command-panel");
  const controls = anchor("section", "view-controls");
  const viewActions = new Map<string, UiAction>([
    ["anim-toggle", { type: "cycleAnim" }], ["zoom-in", { type: "zoom", dir: 1 }],
    ["zoom-out", { type: "zoom", dir: -1 }], ["zoom-fit", { type: "zoom", dir: 0 }],
    ["board-zoom-in", { type: "zoom", dir: 1 }], ["board-zoom-out", { type: "zoom", dir: -1 }],
  ]);
  const controlButtons = new Map<string, HTMLButtonElement>();
  const corner = element(doc, "div", "", "board-zoom");
  for (const name of viewActions.keys()) {
    const button = anchor("button", name);
    button.type = "button";
    controlButtons.set(name, button);
    (name.startsWith("board-") ? corner : controls).append(button);
  }
  frame.append(corner);
  commandPanel.setAttribute("aria-label", "指揮區");
  commandPanel.append(unit, commands, controls);
  field.append(frame, inspect, messageSlot, outcome, help);
  layout.append(field, commandPanel, sidebar, logPanel);
  shell.append(topbar, layout);
  root.append(shell);
  message.hidden = outcome.hidden = help.hidden = true;
  const paintBoard = createBoard(board, cellSize);
  const paintPanels = createPanels({ commands, message, outcome, help, unit, inspect, log, parts: partsBody });
  const paintMenus = createMenus(stage, field, parts);
  const fx = createFx(fxLayer);
  const tooltip = mountTooltip(shell);
  let current: UiSnapshot | null = null;
  let destroyed = false;
  let mouseCell: UiSnapshot["cursor"] | null = null;
  const paintControls = (): void => {
    for (const [name, button] of controlButtons) {
      const action = viewActions.get(name)!;
      const actionName = action.type === "zoom" ? `zoom:${action.dir}` : action.type;
      const raw = current?.keyHints.find(h => h.action === actionName)?.keys[0];
      const key = raw && raw.length === 1 ? raw.toUpperCase() : raw;
      const label = action.type === "cycleAnim" ? `動畫：${{ on: "開", fast: "快", off: "關" }[anim]}`
        : name.endsWith("in") ? "放大" : name.endsWith("out") ? "縮小" : "自動貼合";
      button.textContent = label;
      if (key) button.append(element(doc, "kbd", key));
      button.dataset.tip = button.title = `${label}${key ? `（快捷鍵：${key}）` : ""}`;
    }
  };
  let measuring = false;
  const measure = (preserveAnchor = false): void => {
    if (destroyed || measuring || !current) return;
    const width = viewport.clientWidth, height = viewport.clientHeight;
    if (width <= 0 || height <= 0) return;
    const previous = current.viewport, map = current.map, at = mouseCell ?? current.cursor;
    if (zoom === "auto") cellSize = fitCellSize(width, height, map.width, map.height);
    board.style.setProperty("--cell-size", `${cellSize}px`);
    board.dataset.density = cellSize < 20 ? "tiny" : cellSize < 32 ? "small" : "normal";
    const w = Math.max(1, Math.min(map.width, Math.floor(width / cellSize)));
    const h = Math.max(1, Math.min(map.height, Math.floor(height / cellSize)));
    measuring = true;
    try {
      if (previous.w !== w || previous.h !== h) opts.onAction({ type: "resize", w, h });
      if (preserveAnchor) {
        const position = anchorViewport(previous, { w, h }, at, map);
        opts.onAction({ type: "setViewport", ...position });
      }
      if (current) { paintMenus(current, cellSize); fx.render(current, cellSize, anim); }
    } finally { measuring = false; }
  };
  const apply = (a: UiAction): boolean => {
    if (destroyed || (a.type !== "zoom" && a.type !== "cycleAnim")) return false;
    if (a.type === "cycleAnim") anim = anim === "on" ? "fast" : anim === "fast" ? "off" : "on";
    else {
      zoom = a.dir === 0 ? "auto" : zoomStep(cellSize, a.dir);
      if (typeof zoom === "number") cellSize = zoom;
      board.style.setProperty("--cell-size", `${cellSize}px`);
    board.dataset.density = cellSize < 20 ? "tiny" : cellSize < 32 ? "small" : "normal";
      measure(true);
    }
    paintControls();
    if (current) { paintMenus(current, cellSize); fx.render(current, cellSize, anim); }
    opts.onSettings?.({ anim, zoom });
    return true;
  };
  const closest = (event: Event, selector: string): HTMLElement | null => {
    const found = (event.target as HTMLElement | null)?.closest?.<HTMLElement>(selector);
    return found && shell.contains(found) ? found : null;
  };
  const click = (event: MouseEvent): void => {
    const line = closest(event, "li[data-seq]");
    if (line) { opts.onAction({ type: "focusLog", seq: Number(line.dataset.seq) }); return; }
    const cell = closest(event, "[data-x][data-y]");
    if (cell && board.contains(cell)) {
      opts.onAction({ type: "clickCell", x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
      return;
    }
    const button = closest(event, "button");
    if (!button || (button as HTMLButtonElement).disabled) return;
    const viewAction = viewActions.get(button.dataset.ui ?? "");
    if (viewAction) apply(viewAction);
    else if (button.dataset.ui === "confirm-accept") opts.onAction({ type: "endTurn" });
    else if (button.dataset.ui === "confirm-cancel") opts.onAction({ type: "cancel" });
    else if (button.dataset.partN) opts.onAction({ type: "pickPart", n: Number(button.dataset.partN) });
    else if (button === helpToggle) opts.onAction({ type: "toggleHelp" });
    else if (button.dataset.cmd) {
      const choices = button.closest('[data-ui="quick-menu"]') ? current?.quickMenu?.options : current?.commands;
      const command = choices?.find(c => c.id === button.dataset.cmd);
      if (command?.enabled) opts.onAction(command.action);
    } else {
      const action = scrollActions.get(button.dataset.ui ?? "");
      if (action) opts.onAction(action);
    }
  };
  const hover = (event: MouseEvent): void => {
    const cell = closest(event, "[data-x][data-y]");
    if (!cell || !board.contains(cell) || (event.relatedTarget && cell.contains(event.relatedTarget as Node))) return;
    const at = { x: Number(cell.dataset.x), y: Number(cell.dataset.y) };
    if (mouseCell?.x === at.x && mouseCell.y === at.y) return;
    mouseCell = at;
    opts.onAction({ type: "hoverCell", ...at });
  };
  const leave = (): void => { mouseCell = null; };
  const wheel = (event: WheelEvent): void => {
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY) apply({ type: "zoom", dir: event.deltaY < 0 ? 1 : -1 });
      return;
    }
    // SPEC-GAP：notch 沒有跨裝置單位；每個非零 wheel 事件依方向捲 3 格。
    const horizontal = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = horizontal ? (event.shiftKey ? event.deltaY || event.deltaX : event.deltaX) : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    opts.onAction({ type: "scroll", dx: horizontal ? Math.sign(delta) * 3 : 0, dy: horizontal ? 0 : Math.sign(delta) * 3 });
  };
  const keydown = (event: KeyboardEvent): void => {
    if (shell.closest("[hidden]")) return;
    const active = doc.activeElement;
    const target = event.target as HTMLElement | null;
    if (active?.matches("input, textarea") || target?.matches?.("input, textarea")) return;
    const line = target?.closest?.<HTMLElement>("li[data-seq]");
    if (line && shell.contains(line) && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault(); opts.onAction({ type: "focusLog", seq: Number(line.dataset.seq) }); return;
    }
    if (opts.onKey({ key: event.key, ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey })) event.preventDefault();
  };
  shell.addEventListener("click", click);
  board.addEventListener("mouseover", hover);
  board.addEventListener("mouseleave", leave);
  viewport.addEventListener("wheel", wheel, { passive: false });
  doc.addEventListener("keydown", keydown);
  const resized = (): void => measure(true);
  host?.addEventListener("resize", resized);
  const Observer = host?.ResizeObserver;
  const observer = Observer ? new Observer(resized) : null;
  observer?.observe(viewport);
  measure();
  return {
    apply,
    skipFx: fx.clear,
    fxBusyMs: fx.busyMs,
    render(s) {
      if (destroyed) return;
      current = s;
      title.textContent = s.title; title.title = s.title;
      round.textContent = `第 ${s.round} 輪${s.maxRounds === null ? "" : ` / ${s.maxRounds}`}`;
      // SPEC-GAP：快照無獨立行動者名稱；優先查可視格／選取單位，否則顯示 id。
      const activeName = s.cells.find(c => c.unit?.id === s.activeUnit)?.unit?.name
        ?? (s.selected?.id === s.activeUnit ? s.selected?.name : null) ?? s.activeUnit;
      turn.textContent = s.busy ? `敵方行動中：${s.busy.name ?? activeName ?? "…"}`
        : activeName ? `${s.playerTurn ? "我方" : "其他陣營"}行動：${activeName}` : "等待行動";
      position.textContent = `${s.viewport.x},${s.viewport.y}`;
      helpToggle.setAttribute("aria-expanded", String(s.showHelp));
      paintBoard(s);
      paintPanels(s);
      paintControls();
      paintMenus(s, cellSize);
      fx.render(s, cellSize, anim);
      tooltip.refresh();
      measure();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      fx.clear();
      observer?.disconnect();
      host?.removeEventListener("resize", resized);
      doc.removeEventListener("keydown", keydown);
      shell.removeEventListener("click", click);
      board.removeEventListener("mouseover", hover);
      board.removeEventListener("mouseleave", leave);
      viewport.removeEventListener("wheel", wheel);
      tooltip.destroy();
      shell.remove();
      current = null;
    },
  };
}
