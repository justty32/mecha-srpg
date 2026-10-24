import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { createGridView } from "./grid-view.ts";

test("GridView：可視格數、dirty 更新與同尺寸捲動", () => {
  const win = new Window(), root = win.document.createElement("div");
  const draw = createGridView(root as unknown as HTMLElement);
  const source = { size: { w: 10, h: 10 }, viewport: { x: 0, y: 0, w: 3, h: 2 },
    cell: (x: number, y: number) => ({ classes: ["cell"], glyph: `${x},${y}` }), dirty: (): Set<string> | "all" => "all" };
  draw(source); assert.equal(root.children.length, 6);
  const first = root.firstElementChild!;
  first.textContent = "untouched";
  draw({ ...source, dirty: () => new Set(["1,0"]) });
  assert.equal(first.textContent, "untouched");
  draw({ ...source, viewport: { ...source.viewport, x: 2 }, dirty: () => new Set() });
  assert.equal(root.firstElementChild, first);
  assert.equal(first.textContent, "2,0");
  win.close();
});
