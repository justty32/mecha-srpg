'use strict';

module.exports = function ({ assert, xml, manifest, index, model, planFor, leaf, shoulder, shoulderLeaves, fallback }) {
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
  return { Element, a, b, doc, hiddenState };
};
