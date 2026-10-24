# 任務：營運層世界與契約——`src/ops/world`＋`src/ops/contracts`

> 領導 `lead-impl-ops` 寫給 codex 工人 `cx-ops-world`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（§3 慣例、§4 繞法、§5 交付形狀），照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md`、地基 REPORT `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation/REPORT.md`（介面摘要）、`src/ops/state/types.ts`；spec `wf/workflows/planning/specs/ops/` 的 `data-model-world-map.md`、`data-model-factions-contracts.md`、`time-and-tick.md`、`data-model-economy-research.md`（市場、債兩節）、`architecture-ops.md`——親自讀。

## 背景與唯一目標

地基（型別、帳本、載入器、開局）已在 main。本線與 `cx-ops-crew`、`cx-ops-text` 同時跑，三者領地互斥。唯一目標：把世界圖、裂縫、潮壓、行動牌、市場、航行、契約做成 contract §5 形狀的段函式與指令處理，供階段 3 的 `tick` 編排。

## 範圍（排除法寫死）

- 只做：
  - `src/ops/world/`：`nodes.ts`（蝕域深度、深蝕斷路、城邦失守）、`rifts.ts`（七態狀態機；只在大潮日或 `onBattleRift(s, ctx, riftId, outcome)` 時轉移）、`pressure.ts`（每日累積、大潮日泊松抽新裂縫與落點）、`actions.ts`（行動牌抽取、冷卻、消化 foundation 留的 `spawnContract`／`spawnEvent` 待處理佇列中屬契約的部分）、`market.ts`（價格公式、弦月刷新、`cmdTrade` 買賣經 `post` 兩筆）、`travel.ts`（最短天數路徑、燃料扣除、到達、淺蝕遭遇寫 `pendingBattle`、`cmdSail`／`cmdDock`／`cmdDrift`／`cmdMap`）、`explore.ts`（`cmdExplore`：遺跡逐層事件鏈的入口——推一個 `Prompt` 進 `pendingChoices`，鏈本身走 `events/ruin-*.json`）、`index.ts`。
  - `src/ops/contracts/`：`lifecycle.ts`（offered 時快照敵軍、active 並行、到期、取消追回預付或入債、`cmdBoard`／`cmdAccept`／`cmdDrop`）、`negotiate.ts`（純函式 `(state, ask, rng) → result`）、`tally.ts`（`tallyHeads(contract, unitDiedEvents)` 同一單位只算一次、`settleContract(s, ctx, id, outcome: "done"|"failed"|"partial")` 付款與 rep）、`index.ts`。
  - `content/base/world/` 的 `nodes/ routes/ rifts/ encounters/ actions/ markets/ factions-ops/ contracts/`：**只准新增檔**（例：異形或菌絲裂縫族若 core 沒有對應 species 就不加）；既有檔只准為修正錯誤而改，並寫進 REPORT。
  - 測試：`src/ops/world/*.test.ts`、`src/ops/contracts/*.test.ts`。
- 不做：`src/ops/` 的 `state/ content/ crew/ text/ time/ sortie/ sim/`（`types.ts` 要加欄位 → 先在自己模組內定義區域型別、標 `SPEC-GAP`、寫進 REPORT，由領導整合）；`src/` 其他目錄、`schemas/`、`test/`、`package.json`、`content/base/` 的上列以外資料夾；`legacy/`、`wf/`（REPORT 與 inbox 除外）。
- 件數 gate：新增＋修改檔合計超過 50 個就停下回報；容量 gate：本線 diff 超過 200 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **14** 個 `test()`：rifts 4（表格驅動的 phase × 觸發 → 期望 phase，涵蓋 opening→anchored、anchored→unanchored→anchored 且 `fedCount++`、sealing→sealed、selfClose；非大潮日不轉移）、pressure 2、nodes 1（深蝕斷路）、travel 2（路徑與燃料；途中改道）、market 2（價格公式；買賣兩筆帳且 `checkLedger` 空）、contracts 3（offered 快照不隨之後的裂縫狀態變；談判成功／失敗與 annoyance；tally 同一單位只算一頭）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`；`npm run typecheck`；`npm run check`；`node src/ops/content/check.ts content/base`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-world --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 改內容後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ops-world/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內計數不準不算阻塞；`src/ops/crew`、`src/ops/text`（同時在寫）或 `src/sim`、`test/sim` 的紅燈 → 不是你的事、不改。

## 工作

1. `rifts.ts`、`pressure.ts`、`nodes.ts` 與測試；`inbox_poll --once`。
2. `travel.ts`、`market.ts`、`explore.ts` 與測試；`inbox_poll --once`。
3. `contracts/` 三檔與測試、`actions.ts`；補內容。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-world/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/contracts/` |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/` 的八個資料夾 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-world/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「給 tick 編排的段函式與指令處理清單」（每個一行簽名）、「想加進 types.ts 的欄位」與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `src/ops/world`＋`src/ops/contracts` 0 fail 且恰好 14 個 `test()`；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `node src/ops/content/check.ts content/base` exit 0。
3. `grep -rn "src/rules\|src/ai" src/ops/world src/ops/contracts` 0 命中；`src/ops/state/`、`src/ops/content/` 無本線改動。
4. 段函式與 `cmd*` 照 contract §5 命名並從各自 `index.ts` 匯出。
5. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-world`。本線團隊：`teams/ops`。上線先發 `wf/tools/inbox_mail.sh cx-ops-world --up PROGRESS 'cx-ops-world 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-world --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-world/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
