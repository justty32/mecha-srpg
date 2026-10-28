// Node 專用產物入口；核心 index.js 不 import 此檔。
import { readFileSync,writeFileSync,readdirSync,statSync } from 'node:fs';
import { dirname,join,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { configureMech,validateAssembly,createLeafJobs,evaluatePose,GATES,INTERFACE_VERSION } from './index.js';
import { apply } from './math.js';
import { hashValue } from './hash.js';

const here=dirname(fileURLToPath(import.meta.url));
const tools=join(here,'../../../wf/tools');
const check=process.argv.includes('--check');
if(process.argv.slice(2).some(arg=>arg!=='--check')) throw new Error('僅支援 --check');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,1)+'\n');
const table=(rows,meta={})=>({contract:'wf-table/1',source:'API.md',extracted:'2026-10-28',...meta,columns:Object.keys(rows[0]??{}),rows});
// 同質資料表透過專案 tabledb 建構/保存；生成器僅將其結果納入容量與摘要。
function tableBytes(value,path,save=false) {
  const code='import sys,json\nsys.path.insert(0,sys.argv[1])\nfrom tabledb import Table\nv=json.load(sys.stdin)\nt=Table(sys.argv[2],columns=v.pop("columns"),rows=v.pop("rows"),meta=v)\nif sys.argv[3]=="save": t.save()\nsys.stdout.write(json.dumps({**t.meta,"columns":t.columns,"rows":t.rows},ensure_ascii=False,indent=1)+"\\n")';
  const result=spawnSync('python3',['-c',code,tools,path,save?'save':'encode'],{input:JSON.stringify(value),encoding:'utf8',maxBuffer:GATES.maxBytes});
  if(result.error || result.status!==0) throw new Error(`tabledb 環境錯誤: ${result.error?.message??result.stderr}`);
  return Buffer.from(result.stdout);
}
function files(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if(entry.name==='node_modules') return [];
    const path=join(dir,entry.name);
    if(entry.isSymbolicLink()) throw new Error(`core 產物禁止符號連結: ${entry.name}`);
    return entry.isDirectory()?files(path):[path];
  });
}
const plan=configureMech(),validation=validateAssembly(plan);
if(!validation.ok) throw new Error(JSON.stringify(validation.errors));
const jobs=createLeafJobs(plan);
const poses=Object.keys(plan.poses).map(id=>{
  const frame=evaluatePose(plan,id);
  const finiteMatrixCount=Object.values(frame.byNode).filter(s=>s.worldMatrix.every(Number.isFinite)).length;
  if(finiteMatrixCount!==plan.summary.nodeCount) throw new Error(`姿態矩陣不有限: ${id}`);
  const links=plan.rig.links.map(link=>{
    const state=frame.byNode[link.nodeId],start=apply(state.worldMatrix,{x:-link.restLength/2,y:0}),end=apply(state.worldMatrix,{x:link.restLength/2,y:0});
    const error=Math.max(Math.hypot(start.x-state.linkage.start.x,start.y-state.linkage.start.y),Math.hypot(end.x-state.linkage.end.x,end.y-state.linkage.end.y));
    if(error>1e-6) throw new Error(`連桿端點誤差: ${link.nodeId}`);
    return {nodeId:link.nodeId,...state.linkage,endpointError:error};
  });
  const contacts=plan.connections.map(c=>{
    const a=frame.byNode[c.a.nodeId].attachments[c.a.attachmentId],b=frame.byNode[c.b.nodeId].attachments[c.b.attachmentId];
    const gap=Math.hypot(a.x-b.x,a.y-b.y);
    if(gap>c.tolerance+1e-7) throw new Error(`接合不同位: ${c.id}/${id}`);
    return {id:c.id,gap,radius:c.radius};
  });
  return {poseId:id,nodeCount:plan.summary.nodeCount,finiteMatrixCount,nearShoulderDeg:frame.byNode['root.arm-near.shoulder'].rotationDeltaDeg,nearElbowDeg:frame.byNode['root.arm-near.forearm'].rotationDeltaDeg,nearKneeDeg:frame.byNode['root.leg-near.shin'].rotationDeltaDeg,farKneeDeg:frame.byNode['root.leg-far.shin'].rotationDeltaDeg,nearUpperPivot:frame.byNode['root.arm-near.upper'].worldPivot,nearHandPivot:frame.byNode['root.arm-near.hand'].worldPivot,shieldPivot:frame.byNode['root.equipment.shield'].worldPivot,links,contacts};
});
const idle=evaluatePose(plan),turned=evaluatePose(plan,{id:'proof-shoulder-90',angles:{'root.arm-near.shoulder':90}});
const parentMotion={jointId:'root.arm-near.shoulder',deltaDeg:90,childId:'root.arm-near.upper',before:idle.byNode['root.arm-near.upper'].worldPivot,after:turned.byNode['root.arm-near.upper'].worldPivot,handAfter:turned.byNode['root.arm-near.hand'].worldPivot,farHandUnchanged:hashValue(idle.byNode['root.arm-far.hand'])===hashValue(turned.byNode['root.arm-far.hand'])};
if(Math.abs(parentMotion.after.x-636)>1e-6 || Math.abs(parentMotion.after.y-354)>1e-6 || !parentMotion.farHandUnchanged) throw new Error('父動子隨證據不符');
const tables={
  'leaf-jobs.json':table(jobs,{interfaceVersion:INTERFACE_VERSION,planHash:plan.hash,jobsHash:hashValue(jobs)}),
  'pose-evidence.json':table(poses,{interfaceVersion:INTERFACE_VERSION,planHash:plan.hash,parentMotion}),
};
const outputs=new Map([['assembly-plan.json',json(plan)],...Object.entries(tables).map(([name,value])=>[name,tableBytes(value,join(here,name))])]);
const existing=files(here).map(p=>relative(here,p)).filter(name=>name!=='manifest.json' && !outputs.has(name));
const all=new Map(existing.map(name=>[name,readFileSync(join(here,name))]));
for(const entry of outputs) all.set(...entry);
const rows=[...all].sort(([a],[b])=>a.localeCompare(b,'en')).map(([file,bytes])=>({file,bytes:bytes.length,sha256:digest(bytes)}));
const manifest=table(rows,{interfaceVersion:INTERFACE_VERSION,schemaVersion:plan.schemaVersion,frozen:true,planHash:plan.hash,jobsHash:hashValue(jobs),summary:plan.summary,gates:GATES,checks:{assemblyValid:true,poseCount:poses.length,allPoseMatricesFinite:true,allLinkEndpointsAligned:true,parentMotionProven:true,contactCount:plan.connections.length,requiredCoverageCount:jobs.reduce((sum,j)=>sum+j.requiredCoverage.length,0),allContactsCoincident:true},capacity:{bytes:0,limitBytes:GATES.maxBytes,excludes:['node_modules']}});
const otherBytes=rows.reduce((sum,r)=>sum+r.bytes,0);
let manifestBytes;
for(let i=0;i<10;i++) {
  manifestBytes=tableBytes(manifest,join(here,'manifest.json'));
  const total=otherBytes+manifestBytes.length;
  if(total===manifest.capacity.bytes) break;
  manifest.capacity.bytes=total;
}
if(manifest.capacity.bytes>GATES.maxBytes) throw new Error(`容量 gate 超限 ${manifest.capacity.bytes}/${GATES.maxBytes}；未寫產物`);
outputs.set('manifest.json',manifestBytes);
tables['manifest.json']=manifest;
if(check) {
  for(const [name,expected] of outputs) {
    let actual;try {actual=readFileSync(join(here,name));} catch {throw new Error(`缺少生成產物: ${name}`);}
    if(!actual.equals(expected)) throw new Error(`生成產物已過期: ${name}`);
  }
} else {
  for(const [name,bytes] of outputs) {
    if(tables[name]) tableBytes(tables[name],join(here,name),true);
    else writeFileSync(join(here,name),bytes);
    if(statSync(join(here,name)).size!==bytes.length) throw new Error(`產物大小不符: ${name}`);
  }
}
console.log(JSON.stringify({status:check?'verified':'frozen',interfaceVersion:INTERFACE_VERSION,planHash:plan.hash,jobsHash:hashValue(jobs),summary:plan.summary,bytes:manifest.capacity.bytes,files:rows.length+1}));
