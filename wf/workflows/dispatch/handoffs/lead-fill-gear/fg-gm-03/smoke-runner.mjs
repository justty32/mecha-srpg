import fs from 'node:fs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const imp = p => import(pathToFileURL(`${root}/${p}`).href);
const {loadContentDirs} = await imp('src/content/loader.ts');
const {runBattle} = await imp('src/sim/run.ts');
const R = await imp('src/rules/index.ts');
const {db,errors} = loadContentDirs([`${root}/content/base`]);
assert.deepEqual(errors,[]);
const evidence=JSON.parse(fs.readFileSync(new URL('./smoke.json',import.meta.url),'utf8'));
const manifest=JSON.parse(fs.readFileSync(`${root}/content/batches/2026-10/fg-gm-03.json`,'utf8'));
const items=[...evidence.components.map(c=>({id:c.id,'類型':'component','相容範例':c['相容範例']})),...manifest.ids.filter(id=>id.startsWith('ability/')).map(id=>({id,'類型':'ability'}))];
const out='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gm-03';
const observations=[], runs=[], counts={};
let courtReplay;
const attrs=['accuracy','evasion','initiative','perception','resolve','control'];
const rawStats=(s,id)=>({attrs:Object.fromEntries(attrs.map(a=>[a,R.unitAttr({db,s},id,a)])),pools:Object.fromEntries(Object.entries(s.units[id].pools).map(([k,v])=>[k,{max:v.max,regen:v.regen,cur:v.cur}]))});
function spawn(id,frame,owner,pos,components){
 const f=db.require('frame',frame), body=db.require('bodyplan',f.bodyPlan);
 const seat=body.parts.flatMap(p=>p.seats??[]).find(s=>s.accepts.includes('pilot'));
 assert(seat,frame);
 return {id,frame:f.id,owner,pos,persons:[{id:`${id}-pilot`,def:'base:person/ren-kasai',seat:seat.id}],...(components?{components}: {})};
}
for (const item of items.filter(x=>x['類型']==='component')) {
 const c=item['相容範例'];
 const f=db.require('frame',c.frame),body=db.require('bodyplan',f.bodyPlan),comp=db.require('component',item.id);
 assert.equal(body.id,`base:${c.bodyplan}`);
 const part=body.parts.find(p=>p.id===c.part), slot=part?.slots.find(s=>s.id===c.slot);
 assert(slot,item.id); assert.equal(slot.type,comp.slot); assert(slot.size>=comp.size);
 const original=structuredClone(f.defaultLoadout??{});
 const equipped={...original,[c.slot]:comp.id};
 const units=[spawn('probe',f.id,'player',{x:1,y:2},equipped),spawn('ally','frame/bulwark-ii','player',{x:1,y:3}),spawn('foe','frame/bulwark-ii','enemy',{x:5,y:2})];
 const setup={id:`scratch-${item.id}`,map:{width:8,height:6,fill:'base:terrain/plain',exits:[]},factions:{player:'base:faction/migrant-crew',enemy:'base:faction/selene-whitegloves'},units,objectives:[{kind:'eliminate',params:{},for:'player',onComplete:'win'},{kind:'eliminate',params:{},for:'enemy',onComplete:'win'}],maxRounds:12};
 const initial=R.createBattle(db,setup,1);
 const baseSetup=structuredClone(setup);baseSetup.units[0]=spawn('probe',f.id,'player',{x:1,y:2},original);
 const baseline=R.createBattle(db,baseSetup,1);
 for(const p of body.parts) for(const slot of p.slots){
   assert.equal(initial.units.probe.parts[p.id].components[slot.id]??null,db.get('component',equipped[slot.id])?.id??null);
 }
 const wantedPools=new Set(comp.poolMods.map(p=>p.pool));
 for(const ab of comp.abilities){
  const a=db.require('ability',ab);
  for(const cost of [...a.costs,...a.produces])if(cost.owner==='mech')wantedPools.add(cost.pool);
 }
 for(const pool of wantedPools)assert(initial.units.probe.pools[pool],`${item.id}: missing ${pool}`);
 for (const layer of comp.layersAdd??[]) {
  const actual=R.layerDefs({db,s:initial},'probe',layer.part);
  assert(actual.some(x=>x.type===layer.layer.type&&x.hp===layer.layer.hp));
 }
 const record={id:item.id,相容範例:c,方式:'只替換指定槽；其餘沿用既有 defaultLoadout',replaced:original[c.slot]??null,components:equipped,baseline:rawStats(baseline,'probe'),equipped:rawStats(initial,'probe'),layers:(comp.layersAdd??[]).map(l=>({part:l.part,layers:R.layerDefs({db,s:initial},'probe',l.part)}))};
 observations.push(record);
 const sim={scenario:null,setup,slotProfiles:{player:{policy:'tactical',params:{}},enemy:{policy:'tactical',params:{}}},unitPolicies:{player:{},enemy:{}}};
 for(const seed of [1,2,3,4,5]){
  const t=Date.now();
  try{
   const run=runBattle({db,sim,seed,maxSteps:1500});
   const uses={};
   for(const e of run.state.log.events) if(e.type==='AbilityUsed'&&String(e.payload.ability).includes(':ability/fm-')){
     const id=e.payload.ability; uses[id]=(uses[id]??0)+1;counts[id]=(counts[id]??0)+1;
   }
   const effects=run.state.log.events.filter(e=>e.type==='EffectApplied'&&String(e.payload.effect).includes(':effect/fm-'));
   const row={component:item.id,seed,rounds:run.state.round,winner:run.result?.winner??null,reason:run.result?.reason??run.stopped,stopped:run.stopped,rejected:run.rejected,deaths:run.state.log.events.filter(e=>e.type==='UnitDied').length,abilityUses:uses,effects,hash:run.hash,ms:Date.now()-t,error:null};
   assert.equal(run.stopped,'outcome');
   runs.push(row);
   if(!courtReplay&&uses['base:ability/fm-court-align'])courtReplay={sim,seed,commands:run.commands};
   console.log(JSON.stringify({component:item.id,seed,uses,rounds:row.rounds,reason:row.reason,ms:row.ms}));
  }catch(e){runs.push({component:item.id,seed,error:String(e)});console.error(String(e));}
 }
}
fs.writeFileSync('/tmp/cx-fg-gm-03/run-checkpoint.json',JSON.stringify({observations,runs,counts,courtReplay},null,2)+'\n');
assert.equal(runs.length,50);
assert(runs.every(r=>r.error===null),'smoke run failed');
for(const item of items.filter(x=>x['類型']==='ability'))assert(counts[`base:${item.id}`]>0,`AI never used ${item.id}`);
assert(courtReplay,'no court replay');
const replay=R.createBattle(db,courtReplay.sim.setup,courtReplay.seed);R.startBattle({db,s:replay});
let numeric;
for(const cmd of courtReplay.commands){
 const target=cmd.target?.unit;
 const before=target?rawStats(replay,target):null;
 const res=R.tryCommand({db,s:replay},cmd);assert(res.ok,JSON.stringify(res));
 if(cmd.kind==='useAbility'&&cmd.ability==='base:ability/fm-court-align'){
   const after=rawStats(replay,target);
   assert.equal(after.attrs.accuracy-before.attrs.accuracy,6);assert.equal(after.attrs.resolve-before.attrs.resolve,5);
   const applied=replay.units[target].effects.find(e=>e.effect==='base:effect/fm-line-steady');assert(applied);
   const reapply=R.applyEffect({db,s:replay},'base:effect/fm-line-steady',{unit:target},'probe');
   assert.equal(reapply.uid,applied.uid);assert.equal(rawStats(replay,target).attrs.accuracy,after.attrs.accuracy);
   R.tickEffects({db,s:replay},'ownerTurns',{unit:target});R.tickEffects({db,s:replay},'ownerTurns',{unit:target});
   const expired=rawStats(replay,target);assert.equal(expired.attrs.accuracy,before.attrs.accuracy);assert.equal(expired.attrs.resolve,before.attrs.resolve);
   numeric={seed:courtReplay.seed,command:cmd,target,before:before.attrs,after:after.attrs,delta:{accuracy:6,resolve:5},refresh:{sameUid:true,stacked:false},afterTwoOwnerTurns:expired.attrs};break;
 }
}
assert(numeric,'effect numeric evidence missing');
fs.writeFileSync('/tmp/cx-fg-gm-03/smoke-raw.json',JSON.stringify({batch:'fg-gm-03',method:'runBattle，全 tactical AI；8×6平地，指定相容機體與既有配裝換一槽，友軍一機、敵軍一機，最多12回合',seeds:[1,2,3,4,5],components:observations,runs,abilityUses:counts,effectEvidence:numeric},null,2)+'\n');
console.log(JSON.stringify({ok:true,runs:runs.length,abilityUses:counts,effectEvidence:numeric}));
