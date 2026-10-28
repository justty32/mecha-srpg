import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.min.js';
import {configureModel,validateModel,createLeafJobs,evaluatePose} from './index.js';
import {createLeafMesh} from './mesh.js';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const p=configureModel();assert.equal(validateModel(p).ok,true);const jobs=createLeafJobs(p);
test('actual Three Object3D contract: IDs, local origin, finite normals, real bounds and shadows',()=>{
 for(const j of jobs){const object=createLeafMesh(THREE,j);assert.equal(object.userData.nodeId,j.nodeId);assert.deepEqual(object.position.toArray(),[0,0,0]);let bodies=0;
 object.traverse(o=>{
  if(o.isMesh){bodies++;assert.ok(o.castShadow&&o.receiveShadow);assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite));
   o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;assert.ok(b.max.x>b.min.x&&b.max.y>b.min.y&&b.max.z>b.min.z);
   for(let axis=0;axis<3;axis++){assert.ok(b.min.toArray()[axis]>=j.localBounds.min[axis]-1e-6);assert.ok(b.max.toArray()[axis]<=j.localBounds.max[axis]+1e-6);}
  }
  o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();
 });assert.equal(bodies,1+j.details.length);
 }
});
test('viewer-style flat world matrix placement matches formal rig in every preset',()=>{
 for(const pose of Object.keys(p.poses)){const frame=evaluatePose(p,pose);for(const j of jobs){const o=new THREE.Group();o.matrixAutoUpdate=false;o.matrix.fromArray(frame.byNode[j.nodeId].matrix);o.updateMatrixWorld(true);assert.deepEqual(o.matrixWorld.elements,frame.byNode[j.nodeId].matrix);}}
});
test('real bottom-up assembly evidence covers all nodes with child before parent',()=>{
 const result=spawnSync('python3',[fileURLToPath(new URL('../../../wf/tools/tabledb.py',import.meta.url)),fileURLToPath(new URL('./assembly-log.json',import.meta.url)),'--slice','0','180'],{encoding:'utf8',maxBuffer:2_000_000});
 assert.equal(result.status,0,result.stderr);const rows=JSON.parse(result.stdout),seen=new Set();assert.equal(rows.length,180);
 for(const row of rows){assert.equal(row.planHash,p.hash);for(const child of row.children)assert.ok(seen.has(child));assert.ok(!seen.has(row.nodeId));seen.add(row.nodeId);}
 assert.equal(rows.at(-1).nodeId,p.rootId);
});
