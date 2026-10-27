import type { Frame, Joint, Matrix, Pose, Slot, Transform, Vec2 } from './schema.ts';

export const identity = (): Matrix => [1, 0, 0, 1, 0, 0];
export function multiply(a: Matrix, b: Matrix): Matrix {
  return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1],
    a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3],
    a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
}
export function transformPoint(m: Matrix, p: Vec2): Vec2 {
  return [m[0]*p[0]+m[2]*p[1]+m[4], m[1]*p[0]+m[3]*p[1]+m[5]];
}
export function transformMatrix(t: Transform): Matrix {
  if (![t.x, t.y, t.rotation].every(Number.isFinite)) throw new Error('Non-finite transform');
  const r = t.rotation * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return [c, s, -s, c, t.x, t.y];
}
export function inverse(m: Matrix): Matrix {
  const d = m[0]*m[3]-m[1]*m[2];
  if (!Number.isFinite(d) || Math.abs(d)<1e-12) throw new Error('Singular matrix');
  return [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d,
    (m[2]*m[5]-m[3]*m[4])/d,(m[1]*m[4]-m[0]*m[5])/d];
}
export function worldMatrices(bones: Joint[], pose: Pose = { id: 'bind', angles: {} }): Record<string, Matrix> {
  const byId = new Map(bones.map(b => [b.id,b]));
  if (byId.size !== bones.length) throw new Error('Duplicate bone id');
  for (const id of Object.keys(pose.angles)) if (!byId.has(id)) throw new Error(`Unknown pose bone: ${id}`);
  const result: Record<string, Matrix> = {}, visiting = new Set<string>();
  const deltas = new Map<string, number>();
  function delta(id: string, trail = new Set<string>()): number {
    const cached = deltas.get(id); if (cached !== undefined) return cached;
    const bone = byId.get(id); if (!bone) throw new Error(`Unknown follow bone: ${id}`);
    if (trail.has(id)) throw new Error(`Follow cycle: ${id}`);
    trail.add(id);
    const d = bone.follow ? delta(bone.follow.bone,trail)*bone.follow.factor : (pose.angles[id]??0);
    if (!Number.isFinite(d) || d<bone.limits[0]-1e-8 || d>bone.limits[1]+1e-8) throw new Error(`Bone limits: ${id} (${d})`);
    deltas.set(id,d); trail.delete(id); return d;
  }
  function visit(id: string): Matrix {
    if (result[id]) return result[id];
    if (visiting.has(id)) throw new Error(`Bone cycle: ${id}`);
    const b = byId.get(id); if (!b) throw new Error(`Unknown parent bone: ${id}`);
    visiting.add(id);
    const parent = b.parent === null ? identity() : visit(b.parent);
    result[id] = multiply(parent,transformMatrix({...b.bind, rotation:b.bind.rotation+delta(id)}));
    visiting.delete(id); return result[id];
  }
  for (const b of bones) visit(b.id);
  return result;
}
export function frameMatrix(frame: Frame, worlds: Record<string, Matrix>): Matrix {
  const bone = worlds[frame.bone]; if (!bone) throw new Error(`Unknown frame bone: ${frame.bone}`);
  return multiply(bone, transformMatrix(frame.transform));
}
export function slotMatrices(slots: Slot[], worlds: Record<string, Matrix>): Record<string, Matrix> {
  const result: Record<string, Matrix> = {};
  for (const s of slots) {
    if (result[s.id]) throw new Error(`Duplicate slot: ${s.id}`);
    const bone = worlds[s.bone]; if (!bone) throw new Error(`Unknown slot bone: ${s.bone}`);
    result[s.id] = multiply(bone,transformMatrix(s.local));
  }
  return result;
}
export const smoothstep = (t: number): number => { const x=Math.min(1,Math.max(0,t)); return x*x*(3-2*x); };
export function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const u=smoothstep(t), angles: Record<string, number>={};
  for (const id of new Set([...Object.keys(a.angles),...Object.keys(b.angles)])) angles[id]=(a.angles[id]??0)*(1-u)+(b.angles[id]??0)*u;
  return {id:`${a.id}->${b.id}`,angles};
}
export function sampleTransition(a: Pose,b: Pose,count=21): Pose[] {
  if (!Number.isInteger(count)||count<21) throw new Error('Transition requires at least 21 samples');
  return Array.from({length:count},(_,i)=>interpolatePose(a,b,i/(count-1)));
}
