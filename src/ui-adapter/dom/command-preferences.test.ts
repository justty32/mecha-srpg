import { test } from "node:test";
import assert from "node:assert/strict";
import { createCommandPreferenceStore, PREFERENCE_KEY, type PreferenceStorage } from "./command-preferences.ts";
const memory = (initial = ""): PreferenceStorage => {
  let value = initial;
  return { getItem: () => value, setItem: (_key, text) => { value = text; } };
};
test("最近6筆去重移首；最愛8筆滿額不擅自取代，取消釘選不改最近", () => {
  const store = createCommandPreferenceStore("battle", null);
  for (let i = 0; i < 9; i++) store.record(`ability:test/${i}`);
  store.record("ability:test/5");
  assert.deepEqual(store.state.recent, [5,8,7,6,4,3].map(i => `ability:test/${i}`));
  for (let i = 0; i < 8; i++) assert.equal(store.togglePin(`ability:test/${i}`), "added");
  assert.equal(store.togglePin("move"), "full");
  assert.equal(store.state.favorites.length, 8);
  const recent = store.state.recent;
  assert.equal(store.togglePin("ability:test/0"), "removed");
  assert.deepEqual(store.state.recent, recent);
});
test("持久化隔離scope，重新掛載保留；只寫版本與id陣列", () => {
  const disk = memory();
  const battle = createCommandPreferenceStore("battle", disk), ops = createCommandPreferenceStore("ops", disk);
  battle.togglePin("end"); ops.record("tab:world"); battle.record("move");
  assert.deepEqual(createCommandPreferenceStore("battle", disk).state, { favorites: ["end"], recent: ["move"] });
  assert.deepEqual(createCommandPreferenceStore("ops", disk).state.recent, ["tab:world"]);
  assert.deepEqual(Object.keys(JSON.parse(disk.getItem(PREFERENCE_KEY)!)).sort(), ["battle", "ops", "version"]);
});
test("惡意格式、錯誤版本與危險操作不進偏好", () => {
  for (const source of ["{", "null", '{"version":2,"battle":{"recent":["move"]}}']) {
    assert.deepEqual(createCommandPreferenceStore("battle", memory(source)).state, { recent: [], favorites: [] });
  }
  const source = JSON.stringify({ version: 1, battle: { recent: ["move", "move", "eject", "attackFeature:a", "ability:<img>", {}, "end"], favorites: "move" } });
  const store = createCommandPreferenceStore("battle", memory(source));
  assert.deepEqual(store.state.recent, ["move", "end"]);
  assert.equal(store.togglePin("retreat"), "invalid");
  store.record("map:sail"); assert.deepEqual(store.state.recent, ["move", "end"]);
});
test("storage讀寫及property getter拋錯仍能操作並通知；state不可外改", () => {
  const badGetter = Object.defineProperty({}, "getItem", { get() { throw Error("getter"); } }) as PreferenceStorage;
  for (const disk of [badGetter, { getItem() { throw Error("read"); }, setItem() {} }, { getItem: () => null, setItem() { throw Error("write"); } }]) {
    const store = createCommandPreferenceStore("battle", disk); let calls = 0;
    const off = store.subscribe(() => calls++); store.record("move"); store.togglePin("standby");
    store.state.recent.length = 0;
    assert.deepEqual(store.state.recent, ["move"]); assert.deepEqual(store.state.favorites, ["standby"]); assert.equal(calls, 2);
    off(); store.record("defer"); assert.equal(calls, 2); store.destroy();
  }
});

test("空字串與損毀來源在record後修復，刷新保留最近與釘選", () => {
  for (const source of ["", "{", "undefined", '[broken']) {
    const disk = memory(source), store = createCommandPreferenceStore("battle", disk);
    assert.deepEqual(store.state, { recent: [], favorites: [] });
    store.record("move");
    assert.deepEqual(createCommandPreferenceStore("battle", disk).state, { recent: ["move"], favorites: [] });
    store.togglePin("end");
    assert.deepEqual(createCommandPreferenceStore("battle", disk).state, { recent: ["move"], favorites: ["end"] });
  }
});
