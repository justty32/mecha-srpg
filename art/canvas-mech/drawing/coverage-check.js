import {trace} from './paint.js';
export function flattenPath(path,bounds) {
 const points=[];let current;
 const ctx={beginPath(){},closePath(){},moveTo(x,y){current={x,y};points.push(current);},lineTo(x,y){current={x,y};points.push(current);},
 quadraticCurveTo(x1,y1,x2,y2){const p=current;for(let i=1;i<=24;i++){const t=i/24,u=1-t;points.push({x:u*u*p.x+2*u*t*x1+t*t*x2,y:u*u*p.y+2*u*t*y1+t*t*y2});}current={x:x2,y:y2};},
 bezierCurveTo(x1,y1,x2,y2,x3,y3){const p=current;for(let i=1;i<=32;i++){const t=i/32,u=1-t;points.push({x:u*u*u*p.x+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,y:u*u*u*p.y+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3});}current={x:x3,y:y3};}};
 trace(ctx,path,bounds);return points;
}
export function containsPoint(poly,p) {
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
export function boundaryDistance(poly,p) {
 let distance=Infinity;
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y;
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  distance=Math.min(distance,Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy));
 }
 return distance;
}
export function coverageFailures(job,outline) {
 const poly=flattenPath(outline,job.localGeometry.bounds);
 return (job.requiredCoverage??[]).filter(c=>!containsPoint(poly,c.center)||boundaryDistance(poly,c.center)+1e-7<c.radius);
}
