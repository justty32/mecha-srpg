import { test } from "node:test";
import assert from "node:assert/strict";
import { blightPlace, placesDaily2, reclaimPlace, nearbyPlaces } from "./places.ts";
import { placeAt } from "../war/loc.ts";
import { fixture, day, addRift } from "./test-support.ts";
test("places：地點蝕深、距離鄰接、城邦失守與收復", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx), city = placeAt(s, ctx, s.ship.pos)!;
  blightPlace(s, ctx, city, r.id); placesDaily2(s, ctx);
  assert.equal(s.places[city]!.blight?.depth, "shallow");
  assert.equal(s.places[city]!.ownerOverride, ctx.db.require("faction", "faction/rift-insects").id);
  day(s, ctx, 56); placesDaily2(s, ctx); assert.equal(s.places[city]!.blight?.depth, "deep");
  assert(nearbyPlaces(s, ctx, city).includes("base:place/chittagong"));
  assert(!nearbyPlaces(s, ctx, city).includes("base:place/singapore"));
  reclaimPlace(s, ctx, city, r.id); assert.equal(s.places[city]!.blight, undefined); assert.equal(s.places[city]!.ownerOverride, undefined);
});
