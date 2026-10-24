import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { allPlaces, requirePlace } from "../../../ops/world/places.ts";
import { layoutNodes } from "./layout.ts";
import { mergedBindings, validateBindings } from "./keymap.ts";
const { world } = loadWorldDirs(["content/base"]);
test("鍵表同 context 無重複且能擋衝突；世界圖決定性、留邊及最短距離", () => {
  const bindings = mergedBindings(world);
  assert.deepEqual(validateBindings(bindings), []);
  assert.ok(validateBindings([...bindings, bindings[0]!]).length);
  const state = { places: {} }, ctx = { world };
  const nodes = allPlaces(state, ctx), points = layoutNodes(nodes);
  assert.deepEqual(points, layoutNodes([...nodes].reverse()));
  const list = [...points.values()];
  for (const p of list) assert.ok(p.x >= .06 && p.x <= .94 && p.y >= .06 && p.y <= .94);
  const dhaka = points.get(requirePlace(state, ctx, "place/dhaka").id)!, port = points.get(requirePlace(state, ctx, "place/chittagong").id)!;
  assert.ok(dhaka.x < port.x && dhaka.y < port.y);
});
