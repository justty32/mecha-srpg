// 端對端（Playwright headless Chromium）：營運畫面走完「開新戰役→推進→接約→航行→出戰→戰鬥→回營運看戰果」，
// 以快捷鍵為主、滑鼠為輔；沿途存六張截圖（船艙、世界圖、契約、機甲、編成、戰果報告）給人目視。
import { test, expect, type Page } from "@playwright/test";

// 截圖只在設了 OPS_SHOTS（輸出目錄）時才存，避免每次跑 e2e 都改到工作樹；例：
// OPS_SHOTS=wf/workflows/dispatch/handoffs/lead-ui-ops/op-uops-dom/shots npx playwright test e2e/ops-campaign.spec.ts
const SHOTS = process.env.OPS_SHOTS;
const shot = async (page: Page, name: string): Promise<void> => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };

type OpsSnap = {
  prompt: { choices: { n: number; enabled: boolean }[] } | null;
  contracts: { id: string; status: string }[];
  battle: unknown; report: { winnerText: string } | null; log: { text: string }[];
};

const ops = (page: Page) => page.evaluate(() => (window as unknown as { __ops: { snapshot(): OpsSnap } }).__ops.snapshot());

test("營運：開新戰役 → 推進 → 接約 → 航行 → 出戰 → 返回營運看戰果", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/?seed=3&spectate=1&anim=off#/ops");
  const root = page.locator('[data-page="ops"] [data-ui="ops"]');
  await expect(root).toBeVisible();
  await expect(root.locator('[data-ui="ops-header"]')).toContainText("第 1 潮月");
  await expect(root.locator('[data-ui="ops-tabs"] button[data-action-id="tab:world"] kbd')).toBeVisible();
  await shot(page, "ship");

  // 推進到下個事件；有事件就按 1 回應，直到有可接契約。
  for (let i = 0; i < 20; i++) {
    const s = await ops(page);
    if (s.contracts.some(c => c.status === "offered") && !s.prompt) break;
    if (s.prompt) {
      await expect(root.locator('[data-ui="ops-prompt"]')).toBeVisible();
      await page.keyboard.press(String(s.prompt.choices.find(c => c.enabled)!.n));
    } else await page.keyboard.press("e");
  }
  expect((await ops(page)).contracts.some(c => c.status === "offered")).toBe(true);

  await page.keyboard.press("g");
  await expect(root.locator('svg[data-ui="world-map"] [data-node]').first()).toBeVisible();
  await root.locator('svg[data-ui="world-map"] [data-node]').first().click();
  await expect(root.locator('[data-ui="world-detail"] h2')).not.toBeEmpty();
  await shot(page, "world");

  await page.keyboard.press("c");
  const pane = root.locator('[data-tab="contracts"]');
  await pane.locator("li.ops-pick").first().click();
  await expect(pane.locator(".ops-detail")).toBeVisible();
  await shot(page, "contracts");
  await page.keyboard.press("a");
  const accepted = (await ops(page)).contracts.find(c => c.status === "active");
  expect(accepted).toBeTruthy();
  await pane.locator(`button[data-action-id="sail:contract:${accepted!.id}"]`).click();
  await expect(pane.locator(`button[data-action-id="sortieOpen:${accepted!.id}"]`)).toBeEnabled();

  await page.keyboard.press("k");
  await expect(root.locator('[data-tab="mechs"] .ops-detail')).toBeVisible();
  await shot(page, "mechs");

  await page.keyboard.press("b");
  await expect(root.locator('[data-ui="ops-sortie"]')).toBeVisible();
  await shot(page, "sortie");
  await page.keyboard.press("Enter");

  const back = page.locator('[data-ui="battle-return"]');
  await expect(page.locator('[data-ui="ops-battle"] [data-ui="board"]')).toBeVisible();
  await expect(root).toBeHidden();
  await page.evaluate(() => (window as unknown as { __opsBattle: { settle(): void } }).__opsBattle.settle());
  await expect(back).toBeVisible({ timeout: 20_000 });
  await page.keyboard.press("Enter");

  await expect(root).toBeVisible();
  const report = root.locator('[data-ui="ops-report"]');
  await expect(report).toBeVisible();
  await expect(report).toContainText("戰果報告");
  await shot(page, "report");
  const s = await ops(page);
  expect(s.battle).toBeNull();
  expect(s.report).not.toBeNull();
  await expect(root.locator('[data-ui="ops-log"]')).toContainText("戰鬥結束");
  expect(s.log.some(l => l.text.includes("戰鬥結束"))).toBe(true);
  // 戰後可能接著跳事件（例：屍體處理），先回應再用 Esc 關報告。
  for (let i = 0; i < 5; i++) {
    const p = (await ops(page)).prompt;
    if (!p) break;
    await page.keyboard.press(String(p.choices.find(c => c.enabled)!.n));
  }
  await page.keyboard.press("Escape");
  await expect(report).toBeHidden();
  expect(errors).toEqual([]);
});
