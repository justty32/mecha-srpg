import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {configureMech,validateAssembly,createLeafJobs,evaluatePose} from '../core/index.js';
import {hashValue} from '../core/hash.js';
import {drawLeaf,createLeafPainter,validateLeafJob,painterIds,PLAN_HASH,JOBS_HASH} from './index.js';
import {profiles} from './profiles.js';
import {trace} from './paint.js';
import {coverageFailures} from './coverage-check.js';
import {profileForId} from './profiles.js';

const plan=configureMech();assert.equal(validateAssembly(plan).ok,true);
const jobs=createLeafJobs(plan);
function recorder(b) {
  const state={depth:0,fills:0,strokes:0,points:0};
  const point=(x,y)=>{
    assert.ok(Number.isFinite(x)&&Number.isFinite(y),'finite coordinates');
    assert.ok(x>=b.x-1e-8&&x<=b.x+b.width+1e-8&&y>=b.y-1e-8&&y<=b.y+b.height+1e-8,`out of leaf bounds: ${x},${y}`);
    state.points++;
  };
  const points=(...xs)=>{for(let i=0;i<xs.length;i+=2)point(xs[i],xs[i+1]);};
  const ctx={save(){state.depth++;},restore(){assert.ok(state.depth>0);state.depth--;},beginPath(){},closePath(){},clip(){},
    moveTo:points,lineTo:points,quadraticCurveTo:points,bezierCurveTo:points,
    ellipse(x,y,rx,ry,angle,start,end){assert.equal(angle,0);assert.ok(rx>0&&ry>0);points(x-rx,y-ry,x+rx,y+ry);},
    rect(x,y,w,h){points(x,y,x+w,y+h);},fillRect(x,y,w,h){points(x,y,x+w,y+h);state.fills++;},
    createLinearGradient(...args){points(...args);return {addColorStop(offset,color){assert.ok(offset>=0&&offset<=1);assert.equal(typeof color,'string');}};},
    fill(){state.fills++;},stroke(){state.strokes++;},
    transform(){assert.fail('Drawing must not transform world matrix');},
    translate(){assert.fail('Drawing must not translate');},rotate(){assert.fail('Drawing must not rotate');},scale(){assert.fail('Drawing must not scale');},
  };
  return {ctx,state};
}
test('exact frozen jobs hash, 94 unique painter IDs, no missing/orphan leaves',()=>{
  assert.equal(plan.hash,PLAN_HASH);assert.equal(hashValue(jobs),JOBS_HASH);
  assert.equal(jobs.length,94);assert.deepEqual([...painterIds].sort(),jobs.map(j=>j.nodeId).sort());
  for(const j of jobs)assert.ok(validateLeafJob(j));
});
test('all 94 leaves paint in all three real poses within their own bounds, no world transforms, balanced context',()=>{
  const before=JSON.stringify(jobs);
  for(const pose of Object.keys(plan.poses)) {
    const frame=evaluatePose(plan,pose);
    for(const j of jobs){
      const {ctx,state}=recorder(j.localGeometry.bounds);
      drawLeaf(ctx,j,{...frame.byNode[j.nodeId],selected:true});
      assert.equal(state.depth,0,j.nodeId);assert.ok(state.fills>=3,j.nodeId);assert.ok(state.points>=20,j.nodeId);
    }
  }
  assert.equal(JSON.stringify(jobs),before);
});
test('stale hashes, altered bounds/material/pivot/ancestor, unknown leaf, wrong API are rejected',()=>{
  const mutations=[j=>j.planHash='stale',j=>j.interfaceVersion='2',j=>j.nodeId='root.fake',j=>j.localGeometry.bounds.width++,j=>j.material.base='#ffffff',j=>j.pivot.x++,j=>j.ancestorPath.pop()];
  for(const change of mutations){const j=structuredClone(jobs[0]);change(j);assert.throws(()=>validateLeafJob(j),/mismatch/);}
});
test('cached painter revalidates a mutated job; no paint occurs on rejection',()=>{
  const j=structuredClone(jobs[0]);const painter=createLeafPainter(j);j.localGeometry.bounds.x++;
  const {ctx,state}=recorder(j.localGeometry.bounds);assert.throws(()=>painter(ctx,{}),/mismatch/);assert.equal(state.fills,0);
});
test('bounds checker negative control actually catches an out-of-bounds path',()=>{
  const {ctx}=recorder({x:0,y:0,width:10,height:10});
  assert.throws(()=>trace(ctx,'M 0 0 L 1.2 .5',{x:0,y:0,width:10,height:10}),/out of leaf bounds/);
});
test('functional outlines are distinct; normalized curve control points stay in bounds',()=>{
  assert.equal(Object.keys(profiles).length,58);
  assert.equal(new Set(Object.values(profiles).map(p=>p.outline)).size,58);
  for(const p of Object.values(profiles)){
    const {ctx}=recorder({x:0,y:0,width:1,height:1});trace(ctx,p.outline,{x:0,y:0,width:1,height:1});
    assert.ok(!/^M 0 0 L 1 0 1 1 0 1 Z$/.test(p.outline));
  }
});
test('bottom-up assembly record has every child before parent and matches core parent links',()=>{
  const read=spawnSync('python3',['wf/tools/tabledb.py','art/canvas-mech/drawing/assembly-log.json','--slice','0','184'],{encoding:'utf8',maxBuffer:2_000_000});
  assert.equal(read.status,0,read.stderr);
  const rows=JSON.parse(read.stdout),seen=new Set();
  assert.equal(rows.length,plan.nodes.length);
  for(const row of rows){
    const n=plan.nodes.find(n=>n.id===row.nodeId);assert.ok(n);assert.equal(row.planHash,PLAN_HASH);
    assert.deepEqual(row.children,plan.nodes.filter(c=>c.parentId===n.id).map(c=>c.id));
    for(const id of row.children)assert.ok(seen.has(id),`child not assembled: ${id}`);
    assert.ok(!seen.has(n.id));seen.add(n.id);
  }
  assert.equal(rows.at(-1).nodeId,plan.rootId);
});

test('104 contact disks fully enclosed by connected opaque primary silhouettes',()=>{
 let count=0;
 for(const j of jobs){
  count+=j.requiredCoverage.length;
  assert.deepEqual(coverageFailures(j,profiles[profileForId(j.nodeId)].outline),[],j.nodeId);
 }
 assert.equal(count,104);
});
test('coverage negative control rejects oversized disks and altered requiredCoverage',()=>{
 const j=structuredClone(jobs.find(j=>j.requiredCoverage.length));
 j.requiredCoverage[0].radius=10000;
 assert.ok(coverageFailures(j,profiles[profileForId(j.nodeId)].outline).length);
 assert.throws(()=>validateLeafJob(j),/mismatch/);
});
