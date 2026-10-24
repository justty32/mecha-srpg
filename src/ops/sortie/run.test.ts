import test from "node:test";
import assert from "node:assert/strict";
import { runSortie, sortieBattleSetup } from "./run.ts";
import { runBattle } from "../../sim/index.ts";
import { campaignHash } from "../sim/save.ts";
import { fixture } from "./test-support.ts";

test("runSortie 雙方 AI 跑至戰果並留下 BattleResolved", () => {
  const { s, ctx, sortie } = fixture();
  const run = runSortie(s, ctx, sortie);
  assert.equal(run.ok, true, JSON.stringify(run));
  assert.ok(run.result);
  assert.ok(run.result.rounds > 0);
  assert.ok(s.log.some(e => e.type === "BattleResolved" && e.payload.hash === run.result!.log.hash));
});

test("sortieBattleSetup 唯讀：不改 state，setup 跑 AI 對 AI 的日誌 hash 等於 runSortie", () => {
  const a = fixture(), b = fixture();
  const before = campaignHash(b.s);
  const setup = sortieBattleSetup(b.s, b.ctx, b.sortie);
  assert.equal(setup.ok, true, JSON.stringify(setup));
  assert.equal(campaignHash(b.s), before);
  if (!setup.ok) return;
  assert.ok(setup.sim.setup.units.some(u => u.id === b.mech), "我方單位 id 對位成機甲 id");
  const run = runBattle({ db: b.ctx.db, sim: setup.sim, seed: setup.seed, players: { player: { kind: "ai" }, enemy: { kind: "ai" } } });
  const expected = runSortie(a.s, a.ctx, a.sortie);
  assert.equal(run.result?.log.hash, expected.result?.log.hash);
});

test("sortieBattleSetup 拒絕不合法編成", () => {
  const { s, ctx, sortie } = fixture();
  const r = sortieBattleSetup(s, ctx, { ...sortie, units: [] });
  assert.deepEqual(r, { ok: false, error: "empty-sortie" });
});
