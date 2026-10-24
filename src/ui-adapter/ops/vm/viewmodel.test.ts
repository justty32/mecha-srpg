import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { layoutNodes } from "./layout.ts";
import { mergedBindings, validateBindings } from "./keymap.ts";
const { world } = loadWorldDirs(["content/base"]);
test("鍵表同 context 無重複且能擋衝突；世界圖決定性、留邊及最短距離", () => {
  const bindings = mergedBindings(world);
  assert.deepEqual(validateBindings(bindings), []);
  assert.ok(validateBindings([...bindings, bindings[0]!]).length);
  const nodes = world.all("node"), routes = world.all("route"), points = layoutNodes(nodes, routes);
  assert.deepEqual(points, layoutNodes([...nodes].reverse(), [...routes].reverse()));
  const list = [...points.values()];
  for (const p of list) assert.ok(p.x >= .06 && p.x <= .94 && p.y >= .06 && p.y <= .94);
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++)
    assert.ok(Math.hypot(list[i]!.x - list[j]!.x, list[i]!.y - list[j]!.y) >= .08);
});
