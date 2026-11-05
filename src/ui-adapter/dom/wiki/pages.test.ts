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

