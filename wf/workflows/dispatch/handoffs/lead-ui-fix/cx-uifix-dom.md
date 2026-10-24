# 任務：改寫 ui-adapter 的 DOM 層以落實試玩回饋（固定指令面板、自動貼合與手動縮放、高亮、戰場演出疊層、浮出選單、選部位、確認框、main.ts 演出驅動）並補 12 個 happy-dom 測試

> 領導 `lead-ui-fix` 寫給 codex 工人 `cx-uifix-dom`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄 `contract.md` 的 §1、§3（照抄行為）。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/feedback.md`（使用者原話）、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/contract.md`（§1 §3 是你的規格；§2 是 vm 會產出什麼，給你參考）、`src/ui-adapter/vm/types.ts`（已凍結，標 `[lead-ui-fix]` 的是新欄位）、`src/ui-adapter/vm/keymap.ts`（main.ts 會用 `resolveKey`）、`src/ui-adapter/dom/` 全部現有檔——親自讀。

## 背景與唯一目標

網頁戰鬥畫面已可玩，但使用者試玩後列了九項手感問題（配色 OK，不改色系）。vm 層由另一條線 `cx-uifix-vm` 同時改；你**只看 types.ts 的型別**，非測試檔不 import vm 實作（`main.ts` 例外）。唯一目標：`mountBattle` 把新 `UiSnapshot`（quickMenu、confirm、busy、fx、part 模式、stale、LogLine.at）畫出來，實作 contract §3 的佈局、縮放、高亮、演出與 main.ts 驅動，`tsc --noEmit -p tsconfig.ui.json` 對 dom 零錯誤。

## 範圍（排除法寫死）

- 只做：改 `src/ui-adapter/dom/` 底下現有檔（`render.ts`、`board.ts`、`panels.ts`、`tooltip.ts`、`style.css`、`main.ts`、`fixtures.ts`、`render.test.ts`、`input.test.ts`）；可新建最多 3 個模組（例 `fx.ts`、`zoom.ts`、`menus.ts`）與最多 1 個測試檔；外加你的 REPORT。
- 不做：`src/ui-adapter/dom/integration.test.ts`（領導收線時改；開工期間它紅是預期的）、`src/ui-adapter/vm/`（別線；types.ts 不夠用 → 寫 REPORT，不改）、`src/ui-adapter/content-browser.ts`、`e2e/`、`index.html`、各 config／tsconfig、`package.json`、`src/` 其他目錄、`content/`、`test/`、`wf/`（除了你的 REPORT 與 inbox 回報）。不加外部字型、圖片、套件；演出用 CSS＋內嵌 SVG。
- 件數 gate：新檔超過 4 個就停下回報；容量 gate：`src/ui-adapter/dom/` 非測試檔合計超過 90 KB 就停下回報。

## 規則補充（寫死）

- 只用 `root.ownerDocument`／`.defaultView`，非測試檔（main.ts 除外）不碰全域 `document`／`window`／`localStorage`。localStorage 讀寫只在 main.ts，**每次讀寫都包 try/catch**，壞值當沒設。
- 指令面板節點重用：同一 `CommandOption.id` 的按鈕在快照間是**同一個 DOM 節點**（測試會驗）；固定按鈕的順序與位置不因 enabled 改變。
- 量不到尺寸（happy-dom 寬高 0）時不送 `resize`；縮放計算寫成可單測的純函式（例 `fitCellSize(panelW, panelH, mapW, mapH)`、`zoomStep(size, dir)`、`anchorViewport(...)`）。
- 動畫時間用 `defaultView.setTimeout`／CSS animation；`skipFx()` 立刻清疊層與計時器。

## 測試（寫死條數；`node:test`＋`node:assert/strict`＋`happy-dom` 的 `Window`）

既有 `render.test.ts`／`input.test.ts` 的 14 個若因新快照欄位或佈局改變而失敗，**改寫到符合新契約**，條數不變（`fixtures.ts` 補新欄位）。另**新增恰好 12 個 `test()`**：
1. 指令面板：兩次 render（enabled 改變）同 id 按鈕是同一節點；disabled 按鈕的 tooltip 含 reason。
2. `quickMenu` 非 null 時 `[data-ui="quick-menu"]` 出現、按鈕帶 `data-cmd` 與 `<kbd>`；null 時隱藏。
3. `confirm` 顯示 `[data-ui="confirm"]` 與文字；「確定」送 `endTurn`、「取消」送 `cancel`。
4. part 模式顯示 `[data-ui="part-picker"]`，點 `button[data-part-n="2"]` 送 `{type:"pickPart",n:2}`。
5. `fitCellSize`：小地圖放大（不超過 72）、大地圖夾到 24；`zoomStep` ×1.25 與夾 [12,96]。
6. `anchorViewport`：縮放後錨格仍在新可視區內且相對位置一致（誤差 ≤1 格）。
7. Ctrl＋滾輪不送 `scroll`、改變格大小並回呼 `onSettings`；一般滾輪仍送 `scroll`。
8. `apply({type:"cycleAnim"})` 依序 on→fast→off→on 並回呼 `onSettings`；`anim-toggle` 按鈕文字跟著變。
9. fx：`path` 與 `float` 進 `[data-ui="fx-layer"]`；同 id 第二次 render 不重播；`epoch` 變了清空。
10. anim "off" 時 `attack` 與 tone status 的 float 不畫，path 與 damage float 照畫。
11. 高亮 class：`active` 與 `selected` 是不同 class；`reach`／`range`／`target` 各自 class；`stale` 徽章有 stale class。
12. log 有 `at` 的行可點，送 `{type:"focusLog",seq}`。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/render.test.ts' 'src/ui-adapter/dom/input.test.ts'`（加上你的新測試檔；沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；`npx tsc --noEmit -p tsconfig.ui.json`（vm 線同時在改，若錯誤只出在 `src/ui-adapter/vm/` 或 `integration.test.ts` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-uifix-dom --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-uifix-dom/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不跑 Playwright、不起 dev server。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-uifix-dom/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `fixtures.ts` 補新欄位；佈局三欄＋固定指令面板（節點重用）＋view-controls；既有測試修綠＋新測試 1、11；`inbox_poll --once`。
2. 格大小自動貼合、手動縮放（鍵、Ctrl＋滾輪、角落鈕、錨點）、`apply`／`onSettings`；新測試 5–8；`inbox_poll --once`。
3. 演出疊層、quickMenu、part-picker、confirm、busy 頂列、log 可點；新測試 2–4、9、10、12；`inbox_poll --once`。
4. `main.ts`：localStorage（try/catch）＋URL `anim=`、按鍵分流、演出驅動計時器、`__battle.settle()`。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-dom/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、CSS、測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/dom/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-dom/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」與「DOM 錨點表」（新增的 data-ui），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 dom 的 render／input／你的新測試檔全過，且比開工前多恰好 12 個 `test()`（由領導重算）。
2. `npx tsc --noEmit -p tsconfig.ui.json` 對 `src/ui-adapter/dom/`（integration.test.ts 除外）零錯誤（由領導重跑）。
3. 非測試、非 main.ts 檔的 import 只有 `import type … from "../vm/types.ts"` 與同目錄模組；它們不出現全域 `document`／`window`／`localStorage`（領導 grep）。
4. 範圍外檔案沒被你改。
5. REPORT 存在且有四段＋SPEC-GAP 清單＋DOM 錨點表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（happy-dom 起不來、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-uifix-dom`。本線團隊：`teams/uifix`。上線先發 `wf/tools/inbox_mail.sh cx-uifix-dom --up PROGRESS 'cx-uifix-dom 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-uifix-dom --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-dom/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-uifix-dom --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
