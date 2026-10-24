# 任務：營運層戰鬥接口——`src/ops/sortie`（Sortie → ScenarioDef → runBattle → applyBattleResult）

> 領導 `lead-impl-ops` 寫給 codex 工人 `cx-ops-sortie`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（§3 慣例、§4 繞法、§5 交付形狀），照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md`、四份 REPORT `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-{foundation,world,crew,text}/REPORT.md`（介面摘要）、`src/ops/state/types.ts`、`src/ops/{world,contracts,crew}/index.ts`；spec `wf/workflows/planning/specs/ops/battle-interface.md`、`data-model-roster-repair.md`、`architecture-ops.md`；core `wf/workflows/planning/specs/core/data-model-world.md`（ScenarioDef、UnitSpawn）、`rules-battle-flow.md`（BattleResult）；`src/sim/index.ts`、`src/sim/run.ts` 的 `scenarioToSetup`／`runBattle` 簽名、`src/core/types-def.ts` 的 `ScenarioDef`——親自讀。

## 背景與唯一目標

營運層的世界、契約、船務、文字層都已在 main；sim 線的 `runBattle` 也在。唯一目標：出戰三步——`validateSortie`、`generateScenario`、`applyBattleResult`——再加一個把它們串起來的 `runSortie`，讓營運層能真的打一場、把戰果寫回。

## 使用者新裁示（2026-10-24，優先於 spec）

生物系分「屍體改裝」與「活捕」；活捕**沒有馴化、餵養、飼料、飢餓、獸欄**，怪獸意識不算人物。所以：`validateSortie` 不檢查 `taming`／拘束裝置／獸欄；活捕的怪獸一律無座位、本能控制出戰；`hunger → instinct`、`bond → burdenLimit` 兩條注入不做；回寫 `captured` 不建 `PenState`，改把該機甲放進 `s.mechs`＋`hangar.bays` 空位（沒空位就進 `NodeState.wreckage`），標 `// TODO(2026-10-24 裁示)`。REPORT 加「TODO（活捕裁示）位置清單」。

## 範圍（排除法寫死）

- 只做：
  - `src/ops/sortie/validate.ts`：`validateSortie(s, ctx, sortie): CmdResult`（battle-interface 一節的每條合法性；無座位獸出戰 `controlMode` 用 core 現有 `ControlMode` 裡給怪獸本能控制的那個值，查 `src/core/types-def.ts`）。
  - `src/ops/sortie/scenario.ts`：`generateScenario(s, ctx, sortie): ScenarioDef`（地圖由 `encounters/` 模板合成、敵方由契約快照預算抽 `monster/*`、目標由契約模板展開、`injected` 照 contract §4 改以 `PersonState.effects` 預掛、戰鬥 seed 由 `s.rng` 抽並寫進 `ScenarioDef.seed`）。生成的 ScenarioDef 必須能被 `scenarioToSetup(db, def, seed)` 接受。
  - `src/ops/sortie/apply.ts`：`applyBattleResult(s, ctx, sortie, result: BattleResult): void`——八組回寫逐組做（battle-interface 三節）。**戰前損傷**：`UnitInit` 帶不進部位損傷，所以回寫機甲／人物時用「差分」：`戰後值 = 戰前營運值 − (開戰時滿值 − 戰果值)`（下限 0，標 `SPEC-GAP`）。契約結算呼叫 contracts 模組的計功／結算函式、裂縫轉移呼叫 world 模組的戰果轉移函式（名字照它們 REPORT）；`BattleResolved` 事件 payload 帶 `hash`、`rounds`、`winner`。
  - `src/ops/sortie/run.ts`：`runSortie(s, ctx, sortie, opts?: { maxSteps?: number }): CmdResult & { result?: BattleResult }`＝validate → generate → `scenarioToSetup` → `runBattle`（雙方 AI）→ apply；`index.ts` 匯出全部。
  - 測試：`src/ops/sortie/*.test.ts`。
- 不做：`src/ops/` 的 `state/ content/ world/ contracts/ crew/ text/ time/ sim/`（`cx-ops-time` 同時在寫 `time/`、`sim/`；別模組缺函式或有 bug → 在 sortie 內寫區域小工具並標 `SPEC-GAP`、寫進 REPORT，不改他人檔）；`src/` 其他目錄（`src/sim/` 只 import 不改）、`schemas/`、`test/`、`package.json`、`content/`（內容缺 → REPORT）；`legacy/`、`wf/`（REPORT 與 inbox 除外）。
- 件數 gate：新增檔合計超過 15 個就停下回報；容量 gate：本線 diff 超過 120 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **8** 個 `test()`：validate 2（座位人物已死被拒；機甲不在機庫被拒）、scenario 2（`newCampaign`＋一份接下的 clear 契約 → ScenarioDef 被 `scenarioToSetup` 接受；同 state 同 rng 產出深相等）、apply 3（用手工 `BattleResult`：alive 機甲差分回寫且不補滿；敵方 anchor dead → 裂縫 `unanchored`、契約 heads 同一單位只算一次；loot 材料經 `post` 且 `checkLedger` 空）、run 1（`runSortie` 真打一場到 `stopped` 非 `maxSteps` 以外的錯，事件日誌有 `BattleResolved`）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`；`npm run typecheck`；`npm run check`；`node src/ops/content/check.ts content/base`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-sortie --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `npm run sim -- --help` | 看 sim CLI 怎麼跑一場（只讀參考） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ops-sortie/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內計數不準不算阻塞；`src/ops/time`、`src/ops/sim`（同時在寫）或 `src/sim`、`src/rules`、`test/` 的紅燈 → 不是你的事、不改；`runBattle` 本身拋錯 → 在 REPORT 附重現步驟，該測試標 `todo` 並說明。

## 工作

1. `validate.ts`＋測試；`inbox_poll --once`。
2. `scenario.ts`＋測試；`inbox_poll --once`。
3. `apply.ts`＋測試；`run.ts`＋測試。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-sortie/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-sortie/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「匯出函式清單」（每個一行簽名）、「需要別模組或 core 補的東西」與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `src/ops/sortie` 0 fail 且恰好 8 個 `test()`（`todo` 須在 REPORT 說明原因）；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `grep -rn "src/rules\|src/ai\|rules/index\|ai/index" src/ops/sortie` 0 命中（只准經 `src/sim/index.ts`；`BattleResult`／`BattleSetup` 型別用 `RunResult` 的 `result` 欄去掉 null（`NonNullable` 包一層）、`SimSetup["setup"]` 推導，不 import rules）。
3. `src/ops/sortie/` 以外無本線改動。
4. `validateSortie`、`generateScenario`、`applyBattleResult`、`runSortie` 從 `src/ops/sortie/index.ts` 匯出。
5. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-sortie`。本線團隊：`teams/ops`。上線先發 `wf/tools/inbox_mail.sh cx-ops-sortie --up PROGRESS 'cx-ops-sortie 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-sortie --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-sortie/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
