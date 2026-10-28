import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createModuleEmbedder } from './embed-modules.mjs';

const base = fileURLToPath(new URL('../', import.meta.url));
test('JSON import attribute 與資料能離線內嵌並實際 import', async () => {
  const modules = createModuleEmbedder(base);
  const url = await modules.embed('viewer/fixtures/json-entry.js');
  const source = Buffer.from(url.split(',')[1], 'base64').toString();
  assert.match(source, /data:application\/json;base64,/);
  assert.match(source, /with\s*\{\s*type:\s*'json'\s*\}/);
  assert.doesNotMatch(source, /from\s*['"]\.\//);
  const embedded = await import(url);
  assert.deepEqual(embedded.result, { probe: 'embedded-json', amount: 3, doubled: 6 });
  assert.equal(modules.moduleCount, 2);
});
test('缺少 JSON import attribute 會被拒絕（反例）', async () => {
  await assert.rejects(createModuleEmbedder(base).embed('viewer/fixtures/json-missing-attribute.js'), /JSON import 必須明列/);
});
test('相對模組不可越出指定根目錄（反例）', async () => {
  await assert.rejects(createModuleEmbedder(base).embed('../outside.js'), /模組不可離開/);
});
test('import map 每模組只內嵌一次並保留 JSON attribute', async () => {
  const modules = createModuleEmbedder(base, { importMap: true });
  const key = await modules.embed('viewer/fixtures/json-entry.js');
  assert.equal(key, '@canvas-mech/viewer/fixtures/json-entry.js');
  await modules.embed('viewer/fixtures/json-entry.js');
  assert.equal(modules.moduleCount, 2);
  const map = modules.importMap.imports;
  assert.equal(Object.keys(map).length, 2);
  const source = Buffer.from(map[key].split(',')[1], 'base64').toString();
  assert.match(source, /from "@canvas-mech\/viewer\/fixtures\/json-module.json" with/);
  assert.match(map['@canvas-mech/viewer/fixtures/json-module.json'], /^data:application\/json;base64,/);
  assert.doesNotMatch(source, /data:application\/json/);
});
