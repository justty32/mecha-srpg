// 單輪 1.1 藝術修訂：先形狀規格凍結，之後才由 mesh 消費。
export function refineDesign(design){
 const nodes=new Map();function collect(n,path=''){const id=path?path+'.'+n.key:n.key;nodes.set(id,n);n.children.forEach(c=>collect(c,id));}collect(design.root);
 const n=id=>{if(!nodes.has(id))throw Error(id);return nodes.get(id);};
 const allocation=(id,size,center)=>{n(id).size=size;if(center)n(id).boundsCenter=center;};
 const shape=(id,size,sections,position,cut=.24)=>{const a=n(id);a.size=size;a.solid={...a.solid,size,sections,cut};if(position)a.position=position;};
 design.version='1.1.1';
 design.materials.frame={color:'#354c60',metalness:.65,roughness:.36};
 design.materials.red={color:'#8b3e40',metalness:.30,roughness:.39};
 design.materials.secondary={color:'#7d8b92',metalness:.48,roughness:.40};
 design.materials.dark={color:'#17232f',metalness:.35,roughness:.50};
 const head='root.head';
 allocation(head,[.98,1.0,1.52],[0,0,.25]);
 allocation(head+'.pod',[.92,.66,1.48],[0,0,.25]);
 allocation(head+'.pod.shell',[.90,.64,1.45],[0,0,.24]);
 allocation(head+'.pod.optics',[.86,.56,1.48],[0,0,.25]);
 shape(head+'.pod.shell.housing',[.78,.48,.94],[[-.5,.66,.72],[-.24,1,1],[.18,.96,.96],[.5,.62,.60]],[0,0,.10]);
 shape(head+'.pod.shell.jaw',[.68,.32,.14],[[-.5,.72,.8],[-.25,1,1],[.30,1,1],[.5,.84,.8]],[0,-.01,.58]);
 n(head+'.pod.shell.jaw').name='暗色感測面罩與頷框';n(head+'.pod.shell.jaw').material='dark';
 n(head+'.pod.optics.visor').position=[0,.02,.65];
 n(head+'.pod.optics.brow').position=[0,.14,.54];
 const chest='root.torso.chest.armor';
 allocation(chest,[2.02,1.2,1.30]);
 for(const [key,sign] of [['left',-1],['right',1]]){
  shape(chest+'.'+key,[.98,.98,.50],[[-.5,.46,.55],[-.12,1,1],[.28,.94,.90],[.5,.70,.55]],[sign*.44,.01,.35],.34);
  n(chest+'.'+key).solid.faceBands={front:{0:1},back:{0:1,1:1,2:1}};
  n(chest+'.side-'+key).material='secondary';
 }
 for(const side of ['left','right']){
  const a='root.arm-'+side,l='root.leg-'+side;
  shape(a+'.shoulder.armor.cap',[.96,.60,1.0],[[-.5,.72,.80],[-.25,.96,.98],[0,1,1],[.25,.90,.86],[.43,.62,.66],[.5,.32,.40]],undefined,.30);
  n(a+'.shoulder.armor.cap').solid.faceBands={front:{0:1,3:3},back:{0:1}};
  shape(a+'.upper.armor.front',[.54,.76,.27],[[-.5,.58,.65],[-.22,1,1],[.25,.92,.92],[.5,.74,.75]]);
  shape(l+'.thigh.armor.front',[.68,.80,.32],[[-.5,.50,.65],[-.25,.82,1],[.25,1,.88],[.5,.76,.62]],undefined,.34);
  n(l+'.thigh.armor.front').solid.faceBands={front:{0:1},back:{0:1}};
  shape(l+'.shin.armor.front',[.80,.83,.42],[[-.5,.58,.65],[-.32,.82,.98],[.15,1,1],[.5,.70,.65]],undefined,.34);
  n(l+'.shin.armor.front').solid.faceBands={front:{0:1},back:{0:1}};
  n(l+'.shin.hinge.cap').material='secondary';
  n(l+'.foot.sole.bridge').material='secondary';
 }
 for(const side of ['left','right']){
  const e=n('root.torso.back.service.exhaust-'+side);e.material='dark';e.solid.size=[.30,.48,.23];
  e.details=[-.12,0,.12].map(y=>({name:'厚實排氣百葉',position:[0,y,-.125],material:'steel',solid:{type:'loft',size:[.235,.04,.05],sections:[[-.5,.85,1],[.5,1,1]],cut:.15}}));
 }
 // 杖身朝前，握持點維持掌內；避免杖首藏進前臂。無新增葉或活動軸。
 allocation('root.equipment',[4.2,2.3,2.4],[0,0,.20]);
 const staff='root.equipment.staff';allocation(staff,[.8,.9,2.04],[0,0,.42]);
 allocation(staff+'.grip',[.35,.35,.55]);allocation(staff+'.body',[.4,.4,1.55],[0,0,.36]);allocation(staff+'.ends',[.8,.8,2.0],[0,0,.42]);
 const handle=n(staff+'.grip.handle');handle.solid.axis='z';handle.size=[.18,.18,.48];
 const shaft=n(staff+'.body.shaft');shaft.solid.axis='z';shaft.size=[.15,.15,1.24];shaft.position=[0,0,.21];
 shape(staff+'.ends.head',[.49,.49,.42],[[-.5,.72,.8],[-.25,1,1],[.22,1,1],[.5,.7,.7]],[0,0,.72]);
 shape(staff+'.ends.pommel',[.23,.23,.22],[[-.5,.8,.8],[.5,1,1]],[0,0,-.45]);
 // 修訂後每層 dock 仍由其明列局部包絡決定，非 mesh/葉反推父層。
 const s=Math.SQRT1_2;
 for(const a of nodes.values()){
  a.attachments={origin:{position:[0,0,0],quaternion:[0,0,0,1]}};
  for(const [name,axis,sign,q] of [['right',0,1,[0,s,0,s]],['left',0,-1,[0,-s,0,s]],['up',1,1,[-s,0,0,s]],['down',1,-1,[s,0,0,s]],['front',2,1,[0,0,0,1]],['back',2,-1,[0,1,0,0]]]){const p=[...a.boundsCenter];p[axis]+=sign*a.size[axis]/2;a.attachments[name]={position:p,quaternion:q};}
 }
 return design;
}
