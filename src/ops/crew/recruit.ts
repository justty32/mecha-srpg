import { isDocked } from "../world/move.ts";
import { placeAt } from "../war/loc.ts";
import { requirePlace } from "../world/places.ts";
import { pickWeighted, rollInt } from "../../core/rng.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { instantiatePerson } from "../content/instantiate.ts";
import { evalOpsNum } from "../content/cond.ts";
import { nextId } from "../state/ids.ts";
import { applyPersonTrait, leave, prepareGrowth } from "./roster.ts";
import { crew, employment, expense, fail, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

export function recruitsDaily7(s: CampaignState, ctx: OpsCtx): void {
  if (s.clock.phase !== "neap") return;
  for (const pool of ctx.world.all("recruit")) {
    if (peekCrew(s)?.recruitDays[pool.id] === s.clock.day) continue;
    const rt = crew(s);
    for (const id of Object.keys(rt.candidates).sort()) if (rt.candidates[id]!.pool === pool.id) delete rt.candidates[id];
    const used = new Set([...Object.values(s.roster.persons).map(p => p.def), ...Object.values(rt.candidates).map(c => c.person.def)]);
    const sources = [...pool.sources].sort((a, b) => a.background < b.background ? -1 : a.background > b.background ? 1 : 0)
      .map(src => ({ def: ctx.world.require("background", src.background), weight: evalOpsNum(s, ctx, src.weight) }))
      .filter(src => src.weight > 0 && src.def.person && ctx.db.get("person", src.def.person)?.kind === "human" && !used.has(ctx.db.require("person", src.def.person).id));
    for (let i = 0; i < pool.size && sources.length; i++) {
      const bg = pickWeighted(s.rng, sources, v => v.weight).def, id = nextId(s, "candidate");
      const person = instantiatePerson(ctx.db, id, bg.person!);
      used.add(person.def);
      for (let j = sources.length - 1; j >= 0; j--) if (ctx.db.require("person", sources[j]!.def.person!).id === person.def) sources.splice(j, 1);
      for (const attr of Object.keys(bg.attrRanges).sort()) { const [lo, hi] = bg.attrRanges[attr]!; person.attrsBase[attr] = rollInt(s.rng, lo, hi); }
      rt.candidates[id] = { id, pool: pool.id, place: requirePlace(s, ctx, pool.place).id, background: bg.id, culture: bg.culture, person,
        fee: evalOpsNum(s, ctx, bg.hireFee), wage: rules(ctx).wageBase * evalOpsNum(s, ctx, bg.wageMult), traits: [...(bg.traits ?? [])] };
    }
    rt.recruitDays[pool.id] = s.clock.day;
  }
}
export function cmdHire(s: CampaignState, ctx: OpsCtx, cmd: Command<"hire">): CmdResult {
  const candidate = peekCrew(s)?.candidates[cmd.candidate];
  if (!candidate) return fail("unknown-candidate");
  if (!isDocked(s, ctx, candidate.place)) return fail("not-docked");
  if (Object.keys(s.roster.persons).length >= s.ship.capacity.berths) return fail("no-berth");
  if (candidate.fee < 0 || candidate.wage < 0 || !Number.isFinite(candidate.fee + candidate.wage)) return fail("invalid-terms");
  if (s.ledger.balances.cash < candidate.fee) return fail("insufficient-cash");
  const id = nextId(s, "person"), person = structuredClone(candidate.person); person.id = id;
  s.roster.persons[id] = person; s.roster.employment[id] = employment(s, candidate.wage);
  crew(s).cultures[id] = candidate.culture;
  for (const effect of candidate.traits) applyPersonTrait(s, ctx, id, effect);
  prepareGrowth(s, ctx, id);
  expense(s, ctx, "cash", candidate.fee, "Hired", { person: id, candidate: cmd.candidate });
  if (!candidate.fee) ctx.emit("Hired", { person: id, candidate: cmd.candidate });
  s.ship.rooms.galley?.persons.push(id); delete crew(s).candidates[cmd.candidate];
  return ok;
}
export function cmdFire(s: CampaignState, ctx: OpsCtx, cmd: Command<"fire">): CmdResult {
  if (!s.roster.persons[cmd.person]) return fail("unknown-person");
  if (Object.values(peekCrew(s)?.bonds ?? {}).some(b => b.person === cmd.person)) return fail("seat-locked");
  const owed = s.roster.employment[cmd.person]?.owed ?? 0;
  if (s.ledger.balances.cash < owed) return fail("unpaid-wages");
  expense(s, ctx, "cash", owed, "WagePaid", { person: cmd.person, amount: owed });
  leave(s, ctx, cmd.person); return ok;
}
