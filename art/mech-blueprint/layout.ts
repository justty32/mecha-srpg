import type { Attachment, Blueprint, Design, Diagnostic, LayoutData, LayoutNode, Matrix, OverlapIntent, OverlapRule, Region, Vec2, WorkOrder, WorkOrdersData } from './schema.ts';
import { frameMatrix, inverse, multiply, sampleTransition, slotMatrices, transformPoint, worldMatrices } from './rig.ts';
import { assertConvex, bounds, convexHull, expandRegion, regionArea, regionDifference, regionIntersection, transformRegion } from './geometry.ts';
import { createHash } from 'node:crypto';

export type LayoutResult={layout:LayoutData;workOrders:WorkOrdersData;diagnostics:Diagnostic[];svg:string;workOrdersSvg:string};
const failure=(code:string,message:string,ids:string[],region?:Region):Diagnostic=>({code,severity:'error',message,ids,...(region?{region}:{})});
function duplicates(ids:string[],kind:string):Diagnostic[] {
  const seen=new Set<string>(),out:Diagnostic[]=[];
  for(const id of ids){if(!id||seen.has(id))out.push(failure('duplicate-id',`Invalid or duplicate ${kind}: ${id}`,[id]));seen.add(id);}return out;
}
export function validateOrder(blueprint:Blueprint):Diagnostic[] {
  const {slots:{slots},order}=blueprint,out=duplicates(order.base,'draw order slot'),expected=new Set(slots.map(s=>s.id));
  for(const id of order.base)if(!expected.has(id))out.push(failure('unknown-order-slot',`Unknown slot in draw order: ${id}`,[id]));
  for(const id of expected)if(!order.base.includes(id))out.push(failure('missing-order-slot',`Slot missing from draw order: ${id}`,[id]));
  const edges=new Map<string,string[]>();
  for(const [a,b]of order.before){if(!expected.has(a)||!expected.has(b))out.push(failure('unknown-order-constraint','Unknown before constraint',[a,b]));
    if(order.base.indexOf(a)>=order.base.indexOf(b))out.push(failure('draw-order','before constraint violated',[a,b]));edges.set(a,[...(edges.get(a)??[]),b]);}
  const visiting=new Set<string>(),done=new Set<string>();
  function visit(id:string):void {if(visiting.has(id))throw new Error(id);if(done.has(id))return;visiting.add(id);for(const child of edges.get(id)??[])visit(child);visiting.delete(id);done.add(id);}
  try{for(const id of expected)visit(id);}catch(e){out.push(failure('order-cycle',`Draw order cycle: ${String(e)}`,[]));}return out;
}
export function buildLayout(blueprint:Blueprint):LayoutResult {
  const {rig,slots:{slots}}=blueprint,design=allocateDesign(blueprint.design,rig.bones),diagnostics:Diagnostic[]=[...validateOrder(blueprint)];
  diagnostics.push(...duplicates(design.nodes.map(n=>n.id),'layout'),...duplicates(slots.map(s=>s.id),'slot'),...duplicates(design.parts.map(p=>p.id),'part'));
  let worlds:Record<string,Matrix>={},slotWorld:Record<string,Matrix>={};
  try{worlds=worldMatrices(rig.bones);slotWorld=slotMatrices(slots,worlds);}catch(e){diagnostics.push(failure('rig',String(e),[]));}
  const nodes=new Map(design.nodes.map(n=>[n.id,n])),nodeWorld:Record<string,Matrix>={},visited=new Set<string>(),visiting=new Set<string>();
  const levels=['machine','major','assembly','part'];
  function visit(id:string):void {
    if(visited.has(id))return;if(visiting.has(id))throw new Error(`Layout cycle: ${id}`);
    const n=nodes.get(id);if(!n)throw new Error(`Unknown layout parent: ${id}`);visiting.add(id);
    if(n.parent!==null)visit(n.parent);
    try{
      if(!n.envelope.length)throw new Error('Empty envelope');for(const p of n.envelope)assertConvex(p);
      nodeWorld[id]=frameMatrix(n.frame,worlds);
      if(n.parent!==null){const parent=nodes.get(n.parent)!;
        if(levels.indexOf(n.level)!==levels.indexOf(parent.level)+1)diagnostics.push(failure('layout-level','Layout must descend machine → major → assembly → part',[id,n.parent]));
        const local=transformRegion(n.envelope,multiply(inverse(nodeWorld[n.parent]!),nodeWorld[id]!));
        const outside=regionDifference(local,parent.envelope);if(regionArea(outside)>1e-5)diagnostics.push(failure('parent-envelope','Child envelope extends outside parent union',[id,n.parent],transformRegion(outside,nodeWorld[n.parent]!)));}
      diagnostics.push(...duplicates(n.sockets.map(s=>s.id),`socket in ${id}`));
      for(const s of n.sockets)if(!s.at.every(Number.isFinite)||!Number.isFinite(s.axis))diagnostics.push(failure('socket','Invalid socket',[id,s.id]));
    }catch(e){diagnostics.push(failure('layout-geometry',`${id}: ${String(e)}`,[id]));}
    visiting.delete(id);visited.add(id);
  }
  try{for(const n of design.nodes)visit(n.id);}catch(e){diagnostics.push(failure('layout-tree',String(e),[]));}
  const orders:WorkOrder[]=[],usedSlots=new Set<string>(),usedLayouts=new Set<string>();
  for(const p of design.parts) {
    const node=nodes.get(p.layout),slot=slots.find(s=>s.id===p.slot);
    if(!node||node.level!=='part'||!slot||slot.attachment!==p.id||!nodeWorld[p.layout]||!slotWorld[p.slot]){diagnostics.push(failure('part-reference','Part requires one leaf layout, valid slot and matching attachment',[p.id,p.layout,p.slot]));continue;}
    if(usedSlots.has(slot.id)||usedLayouts.has(node.id))diagnostics.push(failure('part-duplicate','Parts must own unique slots and leaf layouts',[p.id,slot.id,node.id]));
    usedSlots.add(slot.id);usedLayouts.add(node.id);
    const toLocal=multiply(inverse(slotWorld[p.slot]!),nodeWorld[p.layout]!);
    const localEnvelope=transformRegion(node.envelope,toLocal),contacts=node.sockets.map(s=>transformPoint(toLocal,s.at));
    for(const socket of node.sockets)if(socket.targetBone||socket.targetAt){
      const target=socket.targetBone?worlds[socket.targetBone]:undefined;
      if(!target||!socket.targetAt){diagnostics.push(failure('socket-target','Socket must identify a valid target bone and local point',[p.id,socket.id]));continue;}
      const expected=transformPoint(target,socket.targetAt),actual=transformPoint(nodeWorld[p.layout]!,socket.at);
      if(Math.hypot(actual[0]-expected[0],actual[1]-expected[1])>1)diagnostics.push(failure('socket-target','Socket is more than 1 unit from its target bone point',[p.id,socket.id,socket.targetBone!]));
    }
    if(localEnvelope.every(poly=>poly.length===4&&poly.every((a,i)=>{const b=poly[(i+1)%4]!;return Math.abs(a[0]-b[0])<1e-6||Math.abs(a[1]-b[1])<1e-6;})))diagnostics.push(failure('rectangle-part','Part needs a meaningful nonrectangular silhouette',[p.id]));
    try{for(const region of p.keepOut)assertConvex(region);}catch(e){diagnostics.push(failure('keepout',String(e),[p.id]));}
    if(!p.source.endsWith(`/${p.id}.svg`)||!p.element)diagnostics.push(failure('source','Each attachment must own an SVG named by its ID',[p.id]));
    const [x,y,w,h]=bounds(localEnvelope),padding=4;
    orders.push({id:p.id,revision:design.revision,layout:node.id,slot:slot.id,localEnvelope,keepOut:p.keepOut,contacts,
      viewBox:[Math.floor(x-padding),Math.floor(y-padding),Math.ceil(w+padding*2),Math.ceil(h+padding*2)],
      role:p.role,material:p.material,silhouette:p.silhouette,source:p.source,element:p.element,
      frame:{bone:slot.bone,transform:slot.local},sockets:node.sockets.map((s,i)=>({...s,at:contacts[i]!}))});
  }
  for(const slot of slots)if(!usedSlots.has(slot.id))diagnostics.push(failure('missing-part','Slot lacks a work order',[slot.id]));
  for(const node of design.nodes)if(node.level==='part'&&!usedLayouts.has(node.id))diagnostics.push(failure('missing-part','Leaf layout lacks a work order',[node.id]));
  const poseReports=new Set<string>(),canvas:Region=[[[0,0],[design.canvas.width,0],[design.canvas.width,design.canvas.height],[0,design.canvas.height]]];
  for(const pose of blueprint.poses.poses){
    const bind=blueprint.poses.poses.find(p=>p.id==='bind')??{id:'bind',angles:{}};
    for(const [sample,sampled]of (pose.id==='bind'?[pose]:sampleTransition(bind,pose)).entries())try{
      const sampledWorld=worldMatrices(rig.bones,sampled),sampledSlots=slotMatrices(slots,sampledWorld);
      for(const order of orders){
        const outside=regionDifference(transformRegion(order.localEnvelope,sampledSlots[order.slot]!),canvas),key=`${pose.id}:${order.id}`;
        if(regionArea(outside)>1e-5&&!poseReports.has(key)){diagnostics.push({...failure('layout-canvas','Allocated part leaves canvas along sampled motion',[order.id],outside),pose:pose.id,sample});poseReports.add(key);}
        for(const s of order.sockets)if(s.targetBone&&s.targetAt){const p=transformPoint(sampledSlots[order.slot]!,s.at),q=transformPoint(sampledWorld[s.targetBone]!,s.targetAt),socketKey=key+':'+s.id;
          if(Math.hypot(p[0]-q[0],p[1]-q[1])>1&&!poseReports.has(socketKey)){diagnostics.push({...failure('moving-socket','Cross-bone socket drifts more than 1 unit',[order.id,s.id,s.targetBone]),pose:pose.id,sample});poseReports.add(socketKey);}}
      }
    }catch(e){const key='limits:'+pose.id;if(!poseReports.has(key)){diagnostics.push({...failure('pose-rig',String(e),[]),pose:pose.id,sample});poseReports.add(key);}}
  }
  const sourceHash=createHash('sha256').update(canonical(blueprint)).digest('hex');
  const layout:LayoutData={version:design.version,revision:design.revision,sourceHash,canvas:design.canvas,nodes:design.nodes};
  const workOrders:WorkOrdersData={version:design.version,revision:design.revision,sourceHash,orders};
  const colors={machine:'#64748b',major:'#3b82f6',assembly:'#10b981',part:'#eab308'};
  const paths=design.nodes.filter(n=>nodeWorld[n.id]).map(n=>{const r=transformRegion(n.envelope,nodeWorld[n.id]!);return `<g id="layout-${escapeXml(n.id)}" fill="${colors[n.level]}" fill-opacity="${n.level==='part'?'.2':'.025'}" stroke="${colors[n.level]}" stroke-width="${n.level==='part'?1:2}">${r.map(p=>`<polygon points="${p.map(v=>v.join(',')).join(' ')}"/>`).join('')}<title>${escapeXml(n.id)}</title></g>`;}).join('\n');
  const boneOverlay=rig.bones.filter(b=>worlds[b.id]).map(b=>{const p=transformPoint(worlds[b.id]!,[0,0]),parent=b.parent&&worlds[b.parent]?transformPoint(worlds[b.parent]!,[0,0]):p;return `<g fill="#f472b6" stroke="#f472b6"><line x1="${parent[0]}" y1="${parent[1]}" x2="${p[0]}" y2="${p[1]}" stroke-width="1.5"/><circle cx="${p[0]}" cy="${p[1]}" r="4"/><text x="${p[0]+6}" y="${p[1]-7}" font-size="9" stroke="none">${escapeXml(b.id)} (${p.map(n=>Math.round(n)).join(',')})</text></g>`;}).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${design.canvas.width} ${design.canvas.height}"><rect width="100%" height="100%" fill="#0c1423"/>${paths}<g id="bone-chain-overlay">${boneOverlay}</g></svg>\n`;
  const tileWidth=240,tileHeight=250;
  const tiles=orders.map((o,i)=>{
    const [x,y,w,h]=o.viewBox,scale=Math.min(200/w,175/h),tx=20-x*scale,ty=38-y*scale;
    const shapes=(r:Region,fill:string,stroke:string)=>r.map(p=>`<polygon points="${p.map(v=>v.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${1/scale}"/>`).join('');
    return `<g transform="translate(${i%8*tileWidth},${Math.floor(i/8)*tileHeight})"><rect x="2" y="2" width="236" height="246" fill="#111e31" stroke="#334155"/><text x="12" y="20" fill="#f8fafc" font-size="10">${escapeXml(o.id)}</text><g transform="translate(${tx},${ty}) scale(${scale})">${shapes(o.localEnvelope,'#36526b','#67e8f9')}${shapes(o.keepOut,'#991b1b','#ef4444')}<path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="#fbbf24" stroke-width="${1.5/scale}"/>${o.contacts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${3/scale}" fill="#f472b6"/>`).join('')}</g><text x="12" y="231" fill="#94a3b8" font-size="9">${escapeXml(o.frame.bone)} · ${escapeXml(o.revision)}</text></g>`;
  }).join('\n');
  const workOrdersSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${8*tileWidth} ${Math.ceil(orders.length/8)*tileHeight}"><rect width="100%" height="100%" fill="#07111e"/>${tiles}</svg>\n`;
  return {layout,workOrders,diagnostics,svg,workOrdersSvg};
}
/** 先定大部位走廊，再計機構局部輪廓，最後將正規化外形分配到部件。 */
export function allocateDesign(source:Design,bones:Blueprint['rig']['bones']):Design {
  if(!source.allocation)return source;
  const a=source.allocation,worlds=worldMatrices(bones),root=bones.find(b=>b.parent===null);
  if(!root)throw new Error('Allocation requires root bone');
  const rootInverse=inverse(worlds[root.id]!),zero={x:0,y:0,rotation:0};
  const profile=(p:Vec2[],box:[number,number,number,number]):Region=>[p.map(v=>[box[0]+v[0]*box[2],box[1]+v[1]*box[3]] as Vec2)];
  const machine:Region=[[[90,70],[910,70],[945,340],[860,1135],[140,1135],[55,340]]];
  const nodes:LayoutNode[]=[{id:'machine',parent:null,level:'machine',frame:{bone:root.id,transform:zero},envelope:transformRegion(machine,rootInverse),sockets:[]}];
  for(const major of a.majors)nodes.push({id:major.id,parent:'machine',level:'major',frame:{bone:root.id,transform:zero},envelope:transformRegion(major.region,rootInverse),sockets:[]});
  for(const assembly of a.assemblies)nodes.push({id:assembly.id,parent:assembly.major,level:'assembly',frame:{bone:assembly.bone,transform:zero},envelope:[...profile(assembly.profile,assembly.bounds),...(assembly.extensions??[])],sockets:[{id:'pivot',at:[0,0],axis:90}]});
  for(const leaf of a.leaves)nodes.push({id:leaf.id,parent:leaf.assembly,level:'part',frame:{bone:leaf.bone,transform:zero},envelope:[...profile(leaf.profile,leaf.bounds),...(leaf.extensions??[])],sockets:leaf.sockets??[{id:'mount',at:leaf.contact,axis:90}]});
  return {...source,nodes};
}
function canonical(value:unknown):string {
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value!==null&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
  return JSON.stringify(value);
}
const escapeXml=(s:string):string=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));

export function validateAttachmentGeometry(attachment:Attachment,order:WorkOrder,actual:Region):Diagnostic[] {
  const out:Diagnostic[]=[];
  if(attachment.workOrderRevision!==order.revision)out.push(failure('work-order-revision','Attachment was not made for the current work order revision',[attachment.id]));
  for(const p of attachment.occupancy)try{assertConvex(p);}catch(e){out.push(failure('occupancy',String(e),[attachment.id]));}
  if(attachment.id!==order.id||attachment.layout!==order.layout||attachment.source!==order.source||attachment.element!==order.element)out.push(failure('attachment-reference','Attachment differs from its work order',[attachment.id]));
  if(JSON.stringify(attachment.viewBox)!==JSON.stringify(order.viewBox))out.push(failure('viewbox','Attachment viewBox differs from work order',[attachment.id]));
  const outside=regionDifference(actual,expandRegion(order.localEnvelope,2));
  if(regionArea(outside)>1e-5)out.push(failure('art-envelope','Actual SVG geometry exceeds work envelope',[attachment.id],outside));
  const unreported=regionDifference(actual,expandRegion(attachment.occupancy,.75));
  if(regionArea(unreported)>1e-5)out.push(failure('occupancy-underreport','Actual SVG geometry extends beyond reported occupancy',[attachment.id],unreported));
  const blocked=regionIntersection(actual,order.keepOut);
  if(regionArea(blocked)>1e-5)out.push(failure('keepout','Actual SVG geometry intrudes into keepOut',[attachment.id],blocked));
  if(attachment.contacts.length!==order.sockets.length)out.push(failure('contacts','Attachment must declare every work order socket',[attachment.id]));
  for(const s of order.sockets){const matches=attachment.contacts.filter(c=>c.socket===s.id),c=matches[0];
    if(matches.length!==1||!c||Math.hypot(c.at[0]-s.at[0],c.at[1]-s.at[1])>1)out.push(failure('contact-alignment',`Socket ${s.id} mismatch exceeds 1 unit`,[attachment.id,s.id]));}
  return out;
}
export function allowedOverlap(intersection:Region,a:string,b:string,pose:string,rules:OverlapRule[],worlds:Record<string,Matrix>):Region {
  let unexplained=intersection;
  for(const rule of rules)if(((rule.a===a&&rule.b===b)||(rule.a===b&&rule.b===a))&&rule.poses.includes(pose)&&rule.reason.trim()) {
    unexplained=regionDifference(unexplained,transformRegion(rule.zone.region,frameMatrix(rule.zone.frame,worlds)));
  }
  return unexplained;
}
/** 只重建明列機構意圖的有界zone；不得由actual碰撞建立新pair。 */
export function planOverlapRules(blueprint:Blueprint,intents:OverlapIntent[]):OverlapRule[] {
  const orders=new Map(buildLayout(blueprint).workOrders.orders.map(o=>[o.id,o])),seen=new Set<string>(),rules:OverlapRule[]=[];
  const bind=blueprint.poses.poses.find(p=>p.id==='bind')??{id:'bind',angles:{}};
  const poses=blueprint.poses.poses.map(pose=>({pose,samples:(pose.id==='bind'?[pose]:sampleTransition(bind,pose)).map(p=>{
    const worlds=worldMatrices(blueprint.rig.bones,p);return {worlds,slots:slotMatrices(blueprint.slots.slots,worlds)};
  })}));
  for(const intent of intents){
    const key=[intent.a,intent.b].sort().join('|'),a=orders.get(intent.a),b=orders.get(intent.b);
    if(!a||!b||a===b||seen.has(key)||!intent.reason.trim())throw new Error(`Invalid explicit overlap intent: ${key}`);
    seen.add(key);
    const ar=intent.regionA??a.localEnvelope,br=intent.regionB??b.localEnvelope;
    for(const p of [...ar,...br])assertConvex(p);
    const expandedA=expandRegion(ar,2),expandedB=expandRegion(br,2);
    for(const {pose,samples}of poses){
      const points:Vec2[]=[];
      for(const sample of samples){
        // a包絡已在a.frame；只把b轉到a局部，免交集走世界再逆轉造成排序雜訊。
        const relative=multiply(inverse(frameMatrix(a.frame,sample.worlds)),sample.slots[b.slot]!);
        const intersection=regionIntersection(expandedA,transformRegion(expandedB,relative));
        if(regionArea(intersection)>1e-5)points.push(...intersection.flat());
      }
      if(points.length)rules.push({id:`zone-${a.id}--${b.id}--${pose.id}`,a:a.id,b:b.id,kind:intent.kind,reason:intent.reason,
        zone:{frame:a.frame,region:[convexHull(points)]},poses:[pose.id]});
    }
  }
  return rules;
}
