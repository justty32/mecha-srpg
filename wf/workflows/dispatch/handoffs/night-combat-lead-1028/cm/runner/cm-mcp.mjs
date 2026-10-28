import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { getPriority } from 'node:os';
if(!process.argv.includes('--go')||process.env.CM_LEADER_GO!=='1028-until-2225'||getPriority()<19)throw new Error('leader GO and nice19 required');
const WT='/tmp/night-combat-lead-1028/wt-cm';
const opt=k=>process.argv[process.argv.indexOf(k)+1];
const ROOT=opt('--dir'),dir=path.join(ROOT,'mcp-log');fs.mkdirSync(dir,{recursive:true});
const write=(name,x)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(x,null,2)+'\n');
const raw=(name,x)=>fs.writeFileSync(path.join(dir,name+'.json.gz'),gzipSync(JSON.stringify(x)+'\n'));
const append=x=>fs.appendFileSync(path.join(dir,'stdio.jsonl.gz'),gzipSync(JSON.stringify(x)+'\n'));
const child=spawn(process.execPath,[path.join(WT,'src/mcp/server.ts')],{cwd:WT,stdio:['pipe','pipe','pipe'],env:process.env});
const stderr=fs.createWriteStream(path.join(dir,'stderr.log'));
child.stderr.pipe(stderr);
const input=createInterface({input:child.stdout,crlfDelay:Infinity}),pending=new Map();let next=1;
const exited=new Promise(resolve=>child.once('exit',(code,signal)=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(`MCP exited ${code}/${signal}`));}pending.clear();resolve({code,signal});}));
child.on('error',e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();});
input.on('line',line=>{
 append({direction:'stdout',raw:line});
 try{const v=JSON.parse(line),p=pending.get(v.id);if(!p)throw new Error('unexpected RPC '+line);pending.delete(v.id);clearTimeout(p.timer);v.error?p.reject(new Error(JSON.stringify(v.error))):p.resolve({rpcId:v.id,result:v.result});}
 catch(e){for(const p of pending.values()){clearTimeout(p.timer);p.reject(e);}pending.clear();}
});
async function rpc(method,params){const id=next++,request={jsonrpc:'2.0',id,method,params};append({direction:'stdin',request});return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`RPC timeout ${method}/${params?.name}`));child.kill('SIGTERM');},90000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify(request)+'\n');});}
async function call(name,args){const v=await rpc('tools/call',{name,arguments:args});if(v.result?.isError)throw new Error(`MCP ${name}: ${JSON.stringify(v.result)}`);return {rpcId:v.rpcId,data:v.result.structuredContent};}
const scenario='scenario/night-cm-yard-bells',strip=x=>String(x).replace(/^base:/,'');
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
let summary={status:'RUNNING',natural:true,seed:1,manualActions:[],notes:[]};
try{
 await rpc('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'CM-authorized-evidence',version:'1'}});
 const notification={jsonrpc:'2.0',method:'notifications/initialized'};append({direction:'stdin',request:notification});child.stdin.write(JSON.stringify(notification)+'\n');
 const auto=(await call('battle_auto',{scenario,seed:1})).data;write('auto.json',auto);
 const smokePath=path.join(ROOT,'smoke','seed-1','summary.json');
 const smoke=fs.existsSync(smokePath)?JSON.parse(fs.readFileSync(smokePath,'utf8')):null;
 summary.auto={...auto,fullRawEvents:'../smoke/seed-1/events.json.gz',rawPairHash:smoke?.hash??null,rawPairHashMatches:smoke?.hash===auto.hash};
 let observed=(await call('battle_new',{scenario,seed:1,autoAdvance:false})).data;
 const id=observed.id;let turn='',moved=false,bellUses=0,coldUses=0,guard=0;
 const chosen=[];const completeLimit=8;
 while(!observed.outcome&&guard++<700){
  const obsCall=await call('battle_observe',{id,detail:'full',map:true});observed=obsCall.data;
  if(observed.outcome)break;
  if(observed.round>=4&&bellUses>0&&coldUses>0)break;
  if(observed.round>completeLimit){summary.notes.push('手動上限八輪；未觀察到項目如實列缺，不硬造合法動作。');break;}
  if(!observed.current?.playerTurn){await call('battle_step_ai',{id,until:'command',max:1});continue;}
  const legalCall=await call('battle_legal_actions',{id,maxMoves:4096,maxTargets:256}),legal=legalCall.data;
  const actor=legal.actor,key=`${observed.round}:${actor}`;if(key!==turn){turn=key;moved=false;}
  const self=observed.units.find(u=>u.id===actor),heat=self?.pools?.heat?.cur??null;
  const enemies=observed.units.filter(u=>u.owner!=='player'&&u.pos&&!u.stale&&u.status!=='機體損毀');
  const targetOptions=legal.abilities.flatMap(a=>(a.targets??[]).filter(t=>t.target.unit?enemies.some(u=>u.id===t.target.unit):t.target.cell&&enemies.some(u=>dist(u.pos,t.target.cell)===0)).map(t=>({ability:a,target:t,action:t.action})));
  let choice=targetOptions.find(o=>strip(o.ability.id)==='ability/night-cm-cinderbell');
  if(!choice)choice=targetOptions.filter(o=>strip(o.ability.id)!=='ability/mx-cold-vent').sort((a,b)=>(b.target.damageIfHit??18)*(b.target.hitChance??60)-(a.target.damageIfHit??18)*(a.target.hitChance??60))[0];
  let action=choice?.action,why=choice?'returned target.action':'',source=choice?{kind:'target.action',ability:choice.ability.id,target:choice.target.target}:null;
  // 冷泉是手動示範選擇，絕不算自然AI；先觀察鳴鐘，再展示冷泉的降燼代價。
  if(!action&&actor==='player-1'&&bellUses>0&&coldUses===0&&observed.round>=3&&heat>0){
   const cold=legal.abilities.find(a=>strip(a.id)==='ability/mx-cold-vent')?.targets?.[0];
   if(cold){action=cold.action;why='合法寒泉：對照下一鐘門檻（手動選擇）';source={kind:'target.action',ability:'ability/mx-cold-vent',target:cold.target};}
  }
  if(!action&&!moved){
   const ap=self?.persons?.[0]?.pools?.ap?.cur??0;
   const known=observed.units.filter(u=>u.owner!=='player'&&u.pos);
   const w=observed.map?.window;const aim=known.length?known.map(u=>u.pos):w?[{x:w.x+(w.w-1)/2,y:w.y+(w.h-1)/2}]:[];
   const moves=(legal.moves??[]).map(entry=>{const [cell,cost]=entry.split(':'),[x,y]=cell.split(',').map(Number);return {entry,x,y,cost:Number(cost)};});
   const reserve=4;
   const candidates=moves.filter(m=>m.cost<=Math.max(0,ap-reserve)&&aim.length&&Math.min(...aim.map(a=>dist(m,a)))<Math.min(...aim.map(a=>dist(self.pos,a))));
   candidates.sort((a,b)=>Math.min(...aim.map(p=>dist(a,p)))-Math.min(...aim.map(p=>dist(b,p)))||a.cost-b.cost||a.y-b.y||a.x-b.x);
   const move=candidates[0];
   if(move){action=JSON.parse(legal.moveAction.replace(/\bX\b/g,String(move.x)).replace(/\bY\b/g,String(move.y)));source={kind:'returned moveAction template + returned moves entry',entry:move.entry,template:legal.moveAction};why=known.length?'依已知敵方接近，保留四AP':'依觀察地圖中心接近，保留四AP；未使用隱藏部署';moved=true;}
  }
  if(!action){const end=legal.options.find(o=>o.action.kind==='end');if(!end)throw new Error('No legal end');action=end.action;source={kind:'options.action'};why='目前沒有合適合法射擊或接近，保留真實替代動作';}
  const before={round:observed.round,actor,heat,abilityReasons:legal.abilities.map(a=>({id:a.id,reason:a.reason,legalTargets:a.targets.length}))};
  const acted=(await call('battle_act',{id,action})).data;
  const afterObs=(await call('battle_observe',{id,detail:'full'})).data;
  const afterHeat=afterObs.units.find(u=>u.id===actor)?.pools?.heat?.cur??null;
  if(action.kind==='useAbility'&&strip(action.ability)==='ability/night-cm-cinderbell')bellUses++;
  if(action.kind==='useAbility'&&strip(action.ability)==='ability/mx-cold-vent')coldUses++;
  chosen.push({observationRpc:obsCall.rpcId,legalRpc:legalCall.rpcId,source,why,action,executed:acted.command,before,after:{round:afterObs.round,heat:afterHeat}});
  summary.manualActions=chosen;observed=afterObs;
  write('manual-progress.json',{...summary,manualCurrent:observed,manualBellUses:bellUses,manualColdUses:coldUses});
 }
 const visible=[];let since=0;
 for(let i=0;i<1000;i++){const e=(await call('battle_events',{id,since,limit:1000})).data;visible.push(...e.events);if(e.next<=since||e.events.length===0)break;since=e.next;}
 raw('visible-events',visible);
 const saved=(await call('battle_save',{id})).data;raw('save',saved);
 const wrapper=JSON.parse(saved.save),save=wrapper.save;
 const imp=p=>import(pathToFileURL(path.join(WT,p)).href);
 const {loadContentDirs}=await imp('src/content/loader.ts');const R=await imp('src/rules/index.ts');const {hashLog}=await imp('src/core/eventlog.ts');
 const loaded=loadContentDirs([path.join(WT,'content/base')]);if(loaded.errors.length)throw new Error(JSON.stringify(loaded.errors));
 const state=R.createBattle(loaded.db,save.setup,save.seed),ctx={db:loaded.db,s:state};R.startBattle(ctx);
 const rejected=[];
 for(const [i,cmd] of save.commands.entries()){const result=R.tryCommand(ctx,cmd);if(!result.ok){rejected.push({i,cmd,result});break;}}
 raw('manual-raw',{source:'Replay of complete commands from actual stdio battle_save; no extra AI decisions. Manual evidence, never natural AI coverage.',commands:save.commands,state,events:state.log.events,rejected,expectedHash:wrapper.hash,actualHash:hashLog(state.log)});
 const completed=[...new Set(state.log.events.filter(e=>e.type==='RoundEnd').map(e=>e.round))].sort((a,b)=>a-b);
 const losses=side=>Object.values(state.units).filter(u=>u.owner===side&&state.rt.unitStatus[u.id]!=='active').length;
 summary={...summary,status:'DONE',manual:{rounds:state.round,completedRounds:completed,threeCompleteRounds:[1,2,3].every(r=>completed.includes(r)),outcome:state.rt.outcome,guardExceeded:guard>=700,bellUses,coldUses,heatTransitions:chosen.filter(x=>x.before.actor==='player-1'),commands:save.commands.length,rejected,replayHashMatches:wrapper.hash===hashLog(state.log),ourLosses:losses('player'),enemyLosses:losses('enemy')},manualActions:chosen,notes:[...summary.notes,'battle_auto本身只回摘要，完整自然事件引用smoke seed1且校對hash。battle_events為可見文字事件，另由MCP保存的全部commands無AI重播還原原始事件並校對hash。']};
 await call('battle_close',{id});write('summary.json',summary);console.log(JSON.stringify({status:summary.status,auto:summary.auto,manual:summary.manual}));
}catch(e){summary={...summary,status:'FAILED',error:String(e),stack:e.stack};write('summary.json',summary);throw e;}
finally{child.stdin.end();const ended=await Promise.race([exited,new Promise(resolve=>setTimeout(()=>resolve(null),1500))]);if(!ended)child.kill('SIGTERM');input.close();stderr.end();}
