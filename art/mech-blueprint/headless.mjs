import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createEvidenceBudget } from './headless-budget.mjs';
// 僅由領導排程執行：nice -n 19 node art/mech-blueprint/headless.mjs
const partial = process.argv.includes('--partial');
const root = new URL('./', import.meta.url),
  evidence = new URL('evidence/', root),
  log = {
    mode: partial ? 'partial-ui-only' : 'full',
    completeAcceptance: false,
    started: new Date().toISOString(),
    url: new URL('index.html', root).href,
    checks: [],
    pageErrors: [],
    requests: [],
    screenshots: [],
  };
await mkdir(evidence, { recursive: true });
const evidenceBudget = await createEvidenceBudget(root, evidence);
const browser = await chromium.launch({ headless: true });
try {
  // 六張正式PNG加既存partial須留在本線5MB內；使用桌面佈局的精簡視口。
  const page = await browser.newPage({
    viewport: partial ? { width: 1536, height: 1100 } : { width: 1280, height: 960 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => log.pageErrors.push(e.message));
  page.on('request', (r) => log.requests.push({ url: r.url(), type: r.resourceType() }));
  const check = (name, detail) => log.checks.push({ name, passed: true, detail });
  await page.goto(log.url);
  await page.waitForFunction(() => window.__blueprintState);
  const snapshot = await page.evaluate(() => {
    const d = window.BLUEPRINT;
    return {
      mounted: Object.keys(d.fragments).length,
      expected: d.orders.orders.length,
      attachments: d.attachments.length,
      revision: d.layout.revision,
      sourceHash: d.layout.sourceHash,
      attachmentRevisions: [...new Set(d.attachments.map((a) => a.workOrderRevision))],
    };
  });
  if (!partial) {
    assert.equal(
      await page.evaluate(() => window.__blueprintState.mode),
      'assembled',
      'File entry must start as an assembled finished machine',
    );
    assert.equal(
      await page.locator('#stage > [data-attachment]').count(),
      64,
      'All attachments must be present on initial load',
    );
    assert.deepEqual(
      snapshot.attachmentRevisions,
      [snapshot.revision],
      'All attachments must use the built work-order revision',
    );
    assert(
      !/\bPARTIAL\b|施工|未完成|缺件/i.test(await page.locator('body').innerText()),
      'Finished entry must have no construction or partial markers',
    );
    check('initial complete assembled entry / no construction markers');
  } else await page.getByRole('button', { name: '組裝', exact: true }).click();
  const count = await page.locator('#stage > [data-attachment]').count();
  assert.equal(count, snapshot.mounted);
  assert(count > 0, 'Partial UI exercise needs at least one renderable attachment');
  if (!partial) {
    assert.equal(count, 64);
    assert.equal(
      await page.locator('#validation-status.error').count(),
      0,
      'Geometry errors must be resolved before final evidence',
    );
  } else if (count < snapshot.expected) {
    assert((await page.locator('#validation-status').textContent()).includes('未完成'));
    assert((await page.locator('#mode-label').textContent()).includes('PARTIAL'));
  }
  check('independent attachments mounted', snapshot);
  const depth = await page.evaluate(() =>
    Math.max(
      ...[
        ...document.querySelectorAll(
          '#stage polygon,#stage path,#stage circle,#stage ellipse,#stage rect',
        ),
      ]
        .filter((e) => !e.closest('defs'))
        .map((e) => {
          let n = 0;
          while (e) {
            n++;
            if (e.id === 'canvas') break;
            e = e.parentElement;
          }
          return n;
        }),
    ),
  );
  assert(depth <= 5);
  check('SVG visual depth', depth);
  const shot = async (name) => {
    await page.screenshot({ path: fileURLToPath(new URL(name, evidence)) });
    log.screenshots.push(name);
    log.budget = await evidenceBudget();
  };
  if (!partial) {
    await shot('bind.png');
    await page.locator('#skeleton').check();
    await shot('skeleton.png');
    await page.locator('#skeleton').uncheck();
  }
  await page.getByRole('button', { name: '配置', exact: true }).click();
  assert.equal(await page.locator('#stage > [data-attachment]').count(), 0);
  assert((await page.locator('#stage polygon').count()) > 0);
  check('configuration mode');
  await page.getByRole('button', { name: '分件', exact: true }).click();
  assert.equal(await page.locator('#stage > [data-attachment]').count(), count);
  if (!partial) await shot('exploded.png');
  check('independent parts mode');
  const gridFailures = await page.evaluate(() =>
    [...document.querySelectorAll('#stage > [data-attachment]')].flatMap((e) => {
      const d = window.BLUEPRINT,
        s = d.slots.slots.find((s) => s.attachment === e.dataset.attachment),
        i = d.order.base.indexOf(s.id),
        m = e.transform.baseVal.consolidate().matrix,
        b = e.getBBox(),
        left = m.a * b.x + m.e,
        top = m.d * b.y + m.f,
        right = left + m.a * b.width,
        bottom = top + m.d * b.height,
        x = (i % 8) * 220,
        y = Math.floor(i / 8) * 180;
      return m.b !== 0 ||
        m.c !== 0 ||
        Math.abs(m.a - m.d) > 1e-8 ||
        left < x + 10 ||
        right > x + 210 ||
        top < y + 10 ||
        bottom > y + 146
        ? [e.dataset.attachment]
        : [];
    }),
  );
  assert.deepEqual(gridFailures, []);
  check('exploded parts fit their cells without rotation');
  await page.getByRole('button', { name: '組裝', exact: true }).click();
  const ids = await page.evaluate(() => {
    const d = window.BLUEPRINT,
      a = d.attachments.find((a) => d.fragments[a.id]),
      leaf = d.layout.nodes.find((n) => n.id === a.layout),
      assembly = d.layout.nodes.find((n) => n.id === leaf.parent),
      major = d.layout.nodes.find((n) => n.id === assembly.parent);
    return { part: a.id, major: major.id, assembly: assembly.id, leaf: leaf.id };
  });
  for (const id of [ids.major, ids.assembly, ids.leaf]) {
    await page.locator(`[data-visibility="${id}"]`).uncheck();
    assert((await page.locator('#stage > [data-attachment]').count()) < count);
    await page.locator(`[data-visibility="${id}"]`).check();
  }
  check('major / assembly / leaf visibility');
  await page.locator(`[data-select="${ids.part}"]`).click();
  assert((await page.locator('#selection').textContent()).includes('origin'));
  await page.locator('#solo').click();
  assert.equal(await page.locator('#stage > [data-attachment]').count(), 1);
  await page.locator('#restore').click();
  assert.equal(await page.locator('#stage > [data-attachment]').count(), count);
  check('select / solo / restore');
  await page.getByRole('button', { name: '配置', exact: true }).click();
  const configurationCount = await page.locator('#stage polygon').count();
  await page.locator(`[data-visibility="${ids.major}"]`).uncheck();
  assert((await page.locator('#stage polygon').count()) < configurationCount);
  await page.locator(`[data-visibility="${ids.major}"]`).check();
  await page.locator('#solo').click();
  assert((await page.locator('#stage polygon').count()) < configurationCount);
  await page.locator('#restore').click();
  assert.equal(await page.locator('#stage polygon').count(), configurationCount);
  check('configuration respects ancestor visibility / solo / restore');
  await page.getByRole('button', { name: '組裝', exact: true }).click();
  await page.locator('#skeleton').check();
  assert((await page.locator('#stage line').count()) > 0);
  await page.locator('#skeleton').uncheck();
  check('skeleton overlay');
  await page.locator('#envelopes').check();
  await page.locator('#contacts').check();
  assert((await page.locator('#stage > circle').count()) > 0);
  await page.locator('#envelopes').uncheck();
  await page.locator('#contacts').uncheck();
  check('envelope / contacts overlay');
  for (const [pose, file] of [
    ['raise-left', 'raise-arm.png'],
    ['elbow-left', 'bend-elbow.png'],
    ['knee-left', 'bend-knee.png'],
    ['raise-right', null],
    ['elbow-right', null],
    ['knee-right', null],
  ]) {
    await page.selectOption('#pose', pose);
    assert.equal(
      await page.evaluate(() => window.__blueprintState.progress),
      1,
      'Reduced motion must show target directly',
    );
    await page.locator('#progress').fill('500');
    assert.equal(await page.evaluate(() => window.__blueprintState.progress), 0.5);
    await page.locator('#progress').fill('1000');
    if (file && !partial) await shot(file);
    check(`pose / scrub / reduced-motion: ${pose}`);
  }
  await page.locator('#bind').click();
  assert.equal(await page.evaluate(() => window.__blueprintState.progress), 0);
  check('return to bind');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.selectOption('#pose', 'raise-left');
  await page.locator('#play').click();
  await page.waitForTimeout(160);
  await page.locator('#play').click();
  const paused = await page.evaluate(() => window.__blueprintState.progress);
  assert(paused > 0 && paused < 1);
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => window.__blueprintState.progress), paused);
  check('animation play / pause', paused);
  assert.equal(log.pageErrors.length, 0);
  assert(
    log.requests.every((r) => r.url === log.url && r.type === 'document'),
    'Page must load without external resources or fetch',
  );
  check('file entry / no fetch / no pageerror');
  await page.locator('#bind').click();
  if (partial) await shot('partial.png');
  log.validation = await page.evaluate(() => {
    const d = window.BLUEPRINT,
      codes = {};
    for (const x of d.diagnostics) codes[x.code] = (codes[x.code] || 0) + 1;
    return {
      diagnostics: d.diagnostics.length,
      attachments: d.attachments.length,
      rendered: Object.keys(d.fragments).length,
      expected: d.orders.orders.length,
      codes,
    };
  });
  log.completeAcceptance = !partial;
  log.passed = true;
} catch (e) {
  log.passed = false;
  log.failure = String(e);
  process.exitCode = 1;
} finally {
  log.finished = new Date().toISOString();
  await writeFile(new URL('interaction.json', evidence), JSON.stringify(log, null, 2) + '\n');
  await browser.close();
}
console.log(
  JSON.stringify({ passed: log.passed, checks: log.checks.length, failure: log.failure }),
);
