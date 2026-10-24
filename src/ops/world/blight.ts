import type { CampaignState, Loc, OpsCtx, PlaceState } from "../state/types.ts";
import { chebyshev, footprintOf } from "./grid.ts";
import { allPlaces, worldRules } from "./places.ts";

// SPEC-GAP：本波蝕域仍掛地點；第三波改由 maps.blight 查蝕塊。
export function blightAt(s: CampaignState, ctx: OpsCtx, loc: Loc): PlaceState["blight"] {
  const radius = worldRules(ctx).grid.interimZoneRadius;
  return allPlaces(s, ctx).filter(p => p.map === loc.map && s.places[p.id]?.blight)
    .map(p => ({ p, distance: Math.min(...footprintOf(p).map(c => chebyshev(c, loc.cell))) }))
    .filter(p => p.distance <= radius).sort((a, b) => a.distance - b.distance || a.p.id.localeCompare(b.p.id))
    .map(p => s.places[p.p.id]!.blight)[0];
}
