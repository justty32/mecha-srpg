export function canonical(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';}
// SHA-256，純JS可在瀏覽器驗凍結來源；常數由質數小數部分產生。
const primes=[];for(let n=2;primes.length<64;n++){if(primes.every(p=>p*p>n||n%p))primes.push(n);}
const K=primes.map(p=>(Math.cbrt(p)%1*4294967296)>>>0);
const initial=primes.slice(0,8).map(p=>(Math.sqrt(p)%1*4294967296)>>>0);
const rr=(x,n)=>(x>>>n)|(x<<(32-n));
export function sha256(input){
 const bytes=new TextEncoder().encode(input),len=Math.ceil((bytes.length+9)/64)*64,data=new Uint8Array(len);data.set(bytes);data[bytes.length]=128;
 const view=new DataView(data.buffer);view.setUint32(len-8,Math.floor(bytes.length/536870912));view.setUint32(len-4,bytes.length*8>>>0);const h=[...initial];
 for(let off=0;off<len;off+=64){const w=new Uint32Array(64);for(let i=0;i<16;i++)w[i]=view.getUint32(off+i*4);for(let i=16;i<64;i++){const x=w[i-15],y=w[i-2];w[i]=(w[i-16]+(rr(x,7)^rr(x,18)^(x>>>3))+w[i-7]+(rr(y,17)^rr(y,19)^(y>>>10)))>>>0;}
 let [a,b,c,d,e,f,g,q]=h;
 for(let i=0;i<64;i++){const t1=(q+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;q=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
 [a,b,c,d,e,f,g,q].forEach((v,i)=>h[i]=(h[i]+v)>>>0);
 }return h.map(v=>v.toString(16).padStart(8,'0')).join('');
}
export const hashValue=v=>sha256(canonical(v));
export function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
