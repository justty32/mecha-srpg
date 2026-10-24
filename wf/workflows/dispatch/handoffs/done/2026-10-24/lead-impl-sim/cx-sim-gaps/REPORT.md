# cx-sim-gaps：三個整合缺口已補齊，168 個測試全過

STATUS：DONE。依交接書固定五條驗收執行，未 commit；沙箱外驗收與提交由領導完成。

## 做了什麼

無駕駛員怪獸初始化為 `instinct`，`handOver` 依 monsters 記錄恢復本能控制，指令權者為 null。人物成本改扣機體同名池；缺池或餘額不足會拒絕。人物與機體成本指向同一池時合併檢查，避免各自足夠、合計超支。既有 turn 的放行、機體 regen 與 movement 的 AP 支付可直接沿用，未修改這些檔。

13 個常數併回 base，合計 19 鍵；步兵、三個士氣效果與失控效果原樣搬回 base，刪除具名的測試包副本。四族怪獸與 pp-tidewolf 增加 max／initial／regen 均為 9 的 AP 池。pack-hunter 改用 swarm。

恰好新增四個 test()：control.test.ts 三個（本能初始化與交接、移動與能力成本及恢復、derelict 自動結束回合），policies.test.ts 一個（base 所有 aiprofile policy 已登記）。integration 只載入 base，新增 wolf2 至少 move／useAbility 一次的斷言，保留 hound／rival 都使用能力及 rejected=0 的既有斷言。怪獸 AP 擴大 AI 危險評估範圍後，原部署使 hound 不再攻擊；測試地圖寬度改為 20、wolf2 移至 (18,5)，讓機甲先交火、怪獸從後方接近，未改正式平衡資料或 AI 係數。

固定驗收證據：

1. `node --test --test-isolation=none --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'` exit 0，168 tests／168 pass／0 fail／0 skipped，相較 164 恰多 4。輸出在 `/tmp/cx-sim-gaps/tests.tap`；當次尚無 test/sim 測試。每個缺口均執行 check、typecheck 與 inbox_poll；最終 check 為 `OK 0 errors, 0 warnings`，typecheck exit 0。
2. contract §1(b) 的所有具名測試包副本已刪除，base 常數 19 鍵；`rg -n 'test/scenarios/pack' test/ai/` 零命中。
3. integration 通過：wolf2 有 move／useAbility，rejected=0，hound／rival 仍各有使用能力；同 seed 指令序列一致。
4. pack-hunter policy 為 swarm。`GOLDEN_UPDATE=1 node --test --test-isolation=none test/golden.test.ts` exit 0；六個 hash 均重產且兩兩不同，三個內容不變。沒有修改情境 commands 或 expect。
5. 本 REPORT 包含四段、黃金 diff 原因表及 SPEC-GAP 清單。

## 產出（改、增、刪的檔清單）

以下路徑皆相對 `/home/lorkhan/repo/game_dev/mecha-srpg`。實際 diff 31 個程式／內容／測試檔，加 REPORT 為 32 檔；另三個重產但內容相同的 hash 也計入觸碰量時為 35 檔，未超過 gate。程式／內容／測試 diff 加新增檔為 27,174 bytes，加 REPORT 仍低於 150 KB。

修改規則：`src/rules/state.ts`、`src/rules/control.ts`、`src/rules/pools.ts`、`src/rules/control.test.ts`。

修改 base：`content/base/rules/constants.json`、`content/base/aiprofiles/pack-hunter.json`、`content/base/species/mite.json`、`content/base/species/nestmother.json`、`content/base/species/reaper.json`、`content/base/species/tidewolf.json`。

新增 base：`content/base/frames/infantry.json`、`content/base/bodyplans/infantry.json`、`content/base/effects/morale-shaken.json`、`content/base/effects/morale-breaking.json`、`content/base/effects/morale-fleeing.json`、`content/base/effects/berserk.json`。

修改測試與說明：`test/scenarios/pack/species/pp-tidewolf.json`、`test/ai/integration.test.ts`、`test/ai/policies.test.ts`、`test/README.md`。

重產且變更：`test/golden/combat-conduct.hash`、`test/golden/combat-layers.hash`、`test/golden/people-berserk.hash`。重產但內容相同：`test/golden/combat-tenth.hash`、`test/golden/people-capture.hash`、`test/golden/people-eject.hash`。

刪除：`test/scenarios/pack/rules/constants.json`、`test/scenarios/pack/frames/infantry.json`、`test/scenarios/pack/bodyplans/infantry.json`、`test/scenarios/pack/effects/morale-shaken.json`、`test/scenarios/pack/effects/morale-breaking.json`、`test/scenarios/pack/effects/morale-fleeing.json`、`test/scenarios/pack/effects/berserk.json`、`test/scenarios/pack/terrains/plain.json`。每個檔案均獨立以 rm 完整路徑刪除。

新增交付：`wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-gaps/REPORT.md`。依交接書另投遞上線 PROGRESS 與終局 DONE 到 inbox。

## 沒做到或證據不足的

沙箱外 npm test 的最終計數由領導重算，本線未宣稱完成沙箱外驗收。沒有修改 src/sim、test/sim、package.json、core、content loader、schemas 或其他線檔案。其餘授權工作均已完成。

## 需要決定的事

交接書兩處寫刪除「9 個檔」，但 §1(b) 與範圍具名路徑實際只有 8 個；已依完整列舉刪除 8 個，沒有臆造第九個刪除目標。請領導以具名清單驗收，並修正文案數字。

## 黃金 diff 原因表

修改前先以自製 `/tmp/cx-sim-gaps/logs.ts before` 保存六份事件日誌；重產後以同腳本 `after` 保存。日誌位於 `/tmp/cx-sim-gaps/before/<情境 id>` 與 `after/<情境 id>`，逐份 unified diff 存 `/tmp/cx-sim-gaps/<情境 id>.diff`。

| 情境 | 新 hash | 事件數前→後與原因 |
|---|---|---|
| combat-conduct | `02429ecee80e088a` | 24→24；morale-shaken 的 effect ID 從 rtest: 改為 base: |
| combat-layers | `ff765945dad0d274` | 33→33；同上，受影響人物為 a-pilot |
| combat-tenth | `969fa5e9e4e214fa` | 18→18；日誌無差異 |
| people-berserk | `f7f2de6106b4efd1` | 10→10；berserk 的 effect ID 從 rtest: 改為 base: |
| people-capture | `f7a55f7012a0b0a0` | 32→32；狼於首次輪到前即被捕獲，日誌無差異 |
| people-eject | `c86ec6aa436d1dfa` | 19→19；步兵換包未改日誌 payload，無差異 |

base 與測試包的 plain 原檔完全相同，沒有地形數值差異；六情境沒有新增怪獸回合，因此不用補 end。實際日誌差異僅上述三個效果 ID。

## SPEC-GAP 清單

本線沒有新增未裁定的規格缺口；instinct、人物成本回機體與 AP 資料均依 contract §1。既有 reaction、removeOnZero 等範圍外缺口沿用前線 REPORT，本線未處理或重新驗證。

## 以後交接書該點名的工具

無。
