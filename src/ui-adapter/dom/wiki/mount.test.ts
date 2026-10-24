import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { Window } from "happy-dom";
import type { HTMLElement as HappyElement, HTMLInputElement as HappyInput, HTMLSelectElement as HappySelect, HTMLTableCellElement as HappyCell, Node as HappyNode } from "happy-dom";
import { mountWiki } from "./mount.ts";
import { renderBlocks } from "./markdown-dom.ts";
import { badRef, goodRef, href, keyHints, markdownFixture, wikiFixture } from "./fixtures.ts";

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

test("詳情繪出所有資料卡、引用、壞引用與分組反向引用", t => {
  const { root, fixture, mounted } = setup(t);
  mounted.show({ v: "entry", key: fixture.entry.key });
  const entry = root.querySelector('[data-ui="wiki-entry"][data-key]')!;
  assert.equal(entry.getAttribute("data-key"), fixture.entry.key);
  for (const selector of ['[data-section="kv"] dl', '[data-section="table"] table', '[data-section="list"] ul', '[data-section="md"] h2', 'details[data-section="raw"] dl']) assert.ok(entry.querySelector(selector));
  assert.equal(entry.querySelector("details")!.open, false);
  assert.equal(entry.querySelector("a[data-ref]")!.getAttribute("href"), href({ v: "entry", key: goodRef.target! }));
  const broken = entry.querySelector("span.wiki-broken")!;
  assert.equal(broken.getAttribute("data-broken"), badRef.raw);
  assert.match(broken.textContent, /未建立/u);
  assert.match(entry.textContent, /斥候/u);
  assert.equal(entry.querySelectorAll('[data-ui="wiki-backlinks"] section').length, fixture.entry.backlinks.length);
  assert.ok(entry.querySelector('nav a'));
});

test("markdown 各種結構、巢狀清單及對齊正確，標籤只呈現文字", t => {
  const { root, win } = setup(t);
  root.replaceChildren(renderBlocks(win.document as unknown as Document, markdownFixture(), href) as unknown as HappyNode);
  assert.equal(root.querySelector("h2")!.textContent, "標題");
  assert.equal(root.querySelector("p strong")!.textContent, "粗體");
  assert.equal(root.querySelector("p em")!.textContent, "斜體");
  assert.equal(root.querySelector("p code")!.textContent, "inline");
  assert.ok(root.querySelector("p br"));
  assert.equal(root.querySelector("ul > li > ul > li p")!.textContent, "內層");
  assert.equal(root.querySelector("ol > li p")!.textContent, "第一");
  assert.deepEqual([...root.querySelectorAll<HappyCell>("thead th")].map(cell => cell.style.textAlign), ["left", "center", "right"]);
  assert.deepEqual([...root.querySelectorAll<HappyCell>("tbody td")].map(cell => cell.style.textAlign), ["left", "center", "right"]);
  assert.equal(root.querySelector("blockquote p")!.textContent, "引用");
  assert.equal(root.querySelector("pre code")!.textContent, "const x = '<script>';");
  assert.ok(root.querySelector("hr"));
  assert.ok(root.textContent.includes("<script>alert(1)</script>"));
  assert.equal(root.querySelectorAll("script").length, 0);
  const external = root.querySelector('a[target="_blank"]')!;
  assert.equal(external.getAttribute("rel"), "noopener noreferrer");
});

test("年表按時代分段，勢力及時代篩選保留 query", t => {
  const { root, win, fixture, calls, mounted } = setup(t);
  const query = { tag: "歷史" };
  mounted.show({ v: "timeline", query });
  assert.equal(root.querySelectorAll("[data-era]").length, fixture.timeline.sections.length);
  assert.equal(root.querySelectorAll('[data-ui="wiki-tl-item"]').length, fixture.timeline.sections.reduce((sum, section) => sum + section.items.length, 0));
  assert.ok(root.querySelector('[data-era="none"]'));
  const faction = root.querySelector<HappySelect>('[data-ui="wiki-tl-faction"]')!;
  faction.value = goodRef.target!;
  faction.dispatchEvent(new win.Event("change"));
  assert.equal(calls.at(-1)!.hash, href({ v: "timeline", query: { ...query, faction: goodRef.target! } }));
  const era = root.querySelector<HappySelect>('[data-ui="wiki-tl-era"]')!;
  era.value = fixture.timeline.eras[0]!.value;
  era.dispatchEvent(new win.Event("change"));
  assert.equal(calls.at(-1)!.hash, href({ v: "timeline", query: { ...query, era: era.value } }));
});

test("勢力矩陣格子對應 cells，關係 class 與來源正確", t => {
  const { root, fixture, mounted } = setup(t);
  mounted.show({ v: "relations" });
  const table = root.querySelector('[data-ui="wiki-relations"] table')!;
  assert.equal(table.querySelectorAll("td").length, fixture.relations.factions.length ** 2);
  assert.equal(table.querySelectorAll("[data-rel]").length, fixture.relations.cells.length);
  for (const cell of fixture.relations.cells) {
    const td = [...table.querySelectorAll("td")].find(node => node.dataset.from === cell.from && node.dataset.to === cell.to)!;
    const value = td.querySelector("[data-rel]")!;
    assert.equal(value.getAttribute("data-rel"), cell.rel);
    assert.ok(value.classList.contains(`rel-${cell.tone}`));
    assert.match(value.querySelector("small")!.textContent, new RegExp(cell.source === "lore" ? "世界觀" : "遊戲"));
  }
  assert.equal(table.querySelectorAll("th a[data-ref]").length, fixture.relations.factions.length * 2);
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

test("kv 值與巢狀物件繪成 dl.wiki-kv，表格物件不含 ul", t => {
  const { root, fixture, mounted } = setup(t);
  const value = {
    t: "kv" as const,
    rows: [{ label: "抗性", value: { t: "kv" as const, rows: [{ label: "動能", value: { t: "num" as const, v: 0.5 } }] } }],
  };
  fixture.entry.sections = [
    { t: "kv", title: "概要", rows: [{ label: "裝甲", value }] },
    { t: "table", title: "層", columns: ["物件"], rows: [[value]] },
  ];
  mounted.show({ v: "entry", key: fixture.entry.key });
  assert.equal(root.querySelectorAll('[data-section="kv"] > dl.wiki-kv > dd > dl.wiki-kv').length, 1);
  const cell = root.querySelector('[data-section="table"] td')!;
  assert.equal(cell.querySelectorAll("dl.wiki-kv").length, 2);
  assert.equal(cell.querySelector("dl.wiki-kv > dd > dl.wiki-kv > dt")!.textContent, "動能");
  assert.equal(cell.querySelector("dl.wiki-kv > dd > dl.wiki-kv > dd")!.textContent, "0.5");
  assert.equal(cell.querySelector("ul"), null);
});

test("短 list 以頓號行內分隔，九項 list 使用 ul", t => {
  const { root, fixture, mounted } = setup(t);
  fixture.entry.sections = [{ t: "kv", title: "清單", rows: [
    { label: "短", value: { t: "list", items: [{ t: "text", v: "偵查" }, { t: "ref", ref: goodRef }] } },
    { label: "長", value: { t: "list", items: Array.from({ length: 9 }, (_, i) => ({ t: "text", v: `項目${i + 1}` })) } },
  ] }];
  mounted.show({ v: "entry", key: fixture.entry.key });
  const values = root.querySelectorAll('[data-section="kv"] > dl > dd');
  assert.equal(values[0]!.querySelector("ul"), null);
  assert.equal(values[0]!.querySelector(".wiki-inline-list")!.textContent, `偵查、${goodRef.label}`);
  assert.equal(values[0]!.querySelector("a")!.getAttribute("data-ref"), goodRef.target);
  assert.equal(values[1]!.querySelectorAll("ul > li").length, 9);
});

test("關係格依 tone 上色、顯示 label 與 note，清單涵蓋有關係勢力", t => {
  const { root, fixture, mounted } = setup(t);
  fixture.relations.factions.push({ key: "lore:faction/quiet", name: "無關係勢力", group: "lore" });
  fixture.relations.cells.push(
    { from: goodRef.target!, to: "lore:faction/beta", rel: "tense", label: "緊張", tone: "tense", note: "貿易爭端", source: "lore" },
    { from: "lore:faction/beta", to: goodRef.target!, rel: "friendly", label: "友好", tone: "friendly", source: "game" },
  );
  mounted.show({ v: "relations" });
  const table = root.querySelector(".wiki-table-scroll > table")!;
  for (const relation of fixture.relations.cells) {
    const cell = [...table.querySelectorAll("td")].find(cell => cell.dataset.from === relation.from && cell.dataset.to === relation.to)!;
    const value = [...cell.querySelectorAll("[data-rel]")].find(value => value.getAttribute("data-rel") === relation.rel)!;
    assert.ok(cell.classList.contains(`rel-${relation.tone}`));
    assert.ok(value.classList.contains(`rel-${relation.tone}`));
    assert.equal(value.firstChild!.textContent, relation.label);
    assert.equal(value.getAttribute("title"), relation.note ?? null);
    assert.equal(value.querySelector("small")!.textContent, ` · ${relation.source === "lore" ? "世界觀" : "遊戲"}`);
  }
  const groups = root.querySelectorAll(".wiki-relations-list > section");
  assert.equal(groups.length, new Set(fixture.relations.cells.map(cell => cell.from)).size);
  for (const group of groups) {
    const relations = fixture.relations.cells.filter(cell => cell.from === group.getAttribute("data-from"));
    const items = group.querySelectorAll("li");
    assert.equal(items.length, relations.length);
    relations.forEach((relation, index) => {
      assert.equal(items[index]!.querySelector("a")!.getAttribute("data-ref"), relation.to);
      assert.ok(items[index]!.textContent.includes(relation.label));
      if (relation.note) assert.ok(items[index]!.textContent.includes(relation.note));
    });
  }
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
