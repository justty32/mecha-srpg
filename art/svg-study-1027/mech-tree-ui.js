/* 機甲樹DOM接線；只改當前instance，不查改共享defs。 */
(() => {
  'use strict';
  const purposeLabels = { structure: '結構', armor: '外甲', decoration: '裝飾' };
  function applyVisibility(instance, state, selected = null) {
    if (!instance) return;
    const visible = MechTree.effectiveLeaves(state);
    const highlighted = new Set(selected ? state.model.descendants.get(selected) : []);
    for (const node of instance.querySelectorAll('[data-mech-node]')) {
      if (node.closest('defs')) continue;
      const hidden = !visible.has(node.getAttribute('data-mech-node'));
      node.toggleAttribute('data-mech-hidden', hidden);
      node.setAttribute('aria-hidden', String(hidden));
      if (!hidden && highlighted.has(node.getAttribute('data-mech-node'))) node.setAttribute('data-mech-selected', 'true');
      else node.removeAttribute('data-mech-selected');
    }
  }
  function mount(doc, root, initialState) {
    let state = initialState;
    let instance;
    let selected = null;
    const entries = new Map();
    const fieldset = root.querySelector('fieldset');
    const content = root.querySelector('[data-mech-tree-nodes]');
    const status = root.querySelector('[data-mech-tree-status]');
    const exit = root.querySelector('[data-mech-solo-exit]');
    const reset = root.querySelector('[data-mech-reset]');
    function refresh() {
      const counts = MechTree.summary(state);
      fieldset.disabled = !state.enabled;
      exit.disabled = !state.enabled || state.solo === null;
      status.textContent = state.enabled
        ? `有效葉層 ${counts.total}，可見 ${counts.visible}。${state.solo ? `單看：${state.model.nodes.get(state.solo).label}（暫時覆蓋勾選偏好）。` : '勾選保留各節點自身偏好；關父層不清除子偏好。'}`
        : '完整立繪模式停用零件樹；換件或還原預設後恢復原偏好。';
      for (const [id, entry] of entries) {
        const info = counts.nodes.get(id);
        entry.wrapper.hidden = !info;
        entry.checkbox.checked = state.preferences[id] !== false;
        entry.checkbox.indeterminate = Boolean(info && info.visible !== info.total && entry.checkbox.checked);
        entry.count.textContent = info ? `${info.visible}/${info.total}` : '';
        entry.solo.setAttribute('aria-pressed', String(state.solo === id));
        entry.select.setAttribute('aria-pressed', String(selected === id));
      }
      applyVisibility(instance, state, selected);
    }
    function makeNode(id) {
      const node = state.model.nodes.get(id);
      const isLeaf = node.level === 'leaf';
      const labelText = id === 'arm-left' ? '左臂（不含武器）' : id === 'arm-right' ? '右臂（不含武器）' : node.label;
      const wrapper = doc.createElement(isLeaf ? 'div' : 'details');
      wrapper.className = `mech-tree-node mech-tree-${node.level}`;
      wrapper.setAttribute('data-tree-node', id);
      if (node.level === 'major') wrapper.open = true;
      const row = isLeaf ? wrapper : doc.createElement('summary');
      if (!isLeaf) wrapper.append(row);
      const label = doc.createElement('label');
      const checkbox = doc.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('data-mech-toggle', id);
      const text = doc.createElement('span');
      text.textContent = labelText + (isLeaf ? ` · ${purposeLabels[node.purpose]}` : '');
      label.append(checkbox, text);
      const count = doc.createElement('small');
      const solo = doc.createElement('button');
      solo.type = 'button';
      solo.textContent = '單看';
      solo.setAttribute('aria-label', `單看${labelText}`);
      solo.setAttribute('data-mech-solo', id);
      const select = doc.createElement('button');
      select.type = 'button';
      select.textContent = '選取';
      select.setAttribute('aria-label', `選取並高亮${labelText}`);
      select.setAttribute('data-mech-select', id);
      select.addEventListener('click', () => { selected = selected === id ? null : id; refresh(); });
      row.append(label, count, select, solo);
      checkbox.addEventListener('change', () => {
        selected = id;
        state = MechTree.setPreference(state, id, checkbox.checked);
        refresh();
      });
      solo.addEventListener('click', () => {
        selected = id;
        state = MechTree.setSolo(state, state.solo === id ? null : id);
        refresh();
      });
      entries.set(id, { wrapper, checkbox, count, solo, select });
      for (const child of state.model.children.get(id)) wrapper.append(makeNode(child));
      return wrapper;
    }
    content.replaceChildren(...state.model.roots.map(makeNode));
    for (const button of root.querySelectorAll('[data-mech-arm-pair]')) button.addEventListener('click', () => {
      const [side, action] = button.getAttribute('data-mech-arm-pair').split('-');
      state = MechTree.setSolo(state, null);
      state = MechTree.setPreference(state, `arm-${side}`, action === 'show');
      state = MechTree.setPreference(state, `weapon-${side}`, action === 'show');
      selected = null;
      refresh();
    });
    exit.addEventListener('click', () => { state = MechTree.setSolo(state, null); refresh(); });
    reset.addEventListener('click', () => { state = MechTree.reset(state); selected = null; refresh(); });
    refresh();
    return {
      bind(plan, nextInstance, symbolLeaves) {
        state = MechTree.bindAssembly(state, plan, symbolLeaves);
        instance = nextInstance;
        refresh();
      },
      getState: () => state,
      refresh
    };
  }
  globalThis.MechTreeUI = { mount, applyVisibility };
})();
