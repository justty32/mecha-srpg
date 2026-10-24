# 任務：做 MCP 戰役內互動出戰（`campaign_sortie_begin`／`campaign_sortie_finish`／`campaign_sortie_cancel`）與其測試

> 領導 `lead-playtest` 寫給 codex 工人 `cx-pt-sortie`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。程式背景：`src/mcp/README.md`、`src/mcp/tool.ts`（契約，不改）、`src/mcp/battle.ts`（戰鬥 session 表、`build`／`advance`／`register`）、`src/mcp/campaign.ts`（`execute`、`recordingBattle`、`battleSummary`、`campaign_actions` 的出戰項）、`src/mcp/server.ts`；ops 端只讀：`src/ops/sortie/run.ts`（`sortieBattleSetup` 唯讀、`applySortieResult`）、`src/ops/sortie/index.ts`、`src/ops/time/commands.ts`（`applyCommand` 先 clone、失敗回原 state）、`src/ops/sim/campaign.ts`（`CampaignCommand.battle` 紀錄格式）、`src/ops/sim/save.ts`（`loadCampaign` 怎麼消費 battle 紀錄）；**語意範本**：`src/ui-adapter/ops/vm/controller.ts` 的 `launch("command")` 與 `battleDone()`（UI 的互動出戰，照抄其語意）。

## 背景與唯一目標

使用者要「讓 agent 用 MCP 跑戰鬥系統，一邊跑一邊改進」。目前 MCP 的 `campaign_act` 出戰由 AI 自動打完；本線唯一目標：**戰役內出戰可以兩段式由 agent 親手打**——`campaign_sortie_begin` 回傳一個戰鬥 session id（`b1`、`b2`…，與 `battle_new` 同一張表），agent 用既有 `battle_*` 工具逐步打，`campaign_sortie_finish` 把戰果正式送 ops（同一筆 `sortie` 指令，與 UI 的 `battleDone` 同語意），之後存檔／讀檔可重播。

## 規格（寫死）

1. **共用戰鬥表**：`battle.ts` 匯出一個 hub（例如 `createBattleHub(env)` 或讓 `createBattleTools(env, hub?)` 接受外部 hub），讓 campaign 工具能把一個 `SimSetup`＋seed 登記成戰鬥 session（id 沿用 `b1`、`b2`… 流水號）並之後取回 `BattleSession`。`server.ts` 建一個 hub 傳給兩個模組；不傳 hub 時兩個模組各自行為與現在完全相同（既有測試不改即過）。
2. **`campaign_sortie_begin(id, sortie?, spectate?, autoAdvance?)`**：`sortie` 參數與 `campaign_act` 的 `{v:"sortie", sortie}` 相同（已承接契約的 `{contract,node,units}`，或有 `pendingBattle` 時 `{}`）；省略時取 `campaign_actions` 會給的那一筆（有 pendingBattle 用 `{}`，否則唯一一個可出戰契約＋機庫已派駕駛的機甲；有多個可出戰契約時要求明給）。照 UI `launch("command")`：用 `applyCommand(state, db, world, cmd, { battle: 捕捉 runner })`，runner 內呼叫 `sortieBattleSetup(s, ctx, sortie)`、記下 setup 與 `structuredClone(sortie)`，回 `{ ok:false, error:"mcp-deferred" }`——**戰役 state 不變**。用 setup 建 `BattleSession`（`human` = spectate ? [] : ["player"]，autoAdvance 預設 true，同 `battle_new`），登記到 hub，回 `{ campaign:id, battle:"bN", sortie, 戰場觀察摘要（同 battle_new 回傳）}`。戰役 session 記下 pending `{battle, cmd, sortie}`。
3. **pending 期間**：該戰役的 `campaign_act`、`campaign_advance`、再一次 `campaign_sortie_begin` 回 `isError`（「出戰進行中：先 campaign_sortie_finish 或 campaign_sortie_cancel」）；`campaign_view`／`campaign_actions` 照常，view 摘要加一行「出戰進行中：戰鬥 bN」；`campaign_actions` 這時只列 finish／cancel 兩項。`battle_close` 關掉該戰鬥時，finish 回錯誤並提示 cancel。
4. **`campaign_sortie_finish(id)`**：戰鬥必須已有 outcome（否則 `isError`，說明「戰鬥尚未結束：第 X 輪，輪到…」）。取 `session.result()`，照 UI `battleDone()` 用原 `cmd` 再跑一次 `execute`，runner：`canonicalJson(sortie)` 必須等於記下的 sortie（否則 `sortie-mismatch`）、`validateSortie`、`generateScenario(s, ctx, sortie)`（消耗相同 RNG）、`structuredClone(result)`、instinct 機甲還原 frame、`applySortieResult`、回 `{ ok:true, result }`。**同時寫入 `CampaignCommand.battle` 紀錄，格式與 `recordingBattle` 完全相同**（含 pool `max: Infinity`→`MAX_SAFE_INTEGER` 正規化、`rng`、`effectCounter`），讓 `campaign_save`→`campaign_load` 重播得出同一 state。回傳與 `campaign_act` 出戰相同的摘要（勝負、輪數、我方損失）＋畫面；清除 pending；戰鬥 session 保留在 hub（agent 可再 `battle_events` 查）但標記已回寫，不能再 finish 第二次。
5. **`campaign_sortie_cancel(id)`**：清除 pending、關掉該戰鬥 session，戰役 state 不變（begin 本來就唯讀）。
6. **`campaign_actions`**：可出戰契約／pendingBattle 除了原本「AI 自動結算」那項，另加一項 `{ label:"互動出戰…（campaign_sortie_begin）", tool:"campaign_sortie_begin", args:{ id, sortie } }`（不放 `cmd`，因為不是 `campaign_act` 指令；文字說明要講清楚用哪個工具）。
7. `battle_save` 對戰役出戰的戰鬥：情境不在內容庫，若 `battle_load` 無法重播，`battle_save` 對這類 session 回清楚的 `isError`（「戰役出戰的戰鬥請用 campaign_save 存整個戰役」），不要寫出壞檔。

## 範圍（排除法寫死）

- 只做：`src/mcp/battle.ts`、`src/mcp/campaign.ts`、`src/mcp/campaign-view.ts`、`src/mcp/server.ts`、新檔 `src/mcp/sortie.test.ts`（必要時另一個 `src/mcp/sortie.ts` 放兩段式邏輯）、`src/mcp/README.md`（工具段補三個工具與典型流程一段）。
- 只准 import ops 的：`src/ops/sortie/index.ts` 匯出（`sortieBattleSetup`、`validateSortie`、`generateScenario`）、`src/ops/sortie/run.ts` 的 `applySortieResult`、`canonicalJson`（`src/core/eventlog.ts`）、以及 campaign.ts 現有 import；戰鬥只走 `src/sim/session.ts`。
- 不做：`src/ops/`、`src/sim/`、`src/rules/`、`src/ai/`、`src/core/`、`src/ui-adapter/`、`content/`、`test/`、`package.json`、`wf/` 一律不改（別線正在改 ops／ai／rules／content，工作樹有它們未提交的改動——不要碰、不要 restore、不要 stash）。既有 MCP 測試檔（`battle.test.ts`、`campaign.test.ts`、`e2e.test.ts`…）不改。
- 件數 gate：新增檔超過 2 個就停下回報；容量 gate：本線新增程式碼超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-pt-sortie --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test 'src/mcp/*.test.ts'` | 本線測試（Node 24 要 glob） |
| `npm run typecheck` | 型別 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；臨時檔放 `/tmp/cx-pt-sortie/`。可跑 `node`、`node --test`、`npm run typecheck`、`npm run check`。**不要 commit**（commit 由領導做），REPORT 列檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；別線半成品使 `src/ops/`／`content/` 載入失敗或型別錯 → 發 `BLOCKED`（寫清哪個檔哪一行）；沙箱內 `node --test` 計數不準不算阻塞（領導在沙箱外重跑）。

## 工作

1. hub＋`campaign_sortie_begin`／`cancel`＋pending 鎖；`inbox_poll --once`。
2. `campaign_sortie_finish`＋battle 紀錄＋`campaign_actions` 項＋`battle_save` 拒絕；`inbox_poll --once`。
3. `src/mcp/sortie.test.ts`（見驗收 2–4）；README；`inbox_poll --once`。
4. 寫 REPORT 並回報。

測試建議找出戰點的做法：`runCampaign({ db, world, seed, months:1, policy:"greedy", battle: defaultBattleRunner })` 的 `commands` 裡找第一個 `v:"sortie"`，把它之前的指令（去掉 `battle` 欄）逐一送 `campaign_act`，就停在出戰前一刻；找不到就換 seed（先試 1–7）。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-sortie/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 互動出戰實作 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/battle.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/server.ts` |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/sortie.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-sortie/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），附「三個工具一覽」與「用 battle_act 親手打一場戰役出戰的輸出節錄（≤ 30 行）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test 'src/mcp/*.test.ts'` 0 fail（領導在沙箱外重跑），既有 MCP 測試檔未改。
2. `sortie.test.ts` 有一條：同一出戰前 state，路徑 A `campaign_act` 出戰（AI 自動）與路徑 B `campaign_sortie_begin(spectate:true)`→`battle_step_ai(until:"end")` 到結束→`campaign_sortie_finish`，兩者 `campaignHash` 相等、勝負與輪數相等。
3. `sortie.test.ts` 有一條：路徑 B（或玩家親手送至少一個 `battle_act` 的非 spectate 版）之後 `campaign_save`→`campaign_load`，新 session 的 `campaignHash`（或 view 的日期＋cash＋契約狀態）與原 session 相等。
4. `sortie.test.ts` 有一條：pending 期間 `campaign_act` 與 `campaign_advance` 回 `isError`；戰鬥未結束時 `campaign_sortie_finish` 回 `isError`；`campaign_sortie_cancel` 後戰役 `campaignHash` 與 begin 前相同。
5. `npm run typecheck` exit 0（若紅燈只來自別線檔案，REPORT 列出錯誤行，不算本條失敗）；REPORT 存在且四段齊。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好（例如 hash 對不上且查不出原因）→ 發 `FAILED`，REPORT 寫證據（兩邊 hash、第一個分歧的戰鬥事件或 state 欄位）。
- **測不出來**（沙箱擋、別線半成品擋住）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pt-sortie`。本線團隊：`teams/playtest`。上線先發 `wf/tools/inbox_mail.sh cx-pt-sortie --up PROGRESS 'cx-pt-sortie 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-pt-sortie --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-sortie/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
