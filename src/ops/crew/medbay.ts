import type { CampaignState, OpsCtx } from "../state/types.ts";
import { rules } from "./shared.ts";

export function medbayDaily5(s: CampaignState, ctx: OpsCtx): void {
  const cfg = rules(ctx), roles = Object.keys(s.roster.employment).sort().map(id => s.roster.employment[id]!.role);
  for (const id of Object.keys(s.roster.persons).sort()) {
    const p = s.roster.persons[id]!, soul = ctx.db.require("person", p.def).kind === "soul";
    const healer = roles.includes(soul ? "technician" : "medic");
    const mult = healer ? cfg.medicMult : s.ship.rooms.medbay ? cfg.medbayMult : 1;
    if (p.pools.hp && p.pools.hp.cur > 0) p.pools.hp.cur = Math.min(p.pools.hp.max, p.pools.hp.cur + cfg.hpRegen * mult);
    const expired = new Set<number>();
    for (const effect of p.effects) {
      const def = ctx.db.require("effect", effect.effect);
      if (!def.tags.includes("injury:temporary") || def.clock.kind !== "days" || effect.remaining === null || soul && !healer) continue;
      effect.remaining = Math.max(0, effect.remaining - 1);
      if (!effect.remaining) expired.add(effect.uid);
    }
    const contribs = new Set(p.effects.filter(e => expired.has(e.uid)).flatMap(e => e.contribIds));
    p.effects = p.effects.filter(e => !expired.has(e.uid)); p.contribs = p.contribs.filter(c => !contribs.has(c.id));
  }
}
