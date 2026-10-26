import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const fromRoot=async p=>import(pathToFileURL(path.join(root,p)).href);
const {loadContentDirs}=await fromRoot('src/content/loader.ts');
const {runBattle}=await fromRoot('src/sim/run.ts');
const R=await fromRoot('src/rules/index.ts');
const out='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-04';
const manifest=JSON.parse(fs.readFileSync('/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/fg-ga-04.manifest.json','utf8'));
const loaded=loadContentDirs([path.join(root,'content/base')]);
if(loaded.errors.length) throw Error(JSON.stringify(loaded.errors));
const db=loaded.db;
const components=manifest.ids.filter(x=>x.startsWith('component/'));
const abilities=manifest.ids.filter(x=>x.startsWith('ability/')).map(x=>db.require('ability',x).id);
const save=(name,value)=>{fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');return name;};
const short=id=>id.replace(/^base:/,'');
const attrs=(ctx,id)=>Object.fromEntries(['accuracy','evasion','initiative','perception','resolve','control'].map(a=>[a,R.unitAttr(ctx,id,a)]));
const summary=(ctx,id)=>({pos:{...ctx.s.units[id].pos},attrs:attrs(ctx,id),pools:structuredClone(ctx.s.units[id].pools),effects:structuredClone(ctx.s.units[id].effects),hp:Object.fromEntries(Object.entries(ctx.s.units[id].parts).map(([p,v])=>[p,v.layers.map(x=>x.hp)]))});
function frameFor(c){return c==='component/fa-quay-outrigger'?'frame/quito-quay-iv':c==='component/fa-wing-stays'?'frame/selene-iris-g6':'frame/bulwark-ii';}
function init(id,c,pos,withComponent=true){
 const f=db.require('frame',frameFor(c)), bp=db.require('bodyplan',f.bodyPlan), d=db.require('component',c);
 const slot=bp.parts.flatMap(p=>p.slots).find(s=>s.type===d.slot&&s.size>=d.size);
 if(!slot)throw Error('no compatible slot '+c);
 for(const add of d.layersAdd??[])if(!bp.parts.some(p=>p.id===add.part))throw Error('missing target part '+c);
 const loadout={...f.defaultLoadout};delete loadout[slot.id];
 if(withComponent)loadout[slot.id]=c;
 const seat=bp.parts.flatMap(p=>p.seats??[]).find(s=>s.accepts.includes('pilot'));
 if(!seat)throw Error('missing pilot seat '+f.id);
 return {id,owner:'allies',pos,frame:f.id,core:true,components:loadout,persons:[{id:id+'-pilot',def:'person/ren-kasai',seat:seat.id}]};
}
function enemy(id,pos){const m=db.require('monster','monster/reaper-c');return {id,owner:'enemies',pos,monster:{def:m.id,species:m.species,grade:m.grade}};}
const setup=(id,units)=>({id,map:{width:16,height:12,fill:'terrain/plain',exits:[]},units,objectives:[],maxRounds:20});
const installObservations=[], mismatches=[], exceptions=[];
const compare=(caseId,field,actual,expected)=>{if(JSON.stringify(actual)!==JSON.stringify(expected))mismatches.push({case:caseId,field,actual,expected});};
for(const [i,c]of components.entries()){
 const u=init('installed',c,{x:2,y:2});
 const current={db,s:R.createBattle(db,setup('scratch-fg-ga-04-install-'+i,[u,enemy('enemy',{x:4,y:4})]),1)};
 const base={db,s:R.createBattle(db,setup('scratch-fg-ga-04-baseline-'+i,[init('installed',c,{x:2,y:2},false),enemy('enemy',{x:4,y:4})]),1)};
 const d=db.require('component',c),a=summary(current,'installed'),b=summary(base,'installed');
 const expectedAttrs={...b.attrs};
 for(const m of d.attrMods??[]){if(m.op!=='add'||typeof m.value!=='number')throw Error('unsupported scratch expectation');expectedAttrs[m.path.split('.').at(-1)]+=m.value;}
 compare(c,'attrs',a.attrs,expectedAttrs);
 const poolChanges={};
 for(const id of new Set([...Object.keys(a.pools),...Object.keys(b.pools)])){
  const declared=d.pools.filter(p=>p.id===id), mods=(d.poolMods??[]).filter(p=>p.pool===id);
  const expected={max:(b.pools[id]?.max??0)+declared.reduce((s,p)=>s+p.max,0)+mods.reduce((s,p)=>s+(p.max??0),0),regen:(b.pools[id]?.regen??0)+declared.reduce((s,p)=>s+p.regen,0)+mods.reduce((s,p)=>s+(p.regen??0),0),cur:(b.pools[id]?.cur??0)+declared.reduce((s,p)=>s+p.initial,0)};
  const actual={max:a.pools[id].max,regen:a.pools[id].regen,cur:a.pools[id].cur};
  poolChanges[id]={baseline:b.pools[id],actual,expected}; compare(c,'pool.'+id,actual,expected);
 }
 const layers=[];
 for(const p of R.partDefs(current,'installed')){
  const actual=R.layerDefs(current,'installed',p.id).filter(l=>l.type!=='component');
  const expected=R.layerDefs(base,'installed',p.id).filter(l=>l.type!=='component');
  for(const add of d.layersAdd??[])if(add.part===p.id)expected.splice(add.insertAt,0,add.layer);
  compare(c,'layers.'+p.id,actual,expected);
  if((d.layersAdd??[]).some(x=>x.part===p.id))layers.push({part:p.id,actual,states:current.s.units.installed.parts[p.id].layers});
 }
 const installation=Object.entries(current.s.units.installed.parts).flatMap(([part,p])=>Object.entries(p.components).filter(([,v])=>short(v??'')===c).map(([slot,component])=>({part,slot,component})));
 compare(c,'installation count',installation.length,1);
 if(c==='component/fa-ash-ballast'){
  const before=structuredClone(R.poolDecls(current,{unit:'installed'}).find(p=>p.id==='heat').bands);
  R.changePool(current,{unit:'installed'},'heat',100,'scratch-band-check');
  compare(c,'heat bands',before,R.poolDecls(base,{unit:'installed'}).find(p=>p.id==='heat').bands);
  compare(c,'at heat 100 overheat-1',current.s.units.installed.effects.some(e=>short(e.effect)==='effect/overheat-1'),true);
 }
 const extra={};
 if(c==='component/fa-hearth-screen'){
  const layerIndex=R.layerDefs(current,'installed','torso').findIndex(l=>l.type==='shield');
  current.s.units.installed.parts.torso.layers[layerIndex].hp=30;
  const before=summary(current,'installed');R.beginTurn(current,'installed',false);const after=summary(current,'installed');
  compare(c,'regen shield HP',after.hp.torso[layerIndex],33);compare(c,'regen charge spent',after.pools.charge.cur,47);
  extra.regen={before,after,expectedShield:33,expectedCharge:47};
 }
 installObservations.push({component:c,frame:u.frame,bodyPlan:db.require('frame',u.frame).bodyPlan,core:true,installation,baseline:b,actual:a,expectedAttrs,poolChanges,layers,...extra});
 save('install-'+i+'.log.json',current.s.log.events);
}
console.log('installation observations:',installObservations.length,'mismatches:',mismatches.length);
const installed=components.map((c,i)=>({component:c,unit:'gear-'+i,frame:frameFor(c)}));
const aiRuns=[];
for(let seed=1;seed<=5;seed++){
 const scenario='scratch-fg-ga-04-group';
 try{
  const units=components.map((c,i)=>init('gear-'+i,c,{x:2+2*(i%5),y:2+3*Math.floor(i/5)}));
  units.push(...[4,8,12].map((x,i)=>enemy('reaper-'+i,{x,y:8})));
  const sim={scenario:null,setup:setup(scenario,units),slotProfiles:{allies:{policy:'tactical',params:{}},enemies:{policy:'tactical',params:{}}},unitPolicies:{}};
  const r=runBattle({db,sim,seed,maxSteps:5000});
  const abilityUses=Object.fromEntries(abilities.map(a=>[a,r.state.log.events.filter(e=>e.type==='AbilityUsed'&&e.payload?.ability===a).length]));
  const log=save('battle-seed-'+seed+'.log.json',{commands:r.commands,events:r.state.log.events});
  aiRuns.push({scenario,seed,installed,abilityUses,aiUsed:Object.fromEntries(abilities.map(a=>[a,abilityUses[a]>0])),exceptions:[],observed:{stopped:r.stopped,rounds:r.state.round,rejected:r.rejected,winner:r.result?.winner??null,hash:r.hash},log});
  console.log('runBattle',seed,r.stopped,'round',r.state.round,'uses',JSON.stringify(abilityUses));
 }catch(e){const item={scenario,seed,message:String(e),stack:e.stack};exceptions.push(item);aiRuns.push({scenario,seed,installed,abilityUses:{},aiUsed:{},exceptions:[item],observed:{},log:null});console.log('EXCEPTION',JSON.stringify(item));}
}
const manual=[];
function untilActor(ctx,id){for(let n=0;R.currentActor(ctx.s)!==id&&n<50;n++){const actor=R.currentActor(ctx.s);if(!actor)throw Error('no active actor');const r=R.tryCommand(ctx,{kind:'end',actor});if(!r.ok)throw Error(JSON.stringify(r));}if(R.currentActor(ctx.s)!==id)throw Error('actor not reached');}
for(const [c,ability,target,effect]of [
 ['component/fa-swift-sail','ability/fa-catch-wind','caster','effect/fa-windward'],
 ['component/fa-escort-lantern','ability/fa-cover-companion','companion','effect/fa-escorted']]){
 const units=[init('caster',c,{x:2,y:2}),init('companion','component/fa-arm-sling',{x:4,y:2},false),enemy('reaper',{x:3,y:3})];
 const ctx={db,s:R.createBattle(db,setup('scratch-fg-ga-04-'+ability.split('/')[1],units),1)};
 R.startBattle(ctx);untilActor(ctx,'caster');
 const before=summary(ctx,target), casterBefore=summary(ctx,'caster');const pid=R.commanderOf(ctx,'caster'),apBefore=ctx.s.persons[pid].pools.ap.cur;
 const result=R.tryCommand(ctx,{kind:'useAbility',actor:'caster',ability,target:{unit:target}});
 const after=summary(ctx,target),casterAfter=summary(ctx,'caster'),effectDef=db.require('effect',effect);
 compare(ability,'command ok',result.ok,true);compare(ability,'position',after.pos,before.pos);
 const expected={...before.attrs};for(const m of effectDef.contribs)expected[m.path.split('.').at(-1)]+=m.value;
 compare(ability,'effect attrs',after.attrs,expected);compare(ability,'AP spent',apBefore-ctx.s.persons[pid].pools.ap.cur,3);
 compare(ability,'effect present',after.effects.some(e=>e.effect===effectDef.id),true);
 const misses=ctx.s.log.events.filter(e=>e.type==='Miss');compare(ability,'friendly miss count',misses.length,0);
 const observed={before,after,casterBefore,casterAfter,apSpent:apBefore-ctx.s.persons[pid].pools.ap.cur,cooldown:ctx.s.units.caster.cooldowns[db.require('ability',ability).id],effectClock:effectDef.clock,effectHooks:effectDef.hooks,misses};
 if(target==='companion'){
  untilActor(ctx,'reaper');const attacks=R.abilitiesOf(ctx,'reaper').filter(a=>db.require('ability',a).packets.length&&R.checkAbility(ctx,'reaper',a,{unit:'caster'})===null);
  compare(ability,'caster targetable',attacks.length>0,true);
  if(attacks.length){const targetBefore=summary(ctx,'companion');const attack=R.tryCommand(ctx,{kind:'useAbility',actor:'reaper',ability:attacks[0],target:{unit:'caster'}});observed.attackAfterSupport={ability:attacks[0],result:attack,caster:summary(ctx,'caster'),companion:summary(ctx,'companion')};compare(ability,'no damage transfer to companion',summary(ctx,'companion').hp,targetBefore.hp);}
 }
 // 經真正輪轉，逐次觀察 ownerTurns 到期；不直接加減效果時鐘。
 const expiry=[];
 R.tryCommand(ctx,{kind:'end',actor:R.currentActor(ctx.s)});
 for(let i=0;i<effectDef.clock.n;i++){
  untilActor(ctx,target);expiry.push({ownerTurn:i+1,effects:structuredClone(ctx.s.units[target].effects),attrs:attrs(ctx,target)});
  if(i<effectDef.clock.n-1)R.tryCommand(ctx,{kind:'end',actor:target});
 }
 compare(ability,'expired after owner turns',ctx.s.units[target].effects.some(e=>e.effect===effectDef.id),false);
 observed.expiry=expiry;
 const log=save('manual-'+ability.split('/')[1]+'.log.json',ctx.s.log.events);
 manual.push({scenario:'scratch-'+ability.split('/')[1],seed:1,installed:[c],abilityUses:{[ability]:result.ok?1:0},aiUsed:false,exceptions:[],observed,result,log});
 console.log('tryCommand',ability,result.ok);
}
const aiTotals=Object.fromEntries(abilities.map(a=>[a,aiRuns.reduce((s,r)=>s+(r.abilityUses[a]??0),0)]));
const smoke={scenario:'scratch-fg-ga-04',seed:[1,2,3,4,5],installed,abilityUses:aiTotals,aiUsed:Object.fromEntries(abilities.map(a=>[a,aiTotals[a]>0])),exceptions,observed:{installationCount:installObservations.length,knownMismatches:mismatches},log:aiRuns.map(r=>r.log),installation:installObservations,runs:aiRuns,manual,aiGaps:abilities.filter(a=>aiTotals[a]===0),status:exceptions.length||mismatches.length?'FAILED':'PASS'};
save('smoke.json',smoke);
fs.copyFileSync('/tmp/cx-fg-ga-04/smoke.mjs',path.join(out,'smoke-runner.mjs'));
console.log('smoke',smoke.status,'exceptions',exceptions.length,'mismatches',mismatches.length);
