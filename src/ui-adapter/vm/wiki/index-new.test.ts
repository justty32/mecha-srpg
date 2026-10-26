import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { buildWikiIndex } from "./index.ts";
import { searchWiki } from "./search.ts";
import { listCategory } from "./list.ts";
import { entryPage } from "./cards.ts";
import type { RawFile } from "./types.ts";

const file = (data: unknown, pack = "base", path = "world/fixtures/entry.json"): RawFile => ({ pack, path, data });

test("U02 列表與搜尋傳遞傳聞／可能發生狀態，年表繼承事件或列本身的傳聞標記", () => {
  const index = buildWikiIndex([
    file({ id: "event/rumor", name: "流傳事件", date: "2108", visibility: "rumor" }, "lore"),
    file({ id: "event/possible", name: "未定事件", date: "2109", visibility: "rumor", occurs: "possible" }, "lore"),
    file({ id: "event/public", name: "公開事件", date: "2107" }, "lore"),
    file({ id: "event/hidden", name: "隱藏事件", date: "2108", visibility: "hidden" }, "lore"),
    file({ entries: [
      { date: "2108", title: "流傳年表", event: "event/rumor" },
      { date: "2109", title: "未定年表", event: "event/possible" },
      { date: "2110", title: "獨立傳聞", visibility: "rumor" },
      { date: "2111", title: "獨立未定", occurs: "possible" },
    ] }, "lore", "timeline.json"),
  ]);
  const rows = listCategory(index, { category: "lore:event" })!.rows;
  const hits = searchWiki(index, "事件");
  for (const items of [rows, hits]) {
    assert.equal(items.find(row => row.key === "lore:event/rumor")?.visibility, "rumor");
    assert.equal(items.find(row => row.key === "lore:event/possible")?.occurs, "possible");
    assert.equal(items.find(row => row.key === "lore:event/possible")?.visibility, "rumor");
    assert.equal(items.find(row => row.key === "lore:event/public")?.visibility, "public");
    assert.ok(!items.some(row => row.key === "lore:event/hidden"));
  }
  assert.ok(entryPage(index, "lore:event/possible")!.badges.includes("可能發生"));
  assert.ok(entryPage(index, "lore:event/rumor")!.badges.includes("傳聞"));
  assert.equal(index.timeline.find(item => item.title === "流傳年表")?.visibility, "rumor");
  assert.equal(index.timeline.find(item => item.title === "獨立傳聞")?.visibility, "rumor");
  assert.ok(!index.timeline.some(item => item.title.includes("未定")));
});

test("W06 英文原名與詞源可搜尋，保留大小寫容錯、片段及既有名稱優先序", () => {
  const index = buildWikiIndex([
    file({ id: "ability/breath", name: "借我一息", nameEn: "A Breathing Space", etymology: "取自古老的喘息祈願" }),
    file({ id: "ability/named", name: "A Breathing Space" }),
    file({ id: "ability/malformed", name: "容錯", nameEn: 123, etymology: {} }),
    file({ id: "event/secret", name: "秘聞", nameEn: "Classified Breath", etymology: "隱藏語源", fieldVisibility: { nameEn: "hidden", etymology: "hidden" } }, "lore"),
  ]);
  const english = searchWiki(index, "  a BREATHING space  ");
  assert.deepEqual(english.map(hit => hit.key), ["base:ability/named", "base:ability/breath"]);
  assert.equal(english[1]?.field, "nameEn");
  assert.equal(english[1]?.snippet, "A Breathing Space");
  const etymology = searchWiki(index, "喘息祈願");
  assert.equal(etymology[0]?.key, "base:ability/breath");
  assert.equal(etymology[0]?.field, "etymology");
  assert.match(etymology[0]!.snippet, /喘息祈願/u);
  assert.deepEqual(searchWiki(index, "Classified Breath"), []);
  assert.deepEqual(searchWiki(index, "隱藏語源"), []);
});

test("W04 六類枚舉的篩選選項與列表欄值顯示中文，篩選與原資料保留英文值", () => {
  const cases: [string, string, string[], string[]][] = [
    ["cls", "類別", ["ancient", "bio", "mechanical"], ["古代機", "生物系", "機械系"]],
    ["origin", "來源", ["ancient", "bio", "mechanical"], ["古代機", "生物系", "機械系"]],
    ["mode", "發動方式", ["activated", "reaction"], ["主動", "反應"]],
    ["slot", "安裝槽位", ["armorMount", "backMount", "cockpit", "restraint", "sensorMount", "soulCore", "systemMount", "weaponMount"],
      ["裝甲掛點", "背部掛點", "座艙", "拘束具", "感測器掛點", "機魂核心", "系統掛點", "武器掛點"]],
    ["scope", "作用對象", ["layer", "mech", "part", "person"], ["層", "機體", "部位", "人物"]],
    ["symmetry", "對稱方式", ["asymmetric", "bilateral"], ["不對稱", "左右對稱"]],
  ];
  for (const [field, label, values, labels] of cases) {
    const source = values.map((value, i) => ({ id: `component/test-${i}`, name: "mechanical", [field]: value, tags: ["mechanical"] }));
    const index = buildWikiIndex([...source.map(data => file(data)), file({ id: "component/future", [field]: "future" })]);
    const view = listCategory(index, { category: "base:component" })!;
    const facet = view.facets.find(f => f.name === field)!;
    assert.equal(facet.label, label);
    for (const [i, value] of values.entries()) {
      assert.equal(facet.options.find(option => option.value === value)?.label, labels[i]);
      const filtered = listCategory(index, { category: "base:component", filters: { [field]: value } })!;
      assert.equal(filtered.rows.length, 1);
      assert.deepEqual(filtered.rows[0]!.facets[field], [value]);
      assert.deepEqual(filtered.rows[0]!.displayFacets, [{ label, values: [labels[i]] }]);
      assert.equal(filtered.rows[0]!.name, "mechanical");
      assert.deepEqual(filtered.rows[0]!.tags, ["mechanical"]);
      assert.equal(source[i]![field], value);
    }
    assert.equal(facet.options.find(option => option.value === "future")?.label, "future");
  }
});

test("W02 十一種分類有中文標題與固定排序，未知種類仍保留原名", () => {
  const kinds = ["actor", "affinity", "forces", "lane", "lineage", "model", "operation", "regions", "treaty", "wterrain", "file"];
  const labels = ["營運角色", "親疏規則", "部隊編制", "航線", "機系譜系", "機型", "軍事行動", "區域表", "條約", "世界地形", "其他資料"];
  const index = buildWikiIndex([...kinds].reverse().map(kind => file({ id: `${kind}/test` })));
  assert.deepEqual(index.categories.map(c => c.kind), kinds);
  assert.deepEqual(index.categories.map(c => c.label), labels);
  assert.equal(buildWikiIndex([file({ id: "unknown/test" })]).categories[0]?.label, "unknown");
  assert.equal(buildWikiIndex([file({}, "lore", "glossary.json")]).categories[0]?.label, "其他資料");
});

test("W05 機型由機體中文名命名，引用標籤同步，明確命名與缺引用保留", () => {
  const index = buildWikiIndex([
    file({ id: "model/a", frame: "frame/a" }),
    file({ id: "model/named", frame: "frame/a", name: "自訂機型" }),
    file({ id: "model/titled", frame: "frame/a", title: "標題機型" }),
    file({ id: "model/missing", frame: "frame/missing" }),
    file({ id: "model/cycle", frame: "model/cycle" }),
    file({ id: "frame/a", name: "赤鉚砧" }, "base", "frames/a.json"),
    file({ id: "market/a", stock: ["model/a"] }),
  ]);
  assert.equal(index.entries.get("base:model/a")?.name, "赤鉚砧（機型）");
  assert.equal(index.entries.get("base:model/a")?.id, "model/a");
  assert.equal(index.entries.get("base:market/a")?.refs[0]?.label, "赤鉚砧（機型）");
  assert.equal(index.entries.get("base:model/named")?.name, "自訂機型");
  assert.equal(index.entries.get("base:model/titled")?.name, "標題機型");
  assert.equal(index.entries.get("base:model/missing")?.name, "missing");
  assert.equal(index.entries.get("base:model/cycle")?.name, "cycle");
  assert.equal(listCategory(index, { category: "base:model" })!.rows.find(row => row.key === "base:model/a")?.id, "model/a");
});

test("W05 真實機型全數取對應機體標題，原 ID 保留供辨識", () => {
  const load = (dir: string): RawFile[] => readdirSync(`content/base/${dir}`).filter(p => p.endsWith(".json"))
    .map(p => file(JSON.parse(readFileSync(`content/base/${dir}/${p}`, "utf8")), "base", `${dir}/${p}`));
  const index = buildWikiIndex([...load("world/models"), ...load("frames")]);
  const models = [...index.entries.values()].filter(e => e.kind === "model");
  assert.ok(models.length > 0);
  for (const model of models) {
    const data = model.data as { frame: string };
    assert.equal(model.name, `${index.entries.get(`base:${data.frame}`)!.name}（機型）`, model.id);
    assert.equal(model.key, `base:${model.id}`);
  }
});
