import test from "node:test";
import assert from "node:assert/strict";
import { runSortie } from "./run.ts";
import { fixture } from "./test-support.ts";

test("runSortie 雙方 AI 跑至戰果並留下 BattleResolved", () => {
  const { s, ctx, sortie } = fixture();
  const run = runSortie(s, ctx, sortie);
  assert.equal(run.ok, true, JSON.stringify(run));
  assert.ok(run.result);
  assert.ok(run.result.rounds > 0);
  assert.ok(s.log.some(e => e.type === "BattleResolved" && e.payload.hash === run.result!.log.hash));
});
