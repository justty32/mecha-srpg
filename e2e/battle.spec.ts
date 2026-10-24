// 端對端（Playwright headless Chromium）：載入、結束回合（按鈕＋快捷鍵＋確認）、大地圖捲動，
// 以及 lead-ui-fix 的試玩回饋：行動後浮出選單、縮放（記住設定）、跳過動畫、小地圖自動貼合。
import { test, expect, type Page } from "@playwright/test";

type Snap = {
  activeUnit: string | null; round: number; playerTurn: boolean; busy: unknown; confirm: { text: string } | null;
  quickMenu: { options: { id: string }[] } | null; selected: { id: string } | null; map: { width: number; height: number };
};

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

const snap = (page: Page) => page.evaluate(() => (window as unknown as { __battle: { snapshot(): Snap } }).__battle.snapshot());
const settle = (page: Page) => page.evaluate(() => { (window as unknown as { __battle: { settle(): void } }).__battle.settle(); });
const cellWidth = async (page: Page) => (await page.locator('[data-ui="board"] [data-x][data-y]').first().boundingBox())!.width;

async function viewportPos(page: Page): Promise<{ x: number; y: number }> {
  const text = (await page.locator('[data-ui="viewport-pos"]').textContent()) ?? "";
  const m = /(\d+)\s*,\s*(\d+)/.exec(text);
  if (!m) throw new Error(`viewport-pos 讀不到座標：${text}`);
  return { x: Number(m[1]), y: Number(m[2]) };
}

test("載入：戰場方格、回合、固定指令面板與快捷鍵標示都在", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  expect(await board.locator("[data-x][data-y]").count()).toBeGreaterThan(50);
  await expect(page.locator('[data-ui="round"]')).toContainText("1");
  for (const id of ["move", "standby", "defer", "end", "eject", "retreat", "skip"]) {
    await expect(page.locator(`[data-ui="commands"] button[data-cmd="${id}"]`)).toBeVisible();
  }
  await expect(page.locator('[data-ui="commands"] button[data-cmd="end"] kbd')).toHaveText(/E/i);
  await board.locator("[data-x][data-y]").first().click();
  await expect(page.locator('[data-ui="inspect"]')).not.toBeEmpty();
  await expect(page.locator('[data-ui="log"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("行動後浮出下一步選單：點可達格移動後仍選取同一台，選單含待機", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  await settle(page);
  const before = await snap(page);
  expect(before.playerTurn).toBe(true);
  const reach = page.locator('[data-ui="board"] .highlight-reach');
  expect(await reach.count()).toBeGreaterThan(0);
  // [lead-wiki] 殼導航列讓戰場矮 40px，格子位置會變；挑一個中心點沒被回合開始的浮出選單蓋住的可達格。
  const open = await reach.evaluateAll(cells => cells.map((cell, i) => {
    const r = cell.getBoundingClientRect();
    return cell.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) ? i : -1;
  }).filter(i => i >= 0));
  expect(open.length).toBeGreaterThan(0);
  await reach.nth(open[Math.floor(open.length / 2)]!).click();
  await expect(page.locator('[data-ui="quick-menu"]')).toBeVisible();
  await expect(page.locator('[data-ui="quick-menu"] button[data-cmd="standby"]')).toBeVisible();
  const after = await snap(page);
  expect(after.activeUnit).toBe(before.activeUnit);
  expect(after.selected?.id).toBe(before.activeUnit);
  // 選單上按待機 → 換下一台（AI 演出跳過後輪回我方）
  await page.locator('[data-ui="quick-menu"] button[data-cmd="standby"]').click();
  await settle(page);
  const next = await snap(page);
  expect(next.activeUnit !== before.activeUnit || next.round > before.round).toBe(true);
  expect(errors).toEqual([]);
});

test("結束回合：還有未行動機體時第一次 E 出確認，再按 E 才推進；按鈕同樣可用", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  await settle(page);
  const log = page.locator('[data-ui="log"] li');
  const before = await snap(page);
  const n0 = await log.count();
  await page.locator("body").press("e");
  await expect(page.locator('[data-ui="confirm"]')).toBeVisible();
  await expect(page.locator('[data-ui="confirm"]')).toContainText(/還有 \d+ 台未行動/);
  expect((await snap(page)).activeUnit).toBe(before.activeUnit);
  await page.locator("body").press("e");
  await settle(page);
  await expect(page.locator('[data-ui="confirm"]')).toBeHidden();
  await expect.poll(async () => await log.count()).toBeGreaterThan(n0);
  const mid = await snap(page);
  expect(mid.round > before.round || mid.activeUnit !== before.activeUnit).toBe(true);
  // 按鈕＋確認框的「確定」
  const n1 = await log.count();
  await page.locator('[data-ui="commands"] button[data-cmd="end"]').click();
  if (await page.locator('[data-ui="confirm"]').isVisible()) await page.locator('[data-ui="confirm-accept"]').click();
  await settle(page);
  await expect.poll(async () => await log.count()).toBeGreaterThan(n1);
  expect(errors).toEqual([]);
});

test("縮放：+ 放大、− 縮小、0 回自動貼合；設定存進 localStorage，重新載入後保留", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  const auto = await cellWidth(page);
  await page.locator("body").press("+");
  await expect.poll(() => cellWidth(page)).toBeGreaterThan(auto);
  const zoomed = await cellWidth(page);
  expect(await page.evaluate(() => localStorage.getItem("mecha-srpg.ui.zoom"))).not.toBe("auto");
  await page.reload();
  await expect.poll(() => cellWidth(page)).toBeCloseTo(zoomed, 0);
  await page.locator("body").press("-");
  await expect.poll(() => cellWidth(page)).toBeLessThan(zoomed);
  await page.locator('[data-ui="zoom-fit"]').click();
  await expect.poll(() => cellWidth(page)).toBeCloseTo(auto, 0);
  // Ctrl＋滾輪也縮放
  await page.locator('[data-ui="board"]').hover();
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -200);
  await page.keyboard.up("Control");
  await expect.poll(() => cellWidth(page)).toBeGreaterThan(auto);
  expect(errors).toEqual([]);
});

test("小地圖自動貼合：20×20 地圖格子放大到填滿戰場面板的一邊", async ({ page }) => {
  await page.goto("/?anim=off");
  await page.evaluate(() => { try { localStorage.removeItem("mecha-srpg.ui.zoom"); } catch { /* 無 */ } });
  await page.reload();
  const s = await snap(page);
  const board = (await page.locator('[data-ui="board"]').boundingBox())!;
  const panel = (await page.locator('[data-ui="board"]').locator("xpath=ancestor::*[contains(@class,'board-viewport')]").boundingBox())!;
  expect(s.map.width).toBeLessThanOrEqual(40);
  expect(Math.max(board.width / panel.width, board.height / panel.height)).toBeGreaterThan(0.85);
});

test("跳過動畫：敵方回合播放中按 Esc，立刻跳到輪回我方", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=on");
  await settle(page);
  await page.locator("body").press("e");
  if ((await snap(page)).confirm) await page.locator("body").press("e");
  await expect.poll(async () => (await snap(page)).busy !== null).toBe(true);
  await expect(page.locator('[data-ui="commands"] button[data-cmd="skip"]')).toBeEnabled();
  await page.locator("body").press("Escape");
  const after = await snap(page);
  expect(after.busy).toBeNull();
  expect(after.playerTurn || after.activeUnit === null).toBe(true);
  await expect(page.locator('[data-ui="fx-layer"] > *')).toHaveCount(0);
  // 動畫設定可切換並記住
  await page.locator('[data-ui="anim-toggle"]').click();
  expect(await page.evaluate(() => localStorage.getItem("mecha-srpg.ui.anim"))).toBe("fast");
  expect(errors).toEqual([]);
});

test("大地圖 160×160：快捷鍵與滾輪捲動可視區，只渲染可視區的格", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?scenario=debug-big&size=160&anim=off");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  const cells = await board.locator("[data-x][data-y]").count();
  expect(cells).toBeGreaterThan(50);
  expect(cells).toBeLessThan(160 * 160 / 4);
  await page.locator('[data-ui="scroll-left"]').click();
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

test("觀戰：?spectate=1&anim=off 載入後經 settle 回合或事件有前進、無頁面錯誤", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?spectate=1&anim=off");
  await expect(page.locator('[data-ui="board"]')).toBeVisible();
  const first = await snap(page);
  expect(first.playerTurn).toBe(false);
  for (let i = 0; i < 3; i++) { await settle(page); await page.waitForTimeout(50); }
  const after = await snap(page) as Snap & { log: unknown[]; outcome: unknown };
  expect(after.round > first.round || after.log.length > 0 || after.outcome !== null).toBe(true);
  expect(errors).toEqual([]);
});
