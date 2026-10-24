# 任務：改善 MCP 營運工具的資訊輸出（查看類指令、機甲狀態、出戰情報與戰果、市場招募研究清單）

> 領導 `lead-playtest` 寫給 codex 工人 `cx-pt-mcpc`。**交接書是唯一契約**。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。 程式背景：`src/mcp/README.md`、`src/mcp/campaign.ts`（含剛落地的 `campaign_sortie_begin／finish／cancel`）、`src/mcp/campaign-view.ts`、`src/mcp/campaign.test.ts`、`src/mcp/sortie.test.ts`、ops 對外：`src/ops/text/`（`render`、`Screen`、`parse`、`VERBS`、`entityName`）、`src/ops/sortie/index.ts`（`sortieBattleSetup` 唯讀）、`src/ops/state/types.ts`；**戰果報告語意範本**：`src/ui-adapter/ops/vm/controller.ts` 的 `report()`；試玩回報 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/r1/p6.json`（含 `twoStageWishlist`）、`p5.json`；問題表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/issues.json`（本線負責 ISS-035、036、037 的 MCP 部分、040 的 MCP 部分、041、039 的數字格式化）。

## 背景與唯一目標

試玩 agent 玩了兩個戰役各 2 潮月，最大的抱怨是「幾乎所有決策資訊都看不到」：查看類指令沒輸出、機甲狀態看不到、出戰前不知敵情、戰後只有勝負輪數、市場招募研究要猜 id。本線唯一目標：**agent 只看 MCP 營運輸出就能做經營與出戰決定**。只改 MCP 的呈現層，不改 ops 行為。

## 規格（寫死）

1. **查看類指令**（ISS-035）：`look`、`board`、`help`、`talk` 等指令在 ops 端產生的內容（`render` 的 `Screen` 各欄、`applyCommand` 回的事件、`prompt`）必須出現在 `campaign_act` 回傳的摘要裡；若 ops 本身沒有為某指令產出任何內容，MCP 端依 state 補一段（對機甲 id 的 `look`＝機甲詳情、對人物 id 的 `look`＝人物詳情、`board`＝契約板詳情），並在 REPORT 列出哪些是 MCP 補的。
2. **機甲與人員**（ISS-035）：`campaign_view` 加精簡機庫段：每台 `名稱（frame 名）`、駕駛名、各部位層血量百分比（損毀標記）、裝備組件名稱、彈藥／資源池 cur/max、待修工單；人員段用名字不用 id（重名時附 id）。
3. **出戰情報**（ISS-036）：`campaign_actions` 的每個出戰項（AI 自動與互動兩種）附 `preview`：用 `sortieBattleSetup`（唯讀）取得的地圖名與大小、敵方單位清單（名稱、等級、數量）、目標條件中文一句、輪數上限、裂縫相位與錨等級（從 state.rifts）；新增工具 `campaign_sortie_preview(id, sortie?)` 回同一份 preview（不改 state，參數同 `campaign_sortie_begin`）。
4. **戰果**（ISS-036）：AI 自動出戰與 `campaign_sortie_finish` 的回傳都加戰果報告（照 UI `report()` 語意）：現金變化、契約狀態變化、裂縫相位變化、我方每台機甲與人員的結局（存活／損毀部位／陣亡）、擊毀與捕獲的敵方清單（名稱）、戰利品筆數。
5. **清單**（ISS-037）：`campaign_actions` 列出目前所在節點可用的市場買賣品項（名稱、id、價格、可直接送的 `cmd`）、可招募人員（名字、職能、薪資、`cmd`）、可研究項目（名稱、需求、`cmd`）——只在 ops 有對應動詞時給 `cmd`，沒有就只列資訊並註明「需文字指令 X」；文字指令 parse 失敗時，MCP 錯誤訊息附「可用的 id」清單（從 state／world 取，最多 10 筆）。
6. **待選事件**（ISS-040）：因 `pending-choice` 被拒時，錯誤訊息直接附上目前 prompt 的題目與每個選項（序號、文字、停用原因）與可送的 `choose` cmd。
7. **數字與存檔**（ISS-039、041）：MCP 輸出的金額、欠薪、債務等浮點數顯示到 2 位小數（只改顯示）；`campaign_save` 未給 path 且 blob 超過 200 KB 時，回傳附警告建議用 path（仍回 blob）。

## 範圍（排除法寫死）

- 只做：`src/mcp/campaign.ts`、`src/mcp/campaign-view.ts`、新測試檔 `src/mcp/campaign-info.test.ts`；`src/mcp/README.md` 只改營運段（另一工人同時改戰鬥段，你只動「營運」那一段文字）。既有 `campaign.test.ts`、`sortie.test.ts` 只在斷言依賴被本線刻意改掉的輸出格式時最小修改（REPORT 逐條列出）。
- 不做：`src/mcp/battle*.ts`、`cli.ts`（另一工人 `cx-pt-mcpb` 同時在改）、`server.ts`、`tool.ts`、`protocol.ts`、`schema.ts`、`ui.ts`；`src/ops/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/core/`、`src/ui-adapter/`、`content/`、`test/`、`package.json`、`wf/`。`campaign_auto` hash、`sortie.test.ts` 的 hash 等價斷言必須照樣通過（只改輸出，不改推進）。
- 件數 gate：新增檔超過 1 個（不含 REPORT）就停下回報；容量 gate：本線淨增程式碼超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-pt-mcpc --once` | 每完成一個工作步驟跑一次，讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test 'src/mcp/*.test.ts'` | 本線測試 |
| `npm run typecheck` | 型別 |
| `npm run sim:campaign -- --months 1 --seed 5 --policy greedy` | 找出戰點、對照行為 |


## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；臨時檔放 `/tmp/cx-pt-mcpc/`。可跑 `node`、`node --test`、`npm run typecheck`、`npm run check`、`npm run sim:campaign`。**不要 commit**（commit 由領導做），REPORT 列檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導在沙箱外重跑）。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpc/REPORT.md`，不要只貼在回覆裡。**（在 worktree 時寫到 worktree 內同一相對路徑，領導會搬。）

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 營運工具改動 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign-view.ts` |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign-info.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpc/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（沙箱擋）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pt-mcpc`。本線團隊：`teams/playtest`。上線先發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pt-mcpc --up PROGRESS 'cx-pt-mcpc 上線開工' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pt-mcpc --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpc/REPORT.md（在 worktree 時用 worktree 內那份的絕對路徑）`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記。

## 工作

1. 規格 1、2、6、7＋測試；`inbox_poll --once`。
2. 規格 3、4＋測試；`inbox_poll --once`。
3. 規格 5、README 營運段；自己直接呼叫 handler 玩 seed 5 約 40 天（含一次互動出戰），把難讀的修掉；`inbox_poll --once`。
4. 寫 REPORT（附試玩輸出節錄 ≤ 40 行：一次 look 機甲、一次出戰 preview、一次戰果報告）並回報。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test 'src/mcp/*.test.ts'` 0 fail（領導在沙箱外重跑）；`campaign_auto` 與 `sortie.test.ts` 的 hash 斷言未改且通過。
2. `campaign-info.test.ts` 有斷言：`campaign_view` 含機庫每台的部位血量百分比與駕駛名；`campaign_act {v:"look", target:機庫第一台機甲 id}` 的摘要非空且含該機名稱。
3. `campaign-info.test.ts` 有斷言：出戰項的 `preview` 含敵方清單與目標句；`campaign_sortie_preview` 前後 `campaignHash` 不變。
4. `campaign-info.test.ts` 有斷言：AI 自動出戰回傳的戰果報告含現金變化與我方每台機甲結局；pending-choice 拒絕訊息含選項文字。
5. `npm run typecheck` exit 0；REPORT 四段齊。

不要為了「更保險」加驗其他東西。
