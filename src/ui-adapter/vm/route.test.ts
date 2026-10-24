import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { controllerForScenario } from "./controller.ts";
import { formatRoute, parseHash, wikiHref } from "./route.ts";
import { DEFAULT_KEYMAP, normalizeKey, resolveKey, validateKeymap } from "./keymap.ts";
import { WIKI_KEYMAP, parseWikiAction, resolveWikiKey, wikiKeyHints } from "./wiki/keys.ts";
import type { AppRoute, WikiView } from "./wiki/types.ts";

test("parseHash：契約所有路由、空 hash 與未知頁面", () => {
  const rows: [string, AppRoute][] = [
    ...["", "#", "#/", "#/battle", "#/unknown"].map(hash => [hash, { page: "battle" }] as [string, AppRoute]),
    ["#/ops", { page: "ops" }],
    ["#/wiki", { page: "wiki", view: { v: "home" } }],
    ["#/wiki/xxx", { page: "wiki", view: { v: "home" } }],
    ["#/wiki/c/base%3Aframe?sort=grade&desc=1&grade=A", { page: "wiki", view: {
      v: "cat", query: { category: "base:frame", sort: "grade", desc: true, filters: { grade: "A" } },
    } }],
    ["#/wiki/e/base%3Aframe%2Fsample", { page: "wiki", view: { v: "entry", key: "base:frame/sample" } }],
    ["#/wiki/s?q=%E6%A9%9F%E7%94%B2", { page: "wiki", view: { v: "search", q: "機甲" } }],
    ["#/wiki/timeline?faction=lore%3Afaction%2Fx&era=lore%3Aera%2Fy&tag=old", { page: "wiki", view: {
      v: "timeline", query: { faction: "lore:faction/x", era: "lore:era/y", tag: "old" },
    } }],
    ["#/wiki/relations", { page: "wiki", view: { v: "relations" } }],
  ];
  for (const [hash, route] of rows) assert.deepEqual(parseHash(hash), route, hash);
});

test("formatRoute：正規形式往返、key 編碼、分類 sort／desc／facet", () => {
  for (const hash of ["#/battle", "#/ops", "#/wiki", "#/wiki/relations", "#/wiki/timeline",
    "#/wiki/c/base%3Aframe?sort=grade&desc=1&grade=A&family=ancient",
    "#/wiki/e/base%3Aframe%2Fsample", "#/wiki/s?q=hello%20world",
    "#/wiki/timeline?faction=base%3Afaction%2Ftest&era=lore%3Aera%2Fx&tag=old"]) {
    assert.equal(formatRoute(parseHash(hash)), hash);
  }
  const route: AppRoute = { page: "wiki", view: { v: "entry", key: "pack:kind/path/含 空白" } };
  assert.deepEqual(parseHash(formatRoute(route)), route);
  assert.equal(formatRoute(parseHash("#/wiki/xxx")), "#/wiki");
  assert.equal(formatRoute(parseHash("")), "#/battle");
});

test("wikiHref 與 formatRoute 一致，中文與空白搜尋可往返", () => {
  const views: WikiView[] = [{ v: "home" }, { v: "entry", key: "base:frame/sample" },
    { v: "cat", query: { category: "base:frame", sort: "id", desc: false, filters: { tag: "地 月" } } },
    { v: "search", q: "地月 機甲 + /" }, { v: "timeline", query: { tag: "大事件" } }, { v: "relations" }];
  for (const view of views) {
    const route: AppRoute = { page: "wiki", view };
    assert.equal(wikiHref(view), formatRoute(route));
    assert.deepEqual(parseHash(wikiHref(view)), route);
  }
});

test("戰鬥 keymap：F1／Shift+W 導航，W 待機，navigate 不改 snapshot", () => {
  assert.deepEqual(validateKeymap(DEFAULT_KEYMAP), []);
  for (const key of [{ key: "F1" }, { key: "W", shiftKey: true }]) {
    assert.deepEqual(resolveKey(DEFAULT_KEYMAP, key), { type: "navigate", page: "wiki" });
  }
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "w" }), { type: "standby" });
  const { db } = loadContentDirs(["content/base"]);
  const controller = controllerForScenario(db, "scenario/skirmish-whitegloves", 1);
  controller.dispatch({ type: "endTurn" });
  // snapshot 的 dirty 是讀取後重設的增量欄位，先穩定一次再比較。
  const before = controller.snapshot();
  assert.ok(before.confirm);
  assert.deepEqual(controller.dispatch({ type: "navigate", page: "wiki" }), before);
});

test("百科 keymap：無重複、action 全認得、指定按鍵與提示列數", () => {
  const keys = new Set<string>();
  for (const binding of WIKI_KEYMAP.bindings) {
    assert.ok(parseWikiAction(binding.action), binding.action);
    for (const value of binding.keys) {
      const parts = value.split("+");
      const input = { key: parts.pop()!, shiftKey: parts.includes("Shift"), ctrlKey: parts.includes("Ctrl"), altKey: parts.includes("Alt") };
      const normalized = normalizeKey(input);
      assert.equal(keys.has(normalized), false, value);
      keys.add(normalized);
      assert.equal(resolveWikiKey(input), binding.action);
    }
  }
  assert.equal(resolveWikiKey({ key: "F1" }), "nav:battle");
  assert.equal(resolveWikiKey({ key: "B", shiftKey: true }), "nav:battle");
  assert.equal(resolveWikiKey({ key: "/" }), "wiki:search");
  assert.equal(resolveWikiKey({ key: "t" }), "wiki:timeline");
  assert.equal(resolveWikiKey({ key: "Escape" }), "wiki:blur");
  assert.equal(wikiKeyHints().length, WIKI_KEYMAP.bindings.length);
});
