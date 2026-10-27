function draw() {
  const pose = interpolatePose(bind, target(), state.t),
    worlds = worldMatrices(data.rig.bones, pose),
    matrices = slotMatrices(data.slots.slots, worlds),
    stage = $('stage');
  stage.replaceChildren();
  const exploded = state.mode === 'exploded';
  $('canvas').setAttribute(
    'viewBox',
    exploded ? '0 0 1850 1550' : `0 0 ${data.design.canvas.width} ${data.design.canvas.height}`,
  );
  if (state.mode === 'layout') {
    data.layout.nodes
      .filter((n) => n.level !== 'machine' && visibleLayout(n.id))
      .forEach((n) =>
        region(
          stage,
          n.envelope,
          frameMatrix(n.frame, worlds),
          n.level === 'part' ? '#7ee9cf' : '#caa473',
          n.level === 'part' ? '#488f8720' : '#d99d4520',
          n.level === 'major' ? 3 : 1,
        ),
      );
  } else
    data.order.base.forEach((id, i) => {
      const slot = slots.get(id);
      if (!slot || !visible(slot)) return;
      const a = attachments.get(slot.attachment),
        fragment = data.fragments[slot.attachment];
      if (!a || !fragment) return;
      const holder = svg('svg');
      holder.innerHTML = fragment;
      let root = null;
      for (const el of [...holder.children]) {
        if (el.id === `${a.id}--${a.element}`) root = el;
        stage.append(el);
      }
      if (!root) return;
      const m = exploded ? explodedMatrix(a.viewBox, i) : matrices[id];
      root.setAttribute('transform', mt(m));
      root.dataset.attachment = a.id;
      root.classList.toggle('selected', state.selected === a.id);
      root.addEventListener('click', () => select(a.id));
      if (exploded) {
        const label = svg('text', {
          x: (i % 8) * 220 + 110,
          y: Math.floor(i / 8) * 180 + 170,
          'text-anchor': 'middle',
          fill: '#9bbcc9',
          'font-size': 12,
        });
        label.textContent = a.id;
        stage.append(label);
      }
      if ($('envelopes').checked || state.selected === a.id) {
        const w = data.orders.orders.find((o) => o.slot === slot.id);
        if (w) region(stage, w.localEnvelope, m, '#6febd2');
      }
      if ($('contacts').checked || state.selected === a.id) {
        dot(stage, transformPoint(m, [0, 0]), '#ffce79', 5);
        a.contacts.forEach((c) => dot(stage, transformPoint(m, c.at), '#f5a8e8', 3));
      }
    });
  if ($('skeleton').checked && !exploded)
    for (const b of data.rig.bones) {
      const m = worlds[b.id],
        p = transformPoint(m, [0, 0]),
        end = transformPoint(m, [0, b.length]);
      stage.append(
        svg('line', {
          x1: p[0],
          y1: p[1],
          x2: end[0],
          y2: end[1],
          stroke: '#f8d888',
          'stroke-width': 3,
          'vector-effect': 'non-scaling-stroke',
        }),
      );
      dot(stage, p, '#f8d888', 6);
    }
  if ($('envelopes').checked && !exploded && attachments.has(state.selected)) {
    const a = attachments.get(state.selected),
      s = data.slots.slots.find((s) => s.attachment === a.id);
    if (s)
      for (const sample of sampleTransition(bind, target(), 21)) {
        const m = slotMatrices([s], worldMatrices(data.rig.bones, sample))[s.id];
        region(stage, a.occupancy, m, '#72d9ea30', '#72d9ea06', 0.5);
      }
  }
  if (!exploded)
    for (const d of data.diagnostics) {
      if (!d.region) continue;
      if (d.pose && d.pose !== target().id && !(state.t === 0 && d.pose === 'bind')) continue;
      if (d.sample !== undefined && Math.abs(d.sample - Math.round(state.t * 20)) > 0) continue;
      region(stage, d.region, identity(), '#ff645f', '#ff463b65', 2);
    }
  $('progress').value = String(Math.round(state.t * 1000));
  $('time').textContent = `${Math.round(state.t * 100)}%`;
  $('mode-label').textContent =
    (partial ? 'PARTIAL · ' : '') +
    {
      assembled: 'ASSEMBLED / 組裝',
      layout: 'CONFIGURATION / 配置',
      exploded: 'ATTACHMENTS / 獨立分件',
    }[state.mode];
  window.__blueprintState = {
    mode: state.mode,
    selected: state.selected,
    pose: target().id,
    progress: state.t,
    hidden: [...state.hidden],
    solo: state.solo,
    playing: state.playing,
  };
}
