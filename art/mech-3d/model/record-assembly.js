import * as THREE from '../vendor/three.module.min.js';
import {configureModel,validateModel,createLeafJobs,evaluatePose} from './index.js';
import {createLeafMesh} from './mesh.js';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
const p=configureModel();if(!validateModel(p).ok)throw Error('Invalid layout');
const manifest=JSON.parse(readFileSync(new URL('./manifest.json',import.meta.url),'utf8'));
const authorization=JSON.parse(readFileSync(new URL('./mesh-authorization.json',import.meta.url),'utf8'));
if(!manifest.frozen||!authorization.layoutWasFrozenBeforeMesh||authorization.planHash!==p.hash)throw Error('Missing freeze before mesh authorization');
const jobs=new Map(createLeafJobs(p).map(j=>[j.nodeId,j])),frame=evaluatePose(p),rows=[];
function build(node){
 const children=p.nodes.filter(n=>n.parentId===node.id);
 let object;
 if(node.kind==='leaf'){
  object=createLeafMesh(THREE,jobs.get(node.id));object.matrixAutoUpdate=false;object.matrix.fromArray(frame.byNode[node.id].matrix);
 }else{object=new THREE.Group();object.name=node.name;object.userData.nodeId=node.id;for(const child of children)object.add(build(child));}
 rows.push({nodeId:node.id,kind:node.kind,parentId:node.parentId??'',children:children.map(n=>n.id),planHash:p.hash,stage:node.kind==='leaf'?'closed-leaf-mesh-created':'children-attached',objectType:object.type,recordedAt:new Date().toISOString()});
 return object;
}
const root=build(p.nodes.find(n=>n.id===p.rootId));root.updateMatrixWorld(true);
const box=new THREE.Box3().setFromObject(root);
const result=spawnSync('python3',[fileURLToPath(new URL('./write-table.py',import.meta.url))],{input:JSON.stringify({file:'assembly-log.json',source:'REPORT.md',rows}),encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});
console.log(JSON.stringify({steps:rows.length,last:rows.at(-1).nodeId,worldBounds:{min:box.min.toArray(),max:box.max.toArray()}}));
