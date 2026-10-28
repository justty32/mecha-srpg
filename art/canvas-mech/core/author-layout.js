// 一次性作者設計工具：計算後保存明確分配；絕不在 configure/runtime 路徑執行。
import { createReefHawkBaseDesign } from './design.js';
import { applyLeafRevision,designNodes,designWorlds } from './revision.js';
import { apply,corners,inverse,matrix,worldBounds } from './math.js';
import { spawnSync } from 'node:child_process';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const design=applyLeafRevision(createReefHawkBaseDesign());
const nodes=designNodes(design),worlds=designWorlds(design);
function fit(node,isRoot=false) {
  node.children.forEach(child=>fit(child));
  if(!node.children.length || isRoot) return;
  const ps=node.children.flatMap(child=>corners(child.envelope).map(p=>apply(matrix(child.localTransform,child.pivot),p)));
  ps.push({x:0,y:0},node.pivot,...Object.entries(node.attachments).filter(([key])=>!['center','top','bottom','left','right'].includes(key)).map(([,p])=>p));
  const x=Math.min(...ps.map(p=>p.x))-2,y=Math.min(...ps.map(p=>p.y))-2;
  const width=Math.max(...ps.map(p=>p.x))+2-x,height=Math.max(...ps.map(p=>p.y))+2-y;
  node.envelope={x,y,width,height};node.size={width,height};node.usableBounds={x:x+2,y:y+2,width:width-4,height:height-4};
  Object.assign(node.attachments,{center:{x:0,y:0},top:{x:0,y},bottom:{x:0,y:y+height},left:{x,y:0},right:{x:x+width,y:0}});
}
fit(design.root,true);
const allocation=[...nodes].filter(([,n])=>n.children.length).map(([nodeId,n])=>({nodeId,parentId:nodeId.includes('.')?nodeId.slice(0,nodeId.lastIndexOf('.')):null,localTransform:n.localTransform,size:n.size,envelope:n.envelope,usableBounds:n.usableBounds,pivot:n.pivot,attachments:n.attachments}));
const contacts=[];
function contact(id,a,b,radius=3,pivotId=null) {
  const na=nodes.get(a),nb=nodes.get(b),ma=worlds.get(a),mb=worlds.get(b);
  if(!na || !nb || na.children.length || nb.children.length) throw new Error(`接合葉不存在: ${id}`);
  const ra=worldBounds(ma,na.envelope),rb=worldBounds(mb,nb.envelope);
  const left=Math.max(ra.x,rb.x),right=Math.min(ra.x+ra.width,rb.x+rb.width),top=Math.max(ra.y,rb.y),bottom=Math.min(ra.y+ra.height,rb.y+rb.height);
  const worldPoint=pivotId?apply(worlds.get(pivotId),nodes.get(pivotId).pivot):{x:(left+right)/2,y:(top+bottom)/2};
  const endpoint=(nodeId,n,m)=>{
    const scale=Math.min(Math.hypot(m[0],m[1]),Math.hypot(m[2],m[3]));
    const point=apply(inverse(m),worldPoint),coverageRadius=radius/scale,bounds=n.envelope;
    if(point.x-coverageRadius<bounds.x-1e-6 || point.x+coverageRadius>bounds.x+bounds.width+1e-6 || point.y-coverageRadius<bounds.y-1e-6 || point.y+coverageRadius>bounds.y+bounds.height+1e-6) throw new Error(`接合覆蓋無空間: ${id} / ${nodeId} / ${JSON.stringify({worldPoint,radius,bounds:worldBounds(m,bounds)})}`);
    return {nodeId,attachmentId:`contact-${id}`,point,coverageRadius};
  };
  contacts.push({id,a:endpoint(a,na,ma),b:endpoint(b,nb,mb),radius,tolerance:0.5,poses:['idle','shield-aim','low-brace']});
}
const chest='root.torso.chest',waist='root.torso.waist',head='root.head';
contact('head-neck',`${head}.sensor-pod.optics.housing`,`${head}.neck-seat.mechanism.axis`);
contact('neck-chest',`${head}.neck-seat.mechanism.axis`,`${chest}.shell.arc`);
contact('neck-collar',`${head}.neck-seat.mechanism.axis`,`${head}.neck-seat.mechanism.collar`);
contact('chest-lower',`${chest}.shell.arc`,`${chest}.shell.lower`);
contact('lower-waist',`${chest}.shell.lower`,`${waist}.rotation.ring`);
contact('waist-segment',`${waist}.rotation.ring`,`${waist}.rotation.segment`);
for(const side of ['near','far']) {
  const a=`root.arm-${side}`,l=`root.leg-${side}`;
  contact(`${side}-chest-shoulder`,`${chest}.frame.${side==='near'?'shoulder-seat':'rib'}`,`${a}.shoulder.axis.hub`,3,`${a}.shoulder`);
  contact(`${side}-shoulder-upper`,`${a}.shoulder.axis.hub`,`${a}.upper.load.spar`,3,`${a}.shoulder`);
  contact(`${side}-upper-elbow`,`${a}.upper.load.spar`,`${a}.forearm.hinge.axle`,3,`${a}.forearm`);
  contact(`${side}-elbow-forearm`,`${a}.forearm.hinge.axle`,`${a}.forearm.armor.plate`);
  contact(`${side}-forearm-wrist`,`${a}.forearm.armor.plate`,`${a}.hand.palm-wrist.wrist`,2);
  contact(`${side}-wrist-palm`,`${a}.hand.palm-wrist.wrist`,`${a}.hand.palm-wrist.palm`,2);
  for(const digit of ['thumb','index','grip']) contact(`${side}-palm-${digit}`,`${a}.hand.palm-wrist.palm`,`${a}.hand.${digit}.mechanism.axle`,2);
  contact(`${side}-waist-hip`,`${waist}.rotation.segment`,`${l}.thigh.joint.socket`,3,`${l}.thigh`);
  contact(`${side}-hip-spar`,`${l}.thigh.joint.socket`,`${l}.thigh.frame.spar`);
  contact(`${side}-spar-knee`,`${l}.thigh.frame.spar`,`${l}.shin.hinge.axle`,3,`${l}.shin`);
  contact(`${side}-knee-strut`,`${l}.shin.hinge.axle`,`${l}.shin.telescope.strut`);
  contact(`${side}-strut-ankle`,`${l}.shin.telescope.strut`,`${l}.foot.ankle.joint`,3,`${l}.foot`);
  contact(`${side}-ankle-heel`,`${l}.foot.ankle.joint`,`${l}.foot.heel.pad`);
  for(const toe of ['inner','middle','outer']) contact(`${side}-ankle-${toe}`,`${l}.foot.ankle.joint`,`${l}.foot.toes.${toe}`);
}
const shield='root.equipment.shield',cannon='root.equipment.cannon';
contact('forearm-shield','root.arm-near.forearm.armor.plate',`${shield}.mount.coupler`);
contact('shield-mount-brace',`${shield}.mount.coupler`,`${shield}.frame.brace`);
for(const panel of ['inner','center','outer']) contact(`shield-brace-${panel}`,`${shield}.frame.brace`,`${shield}.shell.${panel}`);
contact('shield-brace-spine',`${shield}.frame.brace`,`${shield}.frame.spine`);
contact('palm-cannon','root.arm-far.hand.palm-wrist.palm',`${cannon}.grip.handle`);
contact('cannon-grip-case',`${cannon}.grip.handle`,`${cannon}.receiver.case`);
contact('cannon-case-muzzle',`${cannon}.receiver.case`,`${cannon}.muzzle.rim`,2);
contact('cannon-case-rail',`${cannon}.receiver.case`,`${cannon}.rail.guide`);
function save(file,rows) {
  const value={contract:'wf-table/1',source:'API.md',extracted:'2026-10-28',designStage:'explicit-top-down-allocation-1.1',columns:Object.keys(rows[0]),rows};
  const code='import sys,json\nsys.path.insert(0,sys.argv[1])\nfrom tabledb import Table\nv=json.load(sys.stdin)\nTable(sys.argv[2],columns=v.pop("columns"),rows=v.pop("rows"),meta=v).save()';
  const result=spawnSync('python3',['-c',code,join(here,'../../../wf/tools'),join(here,file)],{input:JSON.stringify(value),encoding:'utf8'});
  if(result.status!==0) throw new Error(result.stderr);
}
save('layout-allocation.json',allocation);
save('connection-allocation.json',contacts);
console.log(JSON.stringify({status:'authored',groups:allocation.length,connections:contacts.length}));
