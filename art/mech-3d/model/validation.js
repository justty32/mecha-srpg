import {corners,point,translation,inBounds,distance} from './math.js';
import {containsSphere} from './solid.js';
import {evaluateRaw} from './rig.js';
import {certify,planDigest} from './state.js';
export function validateModel(plan){
 const errors=[],bad=(code,id,message)=>errors.push({code,nodeId:id,message});
 try{
 if(!plan||!Array.isArray(plan.nodes))throw Error('Missing nodes');
 const map=new Map(plan.nodes.map(n=>[n.id,n]));
 if(map.size!==plan.nodes.length)bad('DUPLICATE',null,'Duplicate node ID');
 const roots=plan.nodes.filter(n=>n.parentId===null);
 if(roots.length!==1||roots[0]?.id!==plan.rootId)bad('ROOT',null,'Exactly one declared root required');
 for(const n of plan.nodes){const visited=new Set();let cursor=n;while(cursor){if(visited.has(cursor.id)){bad('TREE',n.id,'Semantic cycle');break;}visited.add(cursor.id);if(cursor.parentId===null)break;cursor=map.get(cursor.parentId);if(!cursor){bad('TREE',n.id,'Orphan parent');break;}}}
 const leaves=plan.nodes.filter(n=>n.kind==='leaf');
 if(leaves.length>120||plan.nodes.length>240)bad('CAPACITY',null,'Exceeds 120/240');
 if(plan.hash!==planDigest(plan))bad('HASH',null,'Layout changed');
 for(const n of plan.nodes){
  if(!n.bounds.min.every((v,i)=>Number.isFinite(v)&&Number.isFinite(n.bounds.max[i])&&v<n.bounds.max[i]))bad('BOUNDS',n.id,'Invalid 3D bounds');
  if(!Array.isArray(n.pivot)||n.pivot.length!==3||!n.pivot.every(Number.isFinite)||!inBounds(n.bounds,n.pivot))bad('PIVOT',n.id,'Pivot outside allocation or nonfinite');
  if(!n.attachments?.origin)bad('DOCK',n.id,'Every layer requires named directional docks');
  for(const dock of Object.values(n.attachments??{})){if(!Array.isArray(dock.position)||dock.position.length!==3||!dock.position.every(Number.isFinite)||!inBounds(n.bounds,dock.position)||!Array.isArray(dock.quaternion)||dock.quaternion.length!==4||!dock.quaternion.every(Number.isFinite)||Math.abs(Math.hypot(...dock.quaternion)-1)>1e-7)bad('DOCK',n.id,'Invalid local directional dock');}
  if(!n.localTransform.position.every(Number.isFinite))bad('TRANSFORM',n.id,'Nonfinite position');
  if(n.parentId){const p=map.get(n.parentId);if(!p)bad('PARENT',n.id,'Missing parent');else if(corners(n.bounds).some(c=>!inBounds(p.bounds,point(translation(n.localTransform.position),c))))bad('ALLOCATION',n.id,'Child outside static parent allocation');}
  for(const d of n.details??[]){const size=d.solid.size;if(!plan.materials[d.material]||size.some(v=>!Number.isFinite(v)||v<.01)||!corners({min:size.map(v=>-v/2),max:size.map(v=>v/2)}).every(c=>inBounds(n.bounds,point(translation(d.position),c))))bad('DETAIL',n.id,'Detail must have finite thickness and fit leaf');}
  if(n.kind==='leaf'){
   if(n.id.split('.').length<5)bad('DEPTH',n.id,'Leaf lacks functional hierarchy');
   if(!n.solid||!plan.materials[n.material])bad('SOLID',n.id,'Missing solid/material');
   const dimensions=n.solid?.type==='loft'?n.solid.size:[n.solid?.radius*2,n.solid?.length,n.solid?.radius*2];
   if(!dimensions.every(v=>Number.isFinite(v)&&v>=.04))bad('THICKNESS',n.id,'Non-volume or degenerate solid');
  }
 }
 for(const connection of plan.connections){
  for(const end of [connection.a,connection.b]){const n=map.get(end.nodeId),a=n?.attachments[end.attachmentId];
   if(!a||n.kind!=='leaf')bad('CONTACT',end.nodeId,'Contact must reference leaf attachment');
   else if(!containsSphere(n.solid,a.position,connection.radius))bad('COVERAGE',end.nodeId,connection.id+' sphere outside solid');
  }
 }
 for(const pose of Object.keys(plan.poses)){
  const frame=evaluateRaw(plan,pose);
  for(const n of plan.nodes)if(!frame.byNode[n.id].matrix.every(Number.isFinite))bad('MATRIX',n.id,'Nonfinite pose');
  for(const c of plan.connections)if(c.poses.includes(pose)){
   const world=e=>point(frame.byNode[e.nodeId].matrix,map.get(e.nodeId).attachments[e.attachmentId].position);
   if(distance(world(c.a),world(c.b))>1e-7)bad('DISCONNECTED',c.id,pose+' contact centers separate');
  }
 }
 }catch(e){bad('SCHEMA',null,e.message);}
 if(!errors.length)certify(plan);
 return {ok:!errors.length,errors,hash:plan?.hash??null,summary:plan?.summary??null};
}
