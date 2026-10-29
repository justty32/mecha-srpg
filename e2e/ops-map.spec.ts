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
