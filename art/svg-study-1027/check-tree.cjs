/* 本輪有界離線驗收；真實JSON/manifest/XML，不需瀏覽器或第三方套件。 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = __dirname;
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const pythonCheck = String.raw`
import hashlib, json, runpy, sys, xml.etree.ElementTree as E
from pathlib import Path
r=Path(sys.argv[1]); m=runpy.run_path(str(r/'rebuild.py'))
source, manifest=m['read_family']('mech')
data,index=m['mech_tree_data'](source,manifest)
q=m['q']; refs=m['referenced_ids']
source_ids={e.get('id'):e for e in source.iter() if e.get('id')}
assert len(source_ids)==sum(bool(e.get('id')) for e in source.iter()), 'duplicate source ids'
assert refs(source)<=set(source_ids), 'missing source reference'
def depth(e,n,ids,seen=()):
 tag=e.tag.split('}')[-1]
 if tag in {'defs','title','desc','style'}: return 0
 result=n
 if tag=='use':
  ref=e.get('href') or e.get('{http://www.w3.org/1999/xlink}href')
  assert ref and ref.startswith('#') and ref[1:] not in seen, 'bad use reference'
  target=ids[ref[1:]]
  children=list(target) if target.tag==q('symbol') else [target]
  result=max([result]+[depth(c,n+1,ids,seen+(ref[1:],)) for c in children])
 return max([result]+[depth(c,n+1,ids,seen) for c in e])
max_runtime=0
for symbol in source.iter(q('symbol')):
 for child in symbol:
  max_runtime=max(max_runtime,depth(child,3,source_ids))
assert max_runtime<=5, ('runtime depth',max_runtime)
outputs={}
for key,name in [('cold','bulwark.svg'),('ritual','bulwark-ritual.svg'),('feral','bulwark-feral.svg')]:
 out=E.parse(r/name).getroot()
 ids={e.get('id'):e for e in out.iter() if e.get('id')}
 assert len(ids)==sum(bool(e.get('id')) for e in out.iter()), name+' duplicate id'
 assert refs(out)<=set(ids), name+' missing reference'
 d=depth(out,1,ids); assert d<=5,(name,d)
 chosen=set(manifest['presets'][key]['parts'].values())
 assert {e.get('id') for e in out.iter(q('symbol'))}<=chosen, name+' unselected symbol'
 outputs[key]=d
 def mark(e): return e.get('data-mech-node')
 expected=set().union(*(set(index[i]) for i in chosen))
 assert {mark(e) for e in out.iter() if mark(e)}==expected,name+' missing output leaves'
def convert(e):
 return {'name':e.tag.split('}')[-1],'attrs':dict(e.attrib),'text':e.text or '', 'children':[convert(c) for c in e]}
hashes={name:hashlib.sha256((r/name).read_bytes()).hexdigest() for name in ['mech-parts.svg','mech-layers.json','mech-manifest.json','rebuild.py','bulwark.svg','bulwark-ritual.svg','bulwark-feral.svg']}
print(json.dumps({'index':index,'source':convert(source),'runtimeDepth':max_runtime,'outputDepth':outputs,'hashes':hashes}))
`;
if (process.argv.includes('--python')) { process.stdout.write(pythonCheck); process.exit(0); }
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

// 小型DOM介面替身只驗證接線與命名空間，不宣稱瀏覽器布局/鍵盤行為。
class Element {
  constructor(name, attrs = {}, children = [], text = '') {
    this.localName = name;
    this.attrs = new Map(Object.entries(attrs));
    this.children = [];
    this.textContent = text;
    this.listeners = new Map();
    this.append(...children);
  }
  get id() { return this.getAttribute('id') || ''; }
  get attributes() {
    return [...this.attrs].map(([name, value]) => ({ name: name.startsWith('{') ? 'xlink:' + name.split('}')[1] : name, localName: name.split('}').at(-1).split(':').at(-1), value, namespaceURI: name.startsWith('{') ? name.slice(1).split('}')[0] : null }));
  }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  setAttributeNS(ns, name, value) { this.attrs.set('{' + ns + '}' + name.split(':').at(-1), String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  toggleAttribute(name, force) { if (force) this.setAttribute(name, ''); else this.removeAttribute(name); }
  append(...nodes) { for (const node of nodes) { node.parentElement = this; this.children.push(node); } }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  matches(selector) {
    if (selector === '*') return true;
    if (!selector.startsWith('[')) return this.localName === selector;
    const match = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    return match && this.attrs.has(match[1]) && (match[2] === undefined || this.getAttribute(match[1]) === match[2]);
  }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0]; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector); }
  cloneNode() { return new Element(this.localName, Object.fromEntries(this.attrs), this.children.map(child => child.cloneNode(true)), this.textContent); }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  fire(name) { this.listeners.get(name)?.({ target: this }); }
}
const convert = node => new Element(node.name, node.attrs, node.children.map(convert), node.text);
const source = convert(xml.source);
const a = new Element('g');
const b = new Element('g');
const documentRoot = new Element('svg', {}, [source, a, b]);
const doc = {
  createElement: name => new Element(name),
  createElementNS: (ns, name) => new Element(name),
  getElementById: id => documentRoot.querySelectorAll('[id]').find(node => node.id === id)
};
const snapshot = node => ({ name: node.localName, attrs: [...node.attrs], text: node.textContent, children: node.children.map(snapshot) });
const sourceBefore = JSON.stringify(snapshot(source));
const firstRecipe = Assembly.recipeFromPreset(manifest, 'cold');
ArtDemo.assemble(doc, a, manifest, firstRecipe.parts);
ArtDemo.assemble(doc, b, manifest, firstRecipe.parts, { '#263e40': '#445566' });
assert(a.querySelector('[data-mech-node]'));
const expectedRoots = Object.values(firstRecipe.parts).flatMap(id => doc.getElementById(id).children);
const actualRoots = a.children.filter(node => node.localName !== 'defs');
function assertClone(sourceNode, cloned) {
  assert.equal(cloned.localName, sourceNode.localName);
  assert.equal(cloned.textContent, sourceNode.textContent);
  for (const attr of sourceNode.attributes) {
    const actual = cloned.attributes.find(item => item.name === attr.name)?.value;
    assert.equal(actual?.replace(/mech-\d+-/g, ''), attr.value, `複製應保留 ${attr.name}`);
  }
  assert.equal(cloned.children.length, sourceNode.children.length);
  sourceNode.children.forEach((child, i) => assertClone(child, cloned.children[i]));
}
expectedRoots.forEach((node, i) => assertClone(node, actualRoots[i]));
function actualDepth(node, depth) {
  if (['defs', 'title', 'desc', 'style'].includes(node.localName)) return 0;
  return Math.max(depth, ...node.children.map(child => actualDepth(child, depth + 1)));
}
assert.equal(actualDepth(a, 2), xml.runtimeDepth);
assert.equal(actualDepth(b, 2), xml.runtimeDepth);

assert.equal(a.children.filter(node => node.getAttribute('data-part')).length, source.children.find(node => node.localName === 'defs').children.filter(node => firstRecipe.parts && Object.values(firstRecipe.parts).includes(node.id)).reduce((count, symbol) => count + symbol.children.length, 0));
const idsA = new Set(a.querySelectorAll('[id]').map(node => node.id));
const idsB = new Set(b.querySelectorAll('[id]').map(node => node.id));
assert([...idsA].every(id => !idsB.has(id)), 'instance IDs不得碰撞');
assert.equal(new Set(documentRoot.querySelectorAll('[id]').map(node => node.id)).size, documentRoot.querySelectorAll('[id]').length);
function checkReferences(instance) {
  const allIds = new Set(instance.querySelectorAll('[id]').map(node => node.id));
  for (const node of instance.querySelectorAll('*')) for (const attr of node.attributes) {
    if (attr.localName === 'href') assert(allIds.has(attr.value.slice(1)), 'instance href必須是本身資源');
    for (const match of attr.value.matchAll(/url\(#([^)]+)\)/g)) assert(allIds.has(match[1]), 'instance paint必須是本身資源');
  }
}
checkReferences(a); checkReferences(b);
const hiddenState = MechTree.setPreference(MechTree.bindAssembly(MechTree.createState(model), planFor('cold'), index), 'arm-left', false);
MechTreeUI.applyVisibility(a, hiddenState, shoulder);
for (const node of a.querySelectorAll('[data-mech-node]')) {
  const hidden = model.descendants.get('arm-left').includes(node.getAttribute('data-mech-node'));
  assert.equal(node.attrs.has('data-mech-hidden'), hidden);
  if (hidden) assert(!node.attrs.has('data-mech-selected'));
}
assert(b.querySelectorAll('[data-mech-node]').every(node => !node.attrs.has('data-mech-hidden')));
assert(source.querySelectorAll('[data-mech-node]').every(node => !node.attrs.has('data-mech-hidden')));
assert.equal(JSON.stringify(snapshot(source)), sourceBefore);
assert(b.querySelectorAll('*').some(node => node.attributes.some(attr => attr.value === '#445566')), '配色應實際落到複製幾何');
const treeRoot = new Element('div', {}, [
  new Element('fieldset', {}, [new Element('button', { 'data-mech-reset': '' }), new Element('button', { 'data-mech-solo-exit': '' }), ...['left-hide', 'left-show', 'right-hide', 'right-show'].map(action => new Element('button', { 'data-mech-arm-pair': action })), new Element('div', { 'data-mech-tree-nodes': '' })]),
  new Element('p', { 'data-mech-tree-status': '' })
]);
const ui = MechTreeUI.mount(doc, treeRoot, MechTree.createState(model));
ui.bind(planFor('cold'), a, index);
for (const entry of treeRoot.querySelectorAll('details')) {
  const node = model.nodes.get(entry.getAttribute('data-tree-node'));
  assert.equal(Boolean(entry.open), node.level === 'major');
  assert(entry.querySelector('summary'));
}
const checkbox = treeRoot.querySelector(`[data-mech-toggle="${leaf}"]`);
checkbox.checked = false; checkbox.fire('change');
assert(!MechTree.effectiveLeaves(ui.getState()).has(leaf));
const select = treeRoot.querySelector(`[data-mech-select="${shoulder}"]`);
select.fire('click');
assert(a.querySelectorAll('[data-mech-node]').filter(node => node.getAttribute('data-mech-selected') === 'true').every(node => shoulderLeaves.has(node.getAttribute('data-mech-node'))));
const solo = treeRoot.querySelector(`[data-mech-solo="${shoulder}"]`);
solo.fire('click');
assert.deepEqual(MechTree.effectiveLeaves(ui.getState()), shoulderLeaves);
assert(a.querySelectorAll('[data-mech-selected]').length > 0);
treeRoot.querySelector('[data-mech-solo-exit]').fire('click');
assert(!MechTree.effectiveLeaves(ui.getState()).has(leaf));
ui.bind(fallback, null, index);
assert(treeRoot.querySelector('fieldset').disabled);
ui.bind(planFor('cold'), a, index);
assert(!treeRoot.querySelector('fieldset').disabled);
assert(!MechTree.effectiveLeaves(ui.getState()).has(leaf));
for (const side of ['left', 'right']) {
  const arm = `arm-${side}`;
  const weapon = `weapon-${side}`;
  const child = model.descendants.get(arm).find(id => ui.getState().leafIds.includes(id) && model.nodes.get(id).purpose === 'armor');
  const childBox = treeRoot.querySelector(`[data-mech-toggle="${child}"]`);
  childBox.checked = false; childBox.fire('change');
  const beforePair = MechTree.effectiveLeaves(ui.getState());
  treeRoot.querySelector(`[data-mech-solo="${shoulder}"]`).fire('click');
  assert(ui.getState().solo);
  treeRoot.querySelector(`[data-mech-arm-pair="${side}-hide"]`).fire('click');
  assert.equal(ui.getState().solo, null, '批次應退出solo');
  for (const id of [arm, weapon]) {
    assert.equal(ui.getState().preferences[id], false);
    assert(model.descendants.get(id).every(leaf => !MechTree.effectiveLeaves(ui.getState()).has(leaf)));
  }
  treeRoot.querySelector(`[data-mech-arm-pair="${side}-show"]`).fire('click');
  for (const id of [arm, weapon]) assert.notEqual(ui.getState().preferences[id], false);
  assert.equal(ui.getState().preferences[child], false, '成對顯示不得清除子偏好');
  assert.deepEqual(MechTree.effectiveLeaves(ui.getState()), beforePair, '左右成對可恢復');
  const label = treeRoot.querySelector(`[data-tree-node="${arm}"]`).querySelector('label');
  assert(label.children.some(node => node.textContent.includes('不含武器')));
}
treeRoot.querySelector('[data-mech-reset]').fire('click');
assert.equal(MechTree.effectiveLeaves(ui.getState()).size, ui.getState().leafIds.length);

// 可控時鐘驗證真實DOM適配的播放、暫停、續播、重播、fallback與減少動態。
let time = 0;
let nextTimer = 0;
const timers = new Map();
const media = { matches: false, addEventListener(name, listener) { this.listener = listener; } };
const motionRoot = new Element('fieldset', {}, [
  new Element('button', { 'data-mech-play-button': '' }), new Element('button', { 'data-mech-pause-button': '' }),
  new Element('button', { 'data-mech-motion-reset': '' }), new Element('p', { 'data-mech-motion-status': '' })
]);
const motion = MechMotion.mount(motionRoot, {
  now: () => time,
  schedule: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, at: time + delay }); return id; },
  cancel: id => timers.delete(id), media
});
function elapse(delta) {
  const target = time + delta;
  while (true) {
    const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
    if (!next) break;
    time = next[1].at; timers.delete(next[0]); next[1].callback();
  }
  time = target;
}
const clickMotion = attr => motionRoot.querySelector(`[${attr}]`).fire('click');
motion.bind(planFor('cold'), a);
assert.equal(a.getAttribute('data-mech-phase'), 'idle');
clickMotion('data-mech-play-button');
assert.equal(motion.getState().phase, 'sensors');
elapse(600); clickMotion('data-mech-pause-button');
assert.equal(motion.getState().elapsed, 600);
assert.equal(a.getAttribute('data-mech-play'), 'paused');
elapse(5000); assert.equal(motion.getState().elapsed, 600);
clickMotion('data-mech-play-button');
elapse(599); assert.equal(motion.getState().phase, 'sensors');
elapse(1); assert.equal(motion.getState().phase, 'sweep');
media.listener({ matches: true });
assert.equal(a.getAttribute('data-mech-reduced'), 'true');
assert.equal(motion.getState().phase, 'sweep');
elapse(1200); assert.equal(motion.getState().phase, 'energy');
MechTreeUI.applyVisibility(a, hiddenState);
assert(a.querySelectorAll('[data-mech-hidden]').length > 0, '演出不能清掉隱藏葉');
function assertFreshSequence(reason) {
  assert.equal(motion.getState().phase, 'idle', reason);
  assert.equal(motion.getState().elapsed, 0, reason);
  assert.equal(timers.size, 0, reason);
  clickMotion('data-mech-play-button');
  elapse(1199); assert.equal(motion.getState().phase, 'sensors', reason);
  elapse(1); assert.equal(motion.getState().phase, 'sweep', reason);
  elapse(1200); assert.equal(motion.getState().phase, 'energy', reason);
  elapse(1199); assert.equal(motion.getState().phase, 'energy', reason);
  elapse(1); assert.equal(motion.getState().phase, 'idle', reason);
  assert.equal(timers.size, 0, reason);
}
const swapRecipe = Assembly.recipeFromPreset(manifest, 'feral');
ArtDemo.assemble(doc, b, manifest, swapRecipe.parts);
motion.bind(Assembly.assemble(manifest, swapRecipe), b);
assertFreshSequence('播放途中換件後重新完整播放3600ms');
clickMotion('data-mech-play-button'); elapse(1600);
const paintRecipe = { ...swapRecipe, colors: { '#263e40': '#445566' } };
ArtDemo.assemble(doc, b, manifest, paintRecipe.parts, paintRecipe.colors);
motion.bind(Assembly.assemble(manifest, paintRecipe), b);
assertFreshSequence('播放途中配色重建後重新完整播放3600ms');
clickMotion('data-mech-play-button'); elapse(1300);
const phaseWrites = [];
const originalSet = b.setAttribute.bind(b);
b.setAttribute = (name, value) => { if (name === 'data-mech-phase') phaseWrites.push(value); originalSet(name, value); };
clickMotion('data-mech-play-button'); assert.equal(motion.getState().phase, 'sensors');
assert.deepEqual(phaseWrites.slice(-2), ['idle', 'sensors'], '重播必須重啟CSS相位');
clickMotion('data-mech-motion-reset'); assert.equal(motion.getState().elapsed, 0);
assert.equal(motion.getState().phase, 'idle'); assert.equal(timers.size, 0);
clickMotion('data-mech-play-button');
motion.bind(fallback, null); assert.equal(timers.size, 0); assert(motionRoot.querySelector('[data-mech-play-button]').disabled);
motion.bind(planFor('cold'), a); assert.equal(a.getAttribute('data-mech-phase'), 'idle');
assert.equal(a.getAttribute('data-mech-reduced'), 'true');

const html = read('index.html');
for (const name of ['assembly.js', 'mech-tree.js', 'mech-motion.js', 'mech-tree-ui.js', 'demo.js', 'mech-tree.css', 'mech-effects.css']) {
  assert(html.includes(`="${name}"`), `缺離線引用 ${name}`);
  assert(fs.existsSync(path.join(root, name)));
}
assert(!/\bfetch\s*\(/.test(read('demo.js') + read('mech-tree-ui.js') + read('mech-motion.js')));
for (const attr of ['data-mech-tree', 'data-mech-reset', 'data-mech-solo-exit', 'data-mech-play-button', 'data-mech-pause-button', 'data-mech-motion-reset', 'data-mech-arm-pair']) assert(html.includes(attr));
assert(html.includes('還原可見性') && html.includes('還原演出'));
const embedded = name => JSON.parse(html.match(new RegExp(`<script type="application/json" ${name}>([\\s\\S]*?)</script>`))[1]);
assert.deepEqual(embedded('data-mech-layers'), data);
assert.deepEqual(embedded('data-mech-symbol-leaves'), index);
for (const attr of ['data-family="portrait"', 'data-layer-switch', 'data-hotspot', 'data-replay']) assert(html.includes(attr));
const css = read('mech-effects.css');
for (const key of ['data-mech-phase', 'data-mech-play', 'data-mech-reduced', 'data-mech-selected', 'prefers-reduced-motion', 'paused']) assert(css.includes(key), `效果CSS缺 ${key}`);
assert(read('mech-tree.css').includes('display: none !important'));
for (const name of ['assembly.js', 'mech-tree.js', 'mech-motion.js', 'mech-tree-ui.js', 'demo.js', 'check-tree.cjs']) new vm.Script(read(name), { filename: name });
console.log(JSON.stringify({ result: 'PASS', presets: Object.fromEntries(Object.keys(manifest.presets).map(key => [key, new Set(planFor(key).layers.flatMap(({ id }) => index[id])).size])), runtimeDepth: xml.runtimeDepth, outputDepth: xml.outputDepth, checks: '父子偏好/單看/還原/左右臂連武器批次/換件配色/fallback/instance隔離/原生控件/3600ms暫停續播/重建歸零完整播放/減少動態/隱藏同步/離線嵌入/JS語法；無瀏覽器驗證' }, null, 2));
