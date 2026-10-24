# 任務：修好情境三個接縫——slot 同盟、killTarget 目標鍵、地圖 globals 與 feature hp——每項先寫失敗測試再修

> 領導 `lead-fix-scenario-ai` 寫給 codex 工人 `cx-fix-seams`。**交接書是唯一契約**：沒寫的授權等於沒有。下方「裁定」段是領導依 spec 做的決定，照做；spec 沒寫到的地方標 `SPEC-GAP` 並寫進 REPORT。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；spec 讀 `wf/workflows/planning/specs/core/data-model-world.md`（地圖、勢力、情境）與 `rules-battle-flow.md` 的「勝負」段；背景讀 `wf/workflows/dispatch/handoffs/lead-impl-sim/REPORT.md`「需要決定的事」第 3 條——親自讀。

## 背景與唯一目標

sim 線收線時發現情境資料和規則接不上：`scenario/rift-edge-nest` 的 `ally` slot 在規則上跟玩家互為敵人（`src/rules/state.ts` 的 `hostile()` 只比 owner）；`killTarget` 目標在內容裡寫 `params.target`（def id），`src/rules/objectives.ts` 卻讀 `params.unit`，永遠不達成；地圖 `globals` 沒進戰局、`features[].hp` 在 `src/sim/run.ts` 的 `mapCells()` 被丟掉。唯一目標：照下面裁定接好三處，每處有「先紅後綠」的測試。

## 裁定（領導依 spec 定，照做）

**(a) slot 同盟。** spec：勢力關係在 `FactionDef.relations`（ally／neutral／hostile），「戰場陣營由情境再映射」到 slot。兩情境用同一對勢力（migrant-crew↔selene-whitegloves 世界關係 `neutral`），skirmish 要互打、rift-edge-nest 要並肩，所以映射必須能在情境層表達。做法：
1. `src/core/types-def.ts` 的 `ScenarioDef.slots[slot]` **只新增**可選欄 `allies?: FactionSlot[]`；`schemas/content.schema.json` 對應處加同一欄（字串陣列）。`content/base/scenarios/rift-edge-nest.json` 的 `ally` slot 加 `"allies": ["player"]`。
2. `BattleSetup`（`src/rules/flow.ts`）新增可選 `allies?`（型別 Record：slot → slot 陣列） 與 `factions?`（型別 Record：slot → FactionDef id）（slot → FactionDef id）。`createBattle` 把同盟**對稱化**存進 `RulesRuntime`（`src/core/types-state.ts` **只新增**欄位 `allies`（型別 Record：slot → slot 陣列），`newRuntime()` 給 `{}`；讀取時對舊存檔缺欄位視為空）；`FactionState.faction` 有給 `factions` 就填 def id，沒給維持現狀（slot）。
3. `src/sim/run.ts` 的 `scenarioToSetup`：`allies` 取「情境 `slots[x].allies`」∪「兩邊 FactionDef 任一方 `relations[對方] === "ally"`」；`factions` 填各 slot 的 faction id。
4. `src/rules/state.ts` 新增並 export `hostileSlots(ctx, a, b)`：任一方是 `berserk` → true；同 slot → false；`rt.allies[a]` 含 b → false；其餘 → true（**neutral 在戰場上算敵對**，SPEC-GAP，寫 REPORT）。`hostile(ctx, a, b)` 改用它。從 `src/rules/index.ts` export。
5. `src/rules/objectives.ts` 的 `eliminate`（沒給 `params.slots` 時）改為「沒有與 `o.for` 敵對的 active 單位」（spec：預設 eliminate 對所有**敵對** slot）；berserk 照舊排除。
6. AI 介面：`src/ai/rules-query.ts` 的 `RulesQuery` **新增可選**方法 `hostileSlots?(s: BattleState, a: FactionSlot, b: FactionSlot): boolean`，`src/ai/adapters/rules-adapter.ts` 實作它。`src/ai/` 其他檔不碰（另一條工人線 `cx-fix-ai` 會用它）。

**(b) killTarget 目標鍵。** spec 的 `Objective.params` 是任意鍵的物件，鍵名沒定——兩邊都不算錯。裁定：**內容層寫 `target`（def id，作者看得懂），規則層讀執行期 unit id**，由 `scenarioToSetup` 翻譯。
1. `scenarioToSetup`：objective 的 `params.target` 是字串時——等於某些 spawn 的 `mech`／`monster` def id → `params.units = 那些 spawn 的 unit id（排序）`；等於某個 unit id → `params.unit = target`；都不是 → `throw new Error(\`objective 目標不存在：${target}\`)`。原 `target` 鍵保留不刪。
2. `objectives.ts` 的 `killTarget`：目標集合＝`params.units`（字串陣列）∪ `params.unit`（字串）；非空且全部 `dead` 才達成。capture／reachExit 不改。

**(c) globals 與 feature hp。** spec：`MapDef.globals?: { tide?: NumExpr; light?: number }`「battle.* 可引用的全局值」；`features?: { at, terrain, hp? }`；`TerrainDef.destructible?: { hp, becomes }`。
1. `BattleSetup.map` 新增可選 `globals?: { tide?: NumExpr; light?: number }`；`cells` 的元素型別新增可選 `hp?: number`。`RulesRuntime` **只新增** `globals: { tide?: NumExpr; light?: number }`（`newRuntime()` 給 `{}`）。
2. `src/rules/state.ts` 的 `evalCtxFor`：`battle.tide` → 以只認 `battle.round` 的求值環境求 tide NumExpr；`battle.light` → 該數值；地圖沒宣告 → `0`（SPEC-GAP）。
3. `createBattle`：每個地形帶 `destructible` 的格，`map.featureHp[cellKey]` ＝ 該格 feature 的 `hp` ?? `destructible.hp`。
4. `scenarioToSetup`：把 `map.globals` 帶進 setup；`mapCells()` 的 feature 保留 `hp`（刪掉「無接收欄位」那句 SPEC-GAP 註解，改寫成目前行為）。
5. **不做**地物受損／變廢墟機制（spec 沒寫怎麼打地物）——寫進 REPORT 的 SPEC-GAP 清單。

## 範圍（排除法寫死）

- 只寫：`src/rules/`（含其 `*.test.ts`）、`src/sim/`、`test/sim/`、`src/core/types-def.ts` 與 `src/core/types-state.ts`（**只新增**欄位，不改既有欄位）、`schemas/content.schema.json`（只加 `allies`）、`content/base/scenarios/rift-edge-nest.json`（只加 `allies`）、`src/ai/rules-query.ts`（只加可選方法）、`src/ai/adapters/rules-adapter.ts`、`test/scenarios/`（只在需要測試專用地圖／情境時新增 `test/scenarios/pack/` 底下的檔；黃金若因本線變動則重產 `test/golden/*.hash`）、你的 REPORT。
- 不做：`src/ai/` 其他檔、`test/ai/`（`cx-fix-ai` 同時在寫）；`src/ops/`、`src/ui-adapter/`、`content/base/world/`、`package.json`、lock、`tsconfig*.json`（別線領地）；spec；`content/base/maps/`（不加 globals／features 進正式地圖）；AI 平衡；地物破壞機制。
- 件數 gate：新增＋修改的檔合計超過 25 個就停下回報；容量 gate：本線 diff 超過 100 KB 就停下回報。

## 測試（寫死；`node:test`＋`node:assert/strict`）

新增 **6 到 9 個** `test()`，至少涵蓋：(a) rift-edge-nest 的 ally 單位對玩家單位用 `friendly:"no"` 能力被拒（`bad-target`）、`hostile` 對 player↔ally 為 false 而 player↔enemy 為 true、skirmish 的 player↔enemy 仍敵對、`eliminate` 不要求殺盟友；(b) `scenarioToSetup(rift-edge-nest)` 的 killTarget 解析出 `units` 且殺掉該單位後 `BattleEnd` 勝方 player、原因 `killTarget`；未知目標 throw；(c) setup 帶 globals 時 `battle.tide`／`battle.light` 求值正確、feature hp 進 `featureHp`、destructible 地形無 feature 時用預設 hp，且至少一個 (c) 測試經過 `scenarioToSetup`（可用 `test/scenarios/pack/` 新增的測試地圖＋情境）。

**先紅後綠**：每一項先寫測試、在修改前跑一次確認它**紅**，把紅的那行輸出（測試名＋斷言訊息一兩行）抄進 REPORT，再修到綠。既有測試只准因本線改動而**修改**，不准刪。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'`（沙箱內計數可能不準，最終由領導在沙箱外重算）；`npm run check`；`npm run typecheck`。`test/ai/` 若因 `cx-fix-ai` 進行中而紅，不是你的事、不改。黃金：先跑 `node --test --test-isolation=none test/golden.test.ts`；變紅才重產 `GOLDEN_UPDATE=1 node --test --test-isolation=none test/golden.test.ts`，並在 REPORT 寫每個變動的原因。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-fix-seams --once` | 每完成 (a)(b)(c) 一項跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run check`、`npm run typecheck` | 每項完成後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不刪任何檔（不 `rm`、不 `git rm`）；暫存放 `/tmp/cx-fix-seams/`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. (a) 先紅測試 → 實作 → 綠；`inbox_poll --once`。
2. (b) 同上。
3. (c) 同上。
4. 黃金檢查（必要時重產）；全套測試、check、typecheck。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-seams/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 規則修改與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/` |
| sim 修改與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/sim/run.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/test/sim/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-seams/REPORT.md` |

REPORT 四段（做了什麼／產出（改、增的檔清單）／沒做到或證據不足的／需要決定的事），加「先紅證據」（三項各一兩行）、「黃金變動原因」（沒變就寫「未變」）、「SPEC-GAP 清單」、「core 型別新增欄位清單」，末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `test/ai/` 以外 0 fail，且本線新增 6–9 個 test；`npm run check` 0 errors；`npm run typecheck` exit 0（領導重跑）。
2. `grep -n "hostileSlots" src/rules/state.ts src/ai/rules-query.ts src/ai/adapters/rules-adapter.ts` 三檔皆命中；`rift-edge-nest.json` 的 ally slot 有 `"allies": ["player"]`。
3. `scenarioToSetup(db, "scenario/rift-edge-nest", 1)` 的 killTarget objective 帶 `units` 非空，且有測試證明殺掉後 player 以 `killTarget` 獲勝。
4. `src/core/` 的 diff 只有新增行（`git diff src/core | grep '^-[^-]'` 0 命中）。
5. REPORT 存在且有四段＋先紅證據＋黃金變動原因＋SPEC-GAP 清單＋core 新增欄位清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（沒跑成）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fix-seams`。本線團隊：`teams/fix`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-fix-seams --up PROGRESS '開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-fix-seams --up DONE '本線結論一句話' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-seams/REPORT.md`（`DONE` 依實況換成 `FAILED`／`BLOCKED`／`NEEDS-USER`，標題換成你的結論）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
