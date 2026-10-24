import { nextInt } from "../../core/rng.ts";
import type { CampaignState, OpsCommand, OpsCtx, Sortie } from "../state/types.ts";
import { evalOpsCond } from "../content/cond.ts";
import { shortestPath } from "../world/index.ts";
import { applyCommand } from "../time/index.ts";
export type Policy = (s: CampaignState, ctx: OpsCtx) => OpsCommand;
export type PolicyName = "idle" | "greedy" | "random";
function choice(s: CampaignState, ctx: OpsCtx): OpsCommand | undefined {
  const prompt = s.pendingChoices[0]; if (!prompt) return undefined;
  const index = prompt.choices.findIndex(c => !c.requires || evalOpsCond(s, ctx, c.requires, { node: s.ship.at, ...(prompt.person ? { person: prompt.person } : {}) }));
  if (index < 0) throw new Error("prompt-without-legal-choice");
  return { v: "choose", choice: index + 1 };
}
export const idle: Policy = (s, ctx) => choice(s, ctx) ?? { v: "wait", days: 1 };

function allUnits(s: CampaignState, ctx: OpsCtx): Sortie["units"] {
  const available = Object.keys(s.roster.persons).sort().filter(id => !s.roster.dead.some(d => d.person === id) && s.roster.persons[id]!.pools.hp?.cur !== 0);
  const used = new Set<string>();
  return [...new Set(s.hangar.bays.filter((id): id is string => !!id))].sort().filter(id => !s.hangar.dormant.includes(id)).map(id => {
    const mech = s.mechs[id]!, frame = ctx.db.require("frame", mech.frame);
    const captured = s.flags[`captured:${id}`] === 1 || ctx.db.all("species").some(sp => sp.capture.frame === frame.id);
    const seats: Record<string, string | null> = {};
    if (!captured) for (const seat of ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []).sort((a, b) => a.id < b.id ? -1 : 1)) {
      const compatible = (person: string) => !used.has(person) && seat.accepts.includes(ctx.db.require("person", s.roster.persons[person]!.def).kind === "soul" ? "soul" : "pilot");
      const occupant = mech.seats[seat.id], person = occupant && available.includes(occupant) && compatible(occupant) ? occupant : available.find(compatible);
      seats[seat.id] = person ?? null; if (person) used.add(person);
    }
    const kinds = Object.values(seats).filter((person): person is string => !!person).map(person => ctx.db.require("person", s.roster.persons[person]!.def).kind);
    const controlMode = captured ? "instinct" : kinds.includes("human") ? (kinds.includes("soul") ? "shared" : "pilot") : kinds.includes("soul") ? "soul" : "none";
    return { mech: id, seats, controlMode } as Sortie["units"][number];
  }).filter(unit => unit.controlMode !== "none");
}
export const greedy: Policy = (s, ctx) => {
  const pending = choice(s, ctx); if (pending) return pending;
  if (s.ship.route && !s.pendingBattle) return { v: "wait", days: 1 };
  const active = Object.keys(s.contracts).sort().map(id => s.contracts[id]!).find(c => ["active", "stage"].includes(c.status));
  const units = allUnits(s, ctx);
  // SPEC-GAP：validateSortie 尚未拒絕全空座位；無可控制機體時等待，避免反覆跑到 battle-maxSteps。
  if (!units.length) return { v: "wait", days: 1 };
  if (s.pendingBattle || active?.target.node === s.ship.at) return { v: "sortie", sortie: {
    ...s.pendingBattle, ...(active && !s.pendingBattle ? { contract: active.id, node: active.target.node, rift: active.target.rift, trigger: "contract" as const } : {}), units,
  } };
  if (active) return { v: "sail", to: active.target.node };
  const offers = Object.keys(s.contracts).sort().map(id => s.contracts[id]!).filter(c => c.status === "offered")
    .map(c => ({ c, path: shortestPath(s, ctx, s.ship.at, c.target.node) })).filter(item => item.path)
    .sort((a, b) => a.path!.days - b.path!.days || (a.c.id < b.c.id ? -1 : 1));
  for (const { c } of offers) {
    const cmd: OpsCommand = { v: "accept", contract: c.id };
    if (applyCommand(s, ctx.db, ctx.world, cmd).result.ok) return cmd;
  }
  return { v: "wait", days: 1 };
};
export const random: Policy = (s, ctx) => {
  const pending = choice(s, ctx); if (pending) return pending;
  const candidates: OpsCommand[] = [{ v: "wait", days: 1 }, { v: "map" }, { v: "dock" }, { v: "drift" }, { v: "board" }];
  for (const id of Object.keys(s.contracts).sort()) {
    if (s.contracts[id]!.status === "offered") candidates.push({ v: "accept", contract: id });
    if (s.contracts[id]!.status === "active") candidates.push({ v: "drop", contract: id });
  }
  if (s.ledger.balances.cash > 0 && s.ledger.balances.debt > 0) candidates.push({ v: "pay", account: "debt", amount: Math.min(s.ledger.balances.cash, s.ledger.balances.debt) });
  const legal = candidates.filter(cmd => applyCommand(s, ctx.db, ctx.world, cmd).result.ok);
  // 政策只讀 RNG 快照：抽籤不改營運 state，記錄的指令即可完整重播。
  return legal[nextInt({ ...s.rng }, legal.length)]!;
};
export const policies: Record<PolicyName, Policy> = { idle, greedy, random };
