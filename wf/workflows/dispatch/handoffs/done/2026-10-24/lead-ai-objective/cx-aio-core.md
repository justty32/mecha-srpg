# 任務：讓戰鬥 AI 依情境目標評分（killTarget／孵化源、hold、escort、reachExit、友軍共享目標）

> 領導 `lead-ai-objective` 寫給 codex 工人 `cx-aio-core`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。spec：`wf/workflows/planning/specs/core/ai.md`（全篇，53 行）、`wf/workflows/planning/specs/core/data-model-world.md` 的「同盟、敵對與全局值」段。程式：`src/ai/` 全部（約 1000 行）、`src/rules/objectives.ts`（目標怎麼判定完成——**AI 的行為要對準這裡的判定**）、`src/sim/run.ts` 的 `scenarioToSetup`（`target`→`units` 翻譯）、`src/ops/sortie/scenario.ts` 第 110–125 行附近（營運戰場的 hold 區＝敵方部署區整欄）。

## 背景與唯一目標

現在的 AI 評分（`src/ai/score.ts` `scoreCandidate`）只看「打誰傷害價值高、往最近的敵人靠」，完全不讀 `BattleState.rt.objectives`：killTarget 不優先殺目標、不優先殺會孵生的單位（巢母）、hold 不進區、escort／reachExit 不往出口走、盟軍 slot 不配合玩家的目標。**唯一目標：AI 讀取規則層已有的公開目標狀態，把目標折進候選評分與候選生成，權重全部走 aiprofile params 可調。**

## 設計（領導定，照做；細節你可微調，但偏離要寫進 REPORT）

新檔 `src/ai/objectives.ts`，純函式，只讀 `ctx.view`（知識狀態）與 `view.rt.objectives`／`view.rt.exits`／`view.map`（地圖與目標是公開資訊）；**不讀 `ctx.s` 上視野外的單位**。

1. **目標分邊**：`o.for === slot` 或 `!isHostileSlot(q, view, slot, o.for)`（同盟）＝**友方目標**；`o.for` 與 slot 敵對＝**敵方目標**。只取 `onComplete` 為 `"win"` 或 `"continue"` 的。`rt.objectives` 為空時規則用每個 slot 的隱含 eliminate（見 `evaluateObjectives`），照同樣解讀。
2. **`objectiveInfo(q, view, slot)`**（以 view 物件為鍵用 `WeakMap` 快取，同一決策快照只算一次）回傳：
   - `killBonus`（單位 id → 加成）：友方 killTarget 的 `params.unit`／`params.units` → `+objKill`；**孵化源**（敵對、在 view 裡、`partDefs` 有 `functions` 含 `"spawner"`，或 `unitTags` 含 `"spawner"`，或 `abilitiesOf` 有能力 `tags` 含 `"spawn"`／`"summon"`）→ `+objSpawner`；站在友方 hold 區內的敵對單位 → `+objZoneClear`；敵方 escort／reachExit 的目標單位 → `+objIntercept`。
   - `spare: Id[]`：友方 capture 目標（打殘可以，打死是負分）。
   - `holdZones: Cell[][]`（友方 hold 的 `params.zone`）、`contestZones: Cell[][]`（敵方 hold 的 zone）。
   - `exitUnits: Id[]`：友方 reachExit／escort 的目標單位裡屬於 slot 自己的。
   - `escortees: Id[]`：友方 escort 的目標單位（任何友方 slot）。
   - `interceptUnits: Id[]`：敵方 escort／reachExit 的目標單位（在 view 裡的）。
3. **目標價值倍率** `objectiveTargetFactor = 1 + killBonus[id]`：乘進 `score.ts` 的 `valueWithFocus`（候選評分與 `strategy.ts` `roundPlan` 的集火 priority 都吃到；`targetValue` 公開簽名加**可選**參數，不破壞既有呼叫）。`spare` 的單位：`damageValue` 裡「打死」那一項改成 `−objSpare × value`。
4. **位置價值** `objectiveMoveValue(ctx, unit, from, to)`，加到 move 候選分數，也加到「先移動再出手」候選（`c.move`）的分數：
   - unit ∈ exitUnits：`objExit × (d出口(from) − d出口(to))`。
   - 友方 hold 區（unit 不在 exitUnits）：`objHold × (d區(from) − d區(to)) + objHoldStay × (在區(to) − 在區(from))`。
   - 敵方 hold 區：`objContest × (d區(from) − d區(to))`。
   - escortees（unit 自己不是被護送者）：`objEscort × (max(0, d(from,e) − escortRange) − max(0, d(to,e) − escortRange))`，對最近的被護送者。
   - interceptUnits：`objBlock × (d(from,b) − d(to,b))`，b＝離該單位最近的出口格。
   - **不擋路**：友方有 exitUnits 時，非 exitUnits 的單位結束在出口格扣 `objNoBlock`（`−objNoBlock × (在出口(to) − 在出口(from))`）。
   - 距離一律 `q.distance`（Chebyshev），不做額外尋路。
5. **撤離**：unit ∈ exitUnits 且站在出口時，`retreat` 候選分數取 `max(既有, objExit × 10)`（規則：reachExit／escort 撤離即算達成）。
6. **候選生成**：`policies/tactical.ts` `proposeTactical` 目前只取「離敵最近」前 `maxMoves` 格；**另加**依 `objectiveMoveValue` 由高到低、值 > 0 的前 `objMoves` 格（去重），讓進區／往出口的格子進得了候選。
7. **參數**：全部進 `score.ts` 的 `DEFAULTS`（或 objectives.ts 自己的 DEFAULTS），由 `ctx.params` 覆蓋（aiprofile `params` 即可調）：`objKill`、`objSpawner`、`objZoneClear`、`objIntercept`、`objSpare`、`objExit`、`objHold`、`objHoldStay`、`objContest`、`objEscort`、`escortRange`、`objBlock`、`objNoBlock`、`objMoves`。起始值你定、再依量測調；**目標資訊全空時（只有 eliminate、沒有孵化源）行為必須與現在逐位元相同**。
8. **友軍**：盟軍 slot（`allies`）走同一套——第 1 點的分邊已讓它共享玩家目標；`spare` 與「不擋路」就是「不搶不擋」。policies `sentinel`／`swarm` 經 `scoreCandidate`／`proposeTactical` 自然吃到；`flee`／`berserk`／`scripted` 不改。

## 範圍（排除法寫死）

- 只做：新增 `src/ai/objectives.ts`；改 `src/ai/score.ts`、`src/ai/strategy.ts`、`src/ai/policies/tactical.ts`、`src/ai/index.ts`（匯出）；新增單元測試 `test/ai/objectives.test.ts`（必要時再一個 `test/ai/objectives-battle.test.ts` 用真內容小戰場）；必要時擴充 `test/ai/stub-rules.ts`（只加功能、不改既有行為）。
- 不做：`src/rules/`、`src/core/`、`src/sim/`、`src/ops/`、`src/ui-adapter/`、`src/mcp/`、`content/`（**任何內容檔都不改**，含 aiprofiles）、spec、`wf/`（你的 REPORT 除外）、`test/golden/`、其他 `test/` 子目錄。不改十分律與傷害公式。不改 `src/ai/rules-query.ts` 的介面。
- 件數 gate：新增＋修改檔合計超過 10 個就停下回報；容量 gate：diff 超過 60 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-aio-core --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | 回歸：五行 `hash` 必須與改前相同（改前值見下） |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/scenario-measure.ts scenario/rift-edge-nest 1 2 3 4 5` | 情境原始輪數（30）量勝負／原因／Wait 比例 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored` | 營運 anchored 期 15 場凍結戰場重打（勝場、對巢母命中數看 `nmHits`） |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 效能：ms／步不得超過改前的 1.5 倍 |

凍結戰場檔先複製：`mkdir -p /tmp/cx-aio-core && cp /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/frozen.json /tmp/cx-aio-core/`。

**改前基準**（領導在 HEAD 量的）：skirmish seed 1–5 hash `8f41a98a49c552af`、`c55508653aa6fc8e`、`127ed772412326a5`、`cee385ea5a5937b8`、`c45430b95d7e7da8`（勝負 player、player、平手、平手、平手）；rift-edge-nest 30 輪 seed 1–3：player（survive）、player（survive）、enemy（eliminate）；anchored 凍結 15 場 0 勝。**領導已算過：營運 anchored 期巢母（core 370 HP、全身約 1580 HP、8 部位等機率吃彈）以兩台機的 arc-pulse（21 熱）在 20 輪內幾乎打不死，hold 區又被不動的巢母佔著，所以 anchored 勝率提升主要受內容限制——不要為了湊勝率去改內容或規則，量到多少就記多少。**

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-aio-core/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（`content/base/` 新檔、`src/ui-adapter/`、`src/mcp/` 等）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試、照跑你自己的測試檔與 `test/ai/`、`test/sim/`，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`（會毀掉別線未 commit 的改動）；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 讀程式、寫 `src/ai/objectives.ts` 與整合（設計第 1–8 點）；確認 skirmish 五個 hash 不變；`inbox_poll --once`。
2. 寫單元測試：**每種目標至少一條行為測試**——killTarget 選目標單位而非等值的另一個；孵化源優先；hold 進區、在區內不離區追擊、區內敵人優先；escort 被護送者往出口走且站上出口會撤離、護衛不離被護送者超過 `escortRange`；reachExit 往出口走並撤離；敵方 escort 目標被優先攻擊／攔截；盟軍 slot 共享玩家 killTarget、不打死 capture 目標、不停在出口格；目標全空時分數與舊公式相同。每條要能變紅（先對舊程式或拿掉該項證明會失敗，REPORT 記一句怎麼證的）。`inbox_poll --once`。
3. 量測與調參：rift-edge-nest seed 1–5（30 輪）、anchored 凍結 15 場、skirmish 回歸、bench-ops；權重調一輪記一行。`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-core/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/`（objectives.ts、score.ts、strategy.ts、policies/tactical.ts、index.ts） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/objectives.test.ts`（＋可選 objectives-battle.test.ts） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-core/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），附表「參數（名稱、預設值、意義）」與「量測（改前／每輪／最終：rift-edge-nest 每 seed 勝負·原因·輪數·Wait 比例、anchored 15 場勝場與對巢母命中合計、skirmish hash 是否不變、bench ms／步）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `test/ai/`、`test/sim/` 0 fail；`npm run typecheck` exit 0（由領導重跑）。
2. `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` 五行 hash 與改前基準逐一相同、全 `pass:true`。
3. `test/ai/objectives*.test.ts` 涵蓋工作第 2 步列的每一項行為（REPORT 逐項對照測試名）。
4. rift-edge-nest seed 1–5（30 輪）每個 seed 都分出勝負（winner 非 null）且 Wait 比例 < 0.5；結果寫進量測表。
5. bench-ops ms／步 ≤ 改前 1.5 倍（改前值你先量）。
6. REPORT 存在且有四段＋兩個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（例：skirmish hash 變了又找不到原因、rift-edge-nest 出現平手）且修不好 → 保留程式、發 `FAILED`，REPORT 寫證據與最接近的狀態（**不回滾**，領導判斷）。anchored 勝率沒提升不算失敗。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-aio-core`。本線團隊：`teams/ai-objective`。上線先發 `wf/tools/inbox_mail.sh cx-aio-core --up PROGRESS 'cx-aio-core 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-aio-core --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-core/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
