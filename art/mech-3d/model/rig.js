import {identity,translation,rotation,multiply,point} from './math.js';
import {assertValidated} from './state.js';
export function evaluateRaw(plan,pose='idle'){
 const angles=typeof pose==='string'?plan.poses[pose]:pose.angles;
 if(!angles)throw Error('Unknown pose');
 const joints=new Map(plan.rig.map(j=>[j.nodeId,j]));
 for(const [id,a] of Object.entries(angles)){const j=joints.get(id);if(!j?.limits||!Number.isFinite(a)||a<j.limits.min||a>j.limits.max)throw Error('Invalid joint angle '+id);}
 const byNode={},visiting=new Set();
 const evaluate=id=>{
  if(byNode[id])return byNode[id];if(visiting.has(id))throw Error('Rig cycle');visiting.add(id);
  const j=joints.get(id);if(!j)throw Error('Missing rig node '+id);
  const parent=j.parentId?evaluate(j.parentId).matrix:identity();
  const local=multiply(translation(j.position),multiply(translation(j.pivot),multiply(rotation(j.axis,angles[id]??0),translation(j.pivot.map(v=>-v)))));
  const matrix=multiply(parent,local);byNode[id]={matrix,worldPivot:point(matrix,j.pivot)};visiting.delete(id);return byNode[id];
 };
 for(const n of plan.nodes)evaluate(n.id);
 return {interfaceVersion:plan.interfaceVersion,planHash:plan.hash,poseId:typeof pose==='string'?pose:pose.id,byNode};
}
export function evaluatePose(plan,pose='idle'){assertValidated(plan);return evaluateRaw(plan,pose);}
