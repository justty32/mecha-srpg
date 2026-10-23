# cx-spike-vanilla：首次渲染中位數 65.8 ms；一回合更新中位數 30.9 ms

## 做了什麼

依交接書完成純 TypeScript＋Vite、直接操作 DOM 的 spike。已親讀專案 AGENTS.md、investigation、common/user 與適用 wf 規則；交付與驗收以交接書限定範圍為準。未修改專案既有檔案，未開 GUI、未使用子代理。

實作 120×120 個獨立 DOM 方格、CSS grid、固定種子 20261023 的三種地形與不重疊的 200 個單位。每格 24×24 px，戰場可捲動；單位顯示文字「機」與顏色。點格顯示從 0 起算的座標、地形，以及單位 id／HP；結束回合依序將單位移到隨機上下左右空格、HP 減 1，搬動原有標記並同步資訊面板。沒有加入遊戲系統。

計時從 mount 函式開始／按鈕 click handler 開始，以 performance.now 記錄；DOM 更新後讀 grid.offsetWidth 強制 layout，再等待巢狀兩次 requestAnimationFrame。首次渲染包含固定資料生成與 DOM 建立，更新包含移動與 HP 更新。測試只做契約指定的兩個斷言；收尾只依固定四條驗收。

開工約 2026-10-23 21:26，量測完成 21:29（Asia/Taipei），於 60 分鐘內收線。直接依賴 4 個、專案總容量 104M，未觸發 8 個／500 MB gate。

## 產出

程式碼：`/tmp/lead-techstack-spike/vanilla/`。入口 `src/main.ts`；DOM 與量測在 `src/spike.ts`；樣式在 `src/style.css`；Node 測試在 `tests/dom.test.mjs`；Chromium 測試、量測與 preview 清理在 `scripts/browser.mjs`。

原始證據：

- `/tmp/lead-techstack-spike/logs/vanilla-perf.log`
- `/tmp/lead-techstack-spike/logs/vanilla-nodetest.log`
- `/tmp/lead-techstack-spike/logs/vanilla-playwright.log`
- `/tmp/lead-techstack-spike/logs/vanilla-build.log`

**量測結果（ms；下表顯示至小數一位）**

| 次數 | 首次渲染 | 一回合更新 |
|---|---:|---:|
| 1 | 71.0 | 30.1 |
| 2 | 65.5 | 29.6 |
| 3 | 65.8 | 30.9 |
| 4 | 62.0 | 31.1 |
| 5 | 65.9 | 31.2 |
| 中位數 | **65.8** | **30.9** |

原始中位數分別為 `65.80000000447035` 與 `30.899999998509884`。五次皆載入 `vite build` 產物，每次建立新 browser context，使用同一個 headless Chromium 行程；無另外暖機、無 CPU／網路節流。viewport 固定 1280×800、deviceScaleFactor=1。全數 14,400 格存在 DOM 中，viewport 之外的區域透過捲動查看。

以下指令均在 `/tmp/lead-techstack-spike/vanilla/` 執行；管線使用 `set -o pipefail`。browser.mjs 自行啟動 `vite preview --host 127.0.0.1 --port 4175 --strictPort`，最後關閉 Chromium 並等待 preview 結束。

```sh
node scripts/browser.mjs perf 2>&1 | tee /tmp/lead-techstack-spike/logs/vanilla-perf.log
```

量測原始輸出：

```text
mode=perf node=v24.14.1 chromium=156.0.8078.4 viewport=1280x800 deviceScaleFactor=1
browser_cache=~/.cache/ms-playwright headless=true build=dist
{"run":1,"render_ms":71,"turn_ms":30.100000001490116}
{"run":2,"render_ms":65.5,"turn_ms":29.600000001490116}
{"run":3,"render_ms":65.80000000447035,"turn_ms":30.899999998509884}
{"run":4,"render_ms":62,"turn_ms":31.100000001490116}
{"run":5,"render_ms":65.89999999850988,"turn_ms":31.200000002980232}
{"median_render_ms":65.80000000447035,"median_turn_ms":30.899999998509884}
CLEANUP chromium closed; vite preview pid=12 exited
```

**Node 內建 test runner＋happy-dom：通過，exit 0。** Node 24 原生載入可去除型別的 TypeScript，測試呼叫與瀏覽器相同的 mount 實作。

```sh
node --test tests/dom.test.mjs 2>&1 | tee /tmp/lead-techstack-spike/logs/vanilla-nodetest.log
```

輸出原文（9 行）：

```text
✔ 結束回合保留 200 單位且至少一個移動；點格後面板文字正確 (632.85713ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 798.7507
```

**Playwright headless Chromium：兩個斷言通過，exit 0。** 使用 build 產物，實際透過 DOM click 操作按鈕與方格。

```sh
node scripts/browser.mjs test 2>&1 | tee /tmp/lead-techstack-spike/logs/vanilla-playwright.log
```

輸出原文（5 行）：

```text
mode=test node=v24.14.1 chromium=156.0.8078.4 viewport=1280x800 deviceScaleFactor=1
browser_cache=~/.cache/ms-playwright headless=true build=dist
PASS 結束回合後 200 單位都還在且至少一個換了位置
PASS 點格後面板座標、地形、單位 id 與 HP 文字正確
CLEANUP chromium closed; vite preview pid=12 exited
```

**套件與安裝路徑。** Node v24.14.1、npm 11.11.0；直接依賴全部是 devDependencies：Vite 8.3.5、TypeScript 7.0.2、happy-dom 21.0.4、Playwright 1.64.0-beta-1791568591000，共 4 個，無執行期框架。版本鎖在 package-lock.json。

```sh
export npm_config_cache=/tmp/lead-techstack-spike/.npm-cache
npm install --save-dev --save-exact vite@8.3.5 typescript@7.0.2 happy-dom@21.0.4 playwright@1.64.0-beta-1791568591000
```

Playwright 版本取自本機已安裝 driver 的 package.json，browsers.json 指向 revision 1248。直接使用 `/home/lorkhan/.cache/ms-playwright/chromium_headless_shell-1248/`，實際 Chromium 版本 156.0.8078.4；未設定新的 PLAYWRIGHT_BROWSERS_PATH、未下載瀏覽器。

**容量與 build。** `npm run build` 執行 `tsc --noEmit && vite build`，成功。原始 build log 記錄 HTML 0.42 kB／gzip 0.30 kB、CSS 0.65 kB／gzip 0.39 kB、JS 3.08 kB／gzip 1.66 kB；build 本身 27 ms（不等於首次渲染）。

```text
$ du -sh /tmp/lead-techstack-spike/vanilla/node_modules
104M    /tmp/lead-techstack-spike/vanilla/node_modules
$ du -sh /tmp/lead-techstack-spike/vanilla/dist
12K     /tmp/lead-techstack-spike/vanilla/dist
$ du -sh /tmp/lead-techstack-spike/vanilla
104M    /tmp/lead-techstack-spike/vanilla
$ wc -c dist/index.html dist/assets/*
 420 dist/index.html
 652 dist/assets/index-B8g7RzpI.css
3084 dist/assets/index-BvuVfXCC.js
4156 total
```

`du` 為磁碟配置用量，build 檔案內容合計 **4,156 bytes**。共用 npm cache 與既有瀏覽器快取不含在 node_modules／專案容量內。

擴充觀察：新地形只改 `src/spike.ts` 的 TERRAINS 一處；單純新增單位類型資料只改 UNIT_TYPES 一處，但要讓新舊類型同時出現在戰場，還要改生成與標記渲染兩處，合計三處。

清理證據：兩條 Chromium 腳本都在 finally 中 await browser.close，再終止且 await preview exit；兩份 log 均有 CLEANUP，命令均 exit 0，沒有本線留下的 preview 或瀏覽器背景行程。

## 沒做到或證據不足的

固定範圍無未完成項。首次 build 因 CSS side-effect import 缺少型別宣告失敗，補上標準 `vite/client` reference 後 build 成功，屬本線修正而非環境阻塞。

happy-dom 路徑只驗 DOM 行為，無真實排版效能證據；所有效能數字來自 Chromium。兩次 rAF 計時含畫面排程等待，不是純 JavaScript 執行時間；同機可能存在其他線的工作負載，未隔離整機效能。這是固定 viewport、固定種子、單回合五次量測，沒有推論成完整遊戲或其他裝置的效能。

## 需要決定的事

本線無需追加決策即可交付。後續技術棧選擇由 lead-techstack 合併各線證據決定；沒有擅自追加遊戲功能、效能優化或驗收項目。

**以後交接書該點名的工具：** 無。
