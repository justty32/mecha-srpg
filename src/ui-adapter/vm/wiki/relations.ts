import { categoryGroup } from "./kinds.ts";
import type { RelationCell, RelationsView, WikiIndex } from "./types.ts";

export function relationLabel(rel: string): string {
  const labels: Record<string, string> = { hostile: "敵對", neutral: "中立", allied: "同盟", ally: "同盟", friendly: "友好", tense: "緊張" };
  return labels[rel] ?? rel;
}

function relationTone(label: string): RelationCell["tone"] {
  const tones: Record<string, RelationCell["tone"]> = { 同盟: "allied", 友好: "friendly", 中立: "neutral", 緊張: "tense", 敵對: "hostile" };
  return tones[label] ?? "other";
}

export function relationsView(index: WikiIndex): RelationsView {
  const factions = [...index.entries.values()].filter(e => e.kind === "faction")
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant") || a.key.localeCompare(b.key))
    .map(e => ({ key: e.key, name: e.name, group: categoryGroup(e.pack, e.path) }));
  const factionKeys = new Set(factions.map(f => f.key));
  const cells: RelationCell[] = [];
  const seen = new Set<string>();
  for (const faction of factions) {
    const entry = index.entries.get(faction.key)!;
    for (const ref of entry.refs) {
      if (!/^relations(?:\[|\.|$)/u.test(ref.field) || !ref.target || !ref.rel || !factionKeys.has(ref.target)) continue;
      const source = entry.pack === "lore" ? "lore" : "game";
      const key = JSON.stringify([entry.key, ref.target, ref.rel, source, ref.note]);
      if (seen.has(key)) continue;
      seen.add(key);
      const label = relationLabel(ref.rel);
      cells.push({ from: entry.key, to: ref.target, rel: ref.rel, source, label, tone: relationTone(label),
        ...(ref.note !== undefined ? { note: ref.note } : {}) });
    }
  }
  return { factions, cells, rels: [...new Set(cells.map(c => c.rel))].sort() };
}
