import test from 'node:test';
import assert from 'node:assert/strict';
import type { Attachment, Blueprint, Joint, OverlapIntent, Region } from './schema.ts';
import { buildLayout, planOverlapRules, validateAttachmentGeometry, validateOrder } from './layout.ts';
import { contains, convexHull, parseSvgGeometry, regionArea, regionDifference, regionIntersection, transformRegion } from './geometry.ts';
import { frameMatrix, interpolatePose, sampleTransition, slotMatrices, transformPoint, worldMatrices } from './rig.ts';
import { loadBlueprint } from './build.ts';
import { readFile } from 'node:fs/promises';
import { allowedOverlap } from './layout.ts';

const polygon:Region=[[[0,0],[18,0],[20,10],[10,20],[0,15]]];
function fixture():Blueprint {
  const bone:Joint={id:'root',parent:null,bind:{x:50,y:50,rotation:0},length:20,limits:[-90,90]};
  return {design:{version:'1',id:'test',revision:'test-1',canvas:{width:200,height:200},
    nodes:['machine','major','assembly','part'].map((level,i)=>({id:level,parent:i?['machine','major','assembly'][i-1]!:null,level:level as 'machine'|'major'|'assembly'|'part',frame:{bone:'root',transform:{x:0,y:0,rotation:0}},envelope:polygon,sockets:[{id:'mount',at:[0,0],axis:90}]})),
    parts:[{id:'plate',layout:'part',slot:'plate-slot',role:'test plate',material:'steel',silhouette:'wedge',keepOut:[],source:'parts/plate.svg',element:'plate'}]},
    rig:{version:'1',bones:[bone]},slots:{version:'1',slots:[{id:'plate-slot',bone:'root',local:{x:0,y:0,rotation:0},semantic:'part',attachment:'plate'}]},order:{version:'1',base:['plate-slot'],before:[]},poses:{version:'1',poses:[{id:'bind',angles:{}}],sequence:[]}};
}
test('delta matrices keep pivots and rotate clockwise in Y-down space',()=>{
  const bones=fixture().rig.bones;
  bones.push({id:'child',parent:'root',bind:{x:0,y:20,rotation:0},length:10,limits:[-90,90]});
  const worlds=worldMatrices(bones,{id:'turn',angles:{root:90}});
  const p=transformPoint(worlds.child!,[0,0]);assert.ok(Math.hypot(p[0]-30,p[1]-50)<1e-8);
  assert.deepEqual(transformPoint(slotMatrices(fixture().slots.slots,worlds)['plate-slot']!,[0,0]),[50,50]);
});
test('invalid parent, bone cycle, follow cycle and unknown pose bone fail',()=>{
  const bones=fixture().rig.bones;
  assert.throws(()=>worldMatrices([{...bones[0]!,parent:'missing'}]),/Unknown parent/);
  assert.throws(()=>worldMatrices([{...bones[0]!,parent:'root'}]),/cycle/);
  assert.throws(()=>worldMatrices([{...bones[0]!,follow:{bone:'root',factor:.35}}]),/cycle/);
  assert.throws(()=>worldMatrices(bones,{id:'bad',angles:{missing:1}}),/Unknown pose/);
});
test('smoothstep uses 21 equal time samples, endpoints and limits',()=>{
  const a={id:'bind',angles:{}},b={id:'arm',angles:{root:80}},samples=sampleTransition(a,b);
  assert.equal(samples.length,21);assert.equal(samples[0]!.angles.root,0);assert.equal(samples.at(-1)!.angles.root,80);
  assert.equal(interpolatePose(a,b,.5).angles.root,40);
  assert.throws(()=>sampleTransition(a,b,20),/21/);
  for(const sample of samples)assert.doesNotThrow(()=>worldMatrices(fixture().rig.bones,sample));
  assert.throws(()=>worldMatrices(fixture().rig.bones,{id:'over',angles:{root:91}}),/limits/);
});
test('region difference catches an edge crossing a concave union despite contained vertices',()=>{
  const u:Region=[[[0,0],[4,0],[4,10],[0,10]],[[6,0],[10,0],[10,10],[6,10]],[[4,0],[6,0],[6,4],[4,4]]];
  const bridge:Region=[[[2,8],[8,8],[5,2]]];
  assert.ok(bridge[0]!.every(p=>contains(u,[[[p[0]-.0001,p[1]-.0001],[p[0]+.0001,p[1]-.0001],[p[0],p[1]+.0001]]])));
  assert.equal(contains(u,bridge),false);assert.ok(regionArea(regionDifference(bridge,u))>0);
  assert.ok(regionArea(regionIntersection(u,bridge))>0);
});
test('layout invalid parent, cycle, missing part and draw order constraints fail',()=>{
  const b=fixture();assert.equal(buildLayout(b).diagnostics.length,0);
  b.design.nodes[1]!.parent='missing';assert.ok(buildLayout(b).diagnostics.some(d=>d.code==='layout-tree'));
  const cycle=fixture();cycle.design.nodes[0]!.parent='part';assert.ok(buildLayout(cycle).diagnostics.some(d=>d.code==='layout-tree'));
  const missing=fixture();missing.design.parts=[];assert.ok(buildLayout(missing).diagnostics.some(d=>d.code==='missing-part'));
  const order=fixture();order.order.base=[];assert.ok(validateOrder(order).some(d=>d.code==='missing-order-slot'));
  order.order.base=['plate-slot'];order.order.before=[['plate-slot','plate-slot']];assert.ok(validateOrder(order).some(d=>d.code==='order-cycle'));
});
test('child polygon protrusion is rejected without inflating parent',()=>{
  const b=fixture();b.design.nodes[3]!.frame.transform.x=15;
  const result=buildLayout(b);assert.ok(result.diagnostics.some(d=>d.code==='parent-envelope'));
  assert.deepEqual(result.layout.nodes[2]!.envelope,polygon);
});
test('cross-bone socket mismatch turns red instead of comparing a contact to itself',()=>{
  const b=fixture();b.rig.bones.push({id:'distal',parent:'root',bind:{x:0,y:20,rotation:0},length:10,limits:[-90,90]});
  b.design.nodes[3]!.sockets=[{id:'axis',at:[0,20],axis:90,targetBone:'distal',targetAt:[0,0]}];
  assert.ok(!buildLayout(b).diagnostics.some(d=>d.code==='socket-target'));
  b.rig.bones[1]!.bind.y=23;assert.ok(buildLayout(b).diagnostics.some(d=>d.code==='socket-target'));
});
test('SVG parser includes actual stroked geometry and refuses unsupported syntax',()=>{
  const svg='<svg><g id="plate" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,0 10,0 10,10 0,10"/></g></svg>';
  const actual=parseSvgGeometry(svg,'plate');assert.ok(regionArea(actual)>100);
  assert.throws(()=>parseSvgGeometry('<svg><g id="p"><path d="m0 0 l2 0 l0 2z"/></g></svg>','p'),/Unsupported path/);
  assert.throws(()=>parseSvgGeometry('<svg><g id="p"><path d="M0 0 C1 1 2 2 3 3Z"/></g></svg>','p'),/Unsupported path/);
  assert.throws(()=>parseSvgGeometry('<svg><g id="p" transform="translate(1)"><rect width="2" height="2"/></g></svg>','p'),/Unsupported SVG/);
  assert.throws(()=>parseSvgGeometry('<svg><g id="p"><use href="#x"/></g></svg>','p'),/Unsupported SVG/);
  assert.throws(()=>parseSvgGeometry('<svg><g id="p"><rect width="2" height="2" rx="1"/></g></svg>','p'),/Rounded/);
});
test('fake occupancy, keepOut intrusion, envelope breach and contact mismatch turn red',()=>{
  const order=buildLayout(fixture()).workOrders.orders[0]!;
  const attachment:Attachment={id:order.id,layout:order.layout,source:order.source,element:order.element,workOrderRevision:order.revision,viewBox:order.viewBox,occupancy:polygon,contacts:[{socket:'mount',at:[0,0]}]};
  assert.equal(validateAttachmentGeometry(attachment,order,polygon).length,0);
  const outside=parseSvgGeometry('<svg><g id="plate"><rect x="100" y="100" width="20" height="20"/></g></svg>','plate');
  const red=validateAttachmentGeometry(attachment,order,outside);assert.ok(red.some(d=>d.code==='art-envelope'));assert.ok(red.some(d=>d.code==='occupancy-underreport'));
  order.keepOut=[[[2,2],[5,2],[5,5],[2,5]]];assert.ok(validateAttachmentGeometry(attachment,order,polygon).some(d=>d.code==='keepout'));
  attachment.contacts[0]!.at=[2,0];assert.ok(validateAttachmentGeometry(attachment,order,polygon).some(d=>d.code==='contact-alignment'));
  attachment.workOrderRevision='old';assert.ok(validateAttachmentGeometry(attachment,order,polygon).some(d=>d.code==='work-order-revision'));
});
test('production blueprint rebuild is deterministic and every work order is allocated',async()=>{
  const blueprint=await loadBlueprint(),a=buildLayout(blueprint),b=buildLayout(structuredClone(blueprint));
  assert.equal(a.workOrders.orders.length,64);assert.deepEqual(a,b);assert.deepEqual(a.diagnostics,[]);
  assert.equal(new Set(a.workOrders.orders.map(o=>o.source)).size,64);
  for(const order of a.workOrders.orders){assert.ok(order.localEnvelope.length>0);assert.ok(order.contacts.length>0);}
});
test('real trial SVGs pass locally, then moved chest armor and shoulder keepOut intrusion turn red',async()=>{
  const b=await loadBlueprint(),orders=buildLayout(b).workOrders.orders,base=new URL('./',import.meta.url);
  const {attachments}=JSON.parse(await readFile(new URL('data/attachments.json',base),'utf8')) as {attachments:Attachment[]};
  const readSource=(id:string)=>readFile(new URL(`parts/${id}.svg`,base),'utf8');
  const getOrder=(id:string)=>orders.find(o=>o.id===id)!;
  const getAttachment=(id:string)=>attachments.find(a=>a.id===id)!;
  const shift=(svg:string,dx:number,dy:number)=>svg.replace(/points="([^"]+)"/g,(_,points:string)=>`points="${points.trim().split(/\s+/).map(pair=>{const [x,y]=pair.split(',').map(Number);return `${x!+dx},${y!+dy}`;}).join(' ')}"`);
  const chest='torso-breast-left',shoulder='arm-left-shoulder-cap';
  const chestSource=await readSource(chest),shoulderSource=await readSource(shoulder);
  assert.deepEqual(validateAttachmentGeometry(getAttachment(chest),getOrder(chest),parseSvgGeometry(chestSource,chest)),[]);
  assert.deepEqual(validateAttachmentGeometry(getAttachment(shoulder),getOrder(shoulder),parseSvgGeometry(shoulderSource,shoulder)),[]);
  const wrongChest=parseSvgGeometry(shift(chestSource,-90,0),chest);
  assert.ok(validateAttachmentGeometry(getAttachment(chest),getOrder(chest),wrongChest).some(d=>d.code==='art-envelope'));
  const wrongShoulder=parseSvgGeometry(shift(shoulderSource,-45,25),shoulder);
  assert.ok(validateAttachmentGeometry(getAttachment(shoulder),getOrder(shoulder),wrongShoulder).some(d=>d.code==='keepout'));
  const worlds=worldMatrices(b.rig.bones),matrices=slotMatrices(b.slots.slots,worlds),frame=parseSvgGeometry(await readSource('torso-frame'),'torso-frame');
  const overlap=regionIntersection(transformRegion(wrongChest,matrices[getOrder(chest).slot]!),transformRegion(frame,matrices[getOrder('torso-frame').slot]!));
  const {rules}=JSON.parse(await readFile(new URL('data/overlaps.json',base),'utf8'));
  assert.ok(regionArea(allowedOverlap(overlap,chest,'torso-frame','bind',rules,worlds))>1);
});
test('float-jitter hull preserves corners and a fixed local joint zone stays valid through rotated frames',async()=>{
  const hull=convexHull([[-9,171],[-9+1e-13,175],[-9-1e-13,177],[9,171],[9,177]]);
  const rectangle:Region=[[[ -9,171],[9,171],[9,177],[-9,177]]];
  assert.ok(contains([hull],rectangle));assert.ok(contains(rectangle,[hull]));
  const b=await loadBlueprint(),data=JSON.parse(await readFile(new URL('data/overlaps.json',import.meta.url),'utf8')) as {intents:OverlapIntent[]};
  const intent=data.intents.find(p=>p.a==='arm-left-forearm-frame'&&p.b==='arm-left-hand-gauntlet')!;
  assert.ok(intent);const rules=planOverlapRules(b,[intent]),bindRule=rules.find(r=>r.poses.includes('bind'))!;
  const localOverlap:Region=[[[ -8.9,171.1],[-8.6,171.1],[-8.6,171.4],[-8.9,171.4]]];
  assert.ok(contains(bindRule.zone.region,localOverlap));
  for(const rule of rules){
    assert.ok(regionArea(regionDifference(rule.zone.region,bindRule.zone.region))<1e-5);
    assert.ok(regionArea(regionDifference(bindRule.zone.region,rule.zone.region))<1e-5);
  }
  const wrongRules=rules.map(r=>({...r,zone:{...r.zone,frame:{...r.zone.frame,transform:{...r.zone.frame.transform,x:r.zone.frame.transform.x+30}}}}));
  for(const target of b.poses.poses)for(const pose of target.id==='bind'?[target]:sampleTransition(b.poses.poses[0]!,target)){
    const worlds=worldMatrices(b.rig.bones,pose),worldOverlap=transformRegion(localOverlap,frameMatrix(bindRule.zone.frame,worlds));
    assert.ok(regionArea(allowedOverlap(worldOverlap,intent.a,intent.b,target.id,rules,worlds))<1e-5);
    assert.ok(regionArea(allowedOverlap(worldOverlap,intent.a,intent.b,target.id,wrongRules,worlds))>.05);
  }
  const regenerated=planOverlapRules(b,data.intents);
  const saved=JSON.parse(await readFile(new URL('data/overlaps.json',import.meta.url),'utf8'));
  assert.equal(saved.revision,b.design.revision);assert.deepEqual(regenerated,saved.rules);
});
