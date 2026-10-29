import { readdirSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

function frameFromContent(): { id: string; name: string } {
  const directory = new URL("../content/base/frames/", import.meta.url);
  for (const file of readdirSync(directory).sort()) {
    if (!file.endsWith(".json")) continue;
    const data: unknown = JSON.parse(readFileSync(new URL(file, directory), "utf8"));
    if (typeof data !== "object" || !data) continue;
    const frame = data as Record<string, unknown>;
    if (typeof frame.id === "string" && typeof frame.name === "string" && frame.name.trim()) {
      return { id: frame.id, name: frame.name };
    }
  }
  throw new Error("content/base 找不到帶名稱的 frame");
}

test("F1 從戰鬥進百科再返回，保留戰鬥回合", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  const round = page.locator('[data-ui="round"]');
  await expect(round).toBeVisible();
  const before = await round.textContent();
  await page.keyboard.press("F1");
  await expect(page.locator('[data-ui="wiki-home"]')).toBeVisible();
  await page.keyboard.press("F1");
  await expect(round).toBeVisible();
  await expect(round).toHaveText(before!);
  expect(errors).toEqual([]);
});

test("直接進百科搜尋內容中的 frame 名稱並開啟詳情", async ({ page }) => {
  const errors = watchErrors(page), frame = frameFromContent();
  await page.goto("/#/wiki");
  await expect(page.locator('[data-ui="wiki-home"]')).toBeVisible();
  expect(await page.evaluate(() => "__battle" in window)).toBe(false);
  await page.locator('input[data-ui="wiki-search"]').fill(frame.name);
  const result = page.locator('[data-ui="wiki-results"] a[data-key]').filter({ hasText: frame.name }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.locator('[data-ui="wiki-entry"]')).toBeVisible();
  await expect(page.locator('[data-ui="wiki-entry"]')).toHaveAttribute("data-key", `base:${frame.id}`);
  expect(errors).toEqual([]);
});

test("詳情交叉連結與瀏覽器返回，再由導航回戰場", async ({ page }) => {
  const errors = watchErrors(page), frame = frameFromContent();
  const key = `base:${frame.id}`;
  await page.goto(`/?anim=off#/wiki/e/${encodeURIComponent(key)}`);
  const entry = page.locator('[data-ui="wiki-entry"]');
  await expect(entry).toHaveAttribute("data-key", key);
  const link = entry.locator("a[data-ref]").first();
  await expect(link).toBeVisible();
  const target = await link.getAttribute("data-ref");
  expect(target).toBeTruthy();
  expect(target).not.toBe(key);
  await link.click();
  await expect(entry).toHaveAttribute("data-key", target!);
  await page.goBack();
  await expect(entry).toHaveAttribute("data-key", key);
  await page.locator('[data-ui="app-nav"] a[data-nav="battle"]').click();
  await expect(page.locator('[data-ui="board"] [data-x][data-y]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("手機與橫向百科控制可達且頁面沒有水平溢出", async ({ page }) => {
  for (const size of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    await page.goto("/#/wiki");
    const search = page.locator('[data-ui="wiki-search"]');
    const toggle = page.locator('[data-ui="wiki-sidebar-toggle"]');
    await expect(search).toBeVisible();
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('[data-ui="wiki-sidebar"]')).toBeVisible();
    await toggle.click();
    await expect(page.locator('[data-ui="wiki-sidebar"]')).not.toBeVisible();
    const bounds = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
    expect((await toggle.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    if (process.env.MOBILE_SHOTS && size.width === 390 && size.height === 844) {
      await mkdir(process.env.MOBILE_SHOTS, { recursive: true });
      await page.screenshot({ path: join(process.env.MOBILE_SHOTS, "wiki-390x844.png"), fullPage: true });
    }
  }
});
