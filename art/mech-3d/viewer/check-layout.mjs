import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function checkLayout(base) {
  const load = async name => JSON.parse(await readFile(resolve(base, 'model', name), 'utf8'));
  const manifest = await load('manifest.json');
  assert.equal(manifest.interfaceVersion, '1.1.1');
  assert.equal(manifest.frozen, true, '配置尚未正式凍結');
  for (const source of manifest.sources) {
    const bytes = await readFile(resolve(base, 'model', source.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, `來源偏離凍結：${source.file}`);
  }
  const api = await import(pathToFileURL(resolve(base, 'model/index.js')).href);
  const frozen = await import(pathToFileURL(resolve(base, 'model/frozen.js')).href);
  const { hashValue } = await import(pathToFileURL(resolve(base, 'model/hash.js')).href);
  const plan = api.configureModel();
  const validation = api.validateModel(plan);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(plan.hash, manifest.planHash);
  assert.equal(frozen.PLAN_HASH, manifest.planHash);
  assert.equal(frozen.JOBS_HASH, manifest.jobsHash);
  for (const [key, value] of Object.entries(plan.summary)) assert.equal(value, manifest.summary[key], `摘要不符：${key}`);
  assert.equal(plan.connections.length, manifest.summary.connectionCount);
  assert.equal(Object.keys(plan.poses).length, manifest.summary.poseCount);
  for (const name of ['staticAllocation', 'solidCoverage', 'threePoseContacts', 'finiteThickness']) assert.equal(manifest.checks[name], true, `模型證據未通過：${name}`);
  const jobs = api.createLeafJobs(plan);
  const saved = await load('leaf-jobs.json');
  assert.equal(saved.contract, 'wf-table/1');
  assert.deepEqual(jobs, saved.rows, '工作單與凍結快照不同');
  assert.equal(hashValue(jobs), frozen.JOBS_HASH, '工作單 canonical hash 不符');
  for (const job of jobs) assert.equal(hashValue(job), frozen.LEAF_HASHES[job.nodeId], `每葉凍結 hash 不符：${job.nodeId}`);
  assert.equal(jobs.reduce((count, job) => count + job.requiredCoverage.length, 0), manifest.summary.coverageCount);
  assert.ok(jobs.length <= 120 && plan.nodes.length <= 240, '件數超 gate');
  for (const name of Object.keys(plan.poses)) {
    const frame = api.evaluatePose(plan, name);
    assert.equal(frame.planHash, manifest.planHash);
    for (const node of Object.values(frame.byNode)) assert.ok(node.matrix.length === 16 && node.matrix.every(Number.isFinite), '非 finite 3D 世界矩陣');
  }
  assert.throws(() => api.evaluatePose(plan, { id: 'invalid', angles: { 'unknown-node': 1 } }));
  assert.throws(() => api.evaluatePose(plan, { id: 'invalid', angles: { 'root.arm-left': 10000 } }));
  return { manifest, api, plan, jobs };
}
