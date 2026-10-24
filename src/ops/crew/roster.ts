import { chance, nextInt } from "../../core/rng.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { crew, detach, mood, peekCrew, rules } from "./shared.ts";

export function leave(s: CampaignState, ctx: OpsCtx, id: string): void {
  if (!s.roster.persons[id]) return;
  detach(s, id);
  s.inventory.components = s.inventory.components.filter(c => c.boundTo !== id);
  for (const room of Object.keys(s.ship.rooms).sort()) s.ship.rooms[room]!.persons = s.ship.rooms[room]!.persons.filter(p => p !== id);
  delete s.roster.persons[id]; delete s.roster.employment[id];
  const rt = peekCrew(s);
  if (rt) { delete rt.rentals[id]; delete rt.companions[id]; }
  ctx.emit("Left", { person: id });
}
export function registerDeath(s: CampaignState, ctx: OpsCtx, id: string, cause: string): void {
  if (!s.roster.persons[id] || s.roster.dead.some(d => d.person === id)) return;
  s.roster.dead.push({ person: id, day: s.clock.day, cause });
  const rt = peekCrew(s);
  for (const mech of Object.keys(rt?.bonds ?? {}).sort()) if (rt!.bonds[mech]!.person === id) {
    if (!s.hangar.dormant.includes(mech)) s.hangar.dormant.push(mech);
    s.flags[`grudge:${mech}`] = 1; s.mechs[mech]!.controlMode = "none"; delete rt!.bonds[mech];
  }
  detach(s, id);
  for (const key of Object.keys(s.roster.employment).sort()) if (key !== id) mood(s, key, -1);
  for (const room of Object.keys(s.ship.rooms).sort()) s.ship.rooms[room]!.persons = s.ship.rooms[room]!.persons.filter(p => p !== id);
  delete s.roster.persons[id]; delete s.roster.employment[id];
  if (rt) { delete rt.rentals[id]; delete rt.companions[id]; }
  ctx.emit("Died", { person: id, cause });
}
export function prepareGrowth(s: CampaignState, ctx: OpsCtx, id: string): void {
  const p = s.roster.persons[id]!, def = ctx.db.require("person", p.def);
  if (!("xpCurve" in def.growth) || peekCrew(s)?.growth[id]) return;
  const curve = ctx.db.require("curve", def.growth.xpCurve), rolls: Record<string, number[]> = {};
  for (const attr of Object.keys(def.growth.levelDice).sort()) {
    const dice = def.growth.levelDice[attr]!;
    rolls[attr] = curve.points.map(() => dice.length ? dice[nextInt(s.rng, dice.length)]! : 0);
  }
  crew(s).growth[id] = rolls;
}
export function rosterReturn(s: CampaignState, ctx: OpsCtx): void {
  for (const id of Object.keys(s.roster.persons).sort()) {
    const p = s.roster.persons[id]!, def = ctx.db.require("person", p.def);
    if (p.pools.hp && p.pools.hp.cur <= 0) { registerDeath(s, ctx, id, "battle"); continue; }
    if (!("xpCurve" in def.growth)) continue;
    prepareGrowth(s, ctx, id);
    const curve = ctx.db.require("curve", def.growth.xpCurve);
    while (p.level < curve.points.length && p.xp >= curve.points[p.level]!) {
      for (const attr of Object.keys(crew(s).growth[id]!).sort()) p.attrsBase[attr] = (p.attrsBase[attr] ?? 0) + (crew(s).growth[id]![attr]![p.level] ?? 0);
      p.level++;
      if (def.growth.perkPointsAt.includes(p.level)) crew(s).perkPoints[id] = (crew(s).perkPoints[id] ?? 0) + 1;
      ctx.emit("Levelled", { person: id, level: p.level });
    }
  }
}
export function rosterDaily7(s: CampaignState, ctx: OpsCtx): void {
  if (s.clock.phase !== "neap") return;
  for (const id of Object.keys(s.roster.employment).sort()) {
    if (s.roster.employment[id]!.mood > -3) continue;
    // 認主者的席位鎖仍優先；一般離隊只帶走個人物件。
    if (Object.values(peekCrew(s)?.bonds ?? {}).some(b => b.person === id)) continue;
    if (chance(s.rng, rules(ctx).leaveChance)) leave(s, ctx, id);
  }
}
export function applyPersonTrait(s: CampaignState, ctx: OpsCtx, person: string, effect: string): void {
  applyOpsEffect(s, ctx, { applyEffect: { target: "person", id: person, effect } }, { person });
}
