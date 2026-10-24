import { cmdSail } from "../world/move.ts";
import { requirePlace } from "../world/places.ts";
import type { TimeState } from "./tick.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { canonicalJson, fnv1a64 } from "../../core/eventlog.ts";
import { fixture, addRift, day } from "../world/test-support.ts";
import { applyCommand } from "./commands.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { tick } from "./tick.ts";
import { createOpsCtx } from "../content/start.ts";
import { clock } from "../state/clock.ts";
import { offerContract } from "../contracts/index.ts";
const hash = (s: CampaignState) => fnv1a64(canonicalJson(s));
function settle(state: CampaignState, ctx: OpsCtx): CampaignState {
  while (state.pendingChoices.length || state.pendingEncounter) {
    const actor = state.actors[state.pendingEncounter?.actor ?? ""];
    const choice = actor && actor.kind !== "swarm" ? 3 : 1;
    const result = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice });
    assert(result.result.ok); state = result.state;
  }
  return state;
}
function settleContacts(state: CampaignState, ctx: OpsCtx): CampaignState {
  while (state.pendingEncounter) {
    assert.notEqual(state.actors[state.pendingEncounter.actor]?.kind, "swarm");
    state = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice: 3 }).state;
    state = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice: 1 }).state;
  }
  return state;
}

test("tick：同一天八段事件按序，八段都有觀測點", () => {
  const { s, ctx } = fixture(); day(s, ctx, 13); s.pendingEvents.push(ctx.world.require("event", "event/funeral").id);
  // 這個 fixture 只量同一天八段；隔離會額外推進一天的路上迴避。
  s.actors = {}; s.flags.actorPopulationDay = 14;
  const node = requirePlace(s, ctx, "place/chittagong").id;
  cmdSail(s, ctx, { v: "sail", to: node });
  const rift = addRift(s, ctx);
  const contract = offerContract(s, ctx, "contract/clear", ctx.world.all("faction-ops").find(f => f.contractKinds.includes(ctx.world.require("contract", "contract/clear").id))!.id, { place: rift.site, rift: rift.id });
  assert(contract); contract.deadlineDay = 13;
  const mech = s.mechs[s.hangar.bays[0]!]!, part = Object.keys(mech.parts).sort()[0]!;
  s.jobs.push({ id: "job-order", kind: "repair", target: mech.id, part, layer: 0, needHours: 1, doneHours: 0, materials: {}, paid: true, priority: 0 });
  const start = s.log.length;
  tick(s, ctx);
  const state = settle(s, ctx);
  const stages = state.log.slice(start).map(e => Number(e.payload.stage));
  assert(stages.every(Number.isFinite));
  assert.deepEqual(stages, [...stages].sort((a, b) => a - b));
  for (const stage of [1, 2, 3, 4, 5, 6, 7, 8]) assert(stages.includes(stage), `missing stage ${stage}`);
  assert.equal(state.clock.day, 14); assert.equal(state.log.at(-1)?.type, "DaySummary");
});
test("wait 7 與七次 wait 1 的事件型別及完整 state hash 相同", () => {
  const { s, ctx } = fixture();
  const batch = settle(applyCommand(s, ctx.db, ctx.world, { v: "wait", days: 7 }).state, ctx);
  let singles = s;
  for (let i = 0; i < 7; i++) singles = settle(applyCommand(singles, ctx.db, ctx.world, { v: "wait", days: 1 }).state, ctx);
  assert.deepEqual(batch.log.map(e => e.type), singles.log.map(e => e.type));
  assert.equal(hash(batch), hash(singles)); assert.equal(batch.clock.day, 7);
});
test("pendingChoices 凍結 day、保留 pendingTicks，choose 續跑當日與餘日", () => {
  const { s, ctx } = fixture();
  let state = settleContacts(applyCommand(s, ctx.db, ctx.world, { v: "wait", days: 7 }).state, ctx);
  assert.equal(state.clock.day, 1); assert.equal((state as TimeState).waitRemaining, 6);
  const before = structuredClone(state); tick(state, createOpsCtx(state, ctx.db, ctx.world)); assert.deepEqual(state, before);
  state = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice: 1 }).state;
  assert.equal(state.clock.day, 1); assert.equal((state as TimeState).waitRemaining, 6); assert.equal(state.pendingChoices.length, 1);
  state = applyCommand(state, ctx.db, ctx.world, { v: "choose", choice: 1 }).state;
  state = settleContacts(state, ctx);
  assert.equal(state.clock.day, 7); assert.equal(state.pendingTicks, 0);
  assert.equal(state.log.filter(e => e.type === "DaySummary").length, 7);
});
test("裂縫 phase 在大潮、開口滿四天或 BattleResolved 同日轉移", () => {
  const { s, ctx } = fixture(); addRift(s, ctx);
  let state = s;
  for (let i = 0; i < 56; i++) {
    state = applyCommand(state, ctx.db, ctx.world, { v: "wait", days: 1 }).state;
    state = settle(state, ctx);
  }
  const changes = state.log.filter(e => e.type === "RiftPhase"); assert(changes.length > 0);
  for (const e of changes) assert(clock(e.day, ctx.world.require("calendar", state.calendar)).phase === "spring" || e.payload.phase === "anchored" && e.day - state.rifts[String(e.payload.rift)]!.openedDay === 4 || state.log.some(b => b.type === "BattleResolved" && b.day === e.day));
});
