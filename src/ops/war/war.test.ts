import { ensureCore } from "../world/patches.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../core/rng.ts";
import { loadWorldDirs } from "../content/load.ts";
import { newCampaign, createOpsCtx } from "../content/start.ts";
import { createWorldDB } from "../content/worlddb.ts";
import type { WorldTables } from "../content/worlddb.ts";
import { clock } from "../state/clock.ts";
import { checkWorld } from "../content/check.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { engageFactors, resolveEngage } from "./resolve.ts";
import { strength, modelPower, forcesDaily } from "./forces.ts";
import { activeOperation, startOperation, operationsDaily2c, operationAllowed, operationTargets } from "./operations.ts";
import { findPath, gridOf } from "../world/grid.ts";
import { requirePlace, worldRules } from "../world/places.ts";
import { placeLoc, placeAt, marchPath, marchStep } from "./loc.ts";
import { nextRelationState, relation, relationKey, changeRelation, flushRelations2, declareWar } from "./relations.ts";
import { signTreaty, treatiesDaily, breakTreaty } from "./treaties.ts";
import { drive, allianceWeight } from "./drivers.ts";
import { initWar } from "./state.ts";
import { warActionsDaily2d } from "./index.ts";
import { factionModelPool } from "./rnd.ts";
import type { OperationState, Relation, RelState } from "./types.ts";
const loaded = loadWorldDirs(["content/base"]), { db, world } = loaded;
const league = world.require("faction-ops", "faction-ops/residual-league").id, tide = world.require("faction-ops", "faction-ops/tide-faith").id;
function setup() { const s = newCampaign(db, world, "start/default", 1); return { s, ctx: createOpsCtx(s, db, world) }; }
function date(s: ReturnType<typeof setup>["s"], day: number) { s.clock = clock(day, world.require("calendar", s.calendar)); }
function rel(value: number, state: RelState): Relation { return { a: "a", b: "b", value, state, baseline: 0, treaties: [], grievances: [], weariness: 0, since: 0 }; }
function op(r = 1): OperationState { return { id: "op", def: "operation/seize", actor: league, coActors: [], target: { loc: { map: "map/longland", region: "", cell: { x: 0, y: 0 } } },
  phase: "engage", startDay: 0, phaseEnd: 9, force: { units: [{ model: "model/test", count: 100, readiness: 1 }], supply: 100, morale: 0, speed: 1, pos: { map: "map/longland", region: "", cell: { x: 0, y: 0 } } },
  enemyStr: 100 / r, progress: 0, engagesLeft: 10, mercSlots: [], exposed: true, log: [], power: { "model/test": 1 }, initialStr: 100 }; }
for (const r of [.3, 1, 3]) for (const m of [.7, 1, 1.3]) test(`抽象公式 r=${r} m=${m}`, () => {
  const f = engageFactors(r, m);
  assert.equal(f.progress, Math.max(.05, Math.min(.6, .25 * Math.sqrt(r) * m)));
  assert.equal(f.loss, Math.max(.03, Math.min(.25, .12 / r)));
  assert.equal(f.enemyLoss, Math.max(.05, Math.min(.4, .2 * r)));
});
test("抽象結算不改作戰或 RNG 輸入", () => { const a = op(), rng = createRng(3), before = structuredClone({ a, rng }); const out = resolveEngage(a, rng); assert.deepEqual({ a, rng }, before); assert.equal(out.force.supply, 90); assert.equal(out.force.units[0]!.count, 88); assert.equal(out.force.units[0]!.readiness, .88); assert.equal(out.enemyStr, 80); });
for (const [label, mutate, expected] of [
  ["成功", (o: OperationState) => { o.progress = .99; }, "resolve"],
  ["零補給", (o: OperationState) => { o.force.supply = 10; }, "aborted"],
  ["低戰力", (o: OperationState) => { o.initialStr = 1000; }, "failed"],
  ["潰散", (o: OperationState) => { o.force.morale = -2; }, "failed"],
  ["耗盡交手天數", (o: OperationState) => { o.engagesLeft = 1; }, "failed"],
] as const) test(`終止：${label}`, () => { const o = op(); mutate(o); assert.equal(resolveEngage(o, createRng(2)).phase, expected); });
for (const [value, from, alliance, cb, expected] of [
  [-25,"hostile",false,false,"hostile"],[-25,"tense",false,false,"tense"],[-15,"neutral",false,false,"neutral"],[-15,"friendly",false,false,"tense"],
  [5,"friendly",false,false,"friendly"],[5,"neutral",false,false,"neutral"],[45,"friendly",false,false,"friendly"],[45,"friendly",true,false,"allied"],
  [-70,"hostile",false,false,"hostile"],[-70,"hostile",false,true,"war"],[90,"war",true,false,"war"],
] as const) test(`滯後 ${from}/${value}/${alliance}/${cb}`, () => assert.equal(nextRelationState(rel(value,from),alliance,false,cb),expected));
test("停火才可離開 war", () => assert.equal(nextRelationState(rel(-50,"war"),false,true),"hostile"));
test("每對人類勢力無自對、玩家與裂獸排除", () => { const {s}=setup(); assert.equal(Object.keys(s.relations!).length,28); assert(Object.values(s.relations!).every(r=>r.a<r.b&&!`${r.a}|${r.b}`.includes("migrant")&&!`${r.a}|${r.b}`.includes("insects"))); });
test("獨立 seed 決定性、initWar 不消耗原 RNG", () => { const {s,ctx}=setup(), before={...s.rng}, war={...s.warRng!}; initWar(s,ctx,1); assert.deepEqual(s.rng,before); assert.deepEqual(s.warRng,war); });
test("沒有 war 內容時 initWar 不加欄位", () => { const {s}=setup(); delete s.operations;delete s.relations;delete s.warRng;delete s.models;delete s.shells; const w=createWorldDB(world.packs,{});const before=structuredClone(s);initWar(s,createOpsCtx(s,db,w),9);assert.deepEqual(s,before); });
test("march 逐日按路程抵達且 map 不變", () => { const {s,ctx}=setup();const f=structuredClone(s.factions[league]!.forces!);const dest=placeLoc(s, ctx,"place/chittagong"); f.path=marchPath(s,ctx,f.pos,dest);const map=f.pos.map, expected=findPath(gridOf(ctx.world,map),f.pos.cell,dest.cell,{layer:"ground",mp:worldRules(ctx).grid.groundMp*f.speed})!.days;assert(f.path?.length);let days=0;while(f.path!.length){marchStep(s,ctx,f);assert.equal(f.pos.map,map);assert(++days<10);}assert.equal(days,expected);assert.equal(placeAt(s, ctx, f.pos),placeAt(s, ctx, dest)); });
test("跨圖路徑拒絕", () => { const {s,ctx}=setup();const a=placeLoc(s, ctx,"place/dhaka"); assert.equal(marchPath(s,ctx,a,{...a,map:"map/lunar"}),undefined); });
function warSetup() { const x=setup(); const r=relation(x.s,league,tide)!;r.state="war";r.value=-70;const def=world.require("operation","operation/seize"),target=operationTargets(x.s,x.ctx,league,def)[0]!;assert(target);return {...x,def,target}; }
for (const reason of ["supply","strength","count","relation"] as const) test(`發起門檻 ${reason}`,()=>{const {s,ctx,def,target}=warSetup();const f=s.factions[league]!;assert(operationAllowed(s,ctx,league,def,target));if(reason==="supply")f.forces!.supply=39;if(reason==="strength")f.forces!.units=[];if(reason==="count")f.ops=["a","b"];if(reason==="relation")relation(s,league,tide)!.state="tense";assert(!operationAllowed(s,ctx,league,def,target));});
test("階段 muster→march→engage→resolve→aftermath→done 與奪點",()=>{const {s,ctx,target}=warSetup();const o=startOperation(s,ctx,league,"operation/seize",target)!;assert(o);const seen=new Set([o.phase]);for(let day=1;day<30;day++){date(s,day);operationsDaily2c(s,ctx);seen.add(s.operations![o.id]!.phase);}for(const p of ["muster","engage","resolve","aftermath","done"])assert(seen.has(p as typeof o.phase));assert(s.log.some(e=>e.type==="OperationPhase"&&e.payload.phase==="march"));assert(s.log.some(e=>e.type==="PlaceTransferred"));assert(s.factions[league]!.territoryNow.includes(placeAt(s, ctx, target.loc)!));assert(!s.factions[tide]!.territoryNow.includes(placeAt(s, ctx, target.loc)!));assert.equal(s.factions[league]!.ops!.length,0);});
test("失敗回收部隊且只結算一次",()=>{const {s,ctx,target}=warSetup();const o=startOperation(s,ctx,league,"operation/seize",target)!;o.phase="engage";o.force.morale=-2;date(s,1);operationsDaily2c(s,ctx);date(s,2);operationsDaily2c(s,ctx);assert.equal(s.operations![o.id]!.phase,"failed");assert.equal(s.log.filter(e=>e.type==="OperationFailed").length,1);assert.equal(s.factions[league]!.ops!.length,0);});
test("超過45天退兵",()=>{const {s,ctx,target}=warSetup();const o=startOperation(s,ctx,league,"operation/seize",target)!;date(s,45);operationsDaily2c(s,ctx);assert.equal(o.phase,"aborted");});
test("圍堵限大潮前5天且大潮交手",()=>{const {s,ctx}=setup();const node=requirePlace(s,ctx,"place/ridge").id;s.rifts.r={id:"r",site:node,at:placeLoc(s,ctx,node),width:"D",family:"base:rift/insect",phase:"anchored",openedDay:0,anchorAge:0,patches:[],fedCount:0,nextCheck:100};ensureCore(s,ctx,s.rifts.r!);const def=world.require("operation","operation/contain"),target={loc:placeLoc(s, ctx,node),rift:"r"};date(s,2);assert(!operationAllowed(s,ctx,league,def,target));date(s,10);const o=startOperation(s,ctx,league,def.id,target)!;assert(o);for(let d=11;d<=14;d++){date(s,d);operationsDaily2c(s,ctx);}assert.equal(s.log.find(e=>e.type==="OperationEngaged")?.day,14);});
test("攻堅成功寫 unanchored 與 RiftPhase",()=>{const {s,ctx}=setup();const node=requirePlace(s,ctx,"place/ridge").id;s.rifts.r={id:"r",site:node,at:placeLoc(s,ctx,node),width:"D",family:"base:rift/insect",phase:"anchored",openedDay:0,anchorAge:0,patches:[],fedCount:0,nextCheck:100};const o=startOperation(s,ctx,league,"operation/assault",{loc:placeLoc(s, ctx,node),rift:"r"})!;o.phase="resolve";o.phaseEnd=0;operationsDaily2c(s,ctx);assert.equal(s.rifts.r.phase,"unanchored");assert(s.log.some(e=>e.type==="RiftPhase"));});
test("尋殼改 holder 與勢力殼索引",()=>{const {s,ctx}=setup();const o=startOperation(s,ctx,league,"operation/relic-hunt")!;assert(o);o.phase="resolve";o.phaseEnd=0;operationsDaily2c(s,ctx);assert.equal(s.shells![o.target.shell!]!.holder,league);assert(s.factions[league]!.shells!.includes(o.target.shell!));});
test("條約簽約、到期與守信",()=>{const {s,ctx}=warSetup();assert(signTreaty(s,ctx,league,tide,"treaty/ceasefire"));flushRelations2(s,ctx);assert.notEqual(relation(s,league,tide)!.state,"war");date(s,56);treatiesDaily(s,ctx);assert(s.log.some(e=>e.type==="TreatyExpired"));assert.equal(relation(s,league,tide)!.treaties.length,0);});
test("breakIf 成立會毀約",()=>{const {s,ctx}=setup();const r=relation(s,league,tide)!;r.state="neutral";r.value=0;const tables:WorldTables={};for(const kind of ["treaty","calendar","affinity","faction-ops","place","model","forces"] as const)(tables as Record<string,unknown>)[kind]=Object.fromEntries(world.all(kind).map(d=>[d.id,structuredClone(d)]));tables.treaty![world.require("treaty","treaty/nonaggression").id]!.breakIf={all:[]};const w=createWorldDB(world.packs,tables),c=createOpsCtx(s,db,w);assert(signTreaty(s,c,league,tide,"treaty/nonaggression"));treatiesDaily(s,c);assert(r.treaties[0]!.broken);assert(s.log.some(e=>e.type==="TreatyBroken"));});
test("宣戰需要低關係且停火擋宣戰",()=>{const {s,ctx}=setup();const r=relation(s,league,tide)!;r.value=0;assert(!declareWar(s,ctx,league,tide));r.value=-70;assert(declareWar(s,ctx,league,tide));flushRelations2(s,ctx);assert.equal(r.state,"war");assert(signTreaty(s,ctx,league,tide,"treaty/ceasefire"));assert(!declareWar(s,ctx,league,tide));});
for(const kind of ["drift","grievance-decay","border-blight","shared-threat","op-success-against","op-relief","same-target","shell-envy","tech-leak","treaty-honored","treaty-broken","war-weariness","alliance-burden","pressure-truce"])test(`外交驅動 ${kind}`,()=>{
 const {s,ctx}=setup(),r=relation(s,league,tide)!;r.value=-30;r.baseline=0;r.state="tense";r.grievances=[{day:0,kind:"test",w:4}];
 if(["war-weariness","pressure-truce"].includes(kind))r.state="war";
 if(kind==="alliance-burden")for(const other of Object.values(s.relations!).filter(x=>x.a===league||x.b===league).slice(0,3))other.state="allied";
 const before=structuredClone(r);drive(s,ctx,kind,league,tide);
 const expected:Record<string,number>={drift:-28,"border-blight":-34,"shared-threat":-28,"op-success-against":-50,"op-relief":-16,"same-target":-35,"shell-envy":-34.5,"tech-leak":-42,"treaty-honored":-24,"treaty-broken":-60,"alliance-burden":-31};
 if(kind==="grievance-decay")assert.equal(r.grievances[0]!.w,2);
 else if(kind==="war-weariness")assert.equal(r.weariness,before.weariness+1);
 else if(kind==="pressure-truce")assert.equal(r.weariness,before.weariness+5);
 else assert.equal(r.value,expected[kind]);
});
test("三盟後簽盟權重下降",()=>{const {s,ctx}=setup();for(const r of Object.values(s.relations!).filter(r=>r.a===league||r.b===league).slice(0,3))r.state="allied";assert.equal(allianceWeight(s,ctx,league,tide),.2);});
test("relation API 不立即發 RelationChanged",()=>{const {s,ctx}=setup();changeRelation(s,ctx,league,tide,100,"test");assert(!s.log.some(e=>e.type==="RelationChanged"));flushRelations2(s,{...ctx,emit:(t,p)=>ctx.emit(t,{...p,stage:2})});assert(s.log.filter(e=>e.type==="RelationChanged").every(e=>e.payload.stage===2));});
test("war 抽牌不消耗原 RNG、同日不重抽",()=>{const {s,ctx}=setup(),rng={...s.rng};warActionsDaily2d(s,ctx);const war={...s.warRng!};warActionsDaily2d(s,ctx);assert.deepEqual(s.rng,rng);assert.deepEqual(s.warRng,war);});
test("機型池優先 released；補員只用機型池",()=>{const {s,ctx}=setup();const model=world.require("model","model/bulwark-i").id;s.factions[league]!.rnd={points:0,released:[model],lineages:[],stalled:[]};assert.deepEqual(factionModelPool(s,ctx,league),[model]);s.factions[league]!.forces!.units=[];date(s,28);forcesDaily(s,ctx);assert.deepEqual(s.factions[league]!.forces!.units.map(u=>[u.model,u.count]),[[model,15]]);});
test("內容檢查拒絕非機械 frame、循環依賴與死 holder",()=>{const models=structuredClone(world.all("model"));models[0]!.frame="base:frame/ancient-rearguard";models[0]!.requires=[models[0]!.id];const lineages=structuredClone(world.all("lineage"));lineages[0]!.source="base:frame/ancient-rearguard";lineages[0]!.holder="faction/missing";const w=createWorldDB(world.packs,{model:Object.fromEntries(models.map(m=>[m.id,m])),lineage:Object.fromEntries(lineages.map(l=>[l.id,l]))});const errors=checkWorld(db,w).errors;assert(errors.some(e=>e.includes("must be mechanical")));assert(errors.some(e=>e.includes("cycle")));assert(errors.some(e=>e.includes("must be live faction")));assert.equal(checkWorld(db,world).errors.length,0);});
