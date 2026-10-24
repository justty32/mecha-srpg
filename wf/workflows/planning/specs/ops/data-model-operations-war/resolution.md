# data-model-operations-war／resolution — 抽象結算、玩家參戰的那一場、tick 第 2 段順序、後果詞彙

[data-model-operations-war 入口](../data-model-operations-war.md)｜[ops README](../README.md)｜tick 八段 [time-and-tick](../time-and-tick.md)｜測試 [war-testing](../war-testing.md)

## 抽象結算（沒人參戰的那幾天）

每個 engage 日：`r = str(force) / enemyStr`（含傭兵加入的戰力與補給修正）。`progress += clamp(0.25 × √r × m, 0.05, 0.6)`，`m` 為 0.7–1.3 的擲值；己方 `readiness` 全體 ×(1 − clamp(0.12 / r, 0.03, 0.25))、`count` 依比例折損成整數；敵方 `enemyStr ×= (1 − clamp(0.2 × r, 0.05, 0.4))`；`supply −10`。終止：`progress ≥ 1` → `resolve` 成功；`str < 0.3 × 初值` 或 `morale ≤ −2` → `failed`；`supply ≤ 0` → `aborted`（退兵，後果輕）。裂獸目標的 `enemyStr` 在大潮日回補（出巢）。全是純函式 `(op, rng) → op'`，可表格測試。**位置只經 `Loc`**（[world-grid](../world-grid/README.md) 已定死 `map`／`region`／`cell`）；實作過渡期 `region` 可先填舊節點 id，邏輯不改。

## 玩家參戰的那一場

玩家接了 `join` 契約且船與分遣隊同區域，engage 日不做抽象結算，改寫 `pendingBattle`（`Sortie.trigger:"operation"`、`Sortie.operation`）；情境、友軍 slot、補給見 [mercenary-contracts](../mercenary-contracts.md)。戰果回寫：勝 → `progress += 0.4 × (作戰規模係數)`、敵 `enemyStr` 依 `BattleResult` 死亡單位折算；敗 → `progress` 不動、分遣隊 `morale −1`；友軍 slot 單位的 `dead` 寫回 `force.units` 折損。一場戰鬥結束不了大作戰（A 級攻堅要三四場）；玩家缺席或中途離開的日子照抽象推進——**世界不等人**。

## tick 第 2 段的順序（補 time-and-tick）

2a 裂縫狀態機（大潮日）→ 2b 外交日結（漂移、條約到期、停火檢定）→ 2c **作戰推進**（每場依 `id` 序：階段倒數、engage 抽象結算或寫 `pendingBattle`、終止判定與後果）→ 2d 行動牌（可能發起新作戰、宣戰、簽約）→ 2e 新裂縫與蝕壓（大潮日）→ 2f 研發推進（每蝕月第 1 天）。先外交再作戰（作戰查最新 `RelState`），先作戰再行動牌（新作戰最快明天 `muster`）。

## 後果詞彙（OpsEffect 新增）

`startOperation`、`opProgress`、`transferPlace`（原 `transferNode`，2026-10-24 改名）、`transferShell`、`relation { a; b; delta; reason }`、`treaty`、`leakModel`、`forceLoss`。事件：`OperationStarted/Phase/Engaged/Resolved/Failed/Aborted`、`ShellSeized`、`PlaceTransferred`（原 `NodeTransferred`）。`onSuccess` 只是這些詞彙的組合：清剿退蝕塊、攻堅 `setRift`、奪點 `transferPlace`、尋墟 `transferShell`、踩到對方工坊區域擲 `leakModel`。
