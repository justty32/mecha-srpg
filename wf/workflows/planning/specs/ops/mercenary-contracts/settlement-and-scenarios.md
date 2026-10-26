[mercenary-contracts 入口](../mercenary-contracts.md)

# 結算、背叛與作戰情境

## 條件、代價與結算

結算在作戰 `aftermath`：`pay = base + share × 作戰賞金 × 貢獻比`，貢獻比＝玩家 slot 造成的敵方頭數／作戰總殲滅（抽象結算的頭數按 `enemyStr` 折算）；`join` 的 `perHead` 不另算（避免雙重計頭）。扣項：attached 單位損失、借機戰損、違令。rep：勝 `+5..+15`、敗 `+2`（出了力）、退場 `−5`。外交連帶：對手勢力 `rep −10..−25`、其盟友 `−5`、雇主盟友 `+2`（驅動表 `player-join`）。**凡鐵空援**照常（原稱十分律空援）：雇主補給不含空援券，城邦砲台在雇主的城才站你這邊。

## 被雙方雇用、選邊、背叛

`sides:"both"` 作戰的兩份 `join` 都在板上，接一份另一份立刻 `expired` 並記對方 `memory: refused-us`（不扣 rep——沒接不是罪）。**背叛**三種：接了 `exclusive` 又接對方（擋在 `accept` 檢查，不可能發生）；中途 `drop` 後 ≤ 7 天接對方 → 背叛；接了尋墟作戰的 `join`、戰場上自己把古代機帶走（`reachExit` 時古代機在玩家單位手上）→ **私吞**。背叛／私吞：被背者 `rep −40`、殘聯 `rep −15`（獵牌污點）、得利者 `rep +10`、flag `blacklist:<faction>` 3 蝕月；被背者對得利者 `relation −6`。私吞的古代機 `holder:"player"`、`knownBy` 含被背者——他們會來要。代理戰爭（雇主 `covert`）：玩家是曝光機率的主因（每個未撤退單位 +20%），曝光後對手把帳算在雇主與玩家兩邊。

## 作戰情境生成（ScenarioGen 擴充）

`Sortie.trigger:"operation"` 時 `generateScenario` 多做：(1) 地圖：目標格與八鄰的 `battle_pool`＋蝕深（對裂獸）或城邦地點模板（對人），同 battle-interface 第 (1) 步；`engage_objective` 查作戰種類表定目標。(2) 敵方：裂獸由 `rift` 快照；人類由目標勢力分遣隊 `ForceUnit` 按戰力預算抽 `UnitSpawn`（機型即其已釋出 `ModelDef`，人物臨時生成）。(3) 友軍：依 `command` 填 `ally` slot 或塞進 `player` slot；友軍規模＝分遣隊 `str × 0.3..0.6`（別讓 AI 搶光頭）。(4) 目標：玩家 `win` 目標＋`orders` optional＋敵方 `eliminate`。(5) 補給注入。回寫：`ally` 單位 `dead` → 分遣隊折損；進度 `+0.4×規模係數`；古代機在誰手上寫 `ShellState`。**依賴**：`BattleResult.units` 需涵蓋所有 slot（含 `ally`）——core 若只回玩家 slot，列為 core 建議。

