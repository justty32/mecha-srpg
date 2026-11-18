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
  let nodes = new Map<string, HTMLDivElement>();
  return source => {
    const v = source.viewport, dirty = source.dirty();
    const recycled: HTMLDivElement[] = [];
    let recycledIndex = 0;
    // 保留重疊世界座標的節點及順序；只有離開可視區的格才按當下 DOM 順序拆下回收。
    for (const node of Array.from(root.children) as HTMLDivElement[]) {
      const key = `${node.dataset.x},${node.dataset.y}`;
      const x = Number(node.dataset.x), y = Number(node.dataset.y);
      if (x >= v.x && x < v.x + v.w && y >= v.y && y < v.y + v.h) continue;
      node.remove(); nodes.delete(key); recycled.push(node);
    }
    const columns = `repeat(${v.w}, var(--cell-size))`, rows = `repeat(${v.h}, var(--cell-size))`;
    if (root.style.gridTemplateColumns !== columns) root.style.gridTemplateColumns = columns;
    if (root.style.gridTemplateRows !== rows) root.style.gridTemplateRows = rows;
    let cursor = root.firstChild;
    for (let y = v.y; y < v.y + v.h; y++) for (let x = v.x; x < v.x + v.w; x++) {
      const key = `${x},${y}`;
      let node = nodes.get(key);
      const entered = !node;
      if (!node) {
        node = recycled[recycledIndex++] ?? root.ownerDocument.createElement("div");
        node.dataset.x = String(x); node.dataset.y = String(y);
        nodes.set(key, node);
        root.insertBefore(node, cursor);
      } else cursor = node.nextSibling;
      if (entered || dirty === "all" || dirty.has(key)) paint(node, source.cell(x, y));
    }
  };
}
