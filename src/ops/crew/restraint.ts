import { nextInt } from "../../core/rng.ts";
import type { MechState } from "../../core/types-state.ts";
import type { BeastDef, CampaignState, OpsCtx } from "../state/types.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { applyOpsEffect, beastSpecies, stiffen } from "../content/opseffect.ts";
import { evalOpsCond } from "../content/cond.ts";
import { nextId } from "../state/ids.ts";
import { crew, expense, fail, monthDays, ok } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

export function beastRules(s: CampaignState, ctx: OpsCtx, id: string): BeastDef | undefined {
  const carcass = s.restraint.carcasses.find(c => c.id === id);
  const species = carcass ? ctx.db.get("species", carcass.species) : beastSpecies(ctx, s.mechs[id]?.frame ?? "");
  return species && ctx.world.get("beasts", `beasts/${species.family}`);
}
export function nextSustain(s: CampaignState, ctx: OpsCtx): number {
  const cal = ctx.world.require("calendar", s.calendar), first = Math.min(...cal.spring);
  const due = s.clock.day - s.clock.dom + first;
  return due > s.clock.day ? due : due + cal.daysPerMonth;
}
export function admitBeast(s: CampaignState, ctx: OpsCtx, mech: MechState, epithet?: string): boolean {
  const slot = s.restraint.slots.indexOf(null), cfg = beastRules({ ...s, mechs: { ...s.mechs, [mech.id]: mech } }, ctx, mech.id);
  if (slot < 0 || !cfg) return false;
  mech.seats = {}; mech.controlMode = "instinct";
  s.mechs[mech.id] = mech; s.restraint.slots[slot] = mech.id;
  s.restraint.beasts[mech.id] = { mech: mech.id, kind: "live", wear: 0, vitality: 100, sustainDue: nextSustain(s, ctx), bond: {} };
  if (!s.inventory.mechs.includes(mech.id)) s.inventory.mechs.push(mech.id);
  s.ship.rooms.restraint?.items.push(mech.id);
  const n = s.flags[`registry:${cfg.family}`] = (s.flags[`registry:${cfg.family}`] ?? 0) + 1;
  applyOpsEffect(s, ctx, { nameMech: { mech: mech.id, name: cfg.registryPattern.replace("{n}", String(n).padStart(2, "0")), by: "registry", kind: "registry" } });
  const grade = ctx.db.require("frame", mech.frame).grade;
  if (epithet && ["A", "S"].includes(grade)) applyOpsEffect(s, ctx, { nameMech: { mech: mech.id, name: epithet, by: "wild", kind: "epithet" } });
  return true;
}
export function cmdDevour(s: CampaignState, ctx: OpsCtx, cmd: Command<"devour">): CmdResult {
  const beast = s.restraint.beasts[cmd.beast], cfg = beastRules(s, ctx, cmd.beast);
  if (!beast || beast.kind !== "live" || cfg?.sustain.kind !== "devour") return fail("cannot-devour");
  const need = cfg.sustain.amount[ctx.db.require("frame", s.mechs[cmd.beast]!.frame).grade];
  if (!Number.isSafeInteger(cmd.amount) || !need || cmd.amount !== need) return fail("invalid-amount");
  if (s.flags[`devourDue:${cmd.beast}`] === beast.sustainDue) return fail("already-sustained");
  if ((s.ledger.balances[cfg.sustain.stock] ?? 0) < cmd.amount) return fail("insufficient-flesh");
  expense(s, ctx, cfg.sustain.stock, cmd.amount, "Devoured", { mech: cmd.beast, amount: cmd.amount });
  s.flags[`devourDue:${cmd.beast}`] = beast.sustainDue ?? nextSustain(s, ctx);
  return ok;
}
// SPEC-GAP：core 層狀態無永久上限；以可選 maxHp 保存腐化上限，修理也尊重此值。
export function decayParts(parts: MechState["parts"], templates: { id: string; layers: { type: string; hp: number }[] }[], rate: number): void {
  for (const template of templates) for (const [i, def] of template.layers.entries()) {
    if (!["flesh", "organ"].includes(def.type)) continue;
    const layer = parts[template.id]?.layers[i]; if (!layer) continue;
    layer.maxHp = Math.max(0, (layer.maxHp ?? def.hp) * (1 - rate)); layer.hp = Math.min(layer.hp, layer.maxHp);
  }
}
function familyBehavior(s: CampaignState, ctx: OpsCtx, id: string, cfg: BeastDef): void {
  const beast = s.restraint.beasts[id]!, mech = s.mechs[id]!, species = beastSpecies(ctx, mech.frame)!;
  const rule = cfg.behaviors.find(r => r.species === species.id), rt = crew(s);
  const sustained = s.flags[`sustainedMonth:${id}`] === s.clock.month + 1;
  const molt = rt.molting[id];
  if (molt && s.clock.day >= molt.until && sustained) {
    const replacement = instantiateMech(ctx.db, id, molt.to); replacement.seats = {}; replacement.controlMode = "instinct";
    s.mechs[id] = replacement; delete rt.molting[id]; delete s.flags[`molting:${id}`];
    beast.nextMolt = s.clock.day + (rule?.molt?.days ?? monthDays(s, ctx)); ctx.emit("Molted", { mech: id });
  } else if (!molt && rule?.molt) {
    beast.nextMolt ??= s.clock.day + rule.molt.days;
    if (s.clock.day >= beast.nextMolt && sustained && (!species.behaviors?.molt || evalOpsCond(s, ctx, species.behaviors.molt.when, { mech: id }))) {
      rt.molting[id] = { until: s.clock.day + rule.molt.window, to: rule.molt.to }; s.flags[`molting:${id}`] = 1;
      for (const part of Object.values(mech.parts)) for (const slot of Object.keys(part.components).sort()) {
        const item = part.components[slot], def = s.inventory.components.find(c => c.id === item)?.def ?? item;
        if (def && ctx.db.get("component", def)?.tags.includes("restraint")) part.components[slot] = null;
      }
      for (const effect of species.behaviors?.molt?.duringMoltEffects ?? []) applyOpsEffect(s, ctx, { applyEffect: { target: "mech", id, effect } });
      ctx.emit("MoltStarted", { mech: id });
    }
  }
  if (rule?.brood && sustained && s.clock.phase === "spring" && beast.broodDay !== s.clock.day && s.restraint.slots.includes(null)) {
    const child = instantiateMech(ctx.db, nextId(s, "mech"), rule.brood.child);
    if (admitBeast(s, ctx, child)) { beast.broodDay = s.clock.day; ctx.emit("Brooded", { mech: id, child: child.id }); }
  }
  if (rule?.mutate?.frames.length && sustained && s.clock.dom === 1 && (beast.nextMutate ?? 0) <= s.clock.day) {
    // SPEC-GAP：現有族行為內容以 frame 變體表達 partsOverride。
    const replacement = instantiateMech(ctx.db, id, rule.mutate.frames[nextInt(s.rng, rule.mutate.frames.length)]!);
    replacement.seats = {}; replacement.controlMode = "instinct"; s.mechs[id] = replacement;
    beast.nextMutate = s.clock.day + monthDays(s, ctx); ctx.emit("Mutated", { mech: id });
  }
}
export function restraintDaily5(s: CampaignState, ctx: OpsCtx): void {
  const cal = ctx.world.require("calendar", s.calendar), monthly = s.clock.dom === Math.min(...cal.spring);
  for (const id of Object.keys(s.restraint.beasts).sort()) {
    const beast = s.restraint.beasts[id]!, mech = s.mechs[id], cfg = beastRules(s, ctx, id); if (!mech || !cfg) continue;
    const body = ctx.db.require("bodyplan", ctx.db.require("frame", mech.frame).bodyPlan);
    if (beast.kind === "corpse") {
      if (monthly && s.flags[`embalmChecked:${id}`] !== s.clock.month + 1) {
        if ((s.flags[`embalmMonth:${id}`] ?? 0) < s.clock.month) decayParts(mech.parts, body.parts, cfg.decay);
        s.flags[`embalmChecked:${id}`] = s.clock.month + 1;
      }
      continue;
    }
    if (s.flags[`wearDay:${id}`] !== s.clock.day + 1) {
      const injured = body.parts.some(p => p.layers.some((l, i) => (mech.parts[p.id]?.layers[i]?.hp ?? 0) < l.hp));
      const old = beast.wear;
      beast.wear = Math.min(100, old + (cfg.wearPerDay[ctx.db.require("frame", mech.frame).grade] ?? 0) * (injured || s.flags[`looseDay:${id}`] === s.clock.day - 1 ? cfg.injuryMult : 1));
      s.flags[`wearDay:${id}`] = s.clock.day + 1;
      if (old < 50 && beast.wear >= 50) ctx.emit("WearWarning", { mech: id, wear: beast.wear });
    }
    beast.sustainDue ??= nextSustain(s, ctx);
    if (monthly && s.clock.day >= beast.sustainDue) {
      let sustained = false;
      if (cfg.sustain.kind === "devour") sustained = s.flags[`devourDue:${id}`] === beast.sustainDue;
      else if (cfg.sustain.kind === "tide-soak") {
        sustained = !s.ship.route && (!!s.nodes[s.ship.at]?.blight || Object.values(s.rifts).some(r => r.phase === "anchored" && r.node === s.ship.at));
        if (sustained) beast.vitality = 100;
      } else sustained = true;
      if (!sustained) beast.vitality = Math.max(0, beast.vitality - cfg.sustain.loss);
      else { s.flags[`sustainedMonth:${id}`] = s.clock.month + 1; ctx.emit("Sustained", { mech: id }); }
      beast.sustainDue = nextSustain(s, ctx);
    }
    if (beast.vitality <= 0) { stiffen(s, ctx, id); continue; }
    if (beast.wear >= 100 && !s.pendingChoices.some(p => p.choices.some(c => c.effects.some(e => "restraintChoice" in e && e.restraintChoice.mech === id)))) {
      ctx.emit("BrokeLoose", { mech: id });
      s.pendingChoices.push({ text: `${id} 掙脫拘束`, choices: [
        { text: "硬壓", effects: [{ restraintChoice: { mech: id, action: "suppress", ...cfg.suppress } }] },
        { text: "放走", effects: [{ restraintChoice: { mech: id, action: "release" } }] },
        { text: "殺", effects: [{ restraintChoice: { mech: id, action: "kill" } }] },
      ] });
    }
    familyBehavior(s, ctx, id, cfg);
  }
  if (monthly && s.flags.myceliumMonth !== s.clock.month + 1 && (s.restraint.myceliumRoom || Object.keys(s.restraint.beasts).some(id => beastRules(s, ctx, id)?.sustain.kind === "prune"))) {
    const cfg = ctx.world.require("beasts", "beasts/mycelium"), room = s.restraint.myceliumRoom ??= { layers: 0, growth: 0, lastPrune: s.clock.day };
    if (s.jobs.some(j => j.kind === "prune") || s.clock.day - room.lastPrune >= cal.daysPerMonth) {
      room.layers += cfg.prune.growth; room.growth++;
      ctx.emit("MyceliumOvergrown", { layers: room.layers, growth: room.growth });
      if (room.growth >= 2) s.flags.restraintHoursOwed = (s.flags.restraintHoursOwed ?? 0) + cfg.prune.hours;
    }
    if (!s.jobs.some(j => j.kind === "prune")) s.jobs.push({ id: nextId(s, "job"), kind: "prune", target: "mycelium", needHours: cfg.prune.hours, doneHours: 0, materials: {}, paid: false, priority: 0 });
    s.flags.myceliumMonth = s.clock.month + 1;
  }
  for (const carcass of s.restraint.carcasses) if (!s.jobs.some(j => j.kind === "mount" && j.target === carcass.id && j.paid)) {
    const body = ctx.db.require("bodyplan", ctx.db.require("species", carcass.species).bodyPlan);
    decayParts(carcass.parts, body.parts, carcass.decayPerDay);
  }
}
