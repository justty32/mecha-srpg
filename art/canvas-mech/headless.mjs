import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readdir, stat } from 'node:fs/promises';

// 此工具只使用既有 Chromium 1243 與 Node 24 WebSocket；不啟動 GUI、不下載瀏覽器。
const base = fileURLToPath(new URL('./', import.meta.url));
const scratch = resolve(base, '../../node_modules/.canvas-headless');
const framework = process.argv.includes('--framework');
const firstFrameOnly = process.argv.includes('--first-frame');
const evidence = resolve(base, 'viewer/evidence');
const run = new Date().toISOString().replace(/[:.]/g, '-');
const profile = resolve(scratch, `profile-${run}`);
await mkdir(profile, { recursive: true });
await mkdir(evidence, { recursive: true });
async function sizeTree(directory) {
  let size = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    size += entry.isDirectory() ? await sizeTree(path) : (await stat(path)).size;
  }
  return size;
}
const beforeBrowser = await sizeTree(base);
assert.ok(beforeBrowser < 15_000_000, '目前產物已超過 15 MB，停止新增 PNG');
process.stdout.write(`CAPACITY ${beforeBrowser}/15000000 bytes before browser\n`);
const browser = resolve(homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');
const child = spawn(browser, [
  '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  '--disable-background-networking', '--disable-component-update', '--disable-default-apps',
  '--disable-extensions', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { env: { ...process.env, LD_LIBRARY_PATH: resolve(scratch, 'root/usr/lib/x86_64-linux-gnu') }, stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk; });
const delay = ms => new Promise(resolveDelay => setTimeout(resolveDelay, ms));
let socket;
let sequence = 0;
const pending = new Map();
const requests = [];
const errors = [];
const loadFailures = [];
const checks = [];
let sessionId;
let initialState;
function command(method, params = {}, session = sessionId) {
  const id = ++sequence;
  return new Promise((resolveCommand, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
    pending.set(id, { resolve: resolveCommand, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description?.split('\n')[0] ?? result.exceptionDetails.text);
  return result.result.value;
}
async function click(selector) {
  const point = await evaluate(`(() => {const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw Error('missing element');node.scrollIntoView({block:'nearest'});const r=node.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
}
async function key(selector, name, number) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code: name, windowsVirtualKeyCode: number, nativeVirtualKeyCode: number });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code: name, windowsVirtualKeyCode: number, nativeVirtualKeyCode: number });
}
async function select(selector, value) {
  await evaluate(`(() => {const node=document.querySelector(${JSON.stringify(selector)});node.value=${JSON.stringify(value)};node.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
async function screenshot(name) {
  const shot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const bytes = Buffer.from(shot.data, 'base64');
  const output = resolve(evidence, name);
  const oldBytes = await stat(output).then(item => item.size).catch(() => 0);
  const projectedBytes = await sizeTree(base) - oldBytes + bytes.length;
  assert.ok(projectedBytes <= 15_000_000, `PNG 會使產物超過 15 MB：${projectedBytes}`);
  await writeFile(output, bytes);
}
async function reveal(id) {
  const path = id.split('.');
  for (let depth = 1; depth < path.length; depth++) {
    const ancestor = path.slice(0, depth).join('.');
    const selector = `details[data-node-id="${ancestor}"]`;
    if (await evaluate(`document.querySelector(${JSON.stringify(selector)})?.open === false`)) await click(`${selector} > summary .branch-marker`);
  }
}
async function check(name, callback) {
  await callback();
  checks.push(name);
}
let status = 'FAILED';
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Chromium early exit ${child.exitCode}`);
    port = await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
    if (port) break;
    await delay(100);
  }
  if (!port) throw new Error('Chromium DevToolsActivePort 未建立');
  const [number, endpoint] = port.trim().split('\n');
  socket = new WebSocket(`ws://127.0.0.1:${number}${endpoint}`);
  await new Promise((resolveOpen, reject) => { socket.addEventListener('open', resolveOpen, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    } else if (message.method === 'Network.requestWillBeSent') {
      const url = message.params.request.url;
      requests.push(url.startsWith('data:') ? `data:embedded (${url.length} chars)` : url);
    } else if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      errors.push({ text: details.text, description: details.exception?.description?.split('\n')[0] });
    } else if (message.method === 'Network.loadingFailed') {
      loadFailures.push({ type: message.params.type, error: message.params.errorText, blocked: message.params.blockedReason, cors: message.params.corsErrorStatus });
    } else if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      errors.push({ text: message.params.entry.text.replace(/data:[^\s]+/g, 'data:embedded').slice(0, 1000) });
    }
  });
  const target = await command('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId } = await command('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null));
  await command('Runtime.enable');
  await command('Log.enable');
  await command('Network.enable');
  await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: pathToFileURL(resolve(base, 'index.html')).href });
  let snapshot;
  for (let attempt = 0; attempt < 100; attempt++) {
    snapshot = await evaluate('window.__canvasMech?.snapshot()');
    if (snapshot && !snapshot.status.startsWith('WAITING_FOR_FROZEN_CORE')) break;
    await delay(50);
  }
  assert.ok(snapshot, 'viewer API 未就緒');
  initialState = { status: snapshot.status, planHash: snapshot.planHash, pose: snapshot.pose, explode: snapshot.explode, depth: snapshot.depth, visibleCount: snapshot.visibleIds?.length };
  if (!framework) {
    assert.equal(snapshot.status, 'READY', '核心／美術尚未凍結整合；僅能明示 --framework 跑外框 smoke');
    // 首張完整機先存證，任何後續互動失敗都不會吞掉視覺審查入口。
    await delay(100);
    const idleName = snapshot.interfaceVersion ? `complete-${snapshot.interfaceVersion}-idle.png` : 'complete-first.png';
    await screenshot(idleName);
    process.stdout.write(`FIRST_FRAME ${resolve(evidence, idleName)}\n`);
    if (firstFrameOnly) {
      assert.deepEqual(errors, [], '首圖存在頁面錯誤');
      assert.deepEqual(requests.filter(url => !url.startsWith('file:') && !url.startsWith('data:')), [], '首圖存在外部請求');
      status = 'FIRST_FRAME_ONLY';
    } else {
    const initial = snapshot;
    const poseScreenshot = name => screenshot(`complete-${initial.interfaceVersion}-${name}.png`);
    const snap = () => evaluate('window.__canvasMech.snapshot()');
    await check('凍結核心數量及完整畫件 READY', async () => {
      assert.equal(initial.leafCount, 94);
      assert.equal(initial.nodeCount, 184);
      assert.equal(initial.visibleIds.length, 94);
      assert.equal(initial.maxDepth, 5);
      assert.equal(initial.connectionCount, 52);
      assert.equal(initial.coverageCount, 104);
    });
    const leaf = 'root.arm-near.shoulder.axis.hub';
    await check('實際展開深層樹並點選葉', async () => {
      await reveal(leaf);
      await click(`[data-action="select"][data-node-id="${leaf}"]`);
      assert.equal((await snap()).selectedId, leaf);
    });
    await check('實際點擊父層顯隱與 Solo', async () => {
      await click('[data-action="visible"][data-node-id="root.arm-near"]');
      const hidden = await snap();
      assert.ok(hidden.visibleIds.length > 0 && hidden.visibleIds.length < 94);
      assert.ok(hidden.visibleIds.every(id => !id.startsWith('root.arm-near.')));
      await click('[data-action="visible"][data-node-id="root.arm-near"]');
      await click('[data-action="solo"][data-node-id="root.arm-near"]');
      assert.ok((await snap()).visibleIds.every(id => id.startsWith('root.arm-near.')));
      await click('#clear-solo');
      assert.equal((await snap()).visibleIds.length, 94);
    });
    await check('184 真實節點逐一 DOM 顯隱、選取與 Solo', async () => {
      const result = await evaluate(`(() => {
        const failures=[];const api=window.__canvasMech;const all=api.snapshot().visibleIds;
        const buttons=[...document.querySelectorAll('[data-action="visible"]')];
        for(const button of buttons){
          const id=button.dataset.nodeId;const affected=all.filter(leaf=>leaf===id||leaf.startsWith(id+'.'));
          button.click();let state=api.snapshot();
          if(affected.some(leaf=>state.visibleIds.includes(leaf))||state.visibleIds.length!==all.length-affected.length)failures.push('hide:'+id);
          button.click();if(api.snapshot().visibleIds.length!==all.length)failures.push('show:'+id);
          document.querySelector('[data-action="select"][data-node-id="'+id+'"]').click();
          if(api.snapshot().selectedId!==id)failures.push('select:'+id);
          document.querySelector('[data-action="solo"][data-node-id="'+id+'"]').click();state=api.snapshot();
          if(state.visibleIds.length!==affected.length||state.visibleIds.some(leaf=>!affected.includes(leaf)))failures.push('solo:'+id);
          document.querySelector('#clear-solo').click();
        }
        return {count:buttons.length,failures};
      })()`);
      assert.equal(result.count, 184);
      assert.deepEqual(result.failures, []);
    });
    await click('#reset');
    await check('抬臂父動子隨、屈肘、屈膝', async () => {
      for (const id of ['root.arm-near.hand.grip.mechanism.shell', 'root.leg-far.foot.toes.middle', 'root.leg-near.foot.toes.middle']) assert.ok(Array.isArray(initial.matrices[id]), `測試必須引用實際葉：${id}`);
      await key('#arm', 'End', 35);
      let moved = await snap();
      assert.notDeepEqual(moved.matrices['root.arm-near.hand.grip.mechanism.shell'], initial.matrices['root.arm-near.hand.grip.mechanism.shell']);
      assert.deepEqual(moved.matrices['root.leg-far.foot.toes.middle'], initial.matrices['root.leg-far.foot.toes.middle']);
      const arm = moved;
      await key('#elbow', 'End', 35);
      moved = await snap();
      assert.notDeepEqual(moved.matrices['root.arm-near.hand.grip.mechanism.shell'], arm.matrices['root.arm-near.hand.grip.mechanism.shell']);
      await key('#knee', 'End', 35);
      assert.notDeepEqual((await snap()).matrices['root.leg-near.foot.toes.middle'], initial.matrices['root.leg-near.foot.toes.middle']);
    });
    await click('#reset');
    await check('舉盾瞄準及低姿支撐', async () => {
      await select('#pose', 'shield-aim');
      assert.notDeepEqual((await snap()).matrices, initial.matrices);
      await poseScreenshot('shield-aim');
      await select('#pose', 'low-brace');
      assert.equal((await snap()).pose, 'low-brace');
      await poseScreenshot('low-brace');
    });
    await click('#reset');
    await check('播放、暫停與精確還原', async () => {
      await click('#play');
      await delay(350);
      await click('#play');
      const paused = await snap();
      assert.notDeepEqual(paused.matrices, initial.matrices);
      await delay(150);
      assert.deepEqual((await snap()).matrices, paused.matrices);
      await click('#reset');
      assert.deepEqual((await snap()).matrices, initial.matrices);
    });
    await check('分解、逐層組裝與骨架接點', async () => {
      await key('#explode', 'End', 35);
      assert.equal((await snap()).explode, 1);
      assert.notDeepEqual((await snap()).matrices, initial.matrices);
      await click('#skeleton');
      assert.equal((await snap()).skeleton, true);
      await poseScreenshot('exploded-skeleton');
      await key('#depth', 'Home', 36);
      assert.equal((await snap()).visibleIds.length, 94);
      assert.deepEqual((await snap()).matrices, initial.matrices);
      await key('#depth', 'ArrowRight', 39);
      const firstDepth = await snap();
      assert.equal(firstDepth.depth, 1);
      assert.equal(firstDepth.visibleIds.length, 94);
      assert.notDeepEqual(firstDepth.matrices, initial.matrices);
      await key('#depth', 'ArrowRight', 39);
      assert.notDeepEqual((await snap()).matrices, firstDepth.matrices);
      assert.equal((await snap()).visibleIds.length, 94);
      await key('#depth', 'End', 35);
      assert.equal((await snap()).visibleIds.length, 94);
      await click('#reset');
      assert.deepEqual((await snap()).matrices, initial.matrices);
    });
    await check('反例拒絕未知節點、非法關節與角度', async () => {
      const result = await evaluate(`(() => {const api=window.__canvasMech;let rejected=0;for(const action of [()=>api.select('unknown'),()=>api.setVisible('unknown',false),()=>api.solo('unknown'),()=>api.pose({id:'bad',angles:{unknown:10}}),()=>api.pose({id:'bad',angles:{'root.arm-near.shoulder':999}}),()=>api.explode(2)]){try{action()}catch{rejected++}}return rejected})()`);
      assert.equal(result, 6);
      assert.deepEqual((await snap()).matrices, initial.matrices);
    });
    await check('縮放、DPI 與窄視窗', async () => {
      await key('#zoom', 'End', 35);
      assert.equal((await snap()).zoom, 1.8);
      await click('#fit');
      await select('#dpi', '2');
      const highDpi = await snap();
      assert.equal(highDpi.pixelRatio, 2);
      assert.equal(highDpi.canvasPixels.width, highDpi.width * 2);
      assert.equal(highDpi.canvasPixels.height, highDpi.height * 2);
      await command('Emulation.setDeviceMetricsOverride', { width: 720, height: 1050, deviceScaleFactor: 1, mobile: false });
      await delay(80);
      assert.ok((await snap()).width >= 700);
    });
    await check('完整展示無 JS 錯誤、無外部請求', async () => {
      assert.deepEqual(errors, []);
      assert.deepEqual(requests.filter(url => !url.startsWith('file:') && !url.startsWith('data:')), []);
    });
    status = 'PASS';
    process.stdout.write(`PASS: ${checks.length} checks\n`);
    }
  } else {
  await check('外框等待交付，姿態控制停用', async () => {
    assert.equal(snapshot.status, 'WAITING_FOR_FROZEN_CORE_AND_DRAWING');
    assert.equal(await evaluate('document.querySelector("#pose-controls").disabled'), true);
  });
  await check('真實點擊貼合視窗', async () => {
    await evaluate('document.querySelector("#zoom").value=150;document.querySelector("#zoom").dispatchEvent(new Event("input",{bubbles:true}))');
    assert.equal((await evaluate('window.__canvasMech.snapshot()')).zoom, 1.5);
    await click('#fit');
    assert.equal((await evaluate('window.__canvasMech.snapshot()')).zoom, 1);
  });
  await check('DPI 2× 與縮放', async () => {
    await evaluate('document.querySelector("#dpi").value="2";document.querySelector("#dpi").dispatchEvent(new Event("change",{bubbles:true}))');
    assert.equal((await evaluate('window.__canvasMech.snapshot()')).pixelRatio, 2);
  });
  await check('等待狀態無法被錯認為完整整合（反例）', async () => {
    assert.throws(() => assert.equal(snapshot.status, 'READY'), { code: 'ERR_ASSERTION' });
  });
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 2, mobile: false });
  await delay(120);
  await screenshot('framework-dpi2.png');
  await check('無頁面 JS 錯誤、無外部請求', async () => {
    assert.deepEqual(errors, []);
    assert.deepEqual(requests.filter(url => !url.startsWith('file:') && !url.startsWith('data:')), []);
  });
  status = 'FRAMEWORK_SMOKE_ONLY';
  process.stdout.write(`${status}: ${checks.length} checks; full integration NOT tested\n`);
  }
} catch (error) {
  errors.push({ message: error.message });
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
} finally {
  const resultName = firstFrameOnly ? 'headless-first-frame-result.json' : 'headless-result.json';
  await writeFile(resolve(evidence, resultName), JSON.stringify({ status, scope: firstFrameOnly ? 'FIRST_FRAME_ONLY' : 'CDP_FUNCTIONAL_ONLY', visualReview: 'MANUAL_REQUIRED', framework, initialState, checks, requests, loadFailures, errors }, null, 2) + '\n');
  await writeFile(resolve(scratch, `chromium-${run}.log`), stderr);
  if (socket?.readyState === WebSocket.OPEN) {
    await command('Browser.close', {}, null).catch(() => {});
    socket.close();
  }
  if (child.exitCode === null) child.kill('SIGTERM');
  for (const item of pending.values()) clearTimeout(item.timer);
}
