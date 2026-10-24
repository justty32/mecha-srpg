import type { Cell } from "../../core/types-def.ts";
import { nextInt, pickWeighted } from "../../core/rng.ts";
import type { BlightPatch, CampaignState, OpsCtx, RiftState } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { cellKey, cellsWithin, chebyshev, floodFill, footprintOf, frontier, gridOf, inBounds, terrainAt } from "./grid.ts";
import type { GridMap } from "./grid.ts";
import { placesDaily2, requirePlace, worldRules } from "./places.ts";

export function blightPassable(map: GridMap, cell: Cell): boolean {
  if (!inBounds(map, cell)) return false;
  const t = terrainAt(map, cell);
  return t.airCost !== null && !["tidesea", "cloudwall"].includes(t.id.split("/").at(-1)!);
}

export function addPatch(s: CampaignState, ctx: OpsCtx, rift: RiftState, cells: Cell[], map = rift.at.map): BlightPatch | undefined {
  const grid = gridOf(ctx.world, map), index = s.maps[map]!.blight;
  const free = [...new Map(cells.filter(c => blightPassable(grid, c) && !index[cellKey(c)]).map(c => [cellKey(c), c])).values()];
  if (!free.length) return;
  const id = nextId(s, "patch"), patch: BlightPatch = { id, rift: rift.id, map, cells: free, sinceDay: s.clock.day };
  s.patches[id] = patch; rift.patches.push(id);
  for (const cell of free) index[cellKey(cell)] = { rift: rift.id, patch: id };
  ctx.emit("PlaceBlighted", { place: rift.site, node: rift.site, rift: rift.id, patch: id, cells: free.length });
  placesDaily2(s, ctx);
  return patch;
}
export function ensureCore(s: CampaignState, ctx: OpsCtx, rift: RiftState, radius = 0): void {
  let core = s.patches[rift.patches[0] ?? ""];
  if (!core) core = addPatch(s, ctx, rift, [rift.at.cell]);
  if (!core) throw new Error(`rift core blocked: ${rift.id}`);
  const map = gridOf(ctx.world, rift.at.map), index = s.maps[map.id]!.blight;
  for (const cell of cellsWithin(map, rift.at.cell, radius)) {
    if (!blightPassable(map, cell) || index[cellKey(cell)]) continue;
    core.cells.push(cell); index[cellKey(cell)] = { rift: rift.id, patch: core.id };
  }
  placesDaily2(s, ctx);
}
export function growPatch(s: CampaignState, ctx: OpsCtx, rift: RiftState): BlightPatch | undefined {
  const def = ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(d => d.family === rift.family);
  if (!def || def.family === "alien") return;
  const cfg = worldRules(ctx).blight, map = gridOf(ctx.world, rift.at.map), index = s.maps[map.id]!.blight;
  const owned = new Set(rift.patches.flatMap(id => s.patches[id]?.cells.map(cellKey) ?? []));
  const allow = (c: Cell) => blightPassable(map, c) && !index[cellKey(c)];
  const weight = (c: Cell) => {
    const t = terrainAt(map, c);
    return t.riftAffinity * (cfg.familyAffinity[def.family]?.[t.id.split("/").at(-1)!] ?? 1);
  };
  const edge = frontier(map, owned).filter(c => allow(c) && weight(c) > 0);
  if (!edge.length) return;
  const seed = pickWeighted(s.rng, edge, weight), size = cfg.patchSize[0] + nextInt(s.rng, cfg.patchSize[1] - cfg.patchSize[0] + 1);
  return addPatch(s, ctx, rift, floodFill(map, seed, size, allow, s.rng));
}
export function removePatch(s: CampaignState, ctx: OpsCtx, id: string): boolean {
  const patch = s.patches[id]; if (!patch) return false;
  for (const cell of patch.cells) delete s.maps[patch.map]!.blight[cellKey(cell)];
  const rift = s.rifts[patch.rift];
  if (rift) rift.patches = rift.patches.filter(p => p !== id);
  delete s.patches[id];
  // 沿用收復事件的觸發點；一筆事件代表退回一塊，城邦收復另由 footprint 判斷。
  ctx.emit("PlaceReclaimed", { node: rift?.site, place: rift?.site, rift: patch.rift, patch: id, patches: 1 });
  placesDaily2(s, ctx);
  return true;
}
export function clearPlaceBlight(s: CampaignState, ctx: OpsCtx, place: string, riftId?: string): number {
  const def = requirePlace(s, ctx, place), cells = footprintOf(def);
  const targets = Object.values(s.patches).filter(p => p.map === def.map && (!riftId || p.rift === riftId) &&
    s.rifts[p.rift]?.patches[0] !== p.id && p.cells.some(c => cells.some(f => chebyshev(c, f) <= 1)));
  for (const patch of targets) removePatch(s, ctx, patch.id);
  return targets.length;
}
