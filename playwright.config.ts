// Playwright 端對端：只跑 headless Chromium（本機快取 chromium_headless_shell-1248）；
// 測試前先 vite build，再由 webServer 起 vite preview（不開瀏覽器視窗）。
import { defineConfig, devices } from "@playwright/test";

const PORT = 4174;
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: "node_modules/.cache/playwright-results",   // 不在工作樹留 test-results/
  use: { baseURL: `http://localhost:${PORT}`, headless: true, ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
