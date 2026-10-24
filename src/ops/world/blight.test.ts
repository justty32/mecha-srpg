import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture, addRift, day } from "./test-support.ts";
import { blightAt, patchDepth, rebuildBlightIndex } from "./blight.ts";
import { addPatch, clearPlaceBlight, growPatch, removePatch } from "./patches.ts";
import { cellKey, chebyshev, footprintOf, gridOf, neighbors, terrainAt } from "./grid.ts";
import { placesDaily2, requirePlace, worldRules } from "./places.ts";
import { anchorInstant, openRift, riftsDaily2, spreadDelta } from "./rifts.ts";
import { loadWorldDirs } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { checkInvariants } from "../sim/invariants.ts";
import { contractsDaily2, offerContract } from "../contracts/lifecycle.ts";
import { cmdTrade } from "./market.ts";
import { locAt } from "../war/loc.ts";

function growing() {
  const f = fixture(), r = addRift(f.s, f.ctx, { phase: "anchored" });
  for (let n = 0; n < 12; n++) growPatch(f.s, f.ctx, r);
  return { ...f, r };
}
test("蝕塊：每塊 7–12 格且連通，地形受限時允許不足 7 格", () => {
  const { s, ctx, r } = growing(), map = gridOf(ctx.world, r.at.map);
  for (const id of r.patches.slice(1)) {
    const p = s.patches[id]!, owned = new Set(p.cells.map(cellKey));
    assert(p.cells.length > 0 && p.cells.length <= 12);
    for (const c of p.cells) assert(!["tidesea", "cloudwall"].includes(terrainAt(map, c).id.split("/").at(-1)!));
    const seen = new Set([cellKey(p.cells[0]!)]), queue = [p.cells[0]!];
    for (let i = 0; i < queue.length; i++) for (const c of neighbors(map, queue[i]!)) if (owned.has(cellKey(c)) && !seen.has(cellKey(c))) { seen.add(cellKey(c)); queue.push(c); }
    assert.equal(seen.size, p.cells.length);
  }
  assert(r.patches.length > 1);
});
test("蝕塊：深度與 sinceDay 的潮月門檻一致", () => {
  const { s, ctx, r } = growing(), patch = s.patches[r.patches[1]!]!, loc = { ...r.at, cell: patch.cells[0]! };
  const threshold = worldRules(ctx).nodes.deepMonths * ctx.world.require("calendar", s.calendar).daysPerMonth;
  day(s, ctx, patch.sinceDay + threshold - 1); assert.equal(blightAt(s, ctx, loc)?.depth, "shallow");
  day(s, ctx, patch.sinceDay + threshold); assert.equal(blightAt(s, ctx, loc)?.depth, "deep");
  assert.equal(blightAt(s, ctx, r.at)?.depth, "core");
});
test("蝕塊：LIFO 收縮後 patches 仍為開裂順序前綴，最後才退核", () => {
  const { s, ctx, r } = growing(), original = [...r.patches]; r.phase = "receding";
  for (let n = 1; n <= original.length; n++) {
    day(s, ctx, n * 28); riftsDaily2(s, ctx);
    assert.deepEqual(r.patches, original.slice(0, original.length - n));
  }
  assert.equal(r.phase, "closed"); assert.equal(blightAt(s, ctx, r.at), undefined);
});
test("蝕塊：城邦 footprint 任一格被蝕 iff 裂獸 ownerOverride，乾淨後恢復一潮月", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx), city = requirePlace(s, ctx, "place/dhaka"), owner = ctx.db.require("faction", "faction/rift-insects").id;
  const contract = offerContract(s, ctx, "contract/escort-sealed-convoy", "faction-ops/migrant-crew", { place: city.id });
  assert(contract);
  const p = addPatch(s, ctx, r, [footprintOf(city)[0]!])!;
  assert.equal(s.places[city.id]!.ownerOverride, owner);
  assert.equal(blightAt(s, ctx, locAt(ctx, city.map, city.at)), undefined);
  contractsDaily2(s, ctx); assert.equal(contract.status, "expired");
  removePatch(s, ctx, p.id); assert.equal(s.places[city.id]!.ownerOverride, undefined);
  assert(s.places[city.id]!.flags.includes("recovering"));
  const market = ctx.world.all("market").find(m => m.place === city.id)!;
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: market.id }), { ok: false, error: "recovering" });
  day(s, ctx, 27); placesDaily2(s, ctx); assert(s.places[city.id]!.flags.includes("recovering"));
  day(s, ctx, 28); placesDaily2(s, ctx); assert(!s.places[city.id]!.flags.includes("recovering"));
});
test("蝕塊：菌絲最年輕塊未 burned 不退，燃燒後退且不跳過核", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx, { family: ctx.world.require("rift", "rift/mycelium").id, phase: "anchored" });
  growPatch(s, ctx, r); r.phase = "sealed"; const before = [...r.patches];
  day(s, ctx, 28); riftsDaily2(s, ctx); assert.deepEqual(r.patches, before);
  s.patches[r.patches.at(-1)!]!.burned = true;
  day(s, ctx, 56); riftsDaily2(s, ctx); assert.deepEqual(r.patches, before.slice(0, -1));
  day(s, ctx, 84); riftsDaily2(s, ctx); assert.equal(r.patches.length, 1);
  s.patches[r.patches[0]!]!.burned = true;
  day(s, ctx, 112); riftsDaily2(s, ctx); assert.equal(r.phase, "closed");
});
test("蝕塊：開裂 1 格、錨到 3×3，核塊永遠含 at", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx);
  assert.equal(s.patches[r.patches[0]!]!.cells.length, 1);
  day(s, ctx, 4); riftsDaily2(s, ctx);
  assert.equal(r.phase, "anchored"); assert(s.patches[r.patches[0]!]!.cells.length <= 9);
  for (let n = 0; n < 10; n++) {
    growPatch(s, ctx, r); assert(s.patches[r.patches[0]!]!.cells.some(c => cellKey(c) === cellKey(r.at.cell)));
  }
  clearPlaceBlight(s, ctx, r.site); assert.equal(blightAt(s, ctx, r.at)?.depth, "core");
});
test("蝕塊：同 seed 開局及擴散結果完全相同", () => {
  const a = growing(), b = growing(); assert.deepEqual(a.s, b.s);
});
test("蝕塊：rebuildBlightIndex 後索引與 patches 完全一致，壞索引驗證會紅", () => {
  const { s, ctx, r } = growing(), original = structuredClone(s.maps[r.at.map]!.blight);
  assert.deepEqual(checkInvariants(s, ctx.world), []);
  s.maps[r.at.map]!.blight = {}; assert(checkInvariants(s, ctx.world).some(e => e.includes("index mismatch")));
  rebuildBlightIndex(s); assert.deepEqual(s.maps[r.at.map]!.blight, original); assert.deepEqual(checkInvariants(s, ctx.world), []);
});
test("天象掛鉤：spreadDelta 被呼叫且改變當潮擴散塊數", () => {
  const a = fixture(), b = fixture(), ra = addRift(a.s, a.ctx, { phase: "anchored" }), rb = addRift(b.s, b.ctx, { phase: "anchored" });
  let calls = 0; day(a.s, a.ctx, 14); day(b.s, b.ctx, 14);
  riftsDaily2(a.s, a.ctx); riftsDaily2(b.s, b.ctx, { anchorInstant, spreadDelta: (_s, _ctx, d) => { calls++; assert.equal(d, 14); return 1; } });
  assert.equal(calls, 1); assert.equal(rb.patches.length, ra.patches.length + 1);
});
test("天象掛鉤：anchorInstant 被呼叫且當日跳過 opening 剩餘天數", () => {
  const { s, ctx } = fixture(), r = addRift(s, ctx); day(s, ctx, 1); let calls = 0;
  riftsDaily2(s, ctx, { spreadDelta, anchorInstant: () => { calls++; return true; } });
  assert.equal(calls, 1); assert.equal(r.phase, "anchored");
});
test("蝕核城：孟買 5×5 全核、半徑 15–25 格且三 seed 可重播", () => {
  const { db, world } = loadWorldDirs(["content/base"]);
  for (const seed of [1, 2, 3]) {
    const s = newCampaign(db, world, "start/default", seed), ctx = createOpsCtx(s, db, world), city = requirePlace(s, ctx, "place/mumbai"), r = Object.values(s.rifts).find(r => r.site === city.id)!;
    assert.equal(s.patches[r.patches[0]!]!.cells.length, 25);
    for (const cell of footprintOf(city)) assert.equal(blightAt(s, ctx, locAt(ctx, city.map, cell))?.depth, "core");
    const radius = Math.max(...r.patches.flatMap(id => s.patches[id]!.cells.map(c => chebyshev(c, city.at))));
    assert(radius >= 15 && radius <= 25, `${seed}: ${radius}`);
    assert.deepEqual(s, newCampaign(db, world, "start/default", seed));
    assert.deepEqual(checkInvariants(s, world), []);
  }
});
test("裂縫口：落格建動態地點、契約指 site，閉合只保留遺跡或移除", () => {
  const { s, ctx } = fixture(), def = requirePlace(s, ctx, "place/delta"), r = openRift(s, ctx, locAt(ctx, def.map, def.at), ctx.world.require("rift", "rift/insect"), "C");
  assert.equal(s.places[r.site]!.dyn?.kind, "rift-site"); assert.match(s.places[r.site]!.dyn!.name, /的蟲潮$/);
  const c = offerContract(s, ctx, "contract/clear", "faction-ops/migrant-crew", { place: def.id, rift: r.id })!;
  assert.equal(c.target.place, r.site);
  r.phase = "receding"; day(s, ctx, 28); riftsDaily2(s, ctx);
  assert.equal(r.phase, "closed"); assert.equal(c.status, "expired");
  assert(!s.places[r.site] || s.places[r.site]!.dyn?.kind === "ruin");
});
