import { GRADES } from "../../core/types-def.ts";
import { chance, nextInt } from "../../core/rng.ts";
import type { CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { BattleResult } from "../sortie/apply.ts";
import { instantiatePerson } from "../content/instantiate.ts";
import { nextId } from "../state/ids.ts";
import { registerPersonName } from "./names.ts";

/** 戰果回寫後呼叫；戰果入口負責 sortie 去重，依機甲／人物 id 排序消耗營運 RNG。 */
export function cockpitGrowth(s: CampaignState, ctx: OpsCtx, sortie: Sortie, result: BattleResult): void {
  const growth = ctx.db.rules.cockpit?.growth;
  if (!growth) return;
  const ordered = [...sortie.units].sort((a, b) => a.mech < b.mech ? -1 : 1), driven = new Set<string>();
  // SPEC-GAP：第 38 列大潮曆落地前，以當日漲潮 phase 代替大潮時刻；古代機先看全場、不算距離。
  const tide = s.clock.phase === "spring", ancient = result.units.some(u => ctx.db.get("frame", u.state.frame)?.cls === "ancient");
  for (const [index, selected] of ordered.entries()) {
    const entry = result.units.find(u => u.id === selected.mech || u.id === `player-${index}`);
    const mech = s.mechs[selected.mech];
    if (!entry || !mech || !entry.state.core) continue;
    const frame = ctx.db.require("frame", mech.frame);
    const seats = ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []);
    for (const id of Object.values(entry.state.seats).filter((id): id is string => !!id).sort()) {
      const p = s.roster.persons[id];
      if (!p || driven.has(id) || !Object.values(selected.seats).includes(id) || p.pools.hp && p.pools.hp.cur <= 0) continue;
      const def = ctx.db.require("person", p.def);
      if (!["human", "soul"].includes(def.kind)) continue;
      driven.add(id);
      p.driveHours = (p.driveHours ?? 0) + result.rounds * growth.driveHoursPerRound;
      p.maxDrivenGrade = GRADES[Math.max(GRADES.indexOf(p.maxDrivenGrade ?? "D"), GRADES.indexOf(frame.grade))]!;
      const owned = new Set([...(def.abilities ?? []), ...(p.abilities ?? [])].map(id => ctx.db.require("ability", id).id));
      const hours = p.driveHours * (def.kind === "soul" ? growth.soulGrowthFactor : 1);
      const grade = Math.min(GRADES.indexOf(p.maxDrivenGrade), GRADES.indexOf(growth.abilityGradeCap));
      if (owned.size >= growth.abilityCap || hours < (growth.abilityHours[owned.size] ?? Infinity)) continue;
      const pool = [...new Set(growth.abilityPool.map(id => ctx.db.require("ability", id).id))].sort().filter(id =>
        !owned.has(id) && GRADES.indexOf(ctx.db.require("ability", id).grade ?? "D") <= grade);
      if (!pool.length) continue;
      const ability = pool[nextInt(s.rng, pool.length)]!;
      p.abilities = [...(p.abilities ?? []), ability];
      ctx.emit("AbilityGained", { person: id, ability });
    }
    if (selected.crew !== "ai" || !["alive", "retreated", "derelict-recovered"].includes(entry.status)) continue;
    mech.crew = "ai";
    mech.aiBattles = (mech.aiBattles ?? 0) + 1;
    if (mech.aiBattles < growth.awakenMinAiBattles) continue;
    // 兩個條件各自擲骰，不能因前一骰命中而短路跳過第二骰。
    const tideHit = tide && chance(s.rng, growth.awakenChanceTide);
    const ancientHit = ancient && chance(s.rng, growth.awakenChanceAncient);
    if (!tideHit && !ancientHit) continue;
    const id = nextId(s, "person"), soul = instantiatePerson(ctx.db, id, growth.awakenSoulTemplate);
    s.roster.persons[id] = soul;
    s.roster.employment[id] = { since: s.clock.day, wage: 0, owed: 0, mood: 0, role: "pilot" };
    registerPersonName(s, ctx, id);
    // 已有機魂不被新機魂擠走；沒有空的機魂座位時只進名冊。
    const seat = seats.find(seat => seat.accepts.includes("soul") && !mech.seats[seat.id]);
    if (seat) {
      mech.seats[seat.id] = id; soul.seat = { mech: mech.id, role: "soul" };
      s.roster.employment[id]!.seat = mech.id;
      mech.controlMode = Object.values(mech.seats).some(pid => pid && ctx.db.require("person", s.roster.persons[pid]!.def).kind === "human") ? "shared" : "soul";
    }
    mech.aiBattles = 0;
    ctx.emit("SoulAwakened", { mech: mech.id, person: id });
  }
}
