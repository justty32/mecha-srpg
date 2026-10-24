import type { AnimMode, Fx, UiSnapshot } from "../vm/types.ts";

let serial = 0;

export function createFx(layer: HTMLElement): {
  render(s: UiSnapshot, size: number, anim: AnimMode): void;
  clear(): void;
  busyMs(): number;
} {
  const doc = layer.ownerDocument, host = doc.defaultView;
  const prefix = `battle-fx-${++serial}`;
  const active = new Map<number, { item: Fx; node: HTMLElement | SVGSVGElement; timer: number; until: number }>();
  let epoch: number | null = null, lastId = -1;
  const now = (): number => host?.performance.now() ?? 0;
  const clear = (): void => {
    for (const entry of active.values()) host?.clearTimeout(entry.timer);
    active.clear();
    layer.replaceChildren();
  };
  const svgNode = <K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] =>
    doc.createElementNS("http://www.w3.org/2000/svg", tag);
  const position = (item: Fx, node: HTMLElement | SVGSVGElement, s: UiSnapshot, size: number): boolean => {
    const v = s.viewport;
    const visible = (c: { x: number; y: number }): boolean => c.x >= v.x && c.x < v.x + v.w && c.y >= v.y && c.y < v.y + v.h;
    const point = (c: { x: number; y: number }): string => `${c.x - v.x + .5},${c.y - v.y + .5}`;
    if (item.kind === "float") {
      node.style.left = `${(item.at.x - v.x + .5) * size}px`;
      node.style.top = `${(item.at.y - v.y + .5) * size}px`;
      return visible(item.at);
    }
    node.setAttribute("viewBox", `0 0 ${v.w} ${v.h}`);
    node.replaceChildren();
    const path = svgNode("path");
    if (item.kind === "path") {
      let connected = false, segments = 0;
      const parts: string[] = [];
      for (const cell of item.cells) {
        if (!visible(cell)) { connected = false; continue; }
        parts.push(`${connected ? "L" : "M"}${point(cell)}`);
        if (connected) segments++;
        connected = true;
      }
      if (!segments) return false;
      path.setAttribute("d", parts.join(" "));
      const marker = svgNode("marker"), arrow = svgNode("path"), defs = svgNode("defs");
      marker.id = `${prefix}-${item.id}`;
      marker.setAttribute("viewBox", "0 0 10 10");
      marker.setAttribute("refX", "9"); marker.setAttribute("refY", "5");
      marker.setAttribute("markerWidth", "5"); marker.setAttribute("markerHeight", "5");
      marker.setAttribute("orient", "auto");
      arrow.setAttribute("d", "M0 0 L10 5 L0 10 Z");
      arrow.setAttribute("fill", "currentColor");
      marker.append(arrow); defs.append(marker); node.append(defs);
      path.setAttribute("marker-end", `url(#${marker.id})`);
    } else {
      if (!visible(item.from) || !visible(item.to)) return false;
      path.setAttribute("d", `M${point(item.from)} L${point(item.to)}`);
      if (item.hit) {
        const flash = svgNode("rect");
        flash.setAttribute("x", String(item.to.x - v.x)); flash.setAttribute("y", String(item.to.y - v.y));
        flash.setAttribute("width", "1"); flash.setAttribute("height", "1");
        flash.setAttribute("class", "fx-hit");
        node.append(flash);
      }
    }
    path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", ".08");
    node.append(path);
    return true;
  };
  return {
    clear,
    busyMs: () => Math.max(0, ...Array.from(active.values(), e => e.until - now())),
    render(s, size, anim) {
      if (epoch !== s.fx.epoch) { clear(); epoch = s.fx.epoch; lastId = -1; }
      const mode = anim === "on" && host?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "fast" : anim;
      const allowed = (item: Fx): boolean => mode !== "off" || item.kind === "path" || (item.kind === "float" && (item.tone === "damage" || item.tone === "miss"));
      for (const [id, entry] of active) {
        if (!allowed(entry.item)) {
          host?.clearTimeout(entry.timer); entry.node.remove(); active.delete(id);
        } else entry.node.style.display = position(entry.item, entry.node, s, size) ? "" : "none";
      }
      for (const item of s.fx.items) {
        if (item.id <= lastId) continue;
        lastId = item.id;
        if (!host || !allowed(item)) continue;
        const node = item.kind === "float" ? doc.createElement("span") : svgNode("svg");
        node.dataset.fxId = String(item.id);
        node.dataset.fxKind = item.kind;
        node.setAttribute("class", `fx-item fx-${item.kind}${item.kind === "float" ? ` tone-${item.tone}` : ""}`);
        node.setAttribute("aria-hidden", "true");
        if (item.kind === "float") node.textContent = item.text;
        if (!position(item, node, s, size)) continue;
        const delay = item.group * (mode === "on" ? 350 : mode === "fast" ? 120 : 0);
        const duration = (item.kind === "float" ? 900 : 500) * (mode === "fast" ? .5 : 1);
        node.style.animationDelay = `${delay}ms`;
        node.style.animationDuration = `${duration}ms`;
        layer.append(node);
        const timer = host.setTimeout(() => { node.remove(); active.delete(item.id); }, delay + duration);
        active.set(item.id, { item, node, timer, until: now() + delay + duration });
      }
    },
  };
}
