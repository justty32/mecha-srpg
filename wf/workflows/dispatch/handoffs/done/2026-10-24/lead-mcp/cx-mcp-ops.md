# 任務：做 MCP server 的營運（戰役）工具 `src/mcp/campaign.ts` 與其測試

> 領導 `lead-mcp` 寫給 codex 工人 `cx-mcp-ops`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。程式背景：`src/mcp/tool.ts`（**凍結契約，領導寫的，不准改**）、`src/ops/sim/campaign.ts`（`runCampaign` 怎麼記錄指令與戰果）、`src/ops/sim/save.ts`、`src/ops/time/commands.ts`（`applyCommand`）、`src/ops/time/tick.ts`（`advanceDays` 遇 `pendingChoices` 會停）、`src/ops/text/render.ts`（`render` → `Screen`，含 `actions`）、`src/ops/text/parse.ts`（中文／英文文字指令 → `OpsCommand`）、`src/ops/text/verbs.ts`、`src/ops/state/types.ts` 的 `OpsCommand`／`Screen`／`CampaignState`、`src/ops/content/start.ts`（`newCampaign`）、`src/ops/sim/cli.ts`。

## 背景與唯一目標

使用者要「做個 MCP server，讓 agent 能夠控制、自己玩、自己測試」。另一個工人 `cx-mcp-core` 同時在做協定層（`protocol.ts`、`server.ts`）與戰鬥工具（`battle.ts`）；server 會呼叫你的 `createCampaignTools(env)` 把工具掛上去。本線唯一目標：**agent 能用營運工具開新戰役、看畫面、送指令、推進天數、出戰（戰鬥由 AI 自動結算）、全自動跑 N 潮月**。

## 範圍（排除法寫死）

- 只做：改寫 `src/mcp/campaign.ts`（目前是回傳 `[]` 的 stub），需要時加 `src/mcp/campaign-view.ts` 放格式化；測試 `src/mcp/campaign.test.ts`（直接呼叫 `createCampaignTools(createEnv())` 的 handler，**不經協定層**）。工具（名稱固定，session 表放 closure，id `c1`、`c2`…）：
  - `campaign_new(seed, start?)`：`start` 預設 `"default"`（不含 `/` 時前面補 `start/`，同 `runCampaign`）。回 id＋與 `campaign_view` 相同的畫面摘要。
  - `campaign_view(id, log?)`：用 `render` 產生 `Screen`，整理成精簡 JSON＋一段中文摘要：日期（`clock`）、所在房間標題與描述、`prompt`（有待選項時放最前面並明說「要先 choose」）、各 panel（ledger、roster、ship、queue、rifts、beasts…，空的省略）、自上次 view 以來的新 log 行（`log` 預設最多 20 行，多的說還有幾行）、`pendingBattle` 摘要（有的話提示可 `sortie`）。不要把整個 `CampaignState` 倒出來。
  - `campaign_actions(id)`：`Screen.actions` 逐項（label、`cmd`、key、disabled 原因）——**每項的 `cmd` 原樣傳給 `campaign_act` 就能執行**；另附（a）契約板上 `offered` 契約各一個 `{ v:"accept", contract }`、（b）有 `pendingBattle` 時一個 `{ v:"sortie", sortie:{} }`、（c）`VERBS` 動詞表（`v`、中文、grammar），提示其他指令可用 `text` 文字送。
  - `campaign_act(id, command? | text?)`：二擇一；`text` 用 `parse(text, state, world)`，`ParseError` → `isError`（附 candidates）。用 `applyCommand(state, db, world, cmd, { battle })` 執行，`battle` 為 `defaultBattleRunner` 的記錄包裝（照 `runCampaign` 的 `execute` 做法記下 `CampaignCommand`，含 `battle` 欄，供存檔重播）；失敗 → `isError`（error code＋一句中文解釋）。成功回：這一步的事件 log 行（`eventLog`）、若有出戰則戰鬥摘要（勝負、輪數、我方損失，從事件或 `pendingBattle`／結果取得）、新的畫面摘要。
  - `campaign_advance(id, days)`：等於送 `{ v:"wait", days }`；回實際推進了幾天（遇到待選項會提早停，要說明）、期間 log 行（截斷規則同上）、畫面摘要。
  - `campaign_auto(seed, months, policy, start?, battles?)`：`runCampaign`（`policy` ∈ `idle`／`greedy`／`random`；`battles` 預設 true＝用 `defaultBattleRunner`）；回每潮月摘要列、最終 cash／debt／人數、指令數、`campaignHash(state)`。
  - `campaign_save(id, path?)`／`campaign_load(blob? | path?)`：`createCampaignBlob`／`serializeCampaign`／`loadCampaign`（用同一個記錄型 battle runner 重播）；`path` 相對專案根或絕對；load 回新 id。`campaign_close(id)`。
- 只准經這些 `src/ops/` 對外函式：`newCampaign`、`createOpsCtx`（`ops/content/start.ts`）、`applyCommand`（`ops/time`）、`render`／`parse`／`eventLog`／`entityName`／`VERBS`（`ops/text`）、`runCampaign`／`defaultBattleRunner`／`campaignHash`／`createCampaignBlob`／`serializeCampaign`／`parseCampaign`／`loadCampaign`（`ops/sim`）、`dailySummary`（`ops/time/tick.ts`）與 `ops/state/types.ts` 的型別。內容用 `env.world()`。
- 不做：`src/mcp/` 除上述三檔外的任何檔（`tool.ts`、`server.ts`、`protocol.ts`、`battle*.ts`、`ui.ts` 都不是你的）；`src/ops/`（**一律不改**；另一條線 `lead-ops-bio-balance` 正在改它，工作樹裡有它未提交的改動——不要碰、不要 restore）；`src/sim/`、`src/rules/`、`src/ai/`、`src/core/`、`src/content/`、`src/ui-adapter/`、`content/`、`test/`、`package.json`、文件。互動式出戰（把營運出戰交給戰鬥工具逐步打）**不做**，寫進 REPORT「需要決定的事」。
- 件數 gate：新增檔超過 4 個就停下回報；容量 gate：新增程式碼超過 60 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-mcp-ops --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test src/mcp/campaign.test.ts` | 本線測試 |
| `npm run typecheck` | 型別 |
| `npm run sim:campaign -- --months 1 --seed 7 --policy greedy` | 對照 `campaign_auto` 的行為 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的三個 `src/mcp/` 檔與你的 REPORT；臨時檔放 `/tmp/cx-mcp-ops/`。可跑 `node`、`node --test`、`npm run typecheck`、`npm run check`、`npm run sim:campaign`。**不要 commit**（commit 由領導做），REPORT 列檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`；不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；`src/ops/` 因別線半成品而載入失敗或型別錯 → 發 `BLOCKED`（寫清錯在哪個檔、哪一行）；沙箱內 `node --test` 計數不準不算阻塞。

## 工作

1. 讀 ops API，寫 `campaign_new`／`view`／`actions`／`act`／`advance`＋測試；`inbox_poll --once`。
2. `campaign_auto`、`save`／`load`／`close`＋測試；`inbox_poll --once`。
3. 自己直接呼叫 handler 玩 30 天左右（看畫面、接契約、出戰、推進），把難讀的輸出修掉；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-ops/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 營運工具與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-ops/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），附「工具一覽」表與「試玩 30 天的輸出節錄（≤ 40 行）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test src/mcp/campaign.test.ts` 0 fail（領導在沙箱外重跑），且每個工具至少一條測試。
2. `npm run typecheck` exit 0（若紅燈只來自別線的 `src/ops/` 半成品，REPORT 列出錯誤行，不算本條失敗）。
3. 測試中有一條斷言：`campaign_auto(seed 7, months 1, policy "greedy")` 回的 hash 等於直接 `runCampaign` 同參數後 `campaignHash(state)`。
4. 測試中有一條：`campaign_new` → `campaign_actions` 取一個未 disabled 的 `cmd` → `campaign_act` 成功 → `campaign_save` → `campaign_load` → 兩者 `campaign_view` 的日期與 cash 相同。
5. REPORT 存在且有四段＋工具一覽＋試玩節錄。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（沙箱擋、node 跑不了、別線半成品擋住）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mcp-ops`。本線團隊：`teams/mcp`。上線先發 `wf/tools/inbox_mail.sh cx-mcp-ops --up PROGRESS 'cx-mcp-ops 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-mcp-ops --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-ops/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
