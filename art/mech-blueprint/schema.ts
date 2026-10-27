/** 固定視角剛性附件原型；座標與 delta 契約見規劃 CONTRACT。 */
export type Vec2 = [number, number];
export type Polygon = Vec2[];
export type Region = Polygon[];
export type Matrix = [number, number, number, number, number, number];
export type Transform = { x: number; y: number; rotation: number };
export type Frame = { bone: string; transform: Transform };
export type Joint = {
  id: string; parent: string | null; bind: Transform;
  length: number; limits: [number, number];
  follow?: { bone: string; factor: number };
};
export type Socket = { id: string; at: Vec2; axis: number; targetBone?:string; targetAt?:Vec2 };
export type LayoutNode = {
  id: string; parent: string | null;
  level: 'machine' | 'major' | 'assembly' | 'part';
  frame: Frame; envelope: Region; sockets: Socket[];
};
export type Slot = {
  id: string; bone: string; local: Transform;
  semantic: string; attachment: string;
};
export type Attachment = {
  id: string; source: string; element: string; layout: string;
  workOrderRevision: string;
  viewBox: [number, number, number, number]; occupancy: Region;
  contacts: { socket: string; at: Vec2 }[];
};
export type WorkOrder = {
  id: string; revision: string; layout: string; slot: string;
  localEnvelope: Region; keepOut: Region; contacts: Vec2[];
  viewBox: [number, number, number, number];
  role: string; material: string; silhouette: string;
  source: string; element: string; frame: Frame; sockets: Socket[];
};
export type Pose = { id: string; angles: Record<string, number> };
export type Order = { base: string[]; before: [string, string][] };
export type OverlapRule = {
  id: string; a: string; b: string;
  kind: 'joint-cover' | 'panel-stack' | 'projection';
  zone: { frame: Frame; region: Region }; reason: string; poses: string[];
};
export type OverlapIntent = Pick<OverlapRule,'a'|'b'|'kind'|'reason'> & {regionA?:Region;regionB?:Region};
export type PartSeed = {
  id: string; layout: string; slot: string; role: string; material: string;
  silhouette: string; keepOut: Region; source: string; element: string;
};
export type Design = {
  version: string; id: string; revision: string;
  canvas: { width: number; height: number }; nodes: LayoutNode[]; parts: PartSeed[];
  proportions?: Record<string, number>;
  allocation?: {
    majors: { id:string; region:Region }[];
    assemblies: { id:string; major:string; bone:string; bounds:[number,number,number,number]; profile:Polygon; extensions?:Region }[];
    leaves: { id:string; assembly:string; bone:string; bounds:[number,number,number,number]; profile:Polygon; contact:Vec2; sockets?:Socket[]; extensions?:Region }[];
  };
};
export type RigData = { version: string; bones: Joint[] };
export type SlotsData = { version: string; slots: Slot[] };
export type OrderData = Order & { version: string };
export type PoseData = {
  version: string; poses: Pose[];
  sequence: { from: string; to: string; duration: number }[];
};
export type LayoutData = {
  version: string; revision: string; sourceHash:string; canvas: Design['canvas']; nodes: LayoutNode[];
};
export type WorkOrdersData = { version: string; revision: string; sourceHash:string; orders: WorkOrder[] };
export type Diagnostic = {
  code: string; severity: 'error' | 'warning'; message: string;
  ids: string[]; pose?: string; sample?: number; region?: Region;
};
export type Blueprint = {
  design: Design; rig: RigData; slots: SlotsData; order: OrderData; poses: PoseData;
};
