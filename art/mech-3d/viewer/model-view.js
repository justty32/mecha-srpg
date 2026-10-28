export function createModelView({ studio, api, createLeafMesh, expectedHash, onSelect = () => {} }) {
  const { THREE } = studio;
  const plan = api.configureModel();
  const validation = api.validateModel(plan);
  if (!validation.ok) throw new Error(`模型配置無效：${JSON.stringify(validation.errors)}`);
  if (plan.hash !== expectedHash) throw new Error('模型配置與凍結 planHash 不符');
  const jobs = api.createLeafJobs(plan);
  if (jobs.length > 120 || plan.nodes.length > 240) throw new Error('超過 120 葉／240 節點 gate');
  const nodes = new Map(plan.nodes.map(node => [node.id, node]));
  const children = new Map(plan.nodes.map(node => [node.id, []]));
  for (const node of plan.nodes) if (node.parentId) children.get(node.parentId).push(node.id);
  const paths = new Map();
  for (const node of plan.nodes) {
    const path = [];
    let current = node;
    while (current) { path.unshift(current.id); current = nodes.get(current.parentId); }
    paths.set(node.id, path);
  }
  const maxDepth = Math.max(...[...paths.values()].map(path => path.length - 1));
  const state = { selectedId: null, soloId: null, hidden: new Set(), explode: 0, depth: maxDepth, pose: 'idle' };
  const leaves = new Map();
  let solidCount = 0;
  for (const job of jobs) {
    if (job.planHash !== expectedHash) throw new Error(`葉工作單 hash 不符：${job.nodeId}`);
    const content = createLeafMesh(THREE, job);
    if (!content?.isObject3D) throw new Error(`非真 Object3D：${job.nodeId}`);
    // 外層只承接正式世界矩陣；模型回傳的局部內容與變換原樣保留。
    const object = new THREE.Group();
    object.add(content);
    object.userData.nodeId = job.nodeId;
    object.matrixAutoUpdate = false;
    object.traverse(child => {
      if (!child.isMesh) return;
      solidCount++;
      child.geometry.computeBoundingBox();
      const box = child.geometry.boundingBox;
      if (!box || [...box.min.toArray(), ...box.max.toArray()].some(value => !Number.isFinite(value))) throw new Error(`非 finite mesh bounds：${job.nodeId}`);
      const size = box.getSize(new THREE.Vector3());
      if (Math.min(size.x, size.y, size.z) <= 0) throw new Error(`無真厚度 mesh：${job.nodeId}`);
      child.castShadow = true;
      child.receiveShadow = true;
    });
    studio.modelHost.add(object);
    leaves.set(job.nodeId, object);
  }
  if (!solidCount) throw new Error('模型沒有 solid mesh');
  const helper = new THREE.Box3Helper(new THREE.Box3(), '#efd091');
  helper.visible = false;
  helper.material.depthTest = false;
  helper.renderOrder = 100;
  studio.scene.add(helper);
  let frame;
  let evaluatedPose;
  const matrices = new Map();
  function offset(id) {
    const value = new THREE.Vector3();
    if (!state.explode) return value;
    const path = paths.get(id);
    for (let depth = 1; depth < path.length && depth <= state.depth; depth++) {
      const a = new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(frame.byNode[path[depth]].matrix));
      const b = new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(frame.byNode[path[depth - 1]].matrix));
      const direction = a.sub(b);
      if (direction.lengthSq() < 1e-8) direction.set(Math.cos(depth * 2.4), .3, Math.sin(depth * 2.4));
      value.add(direction.normalize().multiplyScalar(.18 * state.explode));
    }
    return value;
  }
  const isVisible = id => !paths.get(id).some(parent => state.hidden.has(parent)) && (!state.soloId || paths.get(id).includes(state.soloId));
  function updateSelection() {
    helper.visible = Boolean(state.selectedId);
    if (!state.selectedId) return;
    const box = new THREE.Box3();
    for (const [id, leaf] of leaves) if (leaf.visible && paths.get(id).includes(state.selectedId)) box.expandByObject(leaf);
    helper.visible = !box.isEmpty();
    if (helper.visible) helper.box.copy(box);
  }
  function update() {
    if (evaluatedPose !== state.pose) { frame = api.evaluatePose(plan, state.pose); evaluatedPose = state.pose; }
    if (frame.planHash !== expectedHash) throw new Error('姿態 frame 與凍結 hash 不符');
    matrices.clear();
    for (const [id, object] of leaves) {
      const matrix = [...frame.byNode[id].matrix];
      if (matrix.length !== 16 || matrix.some(value => !Number.isFinite(value))) throw new Error(`無效世界矩陣：${id}`);
      const delta = offset(id);
      matrix[12] += delta.x; matrix[13] += delta.y; matrix[14] += delta.z;
      object.matrix.fromArray(matrix);
      object.matrixWorldNeedsUpdate = true;
      object.visible = isVisible(id);
      matrices.set(id, matrix);
    }
    studio.modelHost.updateMatrixWorld(true);
    updateSelection();
    studio.requestRender();
  }
  function requireId(id) { if (!nodes.has(id)) throw new Error(`未知模型節點：${id}`); }
  function select(id) { requireId(id); state.selectedId = id; updateSelection(); studio.requestRender(); onSelect(id); }
  const raycaster = new THREE.Raycaster();
  let down;
  let lastPick = null;
  studio.canvas.addEventListener('pointerdown', event => { down = { x: event.clientX, y: event.clientY }; });
  studio.canvas.addEventListener('pointerup', event => {
    if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5 || event.button !== 0) return;
    const box = studio.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2((event.clientX - box.x) / box.width * 2 - 1, -(event.clientY - box.y) / box.height * 2 + 1);
    studio.camera.updateMatrixWorld(true);
    raycaster.setFromCamera(mouse, studio.camera);
    const hits = raycaster.intersectObjects([...leaves.values()].filter(leaf => leaf.visible), true);
    lastPick = { x: event.clientX, y: event.clientY, hitCount: hits.length, nodeId: null };
    if (!hits.length) return;
    let object = hits[0].object;
    while (object && !object.userData.nodeId) object = object.parent;
    if (object) { lastPick.nodeId = object.userData.nodeId; select(object.userData.nodeId); }
  });
  update();
  studio.fit(new THREE.Box3().setFromObject(studio.modelHost));
  return {
    plan, jobs, state, nodes, children, maxDepth, select,
    visible(id, value) { requireId(id); if (value) state.hidden.delete(id); else state.hidden.add(id); update(); },
    solo(id) { if (id !== null) requireId(id); state.soloId = id; update(); },
    showAll() { state.hidden.clear(); state.soloId = null; update(); },
    pose(pose) { const next = api.evaluatePose(plan, pose); if (next.planHash !== expectedHash) throw new Error('非法姿態 hash'); frame = next; state.pose = pose; evaluatedPose = pose; update(); },
    explode(value) { if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error('分解值須介於0..1'); state.explode = value; update(); },
    depth(value) { if (!Number.isInteger(value) || value < 0 || value > maxDepth) throw new Error('無效分解層深'); state.depth = value; update(); },
    reset() { state.hidden.clear(); state.soloId = null; state.selectedId = null; state.explode = 0; state.depth = maxDepth; state.pose = 'idle'; update(); },
    project(id) {
      requireId(id);
      const object = leaves.get(id);
      if (!object) throw new Error('此節點不是葉 mesh');
      studio.camera.updateMatrixWorld(true);
      const point = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3()).project(studio.camera);
      const box = studio.canvas.getBoundingClientRect();
      return { x: box.x + (point.x + 1) / 2 * box.width, y: box.y + (1 - point.y) / 2 * box.height };
    },
    opticsVisibility() {
      studio.camera.updateMatrixWorld(true);
      const origin = new THREE.Vector3().setFromMatrixPosition(studio.camera.matrixWorld);
      return jobs.filter(job => job.nodeId.includes('.optics.')).map(job => {
        const center = new THREE.Box3().setFromObject(leaves.get(job.nodeId)).getCenter(new THREE.Vector3());
        raycaster.set(origin, center.sub(origin).normalize());
        const first = raycaster.intersectObjects([...leaves.values()].filter(leaf => leaf.visible), true)[0];
        let object = first?.object;
        while (object && !object.userData.nodeId) object = object.parent;
        const firstHit = object?.userData.nodeId ?? null;
        return { nodeId: job.nodeId, firstHit, centerVisible: firstHit === job.nodeId, camera: origin.toArray(), target: studio.orbit.target.toArray() };
      });
    },
    snapshot: () => ({
      interfaceVersion: plan.interfaceVersion, planHash: expectedHash, nodeCount: nodes.size, leafCount: jobs.length, solidCount, maxDepth,
      selectedId: state.selectedId, soloId: state.soloId, hiddenIds: [...state.hidden], visibleIds: [...leaves].filter(([, object]) => object.visible).map(([id]) => id),
      pose: state.pose, explode: state.explode, depth: state.depth, lastPick, matrices: Object.fromEntries(matrices),
    }),
  };
}
