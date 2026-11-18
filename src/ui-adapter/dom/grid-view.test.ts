import { test } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { createGridView, type GridSource } from "./grid-view.ts";

test("18×21 真平移只搬動與重畫進出邊界，保留重疊格及委派事件", t => {
  const win = new Window(), root = win.document.createElement("div");
  t.after(() => win.close());
  const painted: string[] = [];
  const draw = createGridView(root as unknown as HTMLElement, (node, cell) => {
    painted.push(`${node.dataset.x},${node.dataset.y}`);
    node.className = cell.classes.join(" "); node.textContent = cell.glyph!;
  });
  const source: GridSource = { size: { w: 250, h: 150 }, viewport: { x: 5, y: 5, w: 18, h: 21 },
    cell: (x, y) => ({ classes: ["cell"], glyph: `${x},${y}` }), dirty: () => new Set() };
  draw(source);
  const observer = new win.MutationObserver(() => {});
  observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
  for (const [dx, dy, edge] of [[1, 0, 21], [-1, 0, 21], [0, 1, 18], [0, -1, 18]] as const) {
    const overlap = root.querySelector('[data-x="10"][data-y="10"]');
    painted.length = 0; observer.takeRecords();
    source.viewport = { ...source.viewport, x: source.viewport.x + dx, y: source.viewport.y + dy };
    draw(source);
    assert.equal(painted.length, edge);
    const records = observer.takeRecords();
    assert.equal(records.filter(record => record.target === root && record.type === "childList").length, edge * 2);
    assert.ok(records.length <= edge * 8, `平移 mutation 過量：${records.length}`);
    assert.equal(root.querySelector('[data-x="10"][data-y="10"]'), overlap);
    assert.deepEqual(Array.from(root.children, node => node.textContent), Array.from({ length: 18 * 21 }, (_, i) =>
      `${source.viewport.x + i % 18},${source.viewport.y + Math.floor(i / 18)}`));
  }
  let hit = "";
  root.addEventListener("click", event => { hit = (event.target as unknown as HTMLElement).dataset.x!; });
  root.firstElementChild!.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.equal(hit, String(source.viewport.x));
  observer.disconnect();
});

test("dirty 格、全圖內容切換、大跳轉與可視區尺寸變化均正確重畫", t => {
  const win = new Window(), root = win.document.createElement("div");
  t.after(() => win.close());
  const draw = createGridView(root as unknown as HTMLElement);
  let revision = "old", dirty: Set<string> | "all" = new Set();
  const source: GridSource = { size: { w: 250, h: 150 }, viewport: { x: 0, y: 0, w: 3, h: 2 },
    cell: () => ({ classes: [revision], glyph: revision, age: revision === "old" ? 4 : undefined }), dirty: () => dirty };
  draw(source);
  const retained = root.children[1];
  revision = "cursor-fog-badge"; dirty = new Set(["1,0"]); draw(source);
  assert.equal(root.children[1], retained);
  assert.equal(retained!.className, revision);
  assert.equal(retained!.getAttribute("data-age"), null);
  assert.equal(root.children[0]!.textContent, "old");
  dirty = "all"; revision = "other-map"; draw(source);
  assert.ok(Array.from(root.children).every(node => node.textContent === revision));
  // 先平移讓 Map 插入順序與畫面 row-major 順序不同，再驗不相交跳轉的舊身份契約。
  dirty = new Set(); source.viewport = { x: 1, y: 0, w: 3, h: 2 }; draw(source);
  const beforeJump = Array.from(root.children);
  source.viewport = { x: 100, y: 80, w: 3, h: 2 }; draw(source);
  Array.from(root.children).forEach((node, i) => assert.equal(node, beforeJump[i]));
  assert.equal(root.firstElementChild!.getAttribute("data-x"), "100");
  source.viewport = { x: 100, y: 80, w: 2, h: 3 }; draw(source);
  assert.equal(root.children.length, 6);
  assert.deepEqual(Array.from(root.children, node => [node.getAttribute("data-x"), node.getAttribute("data-y")]),
    [["100", "80"], ["101", "80"], ["100", "81"], ["101", "81"], ["100", "82"], ["101", "82"]]);
  source.viewport = { x: 101, y: 81, w: 4, h: 1 }; draw(source);
  assert.equal(root.children.length, 4);
  assert.equal(root.lastElementChild!.getAttribute("data-x"), "104");
});
