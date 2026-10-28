export type Point = { x:number; y:number };
export type Bounds = Point & { width:number; height:number };
export type Size = { width:number; height:number };
export type Matrix = [number,number,number,number,number,number];
export type LocalTransform = Point & { rotationDeg:number; scaleX:number; scaleY:number };
export type Material = { id:string; base:string; role:string };
export type LayerKey = [number,number];
export type Limits = { min:number; max:number };
export type Pose = { id:string; angles:Record<string,number> };
export interface NodeSpec {
  key:string; name:string; purpose:string; size:Size; localTransform:LocalTransform;
  envelope:Bounds; usableBounds:Bounds; pivot:Point; attachments:Record<string,Point>;
  material:string; children:NodeSpec[];
}
export interface AssemblyNode extends Omit<NodeSpec,'key'|'children'> {
  id:string; parentId:string|null; kind:'group'|'leaf';
}
export type Joint = { nodeId:string; parentId:string|null; localTransform:LocalTransform; pivot:Point; limits:Limits|null };
export type Endpoint = { nodeId:string; attachmentId:string };
export type Link = { nodeId:string; start:Endpoint; end:Endpoint; restLength:number };
export type ContactEndpoint = Endpoint & {coverageRadius:number};
export type Connection = {id:string;a:ContactEndpoint;b:ContactEndpoint;radius:number;tolerance:number;poses:string[]};
export type RequiredCoverage = {connectionId:string;attachmentId:string;center:Point;radius:number;mateNodeId:string};
export type DrawEntry = { nodeId:string; layerKey:LayerKey };
export type Summary = { nodeCount:number; leafCount:number; maxDepth:number };
export type View = { projection:'fixed-front-three-quarter'; width:number; height:number; features:string[] };
export interface Design {
  id:string; view:View; palette:Record<string,Material>; root:NodeSpec;
  rigOverrides:Record<string,{parentId?:string|null;limits?:Limits}>;
  links:Link[]; connections:Connection[]; poses:Record<string,Pose>;
}
export interface AssemblyPlan {
  interfaceVersion:'1.1.0'; schemaVersion:'reef-hawk-assembly/1'; id:string; view:View;
  palette:Record<string,Material>; rootId:string; nodes:AssemblyNode[];
  rig:{joints:Joint[];links:Link[]}; connections:Connection[]; drawOrder:DrawEntry[]; poses:Record<string,Pose>;
  summary:Summary; hash:string;
}
export type ValidationError = { code:string; nodeId:string|null; message:string };
export type ValidationResult = { ok:boolean; errors:ValidationError[]; summary:Summary|null; hash:string|null };
export interface LeafJob {
  interfaceVersion:'1.1.0'; planHash:string; nodeId:string; name:string; purpose:string;
  ancestorPath:string[]; rigChain:string[]; rigParentId:string|null;
  localTransform:LocalTransform;
  localGeometry:{bounds:Bounds;usableBounds:Bounds;size:Size;linkRestLength:number|null};
  material:Material; occlusion:{occludedBy:string[];clipToEnvelope:false};
  attachments:Record<string,Point>; pivot:Point; layerKey:LayerKey; restWorldMatrix:Matrix;
  requiredCoverage:RequiredCoverage[];
}
export type Linkage = { start:Point; end:Point; length:number; angleDeg:number };
export interface VisualState {
  worldMatrix:Matrix; worldBounds:Bounds; worldPivot:Point;
  attachments:Record<string,Point>; rotationDeltaDeg:number; linkage:Linkage|null;
}
export interface FrameState {
  interfaceVersion:'1.1.0'; planHash:string; poseId:string;
  byNode:Record<string,VisualState>; drawOrder:DrawEntry[];
}
// Canvas 型別僅為 drawing 消費端契約；核心執行期完全不讀 Canvas。
export type CanvasPainter<Context = unknown> = (ctx:Context,visualState:VisualState)=>void;
export type CreateLeafPainter<Context = unknown> = (job:LeafJob)=>CanvasPainter<Context>;
// ctx 已由整合線套用 worldMatrix；這只是型別，核心沒有實作。
export type DrawLeaf<Context = unknown> = (ctx:Context,job:LeafJob,visualState:VisualState)=>void;
export const INTERFACE_VERSION:'1.1.0';
export const SCHEMA_VERSION:'reef-hawk-assembly/1';
export const GATES:Readonly<{maxNodes:260;maxLeaves:160;minLeafDepth:4;maxDepth:16;maxChildren:8;maxBytes:15000000}>;
export function createReefHawkDesign():Design;
export function configureMech(design?:Design):AssemblyPlan;
export function validateAssembly(plan:unknown):ValidationResult;
export function createLeafJobs(plan:AssemblyPlan):LeafJob[];
export function evaluatePose(plan:AssemblyPlan,pose?:string|Pose):FrameState;
