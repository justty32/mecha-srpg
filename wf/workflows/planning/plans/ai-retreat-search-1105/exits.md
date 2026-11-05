# 第 2 項：撤離出口按陣營分開、戰報補一句

[總計畫](../ai-retreat-search-1105.md)

擊退勝規則（`src/rules/objectives.ts:61-62`、`66-72`）**不動**。

## 現行程式

- 資料：`MapDef.exits: Cell[]`（`src/core/types-def.ts:248`），`BattleSetup.map.exits`（`src/rules/flow.ts:21`），`rt.exits`（`src/core/types-state.ts:122`），`flow.ts:52` 複製進 runtime。`BattleSetup.map` **沒有** `deployZones`，部署只在 `src/sim/run.ts:81-82` 用掉。
- 撤離合法：`src/rules/flow.ts:137-138`，有出口限指定格、無出口四邊。AI 同義副本 `src/ai/intent.ts:33-42 retreatCells`（`flee.ts:16,33`、`intent.ts:137` 用）。
消費者與內容現況：

- 出口消費者：`src/rules/objectives.ts:23,29`（reachExit／escort 到達）、`src/ai/score.ts:181`、`src/ai/objectives.ts:80-106`、`src/mcp/battle-view.ts:179-181,252`、`src/ui-adapter/vm/viewmodel.ts:304`、`src/sim/save.ts:77`（形狀驗證）、`test/ai/stub-rules.ts:36,213`。
- 內容：38 張圖，35 張出口只在一邊（x=0 為主，見 skirmish-20 `exits` 20 格全在 x=0、deployZones player x=2／enemy x=17）；ops 生成圖 `src/ops/sortie/scenario.ts:189,226,231`、`operation-scenario.ts:77` 也都 x=0（escort／relic-hunt 改右邊）。
- 戰報：`src/ui-adapter/vm/text.ts:72`、`src/mcp/battle-view.ts:101`（BattleEnd 只寫「X 陣營獲勝」）；`battle-view.ts:96` 單位「已撤離」。

## 設計

資料欄位（全部選填，向後相容）：

| 位置 | 欄位 | 語意 |
|---|---|---|
| `MapDef` | `exitsBySlot?: Record<FactionSlot, Cell[]>` | 某 slot 專屬出口；沒列的 slot 走預設 |
| `BattleSetup.map` | `exitsBySlot?`、`deployZones?` | run.ts 從 MapDef 帶入（deployZones 給第 3 項） |
| `rt` | `exitsBySlot?`、`deployZones?` | `flow.ts:52` 旁複製 |

查詢 helper（放 `src/rules/exits.ts`，rules 與 ai 都走它，取代 `retreatCells`）：

```ts
exitsFor(s, slot): Cell[]  // rt.exitsBySlot?.[slot] ?? rt.exits（非空）?? 四邊；noRetreat → []
```

預設派生（待拍板 2，建議採用）：`scenarioToSetup`（`run.ts:128-131`）在內容層填 `exitsBySlot`——每個有 deployZones 的 slot，若未手標，取**四邊中離該區總距離最小的那一邊**整列為出口；若剛好等於 `exits` 那一邊就不另列。派生在 content／sim 層做，rules 只讀資料，黃金情境 `test/scenarios` 沒 deployZones → 不派生、hash 不變。ops 生成圖改成明寫：`scenario.ts:189,231`、`operation-scenario.ts:77` 加 `exitsBySlot.enemy = 對邊整列`（escort／relic-hunt 相反）。

消費者改法：`flow.retreat` 用 `exitsFor(s, u.owner)`；`objectives.ts` reachExit／escort 用 `exitsFor(s, o.for)`；ai `score.ts:181`、`ai/objectives.ts:80`、`flee.ts`、`intent.ts:137` 用自己 slot；mcp／viewmodel 顯示玩家 slot 的出口；`save.ts:77` 放寬接受 `exitsBySlot`／`deployZones`；stub-rules `retreat` 同步。`debug-maps.ts:26` 不動。

戰報（待拍板 3，建議 a）：`text.ts:72` 與 `battle-view.ts:101` 在 `payload.reason === "repelled" || payload.detail === "repelled"` 時改為「戰鬥結束，{勝方}獲勝——敵方判斷戰況不利，撤離戰場」；沒有新事件、不動 hash。

## spec 草稿

`data-model-world.md:21`：

> `deployZones: Record<FactionSlot, Cell[]>; exits: Cell[]; exitsBySlot?: Record<FactionSlot, Cell[]>;  // exits＝共用撤離邊（預設四邊）；exitsBySlot＝某陣營專屬出口，未列者由載入器取離其部署區最近的一邊（2026-11-05）`

`rules-battle-flow.md:21`「撤離」：

> `Retreat` 只在單位位於**所屬陣營出口**（`exitsFor(slot)`：`map.exitsBySlot[slot]` → `map.exits` → 四邊）任一格時合法……reachExit／escort 的「到達」看目標 `for` 陣營的出口。擊退勝規則不變；戰報在 repelled 時說明敵方判斷不利撤離。

`ai.md`「意圖兩層」SPEC-GAP 行：「地圖未宣告 exits 時四邊可撤」改為「未宣告 exitsBySlot 時由部署區派生」。

## 測試

- `test/rules/repel.test.ts` 加：「有 exitsBySlot 時各陣營只能從自己的出口撤；站在對方出口 not-at-exit」、「沒 exitsBySlot 舊行為不變」。
- `src/rules/objectives.test.ts`：escort 到達判定用 `for` 陣營出口。
- `test/ai/intent.test.ts`／`flee`：`retreatCells` 改簽名後的現有斷言；加「敵方往自己那邊撤，travel 用己方出口」。
- `src/sim/run.test`（或新 `test/content/exits-by-slot.test.ts`）：skirmish-20 派生 enemy 出口＝x=19 整列；combined-arms（exits 僅 1 格）派生 x=23；三方圖每個有部署區的 slot 都有出口且在界內；手標優先於派生。
- `src/ops/sortie/scenario.test`：生成圖 enemy 出口在對邊、不與 deployZones／reserved 重疊（`scenario.ts:399`）。
- `src/sim/save` 往返含 `exitsBySlot`；`src/mcp/battle-info.test.ts`、`battle.test.ts` 出口顯示；`src/ui-adapter/vm/text` 文案一則。

## 黃金影響

戰鬥黃金不變（setup 無 deployZones／exitsBySlot，helper 回退路徑與今日相同）。營運黃金必變（ops 生成圖敵軍改從右邊撤）；與第 1、3 項合併重錄。

## 驗證

battle_auto exm-crossline／exp-four-choices／exp-unfinished-ties seed 1–5：敵方 `Retreated` 發生時所在格應在 x=19；對照基線擊退勝是否變成殲滅勝或 timeout。combined-arms-battlefield seed 1–3、kj-quay-rise／nairobi-joint-cordon seed 1–3（多方局不炸）。
