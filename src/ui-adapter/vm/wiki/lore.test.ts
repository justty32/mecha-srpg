import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildWikiIndex } from "./index.ts";
import { entryPage } from "./cards.ts";
import { listCategory } from "./list.ts";
import { relationsView } from "./relations.ts";
import { searchWiki } from "./search.ts";
import { timelineView } from "./timeline.ts";
import type { CardSection, EntryPage, RawFile } from "./types.ts";

const file = (data: Record<string, unknown>, folder: string): RawFile => ({
  pack: "lore", path: `${folder}/${String(data.id).split("/").at(-1)}.json`, data,
});
const common = { aka: [], summary: "測試概要", body: "## 記錄\n測試本文", tags: [], gameRefs: [] };
const dates = ["-8900", "-120", "2037", "2108-03", "約 2110", "不明"];
const fixtures: RawFile[] = [
  file({ ...common, id: "faction/harbor", name: "港盟", type: "大勢力", scale: "兩座港口", founded: "約 2037",
    hq: "北港", leaders: ["character/captain"], ideology: "守望", places: ["place/port"], mechSeries: ["海潮一型"],
    mercPolicy: { generosity: 4, reliability: 5, note: "按約付酬" },
    ancientMech: { name: "潮母", foundAt: "place/port", foundDate: "-120", pilot: "character/captain", gameRef: null, doctrine: "護航" },
    relations: [{ faction: "faction/forge", stance: "緊張", note: "航線爭議" }] }, "factions"),
  file({ ...common, id: "faction/forge", name: "爐城", type: "企業", scale: "一座工廠", founded: "2037", hq: "爐城",
    leaders: ["character/smith"], ideology: "鍛造", relations: [{ faction: "faction/harbor", stance: "同盟", note: "共同防守" }] }, "factions"),
  file({ ...common, id: "character/captain", name: "船長", born: "約 2037", died: "不明", faction: "faction/harbor",
    role: "領袖", kind: "human", mech: "潮母", events: ["event/founding"],
    relations: [{ character: "character/smith", relation: "師徒", note: "共同育成" }] }, "characters"),
  file({ ...common, id: "character/smith", name: "匠師", born: "育成", faction: "faction/forge", role: "工匠",
    events: [], relations: [] }, "characters"),
  file({ id: "event/founding", name: "建港", date: "2037", period: "era/old", summary: "建港概要", body: "建港本文",
    factions: ["faction/harbor"], characters: ["character/captain"], places: ["place/port"],
    consequences: ["航道開通", "港口結盟"], kind: "政治", tags: ["diplomacy"] }, "events"),
  file({ id: "event/voyage", name: "遠航", date: "2108-03", period: "era/new", summary: "出航", body: "航行本文",
    factions: ["faction/harbor"], characters: [], places: [], consequences: [], tags: [] }, "events"),
  file({ ...common, id: "place/port", name: "北港", region: "海岸", continent: "亞洲", world: "earth", kind: "港",
    status2108: "守住", factions: ["faction/harbor"] }, "places"),
  file({ id: "era/new", name: "新紀元", from: "2037", to: "現在", summary: "新時代", body: "新時代本文" }, "eras"),
  file({ id: "era/old", name: "先民紀元", from: "-8900", to: "2036", summary: "先民", body: "先民本文" }, "eras"),
  { pack: "lore", path: "timeline.json", data: { contract: "lore-timeline/1", entries: dates.map((date, i) => ({
    date, title: `紀事${i}`, summary: "年表摘要", era: i === 0 ? "era/new" : i === 5 ? "era/missing" : "era/old",
    ...(i === 2 ? { event: "event/founding" } : {}), factions: ["faction/harbor"], tags: [],
  })) } },
];

function section<T extends CardSection["t"]>(page: EntryPage | null, title: string, type: T): Extract<CardSection, { t: T }> {
  assert.ok(page);
  const found = page.sections.find(s => s.title === title && s.t === type);
  assert.ok(found, title);
  return found as Extract<CardSection, { t: T }>;
}

function realFiles(): RawFile[] {
  const files: RawFile[] = [];
  for (const pack of ["base", "lore"]) {
    const root = resolve(import.meta.dirname, "../../../../content", pack);
    if (!existsSync(root)) continue;
    const walk = (path: string): void => {
      for (const entry of readdirSync(resolve(root, path), { withFileTypes: true })) {
        const child = path ? `${path}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(child);
        else if (entry.name.endsWith(".json")) files.push({ pack, path: child, data: JSON.parse(readFileSync(resolve(root, child), "utf8")) });
      }
    };
    walk("");
  }
  return files;
}

test("lore 關係陣列保留 rel、note，勢力矩陣提供中文 label 與 tone", () => {
  const index = buildWikiIndex(fixtures);
  const ref = index.entries.get("lore:faction/harbor")!.refs.find(r => r.field === "relations[0].faction");
  assert.equal(ref?.target, "lore:faction/forge");
  assert.equal(ref?.rel, "緊張");
  assert.equal(ref?.note, "航線爭議");
  const character = index.entries.get("lore:character/captain")!.refs.find(r => r.field === "relations[0].character");
  assert.equal(character?.target, "lore:character/smith");
  assert.equal(character?.rel, "師徒");
  assert.equal(character?.note, "共同育成");
  assert.ok(relationsView(index).cells.some(c => c.from === "lore:faction/harbor" && c.to === "lore:faction/forge"
    && c.source === "lore" && c.label === "緊張" && c.tone === "tense" && c.note === "航線爭議"));
  for (const [rel, label, tone] of [["hostile", "敵對", "hostile"], ["neutral", "中立", "neutral"],
    ["allied", "同盟", "allied"], ["ally", "同盟", "allied"], ["friendly", "友好", "friendly"],
    ["tense", "緊張", "tense"], ["友好", "友好", "friendly"], ["特殊", "特殊", "other"]]) {
    const matrix = relationsView(buildWikiIndex([
      file({ id: "faction/a", relations: [{ target: "faction/b", rel }] }, "factions"),
      file({ id: "faction/b" }, "factions"),
    ]));
    assert.equal(matrix.cells[0]?.label, label);
    assert.equal(matrix.cells[0]?.tone, tone);
  }
});

test("event period 進面向與年表；負年、完整日期、自由年份與未知日期依序排序", () => {
  const index = buildWikiIndex(fixtures);
  assert.deepEqual(index.entries.get("lore:event/founding")?.facets.era, ["lore:era/old"]);
  assert.ok(listCategory(index, { category: "lore:event" })!.facets.find(f => f.name === "era")?.options.some(o => o.value === "lore:era/old"));
  const voyage = index.timeline.find(item => item.event?.target === "lore:event/voyage");
  assert.equal(voyage?.era?.target, "lore:era/new");
  const sorted = index.timeline.filter(item => item.title.startsWith("紀事"));
  assert.deepEqual(sorted.map(item => item.date), dates);
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i - 1]!.sortKey < sorted[i]!.sortKey);
  assert.equal(index.timeline.at(-1)?.date, "不明");
  assert.equal(index.timeline.filter(item => item.event?.target === "lore:event/founding").length, 1);
  const fallback = buildWikiIndex([fixtures[4]!, fixtures[8]!, { pack: "lore", path: "timeline.json", data: {
    entries: [{ date: "2037", event: "event/founding" }],
  } }]);
  assert.equal(fallback.timeline[0]?.era?.target, "lore:era/old");
});

test("era 段落依條目 from 排序，沒有 era 條目的段落最後", () => {
  const index = buildWikiIndex(fixtures);
  assert.equal(index.timeline[0]?.era?.target, "lore:era/new");
  const sections = timelineView(index, {}).sections;
  assert.deepEqual(sections.map(s => s.era?.raw), ["era/old", "era/new", "era/missing"]);
  assert.equal(sections[0]?.label, "先民紀元");
});

test("lore 概要與關係使用正式欄位，ancientMech 是 kv、後果為清單且已用欄位不重複", () => {
  const index = buildWikiIndex(fixtures);
  const page = entryPage(index, "lore:faction/harbor");
  const rows = section(page, "概要", "kv").rows;
  assert.deepEqual(rows.find(r => r.label === "類型")?.value, { t: "text", v: "大勢力" });
  assert.deepEqual(rows.find(r => r.label === "總部")?.value, { t: "text", v: "北港" });
  const leaders = rows.find(r => r.label === "領袖")?.value;
  assert.ok(leaders?.t === "list" && leaders.items[0]?.t === "ref");
  assert.equal(leaders.items[0].ref.target, "lore:character/captain");
  const ancient = rows.find(r => r.label === "藍本古代機")?.value;
  assert.ok(ancient?.t === "kv");
  assert.equal(ancient.rows.length, 6);
  assert.ok(ancient.rows.some(r => r.value.t === "ref" && r.value.ref.target === "lore:place/port"));
  const policy = rows.find(r => r.label === "對傭兵")?.value;
  assert.ok(policy?.t === "kv");
  assert.deepEqual(policy.rows.slice(0, 2), [
    { label: "大方度", value: { t: "text", v: "4／5" } }, { label: "守約度", value: { t: "text", v: "5／5" } },
  ]);
  const relations = section(page, "關係", "table");
  assert.deepEqual(relations.columns, ["對象", "關係", "備註"]);
  assert.ok(relations.rows[0]?.[0]?.t === "ref");
  assert.equal(relations.rows[0][0].ref.note, "航線爭議");
  assert.deepEqual(relations.rows[0][2], { t: "text", v: "航線爭議" });
  const raw = section(page, "其他原始資料", "raw");
  for (const field of ["類型", "規模", "成立", "總部", "領袖", "信條", "據點", "摹機系列", "對傭兵", "藍本古代機", "relations", "body", "gameRefs"]) {
    assert.ok(!raw.rows.some(r => r.label === field), field);
  }
  const event = entryPage(index, "lore:event/founding");
  assert.deepEqual(section(event, "後果", "list").items, [{ t: "text", v: "航道開通" }, { t: "text", v: "港口結盟" }]);
  assert.ok(!section(event, "其他原始資料", "raw").rows.some(r => ["consequences", "時代", "日期", "類型", "地點", "人物", "勢力"].includes(r.label)));
  for (const [key, expected] of [["character/captain", ["生", "歿", "所屬", "身分", "類型", "座機"]],
    ["place/port", ["地區", "大洲", "天體", "類型", "2108 現況", "勢力"]], ["era/old", ["起始", "結束"]]] as const) {
    const labels = section(entryPage(index, `lore:${key}`), "概要", "kv").rows.map(r => r.label);
    for (const label of expected) assert.ok(labels.includes(label), label);
  }
});

test("真實 frame 構型一層一列、九欄與 kv 抗性，整頁沒有交錯鍵值清單", () => {
  const index = buildWikiIndex(realFiles());
  const frame = [...index.entries.values()].find(e => e.pack === "base" && e.kind === "frame"
    && typeof (e.data as Record<string, unknown>).bodyPlan === "string");
  assert.ok(frame);
  const bodyKey = index.resolve((frame.data as { bodyPlan: string }).bodyPlan, frame.pack);
  assert.ok(bodyKey);
  const body = index.entries.get(bodyKey)!.data as { parts: { name: string; layers: unknown[] }[] };
  const page = entryPage(index, frame.key);
  const table = section(page, "部位與層", "table");
  assert.deepEqual(table.columns, ["部位", "暴露", "槽位", "功能", "層", "種類", "HP", "抗性", "備註"]);
  assert.equal(table.rows.length, body.parts.reduce((n, part) => n + part.layers.length, 0));
  let offset = 0;
  for (const part of body.parts) {
    for (let layer = 0; layer < part.layers.length; layer++) {
      const row = table.rows[offset++]!;
      assert.equal(row.length, 9);
      assert.deepEqual(row[0], { t: "text", v: layer === 0 ? part.name : "" });
      assert.equal(row[7]?.t, "kv");
    }
  }
  const keys = new Set<string>();
  const collect = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) { keys.add(key); collect(child); }
  };
  collect(frame.data); collect(body);
  // 舊形狀是偶數項 list，每個偶數索引都是原資料欄名 text，後接值；合法字串清單不以這些欄名配對。
  // kv 的 rows 本身不屬於舊形狀，但其中的值仍遞迴檢查，避免巢狀舊清單漏網。
  const check = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(check); return; }
    if (!value || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (node.t === "list" && Array.isArray(node.items) && node.items.length > 0 && node.items.length % 2 === 0) {
      const paired = node.items.every((item: unknown, i: number) => i % 2 !== 0 || (item !== null && typeof item === "object"
        && (item as { t?: string }).t === "text" && keys.has((item as { v: string }).v)));
      assert.equal(paired, false, "交錯鍵值清單應改成 kv");
    }
    Object.values(node).forEach(check);
  };
  assert.throws(() => check({ t: "list", items: [{ t: "text", v: "hp" }, { t: "num", v: 20 }] }), /交錯鍵值/);
  check(JSON.parse(JSON.stringify(page)));
});

test("真實 base 與可選 lore 整合：每條目可產卡並搜尋自己，game 前三分類固定", () => {
  const files = realFiles();
  assert.ok(files.some(f => f.pack === "base"));
  const index = buildWikiIndex(files);
  assert.ok(index.entries.size > 0);
  for (const entry of index.entries.values()) {
    assert.ok(entryPage(index, entry.key), entry.key);
    assert.ok(searchWiki(index, entry.name).some(hit => hit.key === entry.key), entry.key);
  }
  const game = index.categories.filter(c => c.group === "game");
  const expected = ["frame", "component", "ability"].filter(kind => game.some(c => c.kind === kind));
  assert.deepEqual(game.slice(0, expected.length).map(c => c.kind), expected);
  const names: Record<string, string> = { frame: "機體", component: "部件", ability: "能力", registries: "登記表", rules: "規則常數", base: "內容包" };
  for (const category of game) if (names[category.kind]) assert.equal(category.label, names[category.kind]);
});
