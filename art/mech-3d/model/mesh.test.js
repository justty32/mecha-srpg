import test from 'node:test';
import assert from 'node:assert/strict';
import {configureModel,validateModel,createLeafJobs} from './index.js';
import {solidData} from './geometry.js';
import {validateMeshJob} from './mesh.js';
import {PLAN_HASH,LEAF_HASHES} from './frozen.js';
const plan=configureModel();assert.equal(validateModel(plan).ok,true);const jobs=createLeafJobs(plan);
function checkClosed(data){
 const edges=new Map();let volume=0;
 for(const tri of data.triangles){
  const [a,b,c]=tri.map(i=>data.vertices[i]);
  const normal=[(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])];
  assert.ok(Math.hypot(...normal)>1e-10,'nondegenerate triangle');
  volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  for(let k=0;k<3;k++){const x=tri[k],y=tri[(k+1)%3],key=[Math.min(x,y),Math.max(x,y)].join(':');const item=edges.get(key)??{count:0,dir:0};item.count++;item.dir+=x<y?1:-1;edges.set(key,item);}
 }
 for(const e of edges.values()){assert.equal(e.count,2,'closed two-manifold edge');assert.equal(e.dir,0,'opposite winding');}
 assert.ok(volume>1e-6,'positive real volume');return volume;
}
test('all 96 frozen leaf solids are closed, finite, positive volume and inside own 3D bounds',()=>{
 assert.equal(plan.hash,PLAN_HASH);assert.deepEqual(Object.keys(LEAF_HASHES).sort(),jobs.map(j=>j.nodeId).sort());
 for(const j of jobs){validateMeshJob(j);const d=solidData(j.solid);checkClosed(d);
  for(const v of d.vertices)for(let i=0;i<3;i++)assert.ok(Number.isFinite(v[i])&&v[i]>=j.localBounds.min[i]-1e-8&&v[i]<=j.localBounds.max[i]+1e-8,j.nodeId);
  for(const detail of j.details){const data=solidData(detail.solid);checkClosed(data);for(const v of data.vertices)for(let i=0;i<3;i++)assert.ok(v[i]+detail.position[i]>=j.localBounds.min[i]-1e-8&&v[i]+detail.position[i]<=j.localBounds.max[i]+1e-8,'detail fits leaf');}
 }
});
test('real mesh surface encloses every required sphere with no uncovered cap/side',()=>{
 for(const j of jobs){const d=solidData(j.solid);for(const coverage of j.requiredCoverage){
  for(const tri of d.triangles){const [a,b,c]=tri.map(i=>d.vertices[i]),u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],norm=Math.hypot(...normal);const distance=normal.reduce((sum,n,i)=>sum+n*(a[i]-coverage.center[i]),0)/norm;
   assert.ok(distance+1e-6>=coverage.radius,`${j.nodeId} ${coverage.connectionId} triangle-plane clearance ${distance}`);
  }
 }}
});
test('missing triangle is rejected and changed work order cannot create mesh',()=>{
 const d=solidData(jobs[0].solid);d.triangles.pop();assert.throws(()=>checkClosed(d),/closed/);
 const j=structuredClone(jobs[0]);j.solid.size[0]*=1.2;assert.throws(()=>validateMeshJob(j),/frozen/);
});
