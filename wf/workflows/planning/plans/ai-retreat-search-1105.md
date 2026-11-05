# AI 撤退與搜索修正（2026-11-05 試玩裁決）動工計畫

> 2026-11-05 使用者已裁決：五細節全照預設（刪 intentImpossibleRatio；舊圖出口取離部署區最近一邊；戰報只改文案；survive 算守區型不搜索；怪獸與機甲同一套搜索）。

[planning](../../planning.md)｜spec [ai](../specs/core/ai.md)、[rules-battle-flow](../specs/core/rules-battle-flow.md)、[data-model-world](../specs/core/data-model-world.md)｜來源 fix-playtest-1105 REPORT「待你裁決」1–3

三項裁決各一份子檔（現行路徑、設計、spec 草稿、測試、黃金影響、驗證）：

| 項 | 子檔 | 一句話 |
|---|---|---|
| 1 | [retreat.md](ai-retreat-search-1105/retreat.md) | 整隊撤退改成「目標達不到」**且**「比例差」 |
| 2 | [exits.md](ai-retreat-search-1105/exits.md) | 撤離出口按陣營分開；戰報補「敵方判斷不利撤走」；擊退勝規則不動 |
| 3 | [search.md](ai-retreat-search-1105/search.md) | 無情報時往敵方部署區分散搜索，守區型意圖不搜 |

## 共同前提

- 基線＝main 已 merge 的 fix-playtest-1105（b3d931d5）。動工前先用 battle_auto 跑一次「驗證總表」留基線 JSON，放本輪 REPORT 目錄。
- 全機一次只准一個 node：單檔測試與 battle_auto 都要排隊，不與全套並行。
- 數值不寫死：新門檻／開關一律進 `DEFAULTS` 並可由 aiprofile `params` 覆寫（只收數字）。

## 實作順序（相依性由低到高）

1. **第 2 項資料層**：`MapDef.exitsBySlot`、`BattleSetup.map.exitsBySlot`／`deployZones`、`rt.exitsBySlot`／`rt.deployZones`、`exitsFor(s, slot)` 查詢；rules／ai／mcp／ui／save 全改走 helper。先做因為第 3 項要 `rt.deployZones`、第 1 項的 escape 估算要陣營出口。
2. **第 1 項規則**：改 `intent.ts:163-164` 一行＋ intent.test 六處；單跑 `test/ai`。
3. **第 3 項搜索**：`knowledge.ts` 的 `pursuitCells` 換成 `searchCells`；單跑 `test/ai`。
4. **第 2 項內容與戰報**：skirmish-20 等雙邊圖標 `exitsBySlot`；ops 生成圖補 enemy 出口；BattleEnd 文案。
5. **重錄營運黃金一次**（campaign-hash、ops-merc-join；戰鬥黃金預期不變），再跑全套。

## 全套次數估計

目標 **2 次**（每次約 89 分鐘）：步驟 1–4 各只跑對應目錄（`test/ai`、`test/rules`、`src/ops/sortie`、`src/mcp`、`test/content`）；步驟 5 重錄後跑第 1 次全套；翻紅修完跑第 2 次。若第 2 次仍紅，第 3 次只重跑紅檔，不再全套。

## 驗證總表（battle_auto，前後對照）

| 情境 | seed | 看什麼 | 對應項 |
|---|---|---|---|
| exk-four-corners | 1–5 | 敵方 Retreated 事件數應歸零（survive 意圖永不「達不到」）；守區勝的輪數 | 1、3 |
| exm-crossline／exp-four-choices／exp-unfinished-ties | 1–5 | 勝方、reason、rounds；敵方撤離走 x=19 不穿過我方；report 基線 4/5、3/5、5/5 | 1、2、3 |
| cx3-flyingfish-shoal | 1–5 | 3 鐮肢是否還在射程外停住；基線 0/5 | 3 |
| combined-arms-battlefield | 1–3 | 出口只有 1 格的圖，enemy 派生出口在 x=23 側 | 2 |
| kj-quay-rise、nairobi-joint-cordon | 1–3 | 多方局（ally／third）出口派生不炸、擊退勝方不變 | 2 |

記錄欄位：winner、reason、rounds、alive、eventCounts.Retreated、hash。基線與改後各一份 JSON。

## 需要使用者再拍板（預設建議粗體）

1. 第 1 項 `intentImpossibleRatio` 去留：**(a) 刪掉**，規則只剩「達不到 且（戰力比＜0.45 或 損失≥0.7）」；(b) 保留成「達不到時改用這個戰力門檻」（預設 1→0.7）。
2. 第 2 項舊圖預設：**(a) 沒標 `exitsBySlot` 的 slot 自動取離自己部署區最近的那一邊**（skirmish-20 的 enemy 自動得 x=19，連標都可不標）；(b) 不派生，沒標就照舊共用 `exits`，只手標 skirmish-20。(a) 會讓 ops 生成圖的敵軍從右邊撤，campaign 黃金一定重錄。
第 2 項戰報與第 3 項範圍：

3. 第 2 項戰報：**(a) 只改文案**（BattleEnd repelled 時加一句，不新增事件、不動 hash）；(b) 新增 `WithdrawalDeclared` 事件在整隊撤退決定當輪寫入（玩家能即時看到，但黃金與存檔都要動）。
4. 第 3 項 `survive` 意圖算不算守區型（不搜索）：**算**；`escort`／`reachExit` 也不搜。
5. 第 3 項怪獸與機甲同一套：**同一套**，只用 `searchSpread`（預設 2 格）分散；巢穴／蝕錨本來就不動。

## 完成後

規格併入 `specs/core`（三個子檔的草稿段落）→ 刪本計畫與子檔；code-map.json 的 ai／rules 列補 `exitsFor`、`searchCells`。
