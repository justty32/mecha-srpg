(() => {
  'use strict';
  const data = window.BLUEPRINT,
    $ = (id) => document.getElementById(id),
    ns = 'http://www.w3.org/2000/svg';
  const partial = data.attachments.length < data.orders.orders.length;
  const state = {
    mode: partial ? 'layout' : 'assembled',
    selected: null,
    hidden: new Set(),
    solo: null,
    t: 0,
    playing: false,
  };
  const nodes = new Map(data.layout.nodes.map((n) => [n.id, n])),
    attachments = new Map(data.attachments.map((a) => [a.id, a]));
  const slots = new Map(data.slots.slots.map((s) => [s.id, s]));
  const bind = data.poses.poses.find((p) => p.id === 'bind') || { id: 'bind', angles: {} };
  const poses = data.poses.poses.filter((p) => p.id !== 'bind');
  const labels = {
    'raise-left': '抬左臂',
    'elbow-left': '屈左肘',
    'knee-left': '屈左膝',
    'raise-right': '抬右臂',
    'elbow-right': '屈右肘',
    'knee-right': '屈右膝',
  };
  poses.forEach((p) => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = labels[p.id] || p.id;
    $('pose').append(o);
  });
  function svg(tag, attrs = {}) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
    return e;
  }
  const mt = (m) => `matrix(${m.join(' ')})`;
  function region(parent, r, m, color, fill = 'none', width = 1.5) {
    for (const p of r) {
      parent.append(
        svg('polygon', {
          points: p.map((v) => transformPoint(m, v).join(',')).join(' '),
          fill,
          stroke: color,
          'stroke-width': width,
          'vector-effect': 'non-scaling-stroke',
        }),
      );
    }
  }
  function dot(parent, p, color, r = 4) {
    parent.append(
      svg('circle', { cx: p[0], cy: p[1], r, fill: color, stroke: '#061018', 'stroke-width': 1 }),
    );
  }
  function ancestor(id, target) {
    let n = nodes.get(id);
    while (n) {
      if (n.id === target) return true;
      n = nodes.get(n.parent);
    }
    return false;
  }
  function visibleLayout(id) {
    let n = nodes.get(id);
    if (state.solo && !ancestor(id, state.solo)) return false;
    while (n) {
      if (state.hidden.has(n.id)) return false;
      n = nodes.get(n.parent);
    }
    return true;
  }
  function visible(slot) {
    return visibleLayout(
      nodes.has(slot.semantic) ? slot.semantic : attachments.get(slot.attachment)?.layout,
    );
  }
  function select(id) {
    state.selected = id;
    $('selection-title').textContent = id || '選取附件';
    const a = attachments.get(id),
      s = data.slots.slots.find((s) => s.attachment === id),
      order = data.orders.orders.find((o) => o.id === id || o.slot === s?.id);
    $('selection').textContent = a
      ? JSON.stringify(
          {
            source: a.source,
            bone: s?.bone,
            origin: [0, 0],
            viewBox: a.viewBox,
            contacts: a.contacts,
            role: order?.role,
            material: order?.material,
          },
          null,
          2,
        )
      : nodes.get(id)
        ? JSON.stringify(nodes.get(id), null, 2)
        : '點選機體或結構樹。';
    document
      .querySelectorAll('[data-select]')
      .forEach((b) => b.classList.toggle('selected', b.dataset.select === id));
    draw();
  }
  function tree(parent, parentId) {
    data.layout.nodes
      .filter((n) => n.parent === parentId)
      .forEach((n) => {
        const wrap = document.createElement('div');
        wrap.className = 'tree-node';
        const line = document.createElement('div');
        line.className = 'tree-line';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = true;
        check.dataset.visibility = n.id;
        check.setAttribute('aria-label', `顯示 ${n.id}`);
        check.onchange = () => {
          check.checked ? state.hidden.delete(n.id) : state.hidden.add(n.id);
          draw();
        };
        const button = document.createElement('button');
        const a = data.attachments.find((a) => a.layout === n.id);
        button.dataset.select = a?.id || n.id;
        button.textContent = `${{ machine: '◆', major: '▣', assembly: '◇', part: '·' }[n.level]} ${n.id}`;
        button.onclick = () => select(a?.id || n.id);
        line.append(check, button);
        wrap.append(line);
        const child = document.createElement('div');
        child.className = 'tree-children';
        tree(child, n.id);
        wrap.append(child);
        parent.append(wrap);
      });
  }
  tree($('tree'), null);
  $('part-count').textContent =
    `${data.attachments.length}/${data.orders.orders.length} ATTACHMENTS`;
  function target() {
    return data.poses.poses.find((p) => p.id === $('pose').value) || bind;
  }
  /* @inline viewer/drawing.js */
  /* @inline viewer/controls.js */
  /* @inline viewer/diagnostics.js */
  document
    .querySelectorAll('[data-mode]')
    .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
  draw();
})();
