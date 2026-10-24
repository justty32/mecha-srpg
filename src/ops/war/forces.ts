import { blightAt } from "../world/blight.ts";
import { pickWeighted } from "../../core/rng.ts";
import type { CampaignState, OpsCtx, RiftState } from "../state/types.ts";
import type { ForceState, ForceUnit } from "./types.ts";
import { factionModelPool, replenishWeight } from "./rnd.ts";
import { placeAt } from "./loc.ts";
const powers = new WeakMap<OpsCtx["world"], Record<string, number>>();
export function modelPower(ctx: Pick<OpsCtx, "world">): Record<string, number> {
  const cached = powers.get(ctx.world); if (cached) return cached;
  const cfg = ctx.world.all("forces")[0]!;
  const result = Object.fromEntries(ctx.world.all("model").map(m => [m.id, cfg.gp[m.tier]]));
  powers.set(ctx.world, result); return result;
}
export function strength(force: ForceState, power: Record<string, number>): number {
  return force.units.reduce((n, u) => n + u.count * (power[u.model] ?? 0) * u.readiness, 0);
}
export function riftStrength(s: CampaignState, ctx: OpsCtx, r: RiftState): number {
  const cfg = ctx.world.all("forces")[0]!;
  const depth = blightAt(s, ctx, r.at)?.depth;
  return cfg.gp[r.width] * cfg.rift.width + (depth === "core" ? 3 : depth === "deep" ? 2 : 1) * cfg.rift.depth + r.anchorAge * cfg.rift.age;
}
export function mergeUnits(force: ForceState, units: ForceUnit[]): void {
  for (const u of units) {
    const old = force.units.find(v => v.model === u.model);
    if (!old) force.units.push({ ...u });
    else if (old.count + u.count > 0) {
      old.readiness = (old.count * old.readiness + u.count * u.readiness) / (old.count + u.count); old.count += u.count;
    }
  }
  force.units.sort((a, b) => a.model.localeCompare(b.model));
}
export function forcesDaily(s: CampaignState, ctx: OpsCtx): void {
  if (!s.warRng) return;
  const cfg = ctx.world.all("forces")[0]; if (!cfg) return;
  for (const id of Object.keys(s.factions).sort()) {
    const f = s.factions[id]!, force = f.forces; if (!force || !f.alive) continue;
    if (f.territoryNow.includes((placeAt(s, ctx, force.pos) ?? ""))) force.supply = Math.min(100, force.supply + cfg.homeSupply);
    if (s.clock.dom !== 1) continue;
    for (const u of force.units) u.readiness = Math.min(1, u.readiness + cfg.readiness);
    let budget = cfg.replenish[f.scaleNow] ?? 0;
    const pool = factionModelPool(s, ctx, id).map(m => ctx.world.require("model", m)).filter(m => m.role !== "captain");
    while (budget > 0) {
      const eligible = pool.filter(m => cfg.gp[m.tier] <= budget); if (!eligible.length) break;
      const model = pickWeighted(s.warRng, eligible, m => replenishWeight(s, ctx, m));
      mergeUnits(force, [{ model: model.id, count: 1, readiness: 1 }]); budget -= cfg.gp[model.tier];
    }
  }
}
