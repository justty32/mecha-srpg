import type { Grade } from "../../core/types-def.ts";
import type { CampaignState, OpsCtx, RouteDef, WorldActionDef } from "../state/types.ts";

export type CmdResult = { ok: true } | { ok: false; error: string };
// SPEC-GAP：地基未定義世界係數登記檔，暫存於不參與抽牌的 action/ops-world.rules。
export type WorldRules = {
  grid: { shipMp: number; groundMp: number; diagonal: number; blightCost: { shallow: number; deep: number; core: number };
    contact: { air: number; ground: number }; sight: number; uplinkSight: number };
  pressure: { daily: number; sealedRelief: number; blightPerMonth: number; poissonScale: number; adjacentChance: number; cityBiasPerPressure: number; widthStep: number; widths: Grade[] };
  nodes: { deepMonths: number; insectOwner: string };
  rifts: { openingDays: number };
  travel: { fuelPerDay: number; daysMultiplier: number; shallowEncounterChance: number; retreatFuel: number; partyMin: number; partyMax: number };
  market: { repDiscount: number; minimumMultiplier: number; frameReadiness: number };
};
export function worldRules(ctx: OpsCtx): WorldRules {
  return (ctx.world.require("action", "action/ops-world") as WorldActionDef & { rules: WorldRules }).rules;
}
export function adjacentNodes(ctx: OpsCtx, node: string): string[] {
  return [...new Set(ctx.world.all("route").flatMap(r => r.a === node ? [r.b] : r.b === node ? [r.a] : []))].sort();
}
export function routeOpen(s: CampaignState, route: RouteDef): boolean {
  return [route.a, route.b].every(id => s.nodes[id] && !["deep", "core"].includes(s.nodes[id]!.blight?.depth ?? ""));
}
export function blightNode(s: CampaignState, ctx: OpsCtx, nodeId: string, riftId: string): void {
  const node = s.nodes[nodeId], rift = s.rifts[riftId];
  if (!node || !rift || node.blight) return;
  node.blight = { rift: riftId, depth: nodeId === rift.node ? "core" : "shallow", sinceDay: s.clock.day };
  if (!rift.zones.includes(nodeId)) rift.zones.push(nodeId);
  rift.zones.sort();
  ctx.emit("NodeBlighted", { node: nodeId, rift: riftId });
}
export function reclaimNode(s: CampaignState, ctx: OpsCtx, nodeId: string, riftId: string): void {
  const node = s.nodes[nodeId];
  if (node?.blight?.rift === riftId) {
    delete node.blight;
    delete node.ownerOverride;
    ctx.emit("NodeReclaimed", { node: nodeId, rift: riftId });
  }
  const rift = s.rifts[riftId];
  if (rift) rift.zones = rift.zones.filter(id => id !== nodeId);
}
export function nodesDaily2(s: CampaignState, ctx: OpsCtx): void {
  const rules = worldRules(ctx), month = ctx.world.require("calendar", s.calendar).daysPerMonth;
  for (const id of Object.keys(s.nodes).sort()) {
    const node = s.nodes[id]!, blight = node.blight;
    if (!blight) continue;
    const rift = s.rifts[blight.rift];
    blight.depth = rift?.node === id ? "core" : s.clock.day - blight.sinceDay >= rules.nodes.deepMonths * month ? "deep" : "shallow";
    if (ctx.world.require("node", node.def).kind === "city") {
      // SPEC-GAP：目前 core 只有蟲族裂獸勢力；新增族須另提供 owner 對照。
      const owner = ctx.db.require("faction", rules.nodes.insectOwner).id;
      if (node.ownerOverride !== owner) {
        node.ownerOverride = owner;
        ctx.emit("CityLost", { node: id, faction: owner });
      }
    }
  }
}
