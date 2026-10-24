import type { Grade } from "../../core/types-def.ts";
import type { CampaignState, OpsCtx, PlaceDef, WorldActionDef } from "../state/types.ts";
import { chebyshev, footprintOf } from "./grid.ts";

export type CmdResult = { ok: true } | { ok: false; error: string };
// SPEC-GAP：地基未定義世界係數登記檔，暫存於不參與抽牌的 action/ops-world.rules。
export type WorldRules = {
  grid: { shipMp: number; groundMp: number; diagonal: number; blightCost: { shallow: number; deep: number; core: number };
    contact: { air: number; ground: number }; sight: number; uplinkSight: number; hulkMp: number;
    mpMods: { damaged: number; spring: number; neap: number }; interimZoneRadius: number; interimAdjacency: number; nearbyRadius: number;
    blightEncounter: { shallow: number; deep: number; core: number } };
  pressure: { daily: number; sealedRelief: number; blightPerMonth: number; poissonScale: number; adjacentChance: number; cityBiasPerPressure: number; widthStep: number; widths: Grade[] };
  places: { deepMonths: number; insectOwner: string };
  rifts: { openingDays: number };
  travel: { fuelPerDay: number; daysMultiplier: number; shallowEncounterChance: number; retreatFuel: number; partyMin: number; partyMax: number };
  market: { repDiscount: number; minimumMultiplier: number; frameReadiness: number };
};
export function worldRules(ctx: OpsCtx): WorldRules {
  return (ctx.world.require("action", "action/ops-world") as WorldActionDef & { rules: WorldRules }).rules;
}
export function placeDef(s: Pick<CampaignState, "places">, ctx: Pick<OpsCtx, "world">, id: string): PlaceDef | undefined {
  return s.places[id]?.dyn ?? ctx.world.get("place", id);
}
export function requirePlace(s: Pick<CampaignState, "places">, ctx: Pick<OpsCtx, "world">, id: string): PlaceDef {
  const def = placeDef(s, ctx, id);
  if (!def) throw new Error(`missing place: ${id}`);
  return def;
}
export function allPlaces(s: Pick<CampaignState, "places">, ctx: Pick<OpsCtx, "world">): PlaceDef[] {
  return [...new Map([...ctx.world.all("place"), ...Object.values(s.places).flatMap(p => p.dyn ? [p.dyn] : [])].map(p => [p.id, p])).values()].sort((a, b) => a.id.localeCompare(b.id));
}
export function nearbyPlaces(s: CampaignState, ctx: OpsCtx, id: string): string[] {
  const from = requirePlace(s, ctx, id), cells = footprintOf(from);
  return allPlaces(s, ctx).filter(p => p.id !== from.id && p.map === from.map && footprintOf(p).some(b => cells.some(a => chebyshev(a, b) <= worldRules(ctx).grid.interimAdjacency))).map(p => p.id);
}
export function blightPlace(s: CampaignState, ctx: OpsCtx, nodeId: string, riftId: string): void {
  const node = s.places[nodeId], rift = s.rifts[riftId];
  if (!node || !rift || node.blight) return;
  node.blight = { rift: riftId, depth: nodeId === rift.site ? "core" : "shallow", sinceDay: s.clock.day };
  if (!rift.zones.includes(nodeId)) rift.zones.push(nodeId);
  rift.zones.sort();
  ctx.emit("PlaceBlighted", { place: nodeId, node: nodeId, rift: riftId });
}
export function reclaimPlace(s: CampaignState, ctx: OpsCtx, nodeId: string, riftId: string): void {
  const node = s.places[nodeId];
  if (node?.blight?.rift === riftId) {
    delete node.blight;
    delete node.ownerOverride;
    ctx.emit("PlaceReclaimed", { place: nodeId, node: nodeId, rift: riftId });
  }
  const rift = s.rifts[riftId];
  if (rift) rift.zones = rift.zones.filter(id => id !== nodeId);
}
export function placesDaily2(s: CampaignState, ctx: OpsCtx): void {
  const rules = worldRules(ctx), month = ctx.world.require("calendar", s.calendar).daysPerMonth;
  for (const id of Object.keys(s.places).sort()) {
    const node = s.places[id]!, blight = node.blight;
    if (!blight) continue;
    const rift = s.rifts[blight.rift];
    blight.depth = rift?.site === id ? "core" : s.clock.day - blight.sinceDay >= rules.places.deepMonths * month ? "deep" : "shallow";
    if (requirePlace(s, ctx, node.def).kind === "city") {
      // SPEC-GAP：目前 core 只有蟲族裂獸勢力；新增族須另提供 owner 對照。
      const owner = ctx.db.require("faction", rules.places.insectOwner).id;
      if (node.ownerOverride !== owner) {
        node.ownerOverride = owner;
        ctx.emit("CityLost", { node: id, faction: owner });
      }
    }
  }
}
