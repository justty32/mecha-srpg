export const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function multiply(a,b){const c=Array(16).fill(0);for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)c[col*4+row]+=a[k*4+row]*b[col*4+k];return c;}
export function translation(p){const m=identity();m[12]=p[0];m[13]=p[1];m[14]=p[2];return m;}
export function rotation(axis,degree){const m=identity(),r=degree*Math.PI/180,c=Math.cos(r),s=Math.sin(r);if(axis==='x'){m[5]=c;m[6]=s;m[9]=-s;m[10]=c;}else if(axis==='y'){m[0]=c;m[2]=-s;m[8]=s;m[10]=c;}else if(axis==='z'){m[0]=c;m[1]=s;m[4]=-s;m[5]=c;}return m;}
export function point(m,p){return [0,1,2].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]);}
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const distance=(a,b)=>Math.hypot(...sub(a,b));
export function bounds(size,center=[0,0,0]){return {min:center.map((v,i)=>v-size[i]/2),max:center.map((v,i)=>v+size[i]/2)};}
export function corners(b){const a=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)a.push([x?b.max[0]:b.min[0],y?b.max[1]:b.min[1],z?b.max[2]:b.min[2]]);return a;}
export const inBounds=(b,p,r=0)=>p.every((v,i)=>v-r>=b.min[i]-1e-8&&v+r<=b.max[i]+1e-8);
