import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildWikiIndex } from "./index.ts";
import { entryPage } from "./cards.ts";
import type { CardSection, EntryPage, RawFile } from "./types.ts";

const file = (data: unknown, pack = "base", path = "fixtures/test.json"): RawFile => ({ pack, path, data });
const real = (path: string): RawFile => file(JSON.parse(readFileSync(`content/base/${path}`, "utf8")), "base", path);
function section<T extends CardSection["t"]>(page: EntryPage, title: string, type: T): Extract<CardSection, { t: T }> {
  const found = page.sections.find(s => s.title === title && s.t === type);
  assert.ok(found, title);
  return found as Extract<CardSection, { t: T }>;
}

test("W01 物種與怪獸共享生態、捕獲、AI 策略，保留原始資料與索引", () => {
  const index = buildWikiIndex([
    real("species/sluice-mother.json"), real("monsters/sluice-mother-a.json"),
    file({ id: "species/lantern-keel", name: "燈脊" }),
    file({ id: "aiprofile/kx-sluice-brood", name: "閘母護巢" }),
    file({ id: "ability/restrain", name: "拘束" }), file({ id: "frame/bio-sluice-mother", name: "閘母機" }),
  ]);
  const before = JSON.stringify([...index.entries]);
  for (const [key, prefix, overview] of [
    ["species/sluice-mother", "", "概要"], ["monster/sluice-mother-a", "物種 · ", "物種概要"],
  ]) {
    const page = entryPage(index, `base:${key}`)!;
    const ecology = section(page, `${prefix}生態行為`, "kv");
    assert.deepEqual(ecology.rows.find(r => r.label === "攻擊預兆")?.value, { t: "text", v: "有攻擊預兆" });
    const spawn = ecology.rows.find(r => r.label === "繁殖")?.value;
    assert.ok(spawn?.t === "kv");
    assert.deepEqual(spawn.rows.find(r => r.label === "間隔回合")?.value, { t: "num", v: 4 });
    assert.deepEqual(spawn.rows.find(r => r.label === "上限")?.value, { t: "num", v: 2 });
    const child = spawn.rows.find(r => r.label === "子代物種")?.value;
    assert.ok(child?.t === "ref" && child.ref.target === "base:species/lantern-keel");
    assert.deepEqual(spawn.rows.find(r => r.label === "子代存續")?.value, { t: "text", v: "隨母體死亡" });
    const capture = section(page, `${prefix}捕獲條件`, "kv");
    assert.deepEqual(capture.rows.find(r => r.label === "須破壞的功能")?.value,
      { t: "list", items: [{ t: "text", v: "移動器官" }, { t: "text", v: "繁殖器官" }] });
    for (const label of ["捕獲能力", "對應機體"]) assert.equal(capture.rows.find(r => r.label === label)?.value.t, "ref");
    const ai = section(page, overview!, "kv").rows.find(r => r.label === "AI 策略")?.value;
    assert.ok(ai?.t === "ref" && ai.ref.target === "base:aiprofile/kx-sluice-brood");
    section(page, "其他原始資料", "raw");
  }
  assert.equal(JSON.stringify([...index.entries]), before);
});

test("W01 怪獸繼承蛻變目標、觸發條件與期間效果；缺物種不拋錯", () => {
  const index = buildWikiIndex([real("species/hound.json"),
    file({ id: "monster/hound", species: "species/hound" }),
    file({ id: "monster/missing", species: "species/missing" }),
    file({ id: "species/bulwark", name: "壁獸" }), file({ id: "effect/kx-molting", name: "蛻變中" }),
  ]);
  const page = entryPage(index, "base:monster/hound")!;
  const molt = section(page, "物種 · 生態行為", "kv").rows.find(r => r.label === "蛻變")?.value;
  assert.ok(molt?.t === "kv");
  assert.ok(molt.rows.some(r => r.value.t === "ref" && r.value.ref.target === "base:species/bulwark"));
  assert.match(JSON.stringify(molt), /molt-ready/);
  assert.match(JSON.stringify(molt), /base:effect\/kx-molting/);
  assert.doesNotThrow(() => entryPage(index, "base:monster/missing"));
});

test("W03 部件專區呈現修正、附加層、共鳴與負擔，未知資料仍在 raw", () => {
  const index = buildWikiIndex([file({ id: "component/test", burden: 3,
    attrMods: [{ attr: "accuracy", op: "add", value: 5 }], poolMods: [{ pool: "heat", max: 12, regen: 2 }],
    layersAdd: [{ part: "torso", insertAt: 0, layer: { type: "armor", hp: 30, resist: { kinetic: 0.5 } } }],
    resonance: { beliefs: ["守護"], threshold: 2, deeds: ["救援"] }, futureData: 77,
  })]);
  const page = entryPage(index, "base:component/test")!;
  assert.deepEqual(section(page, "概要", "kv").rows.find(r => r.label === "負擔")?.value, { t: "num", v: 3 });
  assert.match(JSON.stringify(section(page, "屬性修正", "table")), /accuracy/);
  assert.match(JSON.stringify(section(page, "資源池修正", "table")), /12/);
  assert.match(JSON.stringify(section(page, "附加層", "table")), /30/);
  assert.match(JSON.stringify(section(page, "共鳴條件", "kv")), /守護/);
  assert.deepEqual(section(page, "其他原始資料", "raw").rows.find(r => r.label === "futureData")?.value, { t: "num", v: 77 });
});

test("W03 真實機型的機體與製造勢力是連結，前置機型及解鎖條件可見", () => {
  const index = buildWikiIndex([real("world/models/anvil-crimson-rivet.json"),
    file({ id: "frame/anvil-crimson-rivet", name: "赤鉚" }), file({ id: "faction/anvil-hunters", name: "鐵砧獵團" }),
    file({ id: "model/anvil-ii" }),
  ]);
  const page = entryPage(index, "base:model/anvil-crimson-rivet")!;
  const overview = section(page, "概要", "kv");
  for (const label of ["對應機體", "製造勢力"]) assert.equal(overview.rows.find(r => r.label === label)?.value.t, "ref");
  assert.deepEqual(overview.rows.find(r => r.label === "價階")?.value, { t: "text", v: "B" });
  assert.deepEqual(overview.rows.find(r => r.label === "造價")?.value, { t: "num", v: 40 });
  assert.ok(overview.rows.some(r => r.label === "出口政策"));
  assert.equal(section(page, "前置機型", "list").items[0]?.t, "ref");
  assert.match(JSON.stringify(section(page, "解鎖條件", "kv")), /"v":0/);
  section(page, "其他原始資料", "raw");
});

test("W03 天象週期、湧現條件、潮級改變、效果與曆法朔望可見", () => {
  const index = buildWikiIndex([real("world/omens/perigee.json"), real("world/omens/grand-syzygy.json"),
    real("world/calendar.json"), file({ id: "omen/effectful", effects: [{ kind: "test", amount: 2 }] }),
  ]);
  const perigee = entryPage(index, "base:omen/perigee")!;
  assert.deepEqual(section(perigee, "週期", "kv").rows.find(r => r.label === "週期（蝕月）")?.value, { t: "num", v: 7.5 });
  assert.deepEqual(section(perigee, "概要", "kv").rows.find(r => r.label === "漲潮日潮級增減")?.value, { t: "num", v: 1 });
  const grand = entryPage(index, "base:omen/grand-syzygy")!;
  assert.deepEqual(section(grand, "概要", "kv").rows.find(r => r.label === "漲潮日潮級設定")?.value, { t: "num", v: 4 });
  assert.match(JSON.stringify(section(grand, "觸發條件", "kv")), /base:omen\/perigee/);
  assert.equal(section(grand, "指定日期", "table").rows.length, 1);
  assert.match(JSON.stringify(section(entryPage(index, "base:omen/effectful")!, "效果", "list")), /"v":2/);
  const calendar = entryPage(index, "base:calendar/tide")!;
  assert.deepEqual(section(calendar, "概要", "kv").rows.find(r => r.label === "每蝕月日數")?.value, { t: "num", v: 28 });
  assert.deepEqual(section(calendar, "朔望漲潮日", "list").items, [{ t: "num", v: 1 }, { t: "num", v: 15 }]);
  assert.deepEqual(section(calendar, "小潮日", "list").items, [{ t: "num", v: 7 }, { t: "num", v: 21 }]);
  section(calendar, "其他原始資料", "raw");
});

test("W04 指定枚舉依欄位轉中文，機體及人物徽章同步轉譯", () => {
  const cases: [string, string, string, string, string][] = [
    ...["cls", "origin"].flatMap(field => [
      [field === "cls" ? "frame" : "component", field, field === "cls" ? "機體類型" : "來源", "ancient", "古代機"],
      [field === "cls" ? "frame" : "component", field, field === "cls" ? "機體類型" : "來源", "bio", "生物系"],
      [field === "cls" ? "frame" : "component", field, field === "cls" ? "機體類型" : "來源", "mechanical", "衍型機"],
    ] as [string, string, string, string, string][]),
    ["ability", "mode", "模式", "activated", "主動"], ["ability", "mode", "模式", "reaction", "反應"],
    ...Object.entries({ layer: "層", mech: "機體", part: "部位", person: "人物" }).map(([raw, name]) =>
      ["effect", "scope", "作用範圍", raw, name] as [string, string, string, string, string]),
    ["bodyplan", "symmetry", "對稱性", "asymmetric", "非對稱"], ["bodyplan", "symmetry", "對稱性", "bilateral", "左右對稱"],
    ["person", "kind", "種類", "human", "人類"], ["person", "kind", "種類", "soul", "機魂"],
  ];
  for (const [kind, field, label, raw, translated] of cases) {
    const index = buildWikiIndex([file({ id: `${kind}/test`, [field]: raw, nameEn: raw, note: raw, nested: { note: raw } })]);
    const page = entryPage(index, `base:${kind}/test`)!;
    const overview = section(page, "概要", "kv");
    assert.deepEqual(overview.rows.find(r => r.label === label)?.value, { t: "text", v: translated }, `${kind}.${field}=${raw}`);
    assert.deepEqual(overview.rows.find(r => r.label === "英文原名")?.value, { t: "text", v: raw });
    assert.deepEqual(section(page, "其他原始資料", "raw").rows.find(r => r.label === "備註")?.value, { t: "text", v: raw });
    if (["cls", "kind"].includes(field)) assert.ok(page.badges.includes(translated));
  }
});

test("W04 八種槽位含構型內槽位轉譯；lore 人物與未知值、普通文字各守情境", () => {
  const slots = { weaponMount: "武器掛架", restraint: "拘束具", cockpit: "座艙", soulCore: "機魂核心",
    armorMount: "裝甲掛架", sensorMount: "感測器掛架", backMount: "背部掛架", systemMount: "系統掛架" };
  for (const [slot, name] of Object.entries(slots)) {
    const index = buildWikiIndex([file({ id: "component/test", slot }),
      file({ id: "bodyplan/test", parts: [{ id: "core", name: "核心", slots: [{ id: "test", type: slot, size: 1 }], layers: [] }] }),
    ]);
    assert.deepEqual(section(entryPage(index, "base:component/test")!, "概要", "kv").rows.find(r => r.label === "槽位")?.value,
      { t: "text", v: name });
    const body = section(entryPage(index, "base:bodyplan/test")!, "部位與層", "table");
    assert.match(JSON.stringify(body.rows[0]?.[2]), new RegExp(name));
    assert.ok(!JSON.stringify(body.rows[0]?.[2]).includes(`"v":"${slot}"`));
  }
  const index = buildWikiIndex([
    file({ id: "character/test", kind: "soul", body: "ancient human soul", title: "human" }, "lore"),
    file({ id: "event/test", kind: "human" }, "lore"), file({ id: "frame/future", cls: "future-class" }),
  ]);
  const character = entryPage(index, "lore:character/test")!;
  assert.ok(character.badges.includes("機魂"));
  assert.ok(character.badges.includes("human")); // 稱號是普通文字。
  assert.match(JSON.stringify(section(character, "本文", "md")), /ancient human soul/);
  assert.ok(entryPage(index, "lore:event/test")!.badges.includes("human"));
  assert.ok(entryPage(index, "base:frame/future")!.badges.includes("future-class"));
});
