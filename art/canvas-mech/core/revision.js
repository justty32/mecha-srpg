import revision from './layout-revision.json' with { type:'json' };
import allocation from './layout-allocation.json' with { type:'json' };
import connections from './connection-allocation.json' with { type:'json' };
import { apply,inverse,matrix,mul,transform } from './math.js';

function resize(node,width=node.size.width,height=node.size.height) {
  node.size={width,height};
  node.envelope={x:-width/2,y:-height/2,width,height};
  inset(node);
  standardAttachments(node);
}
function inset(node) {
  const b=node.envelope,x=Math.min(2,b.width/8),y=Math.min(2,b.height/8);
  node.usableBounds={x:b.x+x,y:b.y+y,width:b.width-2*x,height:b.height-2*y};
}
function standardAttachments(node) {
  const b=node.envelope;
  Object.assign(node.attachments,{center:{x:0,y:0},top:{x:0,y:b.y},bottom:{x:0,y:b.y+b.height},left:{x:b.x,y:0},right:{x:b.x+b.width,y:0}});
}
export function designNodes(design) {
  const nodes=new Map();
  function walk(node,parentId) {
    const id=parentId?`${parentId}.${node.key}`:node.key;
    nodes.set(id,node);node.children.forEach(child=>walk(child,id));
  }
  walk(design.root,null);return nodes;
}
export function designWorlds(design) {
  const worlds=new Map();
  function walk(node,parentId) {
    const id=parentId?`${parentId}.${node.key}`:node.key;
    worlds.set(id,mul(parentId?worlds.get(parentId):[1,0,0,1,0,0],matrix(node.localTransform,node.pivot)));
    node.children.forEach(child=>walk(child,id));
  }
  walk(design.root,null);return worlds;
}
export function applyLeafRevision(design) {
  const nodes=designNodes(design);
  for(const row of revision.rows) {
    const node=nodes.get(row.nodeId);
    if(!node) throw new Error(`藝術重配節點不存在: ${row.nodeId}`);
    const {width,height,pivot,...placement}=row.patch;
    Object.assign(node.localTransform,placement);
    if(pivot) node.pivot=structuredClone(pivot);
    if(width!==undefined || height!==undefined) resize(node,width??node.size.width,height??node.size.height);
  }
  let worlds=designWorlds(design);
  for(const link of design.links) {
    const node=nodes.get(link.nodeId),parentId=link.nodeId.slice(0,link.nodeId.lastIndexOf('.'));
    const toLocal=inverse(worlds.get(parentId));
    const start=apply(toLocal,apply(worlds.get(link.start.nodeId),nodes.get(link.start.nodeId).attachments[link.start.attachmentId]));
    const end=apply(toLocal,apply(worlds.get(link.end.nodeId),nodes.get(link.end.nodeId).attachments[link.end.attachmentId]));
    link.restLength=Math.hypot(end.x-start.x,end.y-start.y);
    node.localTransform=transform((start.x+end.x)/2,(start.y+end.y)/2,Math.atan2(end.y-start.y,end.x-start.x)*180/Math.PI);
    resize(node,link.restLength,node.size.height);
  }
  return design;
}
export function applyCompactRevision(design) {
  applyLeafRevision(design);
  const nodes=designNodes(design);
  // 此表是離線設計已決定的逐層分配；執行期絕不從葉反向 auto-fit 父包絡。
  for(const row of allocation.rows) {
    const {nodeId,parentId,...geometry}=row;
    if(!nodes.get(nodeId)?.children.length) throw new Error(`群組配置不存在: ${nodeId}`);
    Object.assign(nodes.get(nodeId),structuredClone(geometry));
  }
  design.connections=connections.rows.map(row=>{
    for(const endpoint of [row.a,row.b]) nodes.get(endpoint.nodeId).attachments[endpoint.attachmentId]=structuredClone(endpoint.point);
    const endpoint=({point,...reference})=>reference;
    return {...structuredClone(row),a:endpoint(row.a),b:endpoint(row.b)};
  });
  return design;
}
