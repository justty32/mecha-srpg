export function mountTree(view) {
  const query = selector => document.querySelector(selector);
  const rows = new Map();
  const branches = new Map();
  const tree = query('#tree');
  tree.replaceChildren();
  function sync() {
    const state = view.state;
    for (const [id, row] of rows) {
      row.classList.toggle('selected', state.selectedId === id);
      let node = view.nodes.get(id);
      let hidden = false;
      while (node) { hidden ||= state.hidden.has(node.id); node = view.nodes.get(node.parentId); }
      row.classList.toggle('muted', hidden);
      const visibility = row.querySelector('[data-action="visible"]');
      visibility.textContent = state.hidden.has(id) ? '○' : '●';
      visibility.setAttribute('aria-pressed', String(!state.hidden.has(id)));
      row.querySelector('.solo').setAttribute('aria-pressed', String(state.soloId === id));
    }
    const node = view.nodes.get(state.selectedId);
    query('#part-name').textContent = node?.name ?? '尚未選取';
    query('#part-purpose').textContent = node?.purpose ?? '可選取任一組裝層級或實體零件。';
    query('#selected').textContent = node ? `${node.name} · ${node.id}` : '點選模型或零件名稱查看';
  }
  function actionButton(text, action, id, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.dataset.action = action;
    button.dataset.nodeId = id;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.addEventListener('click', event => {
      event.stopPropagation();
      event.preventDefault();
      if (action === 'select') view.select(id);
      else if (action === 'visible') view.visible(id, view.state.hidden.has(id));
      else view.solo(view.state.soloId === id ? null : id);
      sync();
    });
    return button;
  }
  function branch(id, depth) {
    const node = view.nodes.get(id);
    const children = view.children.get(id);
    const item = document.createElement(children.length ? 'details' : 'div');
    item.className = 'tree-item';
    item.dataset.nodeId = id;
    if (children.length) { item.open = depth < 2; branches.set(id, item); }
    const row = document.createElement(children.length ? 'summary' : 'div');
    row.className = 'tree-row';
    const marker = document.createElement('span');
    marker.className = 'twisty';
    marker.textContent = children.length ? '›' : '·';
    const label = actionButton(node.name, 'select', id, `${node.name}：${node.purpose ?? id}`);
    label.className = 'tree-label';
    const solo = actionButton('S', 'solo', id, `Solo ${node.name}`);
    solo.className = 'solo';
    row.append(marker, actionButton('●', 'visible', id, `顯示／隱藏 ${node.name}`), label, solo);
    item.append(row);
    rows.set(id, row);
    if (children.length) {
      const container = document.createElement('div');
      container.className = 'tree-children';
      for (const child of children) container.append(branch(child, depth + 1));
      item.append(container);
    }
    return item;
  }
  for (const node of view.plan.nodes) if (!node.parentId) tree.append(branch(node.id, 0));
  query('#counts').value = `${view.jobs.length} 葉 / ${view.plan.nodes.length} 層`;
  for (const selector of ['#show-all', '#clear-solo', '#search']) query(selector).disabled = false;
  query('#show-all').addEventListener('click', () => { view.showAll(); sync(); });
  query('#clear-solo').addEventListener('click', () => { view.solo(null); sync(); });
  query('#search').addEventListener('input', event => {
    const search = event.target.value.trim().toLocaleLowerCase();
    const matches = new Set();
    for (const node of view.plan.nodes) if (`${node.name} ${node.id} ${node.purpose ?? ''}`.toLocaleLowerCase().includes(search)) {
      let current = node;
      while (current) { matches.add(current.id); current = view.nodes.get(current.parentId); }
    }
    for (const [id, row] of rows) {
      row.parentElement.hidden = !matches.has(id);
      if (search && matches.has(id) && branches.has(id)) branches.get(id).open = true;
    }
  });
  function reveal(id) {
    let node = view.nodes.get(id);
    while (node) { if (branches.has(node.id)) branches.get(node.id).open = true; node = view.nodes.get(node.parentId); }
    sync();
    rows.get(id)?.scrollIntoView({ block: 'nearest' });
  }
  sync();
  return { sync, reveal };
}
