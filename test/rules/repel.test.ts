import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createBattle, evaluateObjectives, retreat } from "../../src/rules/index.ts";
import type { Objective } from "../../src/core/types-def.ts";

const { db } = loadContentDirs(["content/base"]);
function fixture(objectives: Objective[]) {
  const s = createBattle(db, { id: "repel", map: { width: 6, height: 6, fill: "terrain/plain", exits: [] },
    objectives, maxRounds: 10, units: [
      { id: "p", owner: "player", pos: { x: 1, y: 1 }, monster: { species: "species/hound", grade: "C" } },
      { id: "e", owner: "enemy", pos: { x: 5, y: 3 }, monster: { species: "species/hound", grade: "C" } },
    ] }, 1);
  return { db, s };
}

test("eliminate 撤光判 repelled；空出口地圖可從四邊撤離", () => {
  const ctx = fixture([{ kind: "eliminate", for: "player", params: {}, onComplete: "win" }]);
  assert.equal(retreat(ctx, "p")?.code, "not-at-exit");
  assert.equal(retreat(ctx, "e"), null);
  assert.deepEqual(ctx.s.rt!.outcome, { winner: "player", reason: "eliminate", detail: "repelled" });
});

test("通用擊退在 timeout 前判勝；敵對方仍有 active 就不能勝", () => {
  const ctx = fixture([{ kind: "hold", for: "player", params: { rounds: 20 }, onComplete: "win" }]);
  assert.equal(evaluateObjectives(ctx, false), null);
  ctx.s.round = 10;
  ctx.s.rt!.unitStatus.e = "retreated";
  assert.deepEqual(evaluateObjectives(ctx, true), { winner: "player", reason: "repelled", detail: "repelled" });
});

test("eliminate 全死保持舊 payload，沒有 detail", () => {
  const ctx = fixture([{ kind: "eliminate", for: "player", params: {}, onComplete: "win" }]);
  ctx.s.rt!.unitStatus.e = "dead";
  assert.deepEqual(evaluateObjectives(ctx, false), { winner: "player", reason: "eliminate" });
  assert.equal(Object.hasOwn(ctx.s.rt!.outcome!, "detail"), false);
});


test("陣營專屬出口、明列空出口及撤離拒絕優先序", () => {
  const ctx = fixture([]), runtime = ctx.s.rt!;
  runtime.exits = [{ x: 5, y: 3 }];
  runtime.exitsBySlot = { player: [{ x: 0, y: 1 }], enemy: [{ x: 5, y: 2 }], third: [] };
  assert.equal(retreat(ctx, "e")?.code, "not-at-exit");
  ctx.s.units.e!.pos = { x: 5, y: 2 };
  runtime.noRetreat = true;
  assert.equal(retreat(ctx, "missing")?.code, "bad-actor");
  runtime.unitStatus.e = "dead";
  assert.equal(retreat(ctx, "e")?.code, "not-active");
  runtime.unitStatus.e = "active";
  assert.equal(retreat(ctx, "e")?.code, "no-retreat");
  runtime.noRetreat = false;
  runtime.exitsBySlot.enemy = [];
  assert.equal(retreat(ctx, "e")?.code, "not-at-exit");
  runtime.exitsBySlot.enemy = [{ x: 5, y: 2 }];
  assert.equal(retreat(ctx, "e"), null);
});
