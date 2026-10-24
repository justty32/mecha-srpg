# migration-and-testing — 節點→地點、路線→尋路的遷移，要改的模組與欄位，headless 測試策略

[world-grid README](README.md)｜模組表 [architecture-ops](../architecture-ops.md)｜內容佈局 [content-format-ops](../content-format-ops.md)｜實作現況 `src/ops/world/`（唯讀）

## 型別與資料的對照

| 第一版 | 方格版 | 說明 |
|---|---|---|
| `NodeDef`／`NodeState` | `PlaceDef`／`PlaceState` | 多 `map`、`at`、`footprint`；去掉 `terrainPool`（地形從格來）與 `blight` |
| `RouteDef`、`FerryDef` | `LaneDef` | 圖內無路線；只剩跨圖航道，渡輪是 `kind:"orbital"` |
| `NodeState.blight`、`RiftState.zones` | `BlightPatch`、`RiftState.patches` | 區＝蝕塊；深度由塊齡算 |
| `RiftState.node` | `RiftState.at: Loc`＋`site` | 開裂自動建 `rift-site` 地點 |
| `ShipState.at`／`route` | `pos: Loc`、`path`、`mpCarry` | 每天沿格走 |
| `Sortie.node`、`ContractState.target.node` | `loc: Loc`、`target.place`／`target.loc` | 契約仍指地點；遭遇戰只有格 |
| `EventDef.where: "node" \| "route"` | `"place" \| "field" \| "lane"` | 野外事件按地形與蝕深抽 |
| `adjacentNodes()` | `neighbors(cell)`／`frontier(patch)` | 八鄰 |
| — | `ActorState`、`maps[].known` | 新增 |

`CampaignState` 新增 `maps: Record<Id, { blight: Record<CellKey, {rift; patch}>; known: Record<CellKey, KnownCell> }>`、`actors: Record<Id, ActorState>`、`patches: Record<Id, BlightPatch>`；`nodes` 改名 `places`。存檔版本 `version: 2`，不提供 v1 轉換（第一版沒有正式存檔）。

## 要改的模組（`src/ops/`）

**載入與幾何**：`ops/content` 多載 `maps/`（RLE 展開成 `Uint8Array`、區塊化）、`places/`、`lanes/`、`regions/`、`actors/`，`check.ts` 加列長、圖例、座標、航道兩端、dark 圖登陸點五項驗證；新模組 `ops/world/grid` 放 `findPath`、`neighbors`、`distance`、`sight`、`frontier`、`floodFill`，純函式、無狀態。

**世界**：`travel.ts` 改名 `move.ts`——`cmdSail`（to 三型、跨圖）、`moveDaily3`（MP、carry、航道、到站、視野、接觸）、`cmdDock`／`cmdDrift`／`wait`；`nodes.ts` 改名 `places.ts`，失守／收復看 footprint，`worldRules` 加 MP、接觸、遭遇率；`rifts.ts` 與 `pressure.ts` 改成蝕塊生長／LIFO 退、新裂縫落點抽格、`rift-site` 建立；新模組 `actors.ts`（五種 AI、spawn／despawn、接觸檢查、遭遇 `prompt`）與 `fog.ts`（可見集合、`known` 快照、`reveal` 效果）。

**編排與接口**：`ops/time/tick.ts` 段 2c 跑行動者 AI、段 3 改呼叫 `moveDaily3`＋行動者移動＋接觸、段 3 末重算視野；`ops/sortie/scenario.ts` 第 (1) 步改讀格（地形池、蝕深、地點模板、三方 slot）；`ops/contracts` 改 `target.place`，護送契約綁商隊行動者、`join` 契約綁 force；`ops/text` 加 `sail` 三型參數的 parse／format、`Screen.panels.map`、遭遇與 `Sighted` 模板、地點描述用 `region` 名；`ops/sim` 不變量加尋路／守恆／退化三組，policy `greedy` 改用格距離挑契約；`ui-ops`（另線）做大地圖面板，見 [ui-contract](ui-contract.md)。

`ops/crew`、`ops/state/ledger`、`ops/world/market`、`resupply`、`explore` 不動（探勘仍以地點為入口）。

## 切線順序

(1) `content`＋`grid`＋40×40 測試圖與 6 個地點、2 條航道（含 orbital）→ (2) `move`＋`places`＋`tick` 段 3 → (3) `rifts`＋`pressure` 蝕塊 → (4) `actors`＋`fog`＋遭遇 → (5) `scenario`／`contracts`／`text` 收尾 → (6) 內容線產六張正式圖 → (7) `ui-ops` 大地圖。每線都要讓 `npm run sim:campaign -- --months 12` 綠燈。

## headless 測試策略

**(1) 尋路正確**（表格驅動、固定小圖）：已知最短成本的 12 個案例（直線、斜線、繞山、繞雲嶂、穿淺灘、跨航道含等船天數）；不存在路徑回 `undefined`；路徑每步都是八鄰且無不可進格；同輸入兩次結果逐格相同；啟發式 admissible（A\* 成本 ＝ Dijkstra 成本，隨機 200 圖對照）；長陸全圖隨機 100 對 < 10 ms 均值。

**(2) 移動時間守恆**：(a) 連續航行總天數 ＝ `ceil(Σcost / mp)`（carry 正確）；(b) 直達 A→B 的天數 ≤ A→C 停一天→B；(c) 每個移動日恰扣一次 `fuelPerDay`（深蝕 ×2），`Posted` 筆數＝移動日數；(d) `等 7` 與七次 `等 1` 在航行中事件序列相同；(e) `pendingEncounter`／`pendingChoices` 非空時 `pos` 不變；(f) 船永不在 `-` 格、地面行動者永不在深蝕。

**(3) N 蝕月模擬不退化**（`idle`／`greedy`／`random` × 12 蝕月 × 6 seed，六張正式圖）：不拋錯；蝕化格數單調不爆（12 蝕月後 < 陸格 15%、每蝕月增量 < 3%）；行動者數在 [40, 200]；無行動者連續 10 天 `goal` 不變且未移動（卡死偵測）；每天遭遇數 ≤ 2、12 蝕月平均 0.1–0.4／天；蝕塊永遠連通、核塊永遠含 `at`；`known` ⊆ 真值（迷霧不洩漏未來）；每 tick < 50 ms；每蝕月印一行（蝕格數、行動者數、遭遇數、商隊損失）。

**(4) 蝕域屬性**：每塊 7–12 格且連通；深度與 `sinceDay` 一致；LIFO 退塊後 `patches` 仍是前綴；城 footprint 被蝕 ⇔ `ownerOverride`；菌絲未 `burned` 不退。

**(5) 黃金戰役**：40×40 測試圖、固定 seed、40 條指令：`sail 格 → Encounter → choose 迴避 → Evaded → sail 地點 → Arrived → accept → sail rift-site → BattleResolved → RiftPhase`，事件序列與 hash 存黃金檔。

**(6) 恆等**：`parse(formatCommand(sail))` 對三型 `to` 往返一致；按鈕／快捷鍵／文字三路 state hash 相同（沿用）。

## 替使用者做掉的決定

1. **不做 v1 存檔轉換**：第一版沒人存過檔；省一支永遠不會跑的轉換器。
2. **`nodes` 改名 `places`**：留舊名會讓「節點」這個已廢的概念在程式裡活下去。
3. **先用 40×40 測試圖落地、正式圖交內容線**：規則與內容分開驗，六張大圖不擋程式切線。
4. **退化判準寫成數字**（15%、3%、[40,200]、0.1–0.4／天）：使用者說過要可執行判準；數字可調。
5. **`ops/world/grid` 無狀態**：尋路與幾何只吃 `Uint8Array` 與參數，行動者與船共用、好 fuzz。
