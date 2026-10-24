import type { CampaignState, OpsCtx } from "../state/types.ts";
import { evalOpsCond, evalOpsNum } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";
import type { Relation, TreatyDef, TreatyState } from "./types.ts";
import { factionId, hasTreaty, relation, relationRank } from "./relations.ts";
import { drive } from "./drivers.ts";
export function canSignTreaty(s: CampaignState, ctx: OpsCtx, r: Relation, def: TreatyDef): boolean {
  return !hasTreaty(s, ctx, r, def.kind) && (def.kind !== "ceasefire" || r.state === "war") &&
    relationRank[r.state] >= relationRank[def.requires.minState] &&
    (!def.requires.cond || evalOpsCond(s, ctx, def.requires.cond, { faction: r.a, targetFaction: r.b }));
}
export function signTreaty(s: CampaignState, ctx: OpsCtx, a: string, b: string, id: string): boolean {
  const x = factionId(s, ctx, a), y = factionId(s, ctx, b), r = x && y ? relation(s, x, y) : undefined, def = ctx.world.get("treaty", id);
  if (!r || !def || !canSignTreaty(s, ctx, r, def)) return false;
  const days = Math.max(1, Math.ceil(evalOpsNum(s, ctx, def.days, { faction: r.a, targetFaction: r.b })));
  r.treaties.push({ def: def.id, signedDay: s.clock.day, endDay: s.clock.day + days });
  if (def.kind === "ceasefire") r.value = Math.max(-50, r.value);
  applyOpsEffects(s, ctx, def.terms, { faction: r.a, targetFaction: r.b });
  ctx.emit("TreatySigned", { a: r.a, b: r.b, treaty: def.id, kind: def.kind, endDay: s.clock.day + days }); return true;
}
export function breakTreaty(s: CampaignState, ctx: OpsCtx, r: Relation, treaty: TreatyState, by: string): void {
  if (treaty.broken || treaty.endDay <= s.clock.day) return;
  treaty.broken = { day: s.clock.day, by };
  drive(s, ctx, "treaty-broken", by, r.a === by ? r.b : r.a);
  ctx.emit("TreatyBroken", { a: r.a, b: r.b, treaty: treaty.def, by });
}
export function treatiesDaily(s: CampaignState, ctx: OpsCtx): void {
  for (const key of Object.keys(s.relations ?? {}).sort()) {
    const r = s.relations![key]!;
    for (const t of [...r.treaties].sort((a, b) => a.def.localeCompare(b.def))) {
      const def = ctx.world.require("treaty", t.def);
      if (t.broken) continue;
      if (t.endDay <= s.clock.day) {
        drive(s, ctx, "treaty-honored", r.a, r.b);
        applyOpsEffects(s, ctx, def.onExpire, { faction: r.a, targetFaction: r.b });
        ctx.emit("TreatyExpired", { a: r.a, b: r.b, treaty: t.def, kind: def.kind });
        r.treaties = r.treaties.filter(x => x !== t);
        if (def.kind === "ceasefire") r.value = Math.min(r.value, -30);
        if (def.kind === "alliance" && r.value >= 30) signTreaty(s, ctx, r.a, r.b, def.id);
        continue;
      }
      for (const [a, b] of [[r.a, r.b], [r.b, r.a]] as const) if (evalOpsCond(s, ctx, def.breakIf, { faction: a, targetFaction: b })) { breakTreaty(s, ctx, r, t, a); break; }
    }
  }
}
