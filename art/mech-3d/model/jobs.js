import {assertValidated} from './state.js';
import {freeze} from './hash.js';
export function createLeafJobs(plan){
 assertValidated(plan);const map=new Map(plan.nodes.map(n=>[n.id,n]));
 return freeze(plan.nodes.filter(n=>n.kind==='leaf').map(n=>{
  const ancestorPath=[];for(let id=n.parentId;id;id=map.get(id).parentId)ancestorPath.unshift(id);
  return {interfaceVersion:plan.interfaceVersion,planHash:plan.hash,nodeId:n.id,name:n.name,purpose:n.purpose,ancestorPath,localBounds:structuredClone(n.bounds),pivot:n.pivot,solid:n.solid,style:n.style,details:n.details.map(d=>({...d,material:{id:d.material,...plan.materials[d.material]}})),material:{id:n.material,...plan.materials[n.material]},attachments:n.attachments,requiredCoverage:plan.connections.filter(c=>c.a.nodeId===n.id||c.b.nodeId===n.id).map(c=>{
   const a=c.a.nodeId===n.id?c.a:c.b,b=c.a.nodeId===n.id?c.b:c.a;return {connectionId:c.id,center:n.attachments[a.attachmentId].position,radius:c.radius,mateNodeId:b.nodeId};
  })};
 }));
}
