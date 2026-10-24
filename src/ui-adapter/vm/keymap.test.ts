import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_KEYMAP, normalizeKey, resolveKey, validateKeymap, keyLabel, parseAction } from "./keymap.ts";

test("keymap：預設鍵位合法", () => { assert.deepEqual(validateKeymap(DEFAULT_KEYMAP), []); });
test("keymap：修飾鍵順序固定、字母小寫", () => {
  assert.equal(normalizeKey({ key: "X", shiftKey: true, altKey: true, ctrlKey: true }), "Ctrl+Alt+Shift+x");
  assert.equal(normalizeKey({ key: "ArrowUp", shiftKey: true }), "Shift+ArrowUp");
});
test("keymap：e／1／Shift+ArrowUp／Escape 解析操作", () => {
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "e" }), { type: "endTurn" });
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "1" }), { type: "abilitySlot", n: 1 });
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "ArrowUp", shiftKey: true }), { type: "scroll", dx: 0, dy: -10 });
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "Escape" }), { type: "cancel" });
});
test("keymap：未綁定鍵回 null", () => { assert.equal(resolveKey(DEFAULT_KEYMAP, { key: "F12" }), null); });
test("keymap：重複鍵與未知操作被攔下", () => {
  const map = structuredClone(DEFAULT_KEYMAP);
  map.bindings.push({ action: "nonsense", keys: ["E"], label: "錯誤" });
  assert.equal(validateKeymap(map).length, 2);
  assert.equal(parseAction("cursor:NaN,1"), null);
});
test("keymap：結束回合鍵標為 E", () => { assert.equal(keyLabel(DEFAULT_KEYMAP, "endTurn"), "E"); });
