import { parseMarkdown, plainText } from "./markdown.ts";
import { visibilityOf } from "./visibility.ts";
import type { SearchField, SearchHit, WikiIndex } from "./types.ts";

export function searchWiki(index: WikiIndex, q: string, limit = 50): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (!needle || limit <= 0) return [];
  const hits: SearchHit[] = [];
  for (const entry of index.entries.values()) {
    const name = entry.name.toLowerCase();
    const data = entry.data as Record<string, unknown>;
    const candidates: { field: SearchField; text: string; score: number }[] = [
      { field: "name", text: entry.name, score: name === needle ? 800 : name.startsWith(needle) ? 700 : 600 },
      ...entry.aka.map(text => ({ field: "aka" as const, text, score: 500 })),
      { field: "nameEn", text: typeof data.nameEn === "string" ? data.nameEn : "", score: 450 },
      { field: "id", text: entry.id, score: 400 },
      ...entry.tags.map(text => ({ field: "tag" as const, text, score: 300 })),
      { field: "summary", text: entry.summary, score: 200 },
      { field: "etymology", text: typeof data.etymology === "string" ? data.etymology : "", score: 150 },
    ];
    let match = candidates.find(c => c.text.toLowerCase().includes(needle));
    if (!match && entry.body) {
      const text = plainText(parseMarkdown(entry.body));
      if (text.toLowerCase().includes(needle)) match = { field: "body", text, score: 100 };
    }
    if (!match) continue;
    const at = match.text.toLowerCase().indexOf(needle);
    const start = Math.max(0, at - 30), end = Math.min(match.text.length, at + needle.length + 30);
    hits.push({ key: entry.key, name: entry.name, category: entry.category, score: match.score, field: match.field,
      snippet: `${start ? "…" : ""}${match.text.slice(start, end)}${end < match.text.length ? "…" : ""}`,
      ...(entry.pack === "lore" ? { visibility: visibilityOf(data),
        ...(entry.kind === "event" && data.occurs === "possible" ? { occurs: "possible" } : {}) } : {}) });
  }
  return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "zh-Hant") || a.key.localeCompare(b.key))
    .slice(0, Math.max(0, Math.floor(limit)));
}
