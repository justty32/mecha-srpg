import { test } from "node:test";
import assert from "node:assert/strict";
import { interpolate, eventLog, templateEntries } from "./templates.ts";
import { EVENT_TYPES } from "../state/events.ts";
import { fixture } from "./fixtures.ts";

test("templates：巢狀插值、零值與事件名稱", () => {
  assert.equal(interpolate("{a.b}：{zero}/{missing}/{a.__proto__}", { a: { b: "潮" }, zero: 0 }), "潮：0//");
  const { state, world } = fixture();
  const row = eventLog({ seq: 0, day: 3, type: "WagePaid", payload: { person: "person-1", amount: 20 } }, state, world);
  assert.match(row.text, /阿九/); assert.match(row.text, /20/); assert.equal(row.kind, "money");
});
test("templates：每個 EVENT_TYPES 都有可渲染模板且五種 kind 齊全", () => {
  const { state, world } = fixture(), entries = templateEntries(world);
  for (const type of EVENT_TYPES) { assert.ok(entries[type], type); assert.ok(eventLog({ seq: 0, day: 0, type, payload: {} }, state, world).text.length); }
  assert.deepEqual([...new Set(Object.values(entries).map(t => t.kind))].sort(), ["blood", "info", "money", "soul", "warn"]);
});
