import type { Grade } from "../../core/types-def.ts";
import type { CampaignState, OpsCtx, PlaceDef, WorldActionDef } from "../state/types.ts";
import { chebyshev, footprintOf } from "./grid.ts";
import { blightAt } from "./blight.ts";
import { addPatch, clearPlaceBlight, ensureCore } from "./patches.ts";

export type CmdResult = { ok: true } | { ok: false; error: string };
// SPEC-GAP：地基未定義世界係數登記檔，暫存於不參與抽牌的 action/ops-world.rules。
export type WorldRules = {
  grid: { shipMp: number; groundMp: number; diagonal: number; blightCost: { shallow: number; deep: number; core: number };
    contact: { air: number; ground: number }; sight: number; uplinkSight: number; hulkMp: number;
    mpMods: { damaged: number; spring: number; neap: number }; interimZoneRadius: number; interimAdjacency: number; nearbyRadius: number;
    blightEncounter: { shallow: number; deep: number; core: number } };
  pressure: { daily: number; sealedRelief: number; blightPerMonth: number; poissonScale: number; adjacentChance: number; cityBiasPerPressure: number; widthStep: number; widths: Grade[] };
  places: { deepMonths: number; insectOwner: string };
  nodes: { deepMonths: number };
  blight: { patchSize: [number, number]; myceliumPerTide: number; familyAffinity: Record<string, Record<string, number>>;
    siteName: { template: string; families: Record<string, string> }; ruinChance: number; seedTables: Record<string, string> };
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
  const rift = s.rifts[riftId], def = placeDef(s, ctx, nodeId);
  if (!rift || !def) return;
  ensureCore(s, ctx, rift);
  if (nodeId !== rift.site) addPatch(s, ctx, rift, footprintOf(def), def.map);
}
export function reclaimPlace(s: CampaignState, ctx: OpsCtx, nodeId: string, riftId: string): void {
  clearPlaceBlight(s, ctx, nodeId, riftId);
}
export function placesDaily2(s: CampaignState, ctx: OpsCtx): void {
  const rules = worldRules(ctx), month = ctx.world.require("calendar", s.calendar).daysPerMonth;
  for (const id of Object.keys(s.places).sort()) {
    const node = s.places[id]!, def = requirePlace(s, ctx, id);
    if (def.kind !== "city") continue;
    const blight = footprintOf(def).map(cell => blightAt(s, ctx, { map: def.map, cell, region: "" })).find(Boolean);
    // SPEC-GAP：現有內容只有蟲族裂獸勢力，四族暫沿用同一占領者。
    const owner = ctx.db.require("faction", rules.places.insectOwner).id;
    if (blight && !node.flags.includes("blight-lost")) {
      if (node.ownerOverride) node.blightOwnerBefore = node.ownerOverride;
      node.flags.push("blight-lost");
      delete node.recoveringUntil;
      node.flags = node.flags.filter(f => f !== "recovering");
      ctx.emit("CityLost", { node: id, place: id, faction: owner, rift: blight.rift });
    } else if (!blight && node.flags.includes("blight-lost")) {
      if (node.blightOwnerBefore) node.ownerOverride = node.blightOwnerBefore;
      else delete node.ownerOverride;
      delete node.blightOwnerBefore;
      node.flags = node.flags.filter(f => f !== "blight-lost");
      node.flags.push("recovering"); node.recoveringUntil = s.clock.day + month;
      ctx.emit("PlaceReclaimed", { node: id, place: id });
    }
    if (blight) node.ownerOverride = owner;
    if (node.recoveringUntil !== undefined && s.clock.day >= node.recoveringUntil) {
      delete node.recoveringUntil; node.flags = node.flags.filter(f => f !== "recovering");
    }
  }
}
