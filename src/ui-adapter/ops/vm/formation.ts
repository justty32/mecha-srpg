import type { CampaignState, OpsCtx, Sortie } from "../../../ops/state/types.ts";
import { placeAt, placeLoc } from "../../../ops/war/loc.ts";
import { peekCrew } from "../../../ops/crew/shared.ts";
import { validateSortie } from "../../../ops/sortie/validate.ts";
import { displayName, label, rejection } from "./labels.ts";
import type { SortieView } from "./types.ts";

export function seatDefs(s: CampaignState, ctx: OpsCtx, id: string) {
  return ctx.db.require("bodyplan", ctx.db.require("frame", s.mechs[id]!.frame).bodyPlan).parts.flatMap(p => p.seats ?? []);
}
export function controlMode(s: CampaignState, ctx: OpsCtx, unit: Sortie["units"][number]): Sortie["units"][number]["controlMode"] {
  if (s.restraint.beasts[unit.mech]?.kind === "live") return "instinct";
  const kinds = Object.values(unit.seats).flatMap(id => id && s.roster.persons[id] ? [ctx.db.require("person", s.roster.persons[id]!.def).kind] : []);
  return kinds.includes("human") ? kinds.includes("soul") ? "shared" : "pilot" : kinds.includes("soul") ? "soul" : unit.crew === "ai" ? "scripted" : "none";
}
function ready(s: CampaignState, ctx: OpsCtx, id: string): boolean {
  const mech = s.mechs[id]; if (!mech || s.hangar.dormant.includes(id)) return false;
  const frame = ctx.db.require("frame", mech.frame), body = ctx.db.require("bodyplan", frame.bodyPlan);
  if (body.parts.some(p => p.functions.some(f => f === "core" || f === "locomotion") && (!mech.parts[p.id] || mech.parts[p.id]!.broken))) return false;
  if (s.jobs.some(j => j.target === id && (j.paid || j.doneHours > 0) && j.doneHours < j.needHours)) return false;
  const abilities = [...frame.innateAbilities];
  for (const part of Object.values(mech.parts)) {
    if (part.broken) continue;
    const components = Object.keys(part.components).sort().flatMap(slot => {
      const id = part.components[slot], def = id && ctx.db.get("component", s.inventory.components.find(c => c.id === id)?.def ?? id);
      return def ? [def] : [];
    });
    let layer = part.layers.length - components.filter(c => c.hp !== undefined).length;
    for (const c of components) {
      const hp = c.hp === undefined ? undefined : part.layers[layer++];
      if (c.hp !== undefined && (!hp || hp.broken || hp.hp <= 0)) continue;
      abilities.push(...c.abilities);
    }
  }
  return abilities.some(id => {
    const a = ctx.db.require("ability", id);
    return a.mode === "activated" && [...(a.ammoPool ? [a.ammoPool] : []), ...a.costs.filter(c => c.pool.startsWith("ammo")).map(c => c.pool)].every(p => (mech.pools[p]?.cur ?? 0) > 0);
  });
}
export function seatOptions(s: CampaignState, ctx: OpsCtx, mech: string, seat: string): string[] {
  const decl = seatDefs(s, ctx, mech).find(d => d.id === seat), bonds = peekCrew(s)?.bonds ?? {};
  if (!decl || s.restraint.beasts[mech]?.kind === "live") return [];
  return Object.keys(s.roster.persons).sort().filter(id => {
    const p = s.roster.persons[id]!, kind = ctx.db.require("person", p.def).kind;
    const bond = Object.entries(bonds).find(([, b]) => b.person === id);
    return !s.roster.dead.some(d => d.person === id) && p.pools.hp?.cur !== 0 && !s.flags[`withering:${id}`]
      && !p.effects.some(e => e.effect.split("/").at(-1) === "withering")
      && (!bond || bond[0] === mech && bond[1].seat === seat)
      && (!bonds[mech] || bonds[mech]!.seat !== seat || bonds[mech]!.person === id)
      && (decl.accepts.includes(kind === "soul" ? "soul" : "pilot") || decl.accepts.includes("passenger"));
  });
}
export function defaultUnit(s: CampaignState, ctx: OpsCtx, id: string, used: Set<string>): Sortie["units"][number] {
  const unit: Sortie["units"][number] = { mech: id, seats: {}, controlMode: "none", ...(s.mechs[id]!.crew === "ai" ? { crew: "ai" } : {}) };
  for (const seat of seatDefs(s, ctx, id)) {
    const available = seatOptions(s, ctx, id, seat.id).filter(id => !used.has(id));
    const occupant = s.mechs[id]!.seats[seat.id], bond = peekCrew(s)?.bonds[id];
    const preferred = bond?.seat === seat.id ? bond.person : occupant;
    const person = preferred && available.includes(preferred) ? preferred : available[0] ?? null;
    unit.seats[seat.id] = person; if (person) used.add(person);
  }
  unit.controlMode = controlMode(s, ctx, unit); return unit;
}
export function draftSortie(s: CampaignState, ctx: OpsCtx, contract?: string): Sortie {
  const active = contract ? s.contracts[contract] : Object.values(s.contracts).find(c => ["active", "stage"].includes(c.status));
  const draft: Sortie = s.pendingBattle ? structuredClone(s.pendingBattle) : {
    // 預覽 id 不消耗流水號；實際 sortie 指令會自行分配。
    id: "ui-draft", day: s.clock.day, place: active?.target.place ?? placeAt(s, ctx, s.ship.pos),
    loc: active && active.target.place !== placeAt(s, ctx, s.ship.pos) ? placeLoc(s, ctx, active.target.place) : structuredClone(s.ship.pos), trigger: active ? "contract" : "ambush",
    ...(active ? { contract: active.id, ...(active.target.rift ? { rift: active.target.rift } : {}) } : {}),
    units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: s.ship.hull.cur > 0 }, injected: [],
  };
  if (!draft.units.length) {
    const used = new Set<string>();
    for (const id of [...new Set([...s.hangar.bays, ...s.restraint.slots].filter((id): id is string => !!id))].sort()) {
      if (!ready(s, ctx, id)) continue;
      const unit = defaultUnit(s, ctx, id, used);
      if (unit.controlMode !== "none" && validateSortie(s, ctx, { ...draft, contract: undefined, rift: undefined, place: draft.lordEncounter ? draft.place : placeAt(s, ctx, s.ship.pos), loc: draft.lordEncounter ? draft.loc : s.ship.pos, supplies: { ...draft.supplies, shipOverhead: false }, units: [unit] }).ok) draft.units.push(unit);
      else for (const person of Object.values(unit.seats)) if (person) used.delete(person);
    }
  }
  return draft;
}
export function draftError(s: CampaignState, ctx: OpsCtx, draft: Sortie): string | null {
  const valid = validateSortie(s, ctx, draft);
  if (!valid.ok) return rejection(valid.error);
  // SPEC-GAP：ops 驗證允許空控制機體；UI 明確要求可控制或本能出戰，避免無法結束的戰鬥。
  return draft.units.some(u => u.controlMode === "none" && u.crew !== "ai") ? "機體尚未配置駕駛或機魂" : null;
}
export function formationView(s: CampaignState, ctx: OpsCtx, draft: Sortie): SortieView {
  const name = (id: string) => displayName(s, ctx.db, ctx.world, id);
  return { contract: draft.contract ?? null, title: "出戰編成", nodeName: draft.place ? name(draft.place) : `${draft.loc.cell.x},${draft.loc.cell.y}`, error: draftError(s, ctx, draft), buttons: [],
    units: [...new Set([...s.hangar.bays, ...s.restraint.slots, ...s.hangar.dormant].filter((id): id is string => !!id))].sort().filter(id => s.mechs[id]).map(id => {
      const unit = draft.units.find(u => u.mech === id), preview = unit ?? defaultUnit(s, ctx, id, new Set(draft.units.flatMap(u => Object.values(u.seats).filter((id): id is string => !!id))));
      const valid = validateSortie(s, ctx, { ...draft, units: [preview] });
      const reason = !ready(s, ctx, id) ? "機體尚未整備完成" : !valid.ok ? rejection(valid.error) : undefined;
      return { mech: id, name: name(id), included: !!unit, ai: preview.crew === "ai", enabled: !reason, ...(reason ? { reason } : {}), seats: seatDefs(s, ctx, id).map(seat => ({
        seat: seat.id, seatName: seat.accepts.map(label).join("／"), person: preview.seats[seat.id] ?? null,
        options: seatOptions(s, ctx, id, seat.id).map(id => ({ id, name: name(id) })),
      })) };
    }),
  };
}
