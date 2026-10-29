import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

test("大地圖：開局 → 世界分頁 → 游標到地點 → Enter → 抵達 → 泊", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/?seed=3&anim=off#/ops");
  const root = page.locator('[data-page="ops"] [data-ui="ops"]');
  await expect(root).toBeVisible();
  await root.locator('[data-action-id="tab:world"]').click();
  await expect(root.locator('[data-ui="world-map"] .world-cell').first()).toBeVisible();
  // 從達卡按 Shift+Tab 跳到上一個地點（順序隨地點內容變動，只要求是別的地點），鍵盤與點格走相同游標。
  await page.keyboard.press("Shift+Tab");
  const target = await root.locator(".world-cell.cursor").getAttribute("data-node");
  expect(target).toMatch(/place\//);
  expect(target).not.toBe("base:place/dhaka");
  await page.keyboard.press("Enter");
  type Snap = { header: { route: unknown; docked: boolean; location: string }; prompt: { choices: { n: number; enabled: boolean }[] } | null };
  const snap = () => page.evaluate(() => (window as unknown as { __ops: { snapshot(): Snap } }).__ops.snapshot());
  expect((await snap()).header.route).not.toBeNull();
  // 途中可能遇到行動者（遭遇四選按第一個可選＝迴避會停船），停下來就對同一游標格重下 Enter。
  const dock = root.locator('[data-action-id="map:dock"]');
  for (let i = 0; i < 60; i++) {
    const s = await snap();
    if (s.prompt) await page.keyboard.press(String(s.prompt.choices.find(c => c.enabled)!.n));
    else if (s.header.route) await page.keyboard.press("w");
    else if (await dock.isEnabled()) break;
    else await page.keyboard.press("Enter");
  }
  expect((await snap()).header.route).toBeNull();
  await expect(root.locator('[data-action-id="map:dock"]')).toBeEnabled();
  await page.keyboard.press("d");
  expect((await snap()).header.docked).toBe(true);
  expect(errors).toEqual([]);
});

test("世界區域：普通格無文字，固定標籤在縮放平移與視窗改變後仍對齊", async ({ page }) => {
  const measurements: { width: number; zoom: number; pan: number; labels: number; error: number }[] = [];
  let containCases = 0;
  await page.goto("/?seed=3&anim=off#/ops");
  await page.locator('[data-action-id="tab:world"]').click();
  const anchor = await page.evaluate(() => (window as unknown as { __ops: { snapshot(): { world: { grid: { regionLabels: { id: string; at: { x: number; y: number } }[] } } } } }).__ops.snapshot().world.grid.regionLabels[0]!);
  expect(anchor).toBeTruthy();
  for (const size of [{ width: 1280, height: 800 }, { width: 1024, height: 768 }, { width: 480, height: 800 }]) {
    await page.setViewportSize(size);
    for (const zoom of [1, .5, .25]) {
      await page.evaluate(({ at, zoom }) => {
        const ops = (window as unknown as { __ops: { dispatch(action: unknown): unknown } }).__ops;
        ops.dispatch({ type: "mapZoom", dir: 0 });
        if (zoom < 1) ops.dispatch({ type: "mapZoom", dir: -1 });
        if (zoom < .5) ops.dispatch({ type: "mapZoom", dir: -1 });
        ops.dispatch({ type: "mapViewport", ...at });
      }, { at: anchor.at, zoom });
      for (const pan of [0, 1]) {
        if (pan) await page.evaluate(() => {
          const ops = (window as unknown as { __ops: { snapshot(): { world: { grid: { viewport: { w: number; h: number } } } }; dispatch(action: unknown): unknown } }).__ops;
          const viewport = ops.snapshot().world.grid.viewport;
          // 一格寬的窄窗只能沿縱向平移，不能要求已離畫面的錨點仍顯示。
          ops.dispatch({ type: "mapScroll", dx: viewport.w > 1 ? 1 : 0, dy: viewport.h > 1 ? 1 : 0 });
        });
        const result = await page.evaluate(id => {
          const label = document.querySelector<HTMLElement>(`[data-region-label="${id}"]`)!;
          if (!label) throw new Error(`錨點離開畫面：${JSON.stringify({ size: [innerWidth, innerHeight], viewport: document.querySelector<HTMLElement>('[data-ui="world-map"]')?.dataset, id })}`);
          const cell = document.querySelector<HTMLElement>(`.world-cell[data-x="${label.dataset.x}"][data-y="${label.dataset.y}"]`);
          const labels = [...document.querySelectorAll<HTMLElement>("[data-region-label]")];
          const rect = label.getBoundingClientRect(), center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          const cellRect = cell?.getBoundingClientRect();
          const overview = document.querySelector<HTMLCanvasElement>(".world-overview")!;
          const overviewRect = overview.getBoundingClientRect(), large = !overview.hidden;
          // 依canvas真實bitmap比例與CSS contain觀察內容邊界，不能把整個元素盒當成圖面。
          const bitmapRatio = overview.width / overview.height;
          const contentWidth = Math.min(overviewRect.width, overviewRect.height * bitmapRatio);
          const contentHeight = contentWidth / bitmapRatio;
          const expected = large ? {
            x: overviewRect.x + (overviewRect.width - contentWidth) / 2 + (Number(label.dataset.x) + .5) / overview.width * contentWidth,
            y: overviewRect.y + (overviewRect.height - contentHeight) / 2 + (Number(label.dataset.y) + .5) / overview.height * contentHeight,
          } : { x: cellRect ? cellRect.x + cellRect.width / 2 : NaN, y: cellRect ? cellRect.y + cellRect.height / 2 : NaN };
          return { ids: labels.map(node => node.dataset.regionLabel), x: label.dataset.x, y: label.dataset.y,
            mapWidth: document.querySelector(".world-scroll")!.getBoundingClientRect().width,
            ordinaryText: [...document.querySelectorAll(".world-cell:not(.has-place):not(.has-actor):not(.ship)")].filter(node => !!node.textContent).length,
            oldText: document.querySelectorAll(".world-glyph, .world-age, .world-region").length,
            dx: center.x - expected.x, dy: center.y - expected.y };
        }, anchor.id);
        expect(new Set(result.ids).size).toBe(result.ids.length);
        expect(result.ids.length).toBeGreaterThan(0);
        if (size.width <= 760) expect(result.mapWidth).toBeGreaterThan(size.width * .6);
        expect(result.ordinaryText).toBe(0); expect(result.oldText).toBe(0);
        expect(result.x).toBe(String(anchor.at.x)); expect(result.y).toBe(String(anchor.at.y));
        expect(Math.abs(result.dx)).toBeLessThan(1); expect(Math.abs(result.dy)).toBeLessThan(1);
        measurements.push({ width: size.width, zoom, pan, labels: result.ids.length, error: Math.max(Math.abs(result.dx), Math.abs(result.dy)) });
      }
      if (zoom === .25) {
        const overview = page.locator('[data-ui="world-overview"]');
        await overview.scrollIntoViewIfNeeded();
        const target = await overview.evaluate(canvas => {
          const image = canvas as HTMLCanvasElement, box = image.getBoundingClientRect();
          const ratio = image.width / image.height, width = Math.min(box.width, box.height * ratio), height = width / ratio;
          const left = box.x + (box.width - width) / 2, top = box.y + (box.height - height) / 2;
          // 點擊可實際送入的整數CSS像素；縮圖的一格可能小於一像素，不能假定任意格心可點到。
          const x = Math.round(left + width * .25), y = Math.round(top + height * .5);
          const cellX = Math.floor((x - left) * image.width / width), cellY = Math.floor((y - top) * image.height / height);
          const gapX = (box.width - width) / 2, gapY = (box.height - height) / 2;
          return { x, y, cellX, cellY,
            gapX: (box.width - width) / 2, gapY: (box.height - height) / 2,
            blankX: gapX > 2 ? box.x + gapX / 2 : left + width / 2,
            blankY: gapX > 2 ? top + height / 2 : box.y + gapY / 2 };
        });
        if (Math.max(target.gapX, target.gapY) > 2) {
          containCases++;
          await page.mouse.click(target.blankX, target.blankY);
          await expect(page.locator('[data-ui="world-map"]')).toHaveAttribute("data-zoom", "0.25");
        }
        await overview.evaluate(canvas => {
          const audit: { x?: number; y?: number } = {};
          (window as unknown as { __mapClickAudit: typeof audit }).__mapClickAudit = audit;
          canvas.addEventListener("click", event => {
            const mouse = event as MouseEvent;
            audit.x = mouse.clientX; audit.y = mouse.clientY;
          }, { once: true });
        });
        await page.mouse.click(target.x, target.y);
        const audit = await page.evaluate(() => (window as unknown as { __mapClickAudit: { x: number; y: number } }).__mapClickAudit);
        expect(audit.x).toBe(target.x); expect(audit.y).toBe(target.y);
        // canvas監聽器先於祖先shell的click導航；等真格圖呈現後再觀察導航結果。
        await expect(page.locator('[data-ui="world-map"]')).toHaveAttribute("data-zoom", "0.5");
        await expect(page.locator(`.world-cell[data-x="${target.cellX}"][data-y="${target.cellY}"]`)).toBeVisible();
        const destination = await page.evaluate(() => (window as unknown as { __ops: { snapshot(): { world: { grid: { zoom: number; viewport: { x: number; y: number; w: number; h: number } } } } } }).__ops.snapshot().world.grid);
        expect(destination.zoom).toBe(.5);
        // 精確投影與留白拒絕由固定DOM反例驗證；完整頁驗真投影格在resize後仍合法可見。
        expect(target.cellX).toBeGreaterThanOrEqual(destination.viewport.x);
        expect(target.cellX).toBeLessThan(destination.viewport.x + destination.viewport.w);
        expect(target.cellY).toBeGreaterThanOrEqual(destination.viewport.y);
        expect(target.cellY).toBeLessThan(destination.viewport.y + destination.viewport.h);
        console.info("ops-overview-click", JSON.stringify({ width: size.width, target, audit, finalViewport: destination.viewport }));
      }
    }
  }
  expect(containCases).toBeGreaterThan(0);
  console.info("ops-region-rects", JSON.stringify({ cases: measurements.length, containCases, maxError: Math.max(...measurements.map(row => row.error)), ordinaryText: 0, measurements }));
});

for (const input of ['mouse', 'touch'] as const) test(`世界安全拖曳：${input}、連拖無航行、取消與縮放後點格`, async ({ browser }) => {
  const context = await browser.newContext({ viewport: input === 'mouse' ? { width: 1280, height: 800 } : { width: 390, height: 844 }, hasTouch: input === 'touch', isMobile: input === 'touch' });
  const page = await context.newPage();
  try {
    await page.goto('/?seed=3&anim=off#/ops'); await page.locator('[data-action-id="tab:world"]').click();
    const state = () => page.evaluate(() => {
      const s = (window as unknown as { __ops: { snapshot(): { header: { route: unknown }; world: { grid: { viewport: { x: number; y: number }; cursor: { x: number; y: number }; zoom: number } } } } }).__ops.snapshot();
      return { ...s.world.grid, route: s.header.route };
    });
    await page.locator('.world-scroll').scrollIntoViewIfNeeded();
    const cdp = await context.newCDPSession(page);
    await page.evaluate(() => {
      const events: { type: string; x: number; y: number; trusted: boolean; pointerType: string }[] = [];
      (window as unknown as { __worldPanPointers: typeof events }).__worldPanPointers = events;
      for (const type of ['pointerdown', 'pointermove']) document.addEventListener(type, event => {
        const p = event as PointerEvent; events.push({ type, x: p.clientX, y: p.clientY, trusted: p.isTrusted, pointerType: p.pointerType });
      }, { capture: true, passive: true });
    });

    const drag = async (dx: number, cancel = false, reverse = false) => {
      const surface = page.locator('.world-scroll'); await surface.scrollIntoViewIfNeeded();
      const box = (await surface.boundingBox())!, cell = 24 * (await state()).zoom;
      const x = box.x + box.width * .55, y = box.y + Math.min(box.height * .55, 140), distance = reverse ? cell * 1.2 : 0;
      if (input === 'mouse') {
        await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y, { steps: 5 });
        if (reverse) await page.mouse.move(x + dx - distance, y);
        if (cancel) await page.evaluate(() => { const node = document.querySelector<HTMLElement>('.world-scroll')!; if (node.hasPointerCapture(1)) node.releasePointerCapture(1); });
        await page.mouse.up(); return Math.trunc(-(dx - distance) / cell);
      }
      const offset = await page.evaluate(() => (window as unknown as { __worldPanPointers: unknown[] }).__worldPanPointers.length);
      if (cancel || reverse) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y }] });
        if (reverse) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx - distance, y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
      } else await cdp.send('Input.synthesizeScrollGesture', { x, y, xDistance: dx, yDistance: 0, gestureSourceType: 'touch', preventFling: true });
      const events = await page.evaluate(offset => (window as unknown as { __worldPanPointers: { type: string; x: number; y: number; trusted: boolean; pointerType: string }[] }).__worldPanPointers.slice(offset), offset);
      const down = events.find(e => e.type === 'pointerdown')!, moves = events.filter(e => e.type === 'pointermove');
      expect(down?.trusted).toBe(true); expect(down?.pointerType).toBe('touch'); expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(e => e.trusted && e.pointerType === 'touch')).toBe(true);
      return Math.trunc(-(moves.at(-1)!.x - down.x) / cell);
    };
    const before = await state(); await drag(-72);
    expect((await state()).viewport.x).toBeGreaterThan(before.viewport.x);
    await drag(-60); const after = await state(); expect(after.cursor).toEqual(before.cursor); expect(after.route).toEqual(before.route);
    await drag(40, true); expect((await state()).route).toEqual(before.route);
    await page.evaluate(() => (window as unknown as { __ops: { dispatch(a: unknown): void } }).__ops.dispatch({ type: 'mapScroll', dx: -9999, dy: 0 }));
    await drag(60); expect((await state()).viewport.x).toBe(0); await drag(60, false, true); expect((await state()).viewport.x).toBeGreaterThan(0); await drag(-60); expect((await state()).viewport.x).toBeGreaterThan(0);
    const zoomButton = page.locator('[data-ui="world-zoom-out"]'); await zoomButton.scrollIntoViewIfNeeded();
    if (input === 'mouse') await zoomButton.click(); else {
      const box = (await zoomButton.boundingBox())!;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const zoomed = await state(), cells = await drag(-30);
    expect(cells).toBeGreaterThan(0); expect((await state()).viewport.x).toBe(zoomed.viewport.x + cells);
    const surface = page.locator('.world-scroll'); await surface.scrollIntoViewIfNeeded();
    const hit = await surface.evaluate(surface => {
      for (const cell of surface.querySelectorAll<HTMLElement>('.world-cell')) {
        const box = cell.getBoundingClientRect(), x = box.x + box.width / 2, y = box.y + box.height / 2;
        if (x > 0 && x < innerWidth && y > 0 && y < innerHeight && cell.contains(document.elementFromPoint(x, y))) return { x, y, at: { x: Number(cell.dataset.x), y: Number(cell.dataset.y) } };
      }
      return null;
    });
    expect(hit).not.toBeNull();
    await page.evaluate(() => {
      const clicks: { trusted: boolean; x: number | null; y: number | null }[] = [];
      (window as unknown as { __worldPanClicks: typeof clicks }).__worldPanClicks = clicks;
      document.addEventListener('click', event => {
        const cell = (event.target as Element | null)?.closest<HTMLElement>('.world-cell');
        clicks.push({ trusted: event.isTrusted, x: cell ? Number(cell.dataset.x) : null, y: cell ? Number(cell.dataset.y) : null });
      }, { capture: true, passive: true });
    });
    if (input === 'mouse') await page.mouse.click(hit!.x, hit!.y);
    else {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hit!.x, y: hit!.y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await expect.poll(() => page.evaluate(() => (window as unknown as { __worldPanClicks: unknown[] }).__worldPanClicks)).toEqual([{ trusted: true, ...hit!.at }]);
    expect((await state()).cursor).toEqual(hit!.at); expect((await state()).route).toEqual(before.route);
  } finally { await context.close(); }
});

test('手機世界四尺寸：無整頁橫溢、導航縮放可達且地圖有高度', async ({ page }) => {
  await page.goto('/?seed=3&anim=off#/ops'); await page.locator('[data-action-id="tab:world"]').click();
  const sizes = [{ width: 360, height: 844 }, { width: 390, height: 844 }, { width: 430, height: 844 }, { width: 844, height: 390 }];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    const viewport = page.locator('.world-scroll'); await viewport.scrollIntoViewIfNeeded();
    await expect(viewport).toBeInViewport(); expect((await viewport.boundingBox())!.height).toBeGreaterThanOrEqual(200);
    await expect(page.locator('.world-cell').first()).toBeVisible();
    for (const selector of ['[data-action-id="tab:world"]', '[data-ui="world-zoom-in"]', '[data-ui="world-zoom-out"]', '[data-ui="world-zoom-fit"]', '[data-ui="world-mini-toggle"]']) {
      const button = page.locator(selector); await button.scrollIntoViewIfNeeded();
      await expect(button).toBeVisible(); await expect(button).toBeInViewport();
      const box = (await button.boundingBox())!; expect(box.height, `${size.width}/${selector}`).toBeGreaterThanOrEqual(43.9);
      expect(box.x).toBeGreaterThanOrEqual(-1); expect(box.x + box.width).toBeLessThanOrEqual(size.width + 1);
      await button.click({ trial: true });
    }
    const header = page.locator('[data-ui="ops-header"]'); await header.scrollIntoViewIfNeeded(); await expect(header).toBeInViewport();
    await expect(header).not.toBeEmpty();
    if (process.env.MOBILE_SHOTS && (size.width === 390 || size.width === 844)) {
      await mkdir(process.env.MOBILE_SHOTS, { recursive: true });
      await page.screenshot({ path: join(process.env.MOBILE_SHOTS, `world-${size.width}x${size.height}.png`), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('[data-ui="ops-header"]').scrollIntoViewIfNeeded();
  const facts = await page.locator('.ops-fact b').evaluateAll(nodes => nodes.map(node => {
    const value = node as HTMLElement, range = document.createRange(); range.selectNodeContents(value);
    const text = range.getBoundingClientRect();
    const clipped: string[] = [];
    for (let parent = value.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
      const left = box.left + parent.clientLeft, top = box.top + parent.clientTop;
      if (/(hidden|clip|auto|scroll)/.test(style.overflowX) && (text.left < left - 1 || text.right > left + parent.clientWidth + 1)) clipped.push(`${parent.className}:x`);
      if (/(hidden|clip|auto|scroll)/.test(style.overflowY) && (text.top < top - 1 || text.bottom > top + parent.clientHeight + 1)) clipped.push(`${parent.className}:y`);
    }
    return { text: value.textContent, width: value.clientWidth, scrollWidth: value.scrollWidth, height: value.clientHeight, scrollHeight: value.scrollHeight, clipped };
  }));
  expect(facts.length).toBeGreaterThan(0);
  for (const fact of facts) {
    expect(fact.text?.trim()).toBeTruthy(); expect(fact.width).toBeGreaterThan(0); expect(fact.height).toBeGreaterThan(0);
    expect(fact.scrollWidth, fact.text ?? '').toBeLessThanOrEqual(fact.width);
    expect(fact.scrollHeight, fact.text ?? '').toBeLessThanOrEqual(fact.height + 1);
    expect(fact.clipped, fact.text ?? '').toEqual([]);
  }
  console.info('world-desktop-facts-rects', JSON.stringify(facts));
  if (process.env.MOBILE_SHOTS) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: join(process.env.MOBILE_SHOTS, 'world-1280x800.png'), fullPage: true });
  }
});
