import { nextInt } from "../../core/rng.ts";
import type { CampaignState, OpsCtx, Prompt } from "../state/types.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { crew, detach, fail, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

// SPEC-GAP：自填名稱不是 OpsCommand；編排層可辨識此 metadata 後呼叫 applyName。
export type NamingPrompt = Prompt & { naming: { mech: string; by: string; customChoice: number } };
export function cmdWake(s: CampaignState, ctx: OpsCtx, cmd: Command<"wake">): CmdResult {
  if (s.clock.phase !== "spring") return fail("not-spring-night");
  const mech = s.mechs[cmd.shell], person = s.roster.persons[cmd.by], employee = s.roster.employment[cmd.by];
  if (!mech || !s.hangar.dormant.includes(cmd.shell)) return fail("not-dormant");
  if (!person || !employee) return fail("unknown-person");
  const frame = ctx.db.require("frame", mech.frame), def = ctx.db.require("person", person.def);
  if (frame.cls !== "ancient" || !frame.resonance || def.kind !== "human") return fail("cannot-wake");
  if (Object.values(peekCrew(s)?.bonds ?? {}).some(b => b.person === cmd.by)) return fail("already-bound");
  const req = frame.resonance;
  const computed = req.beliefs.length ? req.beliefs.filter(b => def.will.beliefs.includes(b)).length / req.beliefs.length : 0;
  const resonance = Math.min(1, Math.max(0, person.will.resonance[frame.id] ?? computed));
  if (resonance < req.threshold || (req.deeds ?? []).some(deed => !s.flags[deed] && !s.flags[`${deed}:${cmd.by}`])) return fail("resonance-too-low");
  const seat = ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []).find(seat => seat.accepts.includes("pilot"));
  if (!seat || mech.seats[seat.id]) return fail("no-seat");
  const culture = peekCrew(s)?.cultures[cmd.by] ?? def.tags.find(t => t.startsWith("culture:"))?.slice(8) ?? rules(ctx).defaultCulture;
  const table = ctx.world.all("names").find(n => n.culture === culture);
  if (!table || new Set(table.names).size < 3) return fail("missing-name-table");
  // 所有拒絕都在 RNG 與狀態改動前。
  const available = [...new Set(table.names)], candidates: string[] = [];
  for (let i = 0; i < 3; i++) candidates.push(available.splice(nextInt(s.rng, available.length), 1)[0]!);
  detach(s, cmd.by); mech.seats[seat.id] = cmd.by; mech.controlMode = "pilot";
  person.seat = { mech: mech.id, role: "pilot" }; person.will.resonance[frame.id] = resonance; employee.seat = mech.id;
  crew(s).bonds[mech.id] = { person: cmd.by, seat: seat.id, awayDays: 0 };
  s.hangar.dormant = s.hangar.dormant.filter(id => id !== mech.id);
  if (s.flags[`grudge:${mech.id}`]) {
    const effect = rules(ctx).grudge;
    if (effect) applyOpsEffect(s, ctx, { applyEffect: { target: "person", id: cmd.by, effect } });
    s.flags[`grudge:${cmd.by}`] = 1;
  }
  const prompt: NamingPrompt = { text: "給它一個名字", person: cmd.by,
    choices: [...candidates.map(name => ({ text: name, effects: [{ nameMech: { mech: mech.id, name, by: cmd.by } }] })), { text: "自填", effects: [] }],
    naming: { mech: mech.id, by: cmd.by, customChoice: 3 } };
  s.pendingChoices.push(prompt); ctx.emit("Woken", { mech: mech.id, by: cmd.by }); return ok;
}
export function applyName(s: CampaignState, ctx: OpsCtx, mech: string, by: string, name: string): CmdResult {
  if (!s.mechs[mech]) return fail("unknown-mech");
  if (!s.roster.persons[by] && !s.factions[by]) return fail("unknown-namer");
  if (!name.trim()) return fail("empty-name");
  applyOpsEffect(s, ctx, { nameMech: { mech, by, name: name.trim() } });
  const index = s.pendingChoices.findIndex(p => { const n = (p as Partial<NamingPrompt>).naming; return n?.mech === mech && n.by === by; });
  if (index >= 0) s.pendingChoices.splice(index, 1); return ok;
}
