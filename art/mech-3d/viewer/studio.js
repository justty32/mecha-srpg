import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.min.js';

export function createStudio(container) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', '可旋轉的衡岳三維機甲');
  container.append(canvas);
  const context = canvas.getContext('webgl2', { antialias: true, alpha: false, preserveDrawingBuffer: true });
  if (!context) throw new Error('此環境無法建立 WebGL2，請使用支援 WebGL2 的瀏覽器。');
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111921');
  scene.fog = new THREE.Fog('#111921', 18, 45);
  const camera = new THREE.PerspectiveCamera(37, 1, .02, 100);
  camera.position.set(6, 4.7, 9);
  const orbit = new OrbitControls(camera, canvas);
  orbit.target.set(0, 2.1, 0);
  orbit.enableDamping = true;
  orbit.dampingFactor = .12;
  orbit.minDistance = 2;
  orbit.maxDistance = 22;
  orbit.maxPolarAngle = Math.PI * .88;
  orbit.enablePan = true;
  scene.add(new THREE.HemisphereLight('#d3e4ed', '#22252c', 2.2));
  const light = (color, intensity, position, shadow = false) => {
    const source = new THREE.DirectionalLight(color, intensity);
    source.position.set(...position);
    source.castShadow = shadow;
    if (shadow) {
      source.shadow.mapSize.set(1024, 1024);
      source.shadow.camera.left = -6;
      source.shadow.camera.right = 6;
      source.shadow.camera.top = 8;
      source.shadow.camera.bottom = -5;
      source.shadow.normalBias = .025;
      source.shadow.bias = -.00015;
    }
    scene.add(source);
  };
  light('#fff3db', 4.2, [5, 9, 7], true);
  light('#92cbd8', 2.6, [-5, 5, -5]);
  light('#b2d8e8', 2.0, [0, 5, -8]);
  light('#edb788', 1.2, [5, 4, -6]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: '#111a23', roughness: .9 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.14;
  floor.receiveShadow = true;
  scene.add(floor);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.7, .12, 80), new THREE.MeshStandardMaterial({ color: '#2d3b46', metalness: .35, roughness: .42 }));
  pedestal.position.y = -.08;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.55, .009, 8, 100), new THREE.MeshBasicMaterial({ color: '#a2c8c5' }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -.012;
  scene.add(ring);
  const modelHost = new THREE.Group();
  scene.add(modelHost);
  let pending = false;
  let animation = null;
  let dprSetting = 'auto';
  let frameCount = 0;
  let fitRadius = 2.8;
  let fitCenter = new THREE.Vector3(0, 2.2, 0);
  let currentPreset = 'front';
  function draw(now) {
    pending = false;
    if (animation) animation(now);
    const moved = orbit.update();
    renderer.render(scene, camera);
    frameCount++;
    if (moved || animation) requestRender();
  }
  function requestRender() {
    if (!pending) { pending = true; requestAnimationFrame(draw); }
  }
  orbit.addEventListener('change', requestRender);
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    const dpr = dprSetting === 'auto' ? Math.min(window.devicePixelRatio || 1, 2) : Number(dprSetting);
    renderer.setPixelRatio(dpr);
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    requestRender();
  }
  new ResizeObserver(resize).observe(container);
  function preset(name) {
    const directions = { front: [0, .10, 1], side: [1, .10, 0], back: [0, .10, -1], iso: [.8, .32, 1] };
    if (!directions[name]) throw new Error(`未知視角：${name}`);
    currentPreset = name;
    const aspect = Math.min(camera.aspect, 1);
    const distance = fitRadius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(aspect, .55) * 1.1;
    const direction = new THREE.Vector3(...directions[name]).normalize().multiplyScalar(distance);
    // 清除先前拖曳的阻尼餘量，預設正／側／背才能停在指定方向。
    const damping = orbit.enableDamping;
    orbit.enableDamping = false;
    orbit.update();
    orbit.target.copy(fitCenter);
    camera.position.copy(fitCenter).add(direction);
    orbit.update();
    orbit.enableDamping = damping;
    camera.updateMatrixWorld(true);
    requestRender();
  }
  function fit(bounds) {
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    fitCenter.copy(sphere.center);
    fitRadius = sphere.radius;
    preset('iso');
  }
  function pixelProbe() {
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    const colors = [];
    const buffer = new Uint8Array(4);
    for (let y = 1; y <= 7; y++) for (let x = 1; x <= 7; x++) {
      gl.readPixels(Math.floor(canvas.width * x / 8), Math.floor(canvas.height * y / 8), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
      colors.push(Array.from(buffer));
    }
    return { samples: colors.length, unique: new Set(colors.map(color => color.join(','))).size, rgba: colors };
  }
  function snapshot() {
    const gl = renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      webgl2: gl instanceof WebGL2RenderingContext,
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      frameCount, renderCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
      preset: currentPreset, camera: camera.position.toArray(), target: orbit.target.toArray(),
      width: renderer.domElement.clientWidth, height: renderer.domElement.clientHeight,
      canvasWidth: canvas.width, canvasHeight: canvas.height, dpr: renderer.getPixelRatio(),
    };
  }
  resize();
  preset('front');
  return {
    THREE, renderer, scene, camera, orbit, modelHost, canvas, fit, preset, requestRender, snapshot, pixelProbe,
    animate(callback) { animation = callback; requestRender(); },
    dpr(value) { if (!['auto', '1', '2'].includes(String(value))) throw new Error('無效 DPR'); dprSetting = String(value); resize(); },
  };
}
