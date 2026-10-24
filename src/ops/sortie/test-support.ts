import { requirePlace } from "../world/places.ts";
import { placeLoc } from "../war/loc.ts";
import { loadWorldDirs } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { cmdAccept, offerContract } from "../contracts/index.ts";
import type { Sortie } from "../state/types.ts";
import type { RunResult } from "../../sim/index.ts";

export function fixture() {
  const { db, world } = loadWorldDirs(["content/base"]);
  const s = newCampaign(db, world, "start/default", 7), ctx = createOpsCtx(s, db, world);
  const node = requirePlace(s, ctx, "place/delta").id;
  s.rifts["rift-test"] = { id: "rift-test", site: node, at: placeLoc(s, ctx, node), family: world.require("rift", "rift/insect").id, width: "C", phase: "anchored", openedDay: 0,
    anchorAge: 0, anchor: db.require("monster", "monster/nestmother-landlord").id, zones: [node], fedCount: 0, nextCheck: 14 };
  s.places[node]!.blight = { rift: "rift-test", depth: "shallow", sinceDay: 0 };
  const contract = offerContract(s, ctx, "contract/clear", "faction-ops/migrant-crew", { place: node, rift: "rift-test" })!;
  if (!contract || !cmdAccept(s, ctx, { v: "accept", contract: contract.id }).ok) throw new Error("fixture contract");
  const mech = Object.keys(s.mechs).sort()[0]!, person = Object.keys(s.roster.persons).sort().find(id => s.roster.employment[id]!.role === "pilot")!;
  const seat = Object.keys(s.mechs[mech]!.seats).find(id => id.includes("pilot"))!;
  const sortie: Sortie = { id: "sortie-test", day: s.clock.day, place: node, loc: placeLoc(s, ctx, node), contract: contract.id, rift: "rift-test", trigger: "contract",
    units: [{ mech, seats: { [seat]: person }, controlMode: "pilot" }], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] };
  return { s, ctx, sortie, mech, person, contract };
}
export function result(): NonNullable<RunResult["result"]> {
  return { winner: "player", reason: "eliminate", rounds: 3, units: [], persons: [], loot: [], log: { events: 1, hash: "manual-battle" } };
}
