# 任務：做 MCP 截圖工具 `ui_screenshot`，並讓網頁支援 `?spectate=1` 全 AI 觀戰

> 領導 `lead-mcp` 寫給 Claude 子 agent 工人 `op-mcp-ui`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（含「改 `src/ui-adapter/` 必跑」段）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/dev-env.md`——親自讀。程式背景：`src/mcp/tool.ts`（**凍結契約，不准改**）、`src/ui-adapter/dom/main.ts`（URL 參數）、`src/ui-adapter/vm/session.ts`（已有 `spectate` 選項）、`src/ui-adapter/vm/controller.ts`（`controllerForScenario`、AI 回合怎麼靠 busy／step 演出推進）、`playwright.config.ts`、`e2e/battle.spec.ts`。

## 背景與唯一目標

使用者要「做個 MCP server，讓 agent 能夠控制、自己玩、自己測試」。協定層與戰鬥／營運工具由兩個 codex 工人同時在做（`src/mcp/protocol.ts`、`server.ts`、`battle*.ts`、`campaign*.ts`——都不是你的）；server 會呼叫你的 `createUiTools(env)`。本線唯一目標：**agent 能用一個工具拿到網頁版戰場的 headless 截圖（MCP image content），且網頁可用 `?spectate=1` 看全 AI 對戰**。

## 範圍（排除法寫死）

- 只做：
  - `src/mcp/ui.ts`（目前是回傳 `[]` 的 stub）：`createUiTools(env)` 回一個工具 `ui_screenshot(query?, width?, height?, settleMs?, rebuild?, steps?)`。`query` 是 URL 查詢字串（例 `scenario=scenario/skirmish-whitegloves&seed=1&spectate=1&anim=off`，自動補 `anim=off`）；`width`／`height` 預設 1280×800；`steps`＝載入後呼叫 `window.__battle.settle()` 再等 `settleMs`（預設 300ms）的次數（觀戰時讓 AI 跑幾步）。實作：`dist/` 不存在或 `rebuild:true` 時先跑 `node node_modules/vite/bin/vite.js build`（cwd＝`env.root`）；server 行程內只起一次 `vite preview --port（挑一個空埠）--strictPort`（子行程，stdout／stderr 不得寫到本行程 stdout——MCP 的 stdout 只能放協定訊息；server 結束時要殺掉它，掛 `process.on("exit")`）；用 `await import("playwright")`（**動態 import**：沒裝 playwright 時工具回 `isError` 說明，server 其他工具照常可用）的 `chromium.launch({ headless: true })`，瀏覽器重用。回傳 content：`{ type:"image", data:（base64 PNG）, mimeType:"image/png" }`＋一段文字（URL、尺寸、`window.__battle.snapshot()` 的回合／行動者／是否玩家回合／勝負摘要，頁面錯誤訊息若有就列出）。另匯出 `closeUi()` 給測試收尾。
  - `src/mcp/ui.test.ts`：直接呼叫 handler（不經協定層），斷言回傳 image 的 base64 解碼後開頭是 PNG 簽名、文字含回合資訊；`?spectate=1` 一條。測試結束關掉瀏覽器與 preview 子行程（不留殘餘行程）。若本機跑不起 Chromium，測試 `skip` 並註明原因。
  - `?spectate=1`：`src/ui-adapter/dom/main.ts` 讀參數；需要的話在 `controllerForScenario` 加一個 `spectate` 選項（傳給 vm `BattleSession`）。觀戰時 AI 回合要能靠既有演出計時自動往下跑（或按「跳過」推進）；不要改其他行為。加一條 vm 層測試（`src/ui-adapter/vm/` 底下既有測試檔追加或新檔）證明 spectate controller 能跑到有輸出，以及 `e2e/battle.spec.ts` 追加一條「`?spectate=1&anim=off` 載入後經數次 `settle` 回合或事件有前進、無頁面錯誤」。
- 不做：`src/mcp/` 除 `ui.ts`、`ui.test.ts` 外的檔；`src/ui-adapter/` 除 spectate 所需的最小改動外的任何東西（不改版面、樣式、快捷鍵、文字）；`src/sim/`、`src/ops/`、`src/rules/`、`src/ai/`、`src/core/`、`src/content/`、`content/`、`test/`、`package.json`、`playwright.config.ts`、文件。
- 件數 gate：改＋新增檔超過 6 個就停下回報；容量 gate：新增程式碼超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node --test src/mcp/ui.test.ts` | 本線 MCP 測試 |
| `npm run test:dom`、`npm run build`、`npm run test:e2e` | 改 ui-adapter 必跑（見 testing.md） |
| `npm run typecheck` | 型別（兩段） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；暫存放 scratchpad 或 `/tmp/op-mcp-ui/`。Chromium **只准 headless**（`headless: true`；不准 `headed`、不准 `--headed`、不准開任何視窗）。**不要 commit**（index 有別線的東西；commit 由領導做），REPORT 列檔案清單。
- 工作樹裡 `src/ops/`、`content/base/` 有別線未提交的改動：不要碰、不要 restore；它們造成的紅燈寫進 REPORT 即可。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`；不 `rm -rf`；**不安裝任何套件**（playwright 已裝在 devDependencies，瀏覽器在 `~/.cache/ms-playwright/`）；不碰 `.gitignore`；子代理上限 0 個；不上網。收工前確認沒有殘留的 `vite`／`chrome-headless-shell` 子行程（`pgrep -af "vite preview|headless_shell"`）。

**分清錯誤來源**：Chromium 起不來、埠被佔 → 記 REPORT（測試 skip 不算失敗）；你自己的程式錯自己修。

## 工作

1. `?spectate=1`＋vm 測試＋e2e 追加一條；跑 `test:dom`、`build`、`test:e2e`。
2. `ui.ts`＋`ui.test.ts`；確認沒有殘留行程。
3. 寫 REPORT。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/op-mcp-ui/REPORT.md`，不要只貼在回覆裡**（寫檔被擋時才把全文放在回覆）。回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 截圖工具與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/ui.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/ui.test.ts` |
| spectate | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/dom/main.ts` 等（REPORT 列全） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/op-mcp-ui/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test src/mcp/ui.test.ts` 0 fail（skip 要在 REPORT 說明原因）。
2. `npm run test:dom` 0 fail、`npm run build` exit 0、`npm run test:e2e` 全過（含新增的 spectate 一條）。
3. `npm run typecheck` exit 0。
4. 測試結束後 `pgrep -af "vite preview|headless_shell"` 沒有本線留下的行程。
5. REPORT 存在且有四段。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 回滾本線對 `src/ui-adapter/`、`e2e/` 的改動（`git diff` 確認只剩你的），REPORT 寫證據。
- **測不出來**（Chromium 起不來、埠被擋）→ 不回滾、保持現狀，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`op-mcp-ui`。本線團隊：無（Claude 子 agent，在行程內）。
- Claude 子 agent 不走 inbox，直接在回覆給 5 行摘要＋REPORT 路徑；終局 STATUS 寫在第一行：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一。
