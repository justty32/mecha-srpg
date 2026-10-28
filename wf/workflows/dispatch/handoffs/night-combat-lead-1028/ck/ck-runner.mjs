// CK 專用必要驗收驅動；只在領導釋放GO後執行，不是通用驗證框架。
// 呼叫端必須加 timeout（不得越過22:25）、nice -n19、taskset最多兩CPU。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { getPriority } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import assert from 'node:assert/strict';
const wt='/tmp/night-combat-lead-1028/wt-ck', dest='/tmp/night-combat-lead-1028/ck-evidence';
const deadline=Date.parse('2026-10-28T14:25:00Z');
if (!process.argv.includes('--go')) throw new Error('尚未GO；準備稿不執行。');
if(getPriority()<19) throw new Error('必須nice19');
const cpuList=/Cpus_allowed_list:\s*(.+)/.exec(readFileSync('/proc/self/status','utf8'))?.[1];
const cpuCount=cpuList?.split(',').reduce((n,s)=>{const [a,b]=s.trim().split('-').map(Number);return n+(b===undefined?1:b-a+1)},0);
if(!cpuCount||cpuCount>2)throw new Error('必須taskset至最多兩個CPU');
const stage=process.argv.find(x=>x.startsWith('--stage='))?.split('=')[1]??'all';
if(!['all','fixture','natural','reference','mcp'].includes(stage))throw new Error('stage只能fixture/natural/reference/mcp/all');
function clock(){if(Date.now()>=deadline)throw new Error('22:25硬截止；停止。');}
clock();mkdirSync(dest,{recursive:true});
const imp=p=>import(pathToFileURL(wt+'/'+p).href);
const [{loadContentDirs},{runBattle,scenarioToSetup},R,AI,{createRulesQuery}]=await Promise.all([
 imp('src/content/loader.ts'),imp('src/sim/run.ts'),imp('src/rules/index.ts'),imp('src/ai/index.ts'),imp('src/ai/adapters/rules-adapter.ts')]);
const loaded=loadContentDirs([wt+'/content/base']);assert.equal(loaded.errors.length,0,JSON.stringify(loaded.errors));
const db=loaded.db, base=db.require('scenario','scenario/night-ck-broken-keel');
const ids=['ability/night-ck-crookbow','ability/kx-mirror-turn','ability/night-ck-keeljaw','ability/kx-star-howl'].map(id=>db.require('ability',id).id);
const rows=existsSync(dest+'/summary.json')?JSON.parse(readFileSync(dest+'/summary.json','utf8')).rows:[];
function save(name,value){writeFileSync(dest+'/'+name,JSON.stringify(value,null,2)+'\n');}
function record(row){rows.push(row);save('summary.json',{contract:'wf-table/1',source:'ck-runner.mjs',extracted:'2026-10-28',columns:['stage','id','seed','winner','rounds','reason','abilityUses','flags','detail'],rows});console.log(JSON.stringify(row));}
function battle(label,scenario,seed,trace=false){
 clock();const decisions=[];let current=null;
 const policy=AI.getPolicy('tactical'),propose=policy.propose,score=policy.score;
 if(trace){
  policy.propose=(ctx,agent)=>{const candidates=propose(ctx,agent);
   if(ctx.view.units[agent.unit]?.owner==='enemy'){
    const u=ctx.view.units[agent.unit];
    current={unit:agent.unit,round:ctx.view.round,ap:u.pools.ap?.cur,pos:u.pos,
     distances:Object.values(ctx.view.units).filter(v=>ctx.q.hostile(ctx.view,agent.unit,v.id)).map(v=>({unit:v.id,distance:ctx.q.distance(u.pos,v.pos)})),
     legal:candidates.filter(c=>c.cmd.kind==='useAbility').map(c=>({ability:c.cmd.ability,target:c.cmd.target,move:c.move})),scores:{}};
    decisions.push(current);
   }else current=null;
   return candidates;};
  policy.score=(ctx,agent,c)=>{const value=score(ctx,agent,c);if(current&&current.unit===agent.unit){const k=c.cmd.kind==='useAbility'?c.cmd.ability:c.cmd.kind;current.scores[k]=Math.max(current.scores[k]??-Infinity,value);}return value;};
 }
 let run;try{run=runBattle({db,sim:scenarioToSetup(db,scenario,seed),seed});}finally{policy.propose=propose;policy.score=score;}
 const events=run.state.log.events,uses={};
 for(const e of events)if(e.type==='AbilityUsed'&&String(e.payload.unit).startsWith('enemy-'))uses[e.payload.ability]=(uses[e.payload.ability]??0)+1;
 const parts=Object.fromEntries(Object.entries(run.state.units).map(([id,u])=>[id,Object.fromEntries(Object.entries(u.parts).map(([p,v])=>[p,{broken:v.broken,hp:v.layers.reduce((n,l)=>n+l.hp,0)}]))]));
 const flags=[];if(!run.result)flags.push('no-outcome:'+run.stopped);
 save(label+'-'+seed+'.json',{scenario,seed,hash:run.hash,result:run.result,stopped:run.stopped,parts,commands:run.commands,events,decisions,
  evidence:events.filter(e=>ids.includes(String(e.payload.ability))||e.type==='PoolChanged'&&e.payload.pool==='ap'),
  hits:events.filter(e=>['Hit','Miss'].includes(e.type)&&ids.includes(String(e.payload.ability)))});
 record({stage:trace?'natural':'reference',id:label,seed,winner:run.result?.winner??null,rounds:run.state.round,reason:run.result?.reason??run.stopped,abilityUses:uses,flags,detail:{hash:run.hash,parts,log:label+'-'+seed+'.json'}});
 return {run,uses};
}
function fixture(monster,distance=1){
 const sc=structuredClone(base);sc.slots.player.units=[{mech:'frame/bulwark-iv-rampart',persons:[{id:'person/chen-xiaohai',seat:'pilot'}],at:{x:5+distance,y:5}}];
 sc.slots.enemy.units=[{monster,at:{x:5,y:5}},{monster:'monster/night-ck-crookbow',at:{x:5,y:6}}];
 const sim=scenarioToSetup(db,sc,1);sim.setup.map={width:20,height:20,fill:'terrain/plain',exits:[]};
 const s=R.createBattle(db,sim.setup,1),ctx={db,s};R.startBattle(ctx);R.rt(s).active='enemy-0';
 return ctx;
}
function broken(ctx,part){const p=ctx.s.units['enemy-0'].parts[part];p.broken=true;for(const l of p.layers){l.hp=0;l.broken=true;}}
function fixtures(){
 const result=[];function check(name,fn){clock();try{const detail=fn();result.push({name,ok:true,detail});}catch(e){result.push({name,ok:false,error:String(e),stack:e.stack});}save('fixtures.json',result);}
 check('crookbow min2/min3, strut and bow',()=>{
  const c=fixture('monster/night-ck-crookbow',2),a='ability/night-ck-crookbow',target={unit:'player-0'};
  assert.equal(R.checkAbility(c,'enemy-0',a,target)?.code,'out-of-range');
  c.s.units['player-0'].pos.x=8;assert.equal(R.checkAbility(c,'enemy-0',a,target),null);
  broken(c,'strut');assert.equal(R.locomotionOf(c,'enemy-0'),null);assert.equal(R.checkAbility(c,'enemy-0',a,target),null);
  assert.equal(R.tryCommand(c,{kind:'move',actor:'enemy-0',path:[{x:6,y:5}]}).rejection?.code,'no-locomotion');
  broken(c,'bow');assert(R.abilitiesOf(c,'enemy-0').includes(db.require('ability',a).id));
  assert(db.require('species','species/night-ck-crookbow').abilities.filter(id=>db.require('ability',id).packets.length).every(id=>db.require('ability',id).target.range.min>=3));
  return {distance2:'out-of-range',distance3:'legal',strut:'no-locomotion',bow:'innate-kept'};
 });
 check('keeljaw part required and aim penalty',()=>{
  const c=fixture('monster/night-ck-keeljaw'),a='ability/night-ck-keeljaw';
  assert.equal(R.checkAbility(c,'enemy-0',a,{unit:'player-0'})?.code,'bad-part');
  const part=R.partDefs(c,'player-0').find(p=>p.functions.includes('locomotion')).id;
  assert.equal(R.checkAbility(c,'enemy-0',a,{unit:'player-0',part}),null);
  const aimed=R.hitChance(c,'enemy-0',a,'player-0',part),free=R.hitChance(c,'enemy-0',a,'player-0');assert.equal(free-aimed,10);
  broken(c,'jaw');assert(R.abilitiesOf(c,'enemy-0').includes(db.require('ability',a).id));return {part,aimed,unaimedFormula:free,jaw:'innate-kept'};
 });
 check('keeljaw native7 howl3 vs bite5, regen5',()=>{
  const h=fixture('monster/night-ck-keeljaw'),b=fixture('monster/night-ck-keeljaw');
  assert.equal(h.s.units['enemy-0'].pools.ap.cur,7);
  assert(R.tryCommand(h,{kind:'useAbility',actor:'enemy-0',ability:'ability/kx-star-howl',target:{unit:'enemy-1'}}).ok);
  assert.equal(h.s.units['enemy-0'].pools.ap.cur,4);
  const part=R.partDefs(h,'player-0').find(p=>p.functions.includes('locomotion')).id;
  assert.equal(R.checkAbility(h,'enemy-0','ability/night-ck-keeljaw',{unit:'player-0',part})?.code,'cannot-pay');
  assert(R.tryCommand(b,{kind:'useAbility',actor:'enemy-0',ability:'ability/night-ck-keeljaw',target:{unit:'player-0',part}}).ok);
  assert.equal(b.s.units['enemy-0'].pools.ap.cur,2);R.regenTick(b,{unit:'enemy-0'});assert.equal(b.s.units['enemy-0'].pools.ap.cur,7);
  return {howl:h.s.log.events,bite:b.s.log.events};
 });
 check('keeljaw feet and capture continuity',()=>{
  const c=fixture('monster/night-ck-keeljaw');broken(c,'forefeet');assert(R.locomotionOf(c,'enemy-0'));assert.equal(R.canCapture(c,'enemy-0'),false);
  broken(c,'hindfeet');assert.equal(R.locomotionOf(c,'enemy-0'),null);assert.equal(R.canCapture(c,'enemy-0'),false);broken(c,'jaw');assert(R.canCapture(c,'enemy-0'));
  R.capture(c,'player-0','enemy-0');assert.equal(c.s.units['enemy-0'].frame,db.require('frame','frame/night-ck-bio-keeljaw').id);
  for(const slug of ['crookbow','keeljaw']){
   const s=db.require('species','species/night-ck-'+slug),p=db.require('bodyplan',s.bodyPlan);
   for(const kind of ['bio','corpse']){const f=db.require('frame','frame/night-ck-'+kind+'-'+slug);assert.equal(f.bodyPlan,s.bodyPlan);assert.deepEqual(f.innateAbilities,s.abilities);assert.equal(p.parts.length,5);
    if(kind==='corpse'){assert.deepEqual(f.pools,[]);assert.equal(f.burden,0);}else assert.deepEqual(f.pools.map(p=>p.id),['instinct']);}
   assert.deepEqual(R.partDefs(c,'enemy-0').map(p=>p.layers.map(l=>l.hp)),db.require('bodyplan','bodyplan/night-ck-keeljaw').parts.map(p=>p.layers.map(l=>l.hp)));
  }
  return {captured:c.s.units['enemy-0'].frame,events:c.s.log.events.filter(e=>e.type==='Captured')};
 });
 check('crookbow capture preserves new skeleton and layers',()=>{
  const c=fixture('monster/night-ck-crookbow',3);assert.equal(R.canCapture(c,'enemy-0'),false);
  broken(c,'strut');assert(R.canCapture(c,'enemy-0'));const before=structuredClone(c.s.units['enemy-0'].parts);
  R.capture(c,'player-0','enemy-0');assert.equal(c.s.units['enemy-0'].frame,db.require('frame','frame/night-ck-bio-crookbow').id);
  assert.deepEqual(c.s.units['enemy-0'].parts,before);
  assert.deepEqual(R.partDefs(c,'enemy-0').map(p=>[p.id,p.layers.map(l=>l.hp)]),db.require('bodyplan','bodyplan/night-ck-crookbow').parts.map(p=>[p.id,p.layers.map(l=>l.hp)]));
  return {frame:c.s.units['enemy-0'].frame,keptState:true};
 });
 check('fresh bio uses pilot AP rather than native monster AP',()=>{
  const sc=structuredClone(base);sc.slots.enemy.units=[{mech:'frame/night-ck-bio-keeljaw',persons:[{id:'person/chen-xiaohai',seat:'pilot'}],at:{x:5,y:5}}];
  sc.slots.player.units=[{mech:'frame/bulwark-iv-rampart',persons:[{id:'person/ren-kasai',seat:'pilot'}],at:{x:6,y:5}}];
  const sim=scenarioToSetup(db,sc,1);sim.setup.map={width:20,height:20,fill:'terrain/plain',exits:[]};
  const s=R.createBattle(db,sim.setup,1),c={db,s};R.startBattle(c);R.rt(s).active='enemy-0';R.controlCheck(c,'enemy-0');
  assert.equal(s.units['enemy-0'].pools.ap,undefined);const pilot=R.commanderOf(c,'enemy-0');assert(pilot);assert.equal(s.persons[pilot].pools.ap.cur,9);
  const part=R.partDefs(c,'player-0').find(p=>p.functions.includes('locomotion')).id;
  assert(R.tryCommand(c,{kind:'useAbility',actor:'enemy-0',ability:'ability/night-ck-keeljaw',target:{unit:'player-0',part}}).ok);
  assert.equal(s.persons[pilot].pools.ap.cur,4);return {pilot,afterBite:4,nativeFixtureAfterBite:2,events:s.log.events.filter(e=>e.type==='PoolChanged'&&e.payload.pool==='ap')};
 });
 record({stage:'fixture',id:'CK-narrow',seed:1,winner:null,rounds:0,reason:'fixture-only',abilityUses:{},flags:result.filter(r=>!r.ok).map(r=>r.name),detail:{log:'fixtures.json',notNaturalAI:true}});
}
async function mcp(){
 clock();const transcript=[],child=spawn(process.execPath,[wt+'/src/mcp/server.ts'],{cwd:wt,stdio:['pipe','pipe','pipe']});
 const input=createInterface({input:child.stdout,crlfDelay:Infinity}),pending=new Map();let next=1,stderr='';
 child.stderr.on('data',d=>{stderr+=String(d)});
 child.on('error',e=>{for(const p of pending.values())p.reject(e);});
 child.on('exit',code=>{for(const p of pending.values())p.reject(new Error('MCP exit '+code+': '+stderr));});
 input.on('line',line=>{try{const r=JSON.parse(line),p=pending.get(r.id);transcript.push({response:r});save('mcp-rpc.json',transcript);if(p){pending.delete(r.id);r.error?p.reject(new Error(JSON.stringify(r.error))):p.resolve(r.result)}}catch(e){for(const p of pending.values())p.reject(e);}});
 const rpc=(method,params)=>new Promise((resolve,reject)=>{clock();const id=next++,request={jsonrpc:'2.0',id,method,params};transcript.push({request});pending.set(id,{resolve,reject});child.stdin.write(JSON.stringify(request)+'\n');});
 const call=async(name,args)=>{const r=await rpc('tools/call',{name,arguments:args});assert(!r.isError,JSON.stringify(r));return r.structuredContent;};
 let manual;
 try{
  await rpc('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'CK-fixed-validation',version:'1'}});
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
  const auto=await call('battle_auto',{scenario:base.id,seed:1});assert(auto.outcome,'MCP auto must reach outcome');
  const natural=JSON.parse(readFileSync(dest+'/natural-1.json','utf8'));assert.equal(auto.hash,natural.hash,'MCP auto uses matching natural raw event log');
  record({stage:'mcp-auto',id:base.id,seed:1,winner:auto.winner,rounds:auto.rounds,reason:auto.reason,abilityUses:{},flags:[],detail:{rpc:'mcp-rpc.json',rawEvents:'natural-1.json',hash:auto.hash}});
  manual=await call('battle_new',{scenario:base.id,seed:1,autoAdvance:false});const id=manual.id;let turn='',moved=false,attackCount=0,closeSeen=false;
  for(let guard=0;guard<400&&!manual.outcome;guard++){
   clock();manual=await call('battle_observe',{id,detail:'full',map:guard===0});
   if(manual.round>=4&&attackCount>0&&closeSeen)break;
   if(!manual.current?.playerTurn){manual=await call('battle_step_ai',{id,until:'human',max:500});continue;}
   const key=manual.round+':'+manual.current.id;if(key!==turn){turn=key;moved=false;}
   const legal=await call('battle_legal_actions',{id,maxMoves:4096,maxTargets:256});
   const own=manual.units.find(u=>u.id===legal.actor),crook=manual.units.find(u=>u.id==='enemy-0'&&!u.stale&&u.status!=='機體損毀'),keel=manual.units.find(u=>u.id==='enemy-1'&&!u.stale);
   const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
   if(own&&crook&&dist(own.pos,crook.pos)<=2)closeSeen=true;
   const prefer=manual.round===3?'enemy-1':'enemy-0';
   const targets=legal.abilities.flatMap(a=>a.targets).filter(t=>String(t.target?.unit).startsWith('enemy-')&&t.damageIfHit>0).sort((a,b)=>(Number(b.target.unit===prefer)-Number(a.target.unit===prefer))||b.hitChance-a.hitChance);
   let action=targets[0]?.action;
   if(!moved&&legal.moves.length&&(!action||manual.round===2&&crook&&own&&dist(own.pos,crook.pos)>2)){
    const goal=(manual.round>=3?keel:crook)?.pos??legal.nearestEnemy?.pos??{x:17,y:8};
    const choices=legal.moves.map(s=>{const [xy,cost]=s.split(':'),[x,y]=xy.split(',').map(Number);return {x,y,cost:Number(cost)}}).filter(c=>!own||dist(c,own.pos)>0).sort((a,b)=>dist(a,goal)-dist(b,goal)||a.cost-b.cost);
    if(choices[0]){action={kind:'move',to:{x:choices[0].x,y:choices[0].y}};moved=true;}
   }
   action??=legal.options.find(o=>o.action.kind==='end')?.action;assert(action,'no legal end or act');if(action.kind==='useAbility')attackCount++;
   manual=await call('battle_act',{id,action});
  }
  const events=await call('battle_events',{id,since:0,limit:100000});save('mcp-manual-events.json',events);
  const flags=[];if(manual.round<4)flags.push('less-than-three-complete-rounds');if(!attackCount)flags.push('no-player-attack');if(!closeSeen)flags.push('not-observed-within-two-of-crookbow');
  record({stage:'mcp-manual',id:base.id,seed:1,winner:manual.outcome?.winner??null,rounds:manual.round,reason:manual.outcome?.reason??'three-round-observation',abilityUses:{},flags,detail:{attackCount,closeSeen,rpc:'mcp-rpc.json',events:'mcp-manual-events.json'}});
  await call('battle_close',{id});
 }finally{child.stdin.end();child.kill();input.close();save('mcp-stderr.json',{stderr});}
}
if(stage==='all'||stage==='fixture')fixtures();
if(stage==='all'||stage==='natural'){
 const coverage=Object.fromEntries(ids.map(id=>[db.require('ability',id).id,0]));
 for(const seed of [1,2,3,4,5]){const {uses}=battle('natural',base,seed,true);for(const id of Object.keys(coverage))coverage[id]+=uses[id]??0;}
 record({stage:'natural-coverage',id:'CK-four-abilities',seed:null,winner:null,rounds:0,reason:'five-seed-aggregate',abilityUses:coverage,flags:Object.entries(coverage).filter(([,n])=>n===0).map(([id])=>'missing:'+id),detail:{diagnostics:'natural-N.json decisions contain legal candidates, AP, distances and actual AI scores; no manual coverage'}});
}
if(stage==='all'||stage==='reference')for(const [label,frames,newMonster,oldMonster] of [
 ['CK01',['frame/longspear-v4','frame/bulwark-ii'],'monster/night-ck-crookbow','monster/spitter-c'],
 ['CK02',['frame/longspear-v7','frame/bulwark-iv-rampart'],'monster/night-ck-keeljaw','monster/shelf-back-b']]){
 const before=rows.length;
 for(const [which,monster]of [['new',newMonster],['reference',oldMonster]])for(const seed of [1,2,3,4,5]){
  const sc=structuredClone(base);sc.slots.player.units=sc.slots.player.units.slice(0,2).map((u,i)=>({...u,mech:frames[i]}));sc.slots.enemy.units=[{monster,at:'zone'}];battle(label+'-'+which,sc,seed);
 }
 const flags=[];for(const which of ['new','reference']){const group=rows.slice(before).filter(r=>r.id===label+'-'+which),w={};for(const r of group)w[r.winner??'draw']=(w[r.winner??'draw']??0)+1;if(Object.entries(w).some(([k,n])=>k!=='draw'&&n===5))flags.push(which+':5/5-one-sided');if(group.filter(r=>r.reason==='timeout').length/5>.4)flags.push(which+':timeout>40%');}
 record({stage:'reference-summary',id:label,seed:null,winner:null,rounds:0,reason:'five-seed-pairs',abilityUses:{},flags,detail:{noWaivers:true,noBaselineOrAIChanges:true}});
}
if(stage==='all'||stage==='mcp')await mcp();
console.log(JSON.stringify({status:rows.some(r=>r.flags.length)?'REVIEW_REQUIRED':'DONE',stage,evidence:dest,rows:rows.length}));
