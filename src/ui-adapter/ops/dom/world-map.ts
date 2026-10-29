// DOM 只消費世界 vm 快照；操作一律交回 controller。
import type { OpsUiAction, WorldView, WorldGridSnapshot, WorldCellView, WorldLayer } from "../vm/types.ts";
import { createGridView } from "../../dom/grid-view.ts";
import { buttonRow, el, registeredAction, type ActionRegistry } from "./ui.ts";
export type WorldMap = { render(view: WorldView): void; destroy(): void };
const layerNames: Record<WorldLayer, string> = { terrain: "地形", blight: "蝕域", places: "地點", actors: "行動者", path: "路徑", region: "區域", fog: "迷霧", sight: "視野", territory: "地盤" };

/** object-fit:contain 的實際圖面；留白不可當成世界座標的一部分。 */
export function worldMapContentRect(box: { x: number; y: number; width: number; height: number }, size: { w: number; h: number }) {
  const scale = Math.min(box.width / size.w, box.height / size.h), width = size.w * scale, height = size.h * scale;
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

export function mountWorldMap(root: HTMLElement, opts: { onAction(a: OpsUiAction): void }): WorldMap {
  const doc = root.ownerDocument, registry: ActionRegistry = new WeakMap();
  const shell = el(doc, "div", "", "world-wrap"), col = el(doc, "div", "", "world-map-col");
  const tools = el(doc, "div", "", "world-tools"), title = el(doc, "b");
  const scroller = el(doc, "div", "", "world-scroll"), board = el(doc, "div", "", "world-grid");
  const labels = el(doc, "div", "", "world-region-labels");
  labels.dataset.ui = "world-region-labels"; labels.setAttribute("aria-label", "世界區域名稱");
  board.dataset.ui = "world-map"; board.setAttribute("role", "grid"); board.setAttribute("aria-label", "世界方格地圖");
  const overview = el(doc, "canvas", "", "world-overview"); overview.dataset.ui = "world-overview";
  overview.setAttribute("aria-label", "世界全圖，點擊跳轉"); overview.hidden = true;
  const miniWrap = el(doc, "div", "", "world-minimap"), mini = el(doc, "canvas");
  mini.dataset.ui = "world-minimap"; mini.setAttribute("aria-label", "縮圖，點擊跳轉");
  const miniBox = el(doc, "div", "", "world-mini-viewport"); miniWrap.append(mini, miniBox);
  const detail = el(doc, "section", "", "world-detail"); detail.dataset.ui = "world-detail";
  const actionCol = el(doc, "div", "", "world-actions"), menus = el(doc, "div", "", "world-menus"), info = el(doc, "div");
  detail.append(actionCol, menus, info);
  let current: WorldGridSnapshot | undefined, previous = new Map<string, string>(), lastMap = "", measuring = false;
  const addTool = (id: string, text: string, action: OpsUiAction) => {
    const b = el(doc, "button", text); b.type = "button"; b.dataset.ui = id; registry.set(b, action); return b;
  };
  tools.append(title, addTool("world-zoom-in", "放大 +", { type: "mapZoom", dir: 1 }),
    addTool("world-zoom-out", "縮小 −", { type: "mapZoom", dir: -1 }), addTool("world-zoom-fit", "原比例 0", { type: "mapZoom", dir: 0 }),
    addTool("world-mini-toggle", "縮圖 M", { type: "mapMinimap" }));
  scroller.append(board, overview, labels, miniWrap); col.append(tools, scroller); shell.append(col, detail); root.append(shell);
  const draw = createGridView<WorldCellView>(board, (node, cell) => {
    node.className = cell.classes.join(" "); node.style.backgroundColor = cell.color;
    node.dataset.tip = node.title = cell.title; node.setAttribute("aria-label", cell.title); node.dataset.age = String(cell.age);
    if (cell.place) node.dataset.node = cell.place; else delete node.dataset.node;
    // 地形以顏色呈現；普通格不鋪重複文字，地點／船／行動者保留定位圖示。
    node.replaceChildren(...(cell.badge ? [el(doc, "span", cell.badge, "world-badge")] : []));
  });
  const paintLabels = (g: WorldGridSnapshot): void => {
    const overviewMode = g.zoom === .25;
    const box = overview.getBoundingClientRect(), host = scroller.getBoundingClientRect();
    const content = worldMapContentRect(box, g.size);
    const width = overviewMode ? content.width : g.viewport.w * 24 * g.zoom;
    const height = overviewMode ? content.height : g.viewport.h * 24 * g.zoom;
    const left = overviewMode ? content.x - host.x - scroller.clientLeft : 0;
    const top = overviewMode ? content.y - host.y - scroller.clientTop : 0;
    const area = overviewMode ? { x: 0, y: 0, w: g.size.w, h: g.size.h } : g.viewport;
    labels.replaceChildren(...(g.regionLabels ?? []).filter(label => label.at.x >= area.x && label.at.x < area.x + area.w
      && label.at.y >= area.y && label.at.y < area.y + area.h).map(label => {
      const node = el(doc, "span", label.name, "world-region-label");
      node.dataset.regionLabel = label.id; node.dataset.x = String(label.at.x); node.dataset.y = String(label.at.y);
      node.style.left = `${left + (label.at.x - area.x + .5) / area.w * width}px`;
      node.style.top = `${top + (label.at.y - area.y + .5) / area.h * height}px`;
      return node;
    }));
  };
  const paintCanvas = (canvas: HTMLCanvasElement, g: WorldGridSnapshot, large = false) => {
    const m = g.minimap; canvas.width = large ? g.size.w : m.w; canvas.height = large ? g.size.h : m.h;
    const context = canvas.getContext("2d");
    if (context) for (let i = 0; i < m.colors.length; i++) { context.fillStyle = m.colors[i]!; context.fillRect(i % m.w * canvas.width / m.w, Math.floor(i / m.w) * canvas.height / m.h, canvas.width / m.w, canvas.height / m.h); }
    if (large) { canvas.style.width = `${g.size.w * 3}px`; canvas.style.height = `${g.size.h * 3}px`; }
  };
  const measure = () => {
    if (!current || measuring || shell.closest("[hidden]") || current.zoom === .25) return;
    const width = scroller.clientWidth, height = scroller.clientHeight; if (!width || !height) return;
    const cell = 24 * current.zoom, w = Math.max(1, Math.min(current.size.w, Math.floor(width / cell))), h = Math.max(1, Math.min(current.size.h, Math.floor(height / cell)));
    if (w === current.viewport.w && h === current.viewport.h) return;
    measuring = true; try { opts.onAction({ type: "mapResize", w, h }); } finally { measuring = false; }
  };
  const cellHit = (event: MouseEvent) => {
    const node = (event.target as Element | null)?.closest<HTMLElement>(".world-cell");
    return node && board.contains(node) ? { x: Number(node.dataset.x), y: Number(node.dataset.y) } : null;
  };
  const jump = (event: MouseEvent, canvas: HTMLCanvasElement) => {
    if (!current) return;
    const box = canvas.getBoundingClientRect();
    const r = canvas === overview ? worldMapContentRect(box, current.size) : { x: box.x, y: box.y, width: box.width, height: box.height };
    if (!r.width || !r.height || event.clientX < r.x || event.clientX >= r.x + r.width || event.clientY < r.y || event.clientY >= r.y + r.height) return;
    const x = Math.min(current.size.w - 1, Math.max(0, Math.floor((event.clientX - r.x) / r.width * current.size.w)));
    const y = Math.min(current.size.h - 1, Math.max(0, Math.floor((event.clientY - r.y) / r.height * current.size.h)));
    if (canvas === overview) opts.onAction({ type: "mapZoom", dir: 1 });
    opts.onAction({ type: "mapViewport", x, y });
  };
  const click = (e: MouseEvent) => {
    if (e.target === mini) { jump(e, mini); return; } if (e.target === overview) { jump(e, overview); return; }
    const cell = cellHit(e); if (cell) { opts.onAction({ type: "mapCursor", ...cell }); return; }
    const hit = registeredAction(registry, e.target, shell); if (hit) opts.onAction(hit.action);
  };
  const double = (e: MouseEvent) => {
    const cell = cellHit(e); if (!cell || !current) return;
    opts.onAction({ type: "mapCursor", ...cell });
    const sail = current.actions.find(a => a.id === "map:sail"); if (sail?.enabled) opts.onAction(sail.action);
  };
  const hover = (e: MouseEvent) => {
    const cell = cellHit(e); if (!cell || !current) return;
    if (cell.x !== current.hover.at.x || cell.y !== current.hover.at.y) opts.onAction({ type: "mapHover", ...cell });
  };
  const wheel = (e: WheelEvent) => { if (e.deltaY) { e.preventDefault(); opts.onAction({ type: "mapZoom", dir: e.deltaY < 0 ? 1 : -1 }); } };
  shell.addEventListener("click", click); board.addEventListener("dblclick", double); board.addEventListener("mouseover", hover);
  scroller.addEventListener("wheel", wheel, { passive: false });
  const Observer = doc.defaultView?.ResizeObserver, observer = Observer ? new Observer(() => { measure(); if (current) paintLabels(current); }) : null; observer?.observe(scroller);
  return {
    render(view) {
      current = view.grid; const g = current;
      if (!g) {
        info.replaceChildren(el(doc, "h2", view.selected?.name ?? "地點"), ...(view.selected?.lines ?? []).map(l => el(doc, "p", l)));
        if (view.selected) actionCol.replaceChildren(buttonRow(doc, view.selected.buttons, registry)); return;
      }
      title.textContent = `${g.name} · ${g.cursor.x},${g.cursor.y} · ${g.zoom === 1 ? "1" : g.zoom === .5 ? "½" : "¼"}`;
      board.style.setProperty("--cell-size", `${24 * g.zoom}px`); board.dataset.zoom = String(g.zoom);
      board.dataset.viewport = `${g.viewport.x},${g.viewport.y},${g.viewport.w},${g.viewport.h}`;
      board.hidden = g.zoom === .25; overview.hidden = g.zoom !== .25;
      const dirty = new Set<string>(), next = new Map<string, string>();
      for (const c of g.cells) { const k = `${c.x},${c.y}`, signature = JSON.stringify(c); next.set(k, signature); if (previous.get(k) !== signature) dirty.add(k); }
      if (g.zoom !== .25) draw({ size: g.size, viewport: g.viewport, cell: (x, y) => g.cells[(y - g.viewport.y) * g.viewport.w + x - g.viewport.x]!, dirty: () => lastMap !== g.map ? "all" : dirty });
      else paintCanvas(overview, g, true);
      paintLabels(g);
      previous = g.zoom === .25 ? new Map() : next; lastMap = g.zoom === .25 ? "" : g.map;
      miniWrap.hidden = !g.showMinimap; if (g.showMinimap) paintCanvas(mini, g); miniWrap.style.aspectRatio = `${g.size.w} / ${g.size.h}`;
      miniBox.style.left = `${g.viewport.x / g.size.w * 100}%`; miniBox.style.top = `${g.viewport.y / g.size.h * 100}%`;
      miniBox.style.width = `${g.viewport.w / g.size.w * 100}%`; miniBox.style.height = `${g.viewport.h / g.size.h * 100}%`;
      actionCol.replaceChildren(buttonRow(doc, g.actions, registry)); menus.replaceChildren();
      if (g.layerMenu) for (const [layer, name] of Object.entries(layerNames)) {
        const b = addTool(`layer-${layer}`, `${g.layers[layer as WorldLayer] ? "☑" : "☐"} ${name}`, { type: "mapLayer", layer: layer as WorldLayer });
        b.setAttribute("aria-pressed", String(g.layers[layer as WorldLayer])); menus.append(b);
      }
      if (g.mapMenu) for (const m of g.maps) menus.append(addTool(`map-${m.id}`, m.name, { type: "mapSwitch", map: m.id }));
      info.replaceChildren(el(doc, "h2", "游標／航程"), ...g.hover.lines.map(l => el(doc, "p", l)), el(doc, "p", g.preview.reachable ? `航程 ${g.preview.days} 天／燃料 ${g.preview.fuel}` : g.preview.note));
      const hovered = board.querySelector<HTMLElement>(`[data-x="${g.hover.at.x}"][data-y="${g.hover.at.y}"]`);
      if (hovered) hovered.dataset.tip = hovered.title = g.hover.lines.join("\n"); measure();
    },
    destroy() { observer?.disconnect(); shell.removeEventListener("click", click); board.removeEventListener("dblclick", double); board.removeEventListener("mouseover", hover); scroller.removeEventListener("wheel", wheel); shell.remove(); },
  };
}
