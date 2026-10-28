import { assertValidated } from './validation.js';
import { INTERFACE_VERSION } from './assembly.js';
import { apply, finite, matrix, mul, worldBounds } from './math.js';
import { deepFreeze } from './hash.js';

export function evaluatePose(plan, pose = 'idle') {
  assertValidated(plan);
  const selected=typeof pose==='string'?plan.poses[pose]:pose;
  if(!selected || typeof selected.id!=='string' || !selected.angles || typeof selected.angles!=='object' || Array.isArray(selected.angles)) throw new Error('姿態不存在或欄位不完整');
  const joints=new Map(plan.rig.joints.map(j=>[j.nodeId,j]));
  const nodes=new Map(plan.nodes.map(n=>[n.id,n]));
  for(const [id,angle] of Object.entries(selected.angles)) {
    const j=joints.get(id);
    if(!finite(angle) || !j?.limits || angle<j.limits.min || angle>j.limits.max) throw new Error(`姿態關節或角度不合法: ${id}`);
  }
  const worlds=new Map();
  function world(id) {
    if(worlds.has(id)) return worlds.get(id);
    const j=joints.get(id);
    const m=mul(j.parentId===null?[1,0,0,1,0,0]:world(j.parentId),matrix(j.localTransform,j.pivot,selected.angles[id]??0));
    worlds.set(id,m);return m;
  }
  plan.rig.joints.forEach(j=>world(j.nodeId));
  const linkages=new Map();
  for(const l of plan.rig.links) {
    const start=apply(worlds.get(l.start.nodeId),nodes.get(l.start.nodeId).attachments[l.start.attachmentId]);
    const end=apply(worlds.get(l.end.nodeId),nodes.get(l.end.nodeId).attachments[l.end.attachmentId]);
    const dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy);
    if(length<1e-7) throw new Error(`連桿端點重合: ${l.nodeId}`);
    const c=dx/length,s=dy/length,scale=length/l.restLength;
    const normalScale=Math.hypot(worlds.get(l.nodeId)[2],worlds.get(l.nodeId)[3]);
    worlds.set(l.nodeId,[c*scale,s*scale,-s*normalScale,c*normalScale,(start.x+end.x)/2,(start.y+end.y)/2]);
    linkages.set(l.nodeId,{start,end,length,angleDeg:Math.atan2(dy,dx)*180/Math.PI});
  }
  const byNode=Object.fromEntries(plan.nodes.map(n=>{
    const m=worlds.get(n.id);
    return [n.id,{worldMatrix:m,worldBounds:worldBounds(m,n.envelope),worldPivot:apply(m,n.pivot),attachments:Object.fromEntries(Object.entries(n.attachments).map(([key,p])=>[key,apply(m,p)])),rotationDeltaDeg:selected.angles[n.id]??0,linkage:linkages.get(n.id)??null}];
  }));
  return deepFreeze({interfaceVersion:INTERFACE_VERSION,planHash:plan.hash,poseId:selected.id,byNode,drawOrder:plan.drawOrder});
}
