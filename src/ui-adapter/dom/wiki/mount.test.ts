import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { Window } from "happy-dom";
import type { HTMLElement as HappyElement, HTMLInputElement as HappyInput, HTMLSelectElement as HappySelect } from "happy-dom";
import { mountWiki } from "./mount.ts";
import { badRef, href, keyHints, wikiFixture } from "./fixtures.ts";

function setup(t: TestContext) {
  const win = new Window();
  const root = win.document.createElement("div");
  win.document.body.append(root);
  const fixture = wikiFixture();
  const calls: { hash: string; replace?: boolean }[] = [];
  const mounted = mountWiki(root as unknown as HTMLElement, {
    api: fixture.api, href, keyHints, navigate: (hash, replace) => calls.push({ hash, replace }),
  });
  t.after(() => { mounted.destroy(); win.close(); });
  return { win, root, fixture, calls, mounted };
}

test("首頁有分類卡片、總數及 lore 缺資料提示", t => {
  const { root, fixture, mounted } = setup(t);
  mounted.show({ v: "home" });
  const home = root.querySelector('[data-ui="wiki-home"]')!;
  assert.ok(home);
  assert.equal(home.querySelectorAll("a[data-cat]").length, fixture.categories.length);
  assert.match(home.textContent, /世界觀資料尚未建立（content\/lore\/）/u);
  assert.equal(home.querySelectorAll("dl dt").length, 6);
  assert.equal(home.querySelector("li a")!.getAttribute("href"), href({ v: "entry", key: fixture.home.broken[0]!.from }));
  assert.ok(home.textContent.includes(badRef.raw));
});

test("側欄分類導航及抽屜切換，修飾鍵保留預設行為", t => {
  const { root, win, fixture, calls, mounted } = setup(t);
  const links = root.querySelectorAll('[data-ui="wiki-sidebar"] a[data-cat]');
  assert.equal(links.length, fixture.categories.length);
  mounted.toggleSidebar();
  assert.ok(root.classList.contains("wiki-sidebar-open"));
  const link = links[0]!;
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { button: 1 }]) {
    const event = new win.MouseEvent("click", { bubbles: true, cancelable: true, ...options });
    link.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
  }
  assert.equal(calls.length, 0);
  const click = new win.MouseEvent("click", { bubbles: true, cancelable: true });
  link.dispatchEvent(click);
  assert.equal(click.defaultPrevented, true);
  assert.deepEqual(calls, [{ hash: href({ v: "cat", query: { category: fixture.categories[0]!.key } }), replace: undefined }]);
  assert.equal(root.classList.contains("wiki-sidebar-open"), false);
  mounted.toggleSidebar();
  mounted.toggleSidebar();
  assert.equal(root.classList.contains("wiki-sidebar-open"), false);
});

test("分類清單只畫現有面向並傳遞排序與篩選 query", t => {
  const { root, win, fixture, calls, mounted } = setup(t);
  const query = { category: fixture.categories[0]!.key, filters: { grade: "D" } };
  mounted.show({ v: "cat", query });
  assert.equal(root.querySelectorAll('[data-ui="wiki-row"][data-key]').length, fixture.list.rows.length);
  assert.deepEqual([...root.querySelectorAll("select[data-facet]")].map(node => node.getAttribute("data-facet")), ["grade"]);
  const sort = root.querySelector<HappySelect>('[data-ui="wiki-sort"]')!;
  sort.value = "grade";
  sort.dispatchEvent(new win.Event("change"));
  assert.equal(calls.at(-1)!.hash, href({ v: "cat", query: { ...query, sort: "grade" } }));
  const filter = root.querySelector<HappySelect>('select[data-facet="grade"]')!;
  filter.value = "C";
  filter.dispatchEvent(new win.Event("change"));
  assert.equal(calls.at(-1)!.hash, href({ v: "cat", query: { ...query, filters: { grade: "C" } } }));
  filter.value = "";
  filter.dispatchEvent(new win.Event("change"));
  assert.equal(calls.at(-1)!.hash, href({ v: "cat", query: { ...query, filters: {} } }));
});

test("搜尋 debounce 120ms replace 導航，重畫保留輸入節點及焦點", t => {
  const { root, win, fixture, calls, mounted } = setup(t);
  let nextId = 0;
  const pending = new Map<number, () => void>();
  t.mock.method(win, "setTimeout", (callback: () => void, delay: number) => {
    assert.equal(delay, 120);
    pending.set(++nextId, callback);
    return nextId;
  });
  t.mock.method(win, "clearTimeout", (id: number) => pending.delete(id));
  const search = root.querySelector<HappyInput>('[data-ui="wiki-search"]')!;
  mounted.focusSearch();
  search.value = "一";
  search.dispatchEvent(new win.Event("input"));
  search.value = "一號";
  search.dispatchEvent(new win.Event("input"));
  assert.equal(calls.length, 0);
  assert.equal(pending.size, 1);
  for (const callback of pending.values()) callback();
  pending.clear();
  assert.deepEqual(calls, [{ hash: href({ v: "search", q: "一號" }), replace: true }]);
  search.setSelectionRange(1, 1);
  mounted.show({ v: "search", q: "一號" });
  assert.equal(root.querySelector('[data-ui="wiki-search"]'), search);
  assert.equal(win.document.activeElement, search);
  assert.equal(search.selectionStart, 1);
  assert.equal(root.querySelectorAll('[data-ui="wiki-results"] a[data-key]').length, fixture.hits.length);
  search.dispatchEvent(new win.Event("input"));
  mounted.destroy();
  assert.equal(pending.size, 0);
});

test("隱藏時鍵盤不處理，說明表切換且輸入欄 Escape 失焦", t => {
  const { root, win, calls, mounted } = setup(t);
  const parent = win.document.createElement("section");
  win.document.body.append(parent);
  parent.append(root);
  mounted.focusSearch();
  const search = root.querySelector<HappyInput>("input")!;
  parent.hidden = true;
  const hiddenEscape = new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  search.dispatchEvent(hiddenEscape);
  assert.equal(hiddenEscape.defaultPrevented, false);
  assert.equal(win.document.activeElement, search);
  win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "g" }));
  assert.equal(calls.length, 0);
  parent.hidden = false;
  const help = root.querySelector<HappyElement>('[data-ui="wiki-help"]')!;
  assert.equal(help.hidden, true);
  mounted.toggleHelp();
  assert.equal(help.hidden, false);
  assert.equal(help.querySelectorAll("tr").length, keyHints.length);
  mounted.toggleHelp();
  assert.equal(help.hidden, true);
  search.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  assert.notEqual(win.document.activeElement, search);
  assert.equal(calls.length, 0);
});

test("靜態限制與 import 邊界，destroy 清空並解除 keydown", t => {
  const folder = new URL("./", import.meta.url);
  const forbidden = /innerHTML|insertAdjacentHTML|outerHTML/u;
  assert.ok(forbidden.test("node.innerHTML = input"));
  const validImport = (typeOnly: boolean, path: string): boolean => /^\.\/[^/]+\.(ts|css)$/u.test(path) || typeOnly && path === "../../vm/wiki/types.ts";
  assert.equal(validImport(false, "../../vm/wiki/types.ts"), false);
  assert.equal(validImport(true, "../../vm/wiki/cards.ts"), false);
  for (const file of readdirSync(folder).filter(file => file.endsWith(".ts") && !file.endsWith(".test.ts") && file !== "fixtures.ts" && file !== "boot.ts")) {
    const source = readFileSync(new URL(file, folder), "utf8");
    assert.equal(forbidden.test(source), false, file);
    // boot.ts 是契約明定的接線例外，由殼線負責。
    for (const match of source.matchAll(/import\s+(type\s+)?(?:[^;]*?\s+from\s+)?["']([^"']+)["']/gu)) {
      assert.ok(validImport(Boolean(match[1]), match[2]!), `${file}: ${match[2]}`);
    }
  }
  const { root, win, mounted } = setup(t);
  const remove = t.mock.method(win.document, "removeEventListener");
  mounted.destroy();
  assert.equal(root.childNodes.length, 0);
  assert.equal(remove.mock.calls.filter(call => call.arguments[0] === "keydown").length, 1);
  const input = win.document.createElement("input");
  root.append(input);
  input.focus();
  input.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  assert.equal(win.document.activeElement, input);
  mounted.destroy();
  assert.equal(remove.mock.calls.filter(call => call.arguments[0] === "keydown").length, 1);
});

test("側欄分類件數放在獨立 wiki-count 徽章，不用括號件數", t => {
  const { root, fixture } = setup(t);
  const links = root.querySelectorAll('[data-ui="wiki-sidebar"] a[data-cat]');
  assert.equal(links.length, fixture.categories.length);
  for (const category of fixture.categories) {
    const link = [...links].find(link => link.getAttribute("data-cat") === category.key)!;
    assert.equal(link.querySelectorAll(".wiki-count").length, 1);
    assert.equal(link.querySelector(".wiki-count")!.textContent, String(category.count));
    assert.equal(link.querySelector("span:not(.wiki-count)")!.textContent, category.label);
    assert.doesNotMatch(link.textContent, /[（(]\s*\d+\s*[）)]/u);
  }
});
