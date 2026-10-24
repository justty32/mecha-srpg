import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../content/load.ts";
import { newCampaign, createOpsCtx } from "../content/start.ts";
import { placeAt, placeLoc } from "../war/loc.ts";
import { requirePlace } from "../world/places.ts";
import { entityName, parse } from "./parse.ts";
import { eventLog, templateEntries } from "./templates.ts";
import { runCampaign } from "../sim/campaign.ts";
import { contractsDaily2 } from "../contracts/lifecycle.ts";
import { buildSnapshot } from "../../ui-adapter/ops/vm/snapshot.ts";
import type { MarketState } from "../world/market.ts";
const { db, world } = loadWorldDirs(["content/base"]);

test("名冊與名稱解析：無重名、九類名稱都有中文，七態及帳名可讀", () => {
  const s = newCampaign(db, world, "start/default", 1), ctx = createOpsCtx(s, db, world);
  const names = Object.keys(s.roster.persons).map(id => entityName(id, s, world));
  assert.equal(new Set(names).size, names.length);
  for (const name of [...names, ...Object.keys(s.mechs).map(id => entityName(id, s, world))]) assert.match(name, /\p{Script=Han}/u);
  s.rifts["rift-test"] = { id: "rift-test", site: requirePlace(s, ctx, "place/salt-flat").id, at: placeLoc(s, ctx, "place/salt-flat"), family: "beast", width: "C", phase: "anchored", openedDay: 0, anchorAge: 0, zones: [], fedCount: 0, nextCheck: 14 };
  s.pendingContracts.push({ template: "contract/escort-sealed-convoy", near: "territory" }); contractsDaily2(s, ctx);
  s.jobs.push({ id: "job-test", kind: "repair", target: "mech-8", needHours: 1, doneHours: 0, paid: false, materials: {}, priority: 0 });
  delete s.roster.names["mech-8"];
  const cases = ["person-1", "faction-ops/migrant-crew", "place/dhaka", "rift-test", Object.keys(s.contracts)[0]!, "job-test", "anchored", "cash", "mech-8", s.mechs["mech-8"]!.frame, "model/bulwark-i"];
  for (const id of cases) { const name = entityName(id, s, world); assert.match(name, /\p{Script=Han}/u, id); assert.ok(!name.includes("/"), id); }
  assert.match(entityName("rift-test", s, world), /鹽灘.*獸族裂縫/);
  for (const id of ["opening", "anchored", "unanchored", "sealing", "sealed", "receding", "closed", "debt", "stock:flesh", "stock:fuel", "stock:scrap"]) assert.match(entityName(id, s, world), /\p{Script=Han}/u, id);
});
test("log：seed 1 的 30 天沒有空佔位、id 斜線與浮點尾數", () => {
  const { state } = runCampaign({ db, world, seed: 1, start: "default", months: 2, policy: "idle" });
  assert.ok(state.log.some(e => e.day === 30));
  const entries = templateEntries(world);
  for (const event of state.log.filter(e => e.day <= 30)) {
    const { text } = eventLog(event, state, world);
    assert.ok(entries[event.type], event.type);
    assert.ok(!/  |\/|\d+\.\d{3,}/.test(text), `${event.type}: ${text}`);
  }
});
test("動態商品：snapshot 與 parse 候選一致且解析不更動狀態", () => {
  const s = newCampaign(db, world, "start/default", 1) as MarketState, ctx = createOpsCtx(s, db, world);
  const market = world.all("market").find(m => m.place === placeAt(s, ctx, s.ship.pos))!;
  const frame = db.all("frame").find(f => !market.lists.some(l => l.items.some(i => i.def === f.id)))!;
  s.markets = { [market.id]: { refreshedDay: 1, stock: { [frame.id]: 2 }, dynamic: [{ kind: "frame", item: { def: frame.id, imported: true, stockMax: 2, weight: 1, basePrice: 100 } }] } };
  const before = structuredClone(s);
  const snapshot = buildSnapshot(s, ctx, { tab: "market", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false });
  assert.ok(snapshot.market.items.some(i => i.id === frame.id));
  assert.deepEqual(parse(`買賣 ${market.id} 買 "${frame.name}"`, s, world), { v: "trade", market: market.id, buy: [frame.id] });
  // 同 domain 只有這一項時，錯字必須回傳這個動態候選（不靠明確 id 旁路）。
  const only = { ...world, all: ((kind: string) => kind === "market" ? [{ ...market, lists: [] }] : world.all(kind as "market")) } as typeof world;
  createOpsCtx(s, db, only);
  const error = parse(`買賣 ${market.id} 買 不存在的商品`, s, only);
  assert.ok("error" in error); assert.ok(error.candidates?.some(c => c.includes(frame.id) && c.includes(frame.name)));
  assert.ok(error.candidates!.length <= 8);
  assert.deepEqual(s, before);
});
