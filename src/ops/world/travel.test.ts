import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLedger } from "../state/ledger.ts";
import { cmdSail, travelDaily3, shortestPath } from "./travel.ts";
import { fixture } from "./test-support.ts";
test("travel：最短路徑、逐段燃料與不足時原狀拒絕", () => {
  const { s, ctx } = fixture();
  const path = shortestPath(s, ctx, s.ship.at, "node/singapore")!;
  assert.equal(path.days, 4); assert.equal(path.fuel, 4);
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: "node/singapore" }), { ok: true });
  assert.equal(s.ledger.balances["stock:fuel"], 38);
  for (let i = 0; i < 4; i++) travelDaily3(s, ctx);
  assert.equal(s.ship.at, ctx.world.require("node", "node/singapore").id); assert.equal(s.ship.route, undefined);
  assert.equal(s.ship.fuel.cur, 36); assert.equal(s.ledger.balances["stock:fuel"], 36); assert.deepEqual(checkLedger(s), []);
  s.ship.fuel.cur = 0; const before = structuredClone(s);
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: "node/dhaka" }), { ok: false, error: "insufficient-fuel" }); assert.deepEqual(s, before);
});
test("travel：途中從最後節點改道、深蝕拒絕不改狀態", () => {
  const { s, ctx } = fixture(); cmdSail(s, ctx, { v: "sail", to: "node/singapore" }); travelDaily3(s, ctx);
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: "node/ridge" }), { ok: true });
  travelDaily3(s, ctx); travelDaily3(s, ctx); assert.equal(s.ship.at, ctx.world.require("node", "node/ridge").id);
  const target = ctx.world.require("node", "node/dhaka").id; s.nodes[target]!.blight = { rift: "rift-test", depth: "deep", sinceDay: 0 };
  const before = structuredClone(s); assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: target }), { ok: false, error: "no-route" }); assert.deepEqual(s, before);
});
