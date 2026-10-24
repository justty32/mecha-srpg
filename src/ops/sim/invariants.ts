import type { CampaignState } from "../state/types.ts";
import { checkLedger } from "../state/ledger.ts";

export function checkInvariants(s: CampaignState): string[] {
  const errors = checkLedger(s);
  for (const c of Object.values(s.contracts)) if (c.settled) for (const id of c.loans ?? []) {
    if (s.inventory.mechs.includes(id) || s.hangar.bays.includes(id)) errors.push(`unreturned loan: ${c.id}/${id}`);
  }
  for (const id of Object.keys(s.mechs).sort()) for (const seat of Object.keys(s.mechs[id]!.seats).sort()) {
    const person = s.mechs[id]!.seats[seat];
    if (person !== null && person !== undefined && !s.roster.persons[person]) errors.push(`missing seat person: ${id}/${seat}/${person}`);
  }
  for (const id of Object.keys(s.roster.persons).sort()) {
    const seat = s.roster.persons[id]!.seat;
    if (seat && !s.mechs[seat.mech]) errors.push(`missing person seat mech: ${id}/${seat.mech}`);
  }
  for (const id of Object.keys(s.roster.employment).sort()) {
    const mech = s.roster.employment[id]!.seat;
    if (mech && !s.mechs[mech]) errors.push(`missing employment seat mech: ${id}/${mech}`);
  }
  for (const item of s.inventory.components) if (item.boundTo && !s.mechs[item.boundTo]) errors.push(`missing boundTo: ${item.id}/${item.boundTo}`);
  for (const beast of Object.values(s.restraint.beasts)) if (!s.mechs[beast.mech]) errors.push(`missing beast mech: ${beast.mech}`);
  for (const person of Object.keys(s.roster.mastery).sort()) for (const node of Object.keys(s.roster.mastery[person]!).sort()) {
    const value = s.roster.mastery[person]![node]!;
    if (!Number.isFinite(value) || value < 0 || value > 1) errors.push(`mastery out of range: ${person}/${node}`);
  }
  for (const [key, r] of Object.entries(s.relations ?? {})) {
    if (r.a >= r.b || key !== `${r.a}|${r.b}`) errors.push(`invalid relation key: ${key}`);
    if (!Number.isFinite(r.value) || r.value < -100 || r.value > 100) errors.push(`relation out of range: ${key}`);
  }
  for (const o of Object.values(s.operations ?? {})) {
    if (!Number.isFinite(o.progress) || o.progress < 0 || o.progress > 1) errors.push(`operation progress: ${o.id}`);
    for (const u of o.force.units) if (u.count < 0 || !Number.isInteger(u.count) || u.readiness < 0 || u.readiness > 1) errors.push(`force out of range: ${o.id}`);
    for (const slot of o.mercSlots) if (!s.contracts[slot.contract]) errors.push(`missing operation contract: ${slot.contract}`);
  }
  return errors;
}
