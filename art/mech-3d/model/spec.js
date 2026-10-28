// 純工作配置，尚未建立任何 THREE 幾何或 mesh。公尺，Y上/Z前/X右。
export const materials={
 ceramic:{color:'#c9c4b6',metalness:.24,roughness:.35},
 frame:{color:'#293b4d',metalness:.78,roughness:.32},
 steel:{color:'#73808c',metalness:.9,roughness:.24},
 red:{color:'#743e40',metalness:.38,roughness:.42},
 rubber:{color:'#1e252c',metalness:.05,roughness:.76},
 light:{color:'#fff3cb',metalness:.1,roughness:.22,emissive:'#ffe9b1',emissiveIntensity:1.8},
};
export function group(key,name,position,size,children,extra={}) {
 const n={key,name,position,size,boundsCenter:[0,0,0],pivot:[0,0,0],children,...extra};
 const center=n.boundsCenter,s=Math.SQRT1_2;
 n.attachments={origin:{position:[0,0,0],quaternion:[0,0,0,1]}};
 for(const [name,axis,sign,q] of [['right',0,1,[0,s,0,s]],['left',0,-1,[0,-s,0,s]],['up',1,1,[-s,0,0,s]],['down',1,-1,[s,0,0,s]],['front',2,1,[0,0,0,1]],['back',2,-1,[0,1,0,0]]]){const p=[...center];p[axis]+=sign*size[axis]/2;n.attachments[name]={position:p,quaternion:q};}
 return n;
}
export function hull(key,name,position,size,material='ceramic',style='armor',extra={}) {
 const sections=style==='frame'?[[-.5,1,1],[.5,1,1]]:style==='arch'?[[-.5,.82,.8],[-.32,1,1],[.18,1,1],[.5,.62,.62]]:style==='foot'?[[-.5,.96,.96],[.15,1,1],[.5,.72,.72]]:[[-.5,.8,.82],[-.32,1,1],[.32,1,1],[.5,.80,.85]];
 return {...group(key,name,position,size,[],extra),material,solid:{type:'loft',size,sections,cut:style==='frame'?.08:.22},purpose:name,style};
}
export function cylinder(key,name,position,radius,length,axis='y',material='steel',extra={}) {
 const size=[2*radius,2*radius,2*radius];size['xyz'.indexOf(axis)]=length;
 return {...group(key,name,position,size,[],extra),material,solid:{type:'cylinder',radius,length,axis},purpose:name,style:'bearing'};
}
export function mechanism(key,name,size,children,position=[0,0,0],extra={}) {return group(key,name,position,size,children,extra);}
export const vec=(x=0,y=0,z=0)=>[x,y,z];
