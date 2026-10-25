import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { entryPage } from "./cards.ts";
import type { CardSection, CardValue, EntryPage, WikiEntry, WikiIndex } from "./types.ts";

test("人物百科卡以開局年資顯示外貌與實齡", () => {
  const p = entry("person/older", { kind: "human", age: 35, activeYears: 16 });
  const rules = entry("file/rules/cockpit", JSON.parse(readFileSync("content/base/rules/cockpit.json", "utf8")), "base", "rules/cockpit.json");
  assert.match(JSON.stringify(entryPage(fakeIndex([p, rules]), p.key)), /外貌 23 歲（實齡 35）/);
});

function entry(id: string, data: unknown = {}, pack = "base", path = `${id}.json`): WikiEntry {
  const record = data !== null && typeof data === "object" ? data as Record<string, unknown> : {};
  const kind = id.split("/")[0]!;
  return {
    key: `${pack}:${id}`, pack, id, kind, category: `${pack}:${kind}`,
    name: typeof record.name === "string" ? record.name : id,
    aka: [], summary: typeof record.summary === "string" ? record.summary : "",
    body: typeof record.body === "string" ? record.body : "", tags: [], facets: {}, refs: [], path, data,
  };
}

function fakeIndex(entries: WikiEntry[]): WikiIndex {
  const map = new Map(entries.map(e => [e.key, e]));
  const names: Record<string, string> = { frame: "機甲", person: "人物", bodyplan: "構型", faction: "勢力" };
  return {
    entries: map, categories: [...new Map(entries.map(e => [e.category, {
      key: e.category, pack: e.pack, kind: e.kind, group: e.pack === "lore" ? "lore" as const : "game" as const,
      label: names[e.kind] ?? e.kind, count: entries.filter(other => other.category === e.category).length,
    }])).values()], backlinks: new Map(), timeline: [], issues: [],
    resolve(raw, fromPack) {
      if (!/^(?:[a-z][a-z0-9-]*:)?[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9._-]*$/u.test(raw)) return undefined;
      if (raw.includes(":")) return map.has(raw) ? raw : null;
      const local = `${fromPack}:${raw}`;
      return map.has(local) ? local : entries.find(e => e.id === raw)?.key ?? null;
    },
  };
}

function page(index: WikiIndex, key: string): EntryPage {
  const value = entryPage(index, key);
  assert.ok(value);
  return value;
}

function section<T extends CardSection["t"]>(p: EntryPage, title: string, type: T): Extract<CardSection, { t: T }> {
  const result = p.sections.find(s => s.title === title && s.t === type);
  assert.ok(result, `${title} (${type})`);
  return result as Extract<CardSection, { t: T }>;
}

function values(value: CardValue): CardValue[] {
  return [value, ...(value.t === "list" ? value.items.flatMap(values)
    : value.t === "kv" ? value.rows.flatMap(row => values(row.value)) : [])];
}

function sectionValues(s: CardSection): CardValue[] {
  if (s.t === "md") return [];
  if (s.t === "list") return s.items.flatMap(values);
  if (s.t === "table") return s.rows.flat().flatMap(values);
  return s.rows.flatMap(r => values(r.value));
}

const pool = { id: "ap", name: "行動點", min: 0, max: 9, initial: 9, regen: 9, bands: [] };
const body = entry("bodyplan/test", {
  parts: [{ id: "core", name: "核心", functions: ["core"], seats: [{ id: "pilot", accepts: ["pilot"] }],
    layers: [{ type: "armor", hp: 20 }, { type: "organ", hp: 10, structural: true }] }],
});

test("未知 key 回 null；每頁 raw 排除頂層 id/name 並保存未知欄位與引用", () => {
  const target = entry("effect/test", { id: "effect/test", name: "效果" });
  const unknown = entry("future/test", {
    id: "future/test", name: "未來資料", added: { numeric: 7, list: ["effect/test", "effect/missing"],
      keyed: { "effect/test": { ratio: 0.5 } }, empty: {}, enabled: false },
  });
  const index = fakeIndex([unknown, target, entry("future/empty", null), entry("future/array", [7, "effect/test"])]);
  assert.equal(entryPage(index, "base:missing/nope"), null);
  for (const e of index.entries.values()) {
    const raw = section(page(index, e.key), "其他原始資料", "raw");
    assert.ok(raw.rows.every(r => r.label !== "id" && r.label !== "name"));
  }
  const raw = section(page(index, unknown.key), "其他原始資料", "raw");
  const added = raw.rows.find(r => r.label === "added")?.value;
  assert.ok(added?.t === "kv");
  assert.deepEqual(added.rows.find(r => r.label === "numeric")?.value, { t: "num", v: 7 });
  const refs = sectionValues(raw).filter(v => v.t === "ref").map(v => v.ref);
  assert.ok(refs.some(r => r.target === target.key && r.field === "added.list[0]"));
  assert.ok(refs.some(r => r.target === null && r.raw === "effect/missing"));
  assert.ok(refs.some(r => r.target === target.key && r.field === "added.keyed.effect/test"));
});

test("frame 概要、構型部位層、資源池與固有能力", () => {
  const frame = entry("frame/test", { cls: "ancient", grade: "A", bodyPlan: body.id,
    pools: [pool], innateAbilities: ["ability/test"], baseAttrs: { initiative: 6 } });
  const ability = entry("ability/test");
  const index = fakeIndex([frame, body, ability]);
  const before = JSON.stringify([...index.entries]);
  const p = page(index, frame.key);
  const overview = section(p, "概要", "kv");
  assert.deepEqual(overview.rows.find(r => r.label === "等級")?.value, { t: "text", v: "A" });
  assert.deepEqual(overview.rows.find(r => r.label === "機體類型")?.value, { t: "text", v: "ancient" });
  const parts = section(p, "部位與層", "table");
  assert.equal(parts.rows.length, 2);
  assert.ok(sectionValues(parts).some(v => v.t === "num" && v.v === 20));
  assert.ok(sectionValues(parts).some(v => v.t === "text" && v.v === "器官"));
  assert.equal(section(p, "座位", "table").rows.length, 1);
  assert.ok(sectionValues(section(p, "資源池", "table")).some(v => v.t === "num" && v.v === 9));
  assert.deepEqual(section(p, "固有能力", "list").items, [{ t: "ref", ref: {
    raw: ability.id, target: ability.key, label: ability.name, field: "innateAbilities[0]",
  } }]);
  assert.deepEqual(p.breadcrumbs, [{ label: "百科" }, { label: "機甲", category: frame.category }, { label: frame.name }]);
  assert.equal(JSON.stringify([...index.entries]), before);
});

test("缺少構型保留 target null 引用", () => {
  const frame = entry("frame/broken", { bodyPlan: "bodyplan/absent" });
  const p = page(fakeIndex([frame]), frame.key);
  const refs = sectionValues(section(p, "概要", "kv")).filter(v => v.t === "ref");
  assert.equal(refs.length, 1);
  assert.equal(refs[0]!.ref.target, null);
  assert.equal(refs[0]!.ref.raw, "bodyplan/absent");
});

test("ability 成本、產出、射程、傷害包與新增包欄位", () => {
  const ability = entry("ability/test", { mode: "activated", costs: [{ pool: "ap", amount: 2 }],
    produces: [{ pool: "heat", amount: 15 }], target: { kind: "unit", range: { min: 1, max: 6 } },
    packets: [{ type: "thermal", amount: 21, future: { bonus: 4 } }], effects: ["effect/missing"] });
  const p = page(fakeIndex([ability]), ability.key);
  assert.ok(sectionValues(section(p, "成本", "table")).some(v => v.t === "num" && v.v === 2));
  assert.ok(sectionValues(section(p, "產出", "table")).some(v => v.t === "num" && v.v === 15));
  const range = section(p, "射程與目標", "kv").rows.find(r => r.label === "range")?.value;
  assert.ok(range?.t === "kv");
  assert.deepEqual(range.rows.find(r => r.label === "上限")?.value, { t: "num", v: 6 });
  const packets = section(p, "傷害包", "table");
  assert.ok(packets.columns.includes("future"));
  assert.ok(sectionValues(packets).some(v => v.t === "num" && v.v === 21));
  assert.ok(sectionValues(packets).some(v => v.t === "num" && v.v === 4));
});

test("species 與 monster 展開族、等級範圍與二名稱號", () => {
  const species = entry("species/test", { family: "beast", gradeRange: ["C", "B"], bodyPlan: body.id,
    baseAttrsByGrade: { C: { initiative: 7 } }, pools: [pool] });
  const monster = entry("monster/test", { species: species.id, grade: "B", epithet: "孤潮" });
  const index = fakeIndex([species, monster, body]);
  const p = page(index, monster.key);
  assert.ok(sectionValues(section(p, "物種概要", "kv")).some(v => v.t === "text" && v.v === "beast"));
  assert.ok(sectionValues(section(p, "物種概要", "kv")).some(v => v.t === "text" && v.v === "C"));
  assert.ok(p.badges.includes("孤潮"));
  assert.deepEqual(section(p, "概要", "kv").rows.find(r => r.label === "二名／稱號")?.value, { t: "text", v: "孤潮" });
  assert.equal(section(p, "物種 · 部位與層", "table").rows.length, 2);
  assert.ok(sectionValues(section(page(index, species.key), "各等級屬性", "table")).some(v => v.t === "num" && v.v === 7));
});

test("person 屬性、資源池與 growth.tree 引用", () => {
  const tree = entry("soultree/test");
  const person = entry("person/test", { kind: "soul", attrs: { accuracy: 55 }, pools: [pool],
    traits: [], perks: [], will: { beliefs: ["protect"] }, growth: { tree: tree.id, companionshipRate: 1.5 } });
  const p = page(fakeIndex([person, tree]), person.key);
  assert.deepEqual(section(p, "屬性", "kv").rows[0], { label: "命中修正", value: { t: "num", v: 55 } });
  assert.equal(section(p, "資源池", "table").rows.length, 1);
  const growth = section(p, "成長", "kv").rows.find(r => r.label === "tree")?.value;
  assert.ok(growth?.t === "ref");
  assert.equal(growth.ref.target, tree.key);
  assert.equal(growth.ref.field, "growth.tree");
});

test("faction 關係表每列的引用帶 rel", () => {
  const faction = entry("faction/test", { relations: { "faction/other": "hostile", "faction/absent": "neutral" } });
  const p = page(fakeIndex([faction, entry("faction/other")]), faction.key);
  const relations = section(p, "關係", "table");
  assert.equal(relations.rows.length, 2);
  assert.deepEqual(relations.rows.map(row => row[0]?.t === "ref" ? row[0].ref.rel : null), ["hostile", "neutral"]);
  assert.equal(relations.rows[1]![0]?.t === "ref" ? relations.rows[1]![0].ref.target : "bad", null);
});

test("lore 本文、object/array 關係與 gameRefs", () => {
  const other = entry("faction/other", { name: "故事勢力" }, "lore");
  const frame = entry("frame/test");
  for (const relations of [{ "faction/other": "ally" }, [{ id: "faction/other", type: "ally" }],
    [{ target: "faction/other", kind: "ally" }], [{ target: "faction/other", rel: "ally" }]]) {
    const lore = entry("character/test", { body: "故事中的 [[faction/other]]。", relations,
      era: "era/absent", date: "2108", aka: ["別稱"], gameRefs: [frame.key] }, "lore");
    const p = page(fakeIndex([lore, other, frame]), lore.key);
    assert.ok(section(p, "本文", "md").blocks.length > 0);
    const target = section(p, "關係", "table").rows[0]![0];
    assert.ok(target?.t === "ref");
    assert.equal(target.ref.target, other.key);
    assert.equal(target.ref.rel, "ally");
    const gameRef = section(p, "遊戲資料", "list").items[0];
    assert.ok(gameRef?.t === "ref");
    assert.equal(gameRef.ref.target, frame.key);
    assert.ok(sectionValues(section(p, "概要", "kv")).some(v => v.t === "ref" && v.ref.raw === "era/absent"));
    assert.ok(!section(p, "其他原始資料", "raw").rows.some(r => r.label === "body"));
  }
});

test("backlinks 依來源分類分組且使用中文分類名", () => {
  const target = entry("effect/test");
  const frame = entry("frame/test");
  const person = entry("person/test");
  const index = fakeIndex([target, frame, person]);
  const refs = [{ from: frame.key, fromName: frame.name, field: "a" },
    { from: person.key, fromName: person.name, field: "b", rel: "trait" },
    { from: frame.key, fromName: frame.name, field: "c" }];
  index.backlinks.set(target.key, refs);
  const p = page(index, target.key);
  assert.deepEqual(p.backlinks, [
    { category: frame.category, label: "機甲", refs: [refs[0], refs[2]] },
    { category: person.category, label: "人物", refs: [refs[1]] },
  ]);
});

test("content/base 每個真實 JSON 都能產生非空資料卡", () => {
  const root = resolve(import.meta.dirname, "../../../../content/base");
  function walk(path: string): string[] {
    return readdirSync(resolve(root, path), { withFileTypes: true }).flatMap(file => {
      const next = path ? `${path}/${file.name}` : file.name;
      return file.isDirectory() ? walk(next) : file.name.endsWith(".json") ? [next] : [];
    });
  }
  const files = walk("");
  const entries = files.map(path => {
    const data: unknown = JSON.parse(readFileSync(resolve(root, path), "utf8"));
    const record = data !== null && typeof data === "object" ? data as Record<string, unknown> : {};
    const id = typeof record.id === "string" ? record.id : `file/${path.replace(/\.json$/u, "")}`;
    return entry(id, data, "base", path);
  });
  const index = fakeIndex(entries);
  for (const e of entries) {
    assert.doesNotThrow(() => {
      const p = page(index, e.key);
      assert.ok(p.sections.length > 0, e.path);
      assert.ok(p.sections.some(s => s.t === "raw"), e.path);
    }, e.path);
  }
});
