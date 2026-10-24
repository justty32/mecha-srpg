import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { OperationState, Relation } from "./types.ts";
import { changeRelation, relation } from "./relations.ts";
import { adjacentNodes } from "../world/nodes.ts";
export function diplomacyRules(ctx: OpsCtx) { return ctx.world.all("affinity")[0]!.rules; }
export function allies(s: CampaignState, id: string): string[] {
  return Object.values(s.relations ?? {}).filter(r => r.state === "allied" && [r.a, r.b].includes(id)).map(r => r.a === id ? r.b : r.a).sort();
}
export function allianceWeight(s: CampaignState, ctx: OpsCtx, a: string, b: string): number {
  const c = diplomacyRules(ctx);
  return Math.max(allies(s, a).length, allies(s, b).length) >= c.burdenAt ? c.burdenWeight : 1;
}
export function drive(s: CampaignState, ctx: OpsCtx, kind: string, a: string, b: string, op?: OperationState): void {
  const c = diplomacyRules(ctx), r = relation(s, a, b);
  const delta = (x: string, y: string, n: number, w = 0) => changeRelation(s, ctx, x, y, n, kind, w);
  switch (kind) {
    case "drift": if (r) r.value += Math.sign(r.baseline - r.value) * Math.min(c.drift, Math.abs(r.baseline - r.value)); break;
    case "grievance-decay": if (r) for (const g of r.grievances) g.w = Math.max(1, g.w * c.decay); break;
    case "border-blight": delta(a, b, c.borderBlight, 1); break;
    case "shared-threat": delta(a, b, c.sharedThreat); break;
    case "op-success-against":
      delta(a, b, c.against, 1);
      for (const id of allies(s, b)) if (id !== a) delta(id, a, c.victimAlly, 1);
      for (const id of allies(s, a)) if (id !== b) delta(id, b, c.actorAlly, 1);
      break;
    case "op-relief": delta(a, b, c.relief); break;
    case "same-target":
      if (r && ["friendly", "allied"].includes(r.state) && op) { if (!op.coActors.includes(b)) op.coActors.push(b); op.coActors.sort(); }
      else delta(a, b, c.sameTarget, 1);
      break;
    case "shell-envy":
      for (const other of Object.keys(s.factions).sort()) {
        const rel = relation(s, a, other); if (!rel) continue;
        const stance = ctx.world.require("faction-ops", other).stance.ancient;
        if (["war", "hostile", "tense"].includes(rel.state)) delta(a, other, c.envy * (1 + stance / 2));
        else if (rel.state === "allied") delta(a, other, c.alliedShell * (1 + stance / 2));
      }
      break;
    case "tech-leak": delta(a, b, c.techLeak, 1); break;
    case "treaty-honored": delta(a, b, c.honored); break;
    case "treaty-broken":
      delta(a, b, c.broken, 3);
      for (const id of Object.keys(s.factions).sort()) if (id !== a && id !== b) delta(a, id, c.thirdParty);
      if (s.factions[a]) s.factions[a]!.prestige = (s.factions[a]!.prestige ?? 0) - 1;
      break;
    case "war-weariness": if (r) r.weariness = r.state === "war" ? r.weariness + c.weariness : Math.max(0, r.weariness - c.truceRecovery); break;
    case "alliance-burden": if (r) {
      const n = Math.max(allies(s, a).length, allies(s, b).length);
      if (n >= c.burdenAt) r.value = Math.max(-100, r.value - (n - c.burdenAt + 1));
    } break;
    case "pressure-truce": if (r?.state === "war") r.weariness += c.pressureTruce; break;
    default: throw new Error(`unknown diplomacy driver: ${kind}`);
  }
}
export function dailyDrivers(s: CampaignState, ctx: OpsCtx): void {
  for (const key of Object.keys(s.relations ?? {}).sort()) {
    const r = s.relations![key]!;
    if (!s.factions[r.a]?.alive || !s.factions[r.b]?.alive) continue;
    if (s.clock.dom === 1) for (const kind of ["drift", "grievance-decay", "alliance-burden"]) drive(s, ctx, kind, r.a, r.b);
    drive(s, ctx, "war-weariness", r.a, r.b);
    if (s.clock.phase !== "spring") continue;
    const touches = (id: string, node: string) => s.factions[id]!.territoryNow.some(n => n === node || adjacentNodes(ctx, n).includes(node));
    for (const rift of Object.values(s.rifts).sort((a, b) => a.id.localeCompare(b.id))) {
      if (rift.phase !== "anchored") continue;
      if (touches(r.a, rift.node) && touches(r.b, rift.node)) drive(s, ctx, "shared-threat", r.a, r.b);
      for (const [a, b] of [[r.a, r.b], [r.b, r.a]] as const) {
        if (s.factions[b]!.territoryNow.includes(rift.node) && s.factions[a]!.territoryNow.some(n => s.nodes[n]?.blight?.rift === rift.id)) drive(s, ctx, "border-blight", a, b);
      }
    }
  }
}
export function operationDiplomacy(s: CampaignState, ctx: OpsCtx, op: OperationState): void {
  const def = ctx.world.require("operation", op.def), target = op.target.faction;
  if (target && (["seize", "siege"].includes(def.kind) || def.kind === "raid" && op.exposed)) drive(s, ctx, "op-success-against", op.actor, target);
  if (target && def.kind === "relief") drive(s, ctx, "op-relief", op.actor, target);
}
