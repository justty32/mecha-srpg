import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
const report='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-02';
const imp=p=>import(pathToFileURL(path.join(root,p)).href);
const {loadContentDirs}=await imp('src/content/loader.ts');
const {runBattle}=await imp('src/sim/run.ts');
const R=await imp('src/rules/index.ts');
const {db,errors}=loadContentDirs([path.join(root,'content/base')]);
assert.equal(errors.length,0);
const ids=['ash-vessel','bridle-spool','cold-return','deep-cup','ember-dynamo','light-reel','quick-turn','quiet-bell','steady-hand','vent-shutter'];
const frame=db.require('frame','frame/bulwark-ii');
const monster=db.require('monster','monster/reaper-c');
const part=db.require('bodyplan',frame.bodyPlan).parts.find(p=>p.slots.some(s=>s.id==='system-1'));
const slot=part.slots.find(s=>s.id==='system-1');
const componentId=n=>'component/fa-'+n;
const mech=(n,i=0)=>({id:n,owner:'ally',frame:frame.id,core:true,pos:{x:2+i%5,y:2+Math.floor(i/5)*3},components:{...frame.defaultLoadout,'system-1':componentId(n)},persons:[{id:n+'-pilot',def:'person/chen-xiaohai',seat:'pilot'}],pools:{heat:60,charge:0}});
const enemy=(i=0)=>({id:'enemy-'+i,owner:'enemy',pos:{x:7+i%5,y:2+Math.floor(i/5)*3},monster:{species:monster.species,grade:monster.grade,def:monster.id}});
const setup=units=>({id:'scratch/fg-ga-02',map:{width:16,height:12,fill:'terrain/plain',exits:[{x:15,y:11}]},units,objectives:[{kind:'eliminate',for:'ally',params:{enemy:'enemy'}},{kind:'eliminate',for:'enemy',params:{enemy:'ally'}}],maxRounds:20});
const save=(name,data)=>fs.writeFileSync(path.join(report,name),JSON.stringify(data,null,2)+'\n');
const snapshot=(ctx,id)=>({attrs:Object.fromEntries(['accuracy','evasion','initiative','perception','resolve','control'].map(a=>[a,R.unitAttr(ctx,id,a)])),pools:structuredClone(ctx.s.units[id].pools),effects:structuredClone(ctx.s.units[id].effects),contribs:structuredClone(ctx.s.units[id].contribs)});
const smoke=JSON.parse(fs.readFileSync(path.join(report,'smoke.json'),'utf8'));
for(const seed of [Number(process.env.FG_SEED)]) {
 console.log('runBattle seed',seed);
 try {
  const units=[mech('light-reel',0),mech('vent-shutter',1),enemy()];
  const sim={scenario:'scratch/fg-ga-02',setup:setup(units),slotProfiles:{ally:{policy:'tactical',params:{}},enemy:{policy:'tactical',params:{}}},unitPolicies:{}};
  const result=runBattle({db,sim,seed,maxSteps:10000});
  const uses=result.state.log.events.filter(e=>e.type==='AbilityUsed'&&String(e.payload.ability).includes('/fa-'));
  for(const aid of ['ability/fa-draw-light','ability/fa-open-vents']) smoke.aiUsed[aid]=(smoke.aiUsed[aid]??0)+uses.filter(e=>e.payload.ability===db.require('ability',aid).id).length;
  smoke.abilityUses.push(...uses.map(e=>({seed,method:'AI',...e})));
  const log='battle-seed-'+seed+'.json';
  save(log,{scenario:smoke.scenario,seed,setup:sim.setup,events:result.state.log.events,commands:result.commands,hash:result.hash});
  smoke.log.push(log);smoke.runs.push({scenario:smoke.scenario,seed,installed:units.filter(u=>u.frame).map(u=>u.components['system-1']),abilityUses:uses.length,exceptions:[],stopped:result.stopped,rejected:result.rejected,rounds:result.state.round,hash:result.hash,result:result.result?{winner:result.result.winner,reason:result.result.reason}:null,log});
  console.log('done',seed,'rounds',result.state.round,'new ability uses',uses.length);
 } catch(e){smoke.exceptions.push({seed,error:String(e),stack:e.stack});}
 save('smoke.json',smoke);
}
// Direct tryCommand probes verify nonzero support and the planned negative conditions independently of AI.
if(process.env.FG_SEED==='5') for(const [n,aid,eid] of [['light-reel','ability/fa-draw-light','effect/fa-light-drawn'],['vent-shutter','ability/fa-open-vents','effect/fa-venting']]) {
 const actor=mech(n);actor.pools={heat:n==='vent-shutter'?40:60,charge:20};
 const friend=mech('quick-turn',1);
 const ctx={db,s:R.createBattle(db,setup([actor,friend,enemy()]),1)};
 R.startBattle(ctx);
 // Wait for the natural actor turn, without editing turn order, attributes, or contributions.
 let step=0;
 while(R.currentActor(ctx.s)!==n && step++<100) {const a=R.currentActor(ctx.s);assert.ok(a);assert.ok(R.tryCommand(ctx,{kind:'end',actor:a}).ok);}
 assert.equal(R.currentActor(ctx.s),n);
 const u=ctx.s.units[n];
 if(n==='light-reel') R.changePool(ctx,{unit:n},'charge',u.pools.charge.max-30-u.pools.charge.cur,'scratch-required-charge');
 else R.changePool(ctx,{unit:n},'heat',40-u.pools.heat.cur,'scratch-required-heat');
 const baseline={db,s:structuredClone(ctx.s)};
 const before=snapshot(ctx,n), apBefore=ctx.s.persons[n+'-pilot'].pools.ap.cur;
 const result=R.tryCommand(ctx,{kind:'useAbility',actor:n,ability:aid});assert.ok(result.ok,JSON.stringify(result));
 assert.ok(ctx.s.units[n].effects.some(e=>e.effect===db.require('effect',eid).id));
 assert.equal(ctx.s.persons[n+'-pilot'].pools.ap.cur,apBefore-3);
 const active=snapshot(ctx,n),observations=[];
 for(let tick=1;tick<=2;tick++) {
  // beginTurn is the actual owner-turn update; a matching clone supplies a no-effect control.
  R.beginTurn(ctx,n,false);R.beginTurn(baseline,n,false);
  observations.push({tick,actual:snapshot(ctx,n),control:snapshot(baseline,n)});
 }
 const first=observations[0], second=observations[1];
 if(n==='light-reel') {
  assert.equal(active.pools.charge.regen-before.pools.charge.regen,10);
  assert.equal(active.pools.heat.regen-before.pools.heat.regen,5);
  assert.equal(first.actual.pools.charge.cur-first.control.pools.charge.cur,10);
  assert.equal(first.actual.pools.heat.cur-first.control.pools.heat.cur,5);
 } else {
  assert.equal(active.pools.heat.regen-before.pools.heat.regen,-10);
  assert.equal(active.attrs.accuracy-before.attrs.accuracy,-5);
  assert.equal(first.actual.pools.heat.cur-first.control.pools.heat.cur,-10);
 }
 assert.equal(second.actual.effects.some(e=>e.effect===db.require('effect',eid).id),false);
 assert.equal(second.actual.pools.heat.regen,before.pools.heat.regen);
 assert.equal(second.actual.attrs.accuracy,before.attrs.accuracy);
 const negative={db,s:structuredClone(baseline.s)};
 negative.s.units[n].cooldowns={};
 if(n==='light-reel') R.changePool(negative,{unit:n},'charge',negative.s.units[n].pools.charge.max-negative.s.units[n].pools.charge.cur,'scratch-full-charge');
 else R.changePool(negative,{unit:n},'heat',19-negative.s.units[n].pools.heat.cur,'scratch-low-heat');
 const rejected=R.tryCommand(negative,{kind:'useAbility',actor:n,ability:aid});
 assert.equal(rejected.ok,false);assert.equal(rejected.rejection.code,'require-failed');
 smoke.abilityUses.push({method:'manual tryCommand',ability:aid,effective:true,apCost:3});
 smoke.observed.manual.push({ability:aid,before,active,ownerTurnUpdates:observations,negative:rejected,note:'ownerTurns n=2: first next owner turn has modified regen; second expires before regen. This is existing engine clock order.'});
 const log='manual-'+n+'.json';save(log,{events:ctx.s.log.events,baselineEvents:baseline.s.log.events,negativeEvents:negative.s.log.events,result});smoke.log.push(log);
 save('smoke.json',smoke);
}
smoke.aiGaps=Object.entries(smoke.aiUsed).filter(([,n])=>n===0).map(([ability])=>({ability,reason:'No AbilityUsed in runBattle seeds 1–5; manual tryCommand evidence recorded separately.'}));
smoke.status=smoke.failures.length||smoke.exceptions.length?'FAILED':'DONE';
smoke.criteria3={runBattleZeroExceptions:smoke.exceptions.length===0,installedComponents:smoke.installed.length,manualEffectiveAbilities:smoke.observed.manual.length,componentModifiersMatch:smoke.failures.length===0};
save('smoke.json',smoke);console.log(JSON.stringify({status:smoke.status,criteria3:smoke.criteria3,aiUsed:smoke.aiUsed,aiGaps:smoke.aiGaps}));
