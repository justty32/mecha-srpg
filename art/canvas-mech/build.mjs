import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createModuleEmbedder } from './viewer/embed-modules.mjs';

const base = fileURLToPath(new URL('./', import.meta.url));
const read = path => readFile(resolve(base, path), 'utf8');
const provenance = JSON.parse(await read('vendor/SOURCE.json'));
const konva = await read('vendor/konva-10.9.0.min.js');
if (provenance.version !== '10.9.0' || createHash('sha256').update(konva).digest('hex') !== provenance.javascriptSha256) {
  throw new Error('固定 Konva 版本或內容雜湊不符');
}
await read('vendor/LICENSE.konva');
const manifest = JSON.parse(await read('core/manifest.json'));
assert.equal(manifest.frozen, true, '核心必須正式凍結');
assert.equal(manifest.interfaceVersion, '1.1.0');
for (const item of manifest.rows) {
  const bytes = await readFile(resolve(base, 'core', item.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, `核心檔案已偏離凍結：${item.file}`);
}
const core = await import(pathToFileURL(resolve(base, 'core/index.js')).href);
const plan = core.configureMech();
assert.equal(core.validateAssembly(plan).ok, true, '核心配置驗證失敗');
assert.equal(plan.hash, manifest.planHash, 'planHash 與 manifest 不同');
const jobs = core.createLeafJobs(plan);
const storedJobs = JSON.parse(await read('core/leaf-jobs.json'));
assert.equal(storedJobs.contract, 'wf-table/1');
assert.deepEqual(jobs, storedJobs.rows, 'LeafJob 與凍結工作單不同');
assert.ok(jobs.length <= 160 && plan.nodes.length <= 260, '葉數或節點數 gate 超限');
// 以真實核心的有效／無效姿態雙向證明契約檢查生效。
for (const pose of Object.keys(plan.poses)) core.evaluatePose(plan, pose);
assert.throws(() => core.evaluatePose(plan, { id: 'bad-joint', angles: { 'unknown-joint': 20 } }));
assert.throws(() => core.evaluatePose(plan, { id: 'bad-angle', angles: { 'root.arm-near.shoulder': 999 } }));
const modules = createModuleEmbedder(base);
const coreUrl = await modules.embed('core/index.js');
const embeddedCore = await import(coreUrl);
const embeddedPlan = embeddedCore.configureMech();
assert.equal(embeddedCore.validateAssembly(embeddedPlan).ok, true);
assert.equal(embeddedPlan.hash, plan.hash, '內嵌模組改變核心配置');
const browserModules = createModuleEmbedder(base, { importMap: true });
const browserCore = await browserModules.embed('core/index.js');
const drawingFrozen = !process.argv.includes('--core-only');
let delivery = `import * as core from ${JSON.stringify(browserCore)};\n`;
if (drawingFrozen) {
  const drawing = await import(pathToFileURL(resolve(base, 'drawing/index.js')).href);
  assert.equal(drawing.PLAN_HASH, manifest.planHash, '畫件 planHash 與核心不同');
  assert.equal(drawing.JOBS_HASH, manifest.jobsHash, '畫件 jobsHash 與核心不同');
  assert.equal(typeof drawing.drawLeaf, 'function', '缺少 drawLeaf');
  assert.deepEqual([...drawing.painterIds].sort(), jobs.map(job => job.nodeId).sort(), '畫件未涵蓋每一葉');
  for (const job of jobs) drawing.validateLeafJob(job);
  const drawingUrl = await modules.embed('drawing/index.js');
  const embeddedDrawing = await import(drawingUrl);
  assert.equal(embeddedDrawing.PLAN_HASH, plan.hash);
  for (const job of jobs) embeddedDrawing.validateLeafJob(job);
  const browserDrawing = await browserModules.embed('drawing/index.js');
  delivery += `import { drawLeaf } from ${JSON.stringify(browserDrawing)};\n`;
}
delivery += `try { window.dispatchEvent(new CustomEvent('canvas-mech-delivery', { detail: { core, coreFrozen: true, drawingFrozen: ${drawingFrozen}, interfaceVersion: '1.1.0', planHash: ${JSON.stringify(plan.hash)}, drawLeaf: ${drawingFrozen ? 'drawLeaf' : 'null'} } })); } catch(error) { window.dispatchEvent(new CustomEvent('canvas-mech-delivery-error', { detail: error.message })); throw error; }`;
const inline = value => value.replace(/<\/script/gi, '<\\/script');
// 以回呼替換，避免第三方 JS 的 $& 被 String.replace 當替換語法。
const template = await read('viewer/template.html');
const css = await read('viewer/style.css');
const app = [await read('viewer/scene.js'), await read('viewer/controls.js'), await read('viewer/app.js')].join('\n');
const result = template
  .replace('/*__STYLE__*/', () => css)
  .replace('/*__KONVA__*/', () => inline(konva))
  .replace('/*__APP__*/', () => inline(app))
  .replace('/*__IMPORT_MAP__*/', () => inline(JSON.stringify(browserModules.importMap)))
  .replace('/*__DELIVERY__*/', () => inline(delivery));
if (/\b(?:fetch|XMLHttpRequest)\s*\(/.test(app) || /<(?:script|link)[^>]+(?:src|href)=/i.test(result)) {
  throw new Error('離線展示不可使用 fetch 或外部 script/link');
}
async function sizeTree(directory) {
  let size = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    size += entry.isDirectory() ? await sizeTree(path) : (await stat(path)).size;
  }
  return size;
}
const currentSize = await sizeTree(base);
const oldSize = await stat(resolve(base, 'index.html')).then(item => item.size).catch(() => 0);
const bytes = currentSize - oldSize + Buffer.byteLength(result);
if (bytes > 15_000_000) throw new Error(`產物 ${bytes} bytes 超過 15 MB gate`);
await writeFile(resolve(base, 'index.html'), result);
const evidence = { status: drawingFrozen ? 'DRAWING_INTEGRATED_AWAITING_CDP' : 'CORE_INTEGRATED_WAITING_FOR_DRAWING', htmlBytes: Buffer.byteLength(result), artifactBytes: bytes, konva: '10.9.0', leafContract: 'PASS', planHash: plan.hash, leafCount: jobs.length, nodeCount: plan.nodes.length, maxDepth: plan.summary.maxDepth, embeddedModules: browserModules.moduleCount };
await writeFile(resolve(base, 'viewer/build-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
