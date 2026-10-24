import { facetLabel, GRADE_ORDER } from "./kinds.ts";
import type { FacetOption, ListQuery, ListView, WikiEntry, WikiIndex } from "./types.ts";

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
      else valuesMap.set(value, { value, label: index.entries.get(value)?.name ?? value, count: 1 });
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
        ...(e.facets.grade?.[0] ? { grade: e.facets.grade[0] } : {}) })),
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
