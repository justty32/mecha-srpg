import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { Relation, RelState, TreatyDef } from "./types.ts";
export const relationRank: Record<RelState, number> = { war: 0, hostile: 1, tense: 2, neutral: 3, friendly: 4, allied: 5 };
const factionIds = new WeakMap<OpsCtx["world"], Map<string, string>>();
export function factionId(s: CampaignState, ctx: Pick<OpsCtx, "world">, id: string): string | undefined {
  let ids = factionIds.get(ctx.world);
  if (!ids) {
    ids = new Map();
    for (const f of ctx.world.all("faction-ops")) for (const key of [f.id, f.faction, f.id.split(":").at(-1)!, f.faction.split(":").at(-1)!]) ids.set(key, f.id);
    factionIds.set(ctx.world, ids);
  }
  const found = ids.get(id); return found && s.factions[found] ? found : undefined;
}
export function relationKey(a: string, b: string): string { return [a, b].sort().join("|"); }
export function relation(s: CampaignState, a: string, b: string): Relation | undefined { return s.relations?.[relationKey(a, b)]; }
export function hasTreaty(s: CampaignState, ctx: OpsCtx, r: Relation, kind: TreatyDef["kind"]): boolean {
  return r.treaties.some(t => !t.broken && t.endDay > s.clock.day && ctx.world.get("treaty", t.def)?.kind === kind);
}
export function nextRelationState(r: Relation, alliance: boolean, ceasefire: boolean, casusBelli = r.grievances.reduce((n, g) => n + g.w, 0) >= 3): RelState {
  if (r.state === "war" && !ceasefire) return "war";
  if (!ceasefire && r.value <= -60 && casusBelli) return "war";
  if (alliance && (r.value >= 40 || r.state === "allied" && r.value >= 30)) return "allied";
  if (r.state === "hostile" && r.value <= -20) return "hostile";
  if (r.state === "tense" && r.value > -40 && r.value <= 0) return "tense";
  if (r.state === "neutral" && r.value > -20 && r.value < 20) return "neutral";
  if (r.state === "friendly" && r.value >= 0) return "friendly";
  if (r.value <= -30) return "hostile";
  if (r.value <= -10) return "tense";
  return r.value >= 10 ? "friendly" : "neutral";
}
export function changeRelation(s: CampaignState, ctx: OpsCtx, a: string, b: string, delta: number, reason: string, grievance = 0): boolean {
  const x = factionId(s, ctx, a), y = factionId(s, ctx, b), r = x && y ? relation(s, x, y) : undefined;
  if (!r) return false;
  r.value = Math.max(-100, Math.min(100, r.value + delta));
  if (grievance) r.grievances.push({ day: s.clock.day, kind: reason, w: grievance });
  return true;
}
// 唯一發出離散態事件的入口，只從世界第 2 段呼叫。
export function flushRelations2(s: CampaignState, ctx: OpsCtx): void {
  for (const key of Object.keys(s.relations ?? {}).sort()) {
    const r = s.relations![key]!;
    const to = nextRelationState(r, hasTreaty(s, ctx, r, "alliance"), hasTreaty(s, ctx, r, "ceasefire"));
    if (to !== r.state) { const from = r.state; r.state = to; r.since = s.clock.day; ctx.emit("RelationChanged", { a: r.a, b: r.b, from, to, value: r.value }); }
  }
}
export function declareWar(s: CampaignState, ctx: OpsCtx, a: string, b: string): boolean {
  const x = factionId(s, ctx, a), y = factionId(s, ctx, b), r = x && y ? relation(s, x, y) : undefined;
  if (!r || r.value > -60 || hasTreaty(s, ctx, r, "ceasefire") || hasTreaty(s, ctx, r, "nonaggression")) return false;
  r.grievances.push({ day: s.clock.day, kind: "declareWar", w: 3 });
  ctx.emit("WarDeclared", { a: r.a, b: r.b }); return true;
}
