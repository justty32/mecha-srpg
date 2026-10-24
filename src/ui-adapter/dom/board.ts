import type { CellView, UiSnapshot } from "../vm/types.ts";

function paintCell(node: HTMLDivElement, cell: CellView): void {
  const doc = node.ownerDocument;
  node.dataset.x = String(cell.x);
  node.dataset.y = String(cell.y);
  node.className = ["battle-cell", cell.highlight && `highlight-${cell.highlight}`,
    cell.cursor && "cursor", cell.selected && "selected", cell.intent && "intent"].filter(Boolean).join(" ");
  node.style.backgroundColor = cell.terrain.color;
  node.title = `${cell.terrain.name}${cell.unit ? ` · ${cell.unit.name}` : ""}`;
  node.dataset.tip = node.title;
  node.setAttribute("aria-label", `${cell.x},${cell.y} ${node.title}`);
  const glyph = doc.createElement("span");
  glyph.className = "terrain-glyph";
  glyph.textContent = cell.terrain.glyph;
  node.replaceChildren(glyph);
  if (cell.unit) {
    const badge = doc.createElement("span");
    badge.className = `unit-badge side-${cell.unit.side}${cell.unit.active ? " active" : ""} status-${cell.unit.status}`;
    badge.textContent = cell.unit.label;
    const hp = doc.createElement("span");
    hp.className = "cell-hp";
    const fill = doc.createElement("span");
    fill.style.width = `${Math.max(0, Math.min(1, cell.unit.hpRatio)) * 100}%`;
    hp.append(fill);
    node.append(badge, hp);
  }
}

export function createBoard(board: HTMLElement, cellSize: number): (s: UiSnapshot) => void {
  let width = 0;
  let height = 0;
  let nodes: HTMLDivElement[] = [];
  board.style.setProperty("--cell-size", `${cellSize}px`);
  return (s) => {
    const rebuild = width !== s.viewport.w || height !== s.viewport.h;
    if (rebuild) {
      width = s.viewport.w;
      height = s.viewport.h;
      nodes = Array.from({ length: width * height }, () => board.ownerDocument.createElement("div"));
      board.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
      board.style.gridTemplateRows = `repeat(${height}, var(--cell-size))`;
      board.replaceChildren(...nodes);
    }
    const dirty = s.dirty === "all" ? null : new Set(s.dirty);
    for (let i = 0; i < nodes.length; i++) {
      const cell = s.cells[i]!;
      if (rebuild || dirty === null || dirty.has(`${cell.x},${cell.y}`)) paintCell(nodes[i]!, cell);
    }
  };
}
