import type { PlaceDef } from "../../../ops/state/types.ts";
/** 地點按原圖座標等比例縮放；各張圖各佔一個水平區帶。 */
export function layoutNodes(places: readonly PlaceDef[]): Map<string, { x: number; y: number }> {
  const points = new Map<string, { x: number; y: number }>();
  const maps = [...new Set(places.map(p => p.map))].sort();
  for (const [index, map] of maps.entries()) {
    const group = places.filter(p => p.map === map).sort((a, b) => a.id.localeCompare(b.id));
    const xs = group.map(p => p.at.x), ys = group.map(p => p.at.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const band = .88 / maps.length, width = band * .9, height = .88;
    const scale = Math.min(width / Math.max(1, maxX - minX), height / Math.max(1, maxY - minY));
    for (const p of group) points.set(p.id, {
      x: .06 + band * (index + .5) + (p.at.x - (minX + maxX) / 2) * scale,
      y: .5 + (p.at.y - (minY + maxY) / 2) * scale,
    });
  }
  return points;
}
