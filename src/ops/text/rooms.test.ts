import { test } from "node:test";
import assert from "node:assert/strict";
import { describeRoom } from "./rooms.ts";
import { fixture } from "./fixtures.ts";

test("rooms：mycelium 只在採菌條件成立後出現在 exits", () => {
  const { state, world, db } = fixture();
  assert.ok(!describeRoom("restraint", state, world, db).exits.includes("mycelium"));
  state.flags["mycelium-harvested"] = 1;
  assert.ok(describeRoom("restraint", state, world, db).exits.includes("mycelium"));
  state.flags["mycelium-harvested"] = 0;
  state.restraint.myceliumRoom = { layers: 1, growth: 0, lastPrune: 0 };
  assert.ok(describeRoom("restraint", state, world, db).exits.includes("mycelium"));
});
