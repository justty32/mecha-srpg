import { apparentAge } from "../../../core/age.ts";
// 百科資料卡：只讀索引與 JSON，不依賴內容載入器或 DOM。
import { parseMarkdown } from "./markdown.ts";
import { fieldVisibility, visibilityOf } from "./visibility.ts";
import { CardBuilder, object, text, label } from "./card-builder.ts";
import type { EntryPage, WikiIndex } from "./types.ts";

function species(builder: CardBuilder): void {
  builder.summary(["family", "gradeRange"]);
  builder.table("baseAttrsByGrade", "各等級屬性");
  builder.table("pools", "資源池");
  builder.list("abilities", "能力");
  builder.expandBody();
}

function loreOverview(b: CardBuilder): void {
  const fields: Record<string, string[]> = {
    faction: ["type", "scale", "founded", "hq", "leaders", "ideology", "places", "mechSeries", "mercPolicy", "ancientMech"],
    character: ["born", "died", "faction", "role", "kind", "mech"],
    event: ["date", "period", "kind", "factions", "characters", "places"],
    place: ["region", "continent", "world", "kind", "status2108", "factions"],
    era: ["from", "to"],
  };
  const names: Record<string, string> = { kind: "類型", faction: "所屬", ...(b.entry.kind === "event" ? { places: "地點" } : {}) };
  // 可見度 rumor 的欄：標題加「（傳聞）」（engine-backlog 45；格式見 content/lore/README.md「可見度」）。
  for (const f of Object.keys(b.data)) if (fieldVisibility(b.data, f) === "rumor") names[f] = `${names[f] ?? label(f)}（傳聞）`;
  b.used.add("visibility"); b.used.add("fieldVisibility"); b.used.add("occurs");
  b.summary(fields[b.entry.kind] ?? [], names);
  b.summary(["era", "faction", "factions", "date", "place", "kind"]);
  const policy = b.overview.find(row => row.label === label("mercPolicy"));
  if (policy?.value.t === "kv") {
    for (const row of policy.value.rows) if ([label("generosity"), label("reliability")].includes(row.label) && row.value.t === "num") {
      row.value = text(`${row.value.v}／5`);
    }
  }
  if (b.entry.kind === "event") b.list("consequences", "後果");
  // secrets 到這裡只剩 rumor（hidden 已拿掉），呈現為傳聞清單。
  if (Array.isArray(b.data.secrets)) {
    b.used.add("secrets");
    const items = b.data.secrets.flatMap(raw => {
      const s = object(raw);
      return s && typeof s.text === "string" ? [text(typeof s.note === "string" ? `${s.text}（${s.note}）` : s.text)] : [];
    });
    if (items.length) b.sections.push({ t: "list", title: "傳聞", items });
  }
}

function game(builder: CardBuilder): void {
  const b = builder;
  switch (b.entry.kind) {
    case "frame":
      b.summary(["cls", "grade"]); b.expandBody();
      b.table("pools", "資源池"); b.list("innateAbilities", "固有能力"); b.kv("baseAttrs", "基礎屬性"); break;
    case "bodyplan": b.bodyParts(); b.summary(["symmetry"]); break;
    case "component":
      b.summary(["slot", "size", "mass", "hp", "origin"]); b.table("pools", "資源池");
      b.list("abilities", "能力"); b.list("onBroken", "損壞效果"); break;
    case "ability":
      b.summary(["mode", "accuracy"]); b.table("costs", "成本"); b.table("produces", "產出");
      b.kv("target", "射程與目標"); b.kv("range", "射程"); b.table("packets", "傷害包"); b.list("effects", "效果"); break;
    case "effect":
      b.summary(["scope"]); b.kv("clock", "時鐘"); b.kv("stack", "疊加規則");
      b.table("contribs", "修正"); b.kv("hooks", "觸發效果"); break;
    case "person": {
      const growth = object(object([...b.index.entries.values()].find(e => e.pack === b.entry.pack && e.path === "rules/cockpit.json")?.data)?.growth);
      if (b.data.kind === "human" && typeof b.data.age === "number" && growth && typeof growth.daysPerYear === "number"
        && typeof growth.driveHoursPerYear === "number" && typeof growth.agingRate === "number") {
        const age = apparentAge({ kind: "human", age: b.data.age, activeYears: typeof b.data.activeYears === "number" ? b.data.activeYears : 0 }, {}, 0,
          { daysPerYear: growth.daysPerYear, driveHoursPerYear: growth.driveHoursPerYear, agingRate: growth.agingRate });
        b.overview.push({ label: "年齡", value: text(`外貌 ${age} 歲（實齡 ${b.data.age}）`) });
        b.used.add("age");
      }
      b.list("abilities", "人物能力");
      b.summary(["kind"]); b.kv("attrs", "屬性"); b.table("pools", "資源池");
      b.list("traits", "特質"); b.list("perks", "天賦"); b.kv("will", "意志"); b.kv("growth", "成長"); break;
    }
    case "soultree": b.list("nodes", "天賦節點"); break;
    case "species": species(b); break;
    case "monster": {
      b.summary(["species", "grade"]);
      const raw = b.data.species;
      const target = typeof raw === "string" ? b.index.resolve(raw, b.entry.pack) : null;
      const entry = target ? b.index.entries.get(target) : undefined;
      if (entry) {
        const source = new CardBuilder(b.index, entry);
        species(source);
        b.sections.push({ t: "kv", title: "物種概要", rows: source.overview },
          ...source.sections.map(s => ({ ...s, title: `物種 · ${s.title}` })));
      }
      break;
    }
    case "terrain":
      b.summary(["glyph", "color", "height", "cover", "blocksLos"]); b.kv("moveCost", "移動成本");
      b.list("onEnter", "進入效果"); b.list("onTurnStart", "回合開始效果"); break;
    case "map": b.summary(["width", "height"]); b.kv("deployZones", "部署區"); break;
    case "scenario": b.summary(["map", "seed", "rounds"]); b.kv("slots", "參戰單位"); b.list("objectives", "目標"); break;
    case "faction": b.summary(["scale", "strategy", "sensing"]); break;
  }
  // 營運資料的未分類欄位仍由 raw 承接，避免未來 kind 遺失資料。
  if (b.entry.path.startsWith("world/")) b.summary(["kind", "family", "gradeRange", "faction", "owner", "node", "culture"]);
}

/** 從凍結的百科索引產生詳情卡；不修改索引與原始 JSON。 */
export function entryPage(index: WikiIndex, key: string): EntryPage | null {
  const entry = index.entries.get(key);
  if (!entry) return null;
  const b = new CardBuilder(index, entry);
  const category = index.categories.find(c => c.key === entry.category);
  const categoryLabel = category?.label ?? entry.category;
  b.summary(["nameEn", "etymology"]);   // 通用可選欄：有值才出列（engine-backlog 9）
  b.summary(["epithet", "title", "nickname", "aka", "names", "naming", "epithets"]);
  const lore = category?.group === "lore" || entry.pack === "lore";
  if (lore) {
    loreOverview(b);
    b.used.add("body");
    b.sections.push({ t: "md", title: "本文", blocks: parseMarkdown(entry.body, raw => b.ref(raw, "body")) });
  } else game(b);
  b.relations();
  b.list("gameRefs", "遊戲資料");
  const remaining = Object.fromEntries(Object.entries(b.data).filter(([field]) => !b.used.has(field)));
  b.sections.push({ t: "raw", title: "其他原始資料", rows: object(entry.data) ? b.rows(remaining) : b.rows(entry.data) });
  const backlinks: EntryPage["backlinks"] = [];
  for (const ref of index.backlinks.get(key) ?? []) {
    const source = index.entries.get(ref.from);
    if (!source) continue;
    let group = backlinks.find(g => g.category === source.category);
    if (!group) {
      group = { category: source.category, label: index.categories.find(c => c.key === source.category)?.label ?? source.category, refs: [] };
      backlinks.push(group);
    }
    group.refs.push(ref);
  }
  const badges = ["grade", "family", "cls", "kind", "epithet", "title", "nickname"].flatMap(field => {
    const value = b.data[field];
    return typeof value === "string" || typeof value === "number" ? [String(value)] : [];
  });
  if (lore && visibilityOf(b.data) === "rumor") badges.unshift("傳聞");
  // occurs: possible＝開局後可能發生、日期不定的事件（content/lore/README.md「events」）。
  if (lore && entry.kind === "event" && b.data.occurs === "possible") badges.unshift("可能發生");
  return {
    key, title: entry.name, subtitle: `${categoryLabel} · ${entry.id}`, badges: [...new Set(badges)],
    summary: entry.summary, aka: [...entry.aka],
    sections: [{ t: "kv", title: "概要", rows: b.overview }, ...b.sections], backlinks,
    breadcrumbs: [{ label: "百科" }, { label: categoryLabel, category: entry.category }, { label: entry.name }],
  };
}
