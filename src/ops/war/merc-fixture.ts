import { loadWorldDirs } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { onMuster, playerEngages } from "./merc.ts";
import { cmdAccept } from "../contracts/lifecycle.ts";
import type { OperationState } from "./types.ts";
import type { BattleResult } from "../sortie/apply.ts";
const { db, world } = loadWorldDirs(["content/base"]);
export function mercFixture(tier: "none" | "field" | "full" | "arsenal" = "full") {
  const s = newCampaign(db, world, "start/default", 3), ctx = createOpsCtx(s, db, world);
  const actor = world.require("faction-ops", "faction-ops/residual-league").id, target = world.require("faction-ops", "faction-ops/tide-faith").id;
  const model = world.require("model", "model/bulwark-i").id, pos = structuredClone(s.ship.pos);
  const force = { units: [{ model, count: 12, readiness: 1 }], supply: 100, morale: 0, pos, speed: 1 };
  s.factions[target]!.forces = structuredClone(force); s.factions[actor]!.rep = 40; s.factions[target]!.rep = 40;
  const op: OperationState = { id: "merc-op", def: world.require("operation", "operation/seize").id, actor, coActors: [], target: { loc: pos, faction: target },
    phase: "muster", startDay: 0, phaseEnd: 3, force, initialStr: 12, enemyStr: 12, power: { [model]: 1 }, progress: 0, engagesLeft: 7, mercSlots: [], exposed: true, log: [] };
  s.operations![op.id] = op; onMuster(s, ctx, op);
  const c = s.contracts[op.mercSlots[0]!.contract]!, other = s.contracts[op.mercSlots[1]!.contract]!;
  c.template = world.require("contract", `contract/op-join-${tier}`).id;
  c.merc!.terms = structuredClone(world.require("contract", c.template).join!); c.merc!.terms.loan = undefined;
  const accept = () => cmdAccept(s, ctx, { v: "accept", contract: c.id });
  const sortie = () => {
    if (c.status === "offered") { const accepted = accept(); if (!accepted.ok) throw new Error(accepted.error); }
    op.phase = "engage"; playerEngages(s, ctx, op);
    const out = s.pendingBattle!;
    const mech = s.hangar.bays.find((id): id is string => !!id)!, person = Object.keys(s.roster.persons).find(id => s.roster.employment[id]?.role === "pilot")!;
    const seat = Object.keys(s.mechs[mech]!.seats).find(id => id.includes("pilot"))!;
    out.units = [{ mech, seats: { [seat]: person }, controlMode: "pilot" }]; return out;
  };
  return { s, ctx, op, c, other, actor, target, model, accept, sortie };
}
export function mercResult(): BattleResult { return { winner: "player", reason: "eliminate", rounds: 3, units: [], persons: [], loot: [], log: { events: 0, hash: "merc-fixture" } }; }
