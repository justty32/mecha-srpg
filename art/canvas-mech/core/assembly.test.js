import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { configureMech,createReefHawkDesign,validateAssembly,createLeafJobs,evaluatePose,GATES } from './index.js';
import { canonical,hashValue,sha256 } from './hash.js';
import { planDigest } from './assembly.js';
import { apply,corners,inBounds,matrix,mul,inverse } from './math.js';

const fresh=()=>structuredClone(configureMech());
const approved=()=>{const p=configureMech();assert.equal(validateAssembly(p).ok,true);return p;};
const node=(p,id)=>p.nodes.find(n=>n.id===id);
const joint=(p,id)=>p.rig.joints.find(j=>j.nodeId===id);
const near='root.arm-near', rod=`${near}.forearm.rods.left`;
function rejects(code,mutate) {
  const p=fresh();mutate(p);p.hash=planDigest(p);
  const result=validateAssembly(p);
  assert.equal(result.ok,false,`反例 ${code} 必須被擋`);
  assert.ok(result.errors.some(e=>e.code===code),JSON.stringify(result.errors));
  assert.throws(()=>createLeafJobs(p),/未驗證/);
}
const nearNumber=(a,b,epsilon=1e-7)=>assert.ok(Math.abs(a-b)<epsilon,`${a} != ${b}`);
const nearPoint=(a,b)=>{nearNumber(a.x,b.x);nearNumber(a.y,b.y);};

test('SHA-256 與 Node crypto 相同，含 UTF-8、多區塊及固定向量',()=>{
  for(const value of ['', 'abc', '礁鷹🌙'.repeat(257),'x'.repeat(55),'x'.repeat(56),'x'.repeat(64)]) assert.equal(sha256(value),createHash('sha256').update(value).digest('hex'));
  assert.equal(sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(hashValue({b:2,a:1}),hashValue({a:1,b:2}));
});

test('top-down 完整配置固定 184 節點、94 功能葉、5 層深度，欄位完整',()=>{
  const p=approved();assert.deepEqual(p.summary,{nodeCount:184,leafCount:94,maxDepth:5});
  const byId=new Map(p.nodes.map(n=>[n.id,n]));
  for(const n of p.nodes) {
    assert.ok(n.purpose.length>0 && Object.keys(n.attachments).length>0);
    assert.ok(inBounds(n.pivot,n.envelope));
    if(n.parentId!==null) for(const point of corners(n.envelope)) assert.ok(inBounds(apply(matrix(n.localTransform,n.pivot),point),byId.get(n.parentId).envelope));
    assert.ok(p.rig.joints.some(j=>j.nodeId===n.id));
  }
  for(const id of ['root.torso.chest.frame.beam','root.torso.chest.shell.arc','root.torso.waist.rotation.link','root.torso.back.thermal.fin','root.head.neck-seat.mechanism.axis',`${near}.hand.thumb.mechanism.belly`,`${near}.hand.index.mechanism.axle`,`${near}.hand.grip.mechanism.shell`,'root.leg-near.foot.toes.outer','root.equipment.shield.shell.center','root.equipment.cannon.muzzle.rim']) assert.ok(byId.has(id),id);
  assert.ok(p.nodes.filter(n=>n.kind==='leaf').every(n=>n.id.split('.').length-1>=4));
  assert.notEqual(joint(p,`${near}.forearm`).parentId,node(p,`${near}.forearm`).parentId);
});

test('配置及 digest 可重現，呼叫不共享可變 Design 或凍結 plan',()=>{
  const a=configureMech(),b=configureMech();assert.deepEqual(a,b);assert.notEqual(a,b);
  assert.equal(a.hash,hashValue(Object.fromEntries(Object.entries(a).filter(([k])=>k!=='hash'))));
  assert.throws(()=>{a.nodes[0].pivot.x=4;},TypeError);
  const d=createReefHawkDesign(),p=configureMech(d);d.root.children[0].purpose='changed';assert.notEqual(p.nodes[1].purpose,'changed');
  assert.throws(()=>{const d=createReefHawkDesign();d.root.children.push(d.root);configureMech(d);},/循環/);
});

test('基本矩陣含 pivot、縮放、父子乘序與逆矩陣',()=>{
  const a=matrix({x:20,y:30,rotationDeg:90,scaleX:2,scaleY:3},{x:1,y:2});
  nearPoint(apply(a,{x:1,y:2}),{x:21,y:32});
  nearPoint(apply(a,{x:2,y:2}),{x:21,y:34});
  nearPoint(apply(mul(a,inverse(a)),{x:19,y:41}),{x:19,y:41});
});

test('反例：錯語義 parent',()=>rejects('parent',p=>{node(p,`${near}.upper`).parentId='missing';}));
test('反例：語義 parent 循環',()=>rejects('cycle',p=>{node(p,`${near}.upper`).parentId=`${near}.upper.load`; }));
test('反例：葉攤在 root 一層',()=>rejects('flat-leaf',p=>{node(p,`${near}.upper.shell.plate`).parentId='root';}));
test('反例：子包絡超出父層',()=>rejects('envelope-overflow',p=>{node(p,`${near}.upper`).localTransform.x=1000;}));
test('反例：四角旋轉後越界也被擋',()=>rejects('envelope-overflow',p=>{node(p,'root.torso.chest.shell.arc').localTransform.rotationDeg=45;}));
test('反例：不合法 pivot',()=>rejects('pivot',p=>{node(p,`${near}.upper`).pivot.x=999;}));
test('反例：非有限 pivot',()=>rejects('pivot',p=>{node(p,`${near}.upper`).pivot.y=NaN;}));
test('反例：不合法接點',()=>rejects('attachment',p=>{node(p,`${near}.upper`).attachments.top.y=-999;}));
test('反例：每層接點不得省略',()=>rejects('attachments',p=>{node(p,near).attachments={};}));
test('反例：尺寸不能與包絡分離',()=>rejects('size',p=>{node(p,near).size.width=1;}));
test('反例：可用包絡越界',()=>rejects('usable-bounds',p=>{node(p,near).usableBounds.x=-999;}));
test('反例：負縮放或無限 transform',()=>{
  rejects('transform',p=>{node(p,near).localTransform.scaleX=-1;});
  rejects('rig-transform',p=>{joint(p,near).localTransform.x=Infinity;});
});
test('反例：葉缺少有意義功能',()=>rejects('purpose',p=>{node(p,rod).purpose=' ';}));
test('反例：未定義材質',()=>rejects('material',p=>{node(p,rod).material='missing';}));
test('反例：重複 id',()=>rejects('duplicate-id',p=>{p.nodes.push(structuredClone(p.nodes[1]));}));
test('反例：超過 260 節點 gate',()=>rejects('node-gate',p=>{
  for(let i=0;i<77;i++) {const n=structuredClone(node(p,rod));n.id=`overflow-${i}`;p.nodes.push(n);}
}));
test('反例：超過 160 葉 gate，且節點總數仍在 260 以內',()=>rejects('leaf-gate',p=>{
  for(let i=0;i<67;i++) {const n=structuredClone(node(p,rod));n.id=`extra-leaf-${i}`;p.nodes.push(n);}
  assert.ok(p.nodes.length<=GATES.maxNodes);
}));
test('反例：rig parent 錯誤',()=>rejects('rig-parent',p=>{joint(p,near).parentId='missing';}));
test('反例：rig 循環',()=>rejects('rig-cycle',p=>{joint(p,near).parentId=`${near}.shoulder`;}));
test('反例：rig 缺少逐節點映射',()=>rejects('rig-missing',p=>{p.rig.joints.pop();}));
test('反例：rig bind world 偏離 top-down 配置',()=>rejects('rig-bind',p=>{joint(p,`${near}.upper`).localTransform.x+=3;}));
test('反例：rig pivot 與配置分離',()=>rejects('rig-pivot',p=>{joint(p,`${near}.upper`).pivot.x=1;}));
test('反例：連桿端點不存在',()=>rejects('link-endpoint',p=>{p.rig.links[0].start.attachmentId='missing';}));
test('反例：連桿兩端靜止長度不符',()=>rejects('link-length',p=>{p.rig.links[0].restLength+=3;}));
test('反例：連桿靜止幾何必須對齊端點',()=>rejects('link-bind',p=>{node(p,rod).localTransform.rotationDeg+=1;joint(p,rod).localTransform.rotationDeg+=1;}));
test('反例：連桿不可互相依賴',()=>rejects('link-dependency',p=>{p.rig.links[0].start.nodeId=rod;p.rig.links[0].start.attachmentId='center';}));
test('反例：遺失畫序',()=>rejects('draw-missing',p=>{p.drawOrder.pop();}));
test('反例：畫序不得引用 group',()=>rejects('draw-map',p=>{p.drawOrder[0].nodeId=near;}));
test('反例：畫序不是升冪',()=>rejects('draw-sort',p=>{[p.drawOrder[0],p.drawOrder[1]]=[p.drawOrder[1],p.drawOrder[0]];}));
test('反例：畫序鍵重複',()=>rejects('layer-duplicate',p=>{p.drawOrder[1].layerKey=[...p.drawOrder[0].layerKey];}));
test('反例：缺少姿態或內建姿態角度超限',()=>{
  rejects('poses',p=>{p.poses={};});
  rejects('pose-angle',p=>{p.poses['shield-aim'].angles[`${near}.forearm`]=126;});
});
test('反例：摘要或 hash 被竄改',()=>{
  rejects('summary',p=>{p.summary.leafCount=0;});
  const p=fresh();p.hash='0'.repeat(64);assert.ok(validateAssembly(p).errors.some(e=>e.code==='hash'));
});

test('工作單只能從同一模組驗證過、且驗證後未變更的 plan 產生',()=>{
  const p=configureMech();assert.throws(()=>createLeafJobs(p),/未驗證/);assert.throws(()=>evaluatePose(p),/未驗證/);
  assert.equal(validateAssembly(p).ok,true);assert.equal(createLeafJobs(p).length,94);
  const loaded=JSON.parse(JSON.stringify(p));loaded.validated=true;assert.throws(()=>createLeafJobs(loaded),/未驗證/);
  delete loaded.validated;assert.equal(validateAssembly(loaded).ok,true);assert.equal(createLeafJobs(loaded).length,94);
  loaded.nodes[0].purpose='change';loaded.hash=planDigest(loaded);assert.throws(()=>createLeafJobs(loaded),/已改動/);
  assert.equal(validateAssembly(loaded).ok,true);assert.equal(createLeafJobs(loaded).length,94);
});

test('逐葉工作單是完整局部契約、凍結且與 rig/畫序逐一對應',()=>{
  const p=approved(),jobs=createLeafJobs(p),rest=evaluatePose(p);
  assert.deepEqual(jobs.map(j=>j.nodeId),p.drawOrder.map(d=>d.nodeId));
  for(const j of jobs) {
    const n=node(p,j.nodeId);assert.equal(j.planHash,p.hash);assert.equal(j.interfaceVersion,'1.1.0');
    assert.deepEqual(j.localGeometry.bounds,n.envelope);assert.deepEqual(j.localGeometry.size,n.size);assert.deepEqual(j.attachments,n.attachments);
    assert.equal(j.ancestorPath.at(-1),n.parentId);assert.equal(j.ancestorPath[0],p.rootId);assert.ok(!j.ancestorPath.includes(j.nodeId));
    assert.equal(j.rigChain.at(-1),j.nodeId);assert.equal(j.rigChain.at(-2),j.rigParentId);
    j.restWorldMatrix.forEach((v,i)=>nearNumber(v,rest.byNode[j.nodeId].worldMatrix[i]));
    assert.equal(j.occlusion.clipToEnvelope,false);assert.ok(j.material.base.startsWith('#'));
    assert.ok(j.occlusion.occludedBy.every(id=>jobs.findIndex(x=>x.nodeId===id)>jobs.indexOf(j)));
  }
  assert.throws(()=>{jobs[0].localGeometry.bounds.x=999;},TypeError);
  const finger=jobs.find(j=>j.nodeId.endsWith('arm-near.hand.index.mechanism.shell'));assert.equal(finger.ancestorPath.length,5);
});

test('父動子隨數值：近肩 +90°，上臂中心 (715,415) → (636,354)，遠臂不動',()=>{
  const p=approved(),idle=evaluatePose(p),turned=evaluatePose(p,{id:'shoulder-90',angles:{[`${near}.shoulder`]:90}});
  nearPoint(idle.byNode[`${near}.upper`].worldPivot,{x:715,y:415});
  nearPoint(turned.byNode[`${near}.upper`].worldPivot,{x:636,y:354});
  nearPoint(turned.byNode[`${near}.hand`].worldPivot,{x:441,y:362});
  nearPoint(idle.byNode['root.arm-far.hand'].worldPivot,turned.byNode['root.arm-far.hand'].worldPivot);
  const j=createLeafJobs(p).find(j=>j.nodeId===`${near}.hand.index.mechanism.shell`);
  assert.notDeepEqual(idle.byNode[j.nodeId].worldMatrix,turned.byNode[j.nodeId].worldMatrix);
  assert.notDeepEqual(idle.byNode['root.equipment.shield'].worldMatrix,turned.byNode['root.equipment.shield'].worldMatrix);
});

test('三姿態全部有限；肩 65/肘95 與近膝60/遠25 有實際增量',()=>{
  const p=approved();
  for(const pose of ['idle','shield-aim','low-brace']) {
    const f=evaluatePose(p,pose);assert.equal(Object.keys(f.byNode).length,184);
    for(const s of Object.values(f.byNode)) assert.ok(s.worldMatrix.every(Number.isFinite) && Object.values(s.worldBounds).every(Number.isFinite));
  }
  const aim=evaluatePose(p,'shield-aim'),brace=evaluatePose(p,'low-brace');
  assert.equal(aim.byNode[`${near}.shoulder`].rotationDeltaDeg,-65);
  assert.equal(aim.byNode[`${near}.forearm`].rotationDeltaDeg,95);
  assert.equal(brace.byNode['root.leg-near.shin'].rotationDeltaDeg,60);
  assert.equal(brace.byNode['root.leg-far.shin'].rotationDeltaDeg,25);
  assert.throws(()=>evaluatePose(p,'missing'),/不存在/);
  assert.throws(()=>evaluatePose(p,{id:'bad',angles:{[`${near}.forearm`]:126}}),/不合法/);
  assert.throws(()=>evaluatePose(p,{id:'bad',angles:{missing:1}}),/不合法/);
  assert.throws(()=>evaluatePose(p,{id:'bad',angles:{[`${near}.hand`]:0}}),/不合法/);
});

test('每姿態連桿端點等於具名世界接點，局部 ±半長亦精確對齊',()=>{
  const p=approved();
  for(const pose of Object.keys(p.poses)) {
    const f=evaluatePose(p,pose);
    for(const link of p.rig.links) {
      const s=f.byNode[link.nodeId],start=f.byNode[link.start.nodeId].attachments[link.start.attachmentId],end=f.byNode[link.end.nodeId].attachments[link.end.attachmentId];
      nearPoint(s.linkage.start,start);nearPoint(s.linkage.end,end);
      nearPoint(apply(s.worldMatrix,{x:-link.restLength/2,y:0}),start);
      nearPoint(apply(s.worldMatrix,{x:link.restLength/2,y:0}),end);
      nearNumber(s.linkage.length,Math.hypot(end.x-start.x,end.y-start.y));
    }
  }
});

test('畫序遠肢→背架→軀幹→近肢→裝備，肩甲及膝甲有獨立 pass',()=>{
  const p=approved();const layer=id=>p.drawOrder.find(d=>d.nodeId===id).layerKey[0];
  assert.ok(layer('root.arm-far.upper.load.spar')<layer('root.torso.back.support.spine'));
  assert.ok(layer('root.torso.back.support.spine')<layer('root.torso.chest.frame.beam'));
  assert.ok(layer('root.torso.chest.frame.beam')<layer(`${near}.upper.load.spar`));
  assert.ok(layer(`${near}.upper.load.spar`)<layer('root.equipment.shield.shell.center'));
  assert.equal(layer(`${near}.shoulder.floating-armor.plate`),45);
  assert.equal(layer('root.leg-near.shin.armor.plate'),46);
});

test('不完整輸入回驗證錯誤，不會假通過',()=>{
  for(const bad of [null,{},[],{nodes:[]}]) assert.equal(validateAssembly(bad).ok,false);
  assert.throws(()=>configureMech({}),/Design/);
  assert.equal(canonical({z:1,a:2}),'{"a":2,"z":1}');
});

test('v1.1 的52承力接合三姿態同位，104個局部必畫圓盤明列到jobs',()=>{
  const p=approved(),jobs=createLeafJobs(p);
  assert.equal(p.connections.length,52);
  assert.equal(jobs.reduce((sum,j)=>sum+j.requiredCoverage.length,0),104);
  for(const pose of ['idle','shield-aim','low-brace']) {
    const frame=evaluatePose(p,pose);
    for(const c of p.connections) nearPoint(frame.byNode[c.a.nodeId].attachments[c.a.attachmentId],frame.byNode[c.b.nodeId].attachments[c.b.attachmentId]);
  }
  for(const c of p.connections) for(const e of [c.a,c.b]) {
    const coverage=jobs.find(j=>j.nodeId===e.nodeId).requiredCoverage.find(r=>r.connectionId===c.id);
    assert.equal(coverage.radius,e.coverageRadius);assert.deepEqual(coverage.center,node(p,e.nodeId).attachments[e.attachmentId]);
    assert.equal(coverage.mateNodeId,c.a.nodeId===e.nodeId?c.b.nodeId:c.a.nodeId);
  }
  nearNumber(node(p,'root.arm-far').localTransform.scaleX,0.9);
  nearNumber(node(p,'root.leg-far').localTransform.scaleX,0.94);
});

test('v1.1 反例：AABB不變仍擋接點偏離、覆蓋超界/縮水及刪除接觸契約',()=>{
  rejects('contact-gap',p=>{const c=p.connections[0];node(p,c.a.nodeId).attachments[c.a.attachmentId].x+=1;});
  rejects('contact-coverage',p=>{p.connections[0].a.coverageRadius=1000;});
  rejects('contact-radius',p=>{p.connections[0].a.coverageRadius=0.1;});
  rejects('contacts',p=>{p.connections=[];});
});
