import {PLAN_HASH,LEAF_HASHES} from './frozen.js';
import {hashValue} from './hash.js';
import {buildGeometry} from './geometry.js';
import {createMaterials} from './materials.js';
export function validateMeshJob(job){
 if(job?.planHash!==PLAN_HASH||job.interfaceVersion!=='1.1.1'||LEAF_HASHES[job.nodeId]!==hashValue(job))throw Error('Mesh job differs from leader-approved frozen work order');
}
export function createLeafMesh(THREE,job){
 validateMeshJob(job);
 const root=new THREE.Group();root.name=job.name;root.userData={nodeId:job.nodeId,planHash:PLAN_HASH,leaf:true};
 const body=new THREE.Mesh(buildGeometry(THREE,job.solid),createMaterials(THREE,job));
 body.name=job.name+'・封閉實體';body.castShadow=true;body.receiveShadow=true;body.userData.nodeId=job.nodeId;root.add(body);
 for(const detail of job.details??[]){
  const mesh=new THREE.Mesh(buildGeometry(THREE,detail.solid),createMaterials(THREE,detail));mesh.name=detail.name;mesh.position.fromArray(detail.position);mesh.userData.nodeId=job.nodeId;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
 }
 // 真實外殼折線，不增加葉數，也不以線條取代支撐幾何。
 if(job.solid.type==='loft'&&job.material.id!=='light'){
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry,28),new THREE.LineBasicMaterial({color:job.material.id==='ceramic'?'#666b6c':'#26323c',transparent:true,opacity:.48,depthWrite:false}));
  edge.name='實體折邊';edge.userData.nodeId=job.nodeId;root.add(edge);
 }
 return root;
}
