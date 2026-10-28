import {createDesign} from './design.js';
import {add,sub,bounds} from './math.js';
import {authorConnections} from './connections.js';
import {planDigest} from './state.js';
import {freeze} from './hash.js';
export function configureModel(design=createDesign()){
 const nodes=[];
 function allocate(spec,parentId,parentPosition,path){
  const id=path?path+'.'+spec.key:spec.key,restPosition=add(parentPosition,spec.position);
  const node={id,parentId,name:spec.name,purpose:spec.purpose??spec.name,kind:spec.children.length?'group':'leaf',
   localTransform:{position:[...spec.position],quaternion:[0,0,0,1],scale:[1,1,1]},bounds:bounds(spec.size,spec.boundsCenter),pivot:[...spec.pivot],attachments:structuredClone(spec.attachments),
   restPosition,solid:spec.solid?structuredClone(spec.solid):null,material:spec.material??null,style:spec.style??null,details:structuredClone(spec.details??[]),joint:spec.joint??null,rigParent:spec.rigParent??parentId};
  nodes.push(node);for(const child of spec.children)allocate(child,id,restPosition,id);
 }
 allocate(design.root,null,[0,0,0],'');
 const map=new Map(nodes.map(n=>[n.id,n]));
 const rig=nodes.map(n=>({nodeId:n.id,parentId:n.rigParent,position:n.rigParent?sub(n.restPosition,map.get(n.rigParent).restPosition):n.restPosition,pivot:n.pivot,axis:n.joint?.axis??null,limits:n.joint?{min:n.joint.limits[0],max:n.joint.limits[1]}:null}));
 const plan={interfaceVersion:design.version,schema:'heng-yue-model/1',id:design.id,rootId:nodes[0].id,units:'metres',axes:{up:'+Y',front:'+Z',right:'+X'},nodes,rig,materials:structuredClone(design.materials),poses:structuredClone(design.poses),connections:authorConnections(nodes),summary:{nodeCount:nodes.length,leafCount:nodes.filter(n=>n.kind==='leaf').length,maxDepth:Math.max(...nodes.map(n=>n.id.split('.').length-1))}};
 plan.hash=planDigest(plan);return freeze(plan);
}
