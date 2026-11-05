import { test, expect } from "@playwright/test";

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
