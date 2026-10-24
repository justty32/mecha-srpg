import { nextInt, pickWeighted } from "../../core/rng.ts";
import type { ActorState, CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { BattleResult } from "../sortie/apply.ts";
import { post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import { nextId } from "../state/ids.ts";
import { evalOpsCond } from "../content/cond.ts";
import { modelPower, strength } from "../war/forces.ts";
import { factionId, relation } from "../war/relations.ts";
import { locAt, placeAt } from "../war/loc.ts";
import { blightAt } from "./blight.ts";
import { cellsWithin, chebyshev, findPath, gridOf, neighbors, stepCost } from "./grid.ts";
import { availableFuel, isSafelyDocked, recordShipMovement, shipMover, spendFuel } from "./move.ts";
import { worldRules } from "./places.ts";

function encounterRules(ctx: OpsCtx) {
  return (worldRules(ctx) as ReturnType<typeof worldRules> & { actors: { evadeSpeedRatio: number; evadeBase: number; deepPenalty: number; maxEncountersPerDay: number; plunder: number } }).actors;
}

export function actorHostile(s: CampaignState, ctx: OpsCtx, actor: ActorState): boolean {
  if (actor.kind === "swarm") return true;
  if (actor.kind === "caravan" || actor.kind === "band") return actor.stance === "hostile";
  const faction = factionId(s, ctx, actor.faction), player = factionId(s, ctx, "faction/migrant-crew");
  const rel = faction && player ? relation(s, faction, player) : undefined;
  if (actor.kind === "patrol") return (faction ? s.factions[faction]?.rep ?? 0 : 0) <= -30 || rel?.state === "war";
  if (actor.stance === "hostile") return true;
  return (faction ? s.factions[faction]?.rep ?? 0 : 0) <= -30 || !!rel && ["hostile", "war"].includes(rel.state);
}
export function estimateShipStrength(s: CampaignState, ctx: OpsCtx): number {
  const gp = ctx.world.all("forces")[0]?.gp;
  const crew = Object.keys(s.roster.persons).sort().filter(id => !s.roster.dead.some(d => d.person === id) && s.roster.persons[id]!.pools.hp?.cur !== 0);
  const assigned = new Set<string>();
  let total = 0;
  for (const id of [...new Set(s.hangar.bays.filter((id): id is string => !!id))].sort()) {
    const mech = s.mechs[id];
    if (!mech || s.hangar.dormant.includes(id) || s.jobs.some(j => j.target === id && (j.paid || j.doneHours > 0) && j.doneHours < j.needHours)) continue;
    const frame = ctx.db.require("frame", mech.frame), body = ctx.db.require("bodyplan", frame.bodyPlan);
    if (body.parts.some(p => (p.functions.includes("core") || p.functions.includes("locomotion")) && (!mech.parts[p.id] || mech.parts[p.id]!.broken))) continue;
    const abilities = [...frame.innateAbilities];
    for (const part of body.parts) {
      const state = mech.parts[part.id]; if (!state || state.broken) continue;
      const components = Object.keys(state.components).sort().flatMap(slot => {
        const item = state.components[slot], def = item && ctx.db.get("component", s.inventory.components.find(c => c.id === item)?.def ?? item);
        return def ? [def] : [];
      });
      let layer = state.layers.length - components.filter(c => c.hp !== undefined).length;
      for (const component of components) {
        const hp = component.hp === undefined ? undefined : state.layers[layer++];
        if (component.hp === undefined || hp && !hp.broken && hp.hp > 0) abilities.push(...component.abilities);
      }
    }
    if (!abilities.some(id => {
      const ability = ctx.db.require("ability", id);
      const ammo = [...(ability.ammoPool ? [ability.ammoPool] : []), ...ability.costs.filter(c => c.pool.startsWith("ammo")).map(c => c.pool)];
      return ability.mode === "activated" && ammo.every(pool => (mech.pools[pool]?.cur ?? 0) > 0);
    })) continue;
    const captured = s.flags[`captured:${id}`] === 1 || ctx.db.all("species").some(sp => sp.capture.frame === frame.id);
    const pilot = crew.find(pid => !assigned.has(pid) && body.parts.some(p => p.seats?.some(seat => seat.accepts.includes(ctx.db.require("person", s.roster.persons[pid]!.def).kind === "soul" ? "soul" : "pilot"))));
    if (!captured && !pilot) continue;
    if (!captured) assigned.add(pilot!);
    const layers = body.parts.flatMap(part => (mech.parts[part.id]?.layers ?? []).map((layer, i) => ({ hp: layer.hp, maxHp: layer.maxHp ?? part.layers[i]?.hp ?? layer.hp })));
    const maximum = layers.reduce((n, l) => n + l.maxHp, 0);
    const health = maximum ? layers.reduce((n, l) => n + Math.max(0, l.hp), 0) / maximum : 0;
    total += (gp?.[frame.grade] ?? 0) * health;
  }
  return total;
}
/** SPEC-GAP（18:10 orders）：無可戰機組且付不起脫離燃料時，以被劫解除遭遇。 */
export function settleHelplessEncounter(s: CampaignState, ctx: OpsCtx): boolean {
  const pending = s.pendingEncounter, battle = s.pendingBattle;
  if (!pending && (!battle || !battle.actors?.length && !["ambush", "intercept"].includes(battle.trigger))) return false;
  const travel = worldRules(ctx).travel;
  const fuel = pending ? Math.max(s.ship.hull.cur <= 0 ? 0 : travel.fuelPerDay * 2, travel.retreatFuel) : travel.retreatFuel;
  if (availableFuel(s) >= fuel || estimateShipStrength(s, ctx) > 0) return false;
  const actor = pending?.actor ?? battle?.actors?.[0];
  const amount = Math.max(0, s.ledger.balances.cash) * encounterRules(ctx).plunder;
  const ref = eventRef(ctx.emit("Plundered", { ...(actor ? { actor } : {}), amount, loc: s.ship.pos }));
  post(s, ctx, { account: "cash", delta: -amount, reason: "plunder", ref });
  delete s.pendingEncounter; delete s.pendingBattle; delete s.ship.path;
  s.ship.mpCarry = 0; s.ship.drifting = true; s.flags.lastPlunderDay = s.clock.day;
  return true;
}
export function actorContact(ctx: OpsCtx, actor: ActorState): number {
  return actor.contact ?? ctx.world.get("actor", actor.def ?? `actor/${actor.kind}`)?.contact ?? 1;
}
export function inShipContact(s: CampaignState, ctx: OpsCtx, actor: ActorState): boolean {
  return actor.pos.map === s.ship.pos.map && chebyshev(actor.pos.cell, s.ship.pos.cell) <= Math.max(worldRules(ctx).grid.contact[shipMover(s, ctx).layer], actorContact(ctx, actor));
}
export function checkActorContacts(s: CampaignState, ctx: OpsCtx, actorId?: string): void {
  if (isSafelyDocked(s, ctx)) return;
  if (s.log.some(event => event.type === "CampaignEnd")) return;
  if (s.pendingEncounter || s.pendingBattle || s.pendingChoices.length || s.ship.path?.lane) return;
  for (const actor of Object.values(s.actors)) if (!inShipContact(s, ctx, actor)) actor.flags = actor.flags.filter(flag => flag !== "ship-contact");
  const actors = actorId ? [s.actors[actorId]].filter((a): a is ActorState => !!a) : Object.values(s.actors).sort((a, b) => a.id.localeCompare(b.id));
  for (const actor of actors) {
    if (!inShipContact(s, ctx, actor)) continue;
    const entered = !actor.flags.includes("ship-contact");
    if (entered) actor.flags.push("ship-contact");
    const pursued = !!s.ship.path && "actor" in s.ship.path.to && s.ship.path.to.actor === actor.id;
    if (actor.lastContactDay === s.clock.day || !entered && !pursued) continue;
    // SPEC-GAP：依 cx-grid-verify 交接書，wary 擦身只報 Sighted，不再停船。
    if (!pursued && !actorHostile(s, ctx, actor)) {
      if (actor.lastSightedDay !== s.clock.day) { actor.lastSightedDay = s.clock.day; ctx.emit("Sighted", { actor: actor.id, loc: actor.pos }); }
      continue;
    }
    if (s.log.filter(e => e.day === s.clock.day && e.type === "EncounterOffered").length >= encounterRules(ctx).maxEncountersPerDay) return;
    const def = ctx.world.get("actor", actor.def ?? `actor/${actor.kind}`);
    const choices = Object.entries(def?.aiChoice ?? { fight: 1 }).filter(([choice, weight]) => weight > 0 && (choice !== "parley" || actor.kind !== "swarm"));
    const aiChoice = (choices.length ? pickWeighted(s.rng, choices, e => e[1])[0] : "fight") as "evade" | "pursue" | "parley" | "fight";
    actor.lastContactDay = s.clock.day; actor.lastSeenByPlayer = s.clock.day;
    s.ship.mpCarry = 0;
    s.pendingEncounter = { actor: actor.id, day: s.clock.day, loc: structuredClone(s.ship.pos), aiChoice, initiator: pursued ? "ship" : "actor" };
    ctx.emit("EncounterOffered", { actor: actor.id, loc: s.ship.pos, aiChoice });
    settleHelplessEncounter(s, ctx);
    return;
  }
}
export function encounterOptions(s: CampaignState, ctx: OpsCtx): { n: number; text: string; disabled?: string }[] {
  const actor = s.actors[s.pendingEncounter?.actor ?? ""], def = actor && ctx.world.get("actor", actor.def ?? `actor/${actor.kind}`);
  const fuel = Math.max(s.ship.hull.cur <= 0 ? 0 : worldRules(ctx).travel.fuelPerDay * 2, worldRules(ctx).travel.retreatFuel);
  const parley = def?.parley.filter(c => !c.requires || evalOpsCond(s, ctx, c.requires, { faction: actor!.faction })) ?? [];
  return [
    { n: 1, text: "迴避", ...(availableFuel(s) < fuel ? { disabled: "燃料不足" } : {}) },
    { n: 2, text: "追擊／攔截", ...(s.pendingEncounter?.aiChoice !== "evade" ? { disabled: "對方沒有逃離" } : {}) },
    { n: 3, text: "交涉", ...(actor?.kind === "swarm" ? { disabled: "裂獸無法交涉" } : !parley.length ? { disabled: "沒有可用的交涉選項" } : {}) },
    { n: 4, text: "開打" },
  ];
}
export function speedCheck(s: CampaignState, ctx: OpsCtx, escaping: number, pursuing: number): boolean {
  const cfg = encounterRules(ctx);
  if (escaping >= pursuing * cfg.evadeSpeedRatio) return true;
  const depth = blightAt(s, ctx, s.ship.pos)?.depth;
  return nextInt(s.rng, 100) < cfg.evadeBase + escaping - pursuing - (depth === "deep" || depth === "core" ? cfg.deepPenalty : 0);
}
function beginBattle(s: CampaignState, ctx: OpsCtx, actor: ActorState, ambush = false): void {
  const others = Object.values(s.actors).filter(a => a.id !== actor.id && inShipContact(s, ctx, a)).sort((a, b) => a.id.localeCompare(b.id));
  const place = placeAt(s, ctx, s.ship.pos);
  delete s.ship.path; s.ship.mpCarry = 0;
  s.pendingBattle = { id: nextId(s, "sortie"), day: s.clock.day, trigger: ambush ? "ambush" : "intercept", loc: structuredClone(s.ship.pos),
    ...(place ? { place } : {}), ...(actor.swarm ? { rift: actor.swarm.rift } : {}), actors: [actor.id, ...others.map(a => a.id)], ambush,
    units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: s.ship.hull.cur > 0 }, injected: [] };
  if (!settleHelplessEncounter(s, ctx)) ctx.emit("Intercepted", { actor: actor.id, sortie: s.pendingBattle!.id, ambush: ambush ? 1 : 0 });
}
function escapeContact(s: CampaignState, ctx: OpsCtx, actor: ActorState): void {
  // SPEC-GAP：迴避未指定落點；以當日 MP 尋找範圍外最近的乾淨可達格，避免原格每日重遇。
  const map = gridOf(ctx.world, s.ship.pos.map), moving = shipMover(s, ctx), origin = { ...s.ship.pos.cell };
  const costs = map.terrains.map(t => moving.layer === "air" ? t.airCost : t.groundCost).filter((n): n is number => n !== null && n > 0);
  const radius = Math.floor(moving.mp / Math.min(...costs));
  const depth = (cell: typeof origin) => blightAt(s, ctx, locAt(ctx, map.id, cell));
  const candidates = cellsWithin(map, origin, radius).filter(c => chebyshev(c, actor.pos.cell) > Math.max(actorContact(ctx, actor), worldRules(ctx).grid.contact[moving.layer]))
    .sort((a, b) => Number(!!depth(a)) - Number(!!depth(b)) || chebyshev(a, origin) - chebyshev(b, origin) || a.y - b.y || a.x - b.x);
  for (const cell of candidates) {
    const path = findPath(map, origin, cell, moving, (at, cost) => {
      const b = depth(at);
      return b && moving.layer === "ground" && b.depth !== "shallow" ? undefined : b ? Math.max(cost, worldRules(ctx).grid.blightCost[b.depth]) : cost;
    });
    if (!path || path.cost > moving.mp) continue;
    for (const step of path.cells) {
      s.ship.pos = locAt(ctx, map.id, step); recordShipMovement(s); checkActorContacts(s, ctx);
      if (s.pendingEncounter || s.flags.lastPlunderDay === s.clock.day) break;
    }
    return;
  }
}
export function chooseEncounter(s: CampaignState, ctx: OpsCtx, choice: number): { ok: true; days?: number } | { ok: false; error: string } {
  const pending = s.pendingEncounter, actor = pending && s.actors[pending.actor];
  if (!pending || !actor || !Number.isInteger(choice) || choice < 1 || choice > 4) return { ok: false, error: "invalid-choice" };
  if (settleHelplessEncounter(s, ctx)) return { ok: true };
  if (encounterOptions(s, ctx)[choice - 1]!.disabled) return { ok: false, error: "choice-disabled" };
  delete s.pendingEncounter;
  if (choice === 1) {
    spendFuel(s, ctx, s.ship.hull.cur <= 0 ? 0 : worldRules(ctx).travel.fuelPerDay * 2);
    if (!speedCheck(s, ctx, shipMover(s, ctx).mp, actor.mp)) beginBattle(s, ctx, actor, true);
    else {
      delete s.ship.path; s.ship.mpCarry = 0; s.ship.drifting = true; s.pendingTicks = 0;
      escapeContact(s, ctx, actor);
      ctx.emit("Evaded", { actor: actor.id, loc: s.ship.pos });
      return { ok: true, days: 1 };
    }
  } else if (choice === 2) {
    if (speedCheck(s, ctx, shipMover(s, ctx).mp, actor.mp)) beginBattle(s, ctx, actor);
    else {
      const map = gridOf(ctx.world, actor.pos.map);
      for (let i = 0; i < 2; i++) {
        const cell = neighbors(map, actor.pos.cell).filter(c => stepCost(map, { layer: actor.layer ?? "ground", mp: actor.mp }, actor.pos.cell, c) !== undefined
          && (actor.layer === "air" || !["deep", "core"].includes(blightAt(s, ctx, locAt(ctx, map.id, c))?.depth ?? "")))
          .sort((a, b) => chebyshev(b, s.ship.pos.cell) - chebyshev(a, s.ship.pos.cell) || a.y - b.y || a.x - b.x)[0];
        if (cell) actor.pos = locAt(ctx, map.id, cell);
      }
      delete actor.path; ctx.emit("Evaded", { actor: actor.id, by: "actor", loc: actor.pos });
    }
  } else if (choice === 3) {
    // SPEC-GAP：完整勢力對話未納本線，直接採 actor 表內的交涉選項。
    const def = ctx.world.require("actor", actor.def ?? `actor/${actor.kind}`);
    s.pendingChoices.push({ text: "對方接通了通訊，等待你的答覆。", choices: structuredClone(def.parley), faction: actor.faction });
  } else beginBattle(s, ctx, actor);
  return { ok: true };
}

export function settleEncounterActors(s: CampaignState, ctx: OpsCtx, sortie: Sortie, result: BattleResult): void {
  for (const id of sortie.actors ?? []) {
    const actor = s.actors[id]; if (!actor) continue;
    const prefix = `${sortie.id}/actor/${id}/`, units = result.units.filter(u => u.id.startsWith(prefix));
    if (!units.length) continue;
    const lost = new Set(units.filter(u => ["dead", "captured", "derelict-lost"].includes(u.status)).map(u => Number(u.id.slice(prefix.length))));
    const force = actor.operation ? s.operations?.[actor.operation]?.force : actor.kind === "force" ? s.factions[actor.faction]?.forces : undefined;
    if (force) {
      let offset = 0;
      for (const unit of [...force.units].sort((a, b) => a.model.localeCompare(b.model))) {
        if (unit.readiness <= 0) continue;
        const count = unit.count;
        for (let i = 0; i < count; i++) if (lost.has(offset + i)) unit.count--;
        offset += count;
      }
      actor.str = strength(force, actor.operation ? s.operations?.[actor.operation]?.power ?? modelPower(ctx) : modelPower(ctx));
    } else actor.str *= (units.length - lost.size) / units.length;
    if (force ? actor.str <= 0 : lost.size === units.length) {
      if (actor.kind === "caravan") ctx.emit("CaravanLost", { actor: id, loc: actor.pos });
      delete s.actors[id]; ctx.emit("ActorDespawned", { actor: id, kind: actor.kind, reason: "battle" });
    }
  }
}
