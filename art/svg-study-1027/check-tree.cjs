/* 本輪有界離線驗收；真實JSON/manifest/XML，不需瀏覽器或第三方套件。 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = __dirname;
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
if (process.argv.includes('--python')) {
  process.stdout.write(fs.readFileSync(path.join(root, 'checks/tree-xml.py'), 'utf8'));
  process.exit(0);
}
const data = JSON.parse(read('mech-layers.json'));
const manifest = JSON.parse(read('mech-manifest.json'));
manifest.fallbacks = { cold: { src: 'bulwark.svg', label: '堅盾完整立繪' } };
for (const name of ['assembly.js', 'mech-tree.js', 'mech-motion.js', 'mech-tree-ui.js', 'demo.js']) {
  vm.runInThisContext(read(name), { filename: name });
}
if (process.argv.includes('--reject-fixture')) data.nodes.push({ ...data.nodes[0] });
const model = MechTree.createModel(data);
// Python親讀XML並使用生成器同一套真實幾何索引；任何漏控/空葉直接失敗。
const xmlPath = process.argv[process.argv.indexOf('--xml-json') + 1];
assert(process.argv.includes('--xml-json') && xmlPath, '先以 --python 匯出XML核對腳本，再給 --xml-json <核對結果>；避免環境禁止Node子行程');
const xml = JSON.parse(fs.readFileSync(xmlPath, 'utf8'));
for (const [name, expected] of Object.entries(xml.hashes)) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex'), expected, `XML核對結果過期：${name}`);
const index = xml.index;
const planFor = key => Assembly.assemble(manifest, Assembly.recipeFromPreset(manifest, key));
let state = MechTree.bindAssembly(MechTree.createState(model), planFor('cold'), index);
const original = state;
const leaf = model.descendants.get('arm-left').find(id => state.leafIds.includes(id) && model.nodes.get(id).purpose === 'armor');
assert(leaf, '左臂必須有可控外甲');
const shoulder = [...model.nodes.values()].find(node => node.parent === 'arm-left' && node.level === 'middle' && node.label.includes('肩'))?.id;
assert(shoulder, '左肩必須有中層');
const shoulderLeaves = new Set(model.descendants.get(shoulder).filter(id => state.leafIds.includes(id)));
assert(shoulderLeaves.size > 0);
state = MechTree.setPreference(state, leaf, false);
assert(!MechTree.effectiveLeaves(state).has(leaf));
state = MechTree.setPreference(state, 'arm-left', false);
assert(model.descendants.get('arm-left').every(id => !MechTree.effectiveLeaves(state).has(id)));
state = MechTree.setPreference(state, 'arm-left', true);
assert(!MechTree.effectiveLeaves(state).has(leaf), '開父層保留子偏好');
assert(MechTree.effectiveLeaves(original).has(leaf), '純state不可原地修改');
state = MechTree.setPreference(state, shoulder, false);
const savedPreferences = { ...state.preferences };
state = MechTree.setSolo(state, shoulder);
assert.deepEqual(MechTree.effectiveLeaves(state), shoulderLeaves, '單看忽略原隱藏偏好');
state = MechTree.setSolo(state, null);
assert.deepEqual(state.preferences, savedPreferences);
assert([...shoulderLeaves].every(id => !MechTree.effectiveLeaves(state).has(id)));
for (const key of Object.keys(manifest.presets)) {
  const recipe = Assembly.recipeFromPreset(manifest, key);
  recipe.colors = { '#263e40': '#445566' };
  const plan = Assembly.assemble(manifest, recipe);
  state = MechTree.bindAssembly(state, plan, index);
  const expected = new Set(plan.layers.flatMap(({ id }) => index[id]));
  assert.deepEqual(new Set(state.leafIds), expected);
  assert(expected.size >= 100);
  assert.deepEqual(state.preferences, savedPreferences, '換件及配色保留語意偏好');
  assert(!MechTree.effectiveLeaves(state).has(leaf));
}
const mixed = Assembly.mixTwo(manifest, Assembly.recipeFromPreset(manifest, 'cold'));
state = MechTree.bindAssembly(state, Assembly.assemble(manifest, mixed), index);
assert.deepEqual(state.preferences, savedPreferences);
const subset = MechTree.bind(state, [...shoulderLeaves]);
assert.equal(MechTree.summary(subset).total, shoulderLeaves.size, '未裝葉不得計數');
assert(!MechTree.summary(subset).nodes.has('leg-left'));
const fallback = Assembly.assemble(manifest, { family: manifest.family, fallback: 'cold', colors: {} });
const disabled = MechTree.bindAssembly(state, fallback, index);
assert(!disabled.enabled);
assert.equal(MechTree.effectiveLeaves(disabled).size, 0);
assert.equal(MechTree.setPreference(disabled, leaf, true), disabled);
state = MechTree.bindAssembly(disabled, planFor('cold'), index);
assert.deepEqual(state.preferences, savedPreferences);
state = MechTree.reset(state);
assert.equal(state.solo, null);
assert.equal(MechTree.effectiveLeaves(state).size, state.leafIds.length);
assert.throws(() => MechTree.bind(state, ['missing-leaf']));
assert.throws(() => MechTree.bindAssembly(state, { ...planFor('cold'), family: 'other' }, index));
const cyclic = structuredClone(data);
cyclic.nodes.find(node => node.level === 'middle').parent = cyclic.nodes.find(node => node.level === 'leaf').id;
assert.throws(() => MechTree.createModel(cyclic));

const { Element, a, b, doc, hiddenState } = require('./checks/tree-dom.cjs')({ assert, xml, manifest, index, model, planFor, leaf, shoulder, shoulderLeaves, fallback });
require('./checks/motion.cjs')({ assert, manifest, planFor, fallback, Element, a, b, doc, hiddenState });
require('./checks/offline.cjs')({ assert, fs, path, vm, root, read, data, xml, index, manifest, planFor });
