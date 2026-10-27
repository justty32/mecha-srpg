import type { Matrix, Polygon, Region, Vec2 } from './schema.ts';
import { transformPoint } from './rig.ts';

const EPS=1e-7;
const cross=(a: Vec2,b: Vec2,c: Vec2): number=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export const signedArea=(p: Polygon): number=>p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length]!;return sum+a[0]*b[1]-a[1]*b[0];},0)/2;
export const regionArea=(r: Region): number=>r.reduce((s,p)=>s+Math.abs(signedArea(p)),0);
function clean(p: Polygon): Polygon {
  const out=p.filter((a,i)=>{const b=p[(i+p.length-1)%p.length]; return !b||Math.hypot(a[0]-b[0],a[1]-b[1])>EPS;});
  return out.length>=3&&Math.abs(signedArea(out))>EPS ? (signedArea(out)<0?out.reverse():out) : [];
}
export function assertConvex(p: Polygon): void {
  if (p.length<3||p.some(v=>v.length!==2||!v.every(Number.isFinite))||Math.abs(signedArea(p))<EPS) throw new Error('Invalid polygon');
  const sign=Math.sign(signedArea(p));
  for(let i=0;i<p.length;i++) if(cross(p[i]!,p[(i+1)%p.length]!,p[(i+2)%p.length]!)*sign < -EPS) throw new Error('Region polygon must be convex');
  for(let i=0;i<p.length;i++) for(let j=i+1;j<p.length;j++) {
    if(j===i+1||(i===0&&j===p.length-1)) continue;
    if(segmentsCross(p[i]!,p[(i+1)%p.length]!,p[j]!,p[(j+1)%p.length]!)) throw new Error('Self-intersecting polygon');
  }
}
export function segmentsCross(a: Vec2,b: Vec2,c: Vec2,d: Vec2): boolean {
  return cross(a,b,c)*cross(a,b,d)<-EPS && cross(c,d,a)*cross(c,d,b)<-EPS;
}
function halfPlane(poly: Polygon,a: Vec2,b: Vec2,inside: boolean): Polygon {
  if(!poly.length)return [];
  const out: Polygon=[];
  for(let i=0;i<poly.length;i++) {
    const p=poly[i]!, q=poly[(i+1)%poly.length]!, dp=cross(a,b,p),dq=cross(a,b,q);
    const pi=inside?dp>=-EPS:dp<=EPS, qi=inside?dq>=-EPS:dq<=EPS;
    if(pi)out.push(p);
    if(pi!==qi) {const t=dp/(dp-dq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
  }
  return clean(out);
}
export function polygonIntersection(a: Polygon,b: Polygon): Polygon {
  let result=clean(a.map(p=>[...p] as Vec2)); const clip=clean(b.map(p=>[...p] as Vec2));
  for(let i=0;i<clip.length&&result.length;i++)result=halfPlane(result,clip[i]!,clip[(i+1)%clip.length]!,true);
  return result;
}
export function polygonDifference(a: Polygon,b: Polygon): Region {
  let remaining=clean(a.map(p=>[...p] as Vec2)); const clip=clean(b.map(p=>[...p] as Vec2)),out: Region=[];
  for(let i=0;i<clip.length&&remaining.length;i++) {
    const p=clip[i]!,q=clip[(i+1)%clip.length]!,outside=halfPlane(remaining,p,q,false);
    if(outside.length)out.push(outside);
    remaining=halfPlane(remaining,p,q,true);
  }
  return out;
}
export function regionDifference(a: Region,b: Region): Region {
  let pieces=a.map(p=>clean(p.map(v=>[...v] as Vec2)));
  for(const clip of b)pieces=pieces.flatMap(p=>polygonDifference(p,clip));
  return pieces.filter(p=>p.length>=3);
}
export function regionIntersection(a: Region,b: Region): Region {
  return a.flatMap(p=>b.map(q=>polygonIntersection(p,q))).filter(p=>p.length>=3);
}
export const contains=(outer: Region,inner: Region): boolean=>regionArea(regionDifference(inner,outer))<EPS;
export const transformRegion=(r: Region,m: Matrix): Region=>r.map(p=>p.map(v=>transformPoint(m,v)));
export function bounds(r: Region): [number,number,number,number] {
  const p=r.flat();if(!p.length)throw new Error('Empty region');
  const xs=p.map(v=>v[0]),ys=p.map(v=>v[1]),x=Math.min(...xs),y=Math.min(...ys);
  return [x,y,Math.max(...xs)-x,Math.max(...ys)-y];
}
function circle(cx:number,cy:number,rx:number,ry=rx,outer=false): Polygon {
  if(![cx,cy,rx,ry].every(Number.isFinite)||rx<=0||ry<=0)throw new Error('Invalid ellipse');
  const radius=Math.max(rx,ry),n=Math.max(16,Math.ceil(Math.PI/Math.acos(Math.max(-1,1-Math.min(.25,radius/4)/radius))));
  const scale=outer?1/Math.cos(Math.PI/n):1;
  return Array.from({length:n},(_,i)=>[cx+rx*scale*Math.cos(i*2*Math.PI/n),cy+ry*scale*Math.sin(i*2*Math.PI/n)] as Vec2);
}
/** 凸片加圓形筆刷，保守涵蓋 round cap/join；展平誤差 <0.75。 */
export function expandRegion(r: Region,amount: number): Region {
  if(amount===0)return r;
  if(amount<0)throw new Error('Negative region expansion');
  const brush=circle(0,0,amount,amount,true);
  return r.map(p=>convexHull(p.flatMap(v=>brush.map(b=>[v[0]+b[0],v[1]+b[1]] as Vec2))));
}
export function convexHull(points:Polygon):Polygon {
  // 世界／局部矩陣的浮點雜訊不能改變同x點的排序，否則近共線刪點會吞掉真正端點。
  const grid=1e8,unique=new Map<string,Vec2>();
  const quantize=(n:number):number=>Math.round(n*grid)/grid||0; // JSON不保留-0，統一後記憶體／重讀結果才一致。
  for(const p of points){const v:Vec2=[quantize(p[0]),quantize(p[1])];unique.set(v.join(','),v);}
  const sorted=[...unique.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),lower:Polygon=[],upper:Polygon=[];
  for(const p of sorted){while(lower.length>=2&&cross(lower.at(-2)!,lower.at(-1)!,p)<=EPS)lower.pop();lower.push(p);}
  for(const p of sorted.reverse()){while(upper.length>=2&&cross(upper.at(-2)!,upper.at(-1)!,p)<=EPS)upper.pop();upper.push(p);}
  lower.pop();upper.pop();return clean([...lower,...upper]);
}
/** 可見簡單凹 polygon 以耳切拆成凸片；拒絕自交及洞，避免假驗證。 */
export function triangulate(poly: Polygon): Region {
  const p=clean(poly);if(p.length<3)throw new Error('Degenerate SVG polygon');
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++) {
    if(j===i+1||(i===0&&j===p.length-1))continue;
    if(segmentsCross(p[i]!,p[(i+1)%p.length]!,p[j]!,p[(j+1)%p.length]!))throw new Error('Self-intersecting SVG geometry');
  }
  if(p.every((_,i)=>cross(p[i]!,p[(i+1)%p.length]!,p[(i+2)%p.length]!)>=-EPS))return [p];
  const work=[...p],out:Region=[];
  while(work.length>3) {
    let found=false;
    for(let i=0;i<work.length;i++) {
      const a=work[(i+work.length-1)%work.length]!,b=work[i]!,c=work[(i+1)%work.length]!;
      if(cross(a,b,c)<=EPS)continue;
      if(work.some(v=>v!==a&&v!==b&&v!==c&&cross(a,b,v)>=-EPS&&cross(b,c,v)>=-EPS&&cross(c,a,v)>=-EPS))continue;
      out.push([a,b,c]);work.splice(i,1);found=true;break;
    }
    if(!found)throw new Error('Cannot triangulate SVG polygon');
  }
  out.push(work);return out;
}
function numbers(s:string):number[] {
  const token=s.match(/[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g)??[];
  if(s.replace(/[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g,'').replace(/[\s,]/g,''))throw new Error('Invalid SVG numeric syntax');
  const result=token.map(Number);if(!result.every(Number.isFinite))throw new Error('Non-finite SVG number');return result;
}
function pathPolygons(d:string):Polygon[] {
  const tokens=d.match(/[A-Za-z]|[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g)??[];
  if(d.replace(/[A-Za-z]|[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g,'').replace(/[\s,]/g,''))throw new Error('Invalid path syntax');
  const out:Polygon[]=[];let p:Polygon=[],command='',closed=true;
  for(let i=0;i<tokens.length;) {
    const t=tokens[i]!;
    if(/^[A-Za-z]$/.test(t)) {
      if(!['M','L','Z'].includes(t))throw new Error(`Unsupported path command: ${t}`);
      command=t;i++;
      if(t==='Z'){if(p.length<3)throw new Error('Invalid closed path');out.push(p);p=[];closed=true;command='';continue;}
      if(t==='M'){if(!closed)throw new Error('Every SVG path subpath must close');closed=false;}
    }
    if(command!=='M'&&command!=='L')throw new Error('Path requires M/L/Z');
    const x=Number(tokens[i]),y=Number(tokens[i+1]);if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error('Incomplete path point');
    p.push([x,y]);i+=2;if(command==='M')command='L';
  }
  if(!closed||p.length)throw new Error('Open SVG paths are not supported');
  if(out.length>1)throw new Error('Use separate shapes instead of compound SVG paths');
  return out;
}
type Attrs=Record<string,string>;
function attributes(s:string):Attrs {
  const out:Attrs={};let end=0;
  const re=/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs;let m:RegExpExecArray|null;
  while((m=re.exec(s))){if(s.slice(end,m.index).trim())throw new Error('Malformed SVG attribute');if(out[m[1]!]!==undefined)throw new Error('Duplicate SVG attribute');out[m[1]!]=m[3]!;end=re.lastIndex;}
  if(s.slice(end).trim())throw new Error('Malformed SVG attributes');return out;
}
/** 僅解析本批約定素材語法；所有未支援可見幾何均明確拒絕。 */
export function parseSvgGeometry(svg:string,elementId:string):Region {
  if(/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b/i.test(svg))throw new Error('Unsupported SVG document content');
  const stack:{tag:string;active:boolean;defs:boolean;attrs:Attrs;depth:number}[]=[];
  let rootCount=0;const result:Region=[];
  const tags=svg.replace(/<!--[\s\S]*?-->/g,'').replace(/<\?[\s\S]*?\?>/g,'').match(/<[^>]*>/g)??[];
  for(const token of tags) {
    const closing=/^<\//.test(token),self=/\/\s*>$/.test(token),match=token.match(/^<\/?([\w:-]+)([\s\S]*?)\/?\s*>$/);
    if(!match)throw new Error('Malformed SVG tag');
    const tag=match[1]!;
    if(closing){if(stack.pop()?.tag!==tag)throw new Error('Unbalanced SVG tags');continue;}
    const own=attributes(match[2]!),parent=stack.at(-1),defs=tag==='defs'||(parent?.defs??false);
    if(own.id===elementId){if(tag!=='g')throw new Error('Attachment root must be g');rootCount++;}
    const active=(parent?.active??false)||own.id===elementId;
    const inherited:Attrs={};for(const k of ['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity','fill-opacity','stroke-opacity'])if(parent?.attrs[k]!==undefined)inherited[k]=parent.attrs[k]!;
    const attrs={...inherited,...own},depth=(parent?.depth??0)+(active&&tag==='g'?1:0);
    if(['transform','clip-path','mask','filter','style','vector-effect'].some(k=>own[k]!==undefined))throw new Error(`Unsupported SVG presentation on ${tag}`);
    if(['use','image','text','polyline','line','clipPath','mask','filter','symbol','pattern','style','animate','animateTransform','set'].includes(tag))throw new Error(`Unsupported SVG element: ${tag}`);
    if(defs&&!['defs','linearGradient','radialGradient','stop','title','desc'].includes(tag))throw new Error(`Unsupported SVG defs: ${tag}`);
    if(!defs&&!['svg','g','path','polygon','circle','ellipse','rect','title','desc','metadata'].includes(tag))throw new Error(`Unsupported SVG element: ${tag}`);
    if(depth>2)throw new Error('Attachment g depth exceeds two');
    if(!active&&!defs&&['path','polygon','circle','ellipse','rect'].includes(tag))throw new Error('Geometry outside attachment root');
    if(active&&!defs&&['path','polygon','circle','ellipse','rect'].includes(tag)) {
      const num=(k:string,fallback=0):number=>{const ns=numbers(attrs[k]??String(fallback));if(ns.length!==1)throw new Error(`Invalid ${tag}.${k}`);return ns[0]!;};
      let shape:Region=[];
      if(tag==='polygon'){const ns=numbers(attrs.points??'');if(ns.length%2)throw new Error('Odd polygon coordinate count');shape=triangulate(Array.from({length:ns.length/2},(_,i)=>[ns[i*2]!,ns[i*2+1]!]));}
      if(tag==='path')shape=pathPolygons(attrs.d??'').flatMap(triangulate);
      if(tag==='circle'||tag==='ellipse'){const rx=num(tag==='circle'?'r':'rx'),ry=tag==='circle'?rx:num('ry');shape=[circle(num('cx'),num('cy'),rx,ry,true)];}
      if(tag==='rect'){if(num('rx')!==0||num('ry')!==0)throw new Error('Rounded rect unsupported');const x=num('x'),y=num('y'),w=num('width'),h=num('height');if(w<=0||h<=0)throw new Error('Invalid rect');shape=[[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]];}
      if(attrs['fill-rule']&&attrs['fill-rule']!=='nonzero')throw new Error('Unsupported SVG fill rule');
      const fill=(attrs.fill??'black')!=='none'&&num('fill-opacity',1)>0,stroke=attrs.stroke!==undefined&&attrs.stroke!=='none'&&num('stroke-opacity',1)>0;
      const width=num('stroke-width',1);if(width<0)throw new Error('Negative stroke width');
      if(stroke&&width>0&&(attrs['stroke-linejoin']!=='round'||attrs['stroke-linecap']!=='round'))throw new Error('SVG stroke requires round join and cap');
      if(num('opacity',1)>0){if(fill)result.push(...shape);if(stroke&&width>0){const expanded=expandRegion(shape,width/2);result.push(...(fill?expanded:regionDifference(expanded,shape)));}}
    }
    if(!self)stack.push({tag,active,defs,attrs,depth});
  }
  if(stack.length||rootCount!==1)throw new Error(`Expected one attachment root ${elementId}`);
  if(!result.length)throw new Error(`No visible geometry: ${elementId}`);
  return result;
}
