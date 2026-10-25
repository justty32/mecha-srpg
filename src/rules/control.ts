import type { Id } from "../core/ids.ts";
import type { ControlMode, SoulGrowth } from "../core/types-def.ts";
import { d100 } from "../core/rng.ts";
import type { Ctx } from "./state.ts";
import { constant, emit, person, rt, seatsOf, unit } from "./state.ts";
import { roleAttr } from "./contribs.ts";
import { onSignal, registerVerb } from "./hooks.ts";

/** 座艙狀態按活著的座位人物優先，AI／遙控只在沒有可驅動者時接管。 */
export function cockpitOf(ctx: Ctx, unitId: Id): "human" | "soul" | "ai" | "remote" | "empty" {
  const kinds = seatsOf(ctx, unitId).flatMap(s => {
    const p = person(ctx, s.person);
    return p.pools.hp && p.pools.hp.cur <= 0 ? [] : [ctx.db.require("person", p.def).kind];
  });
  if (kinds.includes("human")) return "human";
  if (kinds.includes("soul")) return "soul";
  return unit(ctx, unitId).crew ?? "empty";
}
export function isDriven(ctx: Ctx, unitId: Id): boolean {
  if (rt(ctx.s).monsters[unitId]) return true;
  return unit(ctx, unitId).core !== false && ["human", "soul"].includes(cockpitOf(ctx, unitId));
}

export function autonomyNodes(ctx: Ctx, personId: Id): number {
  const p = person(ctx, personId), def = ctx.db.require("person", p.def);
  if (!p.will.soulTree || !("tree" in def.growth)) return 0;
  const tree = ctx.db.require("soultree", (def.growth as SoulGrowth).tree);
  // SPEC-GAP：direction 未進凍結型別；依交接書用 research.autonomy 是否存在。
  return tree.nodes.filter(n => p.will.soulTree!.nodes.includes(n.id) && Object.hasOwn(n.research ?? {}, "autonomy")).length;
}

export function controlCheck(ctx: Ctx, unitId: Id): Id | null {
  const u = unit(ctx, unitId), seats = seatsOf(ctx, unitId);
  const pilot = seats.find(s => s.role === "pilot")?.person, soul = seats.find(s => s.role === "soul")?.person;
  let winner: Id | null;
  if (u.controlMode === "none" || u.controlMode === "disabled" || u.controlMode === "instinct" || u.controlMode === "scripted") winner = null;
  else if (u.controlMode === "contested" && pilot && soul) {
    const a = d100(ctx.s.rng) + roleAttr(ctx, { person: pilot, unit: unitId }, "control");
    const b = d100(ctx.s.rng) + roleAttr(ctx, { person: soul, unit: unitId }, "control") + autonomyNodes(ctx, soul) * constant(ctx, "controlAutonomyK");
    winner = a === b ? [pilot, soul].sort()[0]! : a > b ? pilot : soul;
  } else if (u.controlMode === "soul") winner = soul ?? null;
  else if (u.controlMode === "berserk") winner = rt(ctx.s).commander[unitId] ?? pilot ?? soul ?? null;
  else winner = pilot ?? soul ?? null;
  rt(ctx.s).commander[unitId] = winner;
  return winner;
}

export function setControl(ctx: Ctx, unitId: Id, mode: ControlMode, reason: string): void {
  const u = unit(ctx, unitId), from = u.controlMode;
  if (from === mode) return;
  u.controlMode = mode;
  // contested 的骰只在回合開始擲；切換時先保留既有指令權。
  const commander = mode === "contested" ? rt(ctx.s).commander[unitId] ?? null : controlCheck(ctx, unitId);
  emit(ctx, "ControlChanged", { unit: unitId, from, to: mode, commander });
  void reason;
}

export function handOver(ctx: Ctx, unitId: Id): void {
  const seats = seatsOf(ctx, unitId), pilot = seats.find(s => s.role === "pilot"), soul = seats.find(s => s.role === "soul");
  const mode: ControlMode = pilot ? "pilot" : soul && autonomyNodes(ctx, soul.person) >= 1 ? "soul"
    : rt(ctx.s).monsters[unitId] ? "instinct" : unit(ctx, unitId).crew ? "scripted" : soul ? "disabled" : "none";
  setControl(ctx, unitId, mode, "hand-over");
  controlCheck(ctx, unitId);
}

registerVerb("setControl", (ctx, action, hc) => {
  if (action.do !== "setControl") return;
  const uid = hc.self.unit ?? (hc.self.person ? person(ctx, hc.self.person).seat?.mech : undefined);
  if (uid) setControl(ctx, uid, action.mode, "hook");
});
onSignal("turnStartPre", "people.control.check", 0, (ctx, p) => { if (typeof p.unit === "string") controlCheck(ctx, p.unit); });
onSignal("personDied", "people.control.hand-over", 0, (ctx, p) => { if (typeof p.unit === "string") handOver(ctx, p.unit); });
