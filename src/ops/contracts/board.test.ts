import { requirePlace } from "../world/places.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../content/load.ts";
import { newCampaign, createOpsCtx } from "../content/start.ts";
import { cmdAccept, contractsDaily2 } from "./lifecycle.ts";
import { render } from "../text/render.ts";
const { db, world } = loadWorldDirs(["content/base"]);

test("契約板：失守領地不吃掉發包機會，改由仍有可用領地的勢力發包", () => {
  const s = newCampaign(db, world, "start/default", 1), ctx = createOpsCtx(s, db, world);
  for (const place of ["place/dhaka", "place/chittagong"]) s.places[world.require("place", place).id]!.flags.push("blight-lost");
  s.pendingContracts.push({ template: "contract/escort-sealed-convoy", near: "territory" });
  contractsDaily2(s, ctx);
  const c = Object.values(s.contracts)[0]!;
  assert.ok(c); assert.equal(c.target.place, world.require("place", "place/singapore").id);
  contractsDaily2(s, ctx); assert.equal(c.status, "offered");
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
