export function createMaterials(THREE,job){
 const m=job.material;
 const body=new THREE.MeshStandardMaterial({name:m.id,color:m.color,metalness:m.metalness,roughness:m.roughness,emissive:m.emissive??'#000000',emissiveIntensity:m.emissiveIntensity??0});
 const base=new THREE.Color(m.color),dark=body.clone(),rim=body.clone();
 dark.color=m.id==='ceramic'?new THREE.Color('#344858'):base.clone().multiplyScalar(.62);dark.roughness=Math.min(1,m.roughness+.15);
 rim.color=base.clone().lerp(new THREE.Color('#d9d8d2'),.23);rim.roughness=Math.max(.18,m.roughness-.06);
 const mark=body.clone();mark.color=new THREE.Color('#8b3e40');mark.metalness=.30;mark.roughness=.39;
 return [body,dark,rim,mark];
}
