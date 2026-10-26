import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./test-support.ts";
import { cmdTrade, marketListings, marketsDaily7 } from "./market.ts";
import type { MarketState } from "./market.ts";
import { placeLoc } from "../war/loc.ts";
import { factionId } from "../war/relations.ts";
import { initRnd, leakModel, repGate, repGateBlocked, rndCandidates } from "../war/rnd.ts";
import { worldRules } from "./places.ts";
import { actionsDaily2 } from "./actions.ts";
import { contractsDaily2 } from "../contracts/lifecycle.ts";
import { checkWorld } from "../content/check.ts";
import type { ModelDef } from "../war/types.ts";
import type { MarketDef } from "../state/types.ts";

function setup() {
  const x = fixture(), market = x.ctx.world.require("market", "market/war-armory");
  x.s.ship.pos = placeLoc(x.s, x.ctx, market.place);
  x.s.ledger.balances.cash = 100000;
  return { ...x, market };
}
function fixedMarket(x: ReturnType<typeof setup>, models: ModelDef[], market: MarketDef = x.market) {
  const def: MarketDef = { ...market, lists: [{ kind: "frame", items: [{ def: models[0]!.frame, weight: 1, stockMax: 2, basePrice: 1000 }] }] };
  const world = { ...x.ctx.world, get: ((kind, id) => kind === "market" && id === def.id ? def : x.ctx.world.get(kind, id)) as typeof x.ctx.world.get,
    all: ((kind) => kind === "model" ? models : x.ctx.world.all(kind)) as typeof x.ctx.world.all };
  return { ...x.ctx, world };
}

test("聲望門檻：原規則可見的勢力機拒買原子性，達門檻可買（a、b）", () => {
  const x = setup(), { s, ctx, market } = x, model = ctx.world.require("model", "model/union-fr7"), maker = factionId(s, ctx, model.maker)!;
  s.places[market.place]!.ownerOverride = model.maker;
  assert(marketListings(s, ctx, market).some(l => l.item.model === model.id));
  marketsDaily7(s, ctx);
  const before = structuredClone(s), stock = (s as MarketState).markets![market.id]!.stock[model.frame];
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: market.id, buy: ["component/oa-arm-mantlet", model.frame] }), { ok: false, error: "reputation-required" });
  assert.deepEqual(s, before);
  s.factions[maker]!.rep = repGate(s, ctx, model)!;
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: market.id, buy: [model.frame] }), { ok: true });
  assert(s.ledger.balances.cash < before.ledger.balances.cash);
  assert.equal((s as MarketState).markets![market.id]!.stock[model.frame], stock! - 1);
});

test("通用三系在聲望 0 可買；流出與 maker generic 不設門檻（c）", () => {
  const { s, ctx, market } = setup();
  for (const f of Object.values(s.factions)) f.rep = 0;
  for (const id of ["bulwark-i", "longspear-v1", "ix-01"]) {
    const model = ctx.world.require("model", `model/${id}`);
    assert.equal(repGate(s, ctx, model), undefined);
    assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: market.id, buy: [model.frame] }), { ok: true });
  }
  const model = ctx.world.require("model", "model/union-fr7");
  assert.equal(repGate(s, ctx, { ...model, maker: "generic" }), undefined);
  leakModel(s, ctx, model.id);
  assert.equal(repGateBlocked(s, ctx, model), undefined);
});

test("新國家私有機只在 maker 開局釋出與研發；流出後公開（d）", () => {
  const { s, ctx } = setup();
  const names = ["imperial-court", "russia-umbrella", "north-american-umbrella", "japan-umbrella", "inner-sea-houses", "quito", "nairobi"];
  // 開局即有的 10 台；lead-mech2 加的國家機 availableFrom.month ≥1、要前代，不在開局釋出之列。
  const models = ctx.world.all("model").filter(m => names.some(n => m.maker === `base:faction/${n}`) && !(m.availableFrom && "month" in m.availableFrom && m.availableFrom.month > 0));
  assert.equal(models.length, 10);
  for (const model of models) {
    const maker = factionId(s, ctx, model.maker)!;
    assert.equal(s.factions[maker]!.forces, undefined);
    for (const [id, f] of Object.entries(s.factions)) if (f.rnd) {
      assert.equal(f.rnd.released.includes(model.id), id === maker, `${model.id}: ${id}`);
      f.rnd.released = f.rnd.released.filter(m => m !== model.id);
      assert.equal(rndCandidates(s, ctx, id).some(m => m.id === model.id), id === maker);
    }
  }
  const model = models[0]!;
  leakModel(s, ctx, model.id);
  initRnd(s, ctx, Object.keys(s.factions).filter(id => s.factions[id]!.rnd));
  assert(Object.values(s.factions).filter(f => f.rnd).every(f => f.rnd!.released.includes(model.id)));
});

test("restricted 國家機聲望達標才列出；快取列表用同一規則（e）", () => {
  const { s, ctx, market } = setup(), model = ctx.world.require("model", "model/cn-jade-tablet-i"), maker = factionId(s, ctx, model.maker)!;
  assert(!marketListings(s, ctx, market).some(l => l.item.model === model.id));
  s.factions[maker]!.rep = repGate(s, ctx, model)!;
  assert(marketListings(s, ctx, market).some(l => l.item.model === model.id));
  marketsDaily7(s, ctx);
  assert(marketListings(s, ctx, market).some(l => l.item.model === model.id));
  assert.deepEqual(cmdTrade(s, ctx, { v: "trade", market: market.id, buy: [model.frame] }), { ok: true });
  s.factions[maker]!.rep--;
  assert(!marketListings(s, ctx, market).some(l => l.item.model === model.id));
});

test("固定 frame 清單按最低門檻；任一通用登記即可公開；maker 地盤也擋", () => {
  const x = setup(), model = x.ctx.world.require("model", "model/cn-jade-tablet-i"), maker = factionId(x.s, x.ctx, model.maker)!;
  const low = { ...model, id: "base:model/test-low", tier: "D" as const }, high = { ...model, tier: "A" as const };
  let ctx = fixedMarket(x, [high, low]);
  assert.deepEqual(cmdTrade(x.s, ctx, { v: "trade", market: x.market.id, buy: [model.frame] }), { ok: false, error: "reputation-required" });
  x.s.factions[maker]!.rep = worldRules(x.ctx).repGate.byTier.D;
  assert.deepEqual(cmdTrade(x.s, ctx, { v: "trade", market: x.market.id, buy: [model.frame] }), { ok: true });
  x.s.factions[maker]!.rep = 0;
  ctx = fixedMarket(x, [high, { ...low, generic: true }]);
  assert.deepEqual(cmdTrade(x.s, ctx, { v: "trade", market: x.market.id, buy: [model.frame] }), { ok: true });
  delete (x.s as MarketState).markets;
  x.s.places[x.market.place]!.ownerOverride = model.maker;
  assert(marketListings(x.s, x.ctx, x.market).some(l => l.item.model === model.id));
  assert.deepEqual(cmdTrade(x.s, x.ctx, { v: "trade", market: x.market.id, buy: [model.frame] }), { ok: false, error: "reputation-required" });
});

test("presence 發包不佔地，未指定 issuer 時有領地勢力優先", () => {
  const { s, ctx } = setup(), court = ctx.world.require("faction-ops", "faction-ops/imperial-court"), city = ctx.world.require("faction-ops", "faction-ops/quito");
  for (const [issuer, template] of [[court.id, "contract/scout-rift-margin"], [city.id, "contract/defend-citywall"]]) {
    s.pendingContracts.push({ template: ctx.world.require("contract", template!).id, near: "territory", issuer } as typeof s.pendingContracts[number]);
  }
  contractsDaily2(s, ctx);
  for (const def of [court, city]) {
    const offered = Object.values(s.contracts).find(c => c.issuer === def.id);
    assert(offered && def.presence!.includes(offered.target.place));
    assert.deepEqual(s.factions[def.id]!.territoryNow, []);
  }
  s.contracts = {};
  s.pendingContracts.push({ template: ctx.world.require("contract", "contract/scout-rift-margin").id, near: "territory" });
  contractsDaily2(s, ctx);
  assert(Object.values(s.contracts).every(c => s.factions[c.issuer]!.territoryNow.length > 0));
  const board = fixture();
  actionsDaily2(board.s, board.ctx); contractsDaily2(board.s, board.ctx);
  const representatives = board.ctx.world.all("faction-ops").filter(f => f.tags.includes("presence-board"));
  assert.equal(representatives.length, 7);
  for (const def of representatives) {
    assert(Object.values(board.s.contracts).some(c => c.issuer === def.id));
    assert(!def.actionLanes!.includes("war"));
    assert.equal(board.s.factions[def.id]!.forces, undefined);
  }

});

test("內容檢查拒絕不存在的 override model、越界值與不存在的 presence", () => {
  const { s, ctx } = setup(), rules = ctx.world.require("action", "action/ops-world"), faction = ctx.world.require("faction-ops", "faction-ops/imperial-court");
  const altered = { ...rules, rules: { ...worldRules(ctx), repGate: { ...worldRules(ctx).repGate,
    overrides: { "model/missing": 0, "model/cn-jade-tablet-i": 101, "model/jp-si04": "10" } } } };
  const world = { ...ctx.world,
    get: ((kind, id) => kind === "action" && id === "action/ops-world" ? altered : ctx.world.get(kind, id)) as typeof ctx.world.get,
    all: ((kind) => ctx.world.all(kind).map(d => d.id === faction.id ? { ...faction, presence: ["place/missing"] } : d)) as typeof ctx.world.all };
  const errors = checkWorld(ctx.db, world).errors;
  assert(errors.some(e => e.includes("overrides") && e.includes("model/missing")));
  assert(errors.some(e => e.includes("101") || e.includes("overrides.model/cn-jade-tablet-i")));
  assert(errors.some(e => e.includes("overrides.model/jp-si04")));
  assert(errors.some(e => e.includes("presence") && e.includes("place/missing")));
  const model = ctx.world.require("model", "model/cn-jade-tablet-i");
  const valid = { ...rules, rules: { ...worldRules(ctx), repGate: { ...worldRules(ctx).repGate, overrides: { [model.id]: 0 } } } };
  const validCtx = { ...ctx, world: { ...ctx.world,
    require: ((kind, id) => kind === "action" && (id === rules.id || id === "action/ops-world") ? valid : ctx.world.require(kind, id)) as typeof ctx.world.require } };
  assert.equal(repGate(s, validCtx, model), 0);
  assert.deepEqual(checkWorld(ctx.db, ctx.world).errors, []);
});
