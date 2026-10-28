// 依 core/API.md 1.1.0 接收凍結交付；此檔不含機甲造型或幾何配置。
window.createCanvasMechScene = function createCanvasMechScene({ core, drawLeaf, host, onSelect = () => {} }) {
  const plan = core.configureMech();
  const validation = core.validateAssembly(plan);
  if (!validation.ok) throw new Error(`核心驗證失敗：${JSON.stringify(validation.errors)}`);
  if (plan.interfaceVersion !== '1.1.0') throw new Error('尚未支援的核心接口版本');
  const jobs = core.createLeafJobs(plan);
  if (jobs.length > 160 || plan.nodes.length > 260) throw new Error('超過 160 葉／260 節點 gate');
  const nodes = new Map(plan.nodes.map(node => [node.id, node]));
  const jobsById = new Map(jobs.map(job => [job.nodeId, job]));
  const children = new Map(plan.nodes.map(node => [node.id, []]));
  for (const node of plan.nodes) if (node.parentId) children.get(node.parentId).push(node.id);
  const ancestors = id => {
    const result = [];
    let node = nodes.get(id);
    while (node) { result.unshift(node.id); node = nodes.get(node.parentId); }
    return result;
  };
  const paths = new Map(plan.nodes.map(node => [node.id, ancestors(node.id)]));
  const maxDepth = Math.max(...[...paths.values()].map(path => path.length - 1));
  const state = { hidden: new Set(), selectedId: null, soloId: null, explode: 0, depth: maxDepth, skeleton: false, pose: 'idle' };
  const root = new Konva.Group({ x: -560, y: -560 });
  const parts = new Konva.Group();
  const overlay = new Konva.Group({ listening: false });
  root.add(parts, overlay);
  host.add(root);
  let frame;
  let evaluatedPose;
  let visibleIds = [];
  const shapes = new Map();
  const visualStates = new Map();
  const offsetFor = id => {
    if (!state.explode) return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    const path = paths.get(id);
    // 沿真正語義祖先逐層累加分解位移，恢復到 0 時精確回原矩陣。
    for (let index = 1; index < path.length && index <= state.depth; index++) {
      const world = frame.byNode[path[index]].worldPivot;
      const parent = frame.byNode[path[index - 1]].worldPivot;
      const dx = world.x - parent.x;
      const dy = world.y - parent.y;
      const length = Math.hypot(dx, dy);
      const angle = index * 2.399963229728653;
      x += (length > 1 ? dx / length : Math.cos(angle)) * 27 * state.explode;
      y += (length > 1 ? dy / length : Math.sin(angle)) * 27 * state.explode;
    }
    return { x, y };
  };
  const isVisible = id => {
    const path = paths.get(id);
    if (path.some(ancestor => state.hidden.has(ancestor))) return false;
    return !state.soloId || path.includes(state.soloId);
  };
  const transform = (context, matrix) => context.transform(...matrix);
  for (const job of jobs) {
    if (job.planHash !== plan.hash) throw new Error(`工作單 planHash 不符：${job.nodeId}`);
    const shape = new Konva.Shape({
      id: job.nodeId,
      sceneFunc(context) {
        const visual = visualStates.get(job.nodeId);
        if (!visual) return;
        const raw = context._context;
        raw.save();
        try {
          transform(raw, visual.worldMatrix);
          if (drawLeaf) drawLeaf(raw, job, visual);
        } finally { raw.restore(); }
      },
      hitFunc(context, node) {
        const visual = visualStates.get(job.nodeId);
        if (!visual) return;
        const bounds = job.localGeometry.bounds;
        context.save();
        transform(context, visual.worldMatrix);
        context.beginPath();
        context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        context.closePath();
        context.fillStrokeShape(node);
        context.restore();
      },
    });
    shape.listening(Boolean(drawLeaf));
    shape.on('click tap', () => { state.selectedId = job.nodeId; update(); onSelect(job.nodeId); });
    parts.add(shape);
    shapes.set(job.nodeId, shape);
  }
  function updateOverlay() {
    overlay.destroyChildren();
    if (state.skeleton) {
      for (const joint of plan.rig.joints) {
        if (nodes.get(joint.nodeId).kind !== 'group' && joint.nodeId !== state.selectedId) continue;
        const nodeFrame = frame.byNode[joint.nodeId];
        const offset = offsetFor(joint.nodeId);
        const pivot = { x: nodeFrame.worldPivot.x + offset.x, y: nodeFrame.worldPivot.y + offset.y };
        if (joint.parentId) {
          const parent = frame.byNode[joint.parentId].worldPivot;
          const parentOffset = offsetFor(joint.parentId);
          overlay.add(new Konva.Line({ points: [parent.x + parentOffset.x, parent.y + parentOffset.y, pivot.x, pivot.y], stroke: '#77e1da', strokeWidth: 2, opacity: .8 }));
        }
        overlay.add(new Konva.Circle({ ...pivot, radius: 4, stroke: '#bcfff3', strokeWidth: 1, fill: '#142c33' }));
        for (const point of Object.values(nodeFrame.attachments)) {
          overlay.add(new Konva.Circle({ x: point.x + offset.x, y: point.y + offset.y, radius: 2, fill: '#f6ba68' }));
        }
      }
    }
    if (state.selectedId) {
      const bounds = frame.byNode[state.selectedId].worldBounds;
      const offset = offsetFor(state.selectedId);
      overlay.add(new Konva.Rect({ x: bounds.x + offset.x, y: bounds.y + offset.y, width: bounds.width, height: bounds.height, stroke: '#c5fff4', strokeWidth: 1.5, dash: [6, 4] }));
    }
  }
  function update() {
    if (evaluatedPose !== state.pose) {
      frame = core.evaluatePose(plan, state.pose);
      evaluatedPose = state.pose;
    }
    if (frame.planHash !== plan.hash) throw new Error('FrameState planHash 不符');
    visualStates.clear();
    visibleIds = [];
    for (const [order, item] of frame.drawOrder.entries()) {
      const id = typeof item === 'string' ? item : item.nodeId;
      const shape = shapes.get(id);
      if (!shape) throw new Error(`畫序引用未知葉：${id}`);
      const nodeFrame = frame.byNode[id];
      const matrix = [...nodeFrame.worldMatrix];
      if (matrix.length !== 6 || matrix.some(value => !Number.isFinite(value))) throw new Error(`無效世界矩陣：${id}`);
      const offset = offsetFor(id);
      matrix[4] += offset.x;
      matrix[5] += offset.y;
      const selected = state.selectedId && paths.get(id).includes(state.selectedId);
      visualStates.set(id, { ...nodeFrame, worldMatrix: matrix, selected: Boolean(selected), hovered: false, exploded: state.explode });
      shape.visible(isVisible(id));
      shape.zIndex(order);
      if (shape.visible()) visibleIds.push(id);
    }
    updateOverlay();
    host.getLayer()?.batchDraw();
  }
  function requireId(id) { if (!nodes.has(id)) throw new Error(`未知節點：${id}`); }
  update();
  return {
    plan, jobs, children, maxDepth, state,
    poseAngles(name) {
      if (!plan.poses[name]) throw new Error(`未知姿態：${name}`);
      return { ...plan.poses[name].angles };
    },
    select(id) { requireId(id); state.selectedId = id; update(); onSelect(id); },
    setVisible(id, visible) { requireId(id); if (visible) state.hidden.delete(id); else state.hidden.add(id); update(); },
    solo(id) { if (id !== null) requireId(id); state.soloId = id; update(); },
    showAll() { state.hidden.clear(); state.soloId = null; state.depth = maxDepth; update(); },
    pose(value) { const next = core.evaluatePose(plan, value); if (next.planHash !== plan.hash) throw new Error('姿態工作單不符'); state.pose = value; frame = next; evaluatedPose = value; update(); },
    explode(value) { if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error('分解值須為 0..1'); state.explode = value; update(); },
    depth(value) { if (!Number.isInteger(value) || value < 0 || value > maxDepth) throw new Error('無效層深'); state.depth = value; update(); },
    skeleton(value) { state.skeleton = Boolean(value); update(); },
    reset() { state.hidden.clear(); state.selectedId = null; state.soloId = null; state.explode = 0; state.depth = maxDepth; state.skeleton = false; state.pose = 'idle'; update(); },
    snapshot() {
      return {
        interfaceVersion: plan.interfaceVersion, planHash: plan.hash, leafCount: jobs.length, nodeCount: plan.nodes.length, maxDepth,
        connectionCount: plan.connections.length, coverageCount: jobs.reduce((count, job) => count + job.requiredCoverage.length, 0),
        selectedId: state.selectedId, soloId: state.soloId, hiddenIds: [...state.hidden], visibleIds: [...visibleIds],
        explode: state.explode, depth: state.depth, skeleton: state.skeleton, pose: state.pose,
        matrices: Object.fromEntries([...visualStates].map(([id, visual]) => [id, visual.worldMatrix])),
      };
    },
  };
};
