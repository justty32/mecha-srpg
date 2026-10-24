# 任務：營運層船務與人員——`src/ops/crew`

> 領導 `lead-impl-ops` 寫給 codex 工人 `cx-ops-crew`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（§3 慣例、§4 繞法、§5 交付形狀），照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md`、地基 REPORT `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation/REPORT.md`（介面摘要）、`src/ops/state/types.ts`；spec `wf/workflows/planning/specs/ops/` 的 `data-model-roster-repair.md`、`data-model-economy-research.md`、`time-and-tick.md`、`architecture-ops.md`；core 的 `wf/workflows/planning/specs/core/data-model-people.md`（HumanGrowth、soulTree）——親自讀。

## 背景與唯一目標

地基（型別、帳本、載入器、開局）已在 main。本線與 `cx-ops-world`、`cx-ops-text` 同時跑，三者領地互斥。唯一目標：把名冊、薪水、招募、醫務、工時佇列、機庫、獸欄與族行為、科研、機魂開／練熟、命名、債的利息與付款做成 contract §5 形狀的段函式與指令處理。

## 範圍（排除法寫死）

- 只做：
  - `src/ops/crew/`：`roster.ts`（mood、離隊檢定、死亡登記、回船升級）、`wages.ts`（`ledgerDaily6`：全團應付合計、`cash` 不足等比例欠薪、飼料、泊費、租金；大潮第 1 天利息入 `debt`；`cmdPay`）、`recruit.ts`（弦月刷新池、`cmdHire`／`cmdFire`；聘金經 `post`）、`medbay.ts`（hp 回復、暫時傷時鐘 −1）、`workqueue.ts`（每日工時、按 priority 灌注、材料開工時一次扣不夠不開、`cmdQueue`／`cmdReorder`；修理係數讀 `world/jobs/`）、`hangar.ts`（`cmdAssign`、古代機甲座位鎖定、withering）、`stable.ts`（餵、馴化、hunger、族行為日程 molt／brood／mutate、`cmdFeed`）、`research.ts`（工時＋付幣完成、解鎖）、`soul.ts`（開節點、`cmdAccompany` 練熟 mastery ∈ [0,1]、trust）、`names.ts`（`cmdWake` 大潮之夜限定、共鳴門檻、成功推命名 `Prompt`（三候選依認主者 `culture` 抽＋自填）、`applyName`）、`index.ts`（匯出 `shipDaily5` 等段函式與 `cmd*`）。
  - `content/base/world/` 的 `backgrounds/ recruit-pools/ research/ jobs/ names/ services/`：**只准新增檔**；既有檔只准為修正錯誤而改，並寫進 REPORT。
  - 測試：`src/ops/crew/*.test.ts`。
- 不做：`src/ops/` 的 `state/ content/ world/ contracts/ text/ time/ sortie/ sim/`（`types.ts` 要加欄位 → 先在自己模組內定義區域型別、標 `SPEC-GAP`、寫進 REPORT）；`src/` 其他目錄、`schemas/`、`test/`、`package.json`、`content/base/` 的上列以外資料夾；`legacy/`、`wf/`（REPORT 與 inbox 除外）。
- 件數 gate：新增＋修改檔合計超過 45 個就停下回報；容量 gate：本線 diff 超過 200 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **14** 個 `test()`：wages 3（等比例欠薪且 mood −1；大潮第 1 天利息；`cmdPay` 兩筆帳且 `checkLedger` 空）、workqueue 3（灌注順序依 priority；材料不足不開工也不扣；rebuild 工時×3）、stable 3（餵食累 tameDays 到 tamed；挨餓 hunger 上升；一種族行為日程）、soul 2（開節點後 mastery 0；陪伴累積且永不超過 1）、names 2（非大潮日 `cmdWake` 被拒且 state 不變；成功後推命名 Prompt、`applyName` 寫 `names[mech]` 與 `Named` 事件）、recruit 1（`cmdHire` 扣聘金、名冊多一人、id 決定性）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`；`npm run typecheck`；`npm run check`；`node src/ops/content/check.ts content/base`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-crew --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 改內容後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ops-crew/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內計數不準不算阻塞；`src/ops/world`、`src/ops/contracts`、`src/ops/text`（同時在寫）或 `src/sim`、`test/sim` 的紅燈 → 不是你的事、不改。

## 工作

1. `wages.ts`、`roster.ts`、`recruit.ts`、`medbay.ts` 與測試；`inbox_poll --once`。
2. `workqueue.ts`、`research.ts`、`hangar.ts` 與測試；`inbox_poll --once`。
3. `stable.ts`、`soul.ts`、`names.ts` 與測試；補內容。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-crew/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/crew/` |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/` 的六個資料夾 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-crew/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「給 tick 編排的段函式與指令處理清單」（每個一行簽名）、「想加進 types.ts 的欄位」與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `src/ops/crew` 0 fail 且恰好 14 個 `test()`；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `node src/ops/content/check.ts content/base` exit 0。
3. `grep -rn "src/rules\|src/ai" src/ops/crew` 0 命中；`src/ops/state/`、`src/ops/content/` 無本線改動。
4. 段函式與 `cmd*` 照 contract §5 命名並從 `src/ops/crew/index.ts` 匯出。
5. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-crew`。本線團隊：`teams/ops`。上線先發 `wf/tools/inbox_mail.sh cx-ops-crew --up PROGRESS 'cx-ops-crew 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-crew --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-crew/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
