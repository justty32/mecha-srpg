# Svelte 5 spike：首次渲染中位數 321.8 ms、回合更新 30.7 ms，兩條 headless 路徑通過

## 做了什麼

本線 `cx-spike-svelte` 於 2026-10-23 21:26（Asia/Taipei）開始，約 21:32 完成。親讀專案 AGENTS.md、investigation、common/user 與適用 wf 規矩；依交接書只在自己的 spike、log、REPORT 與 inbox 寫入，未修改專案既有檔、未開子代理、GUI 或截圖。每完成工作步驟均從專案根執行 inbox_poll。

在 `/tmp/lead-techstack-spike/svelte/` 建立 Svelte 5 runes＋Vite＋TypeScript 最小專案。120×120 共 14,400 個格子都由 Svelte keyed each 渲染為 CSS grid 內的 button；沒有虛擬化、canvas 或手動 DOM 更新。三種地形以固定種子 20261023 生成，200 個單位以種子 200120 放入互不重疊的格子，格內 span 呈現文字縮寫與顏色。點格顯示座標、地形、單位 id／HP；結束回合依固定種子 8675309 逐一選擇四向相鄰空格移動並扣 HP 1，由 Svelte 狀態更新畫面。

量測在 production build 上執行。首次計時從呼叫 mount 前開始，包含元件初始化、地形與單位生成；更新計時從按鈕 handler 開始。兩者均 await Svelte tick，讀取 grid.offsetHeight 強制一次 layout，再等待兩次 requestAnimationFrame，最後取 performance.now 差值。DOM 只有量測幾何與測試讀值，畫面寫入均由 Svelte 負責。框架 API 參考 [Svelte runtime 文件](https://svelte.dev/docs/svelte/svelte) 與 [$state 文件](https://svelte.dev/docs/svelte/$state)。

## 產出

程式碼：`/tmp/lead-techstack-spike/svelte/`。主要檔案為 `src/App.svelte`、`src/fixture.ts`、`src/measurement.ts`、`src/main.ts`；測試為 `tests/node.test.mjs` 與 `tests/browser.mjs`。

原始 log：

- `/tmp/lead-techstack-spike/logs/svelte-perf.log`
- `/tmp/lead-techstack-spike/logs/svelte-nodetest.log`
- `/tmp/lead-techstack-spike/logs/svelte-playwright.log`
- `/tmp/lead-techstack-spike/logs/svelte-build.log`
- `/tmp/lead-techstack-spike/logs/svelte-environment.log`

以下執行指令的工作目錄均為 `/tmp/lead-techstack-spike/svelte/`；管線先設 `set -o pipefail`。依賴安裝前已設 `export npm_config_cache=/tmp/lead-techstack-spike/.npm-cache`。

**效能量測**：先 `npm run build 2>&1 | tee /tmp/lead-techstack-spike/logs/svelte-build.log`，再 `node tests/browser.mjs perf 2>&1 | tee /tmp/lead-techstack-spike/logs/svelte-perf.log`。使用 Vite preview（127.0.0.1:4187）、Chromium 156.0.8078.4、headless:true、viewport 1280×800；同一個瀏覽器程序逐次建立 5 個新的 context/page，各載入一次並更新一回合，沒有額外暖機或排除樣本。

| 次數 | 首次渲染 ms | 一回合更新 ms |
|---|---:|---:|
| 1 | 321.8 | 30.2 |
| 2 | 332.9 | 30.8 |
| 3 | 319.1 | 30.7 |
| 4 | 344.5 | 31.2 |
| 5 | 298.1 | 30.4 |
| 中位數 | **321.8** | **30.7** |

表格四捨五入至小數一位，原始數值如下，未取代或修飾任何樣本：

```text
{"run":1,"initialMs":321.79999999701977,"turnMs":30.19999999552965}
{"run":2,"initialMs":332.8999999985099,"turnMs":30.80000000447035}
{"run":3,"initialMs":319.1000000014901,"turnMs":30.69999999552965}
{"run":4,"initialMs":344.5,"turnMs":31.200000002980232}
{"run":5,"initialMs":298.1000000014901,"turnMs":30.399999998509884}
{"medianInitialMs":321.79999999701977,"medianTurnMs":30.69999999552965}
```

**路徑 (a)：node 內建 runner＋happy-dom。** 實際指令：

```sh
node --test --test-reporter=tap tests/node.test.mjs 2>&1 | tee /tmp/lead-techstack-spike/logs/svelte-nodetest.log
```

測試先建立 happy-dom window，再讀 Vite manifest 並 import production JS，在同一份 Svelte 畫面上操作 DOM click。原始輸出節錄（省略每項 duration 區塊）：

```text
TAP version 13
# Subtest: 結束回合後原本 200 單位都還在且至少一個換位置
ok 1 - 結束回合後原本 200 單位都還在且至少一個換位置
# Subtest: 點格後面板座標、地形、單位 id 與 HP 文字正確
ok 2 - 點格後面板座標、地形、單位 id 與 HP 文字正確
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1052.739143
```

**路徑 (b)：Playwright headless Chromium。** 實際指令：

```sh
node tests/browser.mjs test 2>&1 | tee /tmp/lead-techstack-spike/logs/svelte-playwright.log
```

原始輸出全文：

```text
9:30:20 PM [vite-plugin-svelte] no Svelte config found at /tmp/lead-techstack-spike/svelte - using default configuration.
Chromium 156.0.8078.4 | headless=true | production dist | viewport=1280x800
Executable: /home/lorkhan/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome
PASS 結束回合後原本 200 單位都還在且至少一個換位置
PASS 點格後面板座標、地形、單位 id 與 HP 文字正確
2 assertions passed
CLEANUP browser and vite preview closed
```

兩條路徑皆以單位 id 對照前後格子，確認原本 200 單位仍存在且至少一個改變位置；再點選有單位的格子，精確比對座標、地形、id、更新後 HP 99 的面板文字。沒有另加驗收條件。

**版本與容量。** Node v24.14.1、npm 11.11.0。直接依賴共 6 個，均以 exact version 保存於 package.json／package-lock.json：Svelte 5.57.2、Vite 8.3.5、@sveltejs/vite-plugin-svelte 7.3.1、TypeScript 7.0.2、happy-dom 21.0.4、Playwright 1.64.0-beta-1791568591000。

Playwright 選用本機既有 driver 對應的版本，安裝後 browsers.json 的 Chromium 與 headless shell revision 均為 1248，直接沿用 `~/.cache/ms-playwright/`，未下載瀏覽器、未設定額外瀏覽器目錄。log 的 Executable 欄是 chromium.executablePath() 回傳的預設 Chromium 路徑，並非宣稱擷取了實際子程序命令列；實際啟動呼叫為 chromium.launch({ headless: true })。

`du -sh /tmp/lead-techstack-spike/svelte/node_modules` 為 **112M**；`du -sh /tmp/lead-techstack-spike/svelte/dist` 為 **52K**；整個 spike 目錄為 **112M**，未觸發 8 個依賴／500 MB／60 分鐘 gate。

build 的檔案實際大小：JS 39,717 bytes、CSS 756 bytes、index.html 376 bytes、manifest 185 bytes，合計 **41,034 bytes**。Vite 印出的 gzip 大小分別為 JS 15.92 kB、CSS 0.38 kB、HTML 0.27 kB、manifest 0.14 kB；完整輸出見 svelte-build.log。

「加一種新單位／地形資料要改幾處」：增加一種地形只需在 `src/fixture.ts` 的 TERRAIN 陣列加 1 處，生成、顏色與面板會共用資料；若要讓第二種單位與現有單位共存，需改 fixture.ts 的型別／生成資料，以及 App.svelte 的標記取值，共 2 個檔案。此為讀碼觀察，未擴充實作。

## 沒做到或證據不足的

固定範圍內無未完成項目，兩條 headless 路徑均實跑通過。happy-dom 不提供真實 layout／繪製；它只提供互動斷言證據，效能數字全部取自 Chromium。未做有頭瀏覽器、實機互動或螢幕驗證。

效能僅代表本機這次 5 次樣本；沒有 CPU 限速、機器獨佔或背景負載控制。首次渲染計時不包含下載與入口模組解析，更新計時從 click handler 開始，不包含 Playwright 等待按鈕可操作的時間；兩次 rAF 是交接書指定的觀察終點，不保證所有離屏格子都已完成實際繪製。此次格子 20×20 px、戰場 2400×2400 px，由可捲動容器展示，全部格子仍在 DOM 中。

## 需要決定的事

本線無需額外授權或決定。技術棧選擇留由領導比較各線 REPORT；本線數字不直接推論其他技術棧優劣，後續若比較需注意 viewport、格子尺寸與量測邊界是否一致。

以後交接書該點名的工具：無。
