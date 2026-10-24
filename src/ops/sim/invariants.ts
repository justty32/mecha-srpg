import type { CampaignState } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { cellKey, gridOf, inBounds, neighbors, terrainAt } from "../world/grid.ts";
import { checkLedger } from "../state/ledger.ts";
import { blightPassable } from "../world/patches.ts";

export function checkInvariants(s: CampaignState, world?: WorldDB): string[] {
  const errors = checkLedger(s);
  const indexed = new Map<string, string>();
  for (const rift of Object.values(s.rifts)) {
    const core = s.patches[rift.patches[0] ?? ""];
    if (rift.phase !== "closed" && (!core || core.map !== rift.at.map || !core.cells.some(c => cellKey(c) === cellKey(rift.at.cell)))) errors.push(`rift core missing at: ${rift.id}`);
    if (rift.phase === "closed" && rift.patches.length) errors.push(`closed rift has patches: ${rift.id}`);
    let since = -Infinity;
    for (const id of rift.patches) {
      const p = s.patches[id];
      if (!p || p.rift !== rift.id) errors.push(`rift patch missing: ${rift.id}/${id}`);
      else if (p.sinceDay < since) errors.push(`patch order: ${rift.id}`);
      else since = p.sinceDay;
    }
  }
  for (const patch of Object.values(s.patches)) {
    const rift = s.rifts[patch.rift];
    if (!rift?.patches.includes(patch.id)) errors.push(`orphan patch: ${patch.id}`);
    if (!patch.cells.length || !Number.isFinite(patch.sinceDay) || patch.sinceDay > s.clock.day) errors.push(`invalid patch: ${patch.id}`);
    const map = world?.get("map", patch.map) ? gridOf(world, patch.map) : undefined;
    const keys = new Set(patch.cells.map(cellKey));
    if (keys.size !== patch.cells.length) errors.push(`duplicate patch cells: ${patch.id}`);
    if (rift?.patches[0] !== patch.id && patch.cells.length > 12) errors.push(`oversize patch: ${patch.id}`);
    for (const c of patch.cells) {
      const key = cellKey(c), full = `${patch.map}/${key}`, ref = s.maps[patch.map]?.blight[key];
      if (indexed.has(full)) errors.push(`overlapping patches: ${full}`);
      indexed.set(full, patch.id);
      if (ref?.patch !== patch.id || ref.rift !== patch.rift) errors.push(`blight index mismatch: ${full}`);
      if (map && !blightPassable(map, c)) errors.push(`impassable patch cell: ${full}`);
    }
    if (map && patch.cells.length) {
      const seen = new Set([cellKey(patch.cells[0]!)]), queue = [patch.cells[0]!];
      for (let i = 0; i < queue.length; i++) for (const c of neighbors(map, queue[i]!)) {
        const key = cellKey(c); if (keys.has(key) && !seen.has(key)) { seen.add(key); queue.push(c); }
      }
      if (seen.size !== keys.size) errors.push(`disconnected patch: ${patch.id}`);
    }
  }
  for (const [map, state] of Object.entries(s.maps)) for (const [key, ref] of Object.entries(state.blight)) {
    if (indexed.get(`${map}/${key}`) !== ref.patch) errors.push(`orphan blight index: ${map}/${key}`);
  }
  if (world) {
    if (!world.get("map", s.ship.pos.map)) errors.push(`missing ship map: ${s.ship.pos.map}`);
    else {
      const map = gridOf(world, s.ship.pos.map);
      if (!inBounds(map, s.ship.pos.cell)) errors.push("ship outside map");
      else {
        const terrain = terrainAt(map, s.ship.pos.cell);
        if ((s.ship.hull.cur > 0 ? terrain.airCost : terrain.groundCost) === null) errors.push("ship on impassable cell");
      }
    }
  }
  const sources = new Map(s.log.map(e => [`event-${e.seq}`, e.type]));
  for (const entry of s.ledger.entries) if (["faction-supply", "join-pay", "loan-loss"].includes(entry.reason) &&
    (!entry.ref || !["OperationResolved", "AllySupplied"].includes(sources.get(entry.ref) ?? ""))) errors.push(`war ledger source: ${entry.seq}`);
  for (const id of s.inventory.mechs) if (s.mechs[id]?.owner === "faction" &&
    !Object.values(s.contracts).some(c => !c.settled && c.loans?.includes(id))) errors.push(`orphan faction loan: ${id}`);
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
    if (!s.factions[r.a] || !s.factions[r.b]) errors.push(`missing relation faction: ${key}`);
    if (!Number.isFinite(r.value) || r.value < -100 || r.value > 100) errors.push(`relation out of range: ${key}`);
  }
  for (const [id, f] of Object.entries(s.factions)) {
    if (f.rnd && (!Number.isFinite(f.rnd.points) || f.rnd.points < 0)) errors.push(`rnd points: ${id}`);
    for (const u of f.forces?.units ?? []) if (!Number.isFinite(u.count) || u.count < 0 || !Number.isFinite(u.readiness) || u.readiness < 0) errors.push(`faction force: ${id}`);
  }
  for (const o of Object.values(s.operations ?? {})) {
    if (!Number.isFinite(o.progress) || o.progress < 0 || o.progress > 1) errors.push(`operation progress: ${o.id}`);
    if (world && !world.get("map", o.target.loc.map)) errors.push(`missing operation target: ${o.id}`);
    for (const u of o.force.units) if (u.count < 0 || !Number.isInteger(u.count) || u.readiness < 0 || u.readiness > 1) errors.push(`force out of range: ${o.id}`);
    for (const slot of o.mercSlots) if (!s.contracts[slot.contract]) errors.push(`missing operation contract: ${slot.contract}`);
  }
  for (const shell of Object.values(s.shells ?? {})) if (shell.holder !== "player" &&
    !(typeof shell.holder === "string" ? s.factions[shell.holder] : s.places[shell.holder.ruin])) errors.push(`missing shell holder: ${shell.id}`);
  if (world) for (const model of Object.values(s.models ?? {})) if (!world.get("model", model.def)) errors.push(`missing model def: ${model.def}`);
  return errors;
}
