import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import type { HTMLSelectElement as HappySelect, HTMLTableCellElement as HappyCell, Node as HappyNode } from "happy-dom";
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

test("U02 列表、搜尋與年表用相同徽章呈現傳聞／可能發生，公開列不加徽章", t => {
  const { root, fixture, mounted } = setup(t);
  Object.assign(fixture.list.rows[0]!, { visibility: "rumor", occurs: "possible" });
  mounted.show({ v: "cat", query: fixture.list.query });
  const labels = (selector: string) => [...root.querySelectorAll(`${selector} .wiki-badge`)].map(node => node.textContent);
  assert.ok(labels('[data-ui="wiki-row"]').includes("傳聞"));
  assert.ok(labels('[data-ui="wiki-row"]').includes("可能發生"));
  Object.assign(fixture.hits[0]!, { visibility: "rumor", occurs: "possible" });
  mounted.show({ v: "search", q: "測試" });
  assert.deepEqual(labels('[data-ui="wiki-results"]'), ["可能發生", "傳聞"]);
  Object.assign(fixture.timeline.sections[0]!.items[0]!, { visibility: "rumor" });
  mounted.show({ v: "timeline", query: {} });
  assert.deepEqual(labels('[data-ui="wiki-timeline"]'), ["傳聞"]);
});

test("W04／W05 列表呈現中文欄值，機型原 ID 作為次要文字", t => {
  const { root, fixture, mounted } = setup(t);
  Object.assign(fixture.list.rows[0]!, { name: "赤鉚砧（機型）", id: "model/anvil-crimson-rivet",
    displayFacets: [{ label: "類別", values: ["機械系"] }, { label: "安裝槽位", values: ["武器掛點", "背部掛點"] }] });
  mounted.show({ v: "cat", query: fixture.list.query });
  const row = root.querySelector('[data-ui="wiki-row"]')!;
  assert.equal(row.querySelector("a")!.textContent, "赤鉚砧（機型）");
  assert.equal(row.querySelector("small.wiki-row-id")!.textContent, "model/anvil-crimson-rivet");
  assert.deepEqual([...row.querySelectorAll(".wiki-row-facet")].map(node => node.textContent), ["類別：機械系", "安裝槽位：武器掛點、背部掛點"]);
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

