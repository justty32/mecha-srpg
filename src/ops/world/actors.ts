import type { Cell } from "../../core/types-def.ts";
import type { RngState } from "../../core/types-state.ts";
import { nextInt, rollInt } from "../../core/rng.ts";
import type { ActorDef, ActorKind, ActorState, CampaignState, OpsCtx } from "../state/types.ts";
import type { Loc } from "../war/types.ts";
import { locAt, placeLoc } from "../war/loc.ts";
import { factionId, relation } from "../war/relations.ts";
import { modelPower, strength } from "../war/forces.ts";
import { allPlaces, worldRules } from "./places.ts";
import { blightAt, patchDepth } from "./blight.ts";
import { cellKey, cellsWithin, chebyshev, findPath, gridOf, inBounds, neighbors, parseCellKey, stepCost, terrainAt } from "./grid.ts";
import { actorContact, actorHostile, checkActorContacts, estimateShipStrength } from "./encounter.ts";
import { isSafelyDocked } from "./move.ts";

export type ActorRules = { max: number; min: number; minPopulation: number; maxTopUp: number; evadeSpeedRatio: number; evadeBase: number; deepPenalty: number; maxEncountersPerDay: number };
export function actorRules(ctx: OpsCtx): ActorRules { return (worldRules(ctx) as ReturnType<typeof worldRules> & { actors: ActorRules }).actors; }
export function actorDefinition(ctx: OpsCtx, actor: Pick<ActorState, "kind" | "def">): ActorDef {
  return actor.def ? ctx.world.require("actor", actor.def) : ctx.world.require("actor", `actor/${actor.kind}`);
}
const depthCache = new WeakMap<CampaignState, { day: number; count: number; maps: Map<string, Uint8Array> }>();
export function actorCost(s: CampaignState, ctx: OpsCtx, actor: Pick<ActorState, "kind" | "def" | "pos" | "layer">) {
  const layer = actor.layer ?? actorDefinition(ctx, actor).layer, map = gridOf(ctx.world, actor.pos.map), count = Object.keys(s.patches).length;
  let cache = depthCache.get(s);
  if (!cache || cache.day !== s.clock.day || cache.count !== count) { cache = { day: s.clock.day, count, maps: new Map() }; depthCache.set(s, cache); }
  let depths = cache.maps.get(map.id);
  if (!depths) {
    depths = new Uint8Array(map.width * map.height);
    const patchDepths = new Map<string, number>();
    for (const [key, ref] of Object.entries(s.maps[map.id]?.blight ?? {})) {
      const patch = s.patches[ref.patch]; if (!patch) continue;
      if (!patchDepths.has(patch.id)) {
        const depth = patchDepth(s, ctx, patch);
        patchDepths.set(patch.id, depth === "shallow" ? 1 : depth === "deep" ? 2 : 3);
      }
      const cell = parseCellKey(key);
      depths[cell.y * map.width + cell.x] = patchDepths.get(patch.id)!;
    }
    cache.maps.set(map.id, depths);
  }
  const cfg = worldRules(ctx).grid.blightCost, costs = [0, cfg.shallow, cfg.deep, cfg.core];
  return (cell: Cell, base: number): number | undefined => {
    const depth = depths[cell.y * map.width + cell.x]!;
    if (!depth) return base;
    if (layer === "ground" && depth !== 1) return undefined;
    return Math.max(base, costs[depth]!);
  };
}
export function actorPassable(s: CampaignState, ctx: OpsCtx, actor: ActorState, cell: Cell): boolean {
  const map = gridOf(ctx.world, actor.pos.map);
  if (!inBounds(map, cell)) return false;
  const layer = actor.layer ?? actorDefinition(ctx, actor).layer;
  const cost = terrainAt(map, cell)[layer === "air" ? "airCost" : "groundCost"];
  return cost !== null && actorCost(s, ctx, actor)(cell, cost) !== undefined;
}
const routeCache = new WeakMap<CampaignState, { day: number; paths: Map<string, Cell[]> }>();
function actorPath(s: CampaignState, ctx: OpsCtx, a: ActorState, target: Loc): Cell[] {
  const layer = a.layer ?? actorDefinition(ctx, a).layer;
  // 鄰格目標已由行為表挑定，直接走這一步，不必為返巢巡遊掃描整張圖。
  if (chebyshev(a.pos.cell, target.cell) === 1) return [{ ...target.cell }];
  if (cellKey(a.pos.cell) === cellKey(target.cell)) return [];
  let cached = routeCache.get(s);
  if (!cached || cached.day !== s.clock.day) { cached = { day: s.clock.day, paths: new Map() }; routeCache.set(s, cached); }
  const key = `${a.pos.map}/${layer}/${cellKey(a.pos.cell)}/${cellKey(target.cell)}`;
  const old = cached.paths.get(key); if (old) return old.map(c => ({ ...c }));
  const path = findPath(gridOf(ctx.world, a.pos.map), a.pos.cell, target.cell, { layer, mp: a.mp }, actorCost(s, ctx, a))?.cells ?? [];
  cached.paths.set(key, path); return path.map(c => ({ ...c }));
}
export type SpawnActorInput = { kind: ActorKind; at: Loc; faction?: string; def?: string; goal?: ActorState["goal"];
  swarm?: ActorState["swarm"]; flags?: string[]; str?: number; id?: string; operation?: string };
export function spawnActor(s: CampaignState, ctx: OpsCtx, input: SpawnActorInput): ActorState | undefined {
  if (Object.keys(s.actors).length >= actorRules(ctx).max) return;
  const def = actorDefinition(ctx, input);
  s.flags.actorSerial ??= 0;
  const id = input.id ?? `actor-${++s.flags.actorSerial}`;
  if (s.actors[id]) return s.actors[id];
  const actor: ActorState = { id, def: def.id, kind: input.kind, faction: input.faction ?? "", pos: structuredClone(input.at),
    mp: def.mp, layer: def.layer, contact: def.contact, str: input.str ?? rollInt(s.actorRng ??= structuredClone(s.rng), ...def.str),
    goal: structuredClone(input.goal ?? { type: "idle" }), stance: def.stance, born: s.clock.day,
    flags: [...(input.flags ?? [])], home: structuredClone(input.at), lastMoveDay: s.clock.day,
    ...(input.swarm ? { swarm: structuredClone(input.swarm) } : {}), ...(input.operation ? { operation: input.operation } : {}) };
  if (!actorPassable(s, ctx, actor, actor.pos.cell)) return;
  if (def.spawn.maxAge) actor.expires = s.clock.day + def.spawn.maxAge;
  s.actors[id] = actor;
  ctx.emit("ActorSpawned", { actor: id, kind: actor.kind, faction: actor.faction, loc: actor.pos });
  return actor;
}
export function despawnActor(s: CampaignState, ctx: OpsCtx, id: string, reason: string): void {
  const actor = s.actors[id]; if (!actor) return;
  delete s.actors[id];
  ctx.emit("ActorDespawned", { actor: id, kind: actor.kind, reason });
}
function owner(s: CampaignState, ctx: OpsCtx, place: string, fallback?: string): string {
  const raw = s.places[place]?.ownerOverride ?? fallback;
  return raw && factionId(s, ctx, raw) || Object.keys(s.factions).sort().find(id => s.factions[id]!.territoryNow.includes(place)) || "";
}
// SPEC-GAP（18:35 orders）：量級下限以每日有限補生維持，不改既有巡邏每城一支的限制。
function topUpPopulation(s: CampaignState, ctx: OpsCtx): void {
  const rules = actorRules(ctx);
  const alive = Object.values(s.actors).filter(a => (a.expires === undefined || a.expires > s.clock.day) && a.str > 0 &&
    (!a.swarm || s.rifts[a.swarm.rift]?.phase !== "closed") && actorPassable(s, ctx, a, a.pos.cell)).length;
  const count = Math.min(rules.maxTopUp, Math.max(0, rules.minPopulation - alive));
  if (!count) return;
  const places = allPlaces(s, ctx).sort((a, b) => a.id.localeCompare(b.id));
  const cities = places.filter(p => ["city", "port", "lunar-base"].includes(p.kind) && owner(s, ctx, p.id, p.owner));
  const rifts = Object.values(s.rifts).filter(r => r.phase === "anchored").sort((a, b) => a.id.localeCompare(b.id));
  for (let n = 0; n < count; n++) {
    let spawned: ActorState | undefined;
    for (const city of cities) {
      if (Object.values(s.actors).some(a => a.kind === "patrol" && a.flags.includes(city.id))) continue;
      spawned = spawnActor(s, ctx, { kind: "patrol", at: placeLoc(s, ctx, city.id), faction: owner(s, ctx, city.id, city.owner), flags: [city.id, "population-top-up"] });
      if (spawned) break;
    }
    if (!spawned) for (const r of rifts) {
      const family = ctx.world.get("rift", r.family) ?? ctx.world.all("rift").find(f => f.family === r.family);
      if (!family) continue;
      spawned = spawnActor(s, ctx, { kind: "swarm", at: r.at, faction: worldRules(ctx).places.insectOwner,
        swarm: { rift: r.id, family: family.family, grades: family.gradeByWidth[r.width] ?? [r.width] }, flags: ["population-top-up"] });
      if (spawned) break;
    }
    if (!spawned) {
      const faction = ctx.world.all("faction-ops").find(f => f.tags.includes("rival-hunters") || ctx.db.get("faction", f.faction)?.tags.includes("rival-hunters"))?.id;
      for (const mapId of Object.keys(s.maps).sort()) {
        const map = gridOf(ctx.world, mapId);
        for (let i = 0; i < map.width * map.height; i++) {
          const cell = { x: i % map.width, y: Math.floor(i / map.width) };
          if (terrainAt(map, cell).groundCost === null || places.some(p => p.map === mapId && cellKey(p.at) === cellKey(cell))) continue;
          const at = locAt(ctx, mapId, cell), def = actorDefinition(ctx, { kind: "band" });
          const cost = actorCost(s, ctx, { kind: "band", pos: at });
          if (cost(cell, terrainAt(map, cell)[def.layer === "air" ? "airCost" : "groundCost"] ?? Infinity) === undefined) continue;
          spawned = spawnActor(s, ctx, { kind: "band", at, faction, flags: ["population-top-up"] });
          if (spawned) break;
        }
        if (spawned) break;
      }
    }
    if (!spawned) break;
  }
}
function generatePopulation(s: CampaignState, ctx: OpsCtx, initial: boolean): void {
  s.flags.actorSerial ??= 0;
  const places = allPlaces(s, ctx).sort((a, b) => a.id.localeCompare(b.id));
  const patrol = ctx.world.require("actor", "actor/patrol"), caravan = ctx.world.require("actor", "actor/caravan"), band = ctx.world.require("actor", "actor/band");
  for (const p of places.filter(p => ["city", "port", "lunar-base"].includes(p.kind))) {
    const faction = owner(s, ctx, p.id, p.owner); if (!faction || !patrol.spawn.perCity) continue;
    const home = placeLoc(s, ctx, p.id);
    if (!Object.values(s.actors).some(a => a.kind === "patrol" && a.flags.includes(p.id))) spawnActor(s, ctx, { kind: "patrol", at: home, faction, flags: [p.id] });
  }
  const markets = places.filter(p => p.services.some(id => id.endsWith("service/market")));
  if (initial || s.clock.day % caravan.spawn.intervalDays! === 0) for (const a of markets) for (const b of markets) {
    if (a.id === b.id || a.map !== b.map) continue;
    const tag = `route:${a.id}>${b.id}`, current = Object.values(s.actors).filter(actor => actor.flags.includes(tag)).length;
    const count = initial ? (caravan.spawn.perRoute ?? 1) - current : Math.min(1, (caravan.spawn.perRoute ?? 1) - current);
    for (let i = 0; i < count; i++) {
      const actor = spawnActor(s, ctx, { kind: "caravan", at: placeLoc(s, ctx, a.id), faction: owner(s, ctx, a.id, a.owner),
        goal: { type: "trade", target: placeLoc(s, ctx, b.id) }, flags: [tag] });
      if (!actor) break;
      actor.destination = placeLoc(s, ctx, b.id);
      // 開局商隊已在途中，均勻分布於合法路徑，不在同一城疊出四十支。
      if (initial) {
        const path = findPath(gridOf(ctx.world, a.map), a.at, b.at, { layer: caravan.layer, mp: caravan.mp }, actorCost(s, ctx, actor));
        if (path?.cells.length) actor.pos = locAt(ctx, a.map, path.cells[Math.floor(i * path.cells.length / count)]!);
      }
    }
  }
  for (const f of ctx.world.all("faction-ops")) {
    const faction = ctx.db.get("faction", f.faction);
    if (!f.tags.includes("rival-hunters") && !faction?.tags.includes("rival-hunters")) continue;
    const home = s.factions[f.id]?.territoryNow.map(id => places.find(p => p.id === id)).find(p => p) ?? markets[0];
    if (!home) continue;
    const n = band.spawn.perFaction?.[1] ?? 1;
    for (let i = Object.values(s.actors).filter(a => a.kind === "band" && a.faction === f.id).length; i < n; i++)
      spawnActor(s, ctx, { kind: "band", at: placeLoc(s, ctx, home.id), faction: f.id });
  }
  const swarm = ctx.world.require("actor", "actor/swarm");
  for (const r of Object.values(s.rifts).sort((a, b) => a.id.localeCompare(b.id))) {
    if (r.phase !== "anchored") continue;
    const family = ctx.world.get("rift", r.family) ?? ctx.world.all("rift").find(d => d.family === r.family);
    if (!family || family.family === "mycelium") continue;
    if (!initial && (family.family === "insect" ? s.clock.phase !== "spring" : s.clock.day % swarm.spawn.intervalDays! !== 0)) continue;
    for (let i = 0; i < (swarm.spawn.perRift ?? 1); i++) {
      const map = gridOf(ctx.world, r.at.map), cells = cellsWithin(map, r.at.cell, swarm.behavior.wanderRadius);
      const at = cells.length ? locAt(ctx, r.at.map, cells[nextInt(s.actorRng ??= structuredClone(s.rng), cells.length)]!) : r.at;
      spawnActor(s, ctx, { kind: "swarm", at, faction: worldRules(ctx).places.insectOwner,
        swarm: { rift: r.id, family: family.family, grades: family.gradeByWidth[r.width] ?? [r.width] } });
    }
  }
  topUpPopulation(s, ctx);
}
export function initActors(s: CampaignState, ctx: OpsCtx): void {
  if (s.flags.actorsInitialized || !ctx.world.all("actor").length) return;
  s.flags.actorsInitialized = 1; generatePopulation(s, ctx, true); s.flags.actorPopulationDay = s.clock.day;
}
function distance(a: Loc, b: Loc): number { return a.map === b.map ? chebyshev(a.cell, b.cell) : Infinity; }
function hostileBetween(s: CampaignState, ctx: OpsCtx, a: ActorState, b: ActorState): boolean {
  if (a.faction === b.faction) return false;
  if (a.kind === "swarm" || b.kind === "swarm") return true;
  const x = factionId(s, ctx, a.faction), y = factionId(s, ctx, b.faction);
  return !!x && !!y && ["war", "hostile"].includes(relation(s, x, y)?.state ?? "neutral");
}
function localGoal(actor: ActorState, s: CampaignState, ctx: OpsCtx, rng: RngState, radius: number): Loc {
  const cells = cellsWithin(gridOf(ctx.world, actor.pos.map), actor.pos.cell, radius)
    .filter(c => cellKey(c) !== cellKey(actor.pos.cell) && actorPassable(s, ctx, actor, c));
  return cells.length ? locAt(ctx, actor.pos.map, cells[nextInt(rng, cells.length)]!) : actor.pos;
}
/** 選目標只回傳副本；世界狀態唯讀，亂數狀態由每日編排者持有。 */
export function planActor(actor: ActorState, s: CampaignState, ctx: OpsCtx, rng: RngState): ActorState {
  const a = structuredClone(actor), def = actorDefinition(ctx, a), day = s.clock.day;
  if (a.lastPlanDay === day) return a;
  const playerActive = !s.log.some(e => e.type === "CampaignEnd") && !isSafelyDocked(s, ctx);
  if ((!playerActive || !actorHostile(s, ctx, a)) && a.flags.includes("hunting-player")) {
    a.goal = { type: "return", target: a.home }; a.path = [];
    a.flags = a.flags.filter(f => f !== "hunting-player");
  }
  const nearest = (locs: Loc[]) => locs.filter(l => l.map === a.pos.map).sort((x, y) => distance(a.pos, x) - distance(a.pos, y) || cellKey(x.cell).localeCompare(cellKey(y.cell)))[0];
  const places = allPlaces(s, ctx), cities = places.filter(p => ["city", "port", "lunar-base"].includes(p.kind)).map(p => placeLoc(s, ctx, p.id));
  let target = typeof a.goal.target === "string" ? s.actors[a.goal.target]?.pos : a.goal.target;
  const arrived = target && distance(a.pos, target) === 0;
  const stale = day - (a.lastMoveDay ?? a.born) >= def.behavior.maxIdleDays;
  // SPEC-GAP：wary 的繞船規則也適用商隊與非敵對巡邏，不把停泊船當攔截目標。
  const avoidShip = playerActive && a.stance === "wary" && !actorHostile(s, ctx, a) && a.pos.map === s.ship.pos.map;
  const contact = Math.max(actorContact(ctx, a), worldRules(ctx).grid.contact.air);
  if (avoidShip && distance(a.pos, s.ship.pos) <= contact) {
    const away = cellsWithin(gridOf(ctx.world, a.pos.map), a.pos.cell, def.behavior.wanderRadius)
      .filter(c => actorPassable(s, ctx, a, c))
      .sort((x, y) => chebyshev(y, s.ship.pos.cell) - chebyshev(x, s.ship.pos.cell) || x.y - y.y || x.x - y.x)[0];
    target = away ? locAt(ctx, a.pos.map, away) : a.pos; a.goal = { type: "flee", target };
  } else if (a.kind === "force") {
    const op = s.operations?.[a.operation ?? ""];
    if (op) { a.str = strength(op.force, op.power ?? modelPower(ctx)); a.goal = { type: op.phase === "march" ? "goto" : "idle", target: op.target.loc }; }
    if (op?.phase !== "march") { a.path = []; a.lastPlanDay = day; return a; }
    target = op.target.loc;
  } else if (a.kind === "patrol") {
    const enemy = Object.values(s.actors).filter(b => hostileBetween(s, ctx, a, b) && b.str < a.str && distance(a.pos, b.pos) <= def.behavior.wanderRadius)
      .sort((x, y) => distance(a.pos, x.pos) - distance(a.pos, y.pos) || x.id.localeCompare(y.id))[0];
    if (a.goal.type === "hunt" && (a.goal.until ?? 0) > day) target = typeof a.goal.target === "string" ? s.actors[a.goal.target]?.pos : s.ship.pos;
    else if (a.goal.type === "hunt") { a.goal = { type: "return", target: a.home }; target = a.home; }
    else if (playerActive && a.goal.type !== "return" && actorHostile(s, ctx, a) && a.str > estimateShipStrength(s, ctx) && distance(a.pos, s.ship.pos) <= def.behavior.wanderRadius) {
      if (!a.flags.includes("hunting-player")) a.flags.push("hunting-player");
      a.goal = { type: "hunt", target: s.ship.pos, until: day + def.behavior.chaseDays }; target = s.ship.pos;
    } else if (a.goal.type !== "return" && enemy) { a.goal = { type: "hunt", target: enemy.id, until: day + def.behavior.chaseDays }; target = enemy.pos; }
    else if (!target || arrived || stale) {
      const territory = s.factions[a.faction]?.territoryNow ?? [];
      const stops = places.filter(p => territory.includes(p.id) && p.map === a.pos.map && distance(a.pos, placeLoc(s, ctx, p.id)) > 0);
      target = stops.length ? placeLoc(s, ctx, stops[nextInt(rng, stops.length)]!.id) : localGoal(a, s, ctx, rng, def.behavior.wanderRadius);
      a.goal = { type: "patrol", target };
    }
  } else if (a.kind === "caravan") {
    const threat = Object.values(s.actors).some(b => hostileBetween(s, ctx, a, b) && distance(a.pos, b.pos) <= def.behavior.wanderRadius);
    if (threat && a.goal.type !== "flee") { target = nearest(cities); a.goal = { type: "flee", target }; }
    else if (arrived) {
      if (a.goal.until === undefined) a.goal.until = day + def.behavior.stopDays;
      if (day < a.goal.until) { a.path = []; a.lastPlanDay = day; return a; }
      target = distance(a.pos, a.home!) === 0 ? a.destination : a.home;
      a.goal = { type: "trade", target };
    } else if (!target || stale) { target = a.destination ?? nearest(cities); a.goal = { type: "trade", target }; }
  } else if (a.kind === "swarm") {
    const family = a.swarm?.family;
    if (family === "insect" && day - a.born >= def.behavior.returnDay) {
      target = s.rifts[a.swarm!.rift]?.at ?? a.home;
      if (blightAt(s, ctx, a.pos)) {
        const homeCells = neighbors(gridOf(ctx.world, a.pos.map), a.pos.cell).filter(c => actorPassable(s, ctx, a, c) && blightAt(s, ctx, { ...a.pos, cell: c }));
        if (homeCells.length) target = locAt(ctx, a.pos.map, homeCells[nextInt(rng, homeCells.length)]!);
      }
      a.goal = { type: "return", target };
    }
    else if (family === "insect") {
      target = nearest([...cities, ...Object.values(s.actors).filter(b => b.kind === "caravan").map(b => b.pos)]);
      a.goal = { type: "raid", target };
    } else if (!target || arrived || stale || family === "alien" && s.clock.dom === 1) {
      const people = Object.values(s.actors).filter(b => b.kind !== "swarm" && distance(a.pos, b.pos) <= def.behavior.wanderRadius * 2);
      target = family === "beast" && people.length ? nearest(people.map(b => b.pos)) : localGoal(a, s, ctx, rng, def.behavior.wanderRadius);
      a.goal = { type: family === "alien" ? "idle" : "hunt", target };
    }
    if (family === "insect" && !blightAt(s, ctx, a.pos)) a.str *= 1 - def.behavior.decay;
  } else {
    if (playerActive && a.stance === "hostile" && a.str > estimateShipStrength(s, ctx) && distance(a.pos, s.ship.pos) <= def.behavior.wanderRadius) {
      if (!a.flags.includes("hunting-player")) a.flags.push("hunting-player");
      target = s.ship.pos; a.goal = { type: "hunt", target };
    } else if (a.stance === "wary" && distance(a.pos, s.ship.pos) <= def.contact) {
      target = localGoal(a, s, ctx, rng, def.behavior.wanderRadius); a.goal = { type: "flee", target };
    } else if (arrived && a.goal.type === "hunt" && a.goal.until === undefined) {
      a.goal.until = day + rollInt(rng, 1, def.behavior.stopDays); a.path = []; a.lastPlanDay = day; return a;
    } else if (arrived && (a.goal.until ?? day) > day) { a.path = []; a.lastPlanDay = day; return a; }
    else if (!target || arrived || stale) {
      const contracts = Object.values(s.contracts).filter(c => c.status === "offered" && c.target.loc?.map === a.pos.map &&
        (!c.target.snapshot || (ctx.world.all("forces")[0]?.gp[c.target.snapshot.width] ?? Infinity) <= a.str));
      target = nearest(contracts.map(c => c.target.loc!)) ?? localGoal(a, s, ctx, rng, def.behavior.wanderRadius);
      a.goal = { type: "hunt", target };
    }
  }
  if (a.goal.type !== "hunt" || typeof a.goal.target === "string") a.flags = a.flags.filter(f => f !== "hunting-player");
  a.lastPlanDay = day;
  if (!target || target.map !== a.pos.map) { a.path = []; return a; }
  const map = gridOf(ctx.world, a.pos.map), layer = a.layer ?? def.layer;
  // 地面部隊在蝕淵邊緣集結；不可把作戰核目的格當成可進格。
  if (!actorPassable(s, ctx, a, target.cell)) {
    const safe = cellsWithin(map, target.cell, def.behavior.wanderRadius).filter(c => actorPassable(s, ctx, a, c))
      .sort((x, y) => chebyshev(x, target!.cell) - chebyshev(y, target!.cell) || chebyshev(x, a.pos.cell) - chebyshev(y, a.pos.cell) || x.y - y.y || x.x - y.x)[0];
    if (safe) target = locAt(ctx, a.pos.map, safe); else { a.path = []; return a; }
  }
  if (a.kind === "force") a.destination = structuredClone(target);
  const sameTarget = actor.path?.at(-1) && cellKey(actor.path.at(-1)!) === cellKey(target.cell);
  if (!avoidShip && sameTarget && !stale && actor.path!.every(c => actorPassable(s, ctx, a, c))) return a;
  const outsideContact = (c: Cell) => chebyshev(c, s.ship.pos.cell) > Math.min(contact, distance(a.pos, s.ship.pos));
  const cost = actorCost(s, ctx, a);
  a.path = avoidShip ? findPath(map, a.pos.cell, target.cell, { layer, mp: a.mp },
    (c, base) => cellKey(c) === cellKey(a.pos.cell) || outsideContact(c) ? cost(c, base) : undefined)?.cells ?? [] : actorPath(s, ctx, a, target);
  if (!a.path.length && distance(a.pos, target) > 0 && a.kind !== "force") {
    const candidates = neighbors(map, a.pos.cell).filter(c => actorPassable(s, ctx, a, c) && (!avoidShip || outsideContact(c)));
    if (candidates.length) { const cell = candidates[nextInt(rng, candidates.length)]!; a.path = [cell]; a.goal = { type: "goto", target: locAt(ctx, a.pos.map, cell) }; }
  }
  return a;
}
export function actorsDaily2c(s: CampaignState, ctx: OpsCtx): void {
  initActors(s, ctx);
  if (s.flags.actorPopulationDay !== s.clock.day) { generatePopulation(s, ctx, false); s.flags.actorPopulationDay = s.clock.day; }
  for (const id of Object.keys(s.actors).sort()) {
    const a = s.actors[id]!;
    if (a.expires !== undefined && a.expires <= s.clock.day || a.str <= 0 || a.swarm && s.rifts[a.swarm.rift]?.phase === "closed") { despawnActor(s, ctx, id, "expired"); continue; }
    if (a.kind === "band" && a.goal.until === s.clock.day) ctx.emit("ContractContested", { actor: id, loc: a.pos });
    s.actors[id] = planActor(a, s, ctx, s.actorRng ??= structuredClone(s.rng));
  }
}
export function actorsDaily3(s: CampaignState, ctx: OpsCtx): void {
  for (const id of Object.keys(s.actors).sort()) {
    if (s.pendingEncounter?.actor === id) continue;
    const a = s.actors[id]!, def = actorDefinition(ctx, a), map = gridOf(ctx.world, a.pos.map), mover = { layer: a.layer ?? def.layer, mp: a.mp };
    let mp = a.mp + (a.mpCarry ?? 0);
    while (a.path?.length) {
      const next = a.path[0]!, cost = stepCost(map, mover, a.pos.cell, next, actorCost(s, ctx, a));
      if (cost === undefined) { a.path = []; break; }
      if (cost > mp) break;
      mp -= cost; a.pos = locAt(ctx, map.id, next); a.path.shift(); a.lastMoveDay = s.clock.day;
      if (a.operation && s.operations?.[a.operation]) s.operations[a.operation]!.force.pos = structuredClone(a.pos);
      checkActorContacts(s, ctx, id);
      if (s.pendingEncounter?.actor === id) break;
    }
    a.mpCarry = a.path?.length && !s.pendingEncounter ? mp : 0;
    if (!actorPassable(s, ctx, a, a.pos.cell)) despawnActor(s, ctx, id, "overrun");
    else checkActorContacts(s, ctx, id);
  }
}
