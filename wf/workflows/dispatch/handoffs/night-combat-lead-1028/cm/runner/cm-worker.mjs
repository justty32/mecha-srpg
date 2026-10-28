import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { getPriority } from 'node:os';
if (!process.argv.includes('--go') || process.env.CM_LEADER_GO !== '1028-until-2225') throw new Error('Explicit CM leader GO required');
if (getPriority() < 19) throw new Error('nice19 required');
const WT='/tmp/night-combat-lead-1028/wt-cm';
const OUT='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028/cm';
const opt=k=>{const i=process.argv.indexOf(k);return i<0?undefined:process.argv[i+1];};
const dir=opt('--dir'), job=opt('--job');
const imp=p=>import(pathToFileURL(path.join(WT,p)).href);
const {loadContentDirs}=await imp('src/content/loader.ts');
const {scenarioToSetup,runBattle}=await imp('src/sim/run.ts');
const R=await imp('src/rules/index.ts');
const {db,errors,warnings}=loadContentDirs([path.join(WT,'content/base')]);
if(errors.length) throw new Error(JSON.stringify(errors));
fs.mkdirSync(dir,{recursive:true});
const write=(name,value)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(value,null,2)+'\n');
const raw=(name,value)=>fs.writeFileSync(path.join(dir,name+'.json.gz'),gzipSync(JSON.stringify(value)+'\n'));
const strip=id=>String(id).replace(/^base:/,'');
const coverage=(events,unit)=>Object.fromEntries([...new Set(events.filter(e=>e.type==='AbilityUsed'&&(!unit||e.payload.unit===unit)).map(e=>strip(e.payload.ability)))].sort().map(a=>[a,events.filter(e=>e.type==='AbilityUsed'&&(!unit||e.payload.unit===unit)&&strip(e.payload.ability)===a).length]));
const demo=db.require('scenario','scenario/night-cm-yard-bells');
const pair=(label,left,right,adjacent=false)=>{
 const map=db.require('map','map/skirmish-20');
 return {id:'scenario/cm-evidence-'+label,map:map.id,slots:{player:{faction:'faction/migrant-crew',units:[{mech:left,persons:[{id:'person/ren-kasai',seat:'pilot'}],at:structuredClone(adjacent?{x:2,y:8}:map.deployZones.player[0])}],ai:'aiprofile/focus-fire'},enemy:{faction:'faction/rift-insects',units:[{mech:right,persons:[{id:'person/ren-kasai',seat:'pilot'}],at:structuredClone(adjacent?{x:3,y:8}:map.deployZones.enemy[0])}],ai:'aiprofile/focus-fire'}},objectives:structuredClone(demo.objectives),rounds:20};
};
if(job==='trial'){
 const group=opt('--group'),seed=Number(opt('--seed')),side=opt('--side')??'original',phase=opt('--phase')??'round-1';
 const sc=group==='smoke'?demo:group==='CM01'?pair('CM01','frame/night-cm-twinwick','frame/longspear-kneeler-v2'):pair('CM02','frame/night-cm-cinderbell','frame/anvil-iv-ram');
 if(side==='reverse'&&group!=='smoke'){const left=sc.slots.player.units[0],right=sc.slots.enemy.units[0];[left.mech,right.mech]=[right.mech,left.mech];}
 const sim=scenarioToSetup(db,sc,seed);
 write('input.json',{group,seed,side,phase,CM02accuracy:db.require('frame','frame/night-cm-cinderbell').baseAttrs.accuracy,scenario:sc,sim,natural:true,interventions:[],warningCount:warnings.length});
 const initial=R.createBattle(db,sim.setup,seed);
 raw('initial',{natural:true,state:initial});
 const run=runBattle({db,sim,seed,maxSteps:10000});
 raw('run',run);raw('events',run.state.log.events);
 const units=Object.fromEntries(Object.keys(run.state.units).map(id=>[id,{frame:run.state.units[id].frame,status:run.state.rt.unitStatus[id],abilities:coverage(run.state.log.events,id),heat:run.state.units[id].pools.heat??null}]));
 const summary={group,seed,side,phase,newSlot:side==='reverse'?'enemy':'player',CM02accuracy:db.require('frame','frame/night-cm-cinderbell').baseAttrs.accuracy,natural:true,initialHeat:Object.fromEntries(Object.entries(initial.units).filter(([,u])=>u.pools.heat).map(([id,u])=>[id,u.pools.heat.cur])),winner:run.result?.winner??null,reason:run.result?.reason??run.stopped,rounds:run.state.round,stopped:run.stopped,hash:run.hash,rejected:run.rejected,deaths:run.state.log.events.filter(e=>e.type==='UnitDied').length,events:run.state.log.events.length,coverage:coverage(run.state.log.events),units,newAbilityAIUses:run.state.log.events.filter(e=>e.type==='AbilityUsed'&&strip(e.payload.ability)==='ability/night-cm-cinderbell').length,fullRaw:'run.json.gz',rawEvents:'events.json.gz'};
 // Minimal final-round diagnostics: replay actual commands without any AI re-evaluation.
 const replay=R.createBattle(db,sim.setup,seed),rc={db,s:replay};R.startBattle(rc);
 const firstLegal={},firstExecuted={},initialInitiative=Object.fromEntries(Object.keys(replay.units).map(id=>[id,R.initiativeOf(rc,id)]));
 for(const [step,cmd] of run.commands.entries()){
  const actor=R.currentActor(replay);
  if(actor&&!firstLegal[actor]){
   outer:for(const aid of R.abilitiesOf(rc,actor)){
    const def=db.require('ability',aid);if(!def.packets.length||def.mode!=='activated')continue;
    for(const target of Object.values(replay.units)){
     if(!R.isActive(rc,target.id)||!R.hostile(rc,actor,target.id))continue;
     const aim=['cone','ball','line','cell'].includes(def.target.kind)?{cell:{...target.pos}}:{unit:target.id};
     if(R.checkAbility(rc,actor,aid,aim)===null){firstLegal[actor]={step,round:replay.round,ability:aid,target:aim,pos:{...replay.units[actor].pos},heat:replay.units[actor].pools.heat?.cur,scope:'rules legality in full state, sampled before actual commands; no counterfactual movement or AI-visibility claim'};break outer;}
    }
   }
  }
  if(cmd.kind==='useAbility'&&db.require('ability',cmd.ability).packets.length&&!firstExecuted[cmd.actor])firstExecuted[cmd.actor]={step,round:replay.round,command:cmd,rejection:R.checkAbility(rc,cmd.actor,cmd.ability,cmd.target)};
  const accepted=R.tryCommand(rc,cmd);if(!accepted.ok)throw new Error('Diagnostic replay rejection '+JSON.stringify({step,cmd,accepted}));
 }
 summary.diagnostics={initialInitiative,firstActor:run.state.log.events.find(e=>e.type==='TurnStart')?.payload.unit,firstLegalOpportunity:firstLegal,firstLegalExecutedAttack:firstExecuted,initialPositions:Object.fromEntries(sim.setup.units.map(u=>[u.id,u.pos])),combat:Object.fromEntries(Object.values(run.state.units).map(u=>{
  const hp=x=>Object.values(x.parts).reduce((n,p)=>n+p.layers.reduce((m,l)=>m+l.hp,0),0);
  const strikes=run.state.log.events.filter(e=>['Hit','Miss'].includes(e.type)&&e.payload.unit===u.id&&e.payload.target!==u.id);
  return [u.id,{initialHP:hp(initial.units[u.id]),finalHP:hp(u),status:run.state.rt.unitStatus[u.id],brokenParts:Object.keys(u.parts).filter(p=>u.parts[p].broken),damagedParts:Object.fromEntries(Object.keys(u.parts).filter(p=>u.parts[p].layers.reduce((n,l)=>n+l.hp,0)<initial.units[u.id].parts[p].layers.reduce((n,l)=>n+l.hp,0)).map(p=>[p,u.parts[p].layers.reduce((n,l)=>n+l.hp,0)])),strikes: strikes.map(e=>({round:e.round,type:e.type,...e.payload})),retreatEvidence:run.state.log.events.filter(e=>['Retreated','MoraleChanged','IntentChanged','IntentDeclared','PartBroken','UnitDied'].includes(e.type)&&(e.payload.unit===u.id||e.payload.slot===u.owner)),retreatCausality:'Retreated event has no decision-reason field; do not infer exact AI branch from final HP alone.'}];
 }))};
 write('summary.json',summary);console.log(JSON.stringify({group,seed,side,phase,winner:summary.winner,newSlot:summary.newSlot,newWins:summary.winner===summary.newSlot,newAbilityAIUses:summary.newAbilityAIUses,rounds:summary.rounds,firstActor:summary.diagnostics.firstActor}));
}else if(job==='fixtures'){
 const fresh=(frame,near=false)=>{
  const sim=scenarioToSetup(db,pair('fixture',frame,'frame/bulwark-ii',near),1);
  const s=R.createBattle(db,sim.setup,1),ctx={db,s};R.startBattle(ctx);
  for(let i=0;i<12&&R.currentActor(s)!=='player-0';i++){
   const actor=R.currentActor(s);if(!actor||!R.tryCommand(ctx,{kind:'end',actor}).ok)throw new Error('fixture actor unavailable');
  }
  if(R.currentActor(s)!=='player-0')throw new Error('fixture cannot obtain player turn');
  return {sim,ctx};
 };
 const base=fresh('frame/night-cm-twinwick');
 const mark=(ctx,id)=>{const p=ctx.s.units['player-0'].parts[id];const defs=R.partDefs(ctx,'player-0').find(x=>x.id===id);p.broken=true;defs.layers.forEach((l,i)=>{if(l.structural){p.layers[i].hp=0;p.layers[i].broken=true;}});};
 const stateClone=()=>({db,s:structuredClone(base.ctx.s)});
 const variants=[];
 for(const names of [[],['gun-mast'],['left-track'],['right-track'],['left-track','right-track']]){
  const ctx=stateClone();for(const n of names)mark(ctx,n);
  variants.push({injectedBrokenParts:names,abilities:R.abilitiesOf(ctx,'player-0').map(strip),locomotion:R.locomotionOf(ctx,'player-0'),state:ctx.s});
 }
 const hasGuns=v=>['ability/mx-radiant-shot','ability/mx-rune-shot'].every(a=>v.abilities.includes(a));
 const partChecks={baselineHasBoth:hasGuns(variants[0]),mastDisablesBoth:!variants[1].abilities.includes('ability/mx-radiant-shot')&&!variants[1].abilities.includes('ability/mx-rune-shot'),mastStillMoves:variants[1].locomotion==='track',leftStillMoves:variants[2].locomotion==='track',rightStillMoves:variants[3].locomotion==='track',bothCannotMove:variants[4].locomotion===null,tracksDoNotRemoveGuns:hasGuns(variants[4])};
 const hot=fresh('frame/night-cm-cinderbell',true),ctx=hot.ctx,actor='player-0',ability=db.require('ability','ability/night-cm-cinderbell').id,target={cell:{...ctx.s.units['enemy-0'].pos}};
 R.changePool(ctx,{unit:actor},'heat',29-ctx.s.units[actor].pools.heat.cur,'fixture-only injected heat29');
 const at29={state:structuredClone(ctx.s),rejection:R.checkAbility(ctx,actor,ability,target)};
 R.changePool(ctx,{unit:actor},'heat',1,'fixture-only injected heat30');
 const at30={state:structuredClone(ctx.s),rejection:R.checkAbility(ctx,actor,ability,target)};
 const before=ctx.s.units[actor].pools.heat.cur,from=ctx.s.log.events.length;
 const result=R.tryCommand(ctx,{kind:'useAbility',actor,ability,target});
 const after=ctx.s.units[actor].pools.heat.cur;
 const heatChecks={reject29:at29.rejection?.code==='require-failed',allow30:at30.rejection===null,castOK:result.ok,removes30:before-after===30&&after===0};
 raw('fixtures',{natural:false,warning:'Injected structural damage / heat29 and30 are isolated mechanism fixtures. Never counted as natural AI evidence.',partSetup:base.sim,variants,heatSetup:hot.sim,at29,at30,result,before,after,castEvents:ctx.s.log.events.slice(from),finalState:ctx.s,partChecks,heatChecks});
 const summary={natural:false,partChecks,heatChecks,pass:Object.values({...partChecks,...heatChecks}).every(Boolean),raw:'fixtures.json.gz'};
 write('summary.json',summary);console.log(JSON.stringify(summary));
}else throw new Error('unknown job');
