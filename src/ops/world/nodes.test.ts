import { test } from "node:test";
import assert from "node:assert/strict";
import { blightNode, nodesDaily2, routeOpen, reclaimNode } from "./nodes.ts";
import { fixture, day, addRift } from "./test-support.ts";
test("nodes：深蝕斷路、核不可通行、城邦失守與收復", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx), city = s.ship.at;
  blightNode(s, ctx, city, r.id); nodesDaily2(s, ctx);
  const route = ctx.world.require("route", "route/dhaka-ridge"); assert.equal(routeOpen(s, route), true);
  assert.equal(s.nodes[city]!.ownerOverride, ctx.db.require("faction", "faction/rift-insects").id);
  day(s, ctx, 56); nodesDaily2(s, ctx); assert.equal(routeOpen(s, route), false);
  reclaimNode(s, ctx, city, r.id); assert.equal(routeOpen(s, route), true); assert.equal(s.nodes[city]!.ownerOverride, undefined);
});
