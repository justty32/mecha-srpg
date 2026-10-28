import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('../', import.meta.url));
const temp = resolve(base, '../../node_modules/.canvas-headless');
const vendor = resolve(base, 'vendor');
await mkdir(vendor, { recursive: true });
await mkdir(resolve(temp, 'debs'), { recursive: true });
await mkdir(resolve(temp, 'root'), { recursive: true });
const digest = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

// 僅下載交接明列的版本，絕不改動根 package 或系統套件。
const metadata = JSON.parse((await download('https://registry.npmjs.org/konva/10.9.0')).toString());
if (metadata.version !== '10.9.0' || !metadata.dist.tarball.startsWith('https://registry.npmjs.org/')) {
  throw new Error('Konva 官方來源或版本不符');
}
const archive = await download(metadata.dist.tarball);
const [algorithm, integrity] = metadata.dist.integrity.split('-');
if (createHash(algorithm).update(archive).digest('base64') !== integrity) throw new Error('Konva integrity 不符');
const archivePath = resolve(temp, 'konva-10.9.0.tgz');
await writeFile(archivePath, archive);
for (const [source, target] of [['package/konva.min.js', 'konva-10.9.0.min.js'], ['package/LICENSE', 'LICENSE.konva']]) {
  await writeFile(resolve(vendor, target), execFileSync('tar', ['-xOf', archivePath, source]));
}
await writeFile(resolve(vendor, 'SOURCE.json'), JSON.stringify({
  name: 'konva', version: '10.9.0', source: metadata.dist.tarball,
  integrity: metadata.dist.integrity, sha256: digest(archive),
  javascriptSha256: digest(await readFile(resolve(vendor, 'konva-10.9.0.min.js'))),
  license: 'MIT',
}, null, 2) + '\n');

const packages = [
  ['libnspr4', '2:4.35-1.1build1'], ['libnss3', '2:3.98-1ubuntu0.3'],
  ['libasound2t64', '1.2.11-1ubuntu0.3'], ['libasound2-data', '1.2.11-1ubuntu0.3'],
];
const evidence = [];
for (const [name, version] of packages) {
  const metadataText = execFileSync('apt-cache', ['show', `${name}=${version}`], { encoding: 'utf8' });
  const field = key => metadataText.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1];
  if (field('Version') !== version || field('Origin') !== 'Ubuntu') throw new Error(`apt metadata 不符 ${name}`);
  const filename = field('Filename');
  const expected = field('SHA256');
  if (!filename?.startsWith('pool/main/') || !/^[a-f0-9]{64}$/.test(expected ?? '')) throw new Error(`缺少可信 metadata ${name}`);
  const url = `https://archive.ubuntu.com/ubuntu/${filename}`;
  const bytes = await download(url);
  if (digest(bytes) !== expected) throw new Error(`SHA256 不符 ${name}`);
  const deb = resolve(temp, 'debs', filename.split('/').at(-1));
  await writeFile(deb, bytes);
  execFileSync('dpkg-deb', ['-x', deb, resolve(temp, 'root')]);
  evidence.push({ name, version, url, sha256: expected });
  process.stdout.write(`verified ${name} ${version}\n`);
}
await writeFile(resolve(temp, 'packages.json'), JSON.stringify(evidence, null, 2) + '\n');
const browser = resolve(homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');
const libraries = resolve(temp, 'root/usr/lib/x86_64-linux-gnu');
const ldd = execFileSync('ldd', [browser], { encoding: 'utf8', env: { ...process.env, LD_LIBRARY_PATH: libraries } });
await writeFile(resolve(temp, 'ldd.txt'), ldd);
if (ldd.includes('not found')) throw new Error('Chromium 尚有 missing library，請回報環境 BLOCKED');
process.stdout.write('ldd: no missing libraries; browser has NOT been launched\n');
