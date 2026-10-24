import { nextFloat } from "../../core/rng.ts";
import type { Cell } from "../../core/types-def.ts";
import type { CampaignState, Loc, MoveLeg, OpsCommand, OpsCtx } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import { evalOpsNum } from "../content/cond.ts";
import { locAt, placeAt, placeLoc } from "../war/loc.ts";
import { cellKey, cellsWithin, findPath, footprintOf, gridOf, stepCost, chebyshev } from "./grid.ts";
import { blightAt } from "./blight.ts";
import { allPlaces, placeDef, worldRules } from "./places.ts";
import type { CmdResult } from "./places.ts";

export type TravelPath = { legs: MoveLeg[]; days: number; fuel: number };
export type TravelState = CampaignState;
export function availableFuel(s: CampaignState): number { return Math.min(s.ship.fuel.cur, s.ledger.balances["stock:fuel"] ?? 0); }
export function isDocked(s: CampaignState, ctx: Pick<OpsCtx, "world">, place?: string): boolean {
  const here = placeAt(s, ctx, s.ship.pos);
  return !s.ship.path && !s.ship.drifting && !!here && (!place || placeDef(s, ctx, place)?.id === here);
}
function mover(s: CampaignState, ctx: OpsCtx) {
  const cfg = worldRules(ctx).grid;
  return { layer: s.ship.hull.cur <= 0 ? "ground" as const : "air" as const,
    mp: s.ship.hull.cur <= 0 ? cfg.hulkMp : cfg.shipMp * (s.ship.hull.cur < s.ship.hull.max / 2 ? cfg.mpMods.damaged : 1) *
      (s.clock.phase === "spring" ? cfg.mpMods.spring : s.clock.phase === "neap" ? cfg.mpMods.neap : 1) };
}
function costAt(s: CampaignState, ctx: OpsCtx, map: string) {
  const cfg = worldRules(ctx).grid, grid = gridOf(ctx.world, map);
  const zones = allPlaces(s, ctx).filter(p => p.map === map && s.places[p.id]?.blight)
    .map(p => ({ id: p.id, cells: footprintOf(p), blight: s.places[p.id]!.blight! }));
  const field = new Map<string, { distance: number; depth: "shallow" | "deep" | "core" }>();
  for (const zone of zones) for (const origin of zone.cells) for (const cell of cellsWithin(grid, origin, cfg.interimZoneRadius)) {
    const key = cellKey(cell), distance = chebyshev(origin, cell), old = field.get(key);
    if (!old || distance < old.distance) field.set(key, { distance, depth: zone.blight.depth });
  }
  return (cell: Cell, cost: number) => {
    const b = field.get(cellKey(cell));
    if (s.ship.hull.cur <= 0 && b && b.depth !== "shallow") return undefined;
    return b ? Math.max(cost, cfg.blightCost[b.depth]) : cost;
  };
}
function resolveLoc(s: CampaignState, ctx: OpsCtx, value: Loc | string): Loc | undefined {
  if (typeof value !== "string") return value;
  return placeDef(s, ctx, value) ? placeLoc(s, ctx, value) : undefined;
}
function landPath(s: CampaignState, ctx: OpsCtx, a: Loc, b: Loc) {
  return a.map === b.map ? findPath(gridOf(ctx.world, a.map), a.cell, b.cell, mover(s, ctx), costAt(s, ctx, a.map)) : undefined;
}
function waitDays(s: CampaignState, ctx: OpsCtx, days: readonly number[], offset: number): number {
  if (!days.length) return 0;
  const month = ctx.world.require("calendar", s.calendar).daysPerMonth;
  const dom = (s.clock.dom - 1 + offset) % month + 1;
  return Math.min(...days.map(d => (d - dom + month) % month));
}
export function shortestPath(s: CampaignState, ctx: OpsCtx, from: Loc | string, to: Loc | string, offset = 0): TravelPath | undefined {
  const a = resolveLoc(s, ctx, from), b = resolveLoc(s, ctx, to);
  if (!a || !b) return undefined;
  const dailyFuel = s.ship.hull.cur <= 0 ? 0 : worldRules(ctx).travel.fuelPerDay;
  const direct = landPath(s, ctx, a, b);
  let best: TravelPath | undefined = direct ? { legs: [{ map: a.map, cells: direct.cells }], days: direct.days, fuel: direct.days * dailyFuel } : undefined;
  for (const lane of ctx.world.all("lane")) for (const [start, end] of [[lane.a, lane.b], [lane.b, lane.a]] as const) {
    const port = resolveLoc(s, ctx, start!), exit = resolveLoc(s, ctx, end!);
    if (!port || !exit || port.map !== a.map || exit.map !== b.map) continue;
    const before = landPath(s, ctx, a, port), after = landPath(s, ctx, exit, b);
    if (!before || !after) continue;
    // 航道在到港後的下一個 tick 開始，空的首段不多耗一天。
    const waiting = waitDays(s, ctx, lane.departDays ?? [], offset + before.days + 1);
    const candidate = { legs: [{ map: a.map, cells: before.cells, lane: { id: lane.id, to: exit } }, { map: b.map, cells: after.cells }],
      days: before.days + waiting + lane.days + after.days,
      fuel: (before.days + after.days) * dailyFuel + lane.days * (lane.fuelPerDay ?? 0) };
    if (!best || candidate.days < best.days) best = candidate;
  }
  return best;
}
function spendFuel(s: CampaignState, ctx: OpsCtx, amount: number): void {
  if (!amount) return;
  const ref = eventRef(ctx.emit("FuelUsed", { loc: s.ship.pos, amount }));
  post(s, ctx, { account: "stock:fuel", delta: -amount, reason: "travel", ref });
  s.ship.fuel.cur -= amount;
}
function overload(s: CampaignState, ctx: OpsCtx): boolean {
  const cargo = s.inventory.components.reduce((sum, c) => sum + ctx.db.require("component", c.def).size, 0);
  return cargo > s.ship.capacity.cargo || Object.keys(s.roster.persons).length > s.ship.capacity.berths ||
    s.hangar.bays.filter(Boolean).length + s.hangar.dormant.filter(id => !s.hangar.bays.includes(id)).length > s.ship.capacity.mechBays;
}
export function cmdSail(s: CampaignState, ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "sail" }>): CmdResult {
  if (s.pendingBattle || s.pendingChoices.length) return { ok: false, error: "pending-encounter" };
  if (s.ship.path?.lane) return { ok: false, error: "in-transit" };
  if (overload(s, ctx)) return { ok: false, error: "overloaded" };
  const target = typeof cmd.to === "object" && "actor" in cmd.to ? s.actors[cmd.to.actor]?.pos :
    typeof cmd.to === "string" ? resolveLoc(s, ctx, cmd.to) : locAt(ctx, s.ship.pos.map, cmd.to);
  if (!target) return { ok: false, error: typeof cmd.to === "object" ? "unknown-actor" : "unknown-place" };
  const via = (cmd.via ?? []).map(p => typeof p === "string" ? resolveLoc(s, ctx, p) : locAt(ctx, s.ship.pos.map, p));
  if (via.some(p => !p)) return { ok: false, error: "no-route" };
  let from = s.ship.pos;
  const path: TravelPath = { legs: [], days: 0, fuel: 0 };
  for (const waypoint of [...via, target] as Loc[]) {
    const part = shortestPath(s, ctx, from, waypoint, path.days);
    if (!part) return { ok: false, error: "no-route" };
    for (const leg of part.legs) {
      const last = path.legs.at(-1);
      if (last && !last.lane && last.map === leg.map) { last.cells.push(...leg.cells); last.lane = leg.lane; }
      else path.legs.push(leg);
    }
    path.days += part.days; path.fuel += part.fuel; from = waypoint;
  }
  // via 同圖段連續走，估計日數按合併後成本計，不能每個途經點各自進位。
  let estimateFrom = s.ship.pos;
  path.days = 0; path.fuel = 0;
  for (const leg of path.legs) {
    const map = gridOf(ctx.world, leg.map), moving = mover(s, ctx), cost = costAt(s, ctx, leg.map);
    let total = 0, previous = estimateFrom.cell;
    for (const cell of leg.cells) { total += stepCost(map, moving, previous, cell, cost)!; previous = cell; }
    const days = Math.ceil(total / moving.mp);
    path.days += days; path.fuel += days * (s.ship.hull.cur <= 0 ? 0 : worldRules(ctx).travel.fuelPerDay);
    if (leg.lane) {
      const lane = ctx.world.require("lane", leg.lane.id);
      path.days += waitDays(s, ctx, lane.departDays ?? [], path.days + 1) + lane.days;
      path.fuel += lane.days * (lane.fuelPerDay ?? 0); estimateFrom = leg.lane.to;
    } else estimateFrom = locAt(ctx, leg.map, previous);
  }
  if (!path.legs.some(l => l.cells.length || l.lane) || !via.length && typeof cmd.to === "string" && placeAt(s, ctx, s.ship.pos) === placeDef(s, ctx, cmd.to)?.id) return { ok: false, error: "already-there" };
  if (availableFuel(s) < path.fuel) return { ok: false, error: "insufficient-fuel" };
  s.ship.path = { cells: path.legs[0]!.cells, legs: path.legs, to: typeof cmd.to === "string" ? { place: placeDef(s, ctx, cmd.to)!.id } :
    "actor" in cmd.to ? { actor: cmd.to.actor } : target, via: via as Loc[] };
  s.ship.mpCarry = 0; s.ship.drifting = false; s.pendingTicks = path.days;
  const here = placeAt(s, ctx, s.ship.pos);
  ctx.emit("Sailed", { ...(here ? { node: here, place: here } : {}), loc: s.ship.pos,
    to: typeof cmd.to === "string" ? placeDef(s, ctx, cmd.to)!.id : `${target.map}:${cellKey(target.cell)}`, days: path.days });
  return { ok: true };
}
function stop(s: CampaignState): void { delete s.ship.path; s.ship.mpCarry = 0; s.pendingTicks = 0; }
function arrived(s: CampaignState, ctx: OpsCtx): void {
  const place = placeAt(s, ctx, s.ship.pos);
  if (place) s.places[place]!.lastVisit = s.clock.day;
  stop(s); ctx.emit("Arrived", { ...(place ? { place, node: place } : {}), cell: s.ship.pos.cell, loc: s.ship.pos });
}
export function moveDaily3(s: CampaignState, ctx: OpsCtx): void {
  if (s.pendingBattle || s.pendingChoices.length || !s.ship.path) return;
  const path = s.ship.path, leg = path.legs[0];
  if (!leg) { arrived(s, ctx); return; }
  path.cells = leg.cells;
  if (!leg.cells.length && leg.lane) {
    const lane = ctx.world.require("lane", leg.lane.id);
    if (!path.lane && lane.departDays?.length && !lane.departDays.includes(s.clock.dom)) { s.ship.mpCarry = 0; ctx.emit("Waiting", { lane: lane.id }); return; }
    const fuel = lane.fuelPerDay ?? 0;
    if (availableFuel(s) < fuel) { stop(s); s.ship.drifting = true; return; }
    path.lane ??= { id: lane.id, daysLeft: lane.days };
    spendFuel(s, ctx, fuel); path.lane.daysLeft--; s.ship.mpCarry = 0;
    if (path.lane.daysLeft <= 0) {
      // SPEC-GAP：carriesShip:false 本波仍攜船過圖，第三波再分離載具。
      s.ship.pos = structuredClone(leg.lane.to);
      const fare = evalOpsNum(s, ctx, lane.fare ?? 0);
      const ref = eventRef(ctx.emit("LaneFare", { lane: lane.id, amount: fare }));
      post(s, ctx, { account: "cash", delta: -fare, reason: "lane-fare", ref });
      delete path.lane; path.legs.shift(); path.cells = path.legs[0]?.cells ?? [];
      if (!path.cells.length && !path.legs[0]?.lane) arrived(s, ctx);
    }
    return;
  }
  const moving = mover(s, ctx), map = gridOf(ctx.world, leg.map), costForCell = costAt(s, ctx, leg.map), dailyFuel = s.ship.hull.cur <= 0 ? 0 : worldRules(ctx).travel.fuelPerDay;
  let mp = moving.mp + s.ship.mpCarry, moved = false, depth: "shallow" | "deep" | "core" | undefined, rift: string | undefined;
  while (leg.cells.length) {
    const cell = leg.cells[0]!, cost = stepCost(map, moving, s.ship.pos.cell, cell, costForCell);
    if (cost === undefined) { stop(s); ctx.emit("TravelBlocked", { loc: s.ship.pos }); break; }
    if (cost > mp) break;
    const b = blightAt(s, ctx, locAt(ctx, leg.map, cell)), fuel = dailyFuel * (depth && depth !== "shallow" || b && b.depth !== "shallow" ? 2 : 1);
    if (availableFuel(s) < fuel) { stop(s); s.ship.drifting = true; break; }
    mp -= cost; s.ship.pos = locAt(ctx, leg.map, cell); leg.cells.shift(); moved = true;
    while (path.via[0]?.map === s.ship.pos.map && cellKey(path.via[0].cell) === cellKey(cell)) path.via.shift();
    if (b && (!depth || worldRules(ctx).grid.blightEncounter[b.depth] > worldRules(ctx).grid.blightEncounter[depth])) { depth = b.depth; rift = b.rift; }
    if (path.legs.length === 1 && !path.via.length && "place" in path.to && placeAt(s, ctx, s.ship.pos) === path.to.place) { leg.cells.length = 0; break; }
  }
  if (moved) spendFuel(s, ctx, dailyFuel * (depth && depth !== "shallow" ? 2 : 1));
  if (s.ship.path) {
    if (!leg.cells.length && !leg.lane) { path.legs.shift(); path.cells = path.legs[0]?.cells ?? []; }
    if (!path.legs.length) arrived(s, ctx);
    else s.ship.mpCarry = leg.cells.length ? mp : 0;
  }
  if (moved && depth && rift && nextFloat(s.rng) < worldRules(ctx).grid.blightEncounter[depth]) {
    const place = placeAt(s, ctx, s.ship.pos);
    s.pendingBattle = { id: nextId(s, "sortie"), day: s.clock.day, loc: structuredClone(s.ship.pos), ...(place ? { place } : {}), rift, trigger: "ambush", units: [],
      supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: s.ship.hull.cur > 0 }, injected: [] };
    ctx.emit("Encounter", { ...(place ? { place, node: place } : {}), loc: s.ship.pos, rift, sortie: s.pendingBattle.id });
  }
}
export function cmdDock(s: CampaignState, ctx: OpsCtx, _cmd: Extract<OpsCommand, { v: "dock" }>): CmdResult {
  if (s.pendingBattle || s.pendingChoices.length) return { ok: false, error: "pending-encounter" };
  if (s.ship.path?.lane) return { ok: false, error: "in-transit" };
  if (!placeAt(s, ctx, s.ship.pos)) return { ok: false, error: "no-place" };
  stop(s); s.ship.drifting = false; return { ok: true };
}
export function cmdDrift(s: CampaignState, ctx: OpsCtx, _cmd: Extract<OpsCommand, { v: "drift" }>): CmdResult {
  if (s.pendingChoices.length) return { ok: false, error: "pending-choice" };
  if (s.ship.path?.lane) return { ok: false, error: "in-transit" };
  if (s.pendingBattle && s.pendingBattle.trigger !== "ambush") return { ok: false, error: "pending-battle" };
  const cost = s.pendingBattle ? worldRules(ctx).travel.retreatFuel : 0;
  if (availableFuel(s) < cost) return { ok: false, error: "insufficient-fuel" };
  spendFuel(s, ctx, cost); delete s.pendingBattle; stop(s); s.ship.drifting = true; return { ok: true };
}
export function cmdMap(_s: CampaignState, _ctx: OpsCtx, _cmd: Extract<OpsCommand, { v: "map" }>): CmdResult { return { ok: true }; }
