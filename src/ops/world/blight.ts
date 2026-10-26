import type { BlightPatch, CampaignState, Loc, OpsCtx } from "../state/types.ts";
import { cellKey } from "./grid.ts";
import { worldRules } from "./places.ts";

export function rebuildBlightIndex(s: CampaignState): void {
  for (const map of Object.values(s.maps)) map.blight = {};
  for (const patch of Object.values(s.patches)) {
    const map = s.maps[patch.map];
    if (!map) throw new Error(`missing blight map: ${patch.map}`);
    for (const cell of patch.cells) {
      const key = cellKey(cell);
      if (map.blight[key]) throw new Error(`overlapping blight: ${patch.map}/${key}`);
      map.blight[key] = { rift: patch.rift, patch: patch.id };
    }
  }
}
export function patchDepth(s: CampaignState, ctx: OpsCtx, patch: BlightPatch): "core" | "shallow" | "deep" {
  if (s.rifts[patch.rift]?.patches[0] === patch.id) return "core";
  if (patch.depthOverride === "shallow") return "shallow";
  const month = ctx.world.require("calendar", s.calendar).daysPerMonth;
  return s.clock.day - patch.sinceDay < worldRules(ctx).nodes.deepMonths * month ? "shallow" : "deep";
}
export function blightAt(s: CampaignState, ctx: OpsCtx, loc: Loc): { rift: string; patch: string; depth: "core" | "shallow" | "deep" } | undefined {
  const ref = s.maps[loc.map]?.blight[cellKey(loc.cell)], patch = ref && s.patches[ref.patch];
  return patch ? { rift: patch.rift, patch: patch.id, depth: patchDepth(s, ctx, patch) } : undefined;
}
export function blightedCells(s: CampaignState, map?: string): number {
  return Object.values(s.patches).reduce((n, p) => n + (!map || p.map === map ? p.cells.length : 0), 0);
}
