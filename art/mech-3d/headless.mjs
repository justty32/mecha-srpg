import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { launchBrowser, delay } from './viewer/browser.mjs';
import { connectCDP } from './viewer/cdp-client.mjs';
import { createScreenshotWriter, measureArtifacts } from './viewer/screenshots.mjs';
import { testInteractions } from './viewer/interactions.mjs';

const base = fileURLToPath(new URL('./', import.meta.url));
const repo = resolve(base, '../..');
const framework = process.argv.includes('--framework');
const firstOnly = process.argv.includes('--first-frame');
const evidence = resolve(base, 'viewer/evidence');
await mkdir(evidence, { recursive: true });
const errors = [];
const requests = [];
const failures = [];
const checks = [];
let browser;
let cdp;
let status = 'FAILED';
let snapshot;
let pixels;
let opticsVisibility;
const before = await measureArtifacts(base);
assert.ok(before.bytes <= 25_000_000 && before.pngCount <= 6, '產物／PNG數量已超gate');
process.stdout.write(`CAPACITY ${before.bytes}/25000000 bytes, ${before.pngCount}/6 PNG\n`);
try {
  browser = await launchBrowser(repo);
  cdp = await connectCDP(browser.endpoint, event => {
    if (event.method === 'Runtime.exceptionThrown') {
      const detail = event.params.exceptionDetails;
      errors.push(detail.exception?.description?.split('\n')[0] ?? detail.text);
    } else if (event.method === 'Log.entryAdded' && event.params.entry.level === 'error') errors.push(event.params.entry.text.slice(0, 1200));
    else if (event.method === 'Network.loadingFailed') failures.push({ type: event.params.type, error: event.params.errorText, blocked: event.params.blockedReason });
    else if (event.method === 'Network.requestWillBeSent') {
      const url = event.params.request.url;
      requests.push(url.startsWith('data:') ? 'data:embedded' : url);
    }
  });
  await cdp.attach();
  for (const domain of ['Runtime', 'Log', 'Network', 'Page']) await cdp.call(`${domain}.enable`);
  await cdp.call('Emulation.setDeviceMetricsOverride', { width: 1360, height: 960, deviceScaleFactor: 1, mobile: false });
  await cdp.call('Page.navigate', { url: pathToFileURL(resolve(base, 'index.html')).href });
  for (let index = 0; index < 250; index++) {
    snapshot = await cdp.evaluate('window.__mech3d?.snapshot()');
    if (snapshot?.frameCount >= 1 || snapshot?.status === 'ERROR') break;
    await delay(100);
  }
  assert.ok(snapshot, '展示 API 未載入');
  assert.equal(snapshot.webgl2, true, '未取得真 WebGL2 context');
  assert.match(snapshot.renderer, /SwiftShader/i, '未實際使用 SwiftShader，不冒稱此驗證環境');
  assert.ok(snapshot.renderCalls > 0 && snapshot.triangles > 0, '沒有實際 render draw calls／三角形');
  checks.push('WebGL2 / SwiftShader / 實際 render calls 與三角形');
  pixels = await cdp.evaluate('window.__mech3d.pixels()');
  assert.ok(pixels.samples >= 40 && pixels.unique > 5, 'framebuffer 像素未呈現場景變化');
  pixels = { samples: pixels.samples, unique: pixels.unique, rgbaBase64: Buffer.from(pixels.rgba.flat()).toString('base64') };
  checks.push('實讀 framebuffer 像素');
  if (framework) {
    assert.equal(snapshot.status, 'WAITING_FOR_FROZEN_MODEL');
    await cdp.click('[data-camera="side"]');
    await delay(100);
    const side = await cdp.evaluate('window.__mech3d.snapshot()');
    assert.notDeepEqual(side.camera, snapshot.camera);
    assert.equal(side.preset, 'side');
    checks.push('空場景真實 CDP 相機預設點擊');
    status = 'FRAMEWORK_WEBGL_SMOKE_ONLY';
  } else {
    assert.equal(snapshot.status, 'READY', '尚未有正式凍結模型');
    const screenshot = createScreenshotWriter(cdp, base);
    const hero = await screenshot('hero');
    process.stdout.write(`FIRST_MODEL ${hero.path}\n`);
    await cdp.evaluate('window.__mech3d.camera("front")');
    opticsVisibility = await cdp.evaluate('window.__mech3d.opticsVisibility()');
    const visor = opticsVisibility.find(item => item.nodeId.endsWith('.visor'));
    assert.equal(visor?.centerVisible, true, `正面光窗仍被遮擋：${JSON.stringify(opticsVisibility)}`);
    checks.push('正式正面光窗raycast可見');
    await cdp.evaluate('window.__mech3d.camera("iso")');
    if (firstOnly) status = 'FIRST_MODEL_FRAME_ONLY';
    else {
      const expected = JSON.parse(await readFile(resolve(evidence, '../build-evidence.json'), 'utf8')).summary;
      await testInteractions(cdp, snapshot, expected, screenshot, name => checks.push(name));
      status = 'PASS';
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  assert.deepEqual(requests.filter(url => !url.startsWith('file:') && !url.startsWith('data:')), []);
  checks.push('無頁面錯誤與外部網路');
  process.stdout.write(`${status}: ${checks.length} checks; ${snapshot.renderer}\n`);
} catch (error) {
  errors.push(error.message);
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
} finally {
  await browser?.close(cdp);
  const filename = framework ? 'framework-webgl.json' : firstOnly ? 'first-model-result.json' : 'headless-result.json';
  const summary = snapshot ? { ...snapshot, matrices: undefined, visibleIds: undefined, visibleCount: snapshot.visibleIds?.length } : undefined;
  await writeFile(resolve(evidence, filename), JSON.stringify({ status, framework, scope: framework ? 'ENVIRONMENT_ONLY' : firstOnly ? 'FIRST_MODEL_FRAME_ONLY' : 'MODEL_INTERACTION', checks, snapshot: summary, pixels, opticsVisibility, requests, failures, errors }, null, 2) + '\n');
}
