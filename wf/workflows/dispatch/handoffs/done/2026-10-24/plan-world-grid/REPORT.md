# REPORT — plan-world-grid：營運層方格大地圖 spec（頂層代存，2026-10-24）

STATUS：**DONE**，commit `4bb84a1`（9 檔，未改既有檔）。

## 新增檔（`specs/ops/world-grid/`）
`README.md`、`map-and-terrain.md`、`movement.md`、`actors-and-encounters.md`、`rifts-on-grid.md`、`migration-and-testing.md`、`ui-contract.md`、`continents.json`（6 列）、`terrain-layers.json`（14 列）。

## 核心設計
- **尺度**：一格 40 km（月面 20 km）。長陸（亞歐）250×150、赭洲（非洲）200×190、霧陸（北美）160×200、綠淵（南美）120×180、南殼（澳洲）110×90、靜海面（月面）120×120；南極「白淵」被潮吞沒只在 lore。靜態層＝字元圖＋逐列 RLE＋圖例，執行期 32×32 區塊；`region` 為第二張字元圖，供 `Loc.region`。
- **移動與時間**：移動點制（船 100／天、平野 10）、八方向 A\*、斜走 ×1.4；`sail` 只寫路徑，tick 第 3 段每天沿格走；可 `dock`／`drift`／重下 `sail`；追擊＝航向行動者每天重算；燃料按移動日扣；深蝕可飛過但貴且必擲遭遇。
- **遭遇**：行動者五種（勢力部隊、巡邏、商隊、裂獸群、別的獵團）各一張 AI 表；接觸切比雪夫 1／2 格；四選迴避／追擊／交涉（人類限定）／開打；ScenarioGen 從該格與八鄰的 `battle_pool`、蝕深、地點模板、在場行動者生成，三方入 `third` slot。
- **裂縫擴散**：蝕塊（7–12 格連通）；每大潮 `1+floor(anchorAge/2)` 塊從邊緣洪水填充；深度由塊齡算；核 1→3×3；收縮 LIFO、菌絲需 `burned`；城被蝕即失守；新裂縫七成邊緣、三成野地；月面不開新裂縫（內容開關）。
- **洲際**：圖內無路線一律尋路；圖間只有 `LaneDef`（陸橋、洋航、貨輪、渡潮船 `orbital`）；跨圖尋路取最短總天數。
- **迷霧**：地形永遠可見，物件與蝕域靠視野／天網地點／買來的 `reveal`；月面背面與霧陸北半 `dark`。
- **UI**：抽 `GridView` 共用戰場渲染；九圖層、三段縮放＋縮圖、`Enter` 航向游標格、`keymap-ops.json` 新 context `map`；`sail.to` 三型（地點／格／`@行動者`），不加動詞。

## 替使用者做掉的決定（前 5）
1. 一格 40 km、八方向、移動點制，船一天 8–10 格。
2. 地形永遠可見、只有物件與蝕域有迷霧。
3. 蝕域以 7–12 格蝕塊長退，深度只由塊齡算。
4. 洲際走航道，渡潮船併入航道。
5. 不加動詞：追擊＝`sail` 到行動者、迴避＝`drift`、交涉＝遭遇 `prompt`。

## 整合清單（待另派）
1. `specs/ops/README.md`：導航加 `world-grid/`、模型與模組圖改方格。
2. `data-model-world-map.md`：節點／路線、NodeState 改指 world-grid；`RiftState.node`／`zones`、`ShipState.at`／`route`、`FerryDef` 標已取代；決定 1、5 作廢。
3. `constraints-ops.json`：USR-10、USR-11 已由 plan-ops-war 佔用編號——方格兩條另取新編號；WV-02 註記被推翻。
4. `time-and-tick.md`：段 3 改沿格走＋接觸＋視野；段 2 加行動者 AI。
5. `text-ui-contract.md`：`sail.to` 三型；`bridge` 加大地圖面板；事件 `where` 改 `place | field | lane | ship | ruin`。
6. `architecture-ops.md`：模組表加 `grid`／`actors`／`fog`；`CampaignState` 加 `maps`、`actors`、`patches`、`nodes→places`；測試加三組不變量。
7. `content-format-ops.md`：佈局改 `maps/ places/ lanes/ regions/ actors/`；已滿 8 KB → 拆資料夾型（plan-ops-war 也建議）。
8. `battle-interface.md`：ScenarioGen 第 1 步引 actors-and-encounters；`Sortie.node→loc`、trigger 加 `intercept`。
9. `data-model-operations-war.md`：`Loc.region` 註解、`ForceState.pos` 指 `ActorState`；`transferNode`／`NodeTransferred` 改名。
10. `data-model-factions-contracts.md`：`territory`／`target` 改 place。
11. world spec `specs/world/operations.md`「節點圖不是方格」需改寫。
12. `planning-roadmap.json`：加 world-grid 實作切線與六張正式圖。

## 實作切線
(1) `ops/content`＋`ops/world/grid`＋40×40 測試圖 → (2) `move`＋`places`＋tick 段 3 → (3) `rifts`＋`pressure` 蝕塊 → (4) `actors`＋`fog`＋遭遇 → (5) `scenario`／`contracts`／`text` 收尾 → (6) 內容：六張正式圖產生器＋地點座標＋航道 → (7) ui-ops 大地圖面板（GridView 抽共用）。驗收 `npm run sim:campaign -- --months 12`＋六組測試；退化判準：12 潮月蝕格 <15%、行動者 [40,200]、遭遇 0.1–0.4／天。

## 需要使用者裁示
1. 深蝕格可飛過（貴、必遭遇）。2. 迷霧「地形永遠可見」（要探索感改 `dark`）。3. 月面不開新裂縫。4. 南極只在 lore。5. 大洲與地形命名（長陸／赭洲／霧陸／綠淵／南殼／靜海面）可整批換。
