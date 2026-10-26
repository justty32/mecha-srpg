import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const imp = p => import(pathToFileURL(path.join(root,p)).href);
const {loadContentDirs} = await imp('src/content/loader.ts');
const {runBattle} = await imp('src/sim/run.ts');
const {createBattle,startBattle,tryCommand,checkAbility,currentActor,unitAttr,layerDefs,abilitiesOf,tickEffects} = await imp('src/rules/index.ts');
const report='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-03';
const {db,errors}=loadContentDirs([path.join(root,'content/base')]);
assert.equal(errors.length,0);
const specs=JSON.parse(fs.readFileSync(new URL('./specs-runtime.json',import.meta.url),'utf8'));
const components=specs.filter(s=>s.id.startsWith('component/'));
const frame=db.require('frame','frame/bulwark-ii');
const body=db.require('bodyplan',frame.bodyPlan);
const slot=body.parts.flatMap(p=>p.slots).find(s=>s.type==='sensorMount');
const attrs=['accuracy','evasion','initiative','perception','resolve','control'];
const mk=(id,owner,pos,component)=>({id,owner,pos,frame:frame.id,core:true,
  persons:[{id:id+'-pilot',def:'person/ren-kasai',seat:'pilot'}],
  components:{...frame.defaultLoadout,...(component?{[slot.id]:component}:{})}});
const reaper=db.require('monster','monster/reaper-c');
const monster=(id,pos)=>({id,owner:'enemy',pos,monster:{species:reaper.species,grade:reaper.grade,def:reaper.id}});
const setup=(id,units,cells=[])=>({id,factions:{ally:'faction/residual-union',enemy:'faction/wild'},
  map:{width:10,height:9,fill:'terrain/plain',exits:[],cells},units,
  objectives:[{kind:'eliminate',for:'ally',params:{enemy:'enemy'}},{kind:'eliminate',for:'enemy',params:{enemy:'ally'}}],maxRounds:5});
const evidence={scenario:'scratch/fg-ga-03',seed:[1,2,3,4,5],installed:[],abilityUses:[],aiUsed:{},exceptions:[],observed:[],log:[],failures:[],runs:[]};
function capture(ctx,id){return {attrs:Object.fromEntries(attrs.map(a=>[a,unitAttr(ctx,id,a)])),pools:structuredClone(ctx.s.units[id].pools),contribs:structuredClone(ctx.s.units[id].contribs),parts:Object.fromEntries(Object.entries(ctx.s.units[id].parts).map(([p,s])=>[p,{components:structuredClone(s.components),layers:layerDefs(ctx,id,p).map((d,i)=>({...d,state:s.layers[i]}))}]))};}

// Actual installed state, before and after the normal startBattle lifecycle.
for(const c of components){
  assert.equal(c.slot,slot.type);assert.ok(c.size<=slot.size);
  const base=createBattle(db,setup('scratch/baseline',[mk('a-caster','ally',{x:2,y:2}),monster('m',{x:6,y:2})]),1);
  const state=createBattle(db,setup('scratch/'+c.id,[mk('a-caster','ally',{x:2,y:2},c.id),monster('m',{x:6,y:2})]),1);
  const ctx={db,s:state},baseCtx={db,s:base};
  const beforeStart=capture(ctx,'a-caster');
  startBattle(baseCtx);startBattle(ctx);
  const baseline=capture(baseCtx,'a-caster'),observed=capture(ctx,'a-caster');
  assert.equal(state.units['a-caster'].parts.head.components[slot.id],db.require('component',c.id).id);
  const checks=[];
  for(const mod of c.attrMods??[]){const attr=mod.path.split('.').at(-1),actual=observed.attrs[attr]-baseline.attrs[attr];
    checks.push({field:mod.path,expectedDelta:mod.value,actualDelta:actual,pass:actual===mod.value});}
  for(const mod of c.poolMods??[])for(const key of ['max','regen'])if(mod[key]!==undefined){const actual=observed.pools[mod.pool][key]-baseline.pools[mod.pool][key];
    checks.push({field:`self.pools.${mod.pool}.${key}`,expectedDelta:mod[key],actualDelta:actual,pass:actual===mod[key]});}
  for(const add of c.layersAdd??[]){const actual=layerDefs(ctx,'a-caster',add.part)[add.insertAt];
    checks.push({field:`layersAdd.${add.part}.${add.insertAt}`,expected:add.layer,actual,pass:JSON.stringify(actual)===JSON.stringify(add.layer)});
    for(const p of body.parts.filter(p=>p.id!==add.part))assert.deepEqual(observed.parts[p.id],baseline.parts[p.id]);}
  for(const ability of c.abilities)assert.ok(abilitiesOf(ctx,'a-caster').includes(db.require('ability',ability).id));
  const entry={component:c.id,frame:frame.id,bodyPlan:body.id,part:'head',slot:slot.id,core:state.units['a-caster'].core,pilot:'person/ren-kasai',weapons:[frame.defaultLoadout['left-weapon'],frame.defaultLoadout['right-weapon']],checks,pass:checks.every(x=>x.pass)};
  evidence.installed.push(entry);evidence.observed.push({component:c.id,baseline,beforeStart,afterStart:observed});
  for(const fail of checks.filter(x=>!x.pass))evidence.failures.push({component:c.id,...fail});
}

// All-AI runs first; no injected contributions, abilities, effects or forced commands.
for(const seed of [1,2,3,4,5]){
  const selected=components.slice((seed-1)*2,seed*2);
  const units=selected.map((c,i)=>mk('ally-'+i,'ally',{x:2,y:2+i*3},c.id));
  units.push(monster('enemy-0',{x:6,y:2}));
  const battleSetup=setup('scratch/fg-ga-03-all-sensors',units);
  const sim={scenario:null,setup:battleSetup,slotProfiles:{ally:{policy:'tactical',params:{maxMoves:1,maxSupportMoves:0}},enemy:{policy:'tactical',params:{maxMoves:1,maxSupportMoves:0}}},unitPolicies:{}};
  try{
    const run=runBattle({db,sim,seed});
    // IDs may be already canonicalized by the loader; compare through require().
    const aids=specs.filter(s=>s.id.startsWith('ability/')).map(s=>db.require('ability',s.id).id);
    const newUses=run.state.log.events.filter(e=>e.type==='AbilityUsed'&&aids.includes(e.payload.ability));
    for(const e of newUses)evidence.abilityUses.push({mode:'ai',seed,...e});
    for(const id of aids)evidence.aiUsed[id]=(evidence.aiUsed[id]??0)+newUses.filter(e=>e.payload.ability===id).length;
    const logName=`runBattle-seed-${seed}.json`;
    fs.writeFileSync(path.join(report,logName),JSON.stringify({scenario:battleSetup,seed,stopped:run.stopped,result:run.result,hash:run.hash,rejected:run.rejected,commands:run.commands,log:run.state.log.events},null,2)+'\n');
    evidence.runs.push({scenario:battleSetup.id,seed,installed:selected.map(c=>c.id),abilityUses:newUses,stopped:run.stopped,rounds:run.state.round,result:run.result?.reason,winner:run.result?.winner,exceptions:[],log:logName});
    evidence.log.push(logName);
    console.log(JSON.stringify({seed,stopped:run.stopped,rounds:run.state.round,abilityUses:newUses.map(e=>e.payload)}));
  }catch(e){evidence.exceptions.push({seed,message:e.stack});}
}

// Explicit command evidence, with fresh states and unchanged RNG for each attempt.
const manual=[];
for(const seed of [1,2,3,4,5])for(const kind of ['lend','dazzle-monster','dazzle-human']){
  const lend=kind==='lend',ability=lend?'ability/fa-lend-bearing':'ability/fa-dazzle-mark';
  const component=lend?'component/fa-shared-bearing':'component/fa-dazzle-shutter';
  const battleSetup=setup('scratch/manual-'+kind,[mk('a-caster','ally',{x:2,y:2},component),mk('z-ally','ally',{x:2,y:5}),monster('m-monster',{x:6,y:2}),mk('z-human','enemy',{x:6,y:4})]);
  const s=createBattle(db,battleSetup,seed),ctx={db,s};startBattle(ctx);assert.equal(currentActor(s),'a-caster');
  const target=lend?'z-ally':kind==='dazzle-monster'?'m-monster':'z-human';
  const wrong=checkAbility(ctx,'a-caster',ability,{unit:lend?'m-monster':'z-ally'});
  assert.equal(wrong?.code,'bad-target');
  const before=capture(ctx,target),apBefore=s.persons['a-caster-pilot'].pools.ap.cur;
  const cmd={kind:'useAbility',actor:'a-caster',ability,target:{unit:target}};
  const result=tryCommand(ctx,cmd);assert.equal(result.ok,true);
  const after=capture(ctx,target),apAfter=s.persons['a-caster-pilot'].pools.ap.cur;
  assert.equal(apBefore-apAfter,3);
  const effect=db.require('effect',lend?'effect/fa-aligned':'effect/fa-dazzled').id;
  const applied=s.units[target].effects.find(e=>e.effect===effect),delta={accuracy:after.attrs.accuracy-before.attrs.accuracy,perception:after.attrs.perception-before.attrs.perception};
  const entry={scenario:battleSetup.id,mode:'manual',seed,cmd,result,before,after,apBefore,apAfter,wrongSide:wrong,applied:!!applied,delta,effective:!!applied&&(delta.accuracy===(lend?8:-8))&&(delta.perception===(lend?3:-3)),remaining:applied?.remaining};
  if(applied){assert.equal(entry.effective,true);assert.equal(applied.remaining,lend?1:2);
    entry.clock=[];for(let n=1;n<=(lend?1:2);n++){tickEffects(ctx,'ownerTurns',{unit:target});entry.clock.push({tick:n,effects:structuredClone(s.units[target].effects),attrs:capture(ctx,target).attrs});}
    assert.equal(s.units[target].effects.some(e=>e.effect===effect),false);assert.deepEqual(capture(ctx,target).attrs,before.attrs);}
  entry.log=structuredClone(s.log.events);manual.push(entry);
  evidence.abilityUses.push({mode:'manual',seed,ability:db.require('ability',ability).id,target,applied:!!applied,effective:entry.effective,delta});
}
// A wall must block the actual command, and reject it before spending AP.
{
  const cells=[{at:{x:4,y:2},terrain:'terrain/ruin-wall'}];
  const s=createBattle(db,setup('scratch/los',[mk('a-caster','ally',{x:2,y:2},'component/fa-dazzle-shutter'),monster('m',{x:6,y:2})],cells),1),ctx={db,s};
  startBattle(ctx);const ap=s.persons['a-caster-pilot'].pools.ap.cur;
  const cmd={kind:'useAbility',actor:'a-caster',ability:'ability/fa-dazzle-mark',target:{unit:'m'}};
  const result=tryCommand(ctx,cmd);assert.equal(result.ok,false);assert.equal(result.rejection.code,'no-los');assert.equal(s.persons['a-caster-pilot'].pools.ap.cur,ap);
  manual.push({scenario:'scratch/los',seed:1,cmd,result,apBefore:ap,apAfter:s.persons['a-caster-pilot'].pools.ap.cur,log:s.log.events});
}
evidence.log.push('manual-commands.json','smoke-runner.mjs','installation-observations.json');
fs.writeFileSync(path.join(report,'manual-commands.json'),JSON.stringify(manual,null,2)+'\n');
fs.writeFileSync(path.join(report,'installation-observations.json'),JSON.stringify(evidence.observed,null,2)+'\n');
evidence.observed={installations:'installation-observations.json',failures:evidence.failures.length,effectiveManual:evidence.abilityUses.filter(u=>u.mode==='manual'&&u.effective).length};
evidence.aiGaps=Object.entries(evidence.aiUsed).filter(([,count])=>count===0).map(([ability])=>ability);
evidence.coverage=specs.filter(s=>s.id.startsWith('ability/')).map(s=>({ability:s.id,effectiveUses:evidence.abilityUses.filter(u=>u.ability===db.require('ability',s.id).id&&u.effective).length,aiUses:evidence.aiUsed[db.require('ability',s.id).id]??0}));
evidence.verdict=evidence.failures.length||evidence.exceptions.length||evidence.coverage.some(c=>c.effectiveUses===0)?'FAILED':'PASS';
fs.writeFileSync(path.join(report,'smoke.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({verdict:evidence.verdict,failures:evidence.failures.length,exceptions:evidence.exceptions,aiUsed:evidence.aiUsed,effectiveManual:evidence.observed.effectiveManual}));
