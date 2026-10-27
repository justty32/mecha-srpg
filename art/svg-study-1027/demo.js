/* 純本機展示接線；部件幾何唯一來源由 rebuild.py 嵌入，不 fetch。 */
(() => {
  'use strict';
  const ns = 'http://www.w3.org/2000/svg';
  const labels = { hangar: '第三刃機庫：僅顯示設定與造型提案，不接維修或出擊。', shop: '型錄展間：僅示意商店入口，不買賣或修改庫存。', dock: '港口碼頭：僅示意互動入口，不切換營運狀態。' };

  let renderSerial = 0;
  const treeBindings = new WeakMap();
  function cloneMech(doc, container, plan) {
    const prefix = `mech-${++renderSerial}-`;
    const mapping = new Map();
    const sources = plan.layers.map(({ id, layer }) => {
      const symbol = doc.getElementById(id);
      if (!symbol) throw new Error(`缺少symbol ${id}`);
      return { symbol, layer };
    });
    const geometryIds = new Set(sources.flatMap(({ symbol }) => [...symbol.querySelectorAll('[id]')].map(node => node.id)));
    const resources = new Map();
    function references(node) {
      const found = [];
      for (const item of [node, ...node.querySelectorAll('*')]) {
        for (const attr of item.attributes) {
          if (attr.localName === 'href' && attr.value.startsWith('#')) found.push(attr.value.slice(1));
          for (const match of attr.value.matchAll(/url\(\s*["']?#([^"')\s]+)["']?\s*\)/g)) found.push(match[1]);
        }
        if (item.localName === 'style') for (const match of item.textContent.matchAll(/url\(\s*["']?#([^"')\s]+)["']?\s*\)/g)) found.push(match[1]);
      }
      return found;
    }
    const pending = sources.flatMap(({ symbol }) => references(symbol));
    while (pending.length) {
      const id = pending.pop();
      if (geometryIds.has(id) || resources.has(id)) continue;
      const source = doc.getElementById(id);
      if (!source) throw new Error(`缺少本機引用 ${id}`);
      resources.set(id, source);
      for (const node of [source, ...source.querySelectorAll('[id]')]) if (node.id) geometryIds.add(node.id);
      pending.push(...references(source));
    }
    for (const id of geometryIds) mapping.set(id, prefix + id);
    function rewrite(value, name) {
      if (name === 'id') return mapping.get(value) || prefix + value;
      if (name === 'href' && value.startsWith('#')) return '#' + (mapping.get(value.slice(1)) || value.slice(1));
      if (name === 'aria-labelledby' || name === 'aria-describedby') return value.split(/\s+/).map(id => mapping.get(id) || id).join(' ');
      value = value.replace(/url\(\s*["']?#([^"')\s]+)["']?\s*\)/g, (all, id) => mapping.has(id) ? `url(#${mapping.get(id)})` : all);
      return value.replace(/#[0-9a-f]{6}\b/gi, hex => Assembly.recolor(hex, plan.colors));
    }
    function clone(source) {
      const result = source.cloneNode(true);
      for (const node of [result, ...result.querySelectorAll('*')]) {
        for (const attr of [...node.attributes]) {
          const value = rewrite(attr.value, attr.localName);
          if (attr.namespaceURI) node.setAttributeNS(attr.namespaceURI, attr.name, value);
          else node.setAttribute(attr.name, value);
        }
        if (node.localName === 'style') {
          node.textContent = rewrite(node.textContent, 'style').replace(/#([a-zA-Z_][\w.-]*)/g, (all, id) => mapping.has(id) ? '#' + mapping.get(id) : all);
        }
      }
      return result;
    }
    const output = [];
    if (resources.size) {
      const defs = doc.createElementNS(ns, 'defs');
      for (const resource of resources.values()) defs.append(clone(resource));
      output.push(defs);
    }
    for (const { symbol, layer } of sources) {
      // 不加無用途的assembly/part外包g，保留來源畫序與五層深度。
      for (const child of symbol.children) {
        const node = clone(child);
        node.setAttribute('data-part', layer);
        output.push(node);
      }
    }
    container.setAttribute('data-assembly', plan.family);
    container.replaceChildren(...output);
    return container;
  }
  function assemble(doc, container, manifest, parts, colors = {}) {
    const plan = Assembly.assemble(manifest, { family: manifest.family, parts, colors });
    if (manifest.family === 'bulwark-800') {
      const instance = cloneMech(doc, container, plan);
      const binding = treeBindings.get(container);
      if (binding) {
        binding.ui.bind(plan, instance, binding.symbolLeaves);
        binding.motion.bind(plan, instance);
      }
      return instance;
    }
    const [, , width, height] = manifest.viewBox.split(' ');
    const group = doc.createElementNS(ns, 'g');
    group.setAttribute('data-assembly', plan.family);
    for (const {layer, id} of plan.layers) {
      const part = doc.createElementNS(ns, 'g');
      part.setAttribute('data-part', layer);
      if (Object.keys(colors).length) {
        const symbol = doc.getElementById(id);
        const prefix = `paint-${++renderSerial}-`;
        const mapping = new Map([...symbol.querySelectorAll('[id]')].map(node => [node.id, prefix + node.id]));
        for (const child of symbol.children) {
          const clone = child.cloneNode(true);
          for (const node of [clone, ...clone.querySelectorAll('*')]) {
            for (const attr of [...node.attributes]) {
              let value = Assembly.recolor(attr.value, colors);
              if (attr.name === 'id') value = mapping.get(value) || prefix + value;
              if (attr.name === 'href' && mapping.has(value.slice(1))) value = '#' + mapping.get(value.slice(1));
              value = value.replace(/url\(#([^)]+)\)/g, (all, key) => mapping.has(key) ? `url(#${mapping.get(key)})` : all);
              node.setAttribute(attr.name, value);
            }
          }
          part.append(clone);
        }
      } else {
        const use = doc.createElementNS(ns, 'use');
        use.setAttribute('href', `#${id}`);
        use.setAttribute('width', width);
        use.setAttribute('height', height);
        part.append(use);
      }
      group.append(part);
    }
    container.replaceChildren(group);
    return group;
  }

  function setLayer(view, layer, visible) {
    const group = view.querySelector(`[data-layer="${layer}"]`);
    if (!group) throw new Error(`缺少層 ${layer}`);
    group.style.display = visible ? '' : 'none';
    group.setAttribute('aria-hidden', String(!visible));
    for (const hotspot of group.querySelectorAll('[data-hotspot]')) hotspot.setAttribute('tabindex', visible ? '0' : '-1');
    return group;
  }

  function activateHotspot(node, status) {
    const text = labels[node.dataset.hotspot];
    if (!text) return;
    status.textContent = text;
    node.closest('.city-view').querySelectorAll('[data-hotspot]').forEach(other => other.classList.toggle('hotspot-active', other === node));
  }

  function playOnce(stage, status, className = 'play') {
    stage.classList.remove(className);
    void stage.offsetWidth;
    stage.classList.add(className);
    status.textContent = '播放中';
  }

  function wire(doc) {
    for (const button of doc.querySelectorAll('[data-replay]')) {
      const card = button.closest('.fx-demo');
      const stage = card.querySelector('.fx-stage');
      const status = card.querySelector('.fx-status');
      let fallback;
      const finish = () => { stage.classList.remove('play'); status.textContent = '已結束，可重播'; clearTimeout(fallback); };
      button.addEventListener('click', () => { clearTimeout(fallback); playOnce(stage, status); fallback = setTimeout(finish, 1000); });
      stage.querySelector('.fx-art').addEventListener('animationend', finish);
    }
    for (const card of doc.querySelectorAll('.doll[data-family]')) {
      const manifest = JSON.parse(card.querySelector('[data-manifest]').textContent);
      const container = card.querySelector('[data-doll-out]');
      const svg = container.closest('svg');
      const controls = [...card.querySelectorAll('[data-part-select]')];
      const status = card.querySelector('.doll-status');
      const first = Object.keys(manifest.presets)[0];
      let recipe = Assembly.recipeFromPreset(manifest, first);
      let fallbackImage;
      const treeData = card.querySelector('[data-mech-layers]');
      let tree;
      if (treeData) {
        const data = JSON.parse(treeData.textContent);
        const symbolLeaves = JSON.parse(card.querySelector('[data-mech-symbol-leaves]').textContent);
        tree = { motion: MechMotion.mount(card.querySelector('[data-mech-motion]')), ui: MechTreeUI.mount(doc, card.querySelector('[data-mech-tree]'), MechTree.createState(MechTree.createModel(data))), symbolLeaves };
        treeBindings.set(container, tree);
      }
      const update = (message) => {
        const plan = Assembly.assemble(manifest, recipe);
        fallbackImage?.remove();
        fallbackImage = undefined;
        svg.hidden = plan.kind === 'fallback';
        svg.style.display = plan.kind === 'fallback' ? 'none' : '';
        if (plan.kind === 'fallback') {
          tree?.ui.bind(plan, null, tree.symbolLeaves);
          tree?.motion.bind(plan, null);
          fallbackImage = doc.createElement('img');
          fallbackImage.className = 'fallback-art';
          fallbackImage.src = plan.src;
          fallbackImage.alt = plan.label;
          svg.insertAdjacentElement('afterend', fallbackImage);
        } else assemble(doc, container, manifest, recipe.parts, recipe.colors);
        for (const control of controls) control.value = recipe.parts[control.dataset.partSelect];
        status.textContent = message;
      };
      for (const control of controls) control.addEventListener('change', () => {
        recipe = Assembly.swapParts(manifest, recipe, { [control.dataset.partSelect]: control.value });
        update('已實際換件；自由組合為外觀提案。');
      });
      for (const button of card.querySelectorAll('[data-preset]')) button.addEventListener('click', () => {
        recipe = Assembly.recipeFromPreset(manifest, button.dataset.preset);
        update(`已還原${manifest.presets[button.dataset.preset].label}。`);
      });
      card.querySelector('[data-mix]').addEventListener('click', () => {
        recipe = Assembly.mixTwo(manifest, recipe);
        update('已替換兩個部件；接點與遮擋順序維持。');
      });
      card.querySelector('[data-fallback]').addEventListener('click', () => {
        recipe = { ...recipe, colors: {}, fallback: Object.keys(manifest.fallbacks)[0] };
        update('已改用完整立繪；可還原預設或換件返回。');
      });
      update(`預設：${manifest.presets[first].label}。`);
    }
    for (const card of doc.querySelectorAll('.city-inspector')) {
      const view = card.querySelector('.city-view');
      const status = card.querySelector('.city-status');
      for (const checkbox of card.querySelectorAll('[data-layer-switch]')) checkbox.addEventListener('change', () => {
        setLayer(view, checkbox.dataset.layerSwitch, checkbox.checked);
        status.textContent = `${checkbox.parentElement.textContent}已${checkbox.checked ? '顯示' : '隱藏'}。`;
      });
      for (const node of view.querySelectorAll('[data-hotspot]')) {
        node.addEventListener('click', () => activateHotspot(node, status));
        node.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activateHotspot(node, status); }
        });
      }
      let timer;
      card.querySelector('[data-city-play]').addEventListener('click', () => {
        const checkbox = card.querySelector('[data-layer-switch="dynamic"]');
        if (!checkbox.checked) { status.textContent = '請先顯示動態物件層。'; return; }
        clearTimeout(timer);
        playOnce(view, status, 'animate');
        timer = setTimeout(() => { view.classList.remove('animate'); status.textContent = '港口動態已結束，可重播。'; }, 4200);
      });
    }
  }
  globalThis.ArtDemo = { assemble, setLayer, activateHotspot, playOnce, wire };
  if (typeof document !== 'undefined') wire(document);
})();
