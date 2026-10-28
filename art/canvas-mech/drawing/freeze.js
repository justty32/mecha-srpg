export const PLAN_HASH='f1b97b47699338a391a1f739c92cdf51e68169df5203f3e6c9f9d4735669bcfa';
export const JOBS_HASH='aedd37267a21e6edeb197fd0c4339a16d4919bdd3252d622180ec56743362d7b';
export function signature(job) {
  return JSON.stringify([job.interfaceVersion,job.planHash,job.nodeId,job.ancestorPath,job.localGeometry,job.material,job.attachments,job.pivot,job.layerKey,job.requiredCoverage]);
}
