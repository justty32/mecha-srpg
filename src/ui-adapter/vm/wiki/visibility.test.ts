import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildWikiIndex } from "./index.ts";
import { entryPage } from "./cards.ts";
import { searchWiki } from "./search.ts";
import { timelineView } from "./timeline.ts";
import { fieldVisibility, publicFiles, visibilityOf } from "./visibility.ts";
import type { RawFile } from "./types.ts";

const lore = (path: string, data: Record<string, unknown>): RawFile => ({ pack: "lore", path, data });
const common = { aka: [], tags: [], gameRefs: [] };
const fixtures: RawFile[] = [
  lore("factions/cult.json", { ...common, id: "faction/cult", name: "裂教", summary: "教派", body: "拜[迦梨之洞](place/hole)與[[event/hidden-rite|祕儀]]。",
    ancientMech: { name: "迦梨", foundAt: "place/hole", foundDate: "2096", pilot: "character/prophet", gameRef: null, doctrine: "只拜", visibility: "rumor" },
    relations: [{ faction: "faction/inner", stance: "同盟", note: "暗盟" }, { faction: "faction/town", stance: "敵對", note: "公開的仇", visibility: "hidden" }],
    secrets: [{ visibility: "hidden", text: "暗號甲：迦梨真的醒著" }, { visibility: "rumor", text: "清空月面就能結束蝕潮" }] }),
  lore("factions/inner.json", { ...common, id: "faction/inner", name: "內圈", summary: "暗號乙", body: "暗號乙本文", visibility: "hidden", relations: [] }),
  lore("factions/town.json", { ...common, id: "faction/town", name: "城邦", summary: "城", body: "城", relations: [] }),
  lore("characters/prophet.json", { ...common, id: "character/prophet", name: "先知", summary: "走出來的人", body: "本文",
    faction: "faction/cult", mech: "迦梨（他說的）", role: "暗號丙", events: ["event/hidden-rite", "event/open"],
    fieldVisibility: { mech: "rumor", role: "hidden" }, relations: [] }),
  lore("places/hole.json", { ...common, id: "place/hole", name: "洞", summary: "洞", body: "洞", factions: ["faction/cult", "faction/inner"] }),
  lore("events/hidden-rite.json", { id: "event/hidden-rite", name: "暗號丁", date: "2097", summary: "祕", body: "祕", factions: [], characters: [], places: [],
    consequences: [], tags: [], visibility: "hidden" }),
  lore("events/open.json", { id: "event/open", name: "開門", date: "2096", summary: "開", body: "開", factions: ["faction/cult"], characters: [], places: [],
    consequences: [], tags: [] }),
  lore("timeline.json", { contract: "lore-timeline/1", entries: [
    { date: "2096", title: "開門", summary: "開", era: "era/x", event: "event/open", factions: ["faction/cult", "faction/inner"], tags: [] },
    { date: "2097", title: "暗號戊", summary: "祕", era: "era/x", event: "event/hidden-rite", factions: [], tags: [] },
    { date: "2098", title: "暗號己", summary: "祕", era: "era/x", factions: [], tags: [], visibility: "hidden" },
    { date: "2108-03", title: "傳聞", summary: "傳", era: "era/x", factions: [], tags: ["rumor"], visibility: "rumor" },
  ] }),
  { pack: "base", path: "frames/x.json", data: { id: "frame/x", name: "機", visibility: "hidden" } },
];
const SECRETS = ["暗號甲", "暗號乙", "暗號丙", "暗號丁", "暗號戊", "暗號己", "內圈", "公開的仇"];

test("可見度讀法：沒標是 public；物件看自己的 visibility，純值欄看 fieldVisibility", () => {
  assert.equal(visibilityOf({}), "public");
  assert.equal(visibilityOf({ visibility: "rumor" }), "rumor");
  const cult = fixtures[0]!.data;
  assert.equal(fieldVisibility(cult, "ancientMech"), "rumor");
  assert.equal(fieldVisibility(fixtures[3]!.data, "mech"), "rumor");
  assert.equal(fieldVisibility(fixtures[3]!.data, "faction"), "public");
});

test("publicFiles：hidden 整筆、整物件、整欄、引用與本文連結都拿掉；rumor 保留；不改輸入；base 不動", () => {
  const before = JSON.stringify(fixtures);
  const out = publicFiles(fixtures);
  assert.equal(JSON.stringify(fixtures), before);
  const by = (p: string): Record<string, unknown> => out.find(f => f.path === p)!.data as Record<string, unknown>;
  assert.equal(out.some(f => f.path === "factions/inner.json" || f.path === "events/hidden-rite.json"), false);
  assert.ok(out.some(f => f.pack === "base"), "base 不套 lore 標記");
  const cult = by("factions/cult.json");
  assert.deepEqual(cult.relations, []);
  assert.deepEqual(cult.secrets, [{ visibility: "rumor", text: "清空月面就能結束蝕潮" }]);
  assert.equal((cult.ancientMech as Record<string, unknown>).visibility, "rumor");
  assert.equal(cult.body, "拜[迦梨之洞](place/hole)與祕儀。");
  const prophet = by("characters/prophet.json");
  assert.equal("role" in prophet, false);
  assert.deepEqual(prophet.fieldVisibility, { mech: "rumor" });
  assert.deepEqual(prophet.events, ["event/open"]);
  assert.deepEqual(by("places/hole.json").factions, ["faction/cult"]);
  const rows = by("timeline.json").entries as Record<string, unknown>[];
  assert.deepEqual(rows.map(r => r.title), ["開門", "傳聞"]);
  assert.deepEqual(rows[0]!.factions, ["faction/cult"]);
});

test("百科索引、搜尋、詳情卡、年表、反向引用都看不到 hidden", () => {
  const index = buildWikiIndex(fixtures);
  assert.equal(index.entries.has("lore:faction/inner"), false);
  assert.equal(index.entries.has("lore:event/hidden-rite"), false);
  const pages = [...index.entries.keys()].map(k => entryPage(index, k));
  const dump = JSON.stringify({ pages, timeline: timelineView(index, {}), backlinks: [...index.backlinks], issues: index.issues });
  for (const s of SECRETS) {
    assert.equal(dump.includes(s), false, `洩漏：${s}`);
    assert.deepEqual(searchWiki(index, s), [], `搜尋得到：${s}`);
  }
  assert.ok(dump.includes("清空月面就能結束蝕潮"), "rumor 仍顯示");
});

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

test("真實 lore：每一則 hidden 真相都不出現在百科任何畫面資料裡（含塞勒涅三層知情）", () => {
  const files = realFiles();
  const hidden: string[] = [];
  const collect = (v: unknown): void => {
    if (Array.isArray(v)) { v.forEach(collect); return; }
    if (typeof v !== "object" || v === null) return;
    const o = v as Record<string, unknown>;
    if (o.visibility === "hidden") hidden.push(...[o.text, o.summary, o.title].filter((x): x is string => typeof x === "string" && x.length >= 8));
    Object.values(o).forEach(collect);
  };
  files.filter(f => f.pack === "lore").forEach(f => collect(f.data));
  const selene = files.find(f => f.path === "factions/selene.json")!.data as { secrets?: { date?: string; visibility: string }[] };
  assert.deepEqual(selene.secrets?.filter(s => s.visibility === "hidden").map(s => s.date), ["2086", "2095", "2097"]);
  assert.ok(hidden.length >= 5, `hidden 條數 ${hidden.length}`);
  const index = buildWikiIndex(files);
  const loreKeys = [...index.entries.keys()].filter(k => k.startsWith("lore:"));
  const dump = JSON.stringify({ pages: loreKeys.map(k => entryPage(index, k)), timeline: timelineView(index, {}) });
  for (const text of hidden) {
    assert.equal(dump.includes(text), false, `洩漏：${text}`);
    assert.deepEqual(searchWiki(index, text.slice(0, 12)), [], `搜尋得到：${text}`);
  }
  // 反證：同一份資料不經過濾就看得到，證明上面不是恆真。
  const raw = JSON.stringify(files.filter(f => f.pack === "lore").map(f => f.data));
  assert.ok(hidden.every(t => raw.includes(t)));
});

test("詳情卡把 rumor 呈現為傳聞：整筆加徽章、欄名與關係詞加（傳聞）、secrets 剩下的列成傳聞清單、visibility 不當資料列", () => {
  const index = buildWikiIndex(fixtures);
  const cult = entryPage(index, "lore:faction/cult")!;
  const overview = cult.sections.find(s => s.title === "概要" && s.t === "kv");
  assert.ok(overview?.t === "kv" && overview.rows.some(r => r.label === "藍本古代機（傳聞）"));
  const rumors = cult.sections.find(s => s.title === "傳聞");
  assert.deepEqual(rumors, { t: "list", title: "傳聞", items: [{ t: "text", v: "清空月面就能結束蝕潮" }] });
  const dump = JSON.stringify(cult);
  assert.equal(dump.includes("\"visibility\""), false);
  assert.equal(dump.includes("可見度"), false);
  const prophet = entryPage(index, "lore:character/prophet")!;
  const pov = prophet.sections.find(s => s.title === "概要");
  assert.ok(pov?.t === "kv" && pov.rows.some(r => r.label === "座機（傳聞）"));
  const rumorFixtures = [...fixtures, lore("characters/ghost.json", { ...common, id: "character/ghost", name: "幽影", summary: "只在傳聞裡", body: "本文",
    faction: null, role: "測試員", events: [], visibility: "rumor",
    relations: [{ character: "character/prophet", relation: "秘密", note: "據說", visibility: "rumor" }] })];
  const ghost = entryPage(buildWikiIndex(rumorFixtures), "lore:character/ghost")!;
  assert.equal(ghost.badges[0], "傳聞");
  const rel = ghost.sections.find(s => s.title === "關係");
  assert.ok(rel?.t === "table" && JSON.stringify(rel.rows[0]).includes("（傳聞）"));
});

test("occurs: possible 的事件不進年表（含 timeline.json 引用與未列入的事件檔），詳情卡標「可能發生」", () => {
  const evt = (name: string, extra: Record<string, unknown>): RawFile => lore(`events/${name}.json`, { id: `event/${name}`, name, date: "2110", period: "era/x",
    summary: "s", body: "b", factions: [], characters: [], places: [], consequences: [], tags: [], ...extra });
  const index = buildWikiIndex([
    evt("maybe-listed", { occurs: "possible" }), evt("maybe-unlisted", { occurs: "possible" }), evt("sure", {}),
    lore("timeline.json", { contract: "lore-timeline/1", entries: [
      { date: "2110", title: "可能列入", summary: "s", era: "era/x", event: "event/maybe-listed", factions: [], tags: ["rumor"] },
      { date: "2111", title: "確定", summary: "s", era: "era/x", event: "event/sure", factions: [], tags: [] },
    ] }),
  ]);
  const titles = timelineView(index, {}).sections.flatMap(s => s.items.map(i => i.title));
  assert.deepEqual(titles, ["確定"]);
  assert.ok(entryPage(index, "lore:event/maybe-listed")!.badges.includes("可能發生"));
  assert.ok(!entryPage(index, "lore:event/sure")!.badges.includes("可能發生"));
  assert.ok(!JSON.stringify(entryPage(index, "lore:event/maybe-listed")).includes("possible"), "occurs 不當原始資料列顯示");
});
