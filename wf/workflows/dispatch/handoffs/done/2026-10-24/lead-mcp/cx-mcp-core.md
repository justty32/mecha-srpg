# 任務：做 stdio MCP server 的協定層與全部戰鬥工具（含測試、端對端與 socket CLI）

> 領導 `lead-mcp` 寫給 codex 工人 `cx-mcp-core`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。程式背景：`src/mcp/tool.ts`（**凍結契約，領導寫的，不准改**）、`src/sim/session.ts`（逐步互動 API）、`src/sim/run.ts`、`src/sim/save.ts`、`src/ui-adapter/vm/viewmodel.ts`（如何把 state 整理成可讀快照，照抄思路即可）、`src/ui-adapter/vm/text.ts`＋`labels.ts`（事件→中文，可直接 import）、`src/ai/rules-query.ts`（`session.rulesQuery` 的介面：`pathTo`、`hitChance`、`abilityRange`、`partDefs`、`layerDefs`…）。

## 背景與唯一目標

使用者要「做個 MCP server，讓 agent 能夠控制、自己玩、自己測試」。本線唯一目標：**一個零執行期依賴的 stdio MCP server，agent 能用戰鬥工具從開場打到分出勝負**。營運工具（`src/mcp/campaign.ts`）與截圖工具（`src/mcp/ui.ts`）由別的工人同時做，你只在 server.ts 把它們的 `createCampaignTools(env)`／`createUiTools(env)` 串進來（它們現在是回傳 `[]` 的 stub，**不准改這兩個檔**）。

## 範圍（排除法寫死）

- 只做（全部新檔，在 `src/mcp/`）：
  - `protocol.ts`：JSON-RPC 2.0、換行分隔 stdio（一行一則 JSON，回應不得含換行）。`createServer({ tools, name, version })` 回傳 `{ handle(line: string): Promise（字串或 null） }`（null＝不回應）。方法：`initialize`（回 `protocolVersion`：用戶端要求的若在支援清單 `["2025-06-18","2025-03-26","2024-11-05"]` 內就照回，否則回 `"2025-06-18"`；`capabilities: { tools: { listChanged: false } }`；`serverInfo`；`instructions` 一段中文說明怎麼開始玩）、`notifications/initialized`（以及任何沒有 `id` 的 notification）不回應、`ping` 回 `{}`、`tools/list`（`{ tools: [{ name, title, description, inputSchema }] }`，不分頁）、`tools/call`。錯誤碼：畸形 JSON `-32700`（id null）、不是合法 request `-32600`、未知方法 `-32601`、未知工具名或 params 形狀錯 `-32602`；**工具參數不合 schema 或 handler 丟錯 → 不是 JSON-RPC error，而是 result `{ content, isError: true }`**（MCP 規定）。batch（陣列）回 `-32600`。
  - `schema.ts`：照 `tool.ts` 的 `JsonSchema` 子集做參數檢查，錯誤訊息中文、帶欄位路徑。
  - `server.ts`：入口，`package.json` 由領導加 `"mcp": "node src/mcp/server.ts"`。`createEnv()`＋`createBattleTools`＋`createCampaignTools`＋`createUiTools` → `createServer`；`node:readline` 逐行讀 stdin、寫 stdout；**stdout 只寫協定訊息，log 一律 stderr**；`if (import.meta.main)` 才啟動，並匯出 `createMcpServer(env?)` 給測試用。stdin 關閉時乾淨結束。
  - `battle.ts`（＋需要時 `battle-view.ts` 放格式化）：`createBattleTools(env)`，session 表放 closure（id `b1`、`b2`…，可同時多場）。只用 `src/sim/`（`createSession`、`runBattle`、`scenarioToSetup`、`createSave`、`serializeSave`、`parseSave`）、`src/core/`、`src/content/`、`src/ui-adapter/vm/text.ts`、`labels.ts`；**不 import `src/rules/`、`src/ai/`**（型別也不行；要的查詢都經 `session.rulesQuery`）。工具：
    - `battle_list_scenarios`：每個情境的 id、地圖尺寸、各 slot（陣營、單位數）、回合上限、目標種類。
    - `battle_new(scenario, seed?, playerSlot?, spectate?, rounds?, autoAdvance?)`：seed 預設情境的 `seed` 再預設 1；`playerSlot` 預設 `"player"`（不存在就第一個 slot）；`spectate:true`＝全 AI、可看全部單位；`autoAdvance` 預設 true＝建立後與每次 `battle_act` 後自動推進 AI 到輪到玩家或結束。回 session id＋與 `battle_observe` 相同的簡要觀察。
    - `battle_observe(id, detail?: "brief"|"full", map?: boolean, window?: {x,y,w,h})`：回合／上限、輪到誰（單位 id、名稱、是否玩家回合）、勝負；我方單位（位置、狀態、控制、AP 等資源池、效果、各部位與層 hp／max、破損、乘員士氣）；敵方只給玩家陣營**知識**範圍內的（visible 的即時值；不可見的給最後所見位置與「最後所見第 N 輪」，照 `viewmodel.ts` 的 `unit()` 思路）；`spectate` 時全部單位都給。`brief` 每台一行摘要字串＋總 hp％；`full` 給部位層細節。`map:true` 給 ASCII 格網：上方與左側印座標（每 5 格標數字），地形用 terrain 的 glyph，單位用單字母代號（我方大寫 A、B…、敵方小寫，legend 對照單位 id），出口格、不可見以 `?`；地圖大於 40×40 時只印 `window`（預設以當前行動者為中心 40×40）。
    - `battle_legal_actions(id, unit?)`：以 `session.legalActions()` 為底，整理成 agent 可直接回傳的清單：移動（可達格與 AP 成本；格子多時壓成 `"x,y:cost"` 字串陣列），每個能力（名稱、消耗、射程、冷卻／不可用原因）與每個合法目標（目標單位名、部位名、距離、`rulesQuery.hitChance` 命中率），待機（wait）、結束（end）、撤離（retreat）、棄機（eject）。**每個選項帶 `action` 物件，原樣傳給 `battle_act` 就能執行**。
    - `battle_act(id, action)`：`action` 接受 core `Command` 原形（`actor` 可省略＝當前行動者），另接受簡寫 `{ kind: "move", to: {x,y} }`（server 用 `rulesQuery.pathTo` 補 path）。不合法時 `isError`，訊息用 `rejectionText`（中文）＋提示呼叫 `battle_legal_actions`。成功時回：這一步的事件中文行、（autoAdvance 時）AI 推進產生的事件中文行（只列玩家看得到的；超過 40 行截斷並說還有幾行）、現在輪到誰、勝負。
    - `battle_step_ai(id, until?: "command"|"unit"|"human"|"end", max?)`：預設 `"human"`；`"unit"`＝跑完一台 AI 的單位回合（注意 sim `stepAi` 在回合末會多回一次 `null`，照 `src/ui-adapter/vm/session.ts` 的 `stepAi` 重試一次的做法）；`max` 預設 2000 成功指令。回推進了幾個指令、事件摘要、現在狀態。
    - `battle_auto(scenario, seed?, rounds?)`：`runBattle` 全 AI 跑完，回勝負、原因、輪數、`stopped`、各 slot 存活數、事件計數、指令數、hash（與 `npm run sim -- --scenario … --seed …` 印的 hash 必須相同）。
    - `battle_save(id, path?)`：`createSave`（scenario、seed、commands、setup）包一層 `{ format: "mecha-srpg-mcp-battle/1", playerSlot, spectate, autoAdvance, rounds, save }`；有 `path`（相對專案根或絕對）就寫檔，否則把字串放在回傳。`battle_load(save? | path?)`：重建新 session：同 setup／seed 建 session，逐條重播紀錄指令——玩家回合用 `submit`，AI 回合用 `stepAi` 並斷言產生的指令與紀錄相同，最後 hash 必須等於存檔時（存進 wrapper 的 `hash` 欄）；回新 id。
    - `battle_events(id, since?, limit?)`：事件中文行（seq、輪、文字），玩家視角下只列看得到的；回 `next` 游標。`battle_close(id)`。
  - `cli.ts`：給沒有 MCP 用戶端的 agent／人用的開發用客戶端，零依賴：`node src/mcp/cli.ts serve --socket SOCK`（同一行程內 `createMcpServer()`，在 unix socket 上收發同樣的換行 JSON-RPC，前景常駐）；`node src/mcp/cli.ts call --socket SOCK TOOL ['JSON']`（自動送 initialize、印 content 的 text，`isError` 時 exit 1）；`node src/mcp/cli.ts list --socket SOCK`。
  - 測試（`src/mcp/*.test.ts`，會被 `npm test` 的 `src/**/*.test.ts` 撿到）：協定層（initialize 版本協商、tools/list 每個工具都有 name／description／`inputSchema.type==="object"`、tools/call 正常與 isError、未知工具 `-32602`、未知方法 `-32601`、畸形 JSON `-32700`、notification 不回應、ping）、schema 檢查、每個戰鬥工具至少一條、`cli.ts` 一條（serve＋call）。**端對端** `src/mcp/e2e.test.ts`：`child_process.spawn(process.execPath, ["src/mcp/server.ts"])` 走 stdio，`battle_new`（skirmish、seed 1、rounds 3、autoAdvance:false）→ 迴圈：玩家回合 `battle_observe`→`battle_legal_actions`→挑一個動作（有可打的目標就打第一個，否則移動到第一個可達格一次，再不行就 end）→`battle_act`；AI 回合 `battle_step_ai(until:"human")`；直到分出勝負或回合上限。斷言：有結束、玩家至少送了 3 個指令，且 hash 等於 `runBattle({ players: { player: { kind: "script", commands: 該場玩家的成功指令 } } })` 的 hash；另一條斷言 `battle_auto` 的 hash 等於直接 `runBattle` 的 hash。
- 不做：`src/mcp/tool.ts`、`campaign.ts`、`ui.ts`；`src/sim/`（**不改**；真缺函式就停下發 `BLOCKED` 說要什麼）、`src/ops/`、`src/rules/`、`src/ai/`、`src/core/`、`src/content/`、`src/ui-adapter/`、`content/`、`test/`、`package.json`、`.mcp.json`、README 與任何 wf 文件（REPORT 除外）。
- 件數 gate：新增檔超過 14 個就停下回報；容量 gate：`src/mcp/` 新增程式碼超過 120 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-mcp-core --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test src/mcp/` | 本線測試 |
| `npm run typecheck` | 型別（邏輯層 tsconfig 已含整個 src） |
| `npm run sim -- --scenario scenario/skirmish-whitegloves --seed 1` | 對照 `battle_auto` 的 hash |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 `src/mcp/` 新檔與你的 REPORT；臨時檔放 `/tmp/cx-mcp-core/`。可跑 `node`、`node --test`、`npm test`、`npm run typecheck`、`npm run check`、`npm run sim`。**不要 commit**（工作樹與 index 有別線未提交的改動；commit 由領導做），REPORT 列檔案清單。
- 工作樹裡 `src/ops/`、`content/base/` 有別線（`lead-ops-bio-balance`）未提交的改動：**不要碰、不要 restore**；它們造成的別處紅燈不是你的事，寫進 REPORT 即可。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`；不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**（不准 `@modelcontextprotocol/sdk` 或任何新依賴，只用 node 24 內建）；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網（MCP 規格照本交接書寫的即可）。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts`、unix socket 被沙箱擋 → 發 `BLOCKED`（socket 被擋時 `cli.ts` 的測試標 `skip` 並註明，不算阻塞）；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. `protocol.ts`、`schema.ts`、`server.ts` 骨架＋協定測試；`inbox_poll --once`。
2. `battle.ts`（＋`battle-view.ts`）與各工具測試；`inbox_poll --once`。
3. `e2e.test.ts`、`cli.ts`＋測試；自己用 `cli.ts` 打一場 skirmish 看輸出好不好讀，明顯難讀的修掉；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-core/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 協定層、戰鬥工具、CLI、測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-core/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），附「工具一覽」表（名稱、參數、回傳重點）與一段「自己用 cli 打一場的輸出節錄（≤ 40 行）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `node --test src/mcp/` 0 fail（領導在沙箱外重跑）。
2. `npm run typecheck` exit 0。
3. `src/mcp/` 沒有任何 import 指向 `src/rules/`、`src/ai/`、`src/ops/`（`grep -rnE "from \"\.\./(rules|ai)/|\.\./\.\./(rules|ai)/" src/mcp/` 零命中；`src/ops/` 只准 `tool.ts`／`campaign.ts` 用）；`package.json` 沒有新依賴。
4. `e2e.test.ts` 的兩條 hash 斷言存在且通過。
5. 手動：`printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' '{"jsonrpc":"2.0","method":"notifications/initialized"}' '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node src/mcp/server.ts` 印出恰好兩行合法 JSON，stdout 沒有其他雜訊。
6. REPORT 存在且有四段＋工具一覽＋輸出節錄。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（沙箱擋、node 跑不了）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mcp-core`。本線團隊：`teams/mcp`。上線先發 `wf/tools/inbox_mail.sh cx-mcp-core --up PROGRESS 'cx-mcp-core 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-mcp-core --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-core/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
