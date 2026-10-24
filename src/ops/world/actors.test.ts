import test from "node:test";
import assert from "node:assert/strict";
import { fixture, day } from "./test-support.ts";
import { actorsDaily2c, actorsDaily3, actorPassable, initActors, planActor, spawnActor } from "./actors.ts";
import { cellKey, gridOf, terrainAt } from "./grid.ts";
import { locAt } from "../war/loc.ts";
import { checkInvariants } from "../sim/invariants.ts";
import { refreshFog } from "./fog.ts";

test("行動者地形不變量雙向：永不進不可進格，地面永不在深蝕", () => {
  const { s, ctx } = fixture();
  s.ship.pos = locAt(ctx, s.ship.pos.map, { x: 0, y: 0 });
  for (let n = 1; n <= 35; n++) {
    day(s, ctx, n); actorsDaily2c(s, ctx); actorsDaily3(s, ctx); refreshFog(s, ctx);
    for (const actor of Object.values(s.actors)) assert.ok(actorPassable(s, ctx, actor, actor.pos.cell), actor.id);
    assert.deepEqual(checkInvariants(s, ctx.world), []);
  }
  const actor = Object.values(s.actors).find(a => a.layer === "ground")!;
  const map = gridOf(ctx.world, actor.pos.map), original = structuredClone(actor.pos);
  const sea = Array.from({ length: map.width * map.height }, (_, i) => ({ x: i % map.width, y: Math.floor(i / map.width) }))
    .find(c => terrainAt(map, c).groundCost === null)!;
  actor.pos.cell = sea;
  assert.ok(checkInvariants(s, ctx.world).some(e => e.includes("actor impassable")));
  actor.pos = original;
  const key = cellKey(actor.pos.cell);
  s.maps[actor.pos.map]!.blight[key] = { patch: "test-deep", rift: "test-rift" };
  s.patches["test-deep"] = { id: "test-deep", rift: "test-rift", map: actor.pos.map, cells: [actor.pos.cell], sinceDay: -1000 };
  s.rifts["test-rift"] = { id: "test-rift", site: "", at: actor.pos, family: "insect", width: "D", phase: "anchored", openedDay: 0, anchorAge: 3, patches: ["test-deep"], fedCount: 0, nextCheck: 100 };
  assert.ok(checkInvariants(s, ctx.world).some(e => e.includes("actor impassable")));
});

test("行動者卡死偵測：沒有連續十天同goal且未移動；開局與每日數量40至200", () => {
  const { s, ctx } = fixture(1), history = new Map<string, { value: string; days: number }>();
  initActors(s, ctx);
  assert.ok(Object.keys(s.actors).length >= 40);
  s.ship.pos = locAt(ctx, s.ship.pos.map, { x: 0, y: 0 });
  for (let n = 1; n <= 35; n++) {
    day(s, ctx, n); actorsDaily2c(s, ctx); actorsDaily3(s, ctx);
    assert.ok(Object.keys(s.actors).length >= 40 && Object.keys(s.actors).length <= 200);
    for (const a of Object.values(s.actors)) {
      const value = JSON.stringify([a.goal, a.pos]), before = history.get(a.id);
      const days = before?.value === value ? before.days + 1 : 0;
      assert.ok(days < 10, `stuck ${a.id} ${value}`); history.set(a.id, { value, days });
    }
  }
});

test("行動者同seed重播相同，選目標不修改輸入且每天最多重算一次", () => {
  const run = () => {
    const { s, ctx } = fixture(2);
    s.ship.pos = locAt(ctx, s.ship.pos.map, { x: 0, y: 0 });
    for (let n = 1; n <= 14; n++) { day(s, ctx, n); actorsDaily2c(s, ctx); actorsDaily3(s, ctx); }
    const actor = Object.values(s.actors)[0]!, before = structuredClone(actor), rng = structuredClone(s.rng);
    assert.deepEqual(planActor(actor, s, ctx, rng), actor);
    assert.deepEqual(rng, s.rng); assert.deepEqual(actor, before);
    return { actors: s.actors, rng: s.rng, events: s.log };
  };
  assert.deepEqual(run(), run());
});

test("行動者生成上限200不再生", () => {
  const { s, ctx } = fixture();
  while (Object.keys(s.actors).length < 200) assert.ok(spawnActor(s, ctx, { kind: "swarm", at: s.ship.pos }));
  assert.equal(spawnActor(s, ctx, { kind: "swarm", at: s.ship.pos }), undefined);
});
