import type { CampaignState, ContractState, OpsCtx, Sortie } from "../state/types.ts";
import type { MechState } from "../../core/types-state.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { nextId } from "../state/ids.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { rules } from "../crew/shared.ts";
import { joinTerms, mercRules, rep } from "./merc.ts";

export type LoanMech = MechState & { loaned?: string };
const hp = (mech: MechState) => Object.values(mech.parts).reduce((n, p) => n + p.layers.reduce((v, l) => v + l.hp, 0), 0);
export function lendMechs(s: CampaignState, ctx: OpsCtx, c: ContractState): void {
  const terms = joinTerms(ctx, c), loan = terms.loan;
  if (!loan || !["full", "arsenal"].includes(terms.supply) || c.loans?.length) return;
  const models = loan.models.map(id => ctx.world.require("model", id)).filter(m => (terms.supply === "arsenal" ? ["D", "C", "B"] : ["D", "C"]).includes(m.tier));
  const max = terms.supply === "full" ? Math.min(1, loan.max) : loan.max;
  for (let i = 0; i < max && models.length; i++) {
    const bay = s.hangar.bays.indexOf(null); if (bay < 0) break;
    const model = models[i % models.length]!, id = nextId(s, "loan");
    const mech: LoanMech = { ...instantiateMech(ctx.db, id, model.frame), owner: "faction", loaned: c.id };
    s.mechs[id] = mech; s.hangar.bays[bay] = id; s.inventory.mechs.push(id); (c.loans ??= []).push(id);
    c.merc!.loans[id] = { model: model.id, hp: hp(mech) };
    ctx.emit("MechLoaned", { contract: c.id, mech: id, model: model.id });
  }
}
export function returnLoans(s: CampaignState, ctx: OpsCtx, c: ContractState, ref: string): number {
  let losses = 0;
  for (const id of c.loans ?? []) {
    const record = c.merc!.loans[id]!, mech = s.mechs[id], present = mech && s.hangar.bays.includes(id) && !record.lost;
    const price = ctx.world.require("model", record.model).cost * mercRules(ctx, c).loanPrice;
    const loss = present ? price * Math.max(0, 1 - hp(mech) / Math.max(1, record.hp)) : price;
    if (loss) { losses += loss; post(s, ctx, { account: "cash", delta: -loss, reason: "loan-loss", ref }); }
    if (!present && !record.destroyed) rep(s, ctx, c.issuer, -20, "loan-loss");
    for (const p of Object.values(s.roster.persons)) if (p.seat?.mech === id) delete p.seat;
    for (const e of Object.values(s.roster.employment)) if (e.seat === id) delete e.seat;
    s.hangar.bays = s.hangar.bays.map(m => m === id ? null : m); s.hangar.dormant = s.hangar.dormant.filter(m => m !== id);
    s.inventory.mechs = s.inventory.mechs.filter(m => m !== id);
    s.jobs = s.jobs.filter(j => j.target !== id);
    for (const component of s.inventory.components) if (component.boundTo === id) delete component.boundTo;
    delete s.mechs[id];
    ctx.emit("MechReturned", { contract: c.id, mech: id, loss });
  }
  return losses;
}
function heal(s: CampaignState, ctx: OpsCtx, c: ContractState, multiplier: number, injuries: boolean): void {
  const cfg = rules(ctx), roles = Object.values(s.roster.employment).map(e => e.role);
  for (const p of Object.values(s.roster.persons)) {
    if (s.roster.dead.some(d => d.person === p.id)) continue;
    const soul = ctx.db.require("person", p.def).kind === "soul", healer = roles.includes(soul ? "technician" : "medic");
    const mult = healer ? cfg.medicMult : s.ship.rooms.medbay ? cfg.medbayMult : 1;
    if (p.pools.hp && p.pools.hp.cur > 0) p.pools.hp.cur = Math.min(p.pools.hp.max, p.pools.hp.cur + cfg.hpRegen * mult * (multiplier - 1));
    const expired = new Set<number>();
    for (const e of p.effects) {
      const def = ctx.db.require("effect", e.effect);
      if (injuries && def.tags.includes("injury:temporary") && def.clock.kind === "days" && e.remaining !== null) { e.remaining = Math.max(0, e.remaining - 1); if (!e.remaining) expired.add(e.uid); }
      if (!c.merc!.cleansed && joinTerms(ctx, c).supply === "arsenal" && mercRules(ctx, c).cleanse.some(id => ctx.db.require("effect", id).id === def.id)) expired.add(e.uid);
    }
    const contribs = new Set(p.effects.filter(e => expired.has(e.uid)).flatMap(e => e.contribIds));
    p.effects = p.effects.filter(e => !expired.has(e.uid)); p.contribs = p.contribs.filter(e => !contribs.has(e.id));
  }
  if (joinTerms(ctx, c).supply === "arsenal") c.merc!.cleansed = true;
}
export function supplyDaily(s: CampaignState, ctx: OpsCtx, c: ContractState): void {
  if (!c.merc || c.settled || c.merc.suppliedDay === s.clock.day) return;
  const tier = joinTerms(ctx, c).supply; c.merc.suppliedDay = s.clock.day;
  if (tier === "none") return;
  if (tier === "field") { if (c.merc.medicalUntil === s.clock.day) heal(s, ctx, c, 1.5, false); return; }
  const cfg = mercRules(ctx, c), hours = (ctx.world.all("job").find(j => j.technicianHours)?.technicianHours ?? 0) * cfg.technicianCount;
  const work = s.jobs.reduce((n, j) => n + Math.max(0, j.needHours - j.doneHours), 0);
  const suppliedHours = tier === "arsenal" ? Math.max(hours, work) : hours;
  const ref = eventRef(ctx.emit("AllySupplied", { contract: c.id, operation: c.operation, tier, techHours: suppliedHours }));
  s.techHours += suppliedHours;
  const needed = s.jobs.filter(j => !j.paid).reduce((n, j) => n + (j.materials["stock:scrap"] ?? 0), 0);
  const scrap = tier === "arsenal" ? needed : Math.min(cfg.scrapLimit, needed);
  if (scrap > 0) post(s, ctx, { account: "stock:scrap", delta: scrap, reason: "faction-supply", ref });
  heal(s, ctx, c, 2, true);
}
export function supplyBattle(s: CampaignState, ctx: OpsCtx, c: ContractState, sortie: Sortie): void {
  const tier = joinTerms(ctx, c).supply; if (tier === "none") return;
  const ref = eventRef(ctx.emit("AllySupplied", { contract: c.id, operation: c.operation, tier, sortie: sortie.id }));
  for (const id of s.hangar.bays) if (id && s.mechs[id]) for (const [pool, value] of Object.entries(s.mechs[id]!.pools)) if (pool.startsWith("ammo")) {
    const amount = Math.max(0, value.max - value.cur);
    if (amount) {
      post(s, ctx, { account: `stock:${pool}`, delta: amount, reason: "faction-supply", ref });
      post(s, ctx, { account: `stock:${pool}`, delta: -amount, reason: "faction-supply", ref });
      value.cur = value.max;
      ctx.emit("Resupplied", { mech: id, pool, amount, reason: "faction-supply", ref });
    }
  }
  if (tier === "arsenal") {
    const rounds = Math.max(0, mercRules(ctx, c).restraintRounds - s.inventory.tickets.restraint);
    if (rounds) { post(s, ctx, { account: "stock:restraint", delta: rounds, reason: "faction-supply", ref }); post(s, ctx, { account: "stock:restraint", delta: -rounds, reason: "faction-supply", ref }); s.inventory.tickets.restraint += rounds; }
    const effect = mercRules(ctx, c).briefing;
    if (effect) for (const id of Object.keys(s.roster.persons)) sortie.injected.push({ target: "person", id, effect });
  }
}
