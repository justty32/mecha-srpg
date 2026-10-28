(() => {
  'use strict';
  if (Konva.version !== '10.9.0') throw new Error('Konva version mismatch');
  const container = document.querySelector('#stage');
  const stage = new Konva.Stage({ container, width: 1, height: 1 });
  const environment = new Konva.Layer();
  const surface = new Konva.Group();
  const floor = new Konva.Ellipse({ x: 0, y: 440, radiusX: 340, radiusY: 58, fill: '#03090e', opacity: .65, listening: false });
  const ring = new Konva.Ellipse({ x: 0, y: 440, radiusX: 375, radiusY: 68, stroke: '#4b807f', strokeWidth: 1, opacity: .45, listening: false });
  const backlight = new Konva.Ellipse({ x: 0, y: -20, radiusX: 270, radiusY: 400, fillRadialGradientStartPoint: { x: 0, y: 0 }, fillRadialGradientStartRadius: 20, fillRadialGradientEndPoint: { x: 0, y: 0 }, fillRadialGradientEndRadius: 400, fillRadialGradientColorStops: [0, '#35607880', 1, '#14212c00'], listening: false });
  surface.add(backlight);
  surface.add(floor, ring);
  environment.add(surface);
  stage.add(environment);
  let zoom = 1;
  let scene;
  let controls;
  let status = 'WAITING_FOR_FROZEN_CORE_AND_DRAWING';
  let failure = null;
  function applyPixelRatio() {
    const setting = document.querySelector('#dpi').value;
    const ratio = setting === 'auto' ? window.devicePixelRatio || 1 : Number(setting);
    Konva.pixelRatio = ratio;
    for (const layer of stage.getLayers()) {
      if (layer.getCanvas().getPixelRatio() !== ratio) {
        layer.getCanvas().setPixelRatio(ratio);
        layer.getHitCanvas().setPixelRatio(ratio);
      }
    }
  }
  function resize() {
    applyPixelRatio();
    const { width, height } = container.getBoundingClientRect();
    stage.size({ width, height });
    const scale = Math.min((width - 36) / 1120, (height - 74) / 1120) * zoom;
    surface.position({ x: width / 2, y: height / 2 });
    surface.scale({ x: scale, y: scale });
    stage.batchDraw();
  }
  document.querySelector('#zoom').addEventListener('input', event => {
    zoom = Number(event.target.value) / 100;
    document.querySelector('#zoom-value').value = `${event.target.value}%`;
    resize();
  });
  document.querySelector('#fit').addEventListener('click', () => {
    zoom = 1;
    document.querySelector('#zoom').value = 100;
    document.querySelector('#zoom-value').value = '100%';
    resize();
  });
  document.querySelector('#dpi').addEventListener('change', () => {
    applyPixelRatio();
    stage.draw();
  });
  new ResizeObserver(resize).observe(container);
  resize();
  function mountDelivery(delivery) {
    try {
      if (!delivery?.coreFrozen || delivery.interfaceVersion !== '1.1.0') throw new Error('核心尚未凍結或接口版本不符');
      scene = window.createCanvasMechScene({ core: delivery.core, drawLeaf: delivery.drawLeaf, host: surface, onSelect: id => controls?.reveal(id) });
      if (scene.plan.hash !== delivery.planHash) throw new Error('展示核心與凍結 manifest hash 不符');
      controls = window.mountCanvasMechControls(scene, { motionNodes: {
        arm: 'root.arm-near.shoulder', elbow: 'root.arm-near.forearm', knee: 'root.leg-near.shin',
      } });
      if (delivery.drawingFrozen && typeof delivery.drawLeaf === 'function') {
        status = 'READY';
        document.querySelector('#pending').hidden = true;
        document.querySelector('#build-status').textContent = '整備就緒';
        document.querySelector('#render-info').textContent = '點零件選取 · 左欄顯隱與 Solo';
      } else {
        status = 'WAITING_FOR_FROZEN_DRAWING';
        document.querySelector('#pending strong').textContent = '零件配置已載入';
        document.querySelector('#pending p').textContent = '逐葉畫件整備中；可先操作層樹、姿態與骨架';
        document.querySelector('#build-status').textContent = '畫件整備中';
        document.querySelector('#render-info').textContent = '層樹已就緒 · 可開啟骨架與接點';
      }
      resize();
    } catch (error) {
      failure = error.message;
      status = 'ERROR';
      document.querySelector('#pending').hidden = false;
      document.querySelector('#pending strong').textContent = '整備台載入失敗';
      document.querySelector('#pending p').textContent = error.message;
      document.querySelector('#build-status').textContent = '載入失敗';
      throw error;
    }
  }
  window.addEventListener('canvas-mech-delivery', event => mountDelivery(event.detail), { once: true });
  window.addEventListener('canvas-mech-delivery-error', event => {
    status = 'ERROR';
    failure = event.detail;
    document.querySelector('#pending strong').textContent = '整備台載入失敗';
    document.querySelector('#pending p').textContent = failure;
  }, { once: true });
  window.__canvasMech = {
    get status() { return status; },
    snapshot: () => ({ status, failure, konva: Konva.version, width: stage.width(), height: stage.height(), zoom, pixelRatio: environment.getCanvas().getPixelRatio(), canvasPixels: { width: environment.getCanvas()._canvas.width, height: environment.getCanvas()._canvas.height }, ...(scene?.snapshot() ?? {}) }),
    select(id) { scene.select(id); controls.reveal(id); },
    setVisible(id, value) { scene.setVisible(id, value); controls.sync(); },
    solo(id) { scene.solo(id); controls.sync(); },
    pose(value) { controls.pause(); scene.pose(value); controls.sync(); },
    explode(value) { scene.explode(value); controls.sync(); },
    screenPoint(id) {
      const bounds = scene.plan.nodes.find(node => node.id === id)?.envelope;
      const matrix = scene.snapshot().matrices[id];
      if (!bounds || !matrix) throw new Error(`未知葉：${id}`);
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      const point = { x: matrix[0] * x + matrix[2] * y + matrix[4] - 560, y: matrix[1] * x + matrix[3] * y + matrix[5] - 560 };
      return surface.getAbsoluteTransform().point(point);
    },
  };
})();
