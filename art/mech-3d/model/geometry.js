// 僅於領導核可凍結工作單後建立。所有面都是封閉體積的一部分。
export function solidData(solid){
 const vertices=[],triangles=[],groups=[];
 const vertex=p=>{vertices.push(p);return vertices.length-1;};
 const face=(a,b,c,material=0)=>{
  const p=vertices[a],q=vertices[b],r=vertices[c],u=q.map((v,i)=>v-p[i]),v=r.map((w,i)=>w-p[i]);
  const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],center=p.map((w,i)=>(w+q[i]+r[i])/3);
  if(normal.reduce((n,w,i)=>n+w*center[i],0)<0)[b,c]=[c,b];
  groups.push(material);triangles.push([a,b,c]);
 };
 let rings=[];
 if(solid.type==='loft'){
  const [w,h,d]=solid.size;
  rings=solid.sections.map(([y,sx,sz])=>{
   const x=w*sx/2,z=d*sz/2,c=Math.min(x,z)*solid.cut;
   return [[x-c,z],[-x+c,z],[-x,z-c],[-x,-z+c],[-x+c,-z],[x-c,-z],[x,-z+c],[x,z-c]].map(([a,b])=>vertex([a,y*h,b]));
  });
 }else if(solid.type==='cylinder'){
  const map=([x,y,z])=>solid.axis==='x'?[y,x,z]:solid.axis==='z'?[x,z,y]:[x,y,z];
  rings=[-.5,.5].map(end=>Array.from({length:48},(_,i)=>{const a=i*Math.PI/24;return vertex(map([Math.cos(a)*solid.radius,end*solid.length,Math.sin(a)*solid.radius]));}));
 }else throw Error('Unknown frozen solid');
 const count=rings[0].length;
 for(let level=0;level<rings.length-1;level++)for(let i=0;i<count;i++){
  const next=(i+1)%count,a=rings[level][i],b=rings[level][next],c=rings[level+1][next],d=rings[level+1][i];const band=solid.type==='loft'?(i===0?solid.faceBands?.front?.[level]:i===4?solid.faceBands?.back?.[level]:undefined):undefined;face(a,b,c,band??0);face(a,c,d,band??0);
 }
 for(const end of [0,rings.length-1]){
  const ring=rings[end],center=[0,1,2].map(k=>ring.reduce((n,id)=>n+vertices[id][k],0)/count),middle=vertex(center);
  if(solid.type==='cylinder'){
   const inner=ring.map(id=>vertex(vertices[id].map((v,k)=>center[k]+(v-center[k])*.58)));
   for(let i=0;i<count;i++){const next=(i+1)%count;face(middle,inner[i],inner[next],1);face(inner[i],ring[i],ring[next],2);face(inner[i],ring[next],inner[next],2);}
  }else for(let i=0;i<count;i++)face(middle,ring[i],ring[(i+1)%count],end===0?1:0);
 }
 return {vertices,triangles,groups};
}
export function buildGeometry(THREE,solid){
 const data=solidData(solid),g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(data.vertices.flat(),3));g.setIndex(data.triangles.flat());
 data.groups.forEach((material,i)=>g.addGroup(i*3,3,material));
 // 分面法線呈現真正倒角；接合實體仍共用位置、封閉可驗。
 const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();flat.computeBoundingBox();flat.computeBoundingSphere();return flat;
}
