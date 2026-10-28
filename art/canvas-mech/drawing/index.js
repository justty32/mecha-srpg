import {registry} from './registry.js';
import {profiles} from './profiles.js';
import {signature,PLAN_HASH,JOBS_HASH} from './freeze.js';
import {paintProfile} from './paint.js';
export {PLAN_HASH,JOBS_HASH};
export const painterIds=Object.freeze(Object.keys(registry));
export function validateLeafJob(job) {
  if(!job || job.planHash!==PLAN_HASH || job.interfaceVersion!=='1.1.0') throw new Error('Drawing frozen version mismatch');
  const entry=registry[job.nodeId];
  if(!entry || signature(job)!==entry.signature) throw new Error(`Drawing leaf contract mismatch: ${job.nodeId}`);
  return entry;
}
export function createLeafPainter(job) {
  validateLeafJob(job);
  return (ctx,visualState) => drawLeaf(ctx,job,visualState);
}
// viewer 已套用 worldMatrix；此函式不追 rig、不改 job、不做世界變換。
export function drawLeaf(ctx,job,visualState={}) {
  const entry=validateLeafJob(job);
  paintProfile(ctx,job,profiles[entry.profile],visualState);
}
