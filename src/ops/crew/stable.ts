// TODO(2026-10-24 裁示)：活捕無馴化／餵養，待 spec 改寫
// 本檔僅保留舊契約實作，不從 crew/index.ts 匯出或由船務段呼叫。
import { chance, nextInt } from "../../core/rng.ts";
import type { CampaignState, OpsCtx, PenState } from "../state/types.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { evalOpsCond } from "../content/cond.ts";
import { nextId } from "../state/ids.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { compareId, crew, detach, expense, fail, monthDays, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

// TODO(2026-10-24 裁示)：活捕無馴化／餵養，待 spec 改寫
export function cmdFeed(s: CampaignState, ctx: OpsCtx, cmd: Command<"feed">): CmdResult {
  const pen = s.stable.pens.find(p => p.mech === cmd.pen);
  if (!pen || !s.mechs[pen.mech]) return fail("unknown-pen");
  if (!Number.isFinite(cmd.amount) || cmd.amount <= 0) return fail("invalid-amount");
  if ((s.ledger.balances["stock:feed"] ?? 0) - (peekCrew(s)?.feedDue ?? 0) < cmd.amount) return fail("insufficient-feed");
  expense(s, ctx, "stock:feed", cmd.amount, "Fed", { mech: pen.mech, amount: cmd.amount });
  const rt = crew(s), old = rt.fed[pen.mech];
  rt.fed[pen.mech] = { day: s.clock.day, amount: (old?.day === s.clock.day ? old.amount : 0) + cmd.amount }; return ok;
}
function replaceFrame(s: CampaignState, ctx: OpsCtx, mech: string, frame: string): void {
  const old = s.mechs[mech]!;
  for (const id of Object.values(old.seats).filter((id): id is string => id !== null).sort()) detach(s, id);
  const replacement = instantiateMech(ctx.db, mech, frame);
  replacement.owner = old.owner; replacement.pos = old.pos;
  s.mechs[mech] = replacement;
}
function removeBeast(s: CampaignState, ctx: OpsCtx, pen: PenState, dead: boolean): void {
  const mech = s.mechs[pen.mech]!;
  for (const id of Object.values(mech.seats).filter((id): id is string => id !== null).sort()) detach(s, id);
  const frame = ctx.db.require("frame", mech.frame), ref = eventRef(ctx.emit(dead ? "Died" : "LostMech", { mech: mech.id }));
  if (dead) {
    post(s, ctx, { account: `stock:core-${frame.grade}`, delta: 1, reason: "beast-carcass", ref });
    const species = ctx.db.all("species").find(d => ctx.db.require("frame", d.capture.frame).id === frame.id);
    post(s, ctx, { account: species?.family === "insect" ? "stock:chitin" : "stock:flesh", delta: 1, reason: "beast-carcass", ref });
  }
  s.stable.pens = s.stable.pens.filter(p => p.mech !== mech.id);
  s.inventory.mechs = s.inventory.mechs.filter(id => id !== mech.id);
  s.hangar.bays = s.hangar.bays.map(id => id === mech.id ? null : id);
  for (const key of Object.keys(s.ship.rooms).sort()) s.ship.rooms[key]!.items = s.ship.rooms[key]!.items.filter(id => id !== mech.id);
  delete s.mechs[mech.id]; delete crew(s).fed[mech.id]; delete crew(s).molting[mech.id];
}
// TODO(2026-10-24 裁示)：活捕無馴化／餵養，待 spec 改寫
export function stableDaily5(s: CampaignState, ctx: OpsCtx): void {
  const cfg = rules(ctx), rt = crew(s);
  for (const pen of [...s.stable.pens].sort((a, b) => compareId(a.mech, b.mech))) {
    const mech = s.mechs[pen.mech]; if (!mech) continue;
    const frame = ctx.db.require("frame", mech.frame);
    const species = ctx.db.all("species").find(d => ctx.db.require("frame", d.capture.frame).id === frame.id);
    const rule = cfg.stable.find(r => r.species === species?.id);
    const need = cfg.feed[frame.grade]; if (need === undefined) continue;
    const credit = rt.fed[pen.mech], supplied = credit && credit.day >= s.clock.day - 1 ? credit.amount : 0;
    const available = Math.max(0, (s.ledger.balances["stock:feed"] ?? 0) - rt.feedDue);
    const take = Math.min(Math.max(0, need - supplied), available);
    rt.feedDue += take; delete rt.fed[pen.mech];
    const fed = supplied + take >= need;
    if (fed) {
      pen.hunger = Math.max(0, pen.hunger - cfg.hungerStep);
      if (pen.taming !== "tamed") {
        pen.taming = "taming"; pen.tameDays++;
        if (rule && pen.tameDays >= rule.tameDays) { pen.taming = "tamed"; ctx.emit("Tamed", { mech: pen.mech }); }
      }
    } else {
      pen.hunger = Math.min(cfg.hungerLimit, pen.hunger + cfg.hungerStep);
      if (pen.hunger >= cfg.hungerLimit) { removeBeast(s, ctx, pen, !chance(s.rng, cfg.escapeChance)); continue; }
    }
    const molt = rt.molting[pen.mech];
    if (molt && s.clock.day >= molt.until && fed) {
      replaceFrame(s, ctx, pen.mech, molt.to); delete rt.molting[pen.mech];
      delete s.flags[`molting:${pen.mech}`];
      pen.nextMolt = s.clock.day + (rule?.molt?.days ?? monthDays(s, ctx)); ctx.emit("Molted", { mech: pen.mech });
    } else if (!molt && rule?.molt) {
      pen.nextMolt ??= s.clock.day + rule.molt.days;
      if (s.clock.day >= pen.nextMolt && fed && (!species?.behaviors?.molt || evalOpsCond(s, ctx, species.behaviors.molt.when, { mech: pen.mech }))) {
        rt.molting[pen.mech] = { until: s.clock.day + rule.molt.window, to: rule.molt.to };
        s.flags[`molting:${pen.mech}`] = 1;
        for (const part of Object.keys(mech.parts).sort()) for (const slot of Object.keys(mech.parts[part]!.components).sort()) {
          const id = mech.parts[part]!.components[slot], component = s.inventory.components.find(c => c.id === id);
          if (component && ctx.db.require("component", component.def).tags.includes("restraint")) mech.parts[part]!.components[slot] = null;
        }
        for (const effect of species?.behaviors?.molt?.duringMoltEffects ?? []) applyOpsEffect(s, ctx, { applyEffect: { target: "mech", id: mech.id, effect } });
        ctx.emit("MoltStarted", { mech: mech.id });
      }
    }
    if (rule?.brood && fed && pen.taming === "tamed" && s.clock.phase === "spring" && pen.broodDay !== s.clock.day && s.stable.pens.length < s.ship.capacity.stablePens) {
      const id = nextId(s, "mech"); s.mechs[id] = instantiateMech(ctx.db, id, rule.brood.child); s.inventory.mechs.push(id);
      s.stable.pens.push({ mech: id, taming: "wild", tameDays: 0, hunger: 0, bond: {} });
      pen.broodDay = s.clock.day; ctx.emit("Brooded", { mech: pen.mech, child: id });
    }
    if (rule?.mutate?.frames.length && s.clock.dom === 1 && (pen.nextMutate ?? 0) <= s.clock.day) {
      // SPEC-GAP：MechState 無 partsOverride；由宣告的 frame 變體重抽 body plan。
      replaceFrame(s, ctx, pen.mech, rule.mutate.frames[nextInt(s.rng, rule.mutate.frames.length)]!);
      pen.nextMutate = s.clock.day + monthDays(s, ctx); ctx.emit("Mutated", { mech: pen.mech });
    }
  }
  if (s.clock.dom === 1 && s.stable.myceliumRoom) { s.stable.myceliumRoom.layers += cfg.myceliumGrowth; s.stable.myceliumRoom.growth++; }
}
