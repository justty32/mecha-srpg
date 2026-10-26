# 任務：把程式碼裡的舊用語顯示字串換成定案新詞（潮月→蝕月等六組），連動測試與兩個資料檔的鍵

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-rename/REPORT.md` 的「需要決定」第 1 項與 `content/lore/style.md` 的用語段（只讀）。

## 背景與唯一目標

內容用語已全庫改名（lead-rename 收線），但 `src/` 與 e2e 裡還有玩家看得到的舊詞。本線只換**顯示字串**（玩家或 agent 會讀到的字），讓畫面、CLI、MCP 輸出與內容用語一致。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（換詞對照，只換字串字面值與顯示文字，不改識別字）：
  1. 「潮月」→「蝕月」：`src/ui-adapter/ops/vm/snapshot.ts`、`src/ui-adapter/ops/dom/tabs.ts`、`src/mcp/campaign-view.ts`、`src/mcp/campaign.ts`、`src/ops/sim/cli.ts`、`src/ops/sim/health.ts`（若有）、`e2e/ops-campaign.spec.ts`。
  2. 「潮相」→「蝕相」、「潮壓」→「蝕壓」：`src/ui-adapter/ops/dom/render.ts`（以及上列檔中同字）。
  3. 「潮曆」→「蝕曆」：`src/ui-adapter/ops/vm/labels.ts`、`src/ui-adapter/ops/vm/keymap-ui.json`。
  4. 「摹機系列」→「衍型機系列」：`src/ui-adapter/vm/wiki/cards.ts`。
  5. 「摹機總層 HP」→「衍型機總層 HP」：`src/sim/probe.ts`，並同步改 `wf/workflows/content/numeric-bands.json` 中 `類別:"摹機"` 的列為 `類別:"衍型機"`、`wf/workflows/content/playtest-baselines.json` 中「基準摹機」為「基準衍型機」（用 `python3 wf/tools/tabledb.py` 讀寫；這兩檔只改這些鍵值）。
  6. 「共鳴殼」→「共鳴裝甲」：`src/ui-adapter/vm/labels.ts`（「駕駛艙殼」保留不改）。
  - 上列檔的測試與 fixture 中斷言這些字串的地方跟著改（例 `src/mcp/campaign.test.ts`、`src/ui-adapter/ops/dom/render.test.ts`、`src/ui-adapter/ops/dom/fixtures.ts`、`src/ui-adapter/vm/wiki/lore.test.ts`、`test/sim/probe.test.ts`、`src/ops/sim/*.test.ts`）。
- **不改**：「大潮」「小潮」「平潮」照用；程式識別字、型別名、內容 id、`content/` 任何檔；程式註解（不是顯示字串）；`src/ai/`、`src/rules/`、`src/core/`；`wf/`（除上列兩個資料檔與 REPORT 目錄）。
- 件數 gate：改動檔超過 30 件就停下回報；容量 gate：無新檔，不適用但若需新增檔一律先停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `grep -rn '潮月\|潮相\|潮壓\|潮曆\|摹機系列\|摹機總層\|共鳴殼\|基準摹機' src e2e test` | 開工前盤點、收工後複查 |
| `npm run typecheck`、`npm test`、`npm run build` | 改完跑 |
| `python3 wf/tools/tabledb.py {檔.json} find 類別=摹機` | 改兩個資料檔 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-terms --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有其他線的未提交改動，不要還原。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 測試與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**；REPORT 註明，完整 `npm test` 由領導在沙箱外重跑。

## 工作

1. 讀「先讀」；跑盤點 grep，列出每個命中是「顯示字串」還是「註解」。
2. 照對照表換顯示字串與測試斷言；改兩個資料檔的鍵。
3. 複查 grep：顯示字串命中為 0（註解命中列進 REPORT 不改）；跑必用工具，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-terms/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-terms/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單與每檔換了幾處；產出——收工 grep 輸出；沒做到或證據不足的；需要決定的事——含保留的註解命中），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 收工 grep 在 `src`、`e2e`、`test` 的**顯示字串**命中為 0（REPORT 附輸出並標出剩餘註解命中）。
2. `npm run typecheck` 0 錯、`npm run build` 成功。
3. `npm test` 全過（沙箱外由領導重跑）。
4. REPORT 存在，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-terms`。本線團隊：`teams/grid`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-terms --up DONE '一句自足結論' /tmp/cx-grid-terms/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-terms --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「顯示字串換新詞」；識別字、內容、註解一律不改——此條優先於工作步驟。
