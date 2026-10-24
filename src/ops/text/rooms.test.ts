import { test } from "node:test";
import assert from "node:assert/strict";
import { describeRoom } from "./rooms.ts";
import { fixture } from "./fixtures.ts";

test("rooms：拘束艙狀態片語隨 state 變化且不修改輸入", () => {
  const { state, world, db } = fixture(), before = structuredClone(state);
  const empty = describeRoom("restraint", state, world, db);
  assert.ok(empty.desc.some(t => t.includes("鐵鍊靜靜"))); assert.deepEqual(state, before);
  state.restraint.beasts["mech-8"] = { mech: "mech-8", kind: "live", wear: 80, vitality: 100, bond: {} };
  const occupied = describeRoom("restraint", state, world, db);
  assert.ok(!occupied.desc.some(t => t.includes("鐵鍊靜靜"))); assert.ok(occupied.desc.some(t => t.includes("呼吸")));
});
test("rooms：mycelium 只在採菌條件成立後出現在 exits", () => {
  const { state, world, db } = fixture();
  assert.ok(!describeRoom("restraint", state, world, db).exits.includes("mycelium"));
  state.flags["mycelium-harvested"] = 1;
  assert.ok(describeRoom("restraint", state, world, db).exits.includes("mycelium"));
  state.flags["mycelium-harvested"] = 0;
  state.restraint.myceliumRoom = { layers: 1, growth: 0, lastPrune: 0 };
  assert.ok(describeRoom("restraint", state, world, db).exits.includes("mycelium"));
});
