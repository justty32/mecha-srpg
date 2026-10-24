// ui-adapter/ops/dom/world-map — 營運世界圖（可替換模組）。
// 對外只有 mountWorldMap(root, { onAction }) → { render(view), destroy() }；render.ts 只經這個介面使用。
// 營運大地圖之後會改成方格自由移動（使用者 2026-10-24 裁示），屆時整檔換掉；這版只做簡單 SVG 圓＋標籤。
// 對齊 specs/ops/world-grid/ui-contract.md：方格版將是共用 GridView（吃 GridSource）＋ vm 的 WorldViewModel；
// 本檔與 vm/layout.ts 是唯二要換的檔，其餘分頁、按鈕、快捷鍵（keymap-ops 將加 context "map"）不受影響。
// 預設「貼合寬度」（viewBox 收緊到地點範圍）；縮放步進重用戰鬥畫面的 zoomStep（以「格大小」32 為 1 倍）。
import type { OpsUiAction, WorldView } from "../vm/types.ts";
import { zoomStep } from "../../dom/zoom.ts";
import { buttonRow, changeCache, el, registeredAction, type ActionRegistry } from "./ui.ts";

export type WorldMap = { render(view: WorldView): void; destroy(): void };

const SVG = "http://www.w3.org/2000/svg";
const W = 1000, H = 640, PAD = 40, BASE = 32;

/** 勢力 → 決定性色相（DOM 不認得勢力 id，雜湊即可）。 */
function ownerColor(owner: string | null): string {
  if (!owner) return "#626c7b";
  let h = 0;
  for (const ch of owner) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `hsl(${h % 360} 45% 42%)`;
}

export function mountWorldMap(root: HTMLElement, opts: { onAction(a: OpsUiAction): void }): WorldMap {
  const doc = root.ownerDocument;
  const registry: ActionRegistry = new WeakMap();
  const changed = changeCache();
  let scale: number | "fit" = "fit";
  let box = { x: 0, y: 0, w: W, h: H };
  const shell = el(doc, "div", "", "world-wrap");
  const tools = el(doc, "div", "", "world-tools");
  const zoomButtons = ([["world-zoom-in", "放大", 1], ["world-zoom-out", "縮小", -1], ["world-zoom-fit", "貼合", 0]] as const).map(([ui, label, dir]) => {
    const b = el(doc, "button", label);
    b.type = "button";
    b.dataset.ui = ui;
    b.dataset.tip = `世界圖${label}`;
    b.addEventListener("click", () => {
      const now = scale === "fit" ? (svg.getBoundingClientRect().width || box.w) / box.w : scale;
      scale = dir === 0 ? "fit" : zoomStep(now * BASE, dir) / BASE;
      applyZoom();
    });
    return b;
  });
  tools.append(...zoomButtons);
  const scroller = el(doc, "div", "", "world-scroll");
  const svg = doc.createElementNS(SVG, "svg");
  svg.dataset.ui = "world-map";
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "世界圖");
  scroller.append(svg);
  const legend = el(doc, "div", "", "world-legend");
  for (const [cls, text] of [["here", "所在地"], ["dest", "目的地"], ["blight", "蝕域"], ["rift", "裂縫"]]) {
    legend.append(el(doc, "span", text, `legend-${cls}`));
  }
  const detail = el(doc, "section", "", "world-detail");
  detail.dataset.ui = "world-detail";
  const mapCol = el(doc, "div", "", "world-map-col");
  mapCol.append(tools, scroller, legend);
  shell.append(mapCol, detail);
  root.append(shell);
  const applyZoom = (): void => {
    svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);
    svg.style.width = scale === "fit" ? "100%" : `${Math.round(box.w * scale)}px`;
    svg.style.height = scale === "fit" ? "auto" : `${Math.round(box.h * scale)}px`;
  };
  applyZoom();
  const px = (x: number): number => PAD + x * (W - 2 * PAD);
  const py = (y: number): number => PAD + y * (H - 2 * PAD);
  const svgEl = (tag: string, attrs: Record<string, string | number>, cls = ""): SVGElement => {
    const node = doc.createElementNS(SVG, tag) as SVGElement;
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    if (cls) node.setAttribute("class", cls);
    return node;
  };
  const paintMap = (view: WorldView): void => {
    const pos = new Map(view.nodes.map(n => [n.id, { x: px(n.x), y: py(n.y) }]));
    const parts: SVGElement[] = [];
    for (const n of view.nodes) {
      const p = pos.get(n.id)!;
      const g = svgEl("g", {}, ["world-node", `body-${n.body}`, n.here && "here", n.destination && "destination", n.selected && "selected"].filter(Boolean).join(" "));
      if (n.blight) g.append(svgEl("circle", { cx: p.x, cy: p.y, r: 22 }, `world-blight depth-${n.blight.depth}`));
      if (n.here) g.append(svgEl("circle", { cx: p.x, cy: p.y, r: 18 }, "world-here-ring"));
      if (n.destination) g.append(svgEl("circle", { cx: p.x, cy: p.y, r: 18 }, "world-dest-ring"));
      const dot = svgEl("circle", { cx: p.x, cy: p.y, r: 12, fill: ownerColor(n.owner) }, "world-dot");
      dot.dataset.node = n.id;
      const title = svgEl("title", {});
      title.textContent = [n.name, n.kindName, n.ownerName ?? "無主", n.blight ? `蝕域：${n.blight.depthName}` : "",
        n.rift ? `裂縫：${n.rift.phaseName}（${n.rift.width}）` : "", n.contracts ? `契約 ${n.contracts} 件` : ""].filter(Boolean).join("・");
      dot.append(title);
      g.append(dot);
      if (n.rift) {
        const mark = svgEl("text", { x: p.x + 10, y: p.y - 10 }, "world-rift");
        mark.textContent = "◆";
        mark.dataset.nodeLabel = n.id;
        g.append(mark);
      }
      if (n.contracts) {
        const badge = svgEl("text", { x: p.x - 18, y: p.y - 10 }, "world-contracts");
        badge.textContent = String(n.contracts);
        badge.dataset.nodeLabel = n.id;
        g.append(badge);
      }
      const label = svgEl("text", { x: p.x, y: p.y + 28 }, "world-label");
      label.textContent = n.here ? `▲ ${n.name}` : n.name;
      label.dataset.nodeLabel = n.id;
      g.append(label);
      parts.push(g);
    }
    svg.replaceChildren(...parts);
    const xs = [...pos.values()].map(p => p.x), ys = [...pos.values()].map(p => p.y);
    box = xs.length ? { x: Math.min(...xs) - 70, y: Math.min(...ys) - 45, w: Math.max(...xs) - Math.min(...xs) + 140, h: Math.max(...ys) - Math.min(...ys) + 95 }
      : { x: 0, y: 0, w: W, h: H };
    applyZoom();
  };
  const paintDetail = (view: WorldView): void => {
    const s = view.selected;
    if (!s) { detail.replaceChildren(el(doc, "h2", "地點"), el(doc, "p", "點地圖上的地點查看詳情。", "muted")); return; }
    detail.replaceChildren(el(doc, "h2", s.name), ...s.lines.map(line => el(doc, "p", line)), buttonRow(doc, s.buttons, registry));
  };
  const click = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    const node = target?.closest?.("[data-node], [data-node-label]") as SVGElement | null;
    if (node && svg.contains(node)) {
      opts.onAction({ type: "selectNode", node: node.dataset.node ?? node.dataset.nodeLabel! });
      return;
    }
    const hit = registeredAction(registry, target, shell);
    if (hit) opts.onAction(hit.action);
  };
  shell.addEventListener("click", click);
  return {
    render(view) {
      if (changed("map", { nodes: view.nodes, routes: view.routes })) paintMap(view);
      if (changed("detail", view.selected)) paintDetail(view);
    },
    destroy() {
      shell.removeEventListener("click", click);
      shell.remove();
    },
  };
}
