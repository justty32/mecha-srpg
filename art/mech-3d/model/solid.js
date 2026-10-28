// 配置階段僅對封閉實體的解析定義檢查，不產生 mesh。
export function containsSphere(s,p,r){
 if(!s||!p.every(Number.isFinite)||!Number.isFinite(r)||r<=0)return false;
 if(s.type==='cylinder'){
  const axis='xyz'.indexOf(s.axis),other=p.filter((_,i)=>i!==axis);
  return Math.abs(p[axis])+r<=s.length/2+1e-8&&Math.hypot(...other)+r<=s.radius+1e-8;
 }
 if(s.type!=='loft')return false;
 const [w,h,d]=s.size,y0=(p[1]-r)/h,y1=(p[1]+r)/h;
 if(y0<-.5-1e-8||y1>.5+1e-8)return false;
 const sample=[y0,y1,...s.sections.map(v=>v[0]).filter(y=>y>y0&&y<y1)];
 for(const y of sample){let index=s.sections.findIndex((v,i)=>i<s.sections.length-1&&y>=v[0]-1e-8&&y<=s.sections[i+1][0]+1e-8);if(index<0)return false;
  const a=s.sections[index],b=s.sections[index+1],t=(y-a[0])/(b[0]-a[0]),hx=w/2*(a[1]+(b[1]-a[1])*t),hz=d/2*(a[2]+(b[2]-a[2])*t),cut=Math.min(hx,hz)*s.cut;
  if(Math.abs(p[0])+r>hx+1e-8||Math.abs(p[2])+r>hz+1e-8||Math.abs(p[0])+Math.abs(p[2])+r*Math.SQRT2>hx+hz-cut+1e-8)return false;
 }return true;
}
