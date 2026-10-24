import { nextFloat } from "../../core/rng.ts";
import type { CampaignState, OpsCommand, OpsCtx, RouteDef } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import { routeOpen, worldRules } from "./nodes.ts";
import type { CmdResult } from "./nodes.ts";

export type TravelPath = { nodes: string[]; routes: string[]; days: number; fuel: number };
// SPEC-GAP：route.via 存剩餘節點（含目的地），daysLeft 存目前這一段；ship.at 是最後抵達節點。
export type TravelState = CampaignState & { drifting?: boolean };
function legDays(ctx: OpsCtx, route: RouteDef): number { return Math.ceil(route.days * worldRules(ctx).travel.daysMultiplier); }
function legFuel(s: CampaignState, ctx: OpsCtx, route: RouteDef): number { return s.ship.hull.cur <= 0 ? 0 : legDays(ctx, route) * worldRules(ctx).travel.fuelPerDay; }
function routesFrom(s: CampaignState, ctx: OpsCtx, node: string): RouteDef[] {
  return ctx.world.all("route").filter(r => r.kind === (s.ship.hull.cur <= 0 ? "ground" : "air") && (r.a === node || r.b === node) && routeOpen(s, r));
}
export function shortestPath(s: CampaignState, ctx: OpsCtx, from: string, to: string): TravelPath | undefined {
  const start = ctx.world.get("node", from)?.id, end = ctx.world.get("node", to)?.id;
  if (!start || !end) return undefined;
  const best = new Map<string, TravelPath>([[start, { nodes: [], routes: [], days: 0, fuel: 0 }]]), visited = new Set<string>();
  while (true) {
    const current = [...best.keys()].filter(id => !visited.has(id)).sort((a, b) => best.get(a)!.days - best.get(b)!.days || (a < b ? -1 : a > b ? 1 : 0))[0];
    if (!current) return undefined;
    const path = best.get(current)!;
    if (current === end) return path;
    visited.add(current);
    for (const route of routesFrom(s, ctx, current)) {
      const next = route.a === current ? route.b : route.a;
      const candidate = { nodes: [...path.nodes, next], routes: [...path.routes, route.id], days: path.days + legDays(ctx, route), fuel: path.fuel + legFuel(s, ctx, route) };
      if (!best.has(next) || candidate.days < best.get(next)!.days) best.set(next, candidate);
    }
  }
}
function availableFuel(s: CampaignState): number { return Math.min(s.ship.fuel.cur, s.ledger.balances["stock:fuel"] ?? 0); }
function spendFuel(s: CampaignState, ctx: OpsCtx, amount: number): void {
  if (!amount) return;
  const ref = eventRef(ctx.emit("FuelUsed", { node: s.ship.at, amount }));
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
  if (overload(s, ctx)) return { ok: false, error: "overloaded" };
  const target = ctx.world.get("node", cmd.to);
  if (!target) return { ok: false, error: "unknown-node" };
  let from = s.ship.at;
  const path: TravelPath = { nodes: [], routes: [], days: 0, fuel: 0 };
  for (const waypoint of [...(cmd.via ?? []), target.id]) {
    const part = shortestPath(s, ctx, from, waypoint);
    if (!part) return { ok: false, error: "no-route" };
    path.nodes.push(...part.nodes); path.routes.push(...part.routes); path.days += part.days; path.fuel += part.fuel;
    from = ctx.world.require("node", waypoint).id;
  }
  if (!path.nodes.length) return { ok: false, error: "already-there" };
  if (availableFuel(s) < path.fuel) return { ok: false, error: "insufficient-fuel" };
  const first = ctx.world.require("route", path.routes[0]!);
  spendFuel(s, ctx, legFuel(s, ctx, first));
  s.ship.route = { to: target.id, via: path.nodes, daysLeft: legDays(ctx, first) };
  (s as TravelState).drifting = false;
  s.pendingTicks = path.days;
  ctx.emit("Sailed", { node: s.ship.at, to: target.id, days: path.days });
  return { ok: true };
}
export function travelDaily3(s: CampaignState, ctx: OpsCtx): void {
  if (s.pendingBattle || s.pendingChoices.length || !s.ship.route) return;
  const route = s.ship.route, next = route.via?.[0] ?? route.to;
  const edge = routesFrom(s, ctx, s.ship.at).filter(r => r.a === next || r.b === next).sort((a, b) => legDays(ctx, a) - legDays(ctx, b))[0];
  if (!edge) { delete s.ship.route; s.pendingTicks = 0; ctx.emit("TravelBlocked", { node: s.ship.at, to: next }); return; }
  if (route.daysLeft === 0) {
    const fuel = legFuel(s, ctx, edge);
    if (availableFuel(s) < fuel) { delete s.ship.route; s.pendingTicks = 0; ctx.emit("TravelBlocked", { node: s.ship.at, to: next }); return; }
    spendFuel(s, ctx, fuel); route.daysLeft = legDays(ctx, edge);
  }
  route.daysLeft--;
  if (route.daysLeft > 0) return;
  s.ship.at = next;
  s.nodes[next]!.lastVisit = s.clock.day;
  route.via?.shift();
  if (next === route.to && !route.via?.length) delete s.ship.route;
  ctx.emit("Arrived", { node: next });
  const blight = s.nodes[next]!.blight;
  if (blight?.depth === "shallow" && nextFloat(s.rng) < worldRules(ctx).travel.shallowEncounterChance) {
    s.pendingBattle = { id: nextId(s, "sortie"), day: s.clock.day, node: next, rift: blight.rift, trigger: "ambush", units: [],
      supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: s.ship.hull.cur > 0 }, injected: [] };
    ctx.emit("Encounter", { node: next, rift: blight.rift, sortie: s.pendingBattle.id });
  }
}
export function cmdDock(s: CampaignState, _ctx: OpsCtx, _cmd: Extract<OpsCommand, { v: "dock" }>): CmdResult {
  if (s.pendingBattle || s.pendingChoices.length) return { ok: false, error: "pending-encounter" };
  if (s.ship.route && s.ship.route.daysLeft > 0) return { ok: false, error: "in-transit" };
  delete s.ship.route; (s as TravelState).drifting = false; s.pendingTicks = 0;
  return { ok: true };
}
export function cmdDrift(s: CampaignState, ctx: OpsCtx, _cmd: Extract<OpsCommand, { v: "drift" }>): CmdResult {
  if (s.pendingChoices.length) return { ok: false, error: "pending-choice" };
  if (s.pendingBattle && s.pendingBattle.trigger !== "ambush") return { ok: false, error: "pending-battle" };
  const cost = s.pendingBattle ? worldRules(ctx).travel.retreatFuel : 0;
  if (availableFuel(s) < cost) return { ok: false, error: "insufficient-fuel" };
  spendFuel(s, ctx, cost); delete s.pendingBattle; delete s.ship.route;
  (s as TravelState).drifting = true; s.pendingTicks = 0;
  return { ok: true };
}
export function cmdMap(_s: CampaignState, _ctx: OpsCtx, _cmd: Extract<OpsCommand, { v: "map" }>): CmdResult { return { ok: true }; }
