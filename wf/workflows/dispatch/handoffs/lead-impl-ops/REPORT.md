# REPORT — lead-impl-ops（2026-10-24，頂層代存領導匯報）

STATUS：DONE（spec 切線 1–8；切線 9 ui-ops 未做）。工人 REPORT：`cx-ops-*/REPORT.md`。

| 階段 | 線 | 內容 | 測試 | commit |
|---|---|---|---|---|
| 0 | 領導 | core 載入器略過 `world/`、契約、交接書 | — | `d4a85bf` |
| 1 | foundation | 型別、單一帳本＋三條守恆不變量、曆、world 載入與交叉檢查、條件求值、OpsEffect、開局；起始內容 52 檔 | 16 | `4cf81fd` |
| 2 | text | 27 動詞解析／反向、房間描述、事件模板、Screen | 12 | `ddadc01` |
| 2 | crew | 薪水／欠薪、利息、招募、醫務、工時、機庫、科研、機魂開／練熟、命名 | 14 | `8692900` |
| 2 | world | 裂縫七態、潮壓、蝕域、行動牌、市場、航行、契約 | 14 | `c5408b9` |
| 3 | sortie | 出戰檢查、情境生成、戰果回寫；`runSortie` 經 `sim.runBattle` | 8 | `4e62aeb` |
| 3 | time | tick 八段、指令分派、`runCampaign`＋idle／greedy／random、不變量、重播、存檔、黃金、CLI | 13 | `40f3bf6` |
| — | 領導 | 收線 | — | `d6de35c` |

驗收：`npm test` 318 過（ops 77）；`npm run check` 0；`node src/ops/content/check.ts content/base` 0；`node src/ops/sim/cli.ts --months 12 --seed 7 --policy idle|greedy` OK。

## 判斷與缺口
1. greedy 三潮月人走光：`src/ops/sortie/scenario.ts` 部署欄與撤離欄同在 x=0，AI 劣勢開場即撤離；部署移到 x=2 則戰鬥要跑數分鐘（runBattle 跑到步數上限）→ 已還原。
2. 重播目前重跑戰鬥（spec 寫不重跑）。
3. sortie 動態地圖暫換 `ctx.db` 疊加版，建議 core／sim 給正式入口。
4. 戰前部位損傷帶不進戰場（`UnitInit` 無欄），改差分回寫。
5. 活捕裁示：stable／feed／hunger／馴化程式未刪、標 `TODO(2026-10-24 裁示)`、未接 tick（`src/ops/crew/{stable,wages,hangar,workqueue,index}.ts`、`crew.test.ts`、`world/services/crew.json`、市場 `stock:feed`、`text/render.ts` 的「餵」捷徑）。捕獲獸改進機庫。
6. 待補 core／sim 入口：部位損傷／人物狀態／控制模式帶入；`BattleResult` 事件明細；hold／escort 目標永不完成；掉落表空；無支援單位。三條 core 建議未做。`types.ts` 待合併；自填名字缺指令入口；內容只有起始量。

## 頂層決定（2026-10-24）
- 劣勢開場撤離 → 視為 bug，交整合線（部署／撤離分開＋AI 撤離判斷＋戰鬥效能）。
- 重播照 spec 不重跑：存檔存每場戰果。
