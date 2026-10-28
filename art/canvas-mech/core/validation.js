import { GATES, INTERFACE_VERSION, SCHEMA_VERSION, bindWorlds, planDigest, transformedCorners } from './assembly.js';
import { apply, corners, finite, inBounds, matrix, mul, pointValid, transformValid } from './math.js';

const validated = new WeakMap();
const boundsValid = b => b && ['x','y','width','height'].every(k=>finite(b[k])) && b.width>0 && b.height>0;
const textValid = s => typeof s==='string' && s.trim().length>0;
const error = (code,nodeId,message) => ({code,nodeId:nodeId??null,message});

export function assertValidated(plan) {
  if(!plan || !validated.has(plan) || validated.get(plan)!==planDigest(plan)) throw new Error('plan 未驗證、已改動或未經此模組認證');
}

export function validateAssembly(plan) {
  const errors=[];
  const add=(code,id,message)=>errors.push(error(code,id,message));
  if(!plan || !Array.isArray(plan.nodes) || !Array.isArray(plan.rig?.joints) || !Array.isArray(plan.rig?.links) || !Array.isArray(plan.drawOrder)) return {ok:false,errors:[error('schema',null,'缺少 nodes/rig/drawOrder')],summary:null,hash:null};
  validated.delete(plan);
  if(plan.interfaceVersion!==INTERFACE_VERSION || plan.schemaVersion!==SCHEMA_VERSION) add('version',null,'接口或 schema 版本不符');
  if(!textValid(plan.id) || !plan.view || !finite(plan.view.width) || !finite(plan.view.height) || plan.view.width<=0 || plan.view.height<=0) add('view',null,'缺少有效識別或視窗尺寸');
  if(plan.nodes.length>GATES.maxNodes) add('node-gate',null,`節點不得超過 ${GATES.maxNodes}`);
  if(plan.nodes.length===0 || plan.nodes.length>1000) return {ok:false,errors:[...errors,error('nodes',null,'節點空白或超出檢查上限')],summary:null,hash:null};
  const nodes=new Map(), children=new Map();
  let leafCount=0,maxDepth=0;
  for(const n of plan.nodes) {
    if(!n || !textValid(n.id)) {add('node-id',null,'節點缺少 id');continue;}
    if(nodes.has(n.id)) add('duplicate-id',n.id,'節點 id 重複');
    nodes.set(n.id,n); children.set(n.id,[]);
    if(!['group','leaf'].includes(n.kind)) add('kind',n.id,'未知節點種類');
    if(n.kind==='leaf') leafCount++;
    if(!textValid(n.name) || !textValid(n.purpose)) add('purpose',n.id,'每節點必須明列名稱及功能');
    if(!transformValid(n.localTransform)) add('transform',n.id,'轉換須為有限數、縮放為正');
    if(!boundsValid(n.envelope) || !boundsValid(n.usableBounds) || !n.size || !finite(n.size.width) || !finite(n.size.height) || n.size.width<=0 || n.size.height<=0) add('geometry',n.id,'尺寸及兩層包絡必須有效');
    else {
      if(Math.abs(n.size.width-n.envelope.width)>1e-7 || Math.abs(n.size.height-n.envelope.height)>1e-7) add('size',n.id,'尺寸與包絡尺寸不同');
      if(!corners(n.usableBounds).every(p=>inBounds(p,n.envelope))) add('usable-bounds',n.id,'可用包絡超出外包絡');
    }
    if(!pointValid(n.pivot) || (boundsValid(n.envelope) && !inBounds(n.pivot,n.envelope))) add('pivot',n.id,'pivot 不合法或越界');
    if(!n.attachments || typeof n.attachments!=='object' || Array.isArray(n.attachments) || Object.keys(n.attachments).length===0) add('attachments',n.id,'每層都須有具名接點');
    else for(const [key,p] of Object.entries(n.attachments)) if(!textValid(key) || !pointValid(p) || (boundsValid(n.envelope) && !inBounds(p,n.envelope))) add('attachment',n.id,`接點 ${key} 不合法或越界`);
    const mat=plan.palette?.[n.material];
    if(!mat || mat.id!==n.material || !/^#[0-9a-fA-F]{6}$/.test(mat.base) || !textValid(mat.role)) add('material',n.id,'材質未定義');
  }
  if(leafCount>GATES.maxLeaves) add('leaf-gate',null,`有意義葉不得超過 ${GATES.maxLeaves}`);
  const roots=plan.nodes.filter(n=>n?.parentId===null);
  if(roots.length!==1 || roots[0]?.id!==plan.rootId || roots[0]?.kind!=='group') add('root',null,'必須只有一個群組 root');
  for(const n of nodes.values()) {
    if(n.parentId!==null) {
      const parent=nodes.get(n.parentId);
      if(!parent) add('parent',n.id,'語義 parent 不存在');
      else {
        children.get(parent.id).push(n.id);
        if(parent.kind!=='group') add('leaf-parent',n.id,'葉不能有子節點');
        if(boundsValid(n.envelope) && boundsValid(parent.envelope) && pointValid(n.pivot) && transformValid(n.localTransform) && !transformedCorners(n).every(p=>inBounds(p,parent.envelope))) add('envelope-overflow',n.id,'子包絡轉換後超出父配置');
      }
    }
    const seen=new Set(); let cur=n,depth=0;
    while(cur?.parentId!==null && cur) {
      if(seen.has(cur.id)) {add('cycle',n.id,'語義 parent 循環');break;}
      seen.add(cur.id); cur=nodes.get(cur.parentId); depth++;
    }
    maxDepth=Math.max(maxDepth,depth);
    if(depth>GATES.maxDepth) add('depth-gate',n.id,'語義樹過深');
    if(n.kind==='leaf' && depth<GATES.minLeafDepth) add('flat-leaf',n.id,'葉必須經過功能分層，不能直接攤平');
    if(cur && cur.id!==plan.rootId) add('disconnected',n.id,'未連到唯一 root');
  }
  for(const [id,list] of children) {
    const n=nodes.get(id);
    if(n.kind==='group' && list.length===0) add('empty-group',id,'群組必須有實際功能子件');
    if(list.length>GATES.maxChildren) add('flat-group',id,'同層子件超過分組上限');
  }
  const joints=new Map();
  for(const j of plan.rig.joints) {
    if(!j || !nodes.has(j.nodeId) || joints.has(j.nodeId)) {add('rig-node',j?.nodeId,'rig 缺節點或重複');continue;}
    joints.set(j.nodeId,j);
    if(!transformValid(j.localTransform) || !pointValid(j.pivot) || !inBounds(j.pivot,nodes.get(j.nodeId).envelope??{})) add('rig-transform',j.nodeId,'rig 轉換或 pivot 不合法');
    const node=nodes.get(j.nodeId);
    if(pointValid(node.pivot) && pointValid(j.pivot) && (node.pivot.x!==j.pivot.x || node.pivot.y!==j.pivot.y)) add('rig-pivot',j.nodeId,'rig 與節點 pivot 不符');
    if(j.limits!==null && (!j.limits || !finite(j.limits.min) || !finite(j.limits.max) || j.limits.min>0 || j.limits.max<0 || j.limits.min>=j.limits.max)) add('rig-limits',j.nodeId,'角度界限須含靜止 0 度');
    if((j.parentId===null)!==(j.nodeId===plan.rootId)) add('rig-root',j.nodeId,'rig 必須與語義樹共用 root');
  }
  for(const id of nodes.keys()) if(!joints.has(id)) add('rig-missing',id,'節點缺少 rig 映射');
  for(const j of joints.values()) if(j.parentId!==null && !joints.has(j.parentId)) add('rig-parent',j.nodeId,'rig parent 不存在');
  let worlds;
  if(!errors.some(e=>e.code.startsWith('rig-') || ['transform','pivot','geometry'].includes(e.code))) {
    try {worlds=bindWorlds(plan.rig.joints);} catch(e) {add('rig-cycle',null,e.message);}
  }
  if(worlds && !errors.some(e=>['cycle','parent','root','disconnected'].includes(e.code))) {
    const semantic=new Map();
    const visit=n=>{
      if(semantic.has(n.id)) return semantic.get(n.id);
      const m=mul(n.parentId===null?[1,0,0,1,0,0]:visit(nodes.get(n.parentId)),matrix(n.localTransform,n.pivot));
      semantic.set(n.id,m); return m;
    };
    for(const n of nodes.values()) if(visit(n).some((v,i)=>Math.abs(v-worlds.get(n.id)[i])>1e-6)) add('rig-bind',n.id,'rig bind world 與 top-down 配置不同');
  }
  const linked=new Set();
  for(const l of plan.rig.links) {
    const node=nodes.get(l?.nodeId);
    if(!l || !node || node.kind!=='leaf' || linked.has(l.nodeId) || !finite(l.restLength) || l.restLength<=0) {add('link',l?.nodeId,'連桿葉、長度或唯一性不合法');continue;}
    linked.add(l.nodeId);
    if(Math.abs(l.restLength-node.size?.width)>1e-6) add('link-geometry',l.nodeId,'連桿 x 軸包絡寬須等於基準長度');
    for(const end of [l.start,l.end]) if(!end || !nodes.get(end.nodeId)?.attachments?.[end.attachmentId]) add('link-endpoint',l.nodeId,'連桿端點不存在');
    if(worlds && [l.start,l.end].every(e=>e && nodes.get(e.nodeId)?.attachments?.[e.attachmentId])) {
      const start=apply(worlds.get(l.start.nodeId),nodes.get(l.start.nodeId).attachments[l.start.attachmentId]);
      const end=apply(worlds.get(l.end.nodeId),nodes.get(l.end.nodeId).attachments[l.end.attachmentId]);
      const scale=Math.hypot(worlds.get(l.nodeId)[0],worlds.get(l.nodeId)[1]);
      if(Math.abs(Math.hypot(end.x-start.x,end.y-start.y)-l.restLength*scale)>1e-6) add('link-length',l.nodeId,'連桿局部基準長度乘世界縮放後與端點距離不符');
      const left=apply(worlds.get(l.nodeId),{x:-l.restLength/2,y:0}),right=apply(worlds.get(l.nodeId),{x:l.restLength/2,y:0});
      if(Math.hypot(left.x-start.x,left.y-start.y)>1e-6 || Math.hypot(right.x-end.x,right.y-end.y)>1e-6) add('link-bind',l.nodeId,'連桿靜止幾何未對齊兩端點');
    }
  }
  for(const l of plan.rig.links) if(l && [l.start,l.end].some(e=>linked.has(e?.nodeId))) add('link-dependency',l.nodeId,'連桿端點不可依賴其他連桿');
  const drawn=new Set(),layers=new Set();let previous=null;
  for(const d of plan.drawOrder) {
    if(!d || nodes.get(d.nodeId)?.kind!=='leaf' || drawn.has(d.nodeId)) {add('draw-map',d?.nodeId,'畫序必須逐葉一對一');continue;}
    drawn.add(d.nodeId);
    if(!Array.isArray(d.layerKey) || d.layerKey.length!==2 || !d.layerKey.every(Number.isInteger)) add('layer-key',d.nodeId,'畫序鍵須為整數二元組');
    else {
      const key=d.layerKey.join(':');
      if(layers.has(key)) add('layer-duplicate',d.nodeId,'畫序鍵重複');layers.add(key);
      if(previous && (d.layerKey[0]<previous[0] || (d.layerKey[0]===previous[0] && d.layerKey[1]<=previous[1]))) add('draw-sort',d.nodeId,'畫序非嚴格升冪');
      previous=d.layerKey;
    }
  }
  for(const n of nodes.values()) if(n.kind==='leaf' && !drawn.has(n.id)) add('draw-missing',n.id,'葉缺少畫序');
  if(!plan.poses || typeof plan.poses!=='object' || Array.isArray(plan.poses) || Object.keys(plan.poses).length===0) add('poses',null,'缺少姿態');
  else for(const [id,p] of Object.entries(plan.poses)) {
    if(!p || p.id!==id || !p.angles || typeof p.angles!=='object' || Array.isArray(p.angles)) {add('pose',id,'姿態欄位不完整');continue;}
    for(const [nodeId,angle] of Object.entries(p.angles)) {
      const j=joints.get(nodeId);
      if(!finite(angle) || !j?.limits || angle<j.limits.min || angle>j.limits.max) add('pose-angle',nodeId,'姿態節點或角度不合法');
    }
  }
  if(!Array.isArray(plan.connections) || plan.connections.length===0) add('contacts',null,'1.1 配置必須明列承力接合與覆蓋');
  else if(errors.length===0) {
    const states=new Map(Object.entries(plan.poses).map(([id,p])=>[id,bindWorlds(plan.rig.joints,p.angles)]));
    const seen=new Set();
    for(const c of plan.connections) {
      if(!c || !textValid(c.id) || seen.has(c.id)) {add('contact-id',null,'接合識別缺少或重複');continue;}
      seen.add(c.id);
      if(!finite(c.radius) || c.radius<=0 || !finite(c.tolerance) || c.tolerance<0 || c.tolerance>0.5 || !Array.isArray(c.poses) || !['idle','shield-aim','low-brace'].every(id=>c.poses.includes(id)) || c.poses.some(id=>!states.has(id))) {add('contact-contract',c.id,'接觸半徑/容差/三姿態範圍不合法');continue;}
      let valid=true;
      for(const endpoint of [c.a,c.b]) {
        const n=nodes.get(endpoint?.nodeId),p=n?.attachments?.[endpoint?.attachmentId];
        if(!n || n.kind!=='leaf' || !pointValid(p)) {add('contact-endpoint',c.id,'接觸端必須是有具名接點的實際葉');valid=false;continue;}
        const r=endpoint.coverageRadius,b=n.envelope;
        if(!finite(r) || r<=0 || p.x-r<b.x-1e-6 || p.x+r>b.x+b.width+1e-6 || p.y-r<b.y-1e-6 || p.y+r>b.y+b.height+1e-6) {add('contact-coverage',n.id,`接合 ${c.id} 的必要覆蓋圓盤超出葉包絡`);valid=false;}
        const m=worlds.get(n.id),scale=Math.min(Math.hypot(m[0],m[1]),Math.hypot(m[2],m[3]));
        if(finite(r) && r*scale<c.radius-1e-6) {add('contact-radius',n.id,'縮放後的覆蓋區小於接合要求');valid=false;}
      }
      if(!valid) continue;
      for(const poseId of c.poses) {
        const matrices=states.get(poseId);
        const a=apply(matrices.get(c.a.nodeId),nodes.get(c.a.nodeId).attachments[c.a.attachmentId]);
        const b=apply(matrices.get(c.b.nodeId),nodes.get(c.b.nodeId).attachments[c.b.attachmentId]);
        if(Math.hypot(a.x-b.x,a.y-b.y)>c.tolerance+1e-7) add('contact-gap',c.id,`${poseId} 的實際承力接點不同位`);
      }
    }
  }
  const summary={nodeCount:plan.nodes.length,leafCount,maxDepth};
  if(!plan.summary || Object.keys(summary).some(k=>summary[k]!==plan.summary[k])) add('summary',null,'摘要與實際樹不同');
  let hash=null;
  try {hash=planDigest(plan);if(plan.hash!==hash) add('hash',null,'配置 SHA-256 不符');} catch {add('json',null,'配置不是可雜湊 JSON');}
  if(errors.length===0) validated.set(plan,hash);
  return {ok:errors.length===0,errors,summary,hash};
}
