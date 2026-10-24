import test from "node:test";
import assert from "node:assert/strict";
import { fixture, addRift, day } from "./test-support.ts";
import { knownActors, refreshFog, reveal, visibleCells } from "./fog.ts";
import { cellKey } from "./grid.ts";
import { blightAt } from "./blight.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { placeLoc } from "../war/loc.ts";

test("迷霧：known 是觀測當日真值子集，移動後舊情報不洩漏新位置", () => {
  const { s, ctx } = fixture(), rift = addRift(s, ctx);
  const near = structuredClone(s.ship.pos), far = structuredClone(rift.at);
  far.cell = { x: 20, y: 20 };
  s.actors.seen = { id: "seen", kind: "patrol", faction: "base:faction/migrant-crew", pos: near,
    mp: 60, goal: { type: "idle" }, str: 10, stance: "neutral", born: 0, flags: [] };
  s.actors.hidden = { ...structuredClone(s.actors.seen), id: "hidden", pos: far };
  refreshFog(s, ctx);
  for (const [map, state] of Object.entries(s.maps)) for (const [key, known] of Object.entries(state.known)) {
    assert.equal(known.day, s.clock.day); assert(visibleCells(s, ctx, map).has(key));
    for (const actor of known.actorSnapshots ?? []) {
      assert.equal(actor.pos.map, map); assert.equal(cellKey(actor.pos.cell), key);
      assert.deepEqual(actor, s.actors[actor.id]);
    }
    const [x, y] = key.split(",").map(Number);
    assert.deepEqual(known.blight, blightAt(s, ctx, { map, cell: { x: x!, y: y! }, region: "" }));
  }
  assert(!knownActors(s).some(a => a.actor.id === "hidden"));
  s.actors.seen.pos = far;
  assert.deepEqual(knownActors(s).find(a => a.actor.id === "seen")!.actor.pos, near);
  assert(reveal(s, ctx, { cell: far, radius: 0, days: 1 }));
  assert(knownActors(s).some(a => a.actor.id === "hidden"));
  assert.deepEqual(knownActors(s).find(a => a.actor.id === "seen")!.actor.pos, far);
  assert(!s.maps[near.map]!.known[cellKey(near.cell)]!.actors.includes("seen"));
  day(s, ctx, s.clock.day + 1);
  assert(!visibleCells(s, ctx, far.map).has(cellKey(far.cell)));
});

test("行動者效果：spawnActor、setGoal、reveal 通過已載入資料與拒絕錯誤目標", () => {
  const { s, ctx } = fixture(), at = placeLoc(s, ctx, "place/dhaka");
  assert(applyOpsEffect(s, ctx, { spawnActor: { kind: "patrol", at, faction: "base:faction/migrant-crew" } }));
  const actor = Object.values(s.actors).at(-1)!;
  assert(applyOpsEffect(s, ctx, { setGoal: { actor: actor.id, goal: { type: "goto", target: at } } }));
  assert.equal(actor.goal.type, "goto");
  assert(!applyOpsEffect(s, ctx, { setGoal: { actor: "missing", goal: { type: "idle" } } }));
  assert(applyOpsEffect(s, ctx, { reveal: { cell: at, radius: 1, days: 2 } }));
  assert(!applyOpsEffect(s, ctx, { reveal: { cell: at, radius: 1, days: 0 } }));
});
