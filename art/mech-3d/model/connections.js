import {sub} from './math.js';
export function authorConnections(nodes){
 const map=new Map(nodes.map(n=>[n.id,n])),connections=[];
 function join(id,a,b,world,r=.035){
  const endpoint=(nodeId)=>{const n=map.get(nodeId);if(!n)throw Error('Missing contact leaf '+nodeId);const attachmentId='contact-'+id,position=sub(world,n.restPosition);n.attachments[attachmentId]={position,quaternion:[0,0,0,1]};return {nodeId,attachmentId};};
  connections.push({id,a:endpoint(a),b:endpoint(b),radius:r,poses:['idle','guard','low']});
 }
 const chest='root.torso.chest',waist='root.torso.waist';
 join('chest-load',chest+'.load.beam',chest+'.load.keel',[0,3.65,0]);
 join('chest-waist',chest+'.load.keel',waist+'.load.waist-axis',[0,3.05,0]);
 join('waist-pelvis',waist+'.load.waist-axis',waist+'.load.pelvis',[0,2.35,0]);
 join('neck-chest','root.head.neck.bearing.axis',chest+'.load.keel',[0,3.78,.04]);
 join('head-neck','root.head.pod.shell.housing','root.head.neck.bearing.axis',[0,3.90,.04]);
 for(const side of ['left','right']){
  const sign=side==='right'?1:-1,a=`root.arm-${side}`,l=`root.leg-${side}`,x=sign*1.12,lx=sign*.48;
  join(side+'-shoulder-body',chest+'.load.beam',a+'.shoulder.axis.hub',[x,3.65,0]);
  join(side+'-shoulder-spar',a+'.shoulder.axis.hub',a+'.upper.load.spar',[x,3.65,0]);
  join(side+'-elbow',a+'.upper.load.spar',a+'.forearm.hinge.axle',[x,2.75,0]);
  join(side+'-forearm',a+'.forearm.hinge.axle',a+'.forearm.load.spar',[x,2.75,0]);
  join(side+'-wrist',a+'.forearm.load.spar',a+'.hand.palm.wrist',[x,2.03,0]);
  join(side+'-palm',a+'.hand.palm.wrist',a+'.hand.palm.core',[x,2.00,.03],.025);
  for(let i=0;i<3;i++){
   const fx=x+(i-1)*.16;
   join(side+'-finger-'+i,a+'.hand.palm.core',a+`.hand.finger-${i}.proximal`,[fx,1.82,.14],.018);
   join(side+'-finger-tip-'+i,a+`.hand.finger-${i}.proximal`,a+`.hand.finger-${i}.distal`,[fx,1.65,.18],.015);
  }
  join(side+'-hip',waist+'.load.pelvis',l+'.thigh.joint.hip',[lx,2.15,0]);
  join(side+'-thigh',l+'.thigh.joint.hip',l+'.thigh.load.spar',[lx,2.15,0]);
  join(side+'-knee',l+'.thigh.load.spar',l+'.shin.hinge.axle',[lx,1.25,0]);
  join(side+'-shin',l+'.shin.hinge.axle',l+'.shin.load.spar',[lx,1.25,0]);
  join(side+'-ankle',l+'.shin.load.spar',l+'.foot.ankle.axis',[lx,.35,.05]);
  join(side+'-sole',l+'.foot.ankle.axis',l+'.foot.sole.bridge',[lx,.25,.10]);
  join(side+'-heel',l+'.foot.sole.bridge',l+'.foot.sole.heel',[lx,.16,-.24],.025);
  for(const [key,dx] of [['left',-.22],['right',.22]])join(side+'-toe-'+key,l+'.foot.sole.bridge',l+'.foot.toes.'+key,[lx+dx,.19,.48],.035);
 }
 const shield='root.equipment.shield',staff='root.equipment.staff';
 join('shield-arm','root.arm-left.forearm.load.spar',shield+'.mount.coupler',[-1.12,2.45,.10],.025);
 join('shield-frame',shield+'.mount.coupler',shield+'.frame.spine',[-1.30,2.45,.22],.025);
 for(const [key,x] of [['center',-1.5],['left',-1.82],['right',-1.18]])join('shield-'+key,shield+'.frame.spine',shield+'.shell.'+key,[x,2.45,.32],.02);
 join('staff-hand','root.arm-right.hand.palm.core',staff+'.grip.handle',[1.12,1.93,.12],.025);
 join('staff-shaft',staff+'.grip.handle',staff+'.body.shaft',[1.12,1.93,.13]);
 join('staff-head',staff+'.body.shaft',staff+'.ends.head',[1.12,1.93,.80]);
 join('staff-pommel',staff+'.body.shaft',staff+'.ends.pommel',[1.12,1.93,-.245],.02);
 return connections;
}
