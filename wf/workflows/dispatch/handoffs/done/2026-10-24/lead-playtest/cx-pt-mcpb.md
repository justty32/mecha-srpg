# 任務：改善 MCP 戰鬥工具的資訊輸出與小 bug（目標、敵我判定、地圖字母、預期傷害、cli 解耦）

> 領導 `lead-playtest` 寫給 codex 工人 `cx-pt-mcpb`。**交接書是唯一契約**。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。 程式背景：`src/mcp/README.md`、`src/mcp/battle.ts`、`src/mcp/battle-view.ts`、`src/mcp/cli.ts`、`src/mcp/battle.test.ts`、`src/sim/session.ts`（`rulesQuery`、`preview`、`state.rt`）、`src/rules/objectives.ts`（目標判定、`holdProgress`、`exits`）、試玩回報 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/r1/p2.json`、`p3.json`、`p4.json`、`p5.json`、問題表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/issues.json`（本線負責 ISS-003、004、014、015、016、017、018 的 MCP 部分、019、020、021）。

## 背景與唯一目標

六個試玩 agent 用 MCP 玩全部情境，最大的抱怨是「看不到任務目標」「最近敵方把友軍算進去」「地圖字母撞字」「不知道打下去會造成多少傷害」。本線唯一目標：**讓 agent 只看 MCP 輸出就能做出正確的戰術決定**，並修掉 p5 回報的工具小 bug。

## 規格（寫死）

1. **目標**（ISS-003）：`battle_new`／`battle_observe` 的摘要與 JSON 加 `objectives`：每條 `{kind, for, onComplete, text, progress}`，中文 text 例：「我方勝：擊殺 鐮肢〔enemy-0〕、鐮肢〔enemy-3〕（剩 2／3）」「我方勝：守住區域 x14–17,y15–18（16 格）連續 8 輪（目前 3／8；區內有敵方則歸零）」「我方勝：護送 convoy-0、convoy-1 到出口（出口 6 格：…）」「我方勝：撐過第 10 輪（剩 4 輪）」「敵方勝：殲滅我方與 ally」。資料來自 `session.state.rt.objectives`（執行期 unit id）、`rt.holdProgress`、`rt.exits`、`maxRounds`。敵方目標單位若不在視野內只給「最後所見 (x,y)」或「位置未知」，不洩漏即時位置；自軍與盟軍目標一律可見。摘要每條一行、放在單位列表前。
2. **敵我判定**（ISS-004、021）：`nearestEnemy` 與「沒有合法目標」原因只算**敵對**單位（用 sim/rules 對外查詢的敵對判定，例如 `rulesQuery` 有的 hostile／allies 判斷；沒有就用 `state.factions`／情境 allies 推）；`battle_legal_actions(unit)` 的 `playerTurn` 只在該 unit 是當前行動者且是人類回合時為 true；查詢非當前行動者的敵方單位不回它的 nearestEnemy／能力細節。
3. **地圖**（ISS-014、015、016）：ASCII 地圖的單位符號與地形符號集合**不相交**（例如單位用 A–Z／a–z 以外的固定集合或保留大寫給單位、地形改用符號與小寫，由你定，但要有測試證明不相交）；出口格是地圖靜態資訊，**不受迷霧遮蔽**一律畫出；legend 對地形列出效果摘要（掩蔽值、移動成本、施加效果名稱與一句說明，來自內容 db 的 terrain／effect 定義），全域效果（潮汐、光照等 `map.globals`）在 observe 摘要列一行現況。
4. **預期傷害**（ISS-017）：`battle_legal_actions` 每個有單位目標的項加 `damageIfHit`（命中時的預估傷害，套用內容 db 的 `rules/damage-modifiers`，例如 conventional-arms 對 kaiju ×0.1；可用 sim 已有的查詢函式就用，沒有就在 MCP 端依 packets×修正表估算，註明為估算），摘要行顯示「命中 24%／約 0.8」。
5. **數字與名稱**（ISS-018 MCP 部分）：MCP 輸出的所有事件行、單位狀態中的浮點數四捨五入到 1 位小數（只改顯示，不改 state）；效果、能力、地形 id 外露時改用內容 db 的 `name`，找不到 name 才去掉前綴顯示；`eject`／`retreat` options 的摘要標「不可逆」。
6. **視野**（ISS-019）：自軍與盟軍單位一律列出（即使不在玩家視野）；曾見過的敵方離開視野後仍以「最後所見 (x,y)、第 N 輪」列出（stale 標記），不從列表消失。
7. **小 bug**（ISS-021）：`battle_events` since 超過尾端時 `next` 不得小於 since；移動失敗分出「不可達／目標格被佔／ap 不足」三種原因；`battle_load` 壞 JSON 回中文錯誤；`battle_new` playerSlot 不存在時錯誤訊息列出可選 slot。
8. **cli 解耦**（ISS-020）：`node src/mcp/cli.ts call|list` 不得 import `server.ts` 或任何遊戲模組（`serve` 改用動態 `import()`），讓別人工作樹改到一半時 call 仍可連上已在跑的 server。

## 範圍（排除法寫死）

- 只做：`src/mcp/battle.ts`、`src/mcp/battle-view.ts`、`src/mcp/cli.ts`、`src/mcp/README.md`、新測試檔 `src/mcp/battle-info.test.ts`；既有 `src/mcp/battle.test.ts`、`cli.test.ts`、`e2e.test.ts` 只在斷言依賴被本線刻意改掉的輸出格式時最小修改（REPORT 逐條列出改了哪個斷言、為什麼）。
- 不做：`src/mcp/campaign*.ts`（另一工人 `cx-pt-mcpc` 同時在改）、`src/mcp/server.ts`、`tool.ts`、`protocol.ts`、`schema.ts`、`ui.ts`、`sortie.test.ts`；`src/rules/`、`src/sim/`、`src/ai/`、`src/ops/`、`src/core/`、`src/ui-adapter/`、`content/`、`test/`、`package.json`、`wf/`。`battle_auto` 的 hash 與 `npm run sim` 必須維持相同（只改輸出，不改推進）。
- 件數 gate：新增檔超過 1 個（不含 REPORT）就停下回報；容量 gate：本線淨增程式碼超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-pt-mcpb --once` | 每完成一個工作步驟跑一次，讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test 'src/mcp/*.test.ts'` | 本線測試 |
| `npm run typecheck` | 型別 |
| `node src/mcp/cli.ts serve --socket x.sock`＋`call` | 自己實際看輸出（socket 放你的臨時目錄，路徑要短） |


## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；臨時檔放 `/tmp/cx-pt-mcpb/`。可跑 `node`、`node --test`、`npm run typecheck`、`npm run check`。**不要 commit**（commit 由領導做），REPORT 列檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導在沙箱外重跑）。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpb/REPORT.md`，不要只貼在回覆裡。**（在 worktree 時寫到 worktree 內同一相對路徑，領導會搬。）

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 戰鬥工具改動 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/battle.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/battle-view.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/cli.ts` |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/battle-info.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpb/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（沙箱擋）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pt-mcpb`。本線團隊：`teams/playtest`。上線先發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pt-mcpb --up PROGRESS 'cx-pt-mcpb 上線開工' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pt-mcpb --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpb/REPORT.md（在 worktree 時用 worktree 內那份的絕對路徑）`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記。

## 工作

1. 規格 1、6（目標、視野）＋測試；`inbox_poll --once`。
2. 規格 2、3、4、5＋測試；`inbox_poll --once`。
3. 規格 7、8、README 補新欄位一段；用 cli 實際開 `scenario/glade-spore-hold`、`scenario/waste-encirclement`、`scenario/convoy-run` 各看一次 observe／legal_actions，把難讀的修掉；`inbox_poll --once`。
4. 寫 REPORT（附三情境 observe 摘要節錄各 ≤ 12 行）並回報。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test 'src/mcp/*.test.ts'` 0 fail（領導在沙箱外重跑）；`battle_auto` 與 e2e hash 斷言未改且通過。
2. `battle-info.test.ts` 有斷言：glade-spore-hold 的 observe 含 hold 目標的區域與進度、waste-encirclement 含 killTarget 剩餘數、convoy-run 含 escort 對象與出口；ASCII 單位符號與地形符號不相交；出口在開局迷霧下仍畫出。
3. `battle-info.test.ts` 有斷言：某情境 legal_actions 的 nearestEnemy 不是友軍／盟軍；蟲類目標的 `damageIfHit` 對 conventional-arms 能力約為原值 ×0.1。
4. `cli.ts` 靜態 import 不含 `server.ts`（測試以讀檔或模組圖檢查）。
5. `npm run typecheck` exit 0；REPORT 四段齊。

不要為了「更保險」加驗其他東西。
