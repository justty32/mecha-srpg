import { createModelView } from './model-view.js';
import { mountTree } from './tree.js';
import { mountControls } from './controls.js';

export function mountDelivery({ studio, onReady, setCamera }, api, createLeafMesh, expectedHash) {
  let tree;
  const view = createModelView({ studio, api, createLeafMesh, expectedHash, onSelect: id => tree?.reveal(id) });
  tree = mountTree(view);
  const ids = { shoulder: 'root.arm-left', elbow: 'root.arm-left.forearm', knee: 'root.leg-left.shin' };
  const joints = {};
  for (const [name, nodeId] of Object.entries(ids)) {
    const joint = view.plan.rig.find(joint => joint.nodeId === nodeId);
    if (!joint?.limits) throw new Error(`正式 rig 缺少關節控制：${nodeId}`);
    joints[name] = { nodeId, min: joint.limits.min, max: joint.limits.max };
  }
  const names = { idle: '待機', guard: '戒備', low: '低姿支撐' };
  const poses = Object.entries(view.plan.poses).map(([id, angles]) => ({ id, angles, name: names[id] ?? id }));
  const controls = mountControls(view, studio, { joints, poses, onChange: tree.sync, onReset: () => setCamera('iso') });
  document.querySelector('#render-note').textContent = '點選實體零件 · 層樹同步';
  onReady({
    snapshot: () => ({ ...view.snapshot(), playing: controls.playing, connectionCount: view.plan.connections.length, coverageCount: view.jobs.reduce((count, job) => count + job.requiredCoverage.length, 0) }),
    select(id) { view.select(id); tree.reveal(id); },
    visible(id, value) { view.visible(id, value); tree.sync(); },
    solo(id) { view.solo(id); tree.sync(); },
    pose(pose) { controls.pause(); view.pose(pose); tree.sync(); },
    explode(value) { view.explode(value); tree.sync(); },
    project: view.project,
    opticsVisibility: view.opticsVisibility,
  });
}
