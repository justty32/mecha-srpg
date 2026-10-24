import { test } from "node:test";
import assert from "node:assert/strict";
import { nextId } from "./ids.ts";
test("ids：跨前綴唯一，存檔後決定性續號", () => {
  const s = { idCounter: 0 };
  assert.equal(nextId(s, "mech"), "mech-1");
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(nextId(s, "person"), "person-2");
  assert.equal(nextId(restored, "person"), "person-2");
});
