import type { BrokenRef, CategoryGroup, HomeView, WikiIndex } from "./types.ts";

export function homeView(index: WikiIndex): HomeView {
  const labels: [CategoryGroup, string][] = [["lore", "世界觀"], ["game", "戰鬥內容"], ["ops", "營運資料"], ["other", "其他內容"]];
  const groups = labels.map(([group, label]) => ({ group, label, categories: index.categories.filter(c => c.group === group) }))
    .filter(g => g.categories.length > 0);
  const broken: BrokenRef[] = [];
  let count = 0;
  for (const entry of index.entries.values()) for (const ref of entry.refs) {
    if (ref.target !== null) continue;
    count++;
    if (broken.length < 30) broken.push({ from: entry.key, fromName: entry.name, ref });
  }
  const total = (group: CategoryGroup): number => index.categories.filter(c => c.group === group).reduce((sum, c) => sum + c.count, 0);
  return { groups, broken, totals: { entries: index.entries.size, lore: total("lore"), game: total("game"),
    ops: total("ops"), timeline: index.timeline.length, broken: count } };
}
