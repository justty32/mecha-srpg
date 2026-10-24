import { requirePlace } from "./places.ts";
import { placeLoc } from "../war/loc.ts";
import { loadWorldDirs } from "../content/load.ts";
import { newCampaign, createOpsCtx } from "../content/start.ts";
import { clock } from "../state/clock.ts";
import type { CampaignState, OpsCtx, RiftState } from "../state/types.ts";
export function fixture(seed = 7) {
  const { db, world } = loadWorldDirs(["content/base"]);
  const s = newCampaign(db, world, "start/default", seed);
  return { s, ctx: createOpsCtx(s, db, world) };
}
export function day(s: CampaignState, ctx: OpsCtx, n: number): void { s.clock = clock(n, ctx.world.require("calendar", s.calendar)); }
export function addRift(s: CampaignState, ctx: OpsCtx, patch: Partial<RiftState> = {}): RiftState {
  const site = patch.site ?? requirePlace(s, ctx, "place/delta").id;
  const r: RiftState = { id: "rift-test", site, at: placeLoc(s, ctx, site), family: ctx.world.require("rift", "rift/insect").id,
    width: "C", phase: "opening", openedDay: 0, anchorAge: 0, zones: [], fedCount: 0, nextCheck: 14, ...patch };
  s.rifts[r.id] = r;
  return r;
}
