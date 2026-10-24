import type { Cell } from "../../core/types-def.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { ForceState, Loc } from "./types.ts";
import { cellKey, findPath, footprintOf, gridOf, idx, stepCost } from "../world/grid.ts";
import { allPlaces, requirePlace, worldRules } from "../world/places.ts";
export function locAt(ctx: Pick<OpsCtx, "world">, mapId: string, cell: Cell): Loc {
  const map = gridOf(ctx.world, mapId);
  return { map: map.id, region: map.regionKeys[map.region[idx(map, cell)]!] ?? "", cell: { ...cell } };
}
export function placeLoc(s: CampaignState, ctx: Pick<OpsCtx, "world">, place: string): Loc {
  const def = requirePlace(s, ctx, place);
  return locAt(ctx, def.map, def.at);
}
export function placeAt(s: CampaignState, ctx: Pick<OpsCtx, "world">, loc: Loc): string | undefined {
  return allPlaces(s, ctx).find(p => p.map === loc.map && footprintOf(p).some(c => c.x === loc.cell.x && c.y === loc.cell.y))?.id;
}
export function sameRegion(a: Loc, b: Loc): boolean { return a.map === b.map && a.region === b.region; }
const paths = new WeakMap<OpsCtx["world"], Map<string, Cell[] | undefined>>();
export function marchPath(_s: CampaignState, ctx: OpsCtx, from: Loc, to: Loc): Cell[] | undefined {
  if (from.map !== to.map) return undefined;
  let cache = paths.get(ctx.world); if (!cache) { cache = new Map(); paths.set(ctx.world, cache); }
  const key = `${from.map}|${cellKey(from.cell)}|${cellKey(to.cell)}`;
  if (!cache.has(key)) {
    // 本波常備軍無視暫掛地點的蝕域；只依地面地形行軍。
    cache.set(key, findPath(gridOf(ctx.world, from.map), from.cell, to.cell, { layer: "ground", mp: worldRules(ctx).grid.groundMp })?.cells);
  }
  return cache.get(key)?.map(cell => ({ ...cell }));
}
export function marchStep(_s: CampaignState, ctx: OpsCtx, force: ForceState): boolean {
  if (!force.path?.length) { force.mpCarry = 0; return true; }
  // SPEC-GAP：保留既有 speed 數值，作為 groundMp 倍率而非每日 MP。
  const mover = { layer: "ground" as const, mp: worldRules(ctx).grid.groundMp * force.speed };
  const map = gridOf(ctx.world, force.pos.map);
  let mp = mover.mp + (force.mpCarry ?? 0);
  while (force.path.length) {
    const next = force.path[0]!, cost = stepCost(map, mover, force.pos.cell, next);
    if (cost === undefined || cost > mp) break;
    mp -= cost; force.pos = locAt(ctx, force.pos.map, next); force.path.shift();
  }
  force.mpCarry = force.path.length ? mp : 0;
  return force.path.length === 0;
}
