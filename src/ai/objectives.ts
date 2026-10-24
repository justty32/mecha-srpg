import type { Id } from "../core/ids.ts";
import type { Cell, FactionSlot, Objective } from "../core/types-def.ts";
import type { BattleState } from "../core/types-state.ts";
import type { AiCtx, AiParams } from "./policy.ts";
import type { RulesQuery } from "./rules-query.ts";
import { isHostileSlot } from "./hostility.ts";

export const OBJECTIVE_DEFAULTS = {
  objKill: 4, objSpawner: 3, objZoneClear: 2, objIntercept: 3, objSpare: 4,
  objExit: 4, objHold: 2, objHoldStay: 4, objContest: 1,
  objEscort: 2, escortRange: 2, objBlock: 1, objNoBlock: 8, objMoves: 4,
};
type Bonus = "objKill" | "objSpawner" | "objZoneClear" | "objIntercept";
export type ObjectiveInfo = {
  killBonus: Record<Id, number>; bonusReasons: Record<Id, Bonus[]>; spare: Id[];
  holdZones: Cell[][]; contestZones: Cell[][]; exitUnits: Id[]; escortees: Id[]; interceptUnits: Id[];
  friendlyExitUnits: Id[];
};
// 只快取快照中的公開事實；權重在取用時套用，避免不同 profile 共用時污染。
const cache = new WeakMap<BattleState, Map<FactionSlot, ObjectiveInfo>>();

export function objectiveInfo(q: RulesQuery, view: BattleState, slot: FactionSlot): ObjectiveInfo {
  let slots = cache.get(view);
  if (!slots) { slots = new Map(); cache.set(view, slots); }
  const cached = slots.get(slot);
  if (cached) return cached;
  const info: ObjectiveInfo = { killBonus: {}, bonusReasons: {}, spare: [], holdZones: [], contestZones: [],
    exitUnits: [], escortees: [], interceptUnits: [], friendlyExitUnits: [] };
  const bonus = (id: Id, reason: Bonus): void => {
    (info.bonusReasons[id] ??= []).push(reason);
    info.killBonus[id] = (info.killBonus[id] ?? 0) + OBJECTIVE_DEFAULTS[reason];
  };
  // 隱含 eliminate 沒有額外加權，與明列 eliminate 完全相同。
  const objectives: Objective[] = view.rt?.objectives ?? [];
  for (const o of objectives) {
    if (o.onComplete !== "win" && o.onComplete !== "continue") continue;
    const friendly = o.for === slot || !isHostileSlot(q, view, slot, o.for);
    const ids = [...new Set([...(typeof o.params.unit === "string" ? [o.params.unit] : []),
      ...(Array.isArray(o.params.units) ? o.params.units.filter((id): id is string => typeof id === "string") : [])])];
    if (friendly && o.kind === "killTarget") for (const id of ids) bonus(id, "objKill");
    if (friendly && o.kind === "capture") info.spare.push(...ids);
    if (o.kind === "hold" && Array.isArray(o.params.zone)) {
      const zone = o.params.zone.filter((c): c is Cell => !!c && typeof c === "object"
        && "x" in c && "y" in c && typeof c.x === "number" && typeof c.y === "number");
      if (zone.length) (friendly ? info.holdZones : info.contestZones).push(zone);
    }
    if (o.kind === "escort" || o.kind === "reachExit") {
      const active = ids.filter(id => !!view.units[id] && q.isActive(view, id));
      if (friendly) {
        const friends = active.filter(id => view.units[id]!.owner === slot || !isHostileSlot(q, view, slot, view.units[id]!.owner));
        info.friendlyExitUnits.push(...friends);
        info.exitUnits.push(...friends.filter(id => view.units[id]!.owner === slot));
        if (o.kind === "escort") info.escortees.push(...friends);
      } else {
        const enemies = active.filter(id => isHostileSlot(q, view, slot, view.units[id]!.owner));
        info.interceptUnits.push(...enemies);
        for (const id of enemies) bonus(id, "objIntercept");
      }
    }
  }
  for (const id of Object.keys(view.units).sort()) {
    const unit = view.units[id]!;
    if (!q.isActive(view, id) || !isHostileSlot(q, view, slot, unit.owner)) continue;
    if (q.partDefs(view, id).some(p => p.functions.includes("spawner")) || q.unitTags(view, id).includes("spawner")
      || q.abilitiesOf(view, id).some(a => q.abilityDef(a).tags.some(t => t === "spawn" || t === "summon"))) bonus(id, "objSpawner");
    if (info.holdZones.some(zone => zone.some(c => q.distance(c, unit.pos) === 0))) bonus(id, "objZoneClear");
  }
  slots.set(slot, info);
  return info;
}

export function objectiveTargetFactor(info: ObjectiveInfo, id: Id, params: AiParams = {}): number {
  return 1 + (info.bonusReasons[id] ?? []).reduce((sum, key) => sum + (params[key] ?? OBJECTIVE_DEFAULTS[key]), 0);
}

export function objectiveMoveValue(ctx: Pick<AiCtx, "q" | "view" | "slot" | "params">, unit: Id, from: Cell, to: Cell): number {
  const { q, view, slot } = ctx, p = { ...OBJECTIVE_DEFAULTS, ...ctx.params };
  const info = objectiveInfo(q, view, slot), exits = view.rt?.exits ?? [];
  const distance = (c: Cell, zone: Cell[]): number => Math.min(...zone.map(b => q.distance(c, b)));
  const progress = (zone: Cell[]): number => zone.length ? distance(from, zone) - distance(to, zone) : 0;
  const at = (c: Cell, zone: Cell[]): number => Number(zone.some(b => q.distance(c, b) === 0));
  let value = 0;
  if (info.exitUnits.includes(unit)) value += p.objExit * progress(exits);
  else {
    for (const zone of info.holdZones) value += p.objHold * progress(zone) + p.objHoldStay * (at(to, zone) - at(from, zone));
    if (info.friendlyExitUnits.length) value -= p.objNoBlock * (at(to, exits) - at(from, exits));
  }
  for (const zone of info.contestZones) value += p.objContest * progress(zone);
  if (!info.escortees.includes(unit)) {
    const escort = [...info.escortees].sort((a, b) => q.distance(from, view.units[a]!.pos) - q.distance(from, view.units[b]!.pos)
      || a.localeCompare(b))[0];
    if (escort) {
      const pos = view.units[escort]!.pos;
      value += p.objEscort * (Math.max(0, q.distance(from, pos) - p.escortRange) - Math.max(0, q.distance(to, pos) - p.escortRange));
    }
  }
  for (const id of info.interceptUnits) {
    const pos = view.units[id]!.pos;
    const exit = [...exits].sort((a, b) => q.distance(pos, a) - q.distance(pos, b) || a.x - b.x || a.y - b.y)[0];
    if (exit) value += p.objBlock * (q.distance(from, exit) - q.distance(to, exit));
  }
  return value;
}
