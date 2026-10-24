import type { EntryRef, EraSection, FacetOption, TimelineQuery, TimelineView, WikiIndex } from "./types.ts";

export function dateSortKey(date: unknown): string {
  const value = typeof date === "string" || typeof date === "number" ? String(date) : "";
  const exact = /^(-?\d{1,6})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/u.exec(value);
  const year = exact?.[1] ?? /(?<!\d)-?\d{1,4}(?!\d)/u.exec(value)?.[0];
  if (!year) return "2";
  const n = Number(year);
  return `${n < 0 ? "0" : "1"}${String(n < 0 ? 999999 + n : n).padStart(6, "0")}-${(exact?.[2] ?? "0").padStart(2, "0")}-${(exact?.[3] ?? "0").padStart(2, "0")}`;
}

export function timelineView(index: WikiIndex, q: TimelineQuery): TimelineView {
  const factions = new Map<string, FacetOption>();
  const eras = new Map<string, FacetOption>();
  const value = (ref: EntryRef): string => ref.target ?? ref.raw;
  const count = (options: Map<string, FacetOption>, refs: EntryRef[]): void => {
    const seen = new Set<string>();
    for (const ref of refs) {
      const key = value(ref);
      if (seen.has(key)) continue;
      seen.add(key);
      const option = options.get(key);
      if (option) option.count++;
      else options.set(key, { value: key, label: ref.label, count: 1 });
    }
  };
  for (const item of index.timeline) {
    count(factions, item.factions);
    if (item.era) count(eras, [item.era]);
  }
  const items = index.timeline.filter(item => (!q.faction || item.factions.some(ref => value(ref) === q.faction))
    && (!q.era || item.era !== null && value(item.era) === q.era)
    && (!q.tag || item.tags.includes(q.tag)));
  const sections = new Map<string | null, EraSection>();
  for (const item of items) {
    const key = item.era ? value(item.era) : null;
    const section = sections.get(key) ?? { era: item.era, label: item.era?.label ?? "未分時代", items: [] };
    section.items.push(item);
    sections.set(key, section);
  }
  const eraStart = (section: EraSection): string => {
    const entry = section.era?.target ? index.entries.get(section.era.target) : undefined;
    return entry?.kind === "era" ? `0${dateSortKey((entry.data as Record<string, unknown>).from)}` : "1";
  };
  // SPEC-GAP：total 是篩選後筆數；面向選項計整份年表，同起始日期的時代保留原順序。
  return { query: q, sections: [...sections.values()].sort((a, b) => eraStart(a).localeCompare(eraStart(b))), total: items.length,
    factions: [...factions.values()], eras: [...eras.values()] };
}
