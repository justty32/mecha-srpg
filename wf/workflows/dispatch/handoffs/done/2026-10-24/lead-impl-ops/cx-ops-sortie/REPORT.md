# cx-ops-sortie：出戰流程已串通，固定 8 個測試通過

## 做了什麼

完成 validateSortie → generateScenario → scenarioToSetup → runBattle（雙方 AI）→ applyBattleResult，並由 index.ts 匯出四個入口。就地更新 CampaignState；出戰不推進日期。合法性檢查拒絕前不修改狀態；未完成戰鬥回傳 battle-maxSteps／battle-stalled，恢復生成時使用的 RNG 與效果序號，不回寫半場戰果。

情境依契約敵軍快照與 encounter 配方生成地圖、按等級名額抽 monster、展開契約／分段目標並抽獨立戰鬥 seed。營運單位與人物 ID 在 setup 轉接後保留，敵軍 ID 帶 sortie 前綴，避免跨場頭數撞號。mood 與 injected 預掛在人物快照，機魂節點貢獻按 mastery 縮放；可表達的屬性／池貢獻經暫時 PersonDef 傳入，完整狀態入口的限制見下段。

八組回寫有各自處理位置：機體、人物、戰利品、契約、裂縫、聲望、耗材、記錄。機體部位與人物 HP 用交接書指定差分保留舊傷；死亡／回船成長交 crew，計功及結算交 contracts，裂縫戰果交 world。材料只經 post，來源引用 BattleResolved 並在 reason 帶 hash。實物及材料超容量留節點 wreckage，帶 day；同一 sortie 的回寫防重複。活捕進 mechs 與機庫，滿位留節點，沒有建立 PenState。

固定五項驗收證據如下，沒有新增驗收項目：

1. 指定 ops runner 最後結果 77 tests、77 pass、0 fail、0 todo；本線恰好 8 個 test()，分配 validate 2／scenario 2／apply 3／run 1。run 真正跑 AI 戰鬥並取得 result 與 BattleResolved。npm run typecheck 最後 exit 0；npm run check exit 0、0 errors／0 warnings。沙箱外 npm test 與最終驗收由領導重跑。
2. 指定禁依賴 grep 0 命中；BattleResult 從 NonNullable<RunResult["result"]> 推導，BattleSetup 從 SimSetup["setup"] 推導。
3. 本線程式改動只在 src/ops/sortie；另外只寫本 REPORT 及授權 inbox 回報。其他線的既有與進行中改動未碰。
4. 四個入口均由 src/ops/sortie/index.ts 匯出。
5. 本 REPORT 有四段、三個介面／缺口附表、活捕 TODO 及工具段。

另依交接書跑 node src/ops/content/check.ts content/base：exit 0、0 errors／0 warnings。npm run sim -- --help 已執行；CLI 印「錯誤: 未知選項：--help」但 exit 0，故實際簽名以親讀 src/sim/run.ts 為準。測試輸出留 /tmp/cx-ops-sortie-tests.tap，型別輸出留 /tmp/cx-ops-sortie-typecheck.log。

## 產出（檔清單）

新增程式／測試 10 檔與 REPORT 共 11 檔，程式約 43 KB，加 REPORT 低於 120 KB；未達 15 檔 gate。沒有 commit。下列為供領導開啟的導航。

<!-- wf-nav -->
- [validate.ts](../../../../../../../../src/ops/sortie/validate.ts)
- [scenario.ts](../../../../../../../../src/ops/sortie/scenario.ts)
- [apply.ts](../../../../../../../../src/ops/sortie/apply.ts)
- [run.ts](../../../../../../../../src/ops/sortie/run.ts)
- [index.ts](../../../../../../../../src/ops/sortie/index.ts)
- [test-support.ts](../../../../../../../../src/ops/sortie/test-support.ts)
- [validate.test.ts](../../../../../../../../src/ops/sortie/validate.test.ts)
- [scenario.test.ts](../../../../../../../../src/ops/sortie/scenario.test.ts)
- [apply.test.ts](../../../../../../../../src/ops/sortie/apply.test.ts)
- [run.test.ts](../../../../../../../../src/ops/sortie/run.test.ts)
- [REPORT.md](REPORT.md)

## 沒做到或證據不足的

**情境的動態資料必須使用生成後的 ctx.db。** Core ScenarioDef 只有 map ID，ContentDB 又是唯讀，因此 generateScenario 以區域 SortieScenario.ops 保存可序列化的 map／人物快照／暫時 Def／unitIds，再把 ctx.db 指向 overlay。呼叫範例是 `const def = generateScenario(s, ctx, sortie); scenarioToSetup(ctx.db, def, def.seed!)`。原本保存的 db 變數不含新地圖。runSortie 自動處理並在完成或例外時恢復原 db。若序列化情境後另行執行，需用 scenario.ts 的 scenarioDB 重新掛上 overlay；此輔助函式不由 index.ts 公開。

**完整人物狀態與控制模式仍受 core 入口限制。** UnitInit.persons 只接 id／def／seat，沒有 PersonState 或 controlMode。預掛 effects、傷勢與機魂快照存在 ops.persons；暫時 Def 傳遞已求值的 attrs／pool max／regen 貢獻，但無法帶入效果 hooks、時鐘、真正的初始 morale、resonance、soulTree 或 shared／contested 模式。負 mood 有 shaken 的數值貢獻，戰鬥內的 morale 欄仍由 core 初始化。回寫保留舊效果、屬性、等級與意志，以既有 XP 加實際所得並避免對已含總值的戰果重加。trust 沒有係數與效果內容，沒有臆造 contested 修正。無座位機體的 injected 也沒有合法人物承載點；未造怪獸人物。活捕藉既有 monster/species 初始化取得 instinct 與行動池，回傳機體仍還原營運 frame。

**內容與目標缺口未造假補值。** Base 無 core 深度 encounter，採同族 deep，再退 shallow；核心仍加入錨。budgetByGrade 只有各級數字，缺單價、錨齡倍率與對人 roster 預算，現在解為各級名額並遵守快照 width／monsters，不隨玩家編成縮放。沒有 conventional-arms 支援機體／能力，因此尚未生成空援、艦砲及城邦砲台，攜帶支援不會憑空扣券。hold／escort 模板可輸出，但 core 的對應目標目前永不完成，完整封裂／護送勝利仍需 core 補實作；沒有擅改目標為 survive。

**戰果資訊不足的回寫採明示最小解。** BattleResult.log 只有 events 數量與 hash，不能直接取得 UnitDied／AbilityUsed。計功以敵方最終 dead 建立死亡輸入，帶 sortie ID 並交 tallyHeads 去重；run 以成功 commands 補可選 events，依能力 tags 扣耗材。單獨 applyBattleResult 若沒補 events，無法得知使用量。設施誤傷事件及聲望扣分幅度都缺，因此聲望只套契約既有 onComplete／onFail；不臆扣城邦聲望。部分成功只有 reason 明示 partial 才半額，敗戰有擊殺不自行改判。world.defended 限大潮，一般 seal 勝且 unanchored 時在本地補 sealing 與 RiftPhase。

Core 現有 battleResult 固定 loot 為空，沒有可連結單位的掉落表；本線已處理手工 BattleResult.loot，沒有替機甲／敵軍臆造材料。ComponentInstance 沒有完整部件層資料，回收 HP 暫存來源部位最小層 HP。cargo 未定重量，實物每件、材料每單位各占一格；fuel／feed 舊船存量不計入。wreckage 已標日，但次日可取／再隔日消失需 time 的清理流程配合。本線固定 8 測試只覆蓋交接書指定案例，未加碼宣稱這些缺口已驗完。

中途 typecheck 曾因其他線的 src/ops/time/tick.test.ts、src/ops/sim/save.ts 的 node:crypto 與 src/ops/sim/golden.test.ts 的 URL 型別紅燈；本線未改。最後重跑已 exit 0。沒有 runBattle 例外，無 todo 測試。沙箱外 npm test、commit、全域計數及 code map 由領導處理。

## 需要決定的事

無需使用者追加授權。本線依交接書允許的區域 SPEC-GAP 解法交付；領導整合時須保留上述限制，尤其不要把 hold／escort 或完整人物狀態注入視為已具備。其他模組的共享型別與內容擴充由所屬線處理。

## 匯出函式清單

下列四個函式由 index.ts 匯出；參數中的 s／ctx 使用 foundation 型別，CmdResult 沿用 crew 公開型別。

```ts
validateSortie(s: CampaignState, ctx: OpsCtx, sortie: Sortie): CmdResult
generateScenario(s: CampaignState, ctx: OpsCtx, sortie: Sortie): ScenarioDef
applyBattleResult(s: CampaignState, ctx: OpsCtx, sortie: Sortie, result: BattleResult): void
runSortie(s: CampaignState, ctx: OpsCtx, sortie: Sortie, opts?: { maxSteps?: number }): CmdResult & { result?: BattleResult }
```

另匯出 BattleResult、SortieBattleResult（可選 events）、SortieScenario 型別。test-support 僅測試使用。區域 scenarioDB(db, scenario) 只供動態情境重建 overlay。

## 需要別模組或 core 補的東西

| 接點 | 待補 |
|---|---|
| sim／core 入口 | 動態 MapDef、完整人物、controlMode |
| core 戰果 | 事件明細、部件 HP、掉落表 |
| core 目標 | hold／escort 完成條件 |
| world 內容 | core 遭遇、預算係數、支援與 trust |
| time | 殘骸期限與拾取 |

## SPEC-GAP 清單

| 位置 | 最小解 |
|---|---|
| scenario.ts | 純資料 ops＋DB overlay；臨時人物 Def |
| scenario.ts | core 地圖退 deep；預算解為名額 |
| scenario.ts | 缺支援／trust 不造數值 |
| run.ts | ID 轉接；成功 commands 補耗材 |
| apply.ts | 傷勢差分；保留成長與舊效果 |
| apply.ts | 最終 dead 計功；明示 partial |
| apply.ts | 部位 HP 代回收值；cargo 按件／量 |
| apply.ts | 一般 seal 補 sealing |

## TODO（活捕裁示）位置清單

| 位置 | 已採裁示 |
|---|---|
| validate.ts | 不查馴化／拘束／獸欄；無座位 instinct |
| scenario.ts | 活捕走 species；不造怪獸人物 |
| scenario.ts | 無 hunger／bond 注入 |
| apply.ts | mechs＋機庫；滿位 wreckage；無 PenState |

## 以後交接書該點名的工具

無。現有 sim CLI 不支援 --help；後續交接書可直接點名 src/sim/run.ts 簽名，或待 CLI 支援後再要求該旗標。
