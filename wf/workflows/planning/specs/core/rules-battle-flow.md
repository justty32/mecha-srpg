# rules-battle-flow — 部署、撤離、棄機、捕捉、勝負、戰後

[core README](README.md)｜情境資料 [data-model-world](data-model-world.md)｜headless 跑法 [architecture](architecture.md)

裁示：整機到地圖邊緣撤離、另支援棄機逃生（機甲留場可能被怪獸占或事後回收）；捕捉是生物系來源（核完整才能捕，取自 plan-world 暫定裁示）；戰後不補滿；一場不限機甲數、一局時長不限；傳統兵器十分之一（已在攻擊結算的全局修正表）。

## 戰鬥生命週期

```
load(scenario, content) → deploy → [round]* → end(result) → BattleResult
```

每個階段都是純函式 `(state, input) → (state', events)`；`sim` 模組負責串起來並餵 AI 指令。

## 部署

情境給每個 slot `deployZones`；玩家 slot 收 `Deploy(unitId, cell)` 指令，AI slot 由策略插件的 `deploy()` 決定（預設：依 `UnitSpawn.at`，`"zone"` 者在區內均勻抽格）。不限數量；超過區格數時溢出單位排入「援軍佇列」，於後續輪始從區內空格進場（排隊尾）。部署完寫 `BattleStart` 事件、第 1 輪開始。

## 撤離 Retreat（整機）

`Retreat` 指令只在單位位於 `map.exits` 任一格時合法；結算：單位狀態凍結、從地圖移除、標 `retreated`、仍帶回營運層。情境 `rules.noRetreat` 可禁撤（CHR-15 改造：不做 BB「全員在邊緣才算安全撤退」，個別單位各自撤）。撤離者不再分 XP。

## 棄機 Eject

`Eject` 任何位置合法，成本 1 AP（常數）。結算：座位人物全部移出，成為 frame=`infantry` 的新 `MechState`（內容包提供 `infantry` body plan：一層 flesh、速度高、無攻擊或只有手槍級能力），放在相鄰空格；原機甲成為 `derelict` 單位（無座位、`controlMode:"none"`、保留部位狀態、仍可被攻擊）。derelict 的命運：① 戰鬥中被敵方 `capture` 類能力（怪獸族可宣告 `occupy` 行為：相鄰 derelict 時花一回合「占據」→變該族控制的單位，用原 frame 但 `aiProfile` 換成族的）；② 戰後若其格在勝方控制範圍（勝方有單位距離 ≤ k）則回收，否則流失。徒步人物死亡＝人物死亡。

## 捕捉 Capture

目標需為 `tags` 含 `kaiju` 且 `SpeciesDef.capture` 有宣告的單位；條件：`requireIntact` 功能部位（預設 `core`，即「核完整」）皆未毀、`requireBroken`（預設 `locomotion` 全部）皆已毀；由帶 `tags:["capture"]` 的能力（拘束具）對其使用，`require` 可再加人物條件（承擔餘裕）。成功：單位轉為玩家 slot 的 `captured` 狀態、`frame` 改成 `capture.frame`（預先定義好帶 `restraint`／`cockpit` 槽的生物 FrameDef），各層 HP 原樣帶走；戰後進營運層再裝部件。被捕單位在戰鬥剩餘時間不行動。母體被捕時子體依 `tether` 處理（視同母體死亡）。

## 勝負

每輪輪末與每次單位死亡／撤離後評估 `objectives`：按宣告順序，第一個完成且 `onComplete != "continue"` 的決定結果；`rounds` 到上限而無人勝＝情境宣告的 `timeout` 結果（預設 lose for player）。無目標的情境預設 `eliminate` 對所有敵對 slot；敵對一律由 `hostileSlots()` 判定（情境 `allies` ∪ FactionDef `ally`，對稱；neutral 算敵對，見 data-model-world）。斷繫、失控單位不算任何 slot 的「存活」。結果事件 `BattleEnd{ winner, reason }`。

## BattleResult（交給營運層的唯一介面）

```ts
type BattleResult = { winner: FactionSlot | null; reason: string; rounds: number;
  units: { id: Id; status: "alive" | "dead" | "retreated" | "derelict-recovered" | "derelict-lost" | "captured"; state: MechState }[];
  persons: { id: Id; status: "alive" | "dead"; state: PersonState; xpGained: number }[];
  loot: { fromUnit: Id; components: Id[]; materials: Record<string, number> }[];   // 掉落規則由內容包的 lootTables 決定
  log: EventLogRef };
```

戰後不補滿、不修理、不治療——都在營運層。XP 已在戰鬥中逐次發放（CHR-17），`xpGained` 只是彙總。

## 傳統兵器

情境可放 `tags:["conventional-arms"]` 的單位（戰機、砲兵）或由 `faction` 以「呼叫支援」能力投射（`target.kind:"ball"`、不需 LOS、冷卻長）；傷害經全局修正表對 `kaiju` ×0.1，對人類機甲全額——也就是傳統兵器在對人戰場完全正常，這是裁示的自然推論。

## 替使用者做掉的決定

1. **個別單位各自撤離**：BB 全員在邊緣才算安全撤退不適合「不限機甲數」的大場面。
2. **棄機後的駕駛員是 infantry 單位、機甲是 derelict 單位**：都重用 MechState，不加新實體；「被怪獸占」是族的 `occupy` 可選行為。
3. **捕捉條件可由族資料改寫**：預設「核完整＋行動部位全毀」，菌絲族等可宣告不同條件。
4. **勝負在輪末與每次死亡／撤離後評估**：即時結束讓測試斷言簡單；代價是同輪後續單位不行動。
5. **BattleResult 是戰鬥引擎對營運層的唯一出口**：營運層不可直接讀戰鬥內部狀態，避免耦合。
