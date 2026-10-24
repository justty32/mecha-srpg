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

`command` 三式。**independent**：勢力單位進 `ally` slot（`faction` 為雇主、`ai` 為其 `FactionDef.strategy`），`slots.player.allies=["ally"]`、`slots.ally.allies=["player"]`——AI 自己打，玩家只管自己人；核心 `eliminate` 只計敵對 slot，友軍死不算玩家的頭。**attached**：勢力撥一小隊（1–3 台，從分遣隊 `ForceUnit` 抽、人物由 `backgrounds` 臨時生成）**直接放進 `player` slot**，玩家完全指揮；它們的死傷寫回分遣隊折損並從賞金扣（每台 `gp × k`）。**mixed**：主力 independent＋一小隊 attached，是預設。指揮權的另一面是**軍令** `orders`：寫成玩家 slot 的 `optional` 目標（「守住西側」`hold`、「先殺錨」`killTarget`、「別碰砲台」`destructible` 計數），戰後由 `BattleResult` 判定；未達成 `violations++`，每次 `share −5%`、`rep −3`；`violations ≥ 3` 雇主解約並記 `memory: insubordinate`。玩家無法指揮 `ally` slot 的 AI（core `Assignment` 不外露）；想指揮就選 `attached`。

## 補給 SupplyTier（勢力給的，不走市場）

| 檔 | 彈藥 | 維修 | 醫療 | 借機 | 情報 |
|---|---|---|---|---|---|
| none | — | — | — | — | 契約板只見作戰名與目標 |
| field | 每場戰前 `ammo*` 池補滿 | — | 戰後 hp 回復 ×1.5（1 天） | — | 見敵方族／寬度 |
| full | 同上 | 每日注入雇主 `techHours`（技師 2 人量級），`scrap` 由雇主出到上限 | 醫務 ×2，暫時傷時鐘 −1 額外 | 可借 `loan.models` 中 1 台 D／C | 見敵方完整 `EnemySnapshot` 與地圖模板 |
| arsenal | 同上＋拘束彈 | 工時與材料不設上限（作戰期間） | 同上＋一次 `cleanse` 白名單傷 | 借到 `loan.max` 台、可到 B | 同上＋戰前 `scan` 注入（起手已揭露敵外層） |

全是營運層效果：彈藥是 `Resupplied{reason:"faction-supply"}`、不扣 `cash`（外源、`ref` 指契約）；維修是 `techHours +`、材料帳 `stock:scrap` 由 `ledger` 外源入帳再被 job 吃掉（守恆仍可斷言）；醫療是 `ServiceDef` 乘數掛在船上到契約結束；情報是 `Sortie.injected` 一條 `effect/briefing`（perception contribution）或起手 `revealed`；借機是臨時 `MechState`（`owner:"faction"`、`loaned: contract`）進機庫位，契約結束必還、戰損照價從賞金扣、`derelict-lost` 或私吞 → 全額入 `cash` 負數並 `rep −20`。補給檔由 `rep` 分層決定，模板可覆寫；高檔補給是「跟大勢力混」的實質好處，也是其部隊機型外流的途徑（研發檔 `leakModel`：借來的機被玩家轉賣會流出）。

## 條件、代價與結算

結算在作戰 `aftermath`：`pay = base + share × 作戰賞金 × 貢獻比`，貢獻比＝玩家 slot 造成的敵方頭數／作戰總殲滅（抽象結算的頭數按 `enemyStr` 折算）；`join` 的 `perHead` 不另算（避免雙重計頭）。扣項：attached 單位損失、借機戰損、違令。rep：勝 `+5..+15`、敗 `+2`（出了力）、退場 `−5`。外交連帶：對手勢力 `rep −10..−25`、其盟友 `−5`、雇主盟友 `+2`（驅動表 `player-join`）。**凡鐵空援**照常（原稱十分律空援）：雇主補給不含空援券，城邦砲台在雇主的城才站你這邊。

## 被雙方雇用、選邊、背叛

`sides:"both"` 作戰的兩份 `join` 都在板上，接一份另一份立刻 `expired` 並記對方 `memory: refused-us`（不扣 rep——沒接不是罪）。**背叛**三種：接了 `exclusive` 又接對方（擋在 `accept` 檢查，不可能發生）；中途 `drop` 後 ≤ 7 天接對方 → 背叛；接了尋墟作戰的 `join`、戰場上自己把古代機帶走（`reachExit` 時古代機在玩家單位手上）→ **私吞**。背叛／私吞：被背者 `rep −40`、殘聯 `rep −15`（獵牌污點）、得利者 `rep +10`、flag `blacklist:<faction>` 3 蝕月；被背者對得利者 `relation −6`。私吞的古代機 `holder:"player"`、`knownBy` 含被背者——他們會來要。代理戰爭（雇主 `covert`）：玩家是曝光機率的主因（每個未撤退單位 +20%），曝光後對手把帳算在雇主與玩家兩邊。

## 作戰情境生成（ScenarioGen 擴充）

`Sortie.trigger:"operation"` 時 `generateScenario` 多做：(1) 地圖：目標格與八鄰的 `battle_pool`＋蝕深（對裂獸）或城邦地點模板（對人），同 battle-interface 第 (1) 步；`engage_objective` 查作戰種類表定目標。(2) 敵方：裂獸由 `rift` 快照；人類由目標勢力分遣隊 `ForceUnit` 按戰力預算抽 `UnitSpawn`（機型即其已釋出 `ModelDef`，人物臨時生成）。(3) 友軍：依 `command` 填 `ally` slot 或塞進 `player` slot；友軍規模＝分遣隊 `str × 0.3..0.6`（別讓 AI 搶光頭）。(4) 目標：玩家 `win` 目標＋`orders` optional＋敵方 `eliminate`。(5) 補給注入。回寫：`ally` 單位 `dead` → 分遣隊折損；進度 `+0.4×規模係數`；古代機在誰手上寫 `ShellState`。**依賴**：`BattleResult.units` 需涵蓋所有 slot（含 `ally`）——core 若只回玩家 slot，列為 core 建議。

## 替使用者做掉的決定

1. **不加動詞、不加房間**：參戰是契約的一種，板／接／棄／出戰四個既有動詞夠用。
2. **指揮權三式、玩家不碰友軍 AI**：想指揮就要 attached 並承擔其損失，省掉 core 的 Assignment 外露。
3. **補給是外源入帳、不是免費魔法**：守恆不變量照跑，`reason` 標明雇主，測試可查。
4. **share 用貢獻比、不另按頭**：避免雙重計頭，也讓抽象結算與戰術戰鬥同一把尺。
5. **沒接不算罪、背叛只有三種可判定的形狀**：規則能寫成測試，不靠「意圖」判斷。
