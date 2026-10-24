import test from "node:test";
import assert from "node:assert/strict";
import { createRng, pickWeighted } from "../../core/rng.ts";
import { loadWorldDirs, WORLD_KINDS } from "../content/load.ts";
import { newCampaign, createOpsCtx } from "../content/start.ts";
import { createWorldDB } from "../content/worlddb.ts";
import type { WorldTables } from "../content/worlddb.ts";
import { checkWorld } from "../content/check.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { clock } from "../state/clock.ts";
import { cmdTrade } from "../world/market.ts";
import { initRnd, rndIncome, rndCandidates, rndMonthly2f, modelAvailable, factionModelPool, replenishWeight, leakModel, modelVisibleAt, onOperationSuccess } from "./rnd.ts";
import { syncLineages } from "./lineages.ts";
import { relation } from "./relations.ts";
import { signTreaty, treatiesDaily } from "./treaties.ts";
import { nodeLoc } from "./loc.ts";
import type { ModelDef, OperationState } from "./types.ts";

const loaded = loadWorldDirs(["content/base"]), { db, world } = loaded;
const league = world.require("faction-ops", "faction-ops/residual-league").id;
const tide = world.require("faction-ops", "faction-ops/tide-faith").id;
const modelId = (name: string) => world.require("model", `model/${name}`).id;
const lineageId = (name: string) => world.require("lineage", `lineage/${name}`).id;
function setup(overrides: Partial<ModelDef>[] = [], edit?: (tables: WorldTables) => void) {
  let w = world;
  if (overrides.length || edit) {
    const tables: WorldTables = {};
    for (const kind of WORLD_KINDS) (tables as Record<string, unknown>)[kind] = Object.fromEntries(world.all(kind).map(d => [d.id, structuredClone(d)]));
    for (const patch of overrides) Object.assign(tables.model![patch.id!]!, patch);
    edit?.(tables);
    w = createWorldDB(world.packs, tables);
  }
  const s = newCampaign(db, w, "start/default", 1);
  return { s, ctx: createOpsCtx(s, db, w) };
}
function day(x: ReturnType<typeof setup>, n: number) { x.s.clock = clock(n, x.ctx.world.require("calendar", x.s.calendar)); }
function operation(x: ReturnType<typeof setup>): OperationState {
  const pos = nodeLoc(x.ctx, "node/dhaka");
  return { id: "rnd-op", def: world.require("operation", "operation/clear").id, actor: league, coActors: [], target: { loc: pos },
    phase: "resolve", startDay: 0, phaseEnd: 0, force: { pos, units: [{ model: modelId("union-at12"), count: 10, readiness: 1 }], supply: 100, morale: 0, speed: 1 },
    enemyStr: 0, progress: 1, engagesLeft: 0, mercSlots: [], exposed: true, log: [], contributions: { [league]: [] } };
}
test("研發開局：持有血統與通用、month 0 已釋出，隊長與未到月不進池", () => {
  const { s, ctx } = setup(), rnd = s.factions[league]!.rnd!;
  assert(rnd.lineages.includes(lineageId("xingtian")));
  assert(!rnd.lineages.includes(lineageId("jinghai")));
  assert(rnd.released.includes(modelId("union-fr7")));
  assert(!rnd.released.includes(modelId("union-futu")));
  assert(!rnd.released.includes(modelId("longspear-v7")));
  assert.equal(s.models![modelId("union-fr7")]!.releasedDay, s.clock.day);
  assert.deepEqual(factionModelPool(s, ctx, league), [...rnd.released].sort());
});
test("income：各規模基數、活血統、trade、war、缺補給與失地", () => {
  const x = setup(), f = x.s.factions[league]!, r = relation(x.s, league, tide)!;
  for (const [scale, expected] of [["state",12],["company",10],["city",5],["guild",1],["band",1]] as const) {
    f.scaleNow = scale; f.rnd!.lineages = []; f.territoryNow = [...x.ctx.world.require("faction-ops", league).territory]; f.forces!.supply = 100;
    for (const rel of Object.values(x.s.relations!)) { rel.state = "neutral"; rel.treaties = []; }
    assert.equal(rndIncome(x.s, x.ctx, league), expected);
  }
  f.scaleNow = "state"; f.rnd!.lineages = ["active", "stalled"]; f.rnd!.stalled = ["stalled"];
  r.treaties.push({ def: world.require("treaty", "treaty/trade").id, signedDay: 0, endDay: 100 });
  r.state = "war"; f.forces!.supply = 29; f.territoryNow.shift();
  assert.equal(rndIncome(x.s, x.ctx, league), 12 + 2 + 1 - 3 - 2 - 1);
});
test("可選池：缺任一前置不選，全部釋出才選", () => {
  const x = setup(); day(x, 112); const rnd = x.s.factions[league]!.rnd!, target = modelId("longspear-v7");
  rnd.released = rnd.released.filter(id => id !== modelId("longspear-v4"));
  assert(!rndCandidates(x.s, x.ctx, league).some(m => m.id === target));
  rnd.released.push(modelId("longspear-v4")); assert(rndCandidates(x.s, x.ctx, league).some(m => m.id === target));
});
test("可選池：血統缺席與 stalled 均擋新型", () => {
  const x = setup(), rnd = x.s.factions[league]!.rnd!, target = modelId("union-fr8"), lineage = lineageId("xingtian");
  assert(rndCandidates(x.s, x.ctx, league).some(m => m.id === target));
  rnd.stalled.push(lineage); assert(!rndCandidates(x.s, x.ctx, league).some(m => m.id === target));
  rnd.stalled = []; rnd.lineages = rnd.lineages.filter(id => id !== lineage);
  assert(!rndCandidates(x.s, x.ctx, league).some(m => m.id === target));
});
test("首次登場：month 到期只是候選；event 需事件旗標", () => {
  const x = setup(), m = world.require("model", "model/longspear-v7"), event = world.require("model", "model/backside-white-night");
  day(x, 83); assert(!modelAvailable(x.s, x.ctx, league, m));
  day(x, 112); assert(modelAvailable(x.s, x.ctx, league, m)); assert(!x.s.factions[league]!.rnd!.released.includes(m.id));
  assert(!modelAvailable(x.s, x.ctx, league, event));
  assert("event" in event.availableFrom); x.s.flags[event.availableFrom.event] = 1;
  assert(modelAvailable(x.s, x.ctx, league, event));
});
test("研發只在潮月第1天加點，不消耗主 rng", () => {
  const x = setup(), before = structuredClone(x.s.factions), rng = { ...x.s.rng }, war = { ...x.s.warRng! };
  for (const n of [1, 6, 14, 27]) { day(x, n); rndMonthly2f(x.s, x.ctx); }
  assert.deepEqual(x.s.factions, before); assert.deepEqual(x.s.warRng, war); assert.deepEqual(x.s.rng, rng);
});
test("點數逐月轉入done不重複計入，滿cost釋出且同日不重跑", () => {
  const target = modelId("longspear-v7"), x = setup([{ id: target, cost: 40, availableFrom: { month: 0 } }]);
  for (const [id, f] of Object.entries(x.s.factions)) if (id !== league) f.alive = false;
  const rnd = x.s.factions[league]!.rnd!; rnd.released = rnd.released.filter(id => id !== target); rnd.current = { model: target, done: 0 };
  day(x, 28); const income = rndIncome(x.s, x.ctx, league); rndMonthly2f(x.s, x.ctx);
  assert.equal(rnd.current!.done, income); assert.equal(rnd.points, 0);
  const once = structuredClone(x.s); rndMonthly2f(x.s, x.ctx); assert.deepEqual(x.s, once);
  day(x, 56); rndMonthly2f(x.s, x.ctx); assert.equal(rnd.current!.done, income * 2);
  day(x, 84); rndMonthly2f(x.s, x.ctx); assert(rnd.released.includes(target)); assert.equal(rnd.points, 0); assert(!rnd.current);
  assert.equal(x.s.log.filter(e => e.type === "ModelReleased" && e.payload.model === target).length, 1);
});
test("取殼後恰滿兩潮月才開血統（非月初取得）", () => {
  const x = setup(), lineage = lineageId("old-array"); day(x, 10);
  assert(applyOpsEffect(x.s, x.ctx, { transferShell: { shell: "shell/old-array", to: league } }));
  syncLineages(x.s, x.ctx); day(x, 65); treatiesDaily(x.s, x.ctx);
  assert(!x.s.factions[league]!.rnd!.lineages.includes(lineage));
  day(x, 66); treatiesDaily(x.s, x.ctx); assert(x.s.factions[league]!.rnd!.lineages.includes(lineage));
  assert(x.s.log.some(e => e.type === "LineageOpened" && e.day === 66 && e.payload.lineage === lineage));
});
test("失殼停研保留已釋出與進度，其他血統仍推進", () => {
  const x = setup(), rnd = x.s.factions[league]!.rnd!, target = modelId("union-fr8");
  rnd.current = { model: target, done: 4 }; day(x, 10);
  applyOpsEffect(x.s, x.ctx, { transferShell: { shell: "shell/xingtian", to: tide } }); syncLineages(x.s, x.ctx);
  assert(rnd.stalled.includes(lineageId("xingtian"))); assert(rnd.released.includes(modelId("union-fr7")));
  day(x, 28); rndMonthly2f(x.s, x.ctx); assert.equal(x.s.factions[league]!.rndProgress!.suspended![target], 4);
  assert(!rnd.released.includes(target)); assert(x.s.log.some(e => e.type === "ModelReleased" && e.payload.faction === league));
});
test("重新取得殼仍需兩潮月，不能立即解除停研", () => {
  const x = setup(), lineage = lineageId("xingtian"); day(x, 1);
  applyOpsEffect(x.s, x.ctx, { transferShell: { shell: "shell/xingtian", to: tide } }); syncLineages(x.s, x.ctx);
  day(x, 2); applyOpsEffect(x.s, x.ctx, { transferShell: { shell: "shell/xingtian", to: league } }); syncLineages(x.s, x.ctx);
  assert(x.s.factions[league]!.rnd!.stalled.includes(lineage)); day(x, 58); syncLineages(x.s, x.ctx);
  assert(!x.s.factions[league]!.rnd!.stalled.includes(lineage));
});
test("流出改campaign覆寫與市場可見性，不改不可變內容；所有勢力取得通用型", () => {
  const x = setup(), model = world.require("model", "model/union-fr7"), node = world.require("node", "node/dhaka").id;
  assert(!modelVisibleAt(x.s, x.ctx, model, node)); leakModel(x.s, x.ctx, model.id, tide);
  assert(modelVisibleAt(x.s, x.ctx, model, node)); assert.equal(model.generic, false); assert.equal(model.exportPolicy, "restricted");
  assert.equal(x.s.models![model.id]!.genericSince, x.s.clock.day);
  for (const [id, f] of Object.entries(x.s.factions)) if (f.rnd) assert(factionModelPool(x.s, x.ctx, id).includes(model.id));
  const count = x.s.log.length; leakModel(x.s, x.ctx, model.id, tide); assert.equal(x.s.log.length, count);
});
test("licensed 友好可見、restricted 只maker、未釋出不可見", () => {
  const id = modelId("union-fr7"), x = setup([{ id, exportPolicy: "licensed" }]), m = x.ctx.world.require("model", id);
  const node = x.ctx.world.require("node", "node/dhaka").id; x.s.nodes[node]!.ownerOverride = x.ctx.world.require("faction-ops", tide).faction;
  const r = relation(x.s, league, tide)!; r.state = "neutral"; assert(!modelVisibleAt(x.s, x.ctx, m, node));
  r.state = "friendly"; assert(modelVisibleAt(x.s, x.ctx, m, node));
  assert(!modelVisibleAt(x.s, x.ctx, { ...m, exportPolicy: "restricted" }, node));
  delete x.s.models![id]; assert(!modelVisibleAt(x.s, x.ctx, m, node));
});
test("玩家轉賣 restricted 機：成交才 TechLeaked 與 maker rep -15", () => {
  const x = setup(), model = x.ctx.world.require("model", "model/union-fr7"), id = "sale-rnd";
  x.s.mechs[id] = instantiateMech(db, id, model.frame); x.s.inventory.mechs.push(id); x.s.hangar.bays.push(id);
  const market = x.ctx.world.require("market", "market/war-armory"); x.s.ship.at = market.node;
  const before = structuredClone(x.s); assert.equal(cmdTrade(x.s, x.ctx, { v: "trade", market: market.id, sell: [id], buy: ["bad"] }).ok, false); assert.deepEqual(x.s, before);
  assert.deepEqual(cmdTrade(x.s, x.ctx, { v: "trade", market: market.id, sell: [id] }), { ok: true });
  assert.equal(x.s.factions[league]!.rep, -15); assert(!x.s.mechs[id]);
  assert(x.s.log.some(e => e.type === "TechLeaked" && e.payload.model === model.id && e.payload.by === "player"));
});
test("補員權重舊多新少、同tier抽樣反映權重、隊長權重零", () => {
  const x = setup(), old = world.require("model", "model/bulwark-i"), fresh = world.require("model", "model/longspear-v1"); day(x, 280);
  x.s.models![old.id]!.releasedDay = 0; x.s.models![fresh.id]!.releasedDay = 280;
  assert.equal(replenishWeight(x.s, x.ctx, old) / replenishWeight(x.s, x.ctx, fresh), 11);
  const rng = createRng(10); let older = 0;
  for (let i = 0; i < 500; i++) if (pickWeighted(rng, [old, fresh], m => replenishWeight(x.s, x.ctx, m)) === old) older++;
  assert(older > 400); assert.equal(replenishWeight(x.s, x.ctx, world.require("model", "model/union-futu")), 0);
});
test("無對應隊長機不擲；有同系列最近mark+1則一台且列入返還", () => {
  const id = modelId("union-futu"), x = setup([{ id, availableFrom: { month: 0 }, tags: ["captain-chance:1"] }]);
  const op = operation(x), rng = { ...x.s.warRng! }; op.force.units = [{ model: modelId("shellsoc-ls3"), count: 1, readiness: 1 }];
  onOperationSuccess(x.s, x.ctx, op); assert.deepEqual(x.s.warRng, rng);
  op.force.units = [{ model: modelId("union-at12"), count: 1, readiness: 1 }]; onOperationSuccess(x.s, x.ctx, op);
  assert.equal(op.force.units.find(u => u.model === id)?.count, 1); assert.equal(op.contributions![league]!.find(u => u.model === id)?.count, 1);
  onOperationSuccess(x.s, x.ctx, op); assert.equal(op.force.units.find(u => u.model === id)?.count, 1);
  assert(x.s.log.some(e => e.type === "CaptainCreated" && e.payload.count === 1));
});
test("trade 連續六潮月到期才 licensed 流出，非月初也生效", () => {
  const id = modelId("union-fr7"), x = setup([{ id, exportPolicy: "licensed" }]); day(x, 5);
  const r = relation(x.s, league, tide)!; r.state = "neutral"; assert(signTreaty(x.s, x.ctx, league, tide, "treaty/trade"));
  day(x, 172); treatiesDaily(x.s, x.ctx); assert.equal(x.s.models![id]!.genericSince, undefined);
  day(x, 173); treatiesDaily(x.s, x.ctx); assert.equal(x.s.models![id]!.genericSince, 173);
});
test("shell-pact 雙方開血統，到期 licensed 流出且非自持血統停研", () => {
  const id = modelId("union-fr7"), x = setup([{ id, exportPolicy: "licensed" }]);
  const r = relation(x.s, league, tide)!; r.state = "friendly";
  assert(signTreaty(x.s, x.ctx, league, tide, "treaty/shell-pact"));
  assert(x.s.factions[tide]!.rnd!.lineages.includes(lineageId("xingtian"))); assert(x.s.factions[league]!.rnd!.lineages.includes(lineageId("tide-robe")));
  day(x, 56); treatiesDaily(x.s, x.ctx); assert.equal(x.s.models![id]!.genericSince, 56); assert(x.s.factions[tide]!.rnd!.stalled.includes(lineageId("xingtian")));
});
test("毀約不產生條約流出", () => {
  const id = modelId("union-fr7"), x = setup([{ id, exportPolicy: "licensed" }]), r = relation(x.s, league, tide)!;
  r.treaties.push({ def: world.require("treaty", "treaty/trade").id, signedDay: 0, endDay: 168, broken: { day: 10, by: tide } });
  day(x, 168); treatiesDaily(x.s, x.ctx); assert.equal(x.s.models![id]!.genericSince, undefined);
});
test("成功襲擾maker工坊才擲技術流出，使用warRng並驅動宿怨", () => {
  const node = world.require("node", "node/dhaka").id;
  let leaked = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const x = setup([], tables => tables.node![node]!.tags.push("workshop")), op = operation(x);
    op.actor = tide; op.target.faction = league; op.def = world.require("operation", "operation/raid").id;
    op.force.units = []; x.s.warRng = createRng(seed); const rng = { ...x.s.rng };
    onOperationSuccess(x.s, x.ctx, op); assert.deepEqual(x.s.rng, rng);
    leaked += x.s.log.filter(e => e.type === "TechLeaked").length;
    if (x.s.log.some(e => e.type === "TechLeaked")) assert(relation(x.s, league, tide)!.grievances.some(g => g.kind === "tech-leak"));
  }
  assert(leaked > 0);
  const x = setup(), op = operation(x); op.actor = tide; op.target.faction = league; op.def = world.require("operation", "operation/raid").id; op.force.units = [];
  const war = { ...x.s.warRng! }; onOperationSuccess(x.s, x.ctx, op); assert.deepEqual(x.s.warRng, war);
});
test("內容檢查市場 filter 引用：壞引用紅、真內容綠", () => {
  const market = structuredClone(world.require("market", "market/war-armory"));
  market.lists = [{ kind: "frame", items: [], filters: [{ filter: { lineage: "lineage/missing", tierMax: "C" }, weight: 1, stockMax: 1 }] }];
  const w = createWorldDB(world.packs, { market: { [market.id]: market } });
  assert(checkWorld(db, w).errors.some(e => e.includes("filter.lineage")));
  assert.equal(checkWorld(db, world).errors.length, 0);
});
test("初始化研發不消耗任一rng", () => {
  const x = setup(), rng = { ...x.s.rng }, war = { ...x.s.warRng! };
  initRnd(x.s, x.ctx, Object.keys(x.s.factions).filter(id => !!x.s.factions[id]!.rnd));
  assert.deepEqual(x.s.rng, rng); assert.deepEqual(x.s.warRng, war);
});
