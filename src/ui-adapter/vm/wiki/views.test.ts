import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiIndex } from "./index.ts";
import { GRADE_ORDER } from "./kinds.ts";
import { listCategory } from "./list.ts";
import { searchWiki } from "./search.ts";
import { relationsView } from "./relations.ts";
import { homeView } from "./home.ts";
import type { RawFile } from "./types.ts";

const file = (data: unknown, pack = "base", path = "fixtures/entry.json"): RawFile => ({ pack, path, data });

test("9 分類排序、反序與面向篩選只呈現存在的選項", () => {
  const index = buildWikiIndex([
    file({ id: "frame/a", name: "Alpha", grade: "S", tags: ["rare"], cls: "mech" }),
    file({ id: "frame/b", name: "Beta", grade: "D", tags: ["common"], cls: "mech" }),
    file({ id: "frame/c", name: "Gamma", grade: "D", tags: ["common"] }),
    file({ id: "frame/d", name: "Delta", gradeRange: ["B", "A"] }),
  ]);
  assert.deepEqual(GRADE_ORDER, ["D", "C", "B", "A", "S", "SS", "SSS"]);
  const view = listCategory(index, { category: "base:frame", sort: "grade" })!;
  assert.deepEqual(view.rows.map(r => r.name), ["Beta", "Gamma", "Delta", "Alpha"]);
  assert.deepEqual(listCategory(index, { category: "base:frame", sort: "grade", desc: true })!.rows.map(r => r.key), view.rows.map(r => r.key).reverse());
  assert.deepEqual(listCategory(index, { category: "base:frame", sort: "name" })!.rows.map(r => r.name), ["Alpha", "Beta", "Delta", "Gamma"]);
  assert.deepEqual(listCategory(index, { category: "base:frame", filters: { grade: "D", tag: "common", cls: "mech" } })!.rows.map(r => r.name), ["Beta"]);
  assert.deepEqual(new Set(view.facets.map(f => f.name)), new Set(["grade", "tag", "cls"]));
  assert.deepEqual(view.facets.find(f => f.name === "grade")!.options.map(o => [o.value, o.count]), [["D", 2], ["B", 1], ["A", 1], ["S", 1]]);
  assert.equal(listCategory(index, { category: "missing" }), null);
});

test("10 搜尋名稱排名優先，別名、本文摘要與空查詢正確", () => {
  const index = buildWikiIndex([
    file({ id: "character/a", name: "Orion" }, "lore"),
    file({ id: "character/b", name: "Orion crew" }, "lore"),
    file({ id: "character/c", name: "The Orion" }, "lore"),
    file({ id: "character/d", name: "Captain", aka: "Orion" }, "lore"),
    file({ id: "character/orion", name: "Pilot" }, "lore"),
    file({ id: "character/f", name: "Scholar", tags: ["orion"] }, "lore"),
    file({ id: "character/g", name: "Witness", summary: "曾見 Orion" }, "lore"),
    file({ id: "character/h", name: "Archivist", body: `${"前".repeat(45)}Orion${"後".repeat(45)}` }, "lore"),
  ]);
  const hits = searchWiki(index, "ORION");
  assert.deepEqual(hits.map(h => h.name), ["Orion", "Orion crew", "The Orion", "Captain", "Pilot", "Scholar", "Witness", "Archivist"]);
  assert.equal(hits[3]?.field, "aka");
  assert.equal(hits.at(-1)?.field, "body");
  assert.equal(hits.at(-1)?.snippet, `…${"前".repeat(30)}Orion${"後".repeat(30)}…`);
  assert.equal(searchWiki(index, "orion", 2).length, 2);
  assert.deepEqual(searchWiki(index, "  "), []);
});

test("11 兩種勢力關係進矩陣且去重，首頁計數與壞引用一致", () => {
  const index = buildWikiIndex([
    file({ id: "faction/a", relations: { "faction/b": "hostile" } }), file({ id: "faction/b" }),
    file({ id: "faction/a", relations: [
      { id: "faction/b", type: "allied" }, { target: "faction/b", kind: "allied" },
      { target: "base:faction/a", rel: "hostile" },
    ], missing: Array.from({ length: 35 }, (_, i) => `place/missing-${i}`) }, "lore"),
    file({ id: "faction/b" }, "lore"),
    file({ id: "node/a" }, "base", "world/nodes/a.json"),
    file({ entries: [{}] }, "lore", "timeline.json"),
  ]);
  const relations = relationsView(index);
  assert.equal(relations.factions.length, 4);
  assert.deepEqual(relations.rels, ["allied", "hostile"]);
  assert.equal(relations.cells.length, 3);
  assert.ok(relations.cells.some(c => c.from === "base:faction/a" && c.to === "base:faction/b" && c.rel === "hostile" && c.source === "game"));
  assert.ok(relations.cells.some(c => c.from === "lore:faction/a" && c.to === "lore:faction/b" && c.rel === "allied" && c.source === "lore"));
  const home = homeView(index);
  assert.deepEqual(home.totals, { entries: 5, lore: 2, game: 2, ops: 1, timeline: 1, broken: 35 });
  assert.equal(home.totals.broken, [...index.entries.values()].flatMap(e => e.refs).filter(r => r.target === null).length);
  assert.equal(home.broken.length, 30);
  assert.deepEqual(home.groups.map(g => g.group), ["lore", "game", "ops"]);
});
