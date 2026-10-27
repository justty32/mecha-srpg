/* 機甲語意樹純邏輯；state更新回傳新值，不讀DOM。 */
(() => {
  'use strict';
  function createModel(data) {
    if (data.version !== 1 || !data.family || !Array.isArray(data.nodes)) throw new Error('無效機甲樹版本');
    const nodes = new Map();
    for (const node of data.nodes) {
      if (!node.id || nodes.has(node.id) || !/[\u3400-\u9fff]/u.test(node.label)) throw new Error('重複ID或缺中文標籤');
      if (!['major', 'middle', 'leaf'].includes(node.level)) throw new Error('未知層級');
      if (node.level === 'leaf' && !['structure', 'armor', 'decoration'].includes(node.purpose)) throw new Error('未知零件用途');
      nodes.set(node.id, { ...node });
    }
    const ancestors = new Map();
    const descendants = new Map([...nodes.keys()].map(id => [id, []]));
    const children = new Map([...nodes.keys()].map(id => [id, []]));
    const roots = [];
    for (const node of nodes.values()) {
      const chain = [];
      let cursor = node;
      const seen = new Set([node.id]);
      while (cursor.parent !== null) {
        cursor = nodes.get(cursor.parent);
        if (!cursor || seen.has(cursor.id)) throw new Error('缺少父節點或循環');
        seen.add(cursor.id);
        chain.push(cursor.id);
      }
      const expected = { major: 0, middle: 1, leaf: 2 }[node.level];
      if (chain.length !== expected || (expected > 0 && nodes.get(chain[0]).level !== (expected === 1 ? 'major' : 'middle'))) throw new Error('父子層級錯誤');
      ancestors.set(node.id, chain);
      if (node.parent === null) roots.push(node.id);
      else children.get(node.parent).push(node.id);
      if (node.level === 'leaf') for (const id of [node.id, ...chain]) descendants.get(id).push(node.id);
    }
    return { family: data.family, nodes, ancestors, descendants, children, roots };
  }
  function createState(model, leafIds = []) {
    return bind({ model, preferences: {}, solo: null, enabled: true, leafIds: [] }, leafIds);
  }
  function bind(state, leafIds, enabled = true) {
    const ids = [...new Set(leafIds)];
    for (const id of ids) if (state.model.nodes.get(id)?.level !== 'leaf') throw new Error(`未知葉 ${id}`);
    return { ...state, leafIds: ids, enabled: Boolean(enabled) };
  }
  function bindAssembly(state, plan, symbolLeaves) {
    if (plan.family !== state.model.family) throw new Error('不相容的機甲樹');
    if (plan.kind === 'fallback') return bind(state, [], false);
    const ids = plan.layers.flatMap(({ id }) => {
      if (!Object.hasOwn(symbolLeaves, id)) throw new Error(`缺少symbol葉索引 ${id}`);
      return symbolLeaves[id];
    });
    return bind(state, ids, true);
  }
  function requireNode(state, id) {
    if (!state.model.nodes.has(id)) throw new Error(`未知節點 ${id}`);
  }
  function setPreference(state, id, visible) {
    requireNode(state, id);
    if (!state.enabled) return state;
    const preferences = { ...state.preferences };
    if (visible) delete preferences[id];
    else preferences[id] = false;
    return { ...state, preferences };
  }
  function setSolo(state, id) {
    if (id !== null) requireNode(state, id);
    return state.enabled ? { ...state, solo: id } : state;
  }
  function reset(state) {
    return { ...state, preferences: {}, solo: null };
  }
  function effectiveLeaves(state) {
    if (!state.enabled) return new Set();
    return new Set(state.leafIds.filter(id => {
      const chain = [id, ...state.model.ancestors.get(id)];
      // 單看暫時忽略原偏好，包含隱藏的父、子；退出仍用原state偏好。
      return state.solo !== null ? chain.includes(state.solo) : chain.every(key => state.preferences[key] !== false);
    }));
  }
  function summary(state) {
    const visible = effectiveLeaves(state);
    const active = new Set(state.leafIds);
    const nodes = new Map();
    for (const [id, leaves] of state.model.descendants) {
      const selected = leaves.filter(leaf => active.has(leaf));
      if (selected.length) nodes.set(id, {
        total: selected.length,
        visible: selected.filter(leaf => visible.has(leaf)).length,
        preferred: state.preferences[id] !== false
      });
    }
    return { enabled: state.enabled, total: active.size, visible: visible.size, nodes };
  }
  globalThis.MechTree = { createModel, createState, bind, bindAssembly, setPreference, setSolo, reset, effectiveLeaves, summary };
})();
