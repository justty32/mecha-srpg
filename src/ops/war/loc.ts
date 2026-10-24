import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { ForceState, Loc } from "./types.ts";
import { shortestPath } from "../world/travel.ts";
export function nodeLoc(ctx: Pick<OpsCtx, "world">, node: string): Loc {
  const def = ctx.world.require("node", node);
  return { map: def.body === "moon" ? "map/lunar" : "map/longland", region: def.id };
}
export function locNode(loc: Loc): string { return loc.region; }
export function sameRegion(a: Loc, b: Loc): boolean { return a.map === b.map && a.region === b.region; }
const paths = new WeakMap<OpsCtx["world"], Map<string, Loc[] | undefined>>();
export function marchPath(s: CampaignState, ctx: OpsCtx, from: Loc, to: Loc): Loc[] | undefined {
  if (from.map !== to.map) return undefined;
  let cache = paths.get(ctx.world); if (!cache) { cache = new Map(); paths.set(ctx.world, cache); }
  const key = `${from.map}|${locNode(from)}|${locNode(to)}`;
  if (cache.has(key)) return cache.get(key)?.map(loc => ({ ...loc }));
  // 部隊可進入蝕域；航船的燃料、船體、封路不影響常備軍行軍。
  const travel = { ...s, ship: { ...s.ship, hull: { ...s.ship.hull, cur: 1 } },
    nodes: Object.fromEntries(Object.entries(s.nodes).map(([id, n]) => [id, { ...n, blight: undefined }])) };
  const path = shortestPath(travel, ctx, locNode(from), locNode(to));
  const result = path?.nodes.map(id => nodeLoc(ctx, id));
  const valid = result?.every(loc => loc.map === from.map) ? result : undefined;
  cache.set(key, valid); return valid?.map(loc => ({ ...loc }));
}
export function marchStep(s: CampaignState, ctx: OpsCtx, force: ForceState): boolean {
  const to = force.path?.[0];
  if (!to) return true;
  if (to.map !== force.pos.map) throw new Error("war-cross-map");
  const a = locNode(force.pos), b = locNode(to);
  const edge = ctx.world.all("route").filter(r => r.kind !== "ferry" && (r.a === a && r.b === b || r.b === a && r.a === b)).sort((x, y) => x.days - y.days)[0];
  if (!edge) return false;
  force.marchDays ??= Math.max(1, Math.ceil(edge.days / force.speed));
  if (--force.marchDays <= 0) { force.pos = to; force.path!.shift(); delete force.marchDays; }
  return !force.path?.length;
}
