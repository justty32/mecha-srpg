import type { CampaignState, OpsCtx } from "../state/types.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { detach, fail, monthDays, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

export function cmdAssign(s: CampaignState, ctx: OpsCtx, cmd: Command<"assign">): CmdResult {
  const p = s.roster.persons[cmd.person], e = s.roster.employment[cmd.person];
  if (!p || !e) return fail("unknown-person");
  if (cmd.role !== undefined && !["pilot", "technician", "medic", "crew"].includes(cmd.role)) return fail("invalid-role");
  const lock = Object.entries(peekCrew(s)?.bonds ?? {}).find(([, b]) => b.person === cmd.person);
  if (lock && (!cmd.seat || cmd.seat.mech !== lock[0] || cmd.seat.seat !== lock[1].seat || cmd.role && cmd.role !== e.role)) return fail("seat-locked");
  let role: "pilot" | "soul" | "passenger" = "passenger";
  if (cmd.seat) {
    const mech = s.mechs[cmd.seat.mech]; if (!mech) return fail("unknown-mech");
    if (s.hangar.dormant.includes(mech.id)) return fail("dormant");
    if (s.mechs[mech.id]!.seats[cmd.seat.seat] && mech.seats[cmd.seat.seat] !== cmd.person) return fail("seat-occupied");
    const bond = peekCrew(s)?.bonds[mech.id]; if (bond && bond.seat === cmd.seat.seat && bond.person !== cmd.person) return fail("seat-locked");
    const frame = ctx.db.require("frame", mech.frame), body = ctx.db.require("bodyplan", frame.bodyPlan);
    const seat = body.parts.flatMap(part => part.seats ?? []).find(seat => seat.id === cmd.seat!.seat);
    role = ctx.db.require("person", p.def).kind === "soul" ? "soul" : "pilot";
    if (!seat || !Object.hasOwn(mech.seats, seat.id)) return fail("unknown-seat");
    if (!seat.accepts.includes(role)) { if (!seat.accepts.includes("passenger")) return fail("seat-incompatible"); role = "passenger"; }
    // TODO(2026-10-24 裁示)：活捕無馴化／餵養，待 spec 改寫；不以舊 PenState 判定可入座。
  }
  detach(s, cmd.person);
  if (cmd.role) e.role = cmd.role as typeof e.role;
  if (cmd.seat) {
    s.mechs[cmd.seat.mech]!.seats[cmd.seat.seat] = cmd.person;
    p.seat = { mech: cmd.seat.mech, role }; e.seat = cmd.seat.mech;
  }
  ctx.emit("Assigned", { person: cmd.person, ...(cmd.seat ? { mech: cmd.seat.mech, seat: cmd.seat.seat } : {}) }); return ok;
}
export function hangarDaily5(s: CampaignState, ctx: OpsCtx): void {
  const rt = peekCrew(s); if (!rt) return;
  for (const mech of Object.keys(rt.bonds).sort()) {
    const bond = rt.bonds[mech]!, p = s.roster.persons[bond.person]; if (!p || !s.mechs[mech]) continue;
    bond.awayDays = p.seat?.mech === mech ? 0 : bond.awayDays + 1;
    if (bond.awayDays > monthDays(s, ctx) && !s.flags[`withering:${bond.person}`]) {
      s.flags[`withering:${bond.person}`] = 1;
      const effect = rules(ctx).withering;
      // SPEC-GAP：core 尚無 withering 定義；旗標保留，內容有提供才掛真正 Effect。
      if (effect) applyOpsEffect(s, ctx, { applyEffect: { target: "person", id: bond.person, effect } });
      ctx.emit("Withering", { person: bond.person, mech });
    }
  }
}
