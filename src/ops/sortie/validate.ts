import { inLordBay, lordScripts } from "../world/lords.ts";
import { placeAt } from "../war/loc.ts";
import type { CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { CmdResult, CrewState } from "../crew/index.ts";
import { joinForce, joinOperation } from "../war/merc.ts";
import { sameRegion } from "../war/loc.ts";

export function validateSortie(s: CampaignState, ctx: OpsCtx, sortie: Sortie): CmdResult {
  const fail = (error: string): CmdResult => ({ ok: false, error });
  if (!ctx.world.get("map", sortie.loc.map) || sortie.place && !s.places[sortie.place]) return fail("unknown-place");
  if (!sortie.units.length) return fail("empty-sortie");
  if (sortie.lordEncounter || s.pendingBattle?.lordEncounter && s.pendingBattle.id === sortie.id) {
    const script = lordScripts(ctx).find(c => c.lord === sortie.lordEncounter?.lord), lord = script && s.namedLords?.[script.lord];
    if (!script || !lord || sortie.lordEncounter?.beat !== "gate" || lord.gate !== "accepted" || lord.gateSortie !== sortie.id
      || s.pendingBattle?.id !== sortie.id || s.pendingBattle.lordEncounter?.lord !== script.lord || lord.battleFinished || lord.gateDay !== s.clock.day
      || s.clock.month !== script.gate.month || s.clock.dom !== script.gate.dom || !inLordBay(s, script)
      || sortie.place !== script.gate.place || sortie.contract || sortie.rift || sortie.trigger !== "defend" || sortie.supplies.shipOverhead
      || sortie.loc.map !== s.pendingBattle.loc.map || sortie.loc.cell.x !== s.pendingBattle.loc.cell.x || sortie.loc.cell.y !== s.pendingBattle.loc.cell.y) return fail("invalid-lord-sortie");
  }
  if (sortie.trigger === "operation") {
    const c = s.contracts[sortie.contract ?? ""], op = c && joinOperation(s, c);
    if (!c || !op || c.status !== "active" || op.phase !== "engage" || sortie.operation !== op.id) return fail("inactive-operation");
    if (s.ship.path || !sameRegion(s.ship.pos, joinForce(s, c, op).pos) || !sameRegion(sortie.loc, joinForce(s, c, op).pos)) return fail("operation-not-present");
    if (s.pendingBattle?.id !== sortie.id || s.pendingBattle.contract !== c.id) return fail("operation-not-pending");
  }
  const overhead = s.ship.pos.map === sortie.loc.map && s.ship.pos.cell.x === sortie.loc.cell.x && s.ship.pos.cell.y === sortie.loc.cell.y ||
    !!sortie.place && placeAt(s, ctx, s.ship.pos) === sortie.place;
  if (sortie.supplies.shipOverhead && (!overhead || s.ship.path && sortie.trigger !== "ambush")) return fail("ship-not-overhead");
  for (const [requested, available] of [[sortie.supplies.airstrikeTickets, s.inventory.tickets.airstrike], [sortie.supplies.restraintRounds, s.inventory.tickets.restraint]]) {
    if (!Number.isInteger(requested) || requested! < 0 || requested! > available!) return fail("insufficient-supplies");
  }
  if (sortie.contract) {
    const c = s.contracts[sortie.contract];
    if (!c || !["active", "stage"].includes(c.status)) return fail("inactive-contract");
    const script = lordScripts(ctx).find(script => script.contracts[0]?.template === c.template);
    if (script && s.namedLords?.[script.lord]?.status !== "northward") return fail("lord-observation-expired");
    if (c.operation && sortie.trigger !== "operation") return fail("operation-required");
    if (sortie.trigger !== "operation" && (c.target.place !== sortie.place || sortie.rift && c.target.rift !== sortie.rift)) return fail("wrong-target");
  }
  const people = new Set<string>(), mechs = new Set<string>();
  for (const unit of sortie.units) {
    if (unit.crew !== undefined && unit.crew !== "ai") return fail("invalid-crew");
    const mech = s.mechs[unit.mech];
    if (!mech || !s.hangar.bays.includes(unit.mech) && !s.restraint.slots.includes(unit.mech)) return fail("mech-not-in-hangar");
    if (mechs.has(unit.mech)) return fail("duplicate-mech");
    mechs.add(unit.mech);
    if (s.hangar.dormant.includes(mech.id)) return fail("dormant");
    if (s.jobs.some(j => j.target === mech.id && (j.paid || j.doneHours > 0) && j.doneHours < j.needHours)) return fail("job-in-progress");
    const frame = ctx.db.get("frame", mech.frame);
    if (!frame) return fail("unknown-frame");
    const seats = ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []);
    const beast = s.restraint.beasts[mech.id], captured = beast?.kind === "live";
    if (captured && (Object.values(unit.seats).some(Boolean) || unit.controlMode !== "instinct")) return fail("captured-requires-instinct");
    if (captured) {
      if (beast.wear >= 100 || s.flags[`molting:${mech.id}`]) return fail("beast-unavailable");
      const installed = Object.values(mech.parts).some(p => Object.values(p.components).some(id => {
        const def = s.inventory.components.find(c => c.id === id)?.def ?? id;
        return def && ctx.db.get("component", def)?.tags.includes("restraint");
      }));
      if (!installed) return fail("missing-restraint");
    }
    const bond = (s as CrewState).crew?.bonds[mech.id];
    if (frame.cls === "ancient" && (!bond || unit.seats[bond.seat] !== bond.person)) return fail("seat-locked");
    for (const seatId of Object.keys(unit.seats).sort()) {
      const personId = unit.seats[seatId];
      if (personId === null) continue;
      if (!personId) return fail("unknown-person");
      const person = s.roster.persons[personId];
      if (!person || s.roster.dead.some(d => d.person === personId) || person.pools.hp?.cur === 0) return fail("person-dead");
      if (s.flags[`withering:${personId}`] || person.effects.some(e => e.effect.split("/").at(-1) === "withering")) return fail("withering");
      if (people.has(personId)) return fail("duplicate-person");
      people.add(personId);
      const seat = seats.find(v => v.id === seatId), kind = ctx.db.require("person", person.def).kind;
      if (!seat || !seat.accepts.includes(kind === "soul" ? "soul" : "pilot") && !seat.accepts.includes("passenger")) return fail("seat-incompatible");
      const otherBond = Object.entries((s as CrewState).crew?.bonds ?? {}).find(([, b]) => b.person === personId);
      if (otherBond && (otherBond[0] !== mech.id || otherBond[1].seat !== seatId)) return fail("seat-locked");
    }
  }
  return { ok: true };
}
