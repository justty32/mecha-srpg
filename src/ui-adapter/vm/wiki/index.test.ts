import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { buildWikiIndex } from "./index.ts";
import { searchWiki } from "./search.ts";
import { timelineView } from "./timeline.ts";
import type { RawFile } from "./types.ts";

const file = (data: unknown, pack = "base", path = "fixtures/entry.json"): RawFile => ({ pack, path, data });

test("1 空輸入產生空索引", () => {
  const index = buildWikiIndex([]);
  assert.equal(index.entries.size, 0);
  assert.deepEqual(index.categories, []);
  assert.deepEqual(index.timeline, []);
  assert.deepEqual(index.issues, []);
});

test("2 id、檔案鍵與分類正確，壞結構記錄 issue", () => {
  const index = buildWikiIndex([
    file({ id: "frame/a" }), file({ setting: true }, "base", "rules/combat.json"),
    file({ id: "node/a" }, "base", "world/nodes/a.json"),
    file({ id: "event/a" }, "base", "world/events/a.json"),
    file({ id: "event/a" }, "lore", "events/a.json"),
  ]);
  assert.equal(index.entries.get("base:frame/a")?.category, "base:frame");
  assert.equal(index.entries.get("base:file/rules/combat")?.category, "base:rules");
  assert.equal(index.categories.find(c => c.key === "base:node")?.group, "ops");
  assert.equal(index.categories.find(c => c.key === "lore:event")?.label, "大事件");
  assert.equal(index.categories.find(c => c.key === "base:event")?.label, "營運事件");
  const bad = buildWikiIndex([file(null), file([]), file({ id: 7 }), file({ id: "frame/a" }), file({ id: "frame/a", name: "後一筆" })]);
  assert.equal(bad.issues.length, 4);
  assert.equal(bad.entries.size, 1);
  assert.equal(bad.entries.get("base:frame/a")?.name, "後一筆");
});

test("3 無 name 的怪獸由物種與 grade 推導名稱與族", () => {
  const index = buildWikiIndex([
    file({ id: "monster/a", species: "species/a", grade: "B" }),
    file({ id: "species/a", name: "裂爪", family: "beast", gradeRange: ["D", "B"] }),
    file({ id: "place/a", title: "港口" }, "lore"),
  ]);
  assert.equal(index.entries.get("base:monster/a")?.name, "裂爪 B");
  assert.deepEqual(index.entries.get("base:monster/a")?.facets.family, ["beast"]);
  assert.deepEqual(index.entries.get("base:species/a")?.facets.grade, ["D", "B"]);
  assert.equal(index.entries.get("lore:place/a")?.name, "港口");
});

test("4 遞迴收陣列、巢狀值與關係物件 key", () => {
  const index = buildWikiIndex([
    file({ id: "faction/a", members: ["person/a"], nested: { home: "place/a" }, relations: { "faction/b": "hostile" } }),
    file({ id: "person/a" }), file({ id: "place/a" }), file({ id: "faction/b" }),
  ]);
  const refs = index.entries.get("base:faction/a")!.refs;
  assert.ok(refs.some(r => r.field === "members[0]" && r.target === "base:person/a"));
  assert.ok(refs.some(r => r.field === "nested.home" && r.target === "base:place/a"));
  assert.ok(refs.some(r => r.field === "relations.faction/b" && r.target === "base:faction/b" && r.rel === "hostile"));
});

test("5 不存在的 id 是壞引用，一般文字不是引用", () => {
  const index = buildWikiIndex([file({ id: "frame/a", missing: "ability/missing", words: ["hostile", "never-retreat", "含 空白中文"] })]);
  assert.deepEqual(index.entries.get("base:frame/a")!.refs.map(r => [r.raw, r.target]), [["ability/missing", null]]);
  for (const raw of ["hostile", "never-retreat", "含 空白中文"]) assert.equal(index.resolve(raw, "base"), undefined);
  assert.equal(index.resolve("ability/missing", "base"), null);
});

test("6 lore 優先同 pack，base 前綴直達並建立反向引用", () => {
  const index = buildWikiIndex([
    file({ id: "faction/a", name: "遊戲勢力" }), file({ id: "frame/a" }),
    file({ id: "faction/a", name: "世界觀勢力" }, "lore"),
    file({ id: "character/a", faction: "faction/a", gameRefs: ["base:faction/a", "frame/a"] }, "lore"),
  ]);
  assert.equal(index.resolve("faction/a", "lore"), "lore:faction/a");
  assert.equal(index.resolve("faction/a", "base"), "base:faction/a");
  assert.equal(index.resolve("frame/a", "lore"), "base:frame/a");
  assert.equal(index.resolve("base:faction/a", "lore"), "base:faction/a");
  assert.equal(index.resolve("absent:faction/a", "lore"), null);
  assert.ok(index.backlinks.get("base:faction/a")?.some(r => r.from === "lore:character/a" && r.field === "gameRefs[0]"));
  assert.ok(index.backlinks.get("lore:faction/a")?.some(r => r.from === "lore:character/a"));
});

test("7 markdown 兩種內部連結收為 body 引用且去重", () => {
  const index = buildWikiIndex([
    file({ id: "character/a", body: "[[faction/a|同盟]] [機體](base:frame/a) [[faction/a]] [外站](https://example.com)" }, "lore"),
    file({ id: "faction/a", name: "同盟" }, "lore"), file({ id: "frame/a" }),
  ]);
  const refs = index.entries.get("lore:character/a")!.refs;
  assert.equal(refs.length, 2);
  assert.ok(refs.every(r => r.field === "body"));
  assert.deepEqual(new Set(refs.map(r => r.target)), new Set(["lore:faction/a", "base:frame/a"]));
});

test("8 年表日期、時代、事件與勢力解析，缺欄位仍可篩選", () => {
  const index = buildWikiIndex([
    file({ id: "era/a", name: "戰爭時代" }, "lore"), file({ id: "event/a" }, "lore"), file({ id: "faction/a" }, "lore"),
    file({ entries: [
      { date: "2108-03-14", era: "era/a", event: "event/a", factions: ["faction/a"], tags: ["war"] },
      { date: "2061", era: "戰爭時代" }, { date: "2108-03" }, {},
    ] }, "lore", "timeline.json"),
  ]);
  assert.equal(index.entries.size, 3);
  assert.deepEqual(index.timeline.filter(i => i.date).map(i => i.date), ["2061", "2108-03", "2108-03-14"]);
  const item = index.timeline.find(i => i.date === "2108-03-14")!;
  assert.equal(item.event?.target, "lore:event/a");
  assert.equal(item.era?.target, "lore:era/a");
  assert.equal(item.factions[0]?.target, "lore:faction/a");
  assert.equal(index.timeline.find(i => i.date === "2061")?.era?.target, "lore:era/a");
  const view = timelineView(index, { era: "lore:era/a", faction: "lore:faction/a", tag: "war" });
  assert.equal(view.total, 1);
  assert.equal(view.sections[0]?.label, "戰爭時代");
  assert.equal(view.eras[0]?.count, 2);
  assert.ok(timelineView(index, {}).sections.some(s => s.label === "未分時代"));
});

test("12 真實 base 全部 JSON 可建索引、解析引用與搜尋自己", () => {
  const root = "content/base/";
  const files: RawFile[] = [];
  const walk = (path: string): void => {
    for (const entry of readdirSync(`${root}${path}`, { withFileTypes: true })) {
      const child = `${path}${entry.name}`;
      if (entry.isDirectory()) walk(`${child}/`);
      else if (entry.name.endsWith(".json")) files.push(file(JSON.parse(readFileSync(`${root}${child}`, "utf8")), "base", child));
    }
  };
  walk("");
  const index = buildWikiIndex(files);
  assert.equal(index.entries.size, files.length);
  const categories = new Set(index.categories.map(c => c.key));
  for (const entry of index.entries.values()) {
    assert.ok(categories.has(entry.category), entry.key);
    for (const ref of entry.refs) if (ref.target !== null) assert.ok(index.entries.has(ref.target), ref.target);
    assert.ok(searchWiki(index, entry.name, index.entries.size).some(hit => hit.key === entry.key), entry.key);
  }
});
