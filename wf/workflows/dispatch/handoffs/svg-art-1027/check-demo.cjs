// 既有 Node 的純組裝／疊層邏輯驗證；不是瀏覽器布局或真實鍵盤驗收。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const art = path.resolve(__dirname, '../../../../../art/svg-study-1027');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(art, 'assembly.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(art, 'demo.js'), 'utf8'), context);
const { assemble, setLayer, playOnce } = context.ArtDemo;
function element(tag) {
  return { tag, attrs: {}, children: [], style: {}, setAttribute(k, v) { this.attrs[k] = v; }, append(e) { this.children.push(e); }, replaceChildren(e) { this.children = [e]; } };
}
const doc = { createElementNS(ns, tag) { assert.equal(ns, 'http://www.w3.org/2000/svg'); return element(tag); } };
let combinations = 0;
for (const family of ['portrait', 'mech']) {
  const manifest = JSON.parse(fs.readFileSync(path.join(art, `${family}-manifest.json`), 'utf8'));
  const target = element('g');
  for (const preset of Object.values(manifest.presets)) {
    const output = assemble(doc, target, manifest, preset.parts);
    assert.deepEqual(Array.from(output.children, node => node.attrs['data-part']), manifest.layers);
    assert.deepEqual(Array.from(output.children, node => node.children[0].attrs.href), manifest.layers.map(layer => '#' + preset.parts[layer]));
    combinations++;
  }
  const base = Object.values(manifest.presets)[0];
  const recipe = context.Assembly.recipeFromPreset(manifest, Object.keys(manifest.presets)[0]);
  const mixedRecipe = context.Assembly.mixTwo(manifest, recipe);
  assert.equal(manifest.layers.filter(layer => recipe.parts[layer] !== mixedRecipe.parts[layer]).length, 2);
  assert.throws(() => context.Assembly.assemble(manifest, {...recipe, family:'incompatible'}));
  assert.equal(context.Assembly.recolor('#aAbBcC', {'#aabbcc':'#123456'}), '#123456');
  assert.throws(() => context.Assembly.assemble(manifest, {...recipe, colors:{red:'url(http://example.invalid)'}}));
  const library = {...manifest, fallbacks:{full:{src:family==='portrait'?'kamau.svg':'bulwark.svg',label:'full'}}};
  assert.equal(context.Assembly.assemble(library,{...recipe,fallback:'full'}).kind,'fallback');

  const changed = { ...base.parts };
  const layers = manifest.layers.filter(layer => manifest.options[layer].length > 1).slice(0, 2);
  assert.equal(layers.length, 2);
  for (const layer of layers) changed[layer] = manifest.options[layer].find(option => option.id !== base.parts[layer]).id;
  assemble(doc, target, manifest, changed);
  const refs = target.children[0].children.map(node => node.children[0].attrs.href);
  assert.equal(manifest.layers.filter((layer, i) => refs[i] !== '#' + base.parts[layer]).length, 2);
  const before = target.children[0];
  assert.throws(() => assemble(doc, target, manifest, { ...changed, [layers[0]]: 'missing-symbol' }));
  assert.equal(target.children[0], before, 'invalid selection must not partially replace visible assembly');
  combinations++;
}
const hotspots = [element('g'), element('g'), element('g')];
const layer = element('g'); layer.querySelectorAll = () => hotspots;
const view = { querySelector(selector) { assert.equal(selector, '[data-layer="interactive"]'); return layer; } };
setLayer(view, 'interactive', false);
assert.equal(layer.style.display, 'none'); assert.equal(layer.attrs['aria-hidden'], 'true');
assert.ok(hotspots.every(node => node.attrs.tabindex === '-1'));
setLayer(view, 'interactive', true);
assert.equal(layer.style.display, ''); assert.ok(hotspots.every(node => node.attrs.tabindex === '0'));
const classes = new Set(); let restarts = 0;
const stage = { classList: { add(x) { classes.add(x); }, remove(x) { classes.delete(x); } }, get offsetWidth() { restarts++; return 128; } };
const status = {};
playOnce(stage, status); playOnce(stage, status);
assert.equal(restarts, 2); assert.ok(classes.has('play')); assert.equal(classes.size, 1); assert.equal(status.textContent, '播放中');
console.log(`PASS ${combinations} real-manifest assemblies, two-part changes, invalid-choice atomicity, layer/hotspot hide+restore, replay restart. Browser UI not verified.`);
