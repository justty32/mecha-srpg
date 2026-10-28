export function mountControls(view, studio, { joints, poses, onReset = () => {}, onChange = () => {} }) {
  const query = selector => document.querySelector(selector);
  const ids = ['shoulder', 'elbow', 'knee'];
  let selected = 'idle';
  let playing = false;
  query('#motion').disabled = false;
  query('#assembly').disabled = false;
  query('#pose').replaceChildren();
  for (const pose of poses) {
    const option = document.createElement('option');
    option.value = pose.id;
    option.textContent = pose.name;
    query('#pose').append(option);
  }
  query('#pose').value = selected;
  for (const id of ids) {
    const control = joints[id];
    if (!control || !Number.isFinite(control.min) || !Number.isFinite(control.max)) throw new Error(`無效正式關節控制：${id}`);
    query(`#${id}`).min = control.min;
    query(`#${id}`).max = control.max;
  }
  query('#depth').max = view.maxDepth;
  query('#depth').value = view.maxDepth;
  const anglesFor = id => {
    const pose = poses.find(pose => pose.id === id);
    if (!pose) throw new Error(`未知正式姿態：${id}`);
    return { ...pose.angles };
  };
  function showAngles(angles) {
    for (const id of ids) {
      const value = angles[joints[id].nodeId] ?? 0;
      query(`#${id}`).value = Math.round(value);
      query(`#${id}-out`).value = `${Math.round(value)}°`;
    }
  }
  function pause() {
    playing = false;
    studio.animate(null);
    query('#play').textContent = '播放';
  }
  for (const id of ids) query(`#${id}`).addEventListener('input', () => {
    pause();
    const angles = anglesFor(selected);
    for (const control of ids) angles[joints[control].nodeId] = Number(query(`#${control}`).value);
    showAngles(angles);
    view.pose({ id: 'manual', angles });
    onChange();
  });
  query('#pose').addEventListener('change', event => {
    pause();
    selected = event.target.value;
    showAngles(anglesFor(selected));
    view.pose(selected);
    onChange();
  });
  query('#explode').addEventListener('input', event => {
    const value = Number(event.target.value);
    view.explode(value / 100);
    query('#explode-out').value = `${value}%`;
    onChange();
  });
  query('#depth').addEventListener('input', event => {
    const value = Number(event.target.value);
    view.depth(value);
    query('#depth-out').value = value === 0 ? '組裝' : value === view.maxDepth ? '全部' : `${value} 層`;
    onChange();
  });
  query('#reset').addEventListener('click', () => {
    pause();
    selected = 'idle';
    query('#pose').value = selected;
    showAngles(anglesFor(selected));
    query('#explode').value = 0;
    query('#explode-out').value = '0%';
    query('#depth').value = view.maxDepth;
    query('#depth-out').value = '全部';
    view.reset();
    onChange();
    onReset();
  });
  query('#play').addEventListener('click', () => {
    if (playing) { pause(); return; }
    playing = true;
    query('#play').textContent = '暫停';
    const start = performance.now();
    const startIndex = Math.max(0, poses.findIndex(pose => pose.id === selected));
    studio.animate(now => {
      const progress = Math.max(0, now - start) / 1700;
      const index = Math.floor(progress);
      const blend = (1 - Math.cos((progress - index) * Math.PI)) / 2;
      const from = poses[(startIndex + index) % poses.length].angles;
      const to = poses[(startIndex + index + 1) % poses.length].angles;
      const angles = {};
      for (const key of new Set([...Object.keys(from), ...Object.keys(to)])) angles[key] = (from[key] ?? 0) * (1 - blend) + (to[key] ?? 0) * blend;
      showAngles(angles);
      view.pose({ id: 'playback', angles });
    });
  });
  showAngles(anglesFor(selected));
  return { pause, get playing() { return playing; } };
}
