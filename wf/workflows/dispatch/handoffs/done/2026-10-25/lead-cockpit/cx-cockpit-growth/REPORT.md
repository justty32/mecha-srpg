# cx-cockpit-growth：驅動時數、人帶能力、外貌年齡與 AI 醒魂落地

## 做了什麼

在指定隔離 worktree 實作人物天生／後天能力、戰後驅動時數與最高驅動等級、依門檻及等級抽取能力、機魂慢速成長、外貌年齡純函式、營運／百科／MCP 顯示，以及編隊 AI 駕駛切換與戰後醒魂。戰果入口原有去重保留；AI 自駕是 scripted，輔駕保留人物控制。醒魂由營運 RNG、既有 nextId 與 registerPersonName 建立獨立人物；原 AI 保留，已有機魂不被擠走。

狀態：DONE。所有變更未 git add／commit。固定五條驗收完成，沒有增加驗收條件：

1. 最終排除版使用交接書原指令，exit 0、145/145、fail 0、skip 0，268.4 秒；記錄 `/tmp/cx-growth-acceptance-final.tap`。原有 143 檔加本線 2 個新測試檔。TAP 檔案計數未當成單元案例數。
2. 最終 `npm run typecheck` 通過；`npm run check` 通過，末行 `OK 0 errors, 8 warnings`。記錄 `/tmp/cx-growth-typecheck.log`、`/tmp/cx-growth-check.log`。
3. 固定要求的各案例已涵蓋，完整名稱列於 [TESTS.json](TESTS.json)（13 個新增／擴充測試名稱）。相關七檔逐案測試 65/65、fail 0（`/tmp/cx-growth-targeted.tap`）；後續門檻檢查與成長微調的兩檔 25/25、fail 0（`/tmp/cx-growth-final-unit.tap`）；最終完整測試亦包含這些檔與 MCP 人物資訊、DOM checkbox 驗證。
4. cockpit.growth 含交接書全部 13 個鍵；指定數值掃描只命中未修改的 health.ts、encounter.test.ts、war/resolve.ts、layers.test.ts，無本線新增寫死暫值。記錄 `/tmp/cx-growth-numeric-gate.log`。
5. 本 REPORT 已寫入指定主 repo 交付路徑，包含暫值表、黃金變動表及改動檔／測試清單連結。

## 產出（含改動檔清單、暫值表、黃金變動表、四個能力的名稱與效果）

程式碼在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/cockpit/wt-growth/`。完整改動檔清單見 [CHANGES.json](CHANGES.json)，新增與擴充的測試名稱見 [TESTS.json](TESTS.json)。共 46 個 worktree 檔、3 個交付檔，合計 49；沒有新增檔超過 200 KB。原有未追蹤 node_modules 未動。

暫值集中在 `content/base/rules/cockpit.json` 的 growth：

| 鍵 | 暫值 |
|---|---|
| driveHoursPerRound | 0.25 |
| soulGrowthFactor | 0.1 |
| abilityCap | 3 |
| abilityHours | [20, 60, 150] |
| abilityGradeCap | S |
| abilityPool | 下表四個 ability/pa- id |
| agingRate | 0.25 |
| driveHoursPerYear | 1000 |
| daysPerYear | 364 |
| awakenMinAiBattles | 10 |
| awakenChanceTide | 0.0001 |
| awakenChanceAncient | 0.0001 |
| awakenSoulTemplate | person/awakened-soul |

四個能力均 D 級，耗人物 AP 1、冷卻 2，使用既有 mech scope 自我增益 effect／contrib；效果維持 1 ownerTurn，ai.tactics.buff=1。能力成本與增益值放各自能力／效果資料檔。

| 能力 id（ability/ 前綴） | 名稱 | 效果 |
|---|---|---|
| pa-quick-thought | 思維加速 | 機體 initiative +2 |
| pa-melee-boost | 強化打擊 | 機體 accuracy +3 |
| pa-ranged-boost | 強化遠程 | 機體 accuracy +3 |
| pa-tame-instinct | 壓制獸性 | 機體 control +3 |

五位點名者中，base/persons 僅有伊爾瑟・布蘭特。lore 明載 2073 出生、十九歲入鐵砧並開堅盾，故開局 age=35、activeYears=16；day 0 外貌 23 歲。其餘四人沒有 base/persons 檔，不另造人物。lore／spec／design-notes 未修改。

黃金變動表：重產指令 `GOLDEN_UPDATE=1 node --test --test-reporter=tap test/golden.test.ts test/campaigns/*.test.ts src/ops/sim/golden.test.ts`，本次 exit 0、4/4、fail 0；記錄 `/tmp/cx-growth-golden.tap`。

| 黃金 | 變動與原因 |
|---|---|
| test/golden/*.hash | 全部無 diff；指令驅動戰鬥不執行營運養成。 |
| test/campaigns/*.hash.json | 全部無 diff；固定流程未產生新增能力／醒魂事件。時數欄不另發事件，不改事件 hash。 |
| src/ops/sim/fixtures/campaign-hash.json | 無 diff；固定指令事件與日期不變。 |

醒魂範本排除於一般遭遇／作戰的 fallback 人物池，避免新增範本改動既有隨機抽選。code-map 透過 tabledb 更新 core、content、rules、sim、ops、ui-ops、ui-adapter、mcp。

## 沒做到或證據不足的

固定五條驗收沒有缺項。修正回歸時，遭遇指紋的差異來自額外寫入預設 core=true；改為只在異於 frame 預設值時寫 core，保留原指紋，沒有改測試期望。三個失敗檔修正後共 42 案全過（`/tmp/cx-growth-fixes.tap`，exit 0）。兩次基準從尚未改碼時啟動，但執行與後續編輯有重疊，只保留診斷記錄，不用來證明舊版有錯或作最終驗收。一般隔離模式兩次均 143 檔、142 pass、1 fail（war-invariants.test.ts）；記錄 `/tmp/cx-growth-baseline.tap`、`/tmp/cx-growth-baseline2.tap`。逐案模式該檔五案全部通過，exit 0，耗時 296.8 秒；記錄 `/tmp/cx-growth-war-debug.tap`。未改其案例或 timeout。

交接書排除的 MCP CLI／MCP e2e／worldgen，以及 GUI／Playwright e2e 均未執行，交領導依原安排處理。沒有更新 content/index。

## 需要決定的事

既有 effect／contrib 沒有按近戰或遠程分類增傷的掛點；依本線只准自我增益的範圍，兩個強化能力暫以命中增益表示，沒有更動攻擊公式或武器傷害。若要確實區分近戰／遠程能量增幅，需另列規則工作。

AbilityGained 與 SoulAwakened 已發事件並登記 EVENT_TYPES。既有 load/check 與模板測試要求每個登記事件可渲染，因此同步補 world/templates/default.json 的兩句必要模板，未修改或放寬原驗證。大潮暫以 spring、古代機暫以全場存在判定，皆已標 SPEC-GAP；沒有擴張大潮曆與距離規則。

## 以後交接書該點名的工具

`node --test --test-isolation=none --test-name-pattern=...` 能列出逐案斷言與錯誤；一般隔離模式只列檔案時，可用來取得逐案診斷；最終仍回到交接書原指令驗收。
