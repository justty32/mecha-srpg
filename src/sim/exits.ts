import type { Cell, MapDef } from "../core/types-def.ts";

type Edge = "left" | "right" | "top" | "bottom";
const EDGES: Edge[] = ["left", "right", "top", "bottom"];

export function edgeCells(width: number, height: number, edge: Edge): Cell[] {
  if (edge === "left" || edge === "right")
    return Array.from({ length: height }, (_, y) => ({ x: edge === "left" ? 0 : width - 1, y }));
  return Array.from({ length: width }, (_, x) => ({ x, y: edge === "top" ? 0 : height - 1 }));
}

export function materializeExits(map: MapDef): MapDef["exitsBySlot"] {
  const result: NonNullable<MapDef["exitsBySlot"]> = {};
  for (const slot of [...new Set([...Object.keys(map.exitsBySlot ?? {}), ...Object.keys(map.deployZones)])].sort()) {
    if (Object.hasOwn(map.exitsBySlot ?? {}, slot)) {
      result[slot] = structuredClone(map.exitsBySlot![slot]!);
      continue;
    }
    const zone = map.deployZones[slot];
    if (!zone?.length) continue;
    const distances = [
      zone.reduce((sum, c) => sum + c.x, 0),
      zone.reduce((sum, c) => sum + map.width - 1 - c.x, 0),
      zone.reduce((sum, c) => sum + c.y, 0),
      zone.reduce((sum, c) => sum + map.height - 1 - c.y, 0),
    ];
    // indexOf 保留同距時 left/right/top/bottom 的固定優先序。
    const edge = EDGES[distances.indexOf(Math.min(...distances))]!;
    result[slot] = edgeCells(map.width, map.height, edge);
  }
  return map.exitsBySlot !== undefined || Object.keys(result).length ? result : undefined;
}
