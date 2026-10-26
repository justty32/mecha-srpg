import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const imp=p=>import(pathToFileURL(`${root}/${p}`).href);
const {loadContentDirs}=await imp('src/content/loader.ts');
const {runBattle}=await imp('src/sim/run.ts');
const {createBattle}=await imp('src/rules/flow.ts');
const {startBattle,beginTurn}=await imp('src/rules/turn.ts');
const {tryCommand,abilitiesOf}=await imp('src/rules/command.ts');
const {applyEffect}=await imp('src/rules/effects.ts');
const {unitAttr}=await imp('src/rules/contribs.ts');
const {layerDefs,rt}=await imp('src/rules/state.ts');
const {changePool}=await imp('src/rules/pools.ts');
const {db,errors}=loadContentDirs([`${root}/content/base`]);
assert.equal(errors.length,0,JSON.stringify(errors));
const items=JSON.parse(fs.readFileSync('/tmp/cx-fg-ga-01/items.json')).filter(x=>x.id.startsWith('component/'));
const reportDir='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-01';
function friendly(item,i=0){
 const frame=db.require('frame',item.frame), body=db.require('bodyplan',frame.bodyPlan);
 const c=db.require('component',item.id);
 const slot=body.parts.flatMap(p=>p.slots).find(s=>s.type===c.slot && s.size>=c.size);
 assert.ok(slot,'compatible slot');
 const seat=body.parts.flatMap(p=>p.seats??[]).find(s=>s.accepts.includes('pilot'));
 return {id:`ally-${i}`,owner:'A',pos:{x:2,y:i*2+1},frame:frame.id,core:true,
 components:{...frame.defaultLoadout,[slot.id]:c.id},persons:[{id:`pilot-${i}`,def:'person/chen-xiaohai',seat:seat.id}]};
}
function enemy(i=0){const m=db.require('monster','monster/reaper-c'); return {id:`enemy-${i}`,owner:'B',pos:{x:3,y:i*2+1},monster:{species:m.species,grade:m.grade,def:m.id}};}
function setup(units){return {id:'scratch-fg-ga-01',map:{width:8,height:22,fill:'terrain/plain',exits:[]},units,objectives:[],maxRounds:8,noRetreat:true};}
const output={scenario:'scratch-fg-ga-01 (worktree content; no formal scenario edits)',seed:[1,2,3,4,5],installed:[],abilityUses:[],aiUsed:{},exceptions:[],mechanismMismatches:[],observed:[],log:[],runs:[]};
// Independently validate each installation against the same frame without its previous armor.
for(const [i,item] of items.entries()){
 const init=friendly(item,i), frame=db.require('frame',item.frame), comp=db.require('component',item.id);
 const s=createBattle(db,setup([init,enemy(i)]),1),ctx={db,s};
 const installed=Object.entries(s.units[init.id].parts).flatMap(([part,p])=>Object.entries(p.components).map(([slot,id])=>({part,slot,id}))).find(x=>x.id===comp.id);
 assert.ok(installed); assert.equal(s.units[init.id].core,true); assert.equal(s.units[init.id].controlMode,'pilot');
 assert.ok(abilitiesOf(ctx,init.id).some(id=>db.require('ability',id).packets.length>0),'retain a weapon');
 const baseline=structuredClone(init); delete baseline.components[installed.slot];
 const baseS=createBattle(db,setup([baseline,enemy(i)]),1),baseCtx={db,s:baseS};
 const layers=[];
 for(const add of comp.layersAdd??[]){
  assert.ok(s.units[init.id].parts[add.part]);
  assert.deepEqual(layerDefs(ctx,init.id,add.part)[add.insertAt],add.layer);
  assert.equal(s.units[init.id].parts[add.part].layers[add.insertAt].hp,add.layer.hp);
  layers.push({part:add.part,index:add.insertAt,layer:layerDefs(ctx,init.id,add.part)[add.insertAt]});
 }
 // All unaffected parts retain their layer definitions, excluding the component's own physical layer.
 for(const part of db.require('bodyplan',frame.bodyPlan).parts){
  if((comp.layersAdd??[]).some(a=>a.part===part.id))continue;
  const real=layerDefs(ctx,init.id,part.id).filter(l=>l.type!=='component'),base=layerDefs(baseCtx,init.id,part.id).filter(l=>l.type!=='component');
  assert.deepEqual(real.slice(0,base.length),base);
 }
 const attrs=[];
 for(const mod of comp.attrMods??[]){const attr=mod.path.split('.').at(-1);const before=unitAttr(baseCtx,init.id,attr),after=unitAttr(ctx,init.id,attr);if(after-before!==mod.value)output.mechanismMismatches.push({component:item.id,path:mod.path,expectedDelta:mod.value,actualDelta:after-before}); attrs.push({attr,before,after,expectedDelta:mod.value});}
 const pools=[];
 for(const mod of comp.poolMods??[]){for(const key of ['max','regen'])if(mod[key]!==undefined){const before=baseS.units[init.id].pools[mod.pool][key],after=s.units[init.id].pools[mod.pool][key];if(after-before!==mod[key])output.mechanismMismatches.push({component:item.id,pool:mod.pool,key,expectedDelta:mod[key],actualDelta:after-before});pools.push({pool:mod.pool,key,before,after,expectedDelta:mod[key]});}}
 output.installed.push({component:item.id,frame:item.frame,bodyPlan:frame.bodyPlan,unit:init.id,slot:installed.slot,mountedPart:installed.part,core:true,pilot:'person/chen-xiaohai',weapons:Object.values(init.components).filter(id=>db.require('component',id).slot==='weaponMount'),layers,attrs,pools});
}
for(let seed=1;seed<=5;seed++){
 const group=items.slice((seed-1)*2,seed*2);
 const units=group.flatMap((item,i)=>[friendly(item,i),enemy(i)]);
 const sim={scenario:null,setup:setup(units),slotProfiles:{A:{policy:'tactical',params:{}},B:{policy:'tactical',params:{}}},unitPolicies:{A:{},B:{}}};
 sim.setup.map.height=6; sim.setup.map.width=6; sim.setup.maxRounds=4;
 const result=runBattle({db,sim,seed});
 const used=result.state.log.events.filter(e=>e.type==='AbilityUsed'&&String(e.payload.ability).includes('/fa-'));
 for(const e of used) output.aiUsed[e.payload.ability]=(output.aiUsed[e.payload.ability]??0)+1;
 const logFile=`run-seed-${seed}.json`;
 fs.writeFileSync(`${reportDir}/${logFile}`,JSON.stringify({seed,sim,commands:result.commands,events:result.state.log.events},null,2));
 output.runs.push({scenario:'scratch-fg-ga-01',seed,installed:group.map(x=>x.id),abilityUses:used,aiUsed:used.map(e=>e.payload.ability),exceptions:[],observed:{stopped:result.stopped,rounds:result.state.round,rejected:result.rejected,winner:result.result?.winner??null,hash:result.hash},log:logFile});
}
// Explicit manual commands validate actual cleanse effects, including preservation of unrelated restraints.
for(const [component,ability,buff,removed,retained,attr,delta] of [
 ['fa-heel-lock','fa-regain-footing','fa-footed','m2-dragged','mx-netted','initiative',12],
 ['fa-slip-clasp','fa-shed-bonds','fa-loosened','mx-netted','kx-breakwater-clinger-snared','evasion',20]
]){
 const item=items.find(x=>x.id===`component/${component}`),init=friendly(item),s=createBattle(db,setup([init,enemy()]),1),ctx={db,s};
 startBattle(ctx);
 while(rt(s).active!==init.id) assert.ok(tryCommand(ctx,{kind:'end',actor:rt(s).active}).ok);
 const bare=unitAttr(ctx,init.id,attr);
 applyEffect(ctx,`effect/${removed}`,{unit:init.id},'scratch-fixture');
 applyEffect(ctx,`effect/${retained}`,{unit:init.id},'scratch-fixture');
 const before=unitAttr(ctx,init.id,attr),apBefore=s.persons['pilot-0'].pools.ap.cur;
 const cmd={kind:'useAbility',actor:init.id,ability:`ability/${ability}`};
 const result=tryCommand(ctx,cmd); assert.equal(result.ok,true,JSON.stringify(result));
 const effects=s.units[init.id].effects.map(e=>e.effect);
 assert.ok(!effects.includes(db.require('effect',`effect/${removed}`).id));
 assert.ok(effects.includes(db.require('effect',`effect/${retained}`).id));
 assert.ok(effects.includes(db.require('effect',`effect/${buff}`).id));
 const after=unitAttr(ctx,init.id,attr);assert.equal(after-before,delta);
 assert.equal(apBefore-s.persons['pilot-0'].pools.ap.cur,3);
 assert.equal(s.units[init.id].cooldowns[db.require('ability',cmd.ability).id],3);
 assert.equal(rt(s).reactUsed[`uses:${init.id}:${db.require('ability',cmd.ability).id}`],1);
 const observed={ability:cmd.ability,method:'manual tryCommand',command:cmd,ok:result.ok,bare,attr,before,after,delta:after-before,removed,retained,effects,apSpent:3,cooldown:3,usesSpent:1};
 // At the next owner turn the one-turn buff expires.
 assert.ok(tryCommand(ctx,{kind:'end',actor:init.id}).ok);
 while(rt(s).active!==init.id && !rt(s).outcome)assert.ok(tryCommand(ctx,{kind:'end',actor:rt(s).active}).ok);
 assert.ok(!s.units[init.id].effects.some(e=>e.effect===db.require('effect',`effect/${buff}`).id));
 observed.expiredNextOwnerTurn=true;
 const logFile=`manual-${ability}.json`;fs.writeFileSync(`${reportDir}/${logFile}`,JSON.stringify({observed,events:s.log.events},null,2));
 output.abilityUses.push(observed); output.log.push(logFile);
}
// Repair a damaged light screen through the ordinary owner-turn regeneration path.
{
 const item=items.find(x=>x.id==='component/fa-wick-screen'),init=friendly(item),s=createBattle(db,setup([init,enemy()]),1),ctx={db,s};
 const layer=s.units[init.id].parts.torso.layers[0]; layer.hp=15;
 changePool(ctx,{unit:init.id},'charge',-20,'scratch-damage-fixture');
 const before={hp:layer.hp,charge:s.units[init.id].pools.charge.cur};
 beginTurn(ctx,init.id,false);
 const after={hp:layer.hp,charge:s.units[init.id].pools.charge.cur};
 assert.equal(after.hp,19);assert.equal(after.charge,before.charge+10-4);
 output.observed.push({component:item.id,scenario:'damaged screen owner turn',before,after,chargeRegen:10,layerRegen:4,chargeCost:4});
 fs.writeFileSync(`${reportDir}/screen-regen.json`,JSON.stringify({before,after,events:s.log.events},null,2));output.log.push('screen-regen.json');
}
for(const id of ['ability/fa-regain-footing','ability/fa-shed-bonds']) if(!output.aiUsed[db.require('ability',id).id])output.observed.push({ability:id,aiGap:'AI did not use in seeds 1–5; manual result recorded separately'});
fs.writeFileSync(`${reportDir}/smoke.json`,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({runs:output.runs.map(r=>({seed:r.seed,...r.observed,aiUsed:r.aiUsed})),installed:output.installed.length,manual:output.abilityUses,aiUsed:output.aiUsed,exceptions:output.exceptions,mechanismMismatches:output.mechanismMismatches},null,2));
