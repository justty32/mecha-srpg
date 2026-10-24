import type { CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { CmdResult, CrewState } from "../crew/index.ts";

export function validateSortie(s: CampaignState, ctx: OpsCtx, sortie: Sortie): CmdResult {
  const fail = (error: string): CmdResult => ({ ok: false, error });
  if (!s.nodes[sortie.node]) return fail("unknown-node");
  if (!sortie.units.length) return fail("empty-sortie");
  if (sortie.supplies.shipOverhead && (s.ship.at !== sortie.node || s.ship.route)) return fail("ship-not-overhead");
  for (const [requested, available] of [[sortie.supplies.airstrikeTickets, s.inventory.tickets.airstrike], [sortie.supplies.restraintRounds, s.inventory.tickets.restraint]]) {
    if (!Number.isInteger(requested) || requested! < 0 || requested! > available!) return fail("insufficient-supplies");
  }
  if (sortie.contract) {
    const c = s.contracts[sortie.contract];
    if (!c || !["active", "stage"].includes(c.status)) return fail("inactive-contract");
    if (c.target.node !== sortie.node || sortie.rift && c.target.rift !== sortie.rift) return fail("wrong-target");
  }
  const people = new Set<string>(), mechs = new Set<string>();
  for (const unit of sortie.units) {
    const mech = s.mechs[unit.mech];
    if (!mech || !s.hangar.bays.includes(unit.mech)) return fail("mech-not-in-hangar");
    if (mechs.has(unit.mech)) return fail("duplicate-mech");
    mechs.add(unit.mech);
    if (s.hangar.dormant.includes(mech.id)) return fail("dormant");
    if (s.jobs.some(j => j.target === mech.id && (j.paid || j.doneHours > 0) && j.doneHours < j.needHours)) return fail("job-in-progress");
    const frame = ctx.db.get("frame", mech.frame);
    if (!frame) return fail("unknown-frame");
    const seats = ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []);
    // TODO(2026-10-24 裁示)：活捕不查馴化、拘束或獸欄；與屍體改裝分開，活捕一律無座位、本能控制。
    const captured = s.flags[`captured:${mech.id}`] === 1 || ctx.db.all("species").some(sp => sp.capture.frame === frame.id);
    if (captured && (Object.values(unit.seats).some(Boolean) || unit.controlMode !== "instinct")) return fail("captured-requires-instinct");
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
