import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { checkLayout } from './viewer/check-layout.mjs';
import { checkMesh } from './viewer/check-mesh.mjs';

const base = fileURLToPath(new URL('./', import.meta.url));
const require = createRequire(import.meta.url);
const esbuild = require(resolve(base, '../../node_modules/.mech3d-tools/node_modules/esbuild/lib/main.js'));
const read = path => readFile(resolve(base, path), 'utf8');
const vendor = JSON.parse(await read('vendor/integrity.json'));
assert.equal(vendor.three, '0.186.1');
assert.equal(vendor.esbuild, '0.28.2');
assert.equal(esbuild.version, '0.28.2');
for (const [file, expected] of Object.entries(vendor.artifacts)) {
  const actual = createHash('sha256').update(await readFile(resolve(base, 'vendor', file))).digest('hex');
  assert.equal(actual, expected, `vendor SHA256 不符：${file}`);
}
const framework = process.argv.includes('--framework');
let layout;
let mesh;
let code = "import { boot } from './main.js'; boot();";
if (!framework) {
  layout = await checkLayout(base);
  mesh = await checkMesh(base, layout);
  code = `import { boot } from './main.js';
import { mountDelivery } from './delivery.js';
import * as api from '../model/index.js';
import { createLeafMesh } from '../model/mesh.js';
boot({mount:options=>mountDelivery(options,api,createLeafMesh,${JSON.stringify(layout.manifest.planHash)})});`;
}
const bundle = await esbuild.build({
  stdin: { contents: code, resolveDir: resolve(base, 'viewer'), sourcefile: 'entry.js' },
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022',
  minify: true, legalComments: 'inline', metafile: true, logLevel: 'silent',
  alias: { three: resolve(base, 'vendor/three.module.min.js') },
});
const javascript = bundle.outputFiles[0].text;
assert.ok(!bundle.metafile.outputs[Object.keys(bundle.metafile.outputs)[0]].imports.length, '離線 bundle 仍有外部 imports');
const style = await read('viewer/style.css');
const html = (await read('viewer/template.html'))
  .replace('/*__STYLE__*/', () => style)
  .replace('/*__APP__*/', () => javascript.replace(/<\/script/gi, '<\\/script'));
const output = html;
async function treeSize(directory) {
  let bytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    bytes += entry.isDirectory() ? await treeSize(path) : (await stat(path)).size;
  }
  return bytes;
}
const previous = await stat(resolve(base, 'index.html')).then(file => file.size).catch(() => 0);
const bytes = await treeSize(base) - previous + Buffer.byteLength(output);
assert.ok(bytes <= 25_000_000, `產物超過25 MB：${bytes}`);
await writeFile(resolve(base, 'index.html'), output);
const result = { status: framework ? 'FRAMEWORK_ONLY' : 'MODEL_INTEGRATED', three: vendor.three, esbuild: vendor.esbuild, htmlBytes: Buffer.byteLength(output), artifactBytes: bytes,
  ...(layout ? { planHash: layout.manifest.planHash, jobsHash: layout.manifest.jobsHash, summary: layout.manifest.summary, checks: layout.manifest.checks, mesh } : {}) };
await writeFile(resolve(base, 'viewer/build-evidence.json'), JSON.stringify(result, null, 2) + '\n');
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
