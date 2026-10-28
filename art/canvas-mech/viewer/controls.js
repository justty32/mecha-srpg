window.mountCanvasMechControls = function mountCanvasMechControls(scene, { motionNodes }) {
  const query = selector => document.querySelector(selector);
  const rows = new Map();
  const details = new Map();
  const nodes = new Map(scene.plan.nodes.map(node => [node.id, node]));
  const tree = query('#part-tree');
  tree.replaceChildren();
  let preset = 'idle';
  let playing = false;
  let animation = 0;
  const inputs = ['arm', 'elbow', 'knee'];
  const zeroSliders = () => {
    for (const input of inputs) { query(`#${input}`).value = 0; query(`#${input}-value`).value = '0°'; }
  };
  for (const id of inputs) {
    const joint = scene.plan.rig.joints.find(item => item.nodeId === motionNodes[id]);
    if (!joint?.limits) throw new Error(`控制引用無效關節：${id}`);
    query(`#${id}`).min = joint.limits.min;
    query(`#${id}`).max = joint.limits.max;
  }
  function sync() {
    const snapshot = scene.snapshot();
    for (const [id, row] of rows) {
      row.classList.toggle('selected', snapshot.selectedId === id);
      let current = id;
      let hidden = false;
      while (current) { hidden ||= snapshot.hiddenIds.includes(current); current = nodes.get(current).parentId; }
      row.classList.toggle('dim', hidden);
      const visibility = row.querySelector('[data-action="visible"]');
      visibility.textContent = snapshot.hiddenIds.includes(id) ? '○' : '●';
      visibility.setAttribute('aria-pressed', String(!snapshot.hiddenIds.includes(id)));
      row.querySelector('[data-action="solo"]').setAttribute('aria-pressed', String(snapshot.soloId === id));
    }
    const selected = nodes.get(snapshot.selectedId);
    query('#selection-name').textContent = selected ? `${selected.name} · ${selected.purpose}` : '點選零件查看層級，拖動滑桿調整姿態';
    query('#clear-solo').textContent = snapshot.soloId ? `解除 Solo · ${nodes.get(snapshot.soloId).name}` : '解除 Solo';
  }
  function button(text, title, action, id) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = text;
    element.title = title;
    element.setAttribute('aria-label', title);
    element.dataset.action = action;
    element.dataset.nodeId = id;
    element.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (action === 'select') scene.select(id);
      else if (action === 'visible') scene.setVisible(id, scene.state.hidden.has(id));
      else scene.solo(scene.state.soloId === id ? null : id);
      sync();
    });
    return element;
  }
  function branch(id, depth) {
    const node = nodes.get(id);
    const descendants = scene.children.get(id);
    const wrapper = document.createElement(descendants.length ? 'details' : 'div');
    wrapper.className = 'tree-node';
    wrapper.dataset.nodeId = id;
    if (descendants.length) { wrapper.open = depth < 2; details.set(id, wrapper); }
    const row = document.createElement(descendants.length ? 'summary' : 'div');
    row.className = 'tree-row';
    const marker = document.createElement('span');
    marker.className = 'branch-marker';
    marker.textContent = descendants.length ? '›' : '·';
    row.append(marker);
    row.append(button('●', `顯示／隱藏 ${node.name}`, 'visible', id));
    const label = button(node.name, `${node.name}：${node.purpose}`, 'select', id);
    label.className = 'node-label';
    row.append(label, button('S', `Solo ${node.name}`, 'solo', id));
    wrapper.append(row);
    rows.set(id, row);
    if (descendants.length) {
      const children = document.createElement('div');
      children.className = 'tree-children';
      for (const child of descendants) children.append(branch(child, depth + 1));
      wrapper.append(children);
    }
    return wrapper;
  }
  tree.append(branch(scene.plan.rootId, 0));
  query('#part-count').value = `${scene.jobs.length} 葉 · ${scene.plan.nodes.length} 節點`;
  query('#pose-controls').disabled = false;
  query('#assembly-controls').disabled = false;
  query('#tree-search').disabled = false;
  query('#show-all').disabled = false;
  query('#depth').max = scene.maxDepth;
  query('#depth').value = scene.maxDepth;
  query('#tree-search').addEventListener('input', event => {
    const value = event.target.value.trim().toLocaleLowerCase();
    const visible = new Set();
    for (const node of scene.plan.nodes) {
      if (`${node.name} ${node.id} ${node.purpose}`.toLocaleLowerCase().includes(value)) {
        let current = node;
        while (current) { visible.add(current.id); current = nodes.get(current.parentId); }
      }
    }
    for (const node of scene.plan.nodes) {
      rows.get(node.id).parentElement.hidden = !visible.has(node.id);
      if (value && visible.has(node.id) && details.has(node.id)) details.get(node.id).open = true;
    }
  });
  const pause = () => { playing = false; cancelAnimationFrame(animation); query('#play').textContent = '播放'; };
  const applyAngles = () => {
    const angles = scene.poseAngles(preset);
    for (const id of inputs) {
      const delta = Number(query(`#${id}`).value);
      query(`#${id}-value`).value = `${delta}°`;
      if (motionNodes[id]) angles[motionNodes[id]] = delta;
    }
    scene.pose({ id: 'manual', angles });
    sync();
  };
  for (const id of inputs) query(`#${id}`).addEventListener('input', () => { pause(); applyAngles(); });
  query('#pose').addEventListener('change', event => {
    pause();
    preset = event.target.value;
    const angles = scene.poseAngles(preset);
    for (const id of inputs) {
      const value = angles[motionNodes[id]] ?? 0;
      query(`#${id}`).value = value;
      query(`#${id}-value`).value = `${value}°`;
    }
    scene.pose(preset);
    sync();
  });
  query('#explode').addEventListener('input', event => {
    scene.explode(Number(event.target.value) / 100);
    query('#explode-value').value = `${event.target.value}%`;
    sync();
  });
  query('#depth').addEventListener('input', event => {
    scene.depth(Number(event.target.value));
    query('#depth-value').value = Number(event.target.value) === 0 ? '組裝' : Number(event.target.value) === scene.maxDepth ? '全部' : `${event.target.value} 層`;
    sync();
  });
  query('#skeleton').addEventListener('change', event => scene.skeleton(event.target.checked));
  query('#clear-solo').addEventListener('click', () => { scene.solo(null); sync(); });
  query('#show-all').addEventListener('click', () => {
    scene.showAll();
    query('#depth').value = scene.maxDepth;
    query('#depth-value').value = '全部';
    sync();
  });
  query('#reset').addEventListener('click', () => {
    pause();
    preset = 'idle';
    zeroSliders();
    query('#pose').value = 'idle';
    query('#explode').value = 0;
    query('#explode-value').value = '0%';
    query('#depth').value = scene.maxDepth;
    query('#depth-value').value = '全部';
    query('#skeleton').checked = false;
    scene.reset();
    sync();
  });
  query('#play').addEventListener('click', () => {
    if (playing) { pause(); return; }
    playing = true;
    query('#play').textContent = '暫停';
    const start = performance.now();
    const baseAngles = scene.poseAngles(preset);
    const tick = now => {
      if (!playing) return;
      const amount = (1 - Math.cos((now - start) / 1700)) / 2;
      const angles = { ...baseAngles };
      for (const id of inputs) {
        const input = query(`#${id}`);
        const target = id === 'arm' ? -65 : Number(input.max) * .6;
        const base = baseAngles[motionNodes[id]] ?? 0;
        const value = base + (target - base) * amount;
        if (motionNodes[id]) angles[motionNodes[id]] = value;
        input.value = Math.round(value);
        query(`#${id}-value`).value = `${Math.round(value)}°`;
      }
      scene.pose({ id: 'playback', angles });
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
  });
  sync();
  return { sync, pause, reveal(id) { let node = nodes.get(id); while (node) { if (details.has(node.id)) details.get(node.id).open = true; node = nodes.get(node.parentId); } sync(); } };
};
