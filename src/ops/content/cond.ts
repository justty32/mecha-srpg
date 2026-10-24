import { strength, modelPower } from "../war/forces.ts";
import { relation } from "../war/relations.ts";
import { evalCond, evalNum, NumExprError, objectRefs } from "../../core/numexpr.ts";
import type { EvalCtx } from "../../core/numexpr.ts";
import { GRADES } from "../../core/types-def.ts";
import type { Cond, NumExpr } from "../../core/types-def.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";

export const OPS_REF_ROOTS = ["campaign", "rift", "faction", "person", "mech", "node", "calendar", "debt", "ledger", "inventory", "ship", "restraint", "contract", "flags", "operation", "relation", "targetFaction"] as const;
export type OpsScope = { operation?: string; targetFaction?: string; rift?: string; faction?: string; person?: string; mech?: string; node?: string; contract?: string; tags?: string[] };
export function opsEvalCtx(s: CampaignState, ctx: Pick<OpsCtx, "db" | "world">, scope: OpsScope = {}): EvalCtx {
  const cal = ctx.world.require("calendar", s.calendar);
  const rift = scope.rift ? s.rifts[scope.rift] : undefined;
  const faction = scope.faction ? s.factions[scope.faction] : undefined;
  const person = scope.person ? s.roster.persons[scope.person] : undefined;
  const mech = scope.mech ? s.mechs[scope.mech] : undefined;
  const node = s.nodes[scope.node ?? s.ship.at];
  const debt = s.ledger.balances.debt;
  // SPEC-GAP：ratio 以第一筆開局本金為分母；無本金時為 0。下一大潮指嚴格晚於今日。
  const principal = s.ledger.entries.find(e => e.account === "debt")?.delta ?? 0;
  const daysToNextSpring = cal.spring.length ? Math.min(...cal.spring.map(day => (day - s.clock.dom + cal.daysPerMonth) % cal.daysPerMonth || cal.daysPerMonth)) : cal.daysPerMonth;
  const rel = scope.faction && scope.targetFaction ? relation(s, scope.faction, scope.targetFaction) : undefined;
  const roots = {
    operation: scope.operation ? s.operations?.[scope.operation] : undefined, relation: rel, targetFaction: scope.targetFaction ? s.factions[scope.targetFaction] : undefined,
    campaign: s, calendar: { ...s.clock, daysPerMonth: cal.daysPerMonth, daysToNextSpring }, debt: { balance: debt, principal, ratio: principal > 0 ? debt / principal : 0 },
    ledger: s.ledger, inventory: s.inventory, ship: s.ship, restraint: { ...s.restraint, freeSlots: s.restraint.slots.filter(id => id === null).length, beastCount: Object.keys(s.restraint.beasts).length, beastWear: Math.max(0, ...Object.values(s.restraint.beasts).map(b => b.wear)) }, flags: s.flags,
    rift: rift ? { ...rift, widthIndex: GRADES.indexOf(rift.width) + 1 } : undefined,
    faction: faction ? { ...faction, ...(faction.forces ? { strength: strength(faction.forces, modelPower(ctx as OpsCtx)), supply: faction.forces.supply, operationCount: faction.ops?.length ?? 0 } : {}), threatNearby: Object.keys(s.rifts).sort().filter(id => faction.territoryNow.some(n => s.rifts[id]!.zones.includes(n))).length } : undefined,
    person: person ? { ...person, attrs: person.attrsBase, mood: s.roster.employment[person.id]?.mood ?? 0 } : undefined,
    mech, node, contract: scope.contract ? s.contracts[scope.contract] : undefined,
  };
  const tags = new Set(scope.tags ?? []);
  if (node) { node.flags.forEach(t => tags.add(t)); ctx.world.require("node", node.def).tags.forEach(t => tags.add(t)); }
  if (person) ctx.db.require("person", person.def).tags.forEach(t => tags.add(t));
  if (mech) ctx.db.require("frame", mech.frame).tags.forEach(t => tags.add(t));
  for (const id of Object.keys(s.flags).sort()) if (s.flags[id]) tags.add(id);
  const ref = objectRefs(roots);
  return { ref(path) {
    if (!(OPS_REF_ROOTS as readonly string[]).includes(path.split(".")[0]!)) throw new NumExprError(`未知營運 ref 根：${path}`);
    if (path.startsWith("flags.")) return s.flags[path.slice(6)] ?? 0;
    return ref(path);
  }, hasTag: tag => tags.has(tag) };
}
export function evalOpsNum(s: CampaignState, ctx: Pick<OpsCtx, "db" | "world">, expr: NumExpr, scope: OpsScope = {}): number { return typeof expr === "number" ? expr : evalNum(expr, opsEvalCtx(s, ctx, scope)); }
export function evalOpsCond(s: CampaignState, ctx: Pick<OpsCtx, "db" | "world">, cond: Cond, scope: OpsScope = {}): boolean { if (Object.keys(cond).length === 1) { if (cond.all?.length === 0) return true; if (cond.any?.length === 0) return false; } return evalCond(cond, opsEvalCtx(s, ctx, scope)); }
