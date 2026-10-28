import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {configureModel,validateModel,createLeafJobs,evaluatePose} from './index.js';
import {planDigest} from './state.js';
import {sha256,hashValue} from './hash.js';
import {containsSphere} from './solid.js';
function valid(){const p=configureModel();assert.equal(validateModel(p).ok,true);return p;}
function mutate(fn){const p=structuredClone(configureModel());fn(p);p.hash=planDigest(p);return validateModel(p);}
test('96 real solid leaves / 180 hierarchical nodes, static allocation and all preset contacts valid',()=>{
 const p=valid();assert.equal(p.summary.leafCount,96);assert.equal(p.summary.nodeCount,180);assert.ok(p.connections.length>=50);
 const jobs=createLeafJobs(p);assert.equal(jobs.length,96);assert.ok(jobs.every(j=>j.ancestorPath.length>=4));
 for(const pose of Object.keys(p.poses))assert.equal(Object.keys(evaluatePose(p,pose).byNode).length,180);
});
test('SHA-256 agrees with Node crypto and stable jobs serialization',()=>{
 for(const text of ['abc','',JSON.stringify(configureModel())])assert.equal(sha256(text),createHash('sha256').update(text).digest('hex'));
 assert.equal(hashValue(createLeafJobs(valid())),hashValue(createLeafJobs(valid())));
});
test('jobs and poses reject unvalidated or mutated layout',()=>{
 const p=configureModel();assert.throws(()=>createLeafJobs(p),/validated/);assert.throws(()=>evaluatePose(p),/validated/);
 const q=structuredClone(valid());validateModel(q);q.nodes[0].name='tampered';assert.throws(()=>createLeafJobs(q),/unchanged/);
});
test('static allocation negative control fails even after recomputing hash',()=>{
 const r=mutate(p=>p.nodes.find(n=>n.kind==='leaf').localTransform.position[0]=100);assert.equal(r.ok,false);assert.ok(r.errors.some(e=>e.code==='ALLOCATION'));
});
test('contact sphere must lie inside actual volume, not merely the allocation box',()=>{
 const r=mutate(p=>{const n=p.nodes.find(n=>n.id==='root.arm-left.shoulder.axis.hub');n.solid.radius=.01;});
 assert.equal(r.ok,false);assert.ok(r.errors.some(e=>e.code==='COVERAGE'));
 assert.equal(containsSphere({type:'cylinder',axis:'y',radius:.2,length:1},[.18,0,.18],.01),false);
});
test('disconnected rig fails contact test in animated presets',()=>{
 const r=mutate(p=>{p.rig.find(j=>j.nodeId==='root.arm-left.forearm').position[1]+=.1;});
 assert.equal(r.ok,false);assert.ok(r.errors.some(e=>e.code==='DISCONNECTED'));
});
test('rig cycle and illegal pose fail; shoulder motion carries palm and shield',()=>{
 const r=mutate(p=>p.rig.find(j=>j.nodeId==='root.arm-left').parentId='root.arm-left.forearm');assert.equal(r.ok,false);
 const p=valid();assert.throws(()=>evaluatePose(p,{id:'bad',angles:{'root.arm-left':900}}),/Invalid/);
 const a=evaluatePose(p),b=evaluatePose(p,'guard');
 for(const id of ['root.arm-left.hand.palm.core','root.equipment.shield.frame.spine'])assert.notDeepEqual(a.byNode[id].matrix,b.byNode[id].matrix);
});

test('every layer has finite directional docks; bad pivot/dock and duplicate root fail',()=>{
 const p=valid();for(const n of p.nodes)assert.ok(n.attachments.front&&n.attachments.origin);
 for(const [code,edit] of [
 ['PIVOT',p=>p.nodes[1].pivot=[100,0,0]],
 ['DOCK',p=>p.nodes[1].attachments.front.quaternion=[0,0,0,0]],
 ['ROOT',p=>p.nodes[1].parentId=null],
 ['TREE',p=>p.nodes[1].parentId=p.nodes[2].id],
 ]){const r=mutate(edit);assert.equal(r.ok,false);assert.ok(r.errors.some(e=>e.code===code),code);}
});

test('1.1 bounded art revision has forward readable mask, distinct armor sections and thick exhaust slats',()=>{
 const p=valid(),map=new Map(p.nodes.map(n=>[n.id,n]));assert.equal(p.interfaceVersion,'1.1.1');
 const visor=map.get('root.head.pod.optics.visor'),chest=map.get('root.torso.chest.armor.right');
 assert.ok(visor.restPosition[2]+visor.solid.size[2]/2>chest.restPosition[2]+chest.solid.size[2]/2);
 const ids=['root.torso.chest.armor.left','root.arm-left.shoulder.armor.cap','root.leg-left.thigh.armor.front','root.leg-left.shin.armor.front'];
 assert.equal(new Set(ids.map(id=>JSON.stringify(map.get(id).solid.sections))).size,4);
 assert.equal(map.get('root.torso.back.service.exhaust-left').details.length,3);
});
