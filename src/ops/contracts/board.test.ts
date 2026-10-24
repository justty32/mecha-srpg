import { requirePlace } from "../world/places.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../content/load.ts";
import { newCampaign, createOpsCtx } from "../content/start.ts";
import { runCampaign } from "../sim/campaign.ts";
import { shortestPath } from "../world/move.ts";
import { cmdAccept, contractsDaily2 } from "./lifecycle.ts";
import { render } from "../text/render.ts";
const { db, world } = loadWorldDirs(["content/base"]);

test("契約板：seed 1–5 在第 14 天前至少兩份可達委託", () => {
  for (let seed = 1; seed <= 5; seed++) {
    let maximum = 0;
    runCampaign({ db, world, seed, start: "default", months: 1, policy: "idle", onDay(s) {
      if (s.clock.day > 14) return;
      const ctx = createOpsCtx(s, db, world);
      maximum = Math.max(maximum, Object.values(s.contracts).filter(c => c.status === "offered" && shortestPath(s, ctx, s.ship.pos, c.target.place)).length);
    } });
    assert.ok(maximum >= 2, `seed ${seed}: ${maximum}`);
  }
});
test("契約板：節點委託無裂縫可發；不可達拒收且畫面 disabled", () => {
  const s = newCampaign(db, world, "start/default", 1), ctx = createOpsCtx(s, db, world);
  s.rifts = {};
  s.pendingContracts.push({ template: "contract/escort-sealed-convoy", near: "territory" });
  contractsDaily2(s, ctx);
  const c = Object.values(s.contracts)[0]!;
  assert.ok(c); assert.equal(c.target.rift, undefined);
  assert.deepEqual(cmdAccept(structuredClone(s), ctx, { v: "accept", contract: c.id }), { ok: true });
  c.target.place = requirePlace(s, ctx, "place/selene-city").id;
  const isolated = { ...ctx, world: { ...world, all: ((kind: string) => kind === "lane" ? [] : world.all(kind as "lane")) } as typeof world };
  const before = structuredClone(s);
  assert.deepEqual(cmdAccept(s, isolated, { v: "accept", contract: c.id }), { ok: false, error: "unreachable" });
  assert.deepEqual(s, before);
  assert.ok(render(s, [], isolated.world, db).actions.find(a => a.cmd.v === "accept" && a.cmd.contract === c.id)?.disabled);
});
