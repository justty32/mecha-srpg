import type { CellView, UiSnapshot } from "../vm/types.ts";
import { createGridView } from "./grid-view.ts";

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
    badge.className = `unit-badge side-${cell.unit.side}${cell.unit.active ? " active" : ""}${cell.unit.stale ? " stale" : ""} status-${cell.unit.status}`;
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
  const draw = createGridView<CellView & { classes: string[] }>(board, paintCell);
  board.style.setProperty("--cell-size", `${cellSize}px`);
  return s => draw({ size: { w: s.map.width, h: s.map.height }, viewport: s.viewport,
    cell: (x, y) => ({ ...s.cells[(y - s.viewport.y) * s.viewport.w + x - s.viewport.x]!, classes: [] }),
    dirty: () => s.dirty === "all" ? "all" : new Set(s.dirty) });
}
