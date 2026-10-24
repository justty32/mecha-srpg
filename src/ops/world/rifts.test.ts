import { test } from "node:test";
import assert from "node:assert/strict";
import { createWorldDB } from "../content/worlddb.ts";
import { createOpsCtx } from "../content/start.ts";
import { onBattleRift, riftsDaily2 } from "./rifts.ts";
import { offerContract, cmdAccept } from "../contracts/lifecycle.ts";
import { fixture, day, addRift } from "./test-support.ts";
import type { RiftState } from "../state/types.ts";

test("rifts：大潮轉移表與非大潮不轉移", () => {
  const rows: [RiftState["phase"], number, RiftState["phase"]][] = [["opening", 4, "opening"], ["opening", 14, "anchored"], ["anchored", 15, "anchored"], ["unanchored", 15, "unanchored"], ["sealing", 15, "sealing"], ["closed", 28, "closed"]];
  for (const [initial, n, expected] of rows) {
    const { s, ctx } = fixture(), r = addRift(s, ctx, { phase: initial }); day(s, ctx, n);
    riftsDaily2(s, ctx); assert.equal(r.phase, expected, `${initial}@${n}`);
    if (expected === "anchored" && initial === "opening") assert.ok(s.nodes[r.node]!.blight);
  }
});
test("rifts：殺捕錨、養裂保留錨齡且 fedCount 只加一次", () => {
  for (const outcome of ["anchor-killed", "anchor-captured"] as const) {
    const { s, ctx } = fixture(), r = addRift(s, ctx, { phase: "anchored", anchorAge: 3 });
    day(s, ctx, 3); onBattleRift(s, ctx, r.id, outcome); assert.equal(r.phase, "unanchored");
    day(s, ctx, 14); riftsDaily2(s, ctx); riftsDaily2(s, ctx);
    assert.equal(r.phase, "anchored"); assert.equal(r.fedCount, 1); assert.equal(r.anchorAge, 3);
  }
});
test("rifts：兩次大潮防守封印、潮月退區到 closed", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx, { phase: "unanchored" }); s.pressure = 100;
  s.nodes[r.node]!.blight = { rift: r.id, depth: "core", sinceDay: 0 }; r.zones = [r.node];
  const other = ctx.world.require("node", "node/reed-marsh").id;
  s.nodes[other]!.blight = { rift: r.id, depth: "shallow", sinceDay: 0 }; r.zones.push(other);
  day(s, ctx, 14); onBattleRift(s, ctx, r.id, "defended"); assert.equal(r.phase, "sealing");
  onBattleRift(s, ctx, r.id, "defended"); assert.equal(r.phase, "sealing");
  day(s, ctx, 28);
  const defense = offerContract(s, ctx, "contract/seal", "faction-ops/migrant-crew", { node: r.node, rift: r.id })!;
  cmdAccept(s, ctx, { v: "accept", contract: defense.id });
  riftsDaily2(s, ctx); assert.equal(s.pendingBattle?.rift, r.id);
  onBattleRift(s, ctx, r.id, "defended"); assert.equal(r.phase, "sealed"); assert.equal(s.pressure, 88);
  day(s, ctx, 42); riftsDaily2(s, ctx); assert.equal(r.phase, "sealed");
  day(s, ctx, 56); riftsDaily2(s, ctx); assert.equal(r.phase, "receding"); assert.equal(s.nodes[r.node]!.blight, undefined);
  day(s, ctx, 84); riftsDaily2(s, ctx); assert.equal(r.phase, "closed"); assert.equal(s.nodes[other]!.blight, undefined);
});
test("rifts：selfClose 一個大潮後關閉，不產生錨", () => {
  const { s, ctx } = fixture(), original = ctx.world.require("rift", "rift/insect");
  const world = { ...ctx.world, get: ctx.world.get, all: ctx.world.all };
  const custom = createWorldDB(ctx.world.packs, { rift: { [original.id]: { ...original, selfClose: true } } });
  world.get = ((kind, id) => kind === "rift" ? custom.get(kind, id) : ctx.world.get(kind, id)) as typeof world.get;
  const c = createOpsCtx(s, ctx.db, world), r = addRift(s, ctx);
  day(s, ctx, 14); riftsDaily2(s, c); assert.equal(r.phase, "closed"); assert.equal(r.anchor, undefined);
});
