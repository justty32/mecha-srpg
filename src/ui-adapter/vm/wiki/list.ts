import { facetLabel, GRADE_ORDER } from "./kinds.ts";
import { visibilityOf } from "./visibility.ts";
import type { FacetOption, ListQuery, ListView, WikiEntry, WikiIndex } from "./types.ts";

// 列表用的欄位對照；詳情卡由另一條線維護，合併時可再統一。
const CLASS_LABELS: Record<string, string> = { ancient: "古代機", bio: "生物系", mechanical: "機械系" };
const ENUM_LABELS: Record<string, Record<string, string>> = {
  cls: CLASS_LABELS, origin: CLASS_LABELS,
  mode: { activated: "主動", reaction: "反應" },
  slot: { armorMount: "裝甲掛點", backMount: "背部掛點", cockpit: "座艙", restraint: "拘束具",
    sensorMount: "感測器掛點", soulCore: "機魂核心", systemMount: "系統掛點", weaponMount: "武器掛點" },
  scope: { layer: "層", mech: "機體", part: "部位", person: "人物" },
  symmetry: { asymmetric: "不對稱", bilateral: "左右對稱" },
};
const enumLabel = (field: string, value: string): string => {
  const labels = Object.hasOwn(ENUM_LABELS, field) ? ENUM_LABELS[field]! : {};
  return Object.hasOwn(labels, value) ? labels[value]! : value;
};

export function listCategory(index: WikiIndex, q: ListQuery): ListView | null {
  const category = index.categories.find(c => c.key === q.category);
  if (!category) return null;
  const entries = [...index.entries.values()].filter(e => e.category === q.category);
  const options = new Map<string, Map<string, FacetOption>>();
  for (const entry of entries) for (const [name, values] of Object.entries(entry.facets)) {
    const valuesMap = options.get(name) ?? new Map<string, FacetOption>();
    for (const value of new Set(values)) {
      const option = valuesMap.get(value);
      if (option) option.count++;
      else valuesMap.set(value, { value, label: index.entries.get(value)?.name ?? enumLabel(name, value), count: 1 });
    }
    options.set(name, valuesMap);
  }
  const rank = (entry: WikiEntry): number => {
    const ranks = (entry.facets.grade ?? []).map(g => GRADE_ORDER.indexOf(g)).filter(i => i >= 0);
    return ranks.length ? Math.min(...ranks) : GRADE_ORDER.length;
  };
  const compare = (a: WikiEntry, b: WikiEntry): number => {
    const primary = q.sort === "grade" ? rank(a) - rank(b) : q.sort === "id" ? a.id.localeCompare(b.id) : 0;
    return (primary || a.name.localeCompare(b.name, "zh-Hant") || a.key.localeCompare(b.key)) * (q.desc ? -1 : 1);
  };
  return {
    category, query: q,
    rows: entries.filter(e => Object.entries(q.filters ?? {}).every(([name, value]) => !value || e.facets[name]?.includes(value)))
      .sort(compare).map(e => ({ key: e.key, name: e.name, summary: e.summary, tags: e.tags, facets: e.facets,
        ...(e.kind === "model" ? { id: e.id } : {}),
        displayFacets: Object.keys(ENUM_LABELS).flatMap(field => e.facets[field]?.length
          ? [{ label: facetLabel(field), values: e.facets[field]!.map(value => enumLabel(field, value)) }] : []),
        ...(e.facets.grade?.[0] ? { grade: e.facets.grade[0] } : {}),
        ...(e.pack === "lore" ? { visibility: visibilityOf(e.data),
          ...((e.data as Record<string, unknown>).occurs === "possible" && e.kind === "event" ? { occurs: "possible" } : {}) } : {}) })),
    // SPEC-GAP：面向選項以整個分類計數，篩選後仍可改選其他值。
    facets: [...options].map(([name, values]) => ({ name, label: facetLabel(name),
      options: [...values.values()].sort((a, b) => {
        if (name === "grade") {
          const aRank = GRADE_ORDER.indexOf(a.value), bRank = GRADE_ORDER.indexOf(b.value);
          const diff = (aRank < 0 ? GRADE_ORDER.length : aRank) - (bRank < 0 ? GRADE_ORDER.length : bRank);
          if (diff) return diff;
        }
        return a.label.localeCompare(b.label, "zh-Hant") || a.value.localeCompare(b.value);
      }) })),
  };
}
