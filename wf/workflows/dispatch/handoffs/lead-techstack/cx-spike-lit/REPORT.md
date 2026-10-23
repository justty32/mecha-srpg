# cx-spike-lit：Lit 3＋Vite spike 實測

## 做了什麼

完成交接書固定範圍：120×120 個 DOM 格子以 CSS grid 排版、固定種子 `0x12345678` 的三種地形及 200 個不重疊單位；點格顯示座標、地形、單位 id 與 HP；結束回合依序挑相鄰空格移動並扣 1 HP。格子和單位都由 Lit 模板產生與更新，未直接操作 DOM 更新戰場。沒有 canvas、虛擬化或只畫可見格。

程式碼在 `/tmp/lead-techstack-spike/lit/`，主要實作為 `src/spike.ts`、掛載入口為 `src/main.ts`。只修改授權的新產物及 inbox，未修改專案既有檔、啟動子代理、全域安裝或操作 GUI。開工與收線均為 2026-10-23 21:26–21:31（Asia/Taipei）內，未觸及 60 分鐘 gate；直接依賴 5 個，專案 110 MB，未觸及 8 個／500 MB gate。

## 產出

首次渲染中位數 **96.9 ms**；一回合更新中位數 **25 ms**。實測環境為 Node v24.14.1、npm 11.11.0、Chromium 156.0.8078.4 headless，viewport 1280×900、deviceScaleFactor 1。每次使用新的 browser context／page；同一 Chromium 行程依序跑 5 次，無另做暖機或刪除離群值。

| 次數 | 首次渲染 ms | 一回合更新 ms |
|---|---:|---:|
| 1 | 104.5 | 25 |
| 2 | 99.5 | 23 |
| 3 | 96.9 | 34.3 |
| 4 | 96.6 | 25 |
| 5 | 95 | 26.7 |
| 中位數 | 96.9 | 25 |

首次計時從 `document.createElement('battle-spike')` 前開始，涵蓋初始化、掛載和 Lit 更新；不含 JS 模組下載／解析。回合計時從按鈕 handler 開始，涵蓋計算、狀態更新及 Lit 更新。兩者都等待 `updateComplete`，讀 `.grid.offsetWidth` 強制 layout，再等待兩次巢狀 `requestAnimationFrame` 才停止計時。這包含 frame 等待，不是純 JS 執行時間。使用 Lit 的更新完成機制依據 [Lit lifecycle 文件](https://lit.dev/docs/components/lifecycle/)。

以下指令均在 `/tmp/lead-techstack-spike/lit/` 執行，shell 使用 `set -o pipefail`，三個測試／量測指令退出碼均為 0。browser helper 透過 Vite `preview()` 在 `127.0.0.1:4175` 提供 `vite build` 產物；`finally` 會關閉 context、browser 與 preview server。

量測實際指令：

```sh
npm run build 2>&1 | tee /tmp/lead-techstack-spike/logs/lit-build.log
node tests/perf.mjs 2>&1 | tee /tmp/lead-techstack-spike/logs/lit-perf.log
```

`/tmp/lead-techstack-spike/logs/lit-perf.log` 原文：

```text
Chromium 156.0.8078.4; headless=true; viewport=1280x900; vite preview http://127.0.0.1:4175
{"run":1,"firstRenderMs":104.5,"turnMs":25}
{"run":2,"firstRenderMs":99.5,"turnMs":23}
{"run":3,"firstRenderMs":96.9,"turnMs":34.3}
{"run":4,"firstRenderMs":96.6,"turnMs":25}
{"run":5,"firstRenderMs":95,"turnMs":26.7}
{"median":{"firstRenderMs":96.9,"turnMs":25}}
CLEANUP: browser closed; vite preview closed
```

路徑 (a) 實際指令：

```sh
node --conditions=browser --test tests/dom.test.mjs 2>&1 | tee /tmp/lead-techstack-spike/logs/lit-nodetest.log
```

使用 happy-dom 提供 DOM 全域物件，Node 原生 TypeScript 載入 `src/spike.ts`；`--conditions=browser` 使 Lit 選用瀏覽器實作。測試實際觸發按鈕與格子的 DOM click，從渲染 DOM 讀出單位位置和面板內容。`/tmp/lead-techstack-spike/logs/lit-nodetest.log` 原文：

```text
PASS: 200 units remain and at least one position changed
PASS: clicked-cell panel text matches coordinates, terrain, unit id and HP
✔ happy-dom：回合後 200 單位仍在且至少一個換位；點格面板正確 (956.529449ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1126.097871
```

路徑 (b) 實際指令：

```sh
node tests/playwright.mjs 2>&1 | tee /tmp/lead-techstack-spike/logs/lit-playwright.log
```

Node 腳本直接呼叫 `playwright.chromium.launch({ headless: true })`。兩個斷言與路徑 (a) 相同：回合後 DOM 保留 200 個原本的單位 id 且至少一個位置改變；點有單位的格子後面板座標、地形、id、HP 文字完全相符。以頁內 DOM 事件觸發，沒有操作實體鍵鼠或截圖。`/tmp/lead-techstack-spike/logs/lit-playwright.log` 原文：

```text
Chromium 156.0.8078.4; headless=true; viewport=1280x900; vite preview http://127.0.0.1:4175
PASS: 200 units remain and at least one position changed
PASS: clicked-cell panel text matches coordinates, terrain, unit id and HP
RESULT: 2 assertions passed
CLEANUP: browser closed; vite preview closed
```

安裝實際指令為 `export npm_config_cache=/tmp/lead-techstack-spike/.npm-cache` 後在 spike 目錄執行 `npm install`。直接依賴與版本：Lit 3.3.3、Vite 8.3.5、TypeScript 7.0.2、happy-dom 21.0.4、Playwright 1.64.1，共 5 個，`package-lock.json` 留存。沒有 vitest、jest 或狀態管理依賴。

瀏覽器沿用 `/home/lorkhan/.cache/ms-playwright/chromium_headless_shell-1248/`；Playwright 套件的 `playwright-core/browsers.json` 指定 revision 1248，與既有瀏覽器吻合。未下載瀏覽器，也未設定自訂 executablePath。先核對版本是因為 [Playwright 官方文件](https://playwright.dev/docs/browsers) 指出各版本有對應的瀏覽器版本。

`du -sh /tmp/lead-techstack-spike/lit/node_modules` 為 **110M**；整個 spike 目錄獨立執行 `du -sh` 同為 **110M**。`du -sh dist` 為 **24K**。build 產物實際檔案大小：HTML 275 bytes、JS 19,030 bytes，合計 **19,305 bytes**；Vite 顯示 gzip 後 HTML 0.22 kB、JS 7.62 kB。build 原始輸出另存 `/tmp/lead-techstack-spike/logs/lit-build.log`。

資料擴充觀察：加一種地形只改 `src/spike.ts` 的 `TERRAINS` 一處；若新增並保留多種單位類型，需改同檔三處（類型資料、生成時指定類型、模板依單位類型取縮寫／顏色），目前只有固定一種單位，未實作擴充。

## 沒做到或證據不足的

交接書要求的兩條 headless 路徑與 5 次量測均完成，沒有環境阻塞。happy-dom 不具真實 layout／繪製能力，因此它只提供互動斷言證據，效能數字全來自 headless Chromium。5 次樣本僅代表本機此實作與當次執行，未做 CPU 隔離、跨機或長時間統計。沒有增加驗收條數或額外遊戲功能。

兩個瀏覽器腳本均在正常退出前輸出 `CLEANUP`，preview 在腳本內啟動並關閉，沒有另起持續背景服務；收線時本線測試及量測行程均已退出，無本線留下的 browser／preview 行程。

## 需要決定的事

由 lead-techstack 對照其他技術棧相同口徑的結果再決定選型。本線未建立正式資料模型、加入細粒度子元件或最佳化策略，這些不在本次契約內；無需使用者補授權即可完成本次交付。

以後交接書該點名的工具：Node `--conditions=browser`（Lit 在 happy-dom 下用瀏覽器匯出）、Node 24 原生 TypeScript 載入；Vite `preview()` API 可讓測試腳本在 `finally` 關閉伺服器。
