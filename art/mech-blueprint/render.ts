import { worldMatrices, slotMatrices } from './rig.ts';
import type { Blueprint, LayoutData, WorkOrdersData, Attachment, Diagnostic, Matrix } from './schema.ts';

export type RenderInput = Blueprint & {
  layout: LayoutData; orders: WorkOrdersData; attachments: Attachment[];
  sources: Record<string, string>; diagnostics: Diagnostic[];
};
export const escapeXml = (s: string): string => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export const matrixText = (m: Matrix): string => `matrix(${m.map(n=>Number(n.toFixed(6))).join(' ')})`;

/** 分件圖各自等比置中；不沿用骨架旋轉，也不影響組裝姿態。 */
export function explodedMatrix(viewBox:[number,number,number,number],index:number):Matrix {
  const [x,y,width,height]=viewBox;
  if(width<=0||height<=0)throw new Error('Invalid exploded viewBox');
  const scale=Math.min(196/width,132/height),column=index%8,row=Math.floor(index/8);
  return [scale,0,0,scale,column*220+110-(x+width/2)*scale,row*180+78-(y+height/2)*scale];
}

/** 每件來源保留根 g；只在 runtime 根上套世界矩陣。 */
export function sourceFragment(svg: string, attachment: Attachment): string {
  if (/<(?:script|foreignObject|image|use)\b/i.test(svg) || /\bon\w+\s*=|(?:href|url)\s*\(?\s*["']?\s*(?:https?:|data:|\/\/)/i.test(svg)) throw new Error(`Unsafe SVG: ${attachment.id}`);
  const body = svg.replace(/<\?xml[^>]*>/g,'').replace(/<!--[^]*?-->/g,'').match(/<svg\b[^>]*>([^]*)<\/svg>\s*$/i)?.[1];
  if (!body || !new RegExp(`\\bid=(["'])${attachment.element.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\1`).test(body)) throw new Error(`Missing SVG root: ${attachment.id}`);
  // defs 可能與其他附件同名；每份來源的識別符全部加前綴。
  const prefix = `${attachment.id}--`;
  return body.replace(/\bid=(["'])(.*?)\1/g,(_,quote,id)=>`id="${prefix}${id}"`).replace(/url\(#([^)]*)\)/g,(_,id)=>`url(#${prefix}${id})`);
}

export function renderBlueprint(input: RenderInput, assets:{template:string;style:string;rigRuntime:string;viewer:string}): { assembled: string; exploded: string; html: string; viewerData: unknown } {
  const {width,height}=input.design.canvas;
  const worlds=worldMatrices(input.rig.bones), matrices=slotMatrices(input.slots.slots,worlds);
  const byId=new Map(input.attachments.map(a=>[a.id,a]));
  const fragments:Record<string,string>={};
  for (const a of input.attachments) {
    const source=input.sources[a.id];
    if (source) fragments[a.id]=sourceFragment(source,a);
  }
  function svg(exploded:boolean):string {
    const nodes=input.order.base.map((id,i)=>{
      const slot=input.slots.slots.find(s=>s.id===id); if(!slot) throw new Error(`Missing slot ${id}`);
      const a=byId.get(slot.attachment); if(!a) return '';const fragment=fragments[a.id];if(!fragment)return '';
      const m=exploded?explodedMatrix(a.viewBox,i):matrices[id]!;
      const label=exploded?`<text x="${i%8*220+110}" y="${Math.floor(i/8)*180+170}" text-anchor="middle" fill="#9bbcc9" font-size="12">${escapeXml(a.id)}</text>`:'';
      return fragment.replace(new RegExp(`(<g\\b[^>]*id="${a.id}--${a.element}")`),`$1 data-attachment="${a.id}" transform="${matrixText(m)}"`)+label;
    }).join('\n');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${exploded?1850:width} ${exploded?1550:height}" role="img" aria-label="${exploded?'獨立分件':'組裝機甲'}"><g id="stage">${nodes}</g></svg>`;
  }
  // 頁端只帶操作所需的schema欄位；配置種子、原始碼及遮擋規則留在生成端。
  const viewerData={
    design:{canvas:input.design.canvas},rig:input.rig,slots:input.slots,
    order:{base:input.order.base},poses:input.poses,
    layout:{nodes:input.layout.nodes,sourceHash:input.layout.sourceHash,revision:input.layout.revision},
    orders:{orders:input.orders.orders.map(({id,slot,localEnvelope,role,material})=>({id,slot,localEnvelope,role,material}))},
    attachments:input.attachments,diagnostics:input.diagnostics,fragments,
  };
  const safeScript=(s:string)=>s.replace(/<\/script/gi,'<\\/script');
  const html=assets.template.replace('/* STYLES */',()=>assets.style)
    .replace('/* DATA */',()=>safeScript(`window.BLUEPRINT=${JSON.stringify(viewerData)};`))
    .replace('/* RUNTIME */',()=>safeScript(assets.rigRuntime+'\n'+assets.viewer));
  return {assembled:svg(false),exploded:svg(true),html,viewerData};
}
