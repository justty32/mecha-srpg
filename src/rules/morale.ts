import type { Id } from "../core/ids.ts";
import type { MoraleStage } from "../core/types-def.ts";
import { d100 } from "../core/rng.ts";
import { evalCond, evalNum } from "../core/numexpr.ts";
import type { Ctx } from "./state.ts";
import { constant, emit, evalCtxFor, isActive, person, personTags, rt, seatsOf, unit } from "./state.ts";
import { roleAttr } from "./contribs.ts";
import { applyEffect, removeBySource } from "./effects.ts";
import { onSignal, registerVerb } from "./hooks.ts";

export const MORALE_STAGES: readonly MoraleStage[] = ["steady", "shaken", "breaking", "fleeing"];

export function setMorale(ctx: Ctx, personId: Id, stage: MoraleStage): void {
  const p = person(ctx, personId), from = p.morale;
  if (from === stage) return;
  const source = `morale:${personId}`;
  removeBySource(ctx, source);
  p.morale = stage;
  rt(ctx.s).moraleStreak[personId] = 0;
  if (stage !== "steady") applyEffect(ctx, `effect/morale-${stage}`, { person: personId }, source);
  emit(ctx, "MoraleChanged", { person: personId, from, to: stage });
}

export function moraleCheck(ctx: Ctx, personId: Id, dc: number, reason: string): boolean {
  const p = person(ctx, personId), runtime = rt(ctx.s);
  const success = d100(ctx.s.rng) < roleAttr(ctx, { person: personId }, "resolve") - dc;
  const index = MORALE_STAGES.indexOf(p.morale);
  if (!success) {
    runtime.moraleStreak[personId] = 0;
    setMorale(ctx, personId, MORALE_STAGES[Math.min(index + 1, MORALE_STAGES.length - 1)]!);
  } else if (index > 0) {
    runtime.moraleStreak[personId] = (runtime.moraleStreak[personId] ?? 0) + 1;
    if (runtime.moraleStreak[personId]! >= constant(ctx, "moraleRecoverStreak")) setMorale(ctx, personId, MORALE_STAGES[index - 1]!);
  } else runtime.moraleStreak[personId] = 0;
  // 契約的 MoraleChanged 沒有 reason 欄；理由只用於呼叫端辨識。
  void reason;
  return success;
}

export function moraleEvent(ctx: Ctx, event: string, personIds: Id[]): void {
  for (const id of [...new Set(personIds)].sort()) {
    const tags = personTags(ctx, id), ev = evalCtxFor(ctx, { person: id });
    for (const row of ctx.db.rules.moraleEvents) {
      if (row.event !== event || row.immuneTags?.some(t => tags.includes(t))
        || row.personTags?.some(t => !tags.includes(t)) || (row.when && !evalCond(row.when, ev))) continue;
      moraleCheck(ctx, id, evalNum(row.dc, ev), event);
    }
  }
}

registerVerb("moraleCheck", (ctx, action, hc) => {
  if (action.do !== "moraleCheck") return;
  const ids = hc.self.person ? [hc.self.person] : hc.self.unit ? seatsOf(ctx, hc.self.unit).map(s => s.person) : [];
  for (const id of ids) moraleCheck(ctx, id, evalNum(action.dc, evalCtxFor(ctx, { person: id })), "hook");
});
onSignal("partBroken", "people.morale.part", 0, (ctx, p) => {
  if (typeof p.unit === "string") moraleEvent(ctx, "partBroken", seatsOf(ctx, p.unit).map(s => s.person));
});
onSignal("unitDied", "people.morale.ally", 0, (ctx, p) => {
  if (typeof p.unit !== "string") return;
  const owner = unit(ctx, p.unit).owner;
  const ids = Object.keys(ctx.s.units).sort().filter(id => id !== p.unit && isActive(ctx, id) && unit(ctx, id).owner === owner);
  moraleEvent(ctx, "allyDeath", ids.flatMap(id => seatsOf(ctx, id).map(s => s.person)));
});
