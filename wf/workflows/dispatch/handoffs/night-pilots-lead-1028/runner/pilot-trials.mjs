import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { getPriority } from 'node:os';
if (!process.argv.includes('--go') || process.env.PILOT_LEADER_GO !== '1028-until-2235') throw new Error('Explicit pilot leader GO required');
if (getPriority() < 19) throw new Error('nice19 required');
const WT='/tmp/night-pilots-lead-1028/wt-pilots';
const OUT='/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-lead-1028';
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

const group=opt('--group')??'natural';
const deadline=Date.parse('2026-10-28T22:35:00+08:00');
const demo=db.require('scenario','scenario/night-p-two-ledgers');
const rows=[];
for(const seed of [1,2,3,4,5]){
 if(Date.now()>=deadline){write('pending.json',{group,seed,reason:'22:35 no new trial'});break;}
 const sc=structuredClone(demo);
 if(group==='replace-P01')sc.slots.player.units[0].persons[0].id='person/exp-adela-miro';
 if(group==='replace-P02')sc.slots.player.units[1].persons[0].id='person/exp-miyasaka-gaku';
 const sim=scenarioToSetup(db,sc,seed);
 if(group==='swap-positions'){
  const us=sim.setup.units.filter(u=>u.owner==='player');
  [us[0].pos,us[1].pos]=[us[1].pos,us[0].pos];
 }
 const sub=path.join(dir,'seed-'+seed);fs.mkdirSync(sub,{recursive:true});
 const put=(name,value)=>fs.writeFileSync(path.join(sub,name+'.json'),JSON.stringify(value,null,2)+'\n');
 const zip=(name,value)=>fs.writeFileSync(path.join(sub,name+'.json.gz'),gzipSync(JSON.stringify(value)+'\n'));
 const initial=R.createBattle(db,sim.setup,seed),ic={db,s:initial};
 const people=Object.fromEntries(Object.values(initial.persons).map(p=>[p.id,{def:p.def,seat:p.seat,attrsBase:p.attrsBase,effects:p.effects,contribs:p.contribs,roleAttrs:Object.fromEntries(['accuracy','evasion','resolve','initiative','perception','control'].map(a=>[a,R.roleAttr(ic,{person:p.id},a)]))}]));
 put('input',{group,seed,scenario:sc,sim,natural:true,people});zip('initial',initial);
 const started=Date.now();
 const run=runBattle({db,sim,seed,maxSteps:10000});
 zip('run',run);zip('events',run.state.log.events);
 const replay=R.createBattle(db,sim.setup,seed),ctx={db,s:replay};R.startBattle(ctx);
 const legal={},rejected=[];
 for(const [step,cmd] of run.commands.entries()){
  if(cmd.kind==='useAbility'&&!legal[cmd.actor])legal[cmd.actor]={step,round:replay.round,person:people[Object.keys(people).find(id=>people[id].seat?.mech===cmd.actor)]?.def,command:cmd,check:R.checkAbility(ctx,cmd.actor,cmd.ability,cmd.target)};
  const applied=R.tryCommand(ctx,cmd);if(!applied.ok){rejected.push({step,cmd,applied});break;}
 }
 const units=Object.fromEntries(Object.values(run.state.units).map(u=>[u.id,{frame:u.frame,owner:u.owner,position:initial.units[u.id].pos,persons:Object.values(people).filter(p=>p.seat?.mech===u.id).map(p=>p.def),status:run.state.rt.unitStatus[u.id],abilities:coverage(run.state.log.events,u.id),actions:run.commands.filter(c=>c.actor===u.id).length,hits:run.state.log.events.filter(e=>e.type==='Hit'&&e.payload.unit===u.id).length,misses:run.state.log.events.filter(e=>e.type==='Miss'&&e.payload.unit===u.id).length,turnRounds:run.state.log.events.filter(e=>e.type==='TurnStart'&&e.payload.unit===u.id).map(e=>e.round)}]));
 const summary={group,seed,natural:true,people,units,firstLegalExecuted:legal,replayRejected:rejected,winner:run.result?.winner??null,reason:run.result?.reason??run.stopped,rounds:run.state.round,stopped:run.stopped,hash:run.hash,rejected:run.rejected,events:run.state.log.events.length,ms:Date.now()-started,raw:'run.json.gz',rawEvents:'events.json.gz'};
 put('summary',summary);rows.push(summary);write('summary.json',rows);
 console.log(JSON.stringify({group,seed,winner:summary.winner,rounds:summary.rounds,ms:summary.ms,abilities:Object.fromEntries(Object.entries(units).filter(([,u])=>u.owner==='player').map(([id,u])=>[id,u.abilities]))}));
}
