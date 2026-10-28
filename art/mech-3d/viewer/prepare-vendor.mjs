import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const base = fileURLToPath(new URL('../', import.meta.url));
const repo = resolve(base, '../..');
const tools = resolve(repo, 'node_modules/.mech3d-tools');
const require = createRequire(import.meta.url);
const esbuild = require(resolve(tools, 'node_modules/esbuild/lib/main.js'));
const binary = await readFile(resolve(tools, 'node_modules/@esbuild/linux-x64/bin/esbuild'));
const toolMetadata = JSON.parse(await readFile(resolve(tools, 'node_modules/esbuild/package.json'), 'utf8'));
const binarySha256 = createHash('sha256').update(binary).digest('hex');
if (binarySha256 !== toolMetadata['esbuild.binaryHashes']['@esbuild/linux-x64/bin/esbuild']) throw new Error('esbuild 官方 binary SHA256 不符');
const vendor = resolve(base, 'vendor');
const evidence = resolve(base, 'viewer/evidence');
await mkdir(vendor, { recursive: true });
await mkdir(evidence, { recursive: true });
const lock = JSON.parse(await readFile(resolve(tools, 'package-lock.json'), 'utf8'));
const packages = [['three', '0.186.1'], ['esbuild', '0.28.2'], ['@esbuild/linux-x64', '0.28.2']];
const rows = [];
for (const [name, version] of packages) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`官方 metadata ${response.status}: ${name}`);
  const metadata = await response.json();
  const installed = lock.packages[`node_modules/${name}`];
  if (metadata.version !== version || installed.version !== version || installed.integrity !== metadata.dist.integrity) {
    throw new Error(`官方 integrity／固定版本不符：${name}`);
  }
  if (installed.resolved !== metadata.dist.tarball || !installed.resolved.startsWith('https://registry.npmjs.org/')) {
    throw new Error(`非官方來源：${name}`);
  }
  rows.push({ name, version, url: installed.resolved, integrity: installed.integrity, license: metadata.license });
}
const packageRoot = resolve(tools, 'node_modules/three');
for (const [source, output, bundle] of [
  ['build/three.module.js', 'three.module.min.js', true],
  ['examples/jsm/controls/OrbitControls.js', 'OrbitControls.min.js', false],
]) {
  const result = await esbuild.build({ entryPoints: [resolve(packageRoot, source)], bundle, format: 'esm', minify: true, write: false, legalComments: 'inline', logLevel: 'silent' });
  await writeFile(resolve(vendor, output), result.outputFiles[0].contents);
}
await writeFile(resolve(vendor, 'LICENSE.three'), await readFile(resolve(packageRoot, 'LICENSE')));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const artifacts = {};
for (const name of ['three.module.min.js', 'OrbitControls.min.js', 'LICENSE.three']) artifacts[name] = sha256(await readFile(resolve(vendor, name)));
await writeFile(resolve(vendor, 'integrity.json'), JSON.stringify({ three: '0.186.1', esbuild: '0.28.2', binarySha256, artifacts }, null, 2) + '\n');
execFileSync('python3', ['-c', `import json,sys
sys.path.insert(0,sys.argv[1])
from tabledb import Table
t=Table(sys.argv[2],columns=['name','version','url','integrity','license'],meta={'contract':'wf-table/1','source':'../viewer/REPORT.md','extracted':'2026-10-28'})
for row in json.load(sys.stdin): t.add(row)
t.save()
`, resolve(repo, 'wf/tools'), resolve(vendor, 'SOURCE.json')], { input: JSON.stringify(rows) });
const libraryPath = resolve(repo, 'node_modules/.canvas-headless/root/usr/lib/x86_64-linux-gnu');
const browser = resolve(homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');
const ldd = execFileSync('ldd', [browser], { encoding: 'utf8', env: { ...process.env, LD_LIBRARY_PATH: libraryPath } });
await writeFile(resolve(evidence, 'ldd.txt'), ldd);
if (ldd.includes('not found')) throw new Error('既有 Chromium 局部 ldd 仍缺函式庫');
process.stdout.write('3 fixed official packages verified; runtime vendor prepared; ldd no missing; browser NOT launched\n');
