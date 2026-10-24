import type { UiSnapshot, UiAction, KeyInput } from "../vm/types.ts";
import { createBoard } from "./board.ts";
import { createPanels, element } from "./panels.ts";
import { mountTooltip } from "./tooltip.ts";

export type MountOptions = {
  onAction(a: UiAction): void;
  onKey(k: KeyInput): boolean;
  cellSize?: number;
};
export type BattleView = { render(s: UiSnapshot): void; destroy(): void };

export function mountBattle(root: HTMLElement, opts: MountOptions): BattleView {
  const doc = root.ownerDocument;
  const cellSize = opts.cellSize && Number.isFinite(opts.cellSize) && opts.cellSize > 0 ? opts.cellSize : 32;
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
  viewport.append(board);
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
  sidebar.append(unit, inspect);
  field.append(frame, commands, message, outcome, help, logPanel);
  layout.append(field, sidebar);
  shell.append(topbar, layout);
  root.append(shell);
  message.hidden = outcome.hidden = help.hidden = true;
  const paintBoard = createBoard(board, cellSize);
  const paintPanels = createPanels({ commands, message, outcome, help, unit, inspect, log });
  const tooltip = mountTooltip(shell);
  let current: UiSnapshot | null = null;
  let destroyed = false;
  const closest = (event: Event, selector: string): HTMLElement | null => {
    const found = (event.target as HTMLElement | null)?.closest?.<HTMLElement>(selector);
    return found && shell.contains(found) ? found : null;
  };
  const click = (event: MouseEvent): void => {
    const cell = closest(event, "[data-x][data-y]");
    if (cell && board.contains(cell)) {
      opts.onAction({ type: "clickCell", x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
      return;
    }
    const button = closest(event, "button");
    if (!button || (button as HTMLButtonElement).disabled) return;
    if (button === helpToggle) opts.onAction({ type: "toggleHelp" });
    else if (button.dataset.cmd) {
      const command = current?.commands.find(c => c.id === button.dataset.cmd);
      if (command?.enabled) opts.onAction(command.action);
    } else {
      const action = scrollActions.get(button.dataset.ui ?? "");
      if (action) opts.onAction(action);
    }
  };
  const hover = (event: MouseEvent): void => {
    const cell = closest(event, "[data-x][data-y]");
    if (!cell || !board.contains(cell) || (event.relatedTarget && cell.contains(event.relatedTarget as Node))) return;
    opts.onAction({ type: "hoverCell", x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
  };
  const wheel = (event: WheelEvent): void => {
    // SPEC-GAP：notch 沒有跨裝置單位；每個非零 wheel 事件依方向捲 3 格。
    const horizontal = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = horizontal ? (event.shiftKey ? event.deltaY || event.deltaX : event.deltaX) : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    opts.onAction({ type: "scroll", dx: horizontal ? Math.sign(delta) * 3 : 0, dy: horizontal ? 0 : Math.sign(delta) * 3 });
  };
  const keydown = (event: KeyboardEvent): void => {
    const active = doc.activeElement;
    const target = event.target as HTMLElement | null;
    if (active?.matches("input, textarea") || target?.matches?.("input, textarea")) return;
    if (opts.onKey({ key: event.key, ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey })) event.preventDefault();
  };
  let lastSize = "";
  const measure = (): void => {
    if (destroyed) return;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    if (width <= 0 || height <= 0) return;
    const w = Math.max(8, Math.min(60, Math.floor(width / cellSize)));
    const h = Math.max(8, Math.min(60, Math.floor(height / cellSize)));
    const size = `${w},${h}`;
    if (size === lastSize) return;
    lastSize = size;
    opts.onAction({ type: "resize", w, h });
  };
  shell.addEventListener("click", click);
  board.addEventListener("mouseover", hover);
  board.addEventListener("wheel", wheel, { passive: false });
  doc.addEventListener("keydown", keydown);
  const Observer = doc.defaultView?.ResizeObserver;
  const observer = Observer ? new Observer(measure) : null;
  observer?.observe(viewport);
  measure();
  return {
    render(s) {
      if (destroyed) return;
      current = s;
      title.textContent = s.title;
      round.textContent = `第 ${s.round} 輪${s.maxRounds === null ? "" : ` / ${s.maxRounds}`}`;
      // SPEC-GAP：快照無獨立行動者名稱；優先查可視格／選取單位，否則顯示 id。
      const activeName = s.cells.find(c => c.unit?.id === s.activeUnit)?.unit?.name
        ?? (s.selected?.id === s.activeUnit ? s.selected?.name : null) ?? s.activeUnit;
      turn.textContent = activeName ? `${s.playerTurn ? "我方" : "其他陣營"}行動：${activeName}` : "等待行動";
      position.textContent = `${s.viewport.x},${s.viewport.y}`;
      helpToggle.setAttribute("aria-expanded", String(s.showHelp));
      paintBoard(s);
      paintPanels(s);
      tooltip.refresh();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      doc.removeEventListener("keydown", keydown);
      shell.removeEventListener("click", click);
      board.removeEventListener("mouseover", hover);
      board.removeEventListener("wheel", wheel);
      tooltip.destroy();
      shell.remove();
      current = null;
    },
  };
}
