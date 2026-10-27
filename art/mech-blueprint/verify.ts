import type { Attachment, Blueprint, Diagnostic, LayoutData, OverlapRule, Region, WorkOrdersData } from './schema.ts';
import { parseSvgGeometry, regionIntersection, regionDifference, regionArea, transformRegion, bounds, contains } from './geometry.ts';
import { validateAttachmentGeometry, allowedOverlap } from './layout.ts';
import { worldMatrices, slotMatrices, frameMatrix, sampleTransition, transformPoint } from './rig.ts';
import { sourceFragment } from './render.ts';

type VerifyInput=Blueprint & {layout:LayoutData;orders:WorkOrdersData;attachments:Attachment[];sources:Record<string,string>;overlaps:OverlapRule[]};
const error=(code:string,message:string,ids:string[],region?:Region):Diagnostic=>({code,severity:'error',message,ids,...(region?{region}:{})});
const intersects=(a:[number,number,number,number],b:[number,number,number,number])=>a[0]<=b[0]+b[2]&&b[0]<=a[0]+a[2]&&a[1]<=b[1]+b[3]&&b[1]<=a[1]+a[3];
export function verifyBlueprint(input:VerifyInput): {diagnostics:Diagnostic[];summary:{attachments:number;parsed:number;transitions:number;samples:number;sampleFailures:number}} {
  const diagnostics:Diagnostic[]=[],actual=new Map<string,Region>(),orders=new Map(input.orders.orders.map(o=>[o.id,o])),seen=new Set<string>();
  const bindWorld=worldMatrices(input.rig.bones),bindSlots=slotMatrices(input.slots.slots,bindWorld);
  for(const a of input.attachments){
    if(seen.has(a.id))diagnostics.push(error('duplicate-attachment','Duplicate attachment ID',[a.id]));seen.add(a.id);
    const order=orders.get(a.id),source=input.sources[a.id],slot=input.slots.slots.find(s=>s.attachment===a.id);
    if(!order||!slot){diagnostics.push(error('attachment-reference','Attachment has no work order or slot',[a.id]));continue;}
    if(!source){diagnostics.push(error('missing-source','Independent SVG source is missing',[a.id]));continue;}
    if(a.workOrderRevision!==order.revision)diagnostics.push(error('stale-work-order','Attachment must declare the current work order revision',[a.id]));
    try{sourceFragment(source,a);const parsed=parseSvgGeometry(source,a.element),r:Region=[];for(const p of parsed)if(!contains(r,[p]))r.push(p);actual.set(a.id,r);for(const d of validateAttachmentGeometry(a,order,r))diagnostics.push({...d,...(d.region?{region:transformRegion(d.region,bindSlots[slot.id]!)}:{}),pose:'bind',sample:0});}
    catch(e){diagnostics.push(error('svg-geometry',String(e),[a.id]));}
  }
  for(const o of input.orders.orders)if(!seen.has(o.id))diagnostics.push(error('missing-attachment','Work order has no independent attachment',[o.id]));
  const ruleIds=new Set<string>();
  for(const r of input.overlaps){if(ruleIds.has(r.id)||r.a===r.b||!orders.has(r.a)||!orders.has(r.b)||!r.reason.trim()||!r.poses.length||r.poses.some(p=>p==='*'||!input.poses.poses.some(s=>s.id===p))||!r.zone.region.length)diagnostics.push(error('overlap-rule','Overlap rule needs unique ID, two valid parts, bounded region, reason and explicit poses',[r.id,r.a,r.b]));ruleIds.add(r.id);}
  const canvas:Region=[[[0,0],[input.design.canvas.width,0],[input.design.canvas.width,input.design.canvas.height],[0,input.design.canvas.height]]];
  const reports=new Map<string,Diagnostic>();let samples=0,sampleFailures=0;
  function report(d:Diagnostic,pose:string,sample:number){sampleFailures++;const key=[d.code,...d.ids,pose].join('|');if(!reports.has(key))reports.set(key,{...d,pose,sample});}
  function check(pose:Parameters<typeof worldMatrices>[1],poseId:string,sample:number){samples++;
    let worlds,matrices;try{worlds=worldMatrices(input.rig.bones,pose);matrices=slotMatrices(input.slots.slots,worlds);}catch(e){report(error('pose-limits',String(e),[]),poseId,sample);return;}
    const regions=new Map<string,Region>(),boxes=new Map<string,[number,number,number,number]>();
    for(const slot of input.slots.slots){if(!actual.has(slot.attachment))continue;const attachment=input.attachments.find(a=>a.id===slot.attachment)!;const transformed=transformRegion(attachment.occupancy,matrices[slot.id]!);regions.set(slot.attachment,transformed);boxes.set(slot.attachment,bounds(transformed));
      const outside=regionDifference(transformed,canvas);if(regionArea(outside)>1e-5)report(error('canvas','Verified occupancy leaves the canvas',[slot.attachment],outside),poseId,sample);
      const a=input.attachments.find(a=>a.id===slot.attachment)!,o=orders.get(a.id)!;
      const expected=frameMatrix(o.frame,worlds);
      for(const contact of a.contacts){
        const socket=o.sockets.find(s=>s.id===contact.socket);if(!socket)continue;
        const p=transformPoint(matrices[slot.id]!,contact.at),mount=transformPoint(expected,socket.at);
        const marker:Region=[[[p[0]-3,p[1]-3],[p[0]+3,p[1]-3],[p[0]+3,p[1]+3],[p[0]-3,p[1]+3]]];
        if(Math.hypot(p[0]-mount[0],p[1]-mount[1])>1)report(error('moving-contact','Attachment contact differs from its work-order mount by over 1 unit',[a.id,contact.socket],marker),poseId,sample);
        if(socket.targetBone){const targetMatrix=worlds[socket.targetBone];
          if(!targetMatrix||!socket.targetAt){report(error('contact-target','Cross-bone socket needs a valid target bone and targetAt',[a.id,contact.socket,socket.targetBone]),poseId,sample);continue;}
          const target=transformPoint(targetMatrix,socket.targetAt);
          if(Math.hypot(p[0]-target[0],p[1]-target[1])>1)report(error('cross-bone-contact','Attachment contact separates from its target bone by over 1 unit',[a.id,contact.socket,socket.targetBone],marker),poseId,sample);
        }
      }
    }
    const ids=[...regions.keys()];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=ids[i]!,b=ids[j]!;if(!intersects(boxes.get(a)!,boxes.get(b)!))continue;
      const overlap=regionIntersection(regions.get(a)!,regions.get(b)!);if(regionArea(overlap)<1e-5)continue;
      const unallowed=allowedOverlap(overlap,a,b,poseId,input.overlaps,worlds);if(regionArea(unallowed)>1e-5)report(error('projection-overlap','Unexplained 2D projected intersection; first failing sample shown',[a,b],unallowed),poseId,sample);
    }
  }
  const bind=input.poses.poses.find(p=>p.id==='bind')||{id:'bind',angles:{}};check(bind,'bind',0);
  let transitions=0;
  for(const step of input.poses.sequence){const from=input.poses.poses.find(p=>p.id===step.from),to=input.poses.poses.find(p=>p.id===step.to);if(!from||!to){diagnostics.push(error('pose-sequence','Unknown sequence endpoint',[step.from,step.to]));continue;}transitions++;sampleTransition(from,to,21).forEach((p,i)=>check(p,to.id==='bind'?from.id:to.id,to.id==='bind'?20-i:i));}
  diagnostics.push(...reports.values());
  return {diagnostics,summary:{attachments:input.attachments.length,parsed:actual.size,transitions,samples,sampleFailures}};
}
