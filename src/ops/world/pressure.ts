import { locAt } from "../war/loc.ts";
import { nextFloat, nextInt, pickWeighted } from "../../core/rng.ts";
import type { RngState } from "../../core/types-state.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { Cell } from "../../core/types-def.ts";
import { allPlaces, worldRules } from "./places.ts";
import { openRift, riftDefinition } from "./rifts.ts";
import { cellKey, cellsWithin, chebyshev, footprintOf, frontier, gridOf, terrainAt } from "./grid.ts";

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
  s.pressure += cfg.daily + cfg.blightPerMonth * Object.values(s.patches).filter(p => p.origin !== "event").length / cal.daysPerMonth;
  if (s.clock.phase !== "spring") return;
  const families = ctx.world.all("rift");
  if (!families.length) return;
  const maps = ctx.world.all("map").map(def => ({ def, grid: gridOf(ctx.world, def.id) })).filter(m => m.def.riftRate > 0);
  const total = maps.reduce((n, m) => n + m.grid.land * m.def.riftRate, 0);
  if (!total) return;
  for (const { def, grid } of maps) {
    const count = poisson(s.rng, s.pressure * cfg.poissonScale * grid.land * def.riftRate / total);
    if (!count) continue;
    const cities = allPlaces(s, ctx).filter(p => p.map === def.id && p.kind === "city").flatMap(footprintOf);
    const index = s.maps[def.id]!.blight;
    const cityDistance = (cell: Cell) => cities.reduce((d, c) => Math.min(d, chebyshev(cell, c)), Infinity);
    const free = (cell: Cell) => !index[cellKey(cell)] && terrainAt(grid, cell).airCost !== null && terrainAt(grid, cell).riftAffinity > 0;
    const weight = (cell: Cell) => terrainAt(grid, cell).riftAffinity * (cityDistance(cell) <= 2 ? 1 + cfg.cityBiasPerPressure * s.pressure : 1);
    for (let n = 0; n < count; n++) {
      const adjacent = new Map<string, { cell: Cell; rift: string }>();
      for (const rift of Object.values(s.rifts).filter(r => r.phase !== "closed" && r.at.map === def.id)) {
        const owned = new Set(rift.patches.flatMap(id => s.patches[id]?.cells.map(cellKey) ?? []));
        for (const edge of frontier(grid, owned)) for (const cell of cellsWithin(grid, edge, 3)) {
          const key = cellKey(cell);
          if (free(cell) && !adjacent.has(key)) adjacent.set(key, { cell, rift: rift.id });
        }
      }
      const useAdjacent = nextFloat(s.rng) < cfg.adjacentChance;
      let cell: Cell | undefined, source: string | undefined;
      if (useAdjacent && adjacent.size) {
        const pick = pickWeighted(s.rng, [...adjacent.values()], c => weight(c.cell));
        cell = pick.cell; source = pick.rift;
      } else {
        const wild: Cell[] = [];
        for (let y = 0; y < grid.height; y++) for (let x = 0; x < grid.width; x++) {
          const c = { x, y }; if (free(c) && cityDistance(c) >= 6) wild.push(c);
        }
        if (wild.length) cell = pickWeighted(s.rng, wild, weight);
      }
      if (!cell) continue;
      const family = source ? riftDefinition(ctx, s.rifts[source]!) : families[nextInt(s.rng, families.length)]!;
      const limit = Math.min(cfg.widths.length, 1 + Math.floor(s.pressure / cfg.widthStep));
      openRift(s, ctx, locAt(ctx, def.id, cell), family, cfg.widths[nextInt(s.rng, limit)]!);
    }
  }
}
