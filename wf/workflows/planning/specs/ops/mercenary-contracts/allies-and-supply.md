[mercenary-contracts 入口](../mercenary-contracts.md)

# 合編與勢力補給

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

