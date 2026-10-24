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
