import type { CampaignState } from "../state/types.ts";
import { checkLedger } from "../state/ledger.ts";

export function checkInvariants(s: CampaignState): string[] {
  const errors = checkLedger(s);
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
  for (const pen of s.stable.pens) if (!s.mechs[pen.mech]) errors.push(`missing pen mech: ${pen.mech}`);
  for (const person of Object.keys(s.roster.mastery).sort()) for (const node of Object.keys(s.roster.mastery[person]!).sort()) {
    const value = s.roster.mastery[person]![node]!;
    if (!Number.isFinite(value) || value < 0 || value > 1) errors.push(`mastery out of range: ${person}/${node}`);
  }
  return errors;
}
