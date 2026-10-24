import type { ActorState, CampaignState, OpsCtx, RevealInput } from "../state/types.ts";
import { cellKey, cellsWithin, gridOf, inBounds, parseCellKey, terrainAt } from "./grid.ts";
import { allPlaces, worldRules } from "./places.ts";
import { blightAt } from "./blight.ts";

/** 可見集合只查當下狀態；讀取它不刷新情報日期。 */
export function visibleCells(s: CampaignState, ctx: OpsCtx, mapId: string): Set<string> {
  const map = gridOf(ctx.world, mapId), cfg = worldRules(ctx).grid, visible = new Set<string>();
  const add = (cell: { x: number; y: number }, radius: number) => {
    for (const c of cellsWithin(map, cell, Math.max(0, Math.floor(radius)))) visible.add(cellKey(c));
  };
  if (s.ship.pos.map === map.id) add(s.ship.pos.cell, cfg.sight + terrainAt(map, s.ship.pos.cell).sight +
    (map.id.includes("moon") || map.id.includes("selene") ? 2 : 0));
  for (const p of allPlaces(s, ctx)) {
    if (p.map !== map.id || !p.services.some(id => id.endsWith("/uplink"))) continue;
    const owner = s.places[p.id]?.ownerOverride ?? p.owner;
    const faction = ctx.world.all("faction-ops").find(f => f.id === owner || f.faction === owner || !owner && s.factions[f.id]?.territoryNow.includes(p.id));
    if ((s.factions[faction?.id ?? owner ?? ""]?.rep ?? (owner ? -1 : 0)) >= 0) add(p.at, cfg.uplinkSight);
  }
  for (const info of s.reveals ?? []) {
    if (info.until < s.clock.day || (info.cell?.map ?? info.map) !== map.id) continue;
    if (info.cell) add(info.cell.cell, info.radius);
    if (info.region) {
      const region = map.regionKeys.indexOf(info.region);
      if (region > 0) for (let i = 0; i < map.region.length; i++) if (map.region[i] === region) add({ x: i % map.width, y: Math.floor(i / map.width) }, info.radius);
    }
  }
  return visible;
}

export function refreshFog(s: CampaignState, ctx: OpsCtx): void {
  s.reveals = (s.reveals ?? []).filter(info => info.until >= s.clock.day);
  const actors = Object.values(s.actors).sort((a, b) => a.id.localeCompare(b.id));
  for (const mapId of Object.keys(s.maps).sort()) {
    const known = s.maps[mapId]!.known, visible = visibleCells(s, ctx, mapId);
    const byCell = new Map<string, ActorState[]>();
    for (const actor of actors) if (actor.pos.map === mapId && visible.has(cellKey(actor.pos.cell))) {
      actor.lastSeenByPlayer = s.clock.day;
      const key = cellKey(actor.pos.cell), list = byCell.get(key) ?? [];
      list.push(actor); byCell.set(key, list);
    }
    // 同日可能在移動與日末各刷新一次；新目擊會取代舊位置，不能留下兩個影子。
    const observed = new Map([...byCell].flatMap(([key, list]) => list.map(actor => [actor.id, key] as const)));
    for (const [key, snapshot] of Object.entries(known)) {
      const keep = (id: string) => !observed.has(id) || observed.get(id) === key;
      snapshot.actors = snapshot.actors.filter(keep);
      if (snapshot.actorSnapshots) snapshot.actorSnapshots = snapshot.actorSnapshots.filter(actor => keep(actor.id));
    }
    for (const key of visible) {
      const seen = byCell.get(key) ?? [], blight = blightAt(s, ctx, { map: mapId, cell: parseCellKey(key), region: "" });
      known[key] = { day: s.clock.day, actors: seen.map(a => a.id), actorSnapshots: structuredClone(seen), ...(blight ? { blight } : {}) };
    }
  }
}

export function reveal(s: CampaignState, ctx: OpsCtx, input: RevealInput): boolean {
  const mapId = input.cell?.map ?? input.map ?? s.ship.pos.map, def = ctx.world.get("map", mapId);
  if (!def || !Number.isInteger(input.days) || input.days <= 0 || !Number.isFinite(input.radius) || input.radius < 0) return false;
  const map = gridOf(ctx.world, def.id);
  if (input.cell && !inBounds(map, input.cell.cell) || !input.cell && (!input.region || !map.regionKeys.includes(input.region))) return false;
  (s.reveals ??= []).push({ ...structuredClone(input), map: def.id,
    ...(input.cell ? { cell: { ...structuredClone(input.cell), map: def.id } } : {}), until: s.clock.day + input.days - 1 });
  refreshFog(s, ctx); return true;
}

/** 每個行動者只保留最近一次被目擊的位置；不讀目前真值補齊舊情報。 */
export function knownActors(s: CampaignState): { actor: ActorState; day: number }[] {
  const latest = new Map<string, { actor: ActorState; day: number }>();
  for (const map of Object.values(s.maps)) for (const known of Object.values(map.known)) for (const actor of known.actorSnapshots ?? []) {
    if (!latest.has(actor.id) || latest.get(actor.id)!.day < known.day) latest.set(actor.id, { actor, day: known.day });
  }
  return [...latest.values()].sort((a, b) => a.actor.id.localeCompare(b.actor.id));
}
