/** 只管理可視格與 dirty 更新；資料來源與每格外觀由各畫面提供。 */
export type GridCell = { classes: string[]; glyph?: string; badge?: string; highlight?: string; age?: number };
export type GridSource<T extends GridCell = GridCell> = {
  size: { w: number; h: number };
  viewport: { x: number; y: number; w: number; h: number };
  cell(x: number, y: number): T;
  dirty(): Set<string> | "all";
};

export function createGridView<T extends GridCell>(root: HTMLElement,
  paint: (node: HTMLDivElement, cell: T) => void = (node, cell) => {
    node.className = cell.classes.join(" ");
    node.textContent = cell.badge ?? cell.glyph ?? "";
    if (cell.highlight) node.classList.add(`highlight-${cell.highlight}`);
    if (cell.age !== undefined) node.dataset.age = String(cell.age);
    else delete node.dataset.age;
  }): (source: GridSource<T>) => void {
  let nodes: HTMLDivElement[] = [], previous = "";
  return source => {
    const v = source.viewport, key = `${v.x},${v.y},${v.w},${v.h}`;
    const moved = key !== previous;
    if (nodes.length !== v.w * v.h) {
      nodes = Array.from({ length: v.w * v.h }, () => root.ownerDocument.createElement("div"));
      root.replaceChildren(...nodes);
    }
    root.style.gridTemplateColumns = `repeat(${v.w}, var(--cell-size))`;
    root.style.gridTemplateRows = `repeat(${v.h}, var(--cell-size))`;
    const dirty = source.dirty();
    for (let i = 0; i < nodes.length; i++) {
      const x = v.x + i % v.w, y = v.y + Math.floor(i / v.w);
      if (!moved && dirty !== "all" && !dirty.has(`${x},${y}`)) continue;
      const node = nodes[i]!;
      node.dataset.x = String(x); node.dataset.y = String(y);
      paint(node, source.cell(x, y));
    }
    previous = key;
  };
}
