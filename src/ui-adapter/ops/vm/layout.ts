import type { NodeDef, RouteDef } from "../../../ops/state/types.ts";
/** SPEC-GAP：節點未提供座標（大地圖改方格後整檔換掉，見 specs/ops/world-grid/ui-contract.md）。
 *  暫行：依航線做 BFS 分層（起點＝id 最小的節點），層→x、層內依 id→y；月面另放右側帶。決定性、與載入順序無關。 */
export function layoutNodes(nodes: readonly NodeDef[], routes: readonly RouteDef[] = []): Map<string, { x: number; y: number }> {
  const points = new Map<string, { x: number; y: number }>();
  const bands = { earth: [0.06, 0.8], moon: [0.86, 0.94] } as const;
  for (const body of ["earth", "moon"] as const) {
    const group = nodes.filter(n => n.body === body).map(n => n.id).sort();
    if (!group.length) continue;
    const inGroup = new Set(group), adj = new Map<string, string[]>(group.map(id => [id, []]));
    for (const r of routes) if (inGroup.has(r.a) && inGroup.has(r.b)) { adj.get(r.a)!.push(r.b); adj.get(r.b)!.push(r.a); }
    const depth = new Map<string, number>();
    for (const root of group) {
      if (depth.has(root)) continue;
      // 不連通的分量接在已有層之後。
      const base = depth.size ? Math.max(...depth.values()) + 1 : 0;
      depth.set(root, base);
      const queue = [root];
      while (queue.length) {
        const id = queue.shift()!;
        for (const next of [...adj.get(id)!].sort()) if (!depth.has(next)) { depth.set(next, depth.get(id)! + 1); queue.push(next); }
      }
    }
    const layers = Math.max(...depth.values()) + 1, [x0, x1] = bands[body];
    for (let layer = 0; layer < layers; layer++) {
      const members = group.filter(id => depth.get(id) === layer);
      if (members.length > 11) throw new Error("世界圖單層節點超過排版容量");
      members.forEach((id, i) => points.set(id, {
        x: layers === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * layer / (layers - 1),
        y: members.length === 1 ? 0.5 : 0.06 + 0.88 * i / (members.length - 1),
      }));
    }
  }
  return points;
}
