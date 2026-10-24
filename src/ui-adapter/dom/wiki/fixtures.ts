import type { Category, EntryPage, EntryRef, HomeView, ListView, MdBlock, RelationsView, SearchHit, TimelineView, WikiView } from "../../vm/wiki/types.ts";
import type { WikiApi } from "./mount.ts";

export const href = (view: WikiView): string => `#/wiki?view=${encodeURIComponent(JSON.stringify(view))}`;
export const goodRef: EntryRef = { raw: "faction/alpha", target: "base:faction/alpha", label: "甲勢力", field: "faction" };
export const badRef: EntryRef = { raw: "faction/missing", target: null, label: "失落勢力", field: "relations" };
const text = (v: string) => ({ t: "text" as const, v });

export function markdownFixture(): MdBlock[] {
  return [
    { t: "h", level: 2, c: [text("標題")] },
    { t: "p", c: [text("<script>alert(1)</script>"), { t: "strong", c: [text("粗體")] }, { t: "em", c: [text("斜體")] }, { t: "code", v: "inline" }, { t: "br" }, { t: "link", ref: goodRef, c: [text("內連")] }, { t: "link", ref: badRef, c: [text("壞連")] }, { t: "extlink", href: "https://example.com", c: [text("外連")] }] },
    { t: "ul", items: [[{ t: "p", c: [text("外層")] }, { t: "ul", items: [[{ t: "p", c: [text("內層")] }]] }]] },
    { t: "ol", items: [[{ t: "p", c: [text("第一")] }]] },
    { t: "table", head: [[text("左")], [text("中")], [text("右")]], align: ["left", "center", "right"], rows: [[[text("一")], [text("二")], [text("三")]]] },
    { t: "quote", c: [{ t: "p", c: [text("引用")] }] },
    { t: "pre", v: "const x = '<script>';" }, { t: "hr" },
  ];
}

export function wikiFixture() {
  const categories: Category[] = [
    { key: "base:frame", pack: "base", kind: "frame", group: "game", label: "機甲", count: 2 },
    { key: "base:faction", pack: "base", kind: "faction", group: "game", label: "勢力", count: 2 },
    { key: "base:node", pack: "base", kind: "node", group: "ops", label: "地點", count: 1 },
  ];
  const home: HomeView = {
    groups: [{ group: "game", label: "遊戲資料", categories: categories.slice(0, 2) }, { group: "ops", label: "營運資料", categories: categories.slice(2) }],
    totals: { entries: 5, lore: 0, game: 4, ops: 1, timeline: 2, broken: 1 },
    broken: [{ from: "base:frame/one", fromName: "一號機", ref: badRef }],
  };
  const list: ListView = {
    category: categories[0]!, query: { category: categories[0]!.key },
    rows: [
      { key: "base:frame/one", name: "一號機", summary: "偵察", grade: "D", tags: ["敏捷"], facets: { grade: ["D"] } },
      { key: "base:frame/two", name: "二號機", summary: "重裝", grade: "C", tags: [], facets: { grade: ["C"] } },
    ],
    facets: [{ name: "grade", label: "等級", options: [{ value: "D", label: "D", count: 1 }, { value: "C", label: "C", count: 1 }] }],
  };
  const entry: EntryPage = {
    key: "base:frame/one", title: "一號機", subtitle: "機甲 · frame/one", summary: "偵察用機甲", aka: ["斥候"], badges: ["D", "輕型"],
    breadcrumbs: [{ label: "百科" }, { label: "機甲", category: "base:frame" }],
    sections: [
      { t: "kv", title: "概要", rows: [{ label: "勢力", value: { t: "ref", ref: goodRef } }, { label: "未知", value: { t: "ref", ref: badRef } }] },
      { t: "table", title: "部位", columns: ["部位", "耐久"], rows: [[text("頭部"), { t: "num", v: 12, unit: "HP" }]] },
      { t: "list", title: "能力", items: [text("偵查"), { t: "kv", rows: [{ label: "標籤", value: { t: "tags", items: ["追蹤"] } }] }] },
      { t: "md", title: "本文", blocks: markdownFixture() },
      { t: "raw", title: "其他資料", rows: [{ label: "擴充", value: { t: "list", items: [text("保留欄位")] } }] },
    ],
    backlinks: [{ category: "base:faction", label: "勢力", refs: [{ from: goodRef.target!, fromName: goodRef.label, field: "members", rel: "allied" }] }],
  };
  const hits: SearchHit[] = [{ key: entry.key, name: entry.title, category: "機甲", score: 10, field: "name", snippet: entry.summary }];
  const timeline: TimelineView = {
    query: {}, total: 2,
    factions: [{ value: goodRef.target!, label: goodRef.label, count: 2 }],
    eras: [{ value: "lore:era/early", label: "初期", count: 1 }],
    sections: [
      { era: { raw: "era/early", target: "lore:era/early", label: "初期", field: "era" }, label: "初期", items: [{ index: 0, date: "2061", sortKey: "002061", title: "出發", summary: "前往月球", event: goodRef, era: null, factions: [goodRef], tags: [] }] },
      { era: null, label: "未分時代", items: [{ index: 1, date: "2108", sortKey: "002108", title: "重逢", summary: "故人重逢", event: null, era: null, factions: [badRef], tags: [] }] },
    ],
  };
  const relations: RelationsView = {
    factions: [{ key: goodRef.target!, name: goodRef.label, group: "game" }, { key: "lore:faction/beta", name: "乙勢力", group: "lore" }],
    cells: [
      { from: goodRef.target!, to: "lore:faction/beta", rel: "hostile", label: "敵對", tone: "hostile", note: "邊境衝突", source: "game" },
      { from: "lore:faction/beta", to: goodRef.target!, rel: "allied", label: "同盟", tone: "allied", source: "lore" },
      { from: goodRef.target!, to: goodRef.target!, rel: "neutral", label: "中立", tone: "neutral", source: "game" },
      { from: "lore:faction/beta", to: "lore:faction/beta", rel: "rival", label: "競爭", tone: "other", source: "lore" },
    ], rels: ["hostile", "allied", "neutral", "rival"],
  };
  const api: WikiApi = {
    home: () => home,
    list: query => ({ ...list, query }),
    search: () => hits,
    entry: () => entry,
    timeline: query => ({ ...timeline, query }),
    relations: () => relations,
  };
  return { api, categories, home, list, entry, hits, timeline, relations };
}

export const keyHints = [{ label: "搜尋", keys: ["/"] }, { label: "說明", keys: ["?"] }];
