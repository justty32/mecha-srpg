// 端對端（Playwright headless Chromium）：只三條——載入、結束回合（按鈕＋快捷鍵）、大地圖捲動。
import { test, expect, type Page } from "@playwright/test";

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

async function viewportPos(page: Page): Promise<{ x: number; y: number }> {
  const text = (await page.locator('[data-ui="viewport-pos"]').textContent()) ?? "";
  const m = /(\d+)\s*,\s*(\d+)/.exec(text);
  if (!m) throw new Error(`viewport-pos 讀不到座標：${text}`);
  return { x: Number(m[1]), y: Number(m[2]) };
}

test("載入：戰場方格、回合、指令按鈕與快捷鍵標示都在", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  expect(await board.locator("[data-x][data-y]").count()).toBeGreaterThan(50);
  await expect(page.locator('[data-ui="round"]')).toContainText("1");
  const end = page.locator('[data-ui="commands"] button[data-cmd="end"]');
  await expect(end).toBeVisible();
  await expect(end.locator("kbd")).toHaveText(/E/i);
  // 點格顯示資訊
  await board.locator('[data-x="0"][data-y="0"]').click().catch(async () => { await board.locator("[data-x][data-y]").first().click(); });
  await expect(page.locator('[data-ui="inspect"]')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test("結束回合：按鈕與快捷鍵 E 都會推進戰局並寫入戰鬥記錄", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  const log = page.locator('[data-ui="log"] li');
  const active = () => page.evaluate(() => (window as unknown as { __battle: { snapshot(): { activeUnit: string | null; round: number } } }).__battle.snapshot());
  const before = await active();
  const n0 = await log.count();
  await page.locator('button[data-cmd="end"]').click();
  await expect.poll(async () => await log.count()).toBeGreaterThan(n0);
  const mid = await active();
  expect(mid.activeUnit !== before.activeUnit || mid.round > before.round).toBe(true);
  const n1 = await log.count();
  await page.locator("body").press("e");
  await expect.poll(async () => await log.count()).toBeGreaterThan(n1);
  const after = await active();
  expect(after.activeUnit !== mid.activeUnit || after.round > mid.round).toBe(true);
  expect(errors).toEqual([]);
});

test("大地圖 160×160：快捷鍵與滾輪捲動可視區，只渲染可視區的格", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?scenario=debug-big&size=160");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  const cells = await board.locator("[data-x][data-y]").count();
  expect(cells).toBeGreaterThan(50);
  expect(cells).toBeLessThan(160 * 160 / 4);
  await page.locator('[data-ui="scroll-left"]').click();   // 先離開右邊界，確保有空間往右捲
  const p0 = await viewportPos(page);
  await page.locator("body").press("Shift+ArrowRight");
  await expect.poll(async () => (await viewportPos(page)).x).toBeGreaterThan(p0.x);
  const p1 = await viewportPos(page);
  await board.hover();
  await page.mouse.wheel(0, 300);
  await expect.poll(async () => (await viewportPos(page)).y).not.toBe(p1.y);
  const p2 = await viewportPos(page);
  await expect(board.locator(`[data-x="${p2.x}"][data-y="${p2.y}"]`)).toHaveCount(1);
  expect(errors).toEqual([]);
});
