# 任務：用 純 TypeScript＋Vite（無框架） 做一個 120×120 方格＋200 單位的最小 spike，實測渲染／更新 ms 與 headless 驗證路徑

> 你是 codex 工人線 `cx-spike-vanilla`，由領導 `lead-techstack` 派出。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/investigation.md` 與 `wf/workflows/common/user.md`——親自讀，不靠本交接書的摘要。

## 背景與唯一目標

專案要做成網頁版純文字機甲 SRPG，戰場是真正的 DOM／CSS 方格（不是 canvas、不是字元格）。領導要比較幾個網頁技術棧。唯一目標：**用 純 TypeScript＋Vite（無框架） 做出下面規格的 spike，量出兩個數字、跑通兩種 headless 驗證，寫成有原始 log 佐證的 REPORT**。數字差不是失敗，是結果。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：在 `/tmp/lead-techstack-spike/vanilla/` 建一個 Vite 專案（npm create vite 的 vanilla-ts 模板或手寫等價骨架；直接操作 DOM），內容固定為：
  1. 一張 120×120 的方格，每格一個 DOM 元素（CSS grid 排版，格子用 CSS 顏色表地形，種子固定的偽隨機 3 種地形）。
  2. 200 個單位，每個是格子內的一個 DOM 標記（文字縮寫＋顏色），初始位置用固定種子偽隨機、不重疊。
  3. 點任一格 → 側邊資訊面板顯示該格座標、地形、若有單位則顯示單位 id 與 HP。
  4. 一顆「結束回合」按鈕 → 一次更新全部 200 單位（每個往隨機相鄰空格移一格、HP 減 1），畫面同步更新。
  5. 量測：首次渲染 ms（從開始掛載到 `requestAnimationFrame` 兩次之後，期間強制一次 layout）與一回合更新 ms（按鈕觸發到同樣的兩次 rAF 之後）；用 Playwright headless chromium 載入 `vite build` 後的產物（`vite preview` 或靜態檔皆可），跑 5 次取每次數值與中位數，**原始輸出寫進 `/tmp/lead-techstack-spike/logs/vanilla-perf.log`**。
  6. headless 驗證兩條路徑，各寫一個最小測試並真的跑：(a) node 內建 test runner（`node --test`）＋ jsdom 或 happy-dom，斷言「結束回合後 200 單位都還在且至少一個換了位置」與「點格後面板文字正確」，輸出寫進 `/tmp/lead-techstack-spike/logs/vanilla-nodetest.log`；(b) Playwright headless 同兩個斷言，輸出寫進 `/tmp/lead-techstack-spike/logs/vanilla-playwright.log`。
  7. 記 `du -sh /tmp/lead-techstack-spike/vanilla/node_modules` 與 `vite build` 產物大小進 REPORT。
- 不做：遊戲規則、資料模型、AI、營運層、存檔、美術；測試框架以外的依賴（不裝 vitest、jest、狀態管理庫）；改專案 `/home/lorkhan/repo/game_dev/mecha-srpg/` 內任何既有檔；全域安裝；有頭瀏覽器。
- 件數 gate：npm 依賴（直接依賴）超過 8 個就停下回報；容量 gate：`/tmp/lead-techstack-spike/vanilla/` 超過 500 MB 就停下回報；時間 gate：開工 60 分鐘內收線，沒做完的寫進「沒做到」。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-spike-vanilla --once` | 每完成一步讀 orders／mail |
| `npm install`（只在 `/tmp/lead-techstack-spike/vanilla/` 內；先 `export npm_config_cache=/tmp/lead-techstack-spike/.npm-cache`） | 裝 vite、框架、jsdom／happy-dom、playwright |
| `npx playwright test` 或 node 腳本呼叫 `playwright` 的 chromium（`headless: true`） | 量測與 (b) 路徑 |
| `node --test` | (a) 路徑 |
| `wf/tools/inbox_mail.sh` | 終局回報（正文給 REPORT 檔） |

Playwright 瀏覽器：本機 `~/.cache/ms-playwright/` 已有 `chromium_headless_shell-1243`／`-1248`（唯讀可用）。先裝與其相容的 playwright 版本直接用；不相容才 `export PLAYWRIGHT_BROWSERS_PATH=/tmp/lead-techstack-spike/vanilla/.pw-browsers` 後 `npx playwright install chromium`，並在 REPORT 記你走了哪條。

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-vanilla/REPORT.md`）、`/tmp/lead-techstack-spike/vanilla/` 與 `/tmp/lead-techstack-spike/logs/vanilla-*.log`。codex 沙箱為 `-s workspace-write`，可寫範圍只有上述三處、`/tmp` 與 `wf/inbox`。**本線唯一的安裝授權**：在 `/tmp/lead-techstack-spike/vanilla/` 內 `npm install`，與上面那條 Playwright 瀏覽器下載。

**共通禁區**：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗（瀏覽器只准 headless）；不 push、不建分支、不 commit、不 rebase／reset 別人的 commit；不 `rm -rf`（暫存搬 `/tmp/cx-spike-vanilla-trash/`）；不改 `~/.codex/config.toml`；不全域安裝、除上面授權外不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 0 個。

**分清錯誤來源**：網路或沙箱擋住安裝、瀏覽器起不來 → 這本身是評估結果，記進 REPORT，能測的繼續測；兩條 headless 路徑與量測**全部**測不出來才發 `BLOCKED`。你自己寫的程式出錯 → 自己修，不算阻塞。**不准拿估計值冒充量測。**

## 工作

1. 讀先讀清單；跑 `wf/tools/inbox_poll.sh cx-spike-vanilla --once`。
2. 建專案、裝依賴、寫 spike（範圍 1–4）。
3. 寫並跑兩條 headless 測試（範圍 6），原始輸出 tee 進 log。
4. 跑量測（範圍 5），原始輸出 tee 進 log。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-vanilla/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-vanilla/REPORT.md` |
| spike 程式碼 | `/tmp/lead-techstack-spike/vanilla/` |
| 量測 log | `/tmp/lead-techstack-spike/logs/vanilla-perf.log` |
| headless 測試 log | `/tmp/lead-techstack-spike/logs/vanilla-nodetest.log`、`/tmp/lead-techstack-spike/logs/vanilla-playwright.log` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事）；「產出」段要有：首次渲染 ms 與一回合更新 ms 的 5 次值與中位數、兩條 headless 路徑的**實際指令與輸出原文**（各貼關鍵 20 行內）、node_modules 與 build 大小、用了哪些套件與版本、一句「加一種新單位／地形資料要改幾處」的觀察。末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. REPORT.md 存在且四段齊全。
2. `/tmp/lead-techstack-spike/logs/vanilla-perf.log` 存在，內含 5 次首次渲染 ms 與 5 次一回合更新 ms，REPORT 的中位數與它一致。
3. `/tmp/lead-techstack-spike/logs/vanilla-nodetest.log` 與 `/tmp/lead-techstack-spike/logs/vanilla-playwright.log` 至少一個顯示測試通過（另一個跑不起來就寫原因）。
4. 收線時沒有你起的背景行程（vite preview、瀏覽器）還活著。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了但很慢或某斷言失敗）→ 是結果不是失敗，照實寫進 REPORT，發 `DONE`。
- **測不出來**（環境裝不起來、沙箱擋住）→ 不回滾，REPORT 寫卡在哪與解除條件；全部測不出來才發 `BLOCKED`。

## 完成／阻塞回報（必做）

- 我是誰：`cx-spike-vanilla`。本線團隊：`teams/techstack`（領導 `lead-techstack` 已幫你加入名冊；ROSTER 由領導代管，你不用寫 ROSTER）。
- 終局（STATUS 換成下一行四選一，標題換成你的結論）：`wf/tools/inbox_mail.sh cx-spike-vanilla --up STATUS '一句自足結論（含兩個中位數）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-vanilla/REPORT.md`。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。
