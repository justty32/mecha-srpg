import { assertValidated } from './validation.js';
import { evaluatePose } from './rig.js';
import { deepFreeze } from './hash.js';
import { INTERFACE_VERSION } from './assembly.js';

const overlap=(a,b)=>a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;
export function createLeafJobs(plan) {
  assertValidated(plan);
  const nodes=new Map(plan.nodes.map(n=>[n.id,n]));
  const joints=new Map(plan.rig.joints.map(j=>[j.nodeId,j]));
  const links=new Map(plan.rig.links.map(l=>[l.nodeId,l]));
  const rest=evaluatePose(plan,{id:'bind',angles:{}});
  function chain(id,map,key) {
    const result=[];
    for(let current=id; current!==null; current=map.get(current)[key]) result.unshift(current);
    return result;
  }
  return deepFreeze(plan.drawOrder.map((d,i)=>{
    const n=nodes.get(d.nodeId),j=joints.get(n.id);
    const occludedBy=plan.drawOrder.slice(i+1).filter(later=>overlap(rest.byNode[n.id].worldBounds,rest.byNode[later.nodeId].worldBounds)).map(later=>later.nodeId);
    return {
      interfaceVersion:INTERFACE_VERSION,planHash:plan.hash,nodeId:n.id,name:n.name,purpose:n.purpose,
      ancestorPath:chain(n.id,nodes,'parentId').slice(0,-1),rigChain:chain(n.id,joints,'parentId'),rigParentId:j.parentId,
      localTransform:structuredClone(n.localTransform),localGeometry:{bounds:structuredClone(n.envelope),usableBounds:structuredClone(n.usableBounds),size:structuredClone(n.size),linkRestLength:links.get(n.id)?.restLength??null},
      material:structuredClone(plan.palette[n.material]),occlusion:{occludedBy,clipToEnvelope:false},attachments:structuredClone(n.attachments),pivot:structuredClone(n.pivot),layerKey:[...d.layerKey],restWorldMatrix:[...rest.byNode[n.id].worldMatrix],
      requiredCoverage:plan.connections.filter(c=>c.a.nodeId===n.id || c.b.nodeId===n.id).map(c=>{
        const endpoint=c.a.nodeId===n.id?c.a:c.b,mate=c.a.nodeId===n.id?c.b:c.a;
        return {connectionId:c.id,attachmentId:endpoint.attachmentId,center:structuredClone(n.attachments[endpoint.attachmentId]),radius:endpoint.coverageRadius,mateNodeId:mate.nodeId};
      }),
    };
  }));
}
