# mercenary-contracts — 參戰型契約：與勢力部隊合編、勢力補給、條件與代價、選邊與背叛、作戰情境生成

[ops README](README.md)｜裁示原文 [design-notes/world](../../design-notes/world.md)（2026-10-24 獵團＝自營傭兵、傭兵參戰享補給）｜作戰 [data-model-operations-war](data-model-operations-war.md)｜外交 [data-model-diplomacy](data-model-diplomacy.md)｜契約基礎 [data-model-factions-contracts](data-model-factions-contracts.md)｜出戰 [battle-interface](battle-interface.md)

裁示：獵團偏自營傭兵；勢力自己清剿／攻堅，傭兵可參戰、合作、享勢力補給（彈藥、維修、醫療、臨時借機）。契約不只「發包單幹」，還有「參戰型」。

## 參戰契約 `kind:"join"`

`ContractTemplate.kind` 加 `"join"`，模板多一欄 `join`；`ContractState` 多 `operation: Id`、`side`、`loans: Id[]`、`violations: number`：

```ts
type JoinTerms = { command: "independent" | "attached" | "mixed"; supply: SupplyTier; share: NumExpr /*作戰賞金分成 0.1..0.3*/;
  base: NumExpr /*固定出場費，一蝕月薪水量級*/; orders: ObjectiveTemplate[] /*軍令：optional 目標，違令計次*/;
  exclusive: boolean; minStrength: NumExpr /*玩家出戰戰力點下限*/; loan?: { models: Id[]; max: number } };
type SupplyTier = "none" | "field" | "full" | "arsenal";
```

作戰進 `muster` 時，`def.merc` 開放的勢力在**目標區域所在大洲**的契約板發 `join`（`mercSlots` 上限內，競爭獵團也會搶，沿用 `contestContract`）；`sides:"both"` 的作戰雙方各發一份。接受條件：`rep ≥ minRep`、出戰戰力 ≥ `minStrength`、不在該勢力 `blacklist`、無與對方的 `join` 進行中（`exclusive`）。接受後契約 `active`，玩家要在 `engage` 開始前把船開到分遣隊所在區域；遲到不罰、只是少打幾場少分幾成。契約結束＝作戰 `done/failed/aborted` 或玩家 `drop`（視同退場，`base` 不退、`share` 歸零）。**不加動詞**：看 `board`、接 `accept`、退 `drop`、打 `sortie`。

## 合編：友軍 slot、allies、指揮權

見 [合編與勢力補給](mercenary-contracts/allies-and-supply.md#合編友軍-slotallies指揮權)：友軍 slot、指揮權與四檔勢力補給。

## 補給 SupplyTier（勢力給的，不走市場）

見 [合編與勢力補給](mercenary-contracts/allies-and-supply.md#補給-supplytier勢力給的不走市場)。

## 條件、代價與結算

見 [結算、背叛與作戰情境](mercenary-contracts/settlement-and-scenarios.md#條件代價與結算)：契約報酬與代價、選邊背叛及作戰情境生成。

## 被雙方雇用、選邊、背叛

見 [結算、背叛與作戰情境](mercenary-contracts/settlement-and-scenarios.md#被雙方雇用選邊背叛)。

## 作戰情境生成（ScenarioGen 擴充）

見 [結算、背叛與作戰情境](mercenary-contracts/settlement-and-scenarios.md#作戰情境生成scenariogen-擴充)。

## 替使用者做掉的決定

1. **不加動詞、不加房間**：參戰是契約的一種，板／接／棄／出戰四個既有動詞夠用。
2. **指揮權三式、玩家不碰友軍 AI**：想指揮就要 attached 並承擔其損失，省掉 core 的 Assignment 外露。
3. **補給是外源入帳、不是免費魔法**：守恆不變量照跑，`reason` 標明雇主，測試可查。
4. **share 用貢獻比、不另按頭**：避免雙重計頭，也讓抽象結算與戰術戰鬥同一把尺。
5. **沒接不算罪、背叛只有三種可判定的形狀**：規則能寫成測試，不靠「意圖」判斷。
