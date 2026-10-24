import { placeLoc } from "../war/loc.ts";
import { allPlaces } from "../world/places.ts";
import { nextFloat, nextInt, pickWeighted } from "../../core/rng.ts";
import type { RngState } from "../../core/types-state.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { nearbyPlaces, worldRules } from "./places.ts";
import { nextSpring, riftDefinition } from "./rifts.ts";

export function poisson(rng: RngState, mean: number): number {
  if (!Number.isFinite(mean) || mean < 0) throw new RangeError("invalid Poisson mean");
  // 指數等待時間法，不計 exp(-mean)，避免高潮壓下下溢。
  let count = 0, elapsed = 0;
  while (mean > 0) {
    elapsed -= Math.log(1 - nextFloat(rng));
    if (elapsed >= mean) break;
    count++;
  }
  return count;
}
export function pressureDaily2(s: CampaignState, ctx: OpsCtx): void {
  const cfg = worldRules(ctx).pressure, cal = ctx.world.require("calendar", s.calendar);
  const blighted = Object.keys(s.places).sort().filter(id => s.places[id]!.blight);
  s.pressure += cfg.daily + cfg.blightPerMonth * blighted.length / cal.daysPerMonth;
  if (s.clock.phase !== "spring") return;
  const families = ctx.world.all("rift");
  if (!families.length) return;
  const count = poisson(s.rng, s.pressure * cfg.poissonScale);
  for (let i = 0; i < count; i++) {
    const occupied = new Set(Object.keys(s.rifts).sort().filter(id => s.rifts[id]!.phase !== "closed").map(id => s.rifts[id]!.site));
    const available = allPlaces(s, ctx).filter(n => ctx.world.require("map", n.map).riftRate > 0 && !n.map.endsWith("/lunar") && !occupied.has(n.id) && !s.places[n.id]?.blight);
    const neighbors = new Set(blighted.flatMap(n => nearbyPlaces(s, ctx, n)));
    const adjacent = available.filter(n => neighbors.has(n.id));
    const useAdjacent = nextFloat(s.rng) < cfg.adjacentChance && adjacent.length > 0;
    const pool = useAdjacent ? adjacent : available.filter(n => n.kind === "outpost");
    if (!pool.length) break;
    const node = pickWeighted(s.rng, pool, n => n.kind === "city" ? 1 + s.pressure * cfg.cityBiasPerPressure : 1);
    const source = useAdjacent ? nearbyPlaces(s, ctx, node.id).map(n => s.places[n]?.blight?.rift).find(id => id && s.rifts[id]) : undefined;
    const family = source ? riftDefinition(ctx, s.rifts[source]!) : families[nextInt(s.rng, families.length)]!;
    const limit = Math.min(cfg.widths.length, 1 + Math.floor(s.pressure / cfg.widthStep));
    const id = nextId(s, "rift");
    s.rifts[id] = { id, site: node.id, at: placeLoc(s, ctx, node.id), family: family.id, width: cfg.widths[nextInt(s.rng, limit)]!, phase: "opening", openedDay: s.clock.day,
      anchorAge: 0, zones: [], fedCount: 0, nextCheck: nextSpring(s, ctx) };
    ctx.emit("RiftPhase", { rift: id, node: node.id, phase: "opening" });
  }
}
