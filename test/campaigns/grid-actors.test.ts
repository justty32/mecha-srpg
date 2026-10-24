import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fixture } from "../../src/ops/world/test-support.ts";
import { spawnActor } from "../../src/ops/world/actors.ts";
import { locAt } from "../../src/ops/war/loc.ts";
import { applyCommand } from "../../src/ops/time/commands.ts";
import { campaignHash } from "../../src/ops/sim/save.ts";
import type { OpsCommand } from "../../src/ops/state/types.ts";

test("黃金戰役：sail格→遭遇→choose迴避→Evaded→sail地點→Arrived", () => {
  const { s, ctx } = fixture(123);
  for (const a of Object.values(s.actors)) a.stance = "friendly";
  const start = structuredClone(s.ship.pos), at = locAt(ctx, start.map, { x: start.cell.x + 3, y: start.cell.y });
  const actor = spawnActor(s, ctx, { kind: "swarm", at, id: "golden-swarm", str: 10 })!;
  actor.expires = 2;
  let state = s;
  const run = (command: OpsCommand) => {
    const result = applyCommand(state, ctx.db, ctx.world, command);
    assert.ok(result.result.ok, JSON.stringify({ command, result: result.result })); state = result.state;
  };
  run({ v: "sail", to: { x: start.cell.x + 4, y: start.cell.y } });
  run({ v: "wait", days: 1 });
  assert.equal(state.pendingEncounter?.actor, actor.id);
  run({ v: "choose", choice: 1 });
  while (state.pendingChoices.length) run({ v: "choose", choice: 1 });
  assert.ok(state.log.some(e => e.type === "Evaded"));
  run({ v: "sail", to: "place/chittagong" });
  for (let n = 0; state.ship.path && n < 5; n++) {
    run({ v: "wait", days: 1 });
    while (state.pendingChoices.length) run({ v: "choose", choice: 1 });
  }
  assert.ok(!state.ship.path);
  const events = state.log.filter(e => ["EncounterOffered", "Evaded", "Arrived"].includes(e.type));
  assert.deepEqual(events.map(e => e.type), ["EncounterOffered", "Evaded", "Arrived"]);
  const actual = { hash: campaignHash(state.log), events: events.map(e => ({ day: e.day, type: e.type })), day: state.clock.day };
  const path = `${import.meta.dirname}/grid-actors.hash.json`;
  if (process.env.GOLDEN_UPDATE === "1") writeFileSync(path, `${JSON.stringify(actual, null, 2)}\n`);
  assert.deepEqual(actual, JSON.parse(readFileSync(path, "utf8")));
});
