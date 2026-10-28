import { createReefHawkDesign } from './design.js';
import { apply, corners, inverse, matrix, mul, pointValid, transformValid } from './math.js';
import { deepFreeze, hashValue } from './hash.js';

export const INTERFACE_VERSION = '1.1.0';
export const SCHEMA_VERSION = 'reef-hawk-assembly/1';
export const GATES = Object.freeze({ maxNodes:260, maxLeaves:160, minLeafDepth:4, maxDepth:16, maxChildren:8, maxBytes:15_000_000 });
export const planDigest = plan => hashValue(Object.fromEntries(Object.entries(plan).filter(([k])=>k!=='hash')));

function fromMatrix(m, pivot) {
  const scaleX=Math.hypot(m[0],m[1]);
  const scaleY=(m[0]*m[3]-m[1]*m[2])/scaleX;
  if (Math.abs(m[0]*m[2]+m[1]*m[3])>1e-6 || scaleX<=0 || scaleY<=0) throw new Error('rig 轉接不可含 shear 或鏡射');
  return {x:m[4]-pivot.x+m[0]*pivot.x+m[2]*pivot.y,y:m[5]-pivot.y+m[1]*pivot.x+m[3]*pivot.y,rotationDeg:Math.atan2(m[1],m[0])*180/Math.PI,scaleX,scaleY};
}

function pass(id) {
  if(id.includes('.equipment.')) return 50;
  if(id.includes('.arm-far.') || id.includes('.leg-far.')) {
    if(id.endsWith('.shoulder.floating-armor.plate')) return 12;
    if(id.endsWith('.shin.armor.plate')) return 13;
    return 10;
  }
  if(id.includes('.torso.back.')) return 20;
  if(id.includes('.torso.')) return 30;
  if(id.includes('.head.')) return 35;
  if(id.endsWith('.shoulder.floating-armor.plate')) return 45;
  if(id.endsWith('.shin.armor.plate')) return 46;
  return 40;
}

export function configureMech(design = createReefHawkDesign()) {
  if(!design?.root || !design.id) throw new Error('Design 必須有 id 與 root');
  const nodes=[], rest=new Map(), active=new Set(), ids=new Set();
  function visit(s,parentId,depth) {
    if(!s || active.has(s) || depth>GATES.maxDepth) throw new Error('Design 循環或過深');
    if(!/^[a-z][a-z0-9-]*$/.test(s.key) || !Array.isArray(s.children)) throw new Error('Design key/children 不合法');
    if(!transformValid(s.localTransform) || !pointValid(s.pivot)) throw new Error('Design 轉換或 pivot 不合法');
    const id=parentId?`${parentId}.${s.key}`:s.key;
    if(ids.has(id)) throw new Error(`Design 重複 id: ${id}`);
    ids.add(id); active.add(s);
    const {key,children,...body}=s;
    const n=structuredClone({...body,id,parentId,kind:children.length?'group':'leaf'});
    nodes.push(n);
    rest.set(id,mul(parentId?rest.get(parentId):[1,0,0,1,0,0],matrix(n.localTransform,n.pivot)));
    for(const child of children) visit(child,id,depth+1);
    active.delete(s);
  }
  visit(design.root,null,0);
  const byId=new Map(nodes.map(n=>[n.id,n]));
  for(const id of Object.keys(design.rigOverrides??{})) if(!byId.has(id)) throw new Error(`未知 rig override: ${id}`);
  const joints=nodes.map(n=>{
    const override=design.rigOverrides?.[n.id]??{};
    const parentId=override.parentId===undefined?n.parentId:override.parentId;
    if(parentId!==null && !byId.has(parentId)) throw new Error(`未知 rig parent: ${parentId}`);
    const local=parentId===n.parentId?n.localTransform:fromMatrix(mul(parentId?inverse(rest.get(parentId)):[1,0,0,1,0,0],rest.get(n.id)),n.pivot);
    return {nodeId:n.id,parentId,localTransform:structuredClone(local),pivot:structuredClone(n.pivot),limits:structuredClone(override.limits??null)};
  });
  let order=0;
  const drawOrder=nodes.filter(n=>n.kind==='leaf').map(n=>({nodeId:n.id,layerKey:[pass(n.id),order++]})).sort((a,b)=>a.layerKey[0]-b.layerKey[0] || a.layerKey[1]-b.layerKey[1]);
  const summary={nodeCount:nodes.length,leafCount:drawOrder.length,maxDepth:Math.max(...nodes.map(n=>n.id.split('.').length-1))};
  const plan={interfaceVersion:INTERFACE_VERSION,schemaVersion:SCHEMA_VERSION,id:design.id,view:structuredClone(design.view),palette:structuredClone(design.palette),rootId:design.root.key,nodes,rig:{joints,links:structuredClone(design.links??[])},connections:structuredClone(design.connections??[]),drawOrder,poses:structuredClone(design.poses??{}),summary};
  plan.hash=planDigest(plan);
  return deepFreeze(plan);
}

// 僅供驗證 bind pose；不評估使用者姿態。
export function bindWorlds(joints,angles={}) {
  const byId=new Map(joints.map(j=>[j.nodeId,j])), result=new Map(), visiting=new Set();
  function visit(id) {
    if(result.has(id)) return result.get(id);
    if(visiting.has(id)) throw new Error('rig 循環');
    const j=byId.get(id);
    if(!j) throw new Error('rig parent 不存在');
    visiting.add(id);
    const m=mul(j.parentId===null?[1,0,0,1,0,0]:visit(j.parentId),matrix(j.localTransform,j.pivot,angles[j.nodeId]??0));
    result.set(id,m); visiting.delete(id); return m;
  }
  joints.forEach(j=>visit(j.nodeId)); return result;
}

export function transformedCorners(node) {
  return corners(node.envelope).map(p=>apply(matrix(node.localTransform,node.pivot),p));
}
