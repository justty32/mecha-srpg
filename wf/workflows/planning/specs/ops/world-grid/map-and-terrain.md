# map-and-terrain — 六張圖、尺度、地形層與區域層、迷霧、地點、航道、內容檔格式

[world-grid README](README.md)｜移動在 [movement](movement.md)｜蝕域層在 [rifts-on-grid](rifts-on-grid.md)

## 六張圖與尺度

**一格＝船一天航程的十分之一**（地球；設計對照約舊制四十公里，只供設計者換算、不進任何文本），月面格是地球的一半（`cell_km` 欄留數字給產生器）。地球五張：長陸（亞歐，250×150）、赭洲（非洲，200×190）、霧陸（北美，160×200）、綠淵（南美，120×180）、南墟（澳洲與群島，110×90）；月面一張「靜海面」（120×120，正面左半、背面右半）。南極「白淵」2097 年整塊被蝕潮吞沒，不做圖、只在 lore 與事件文本出現。各圖的舊名、蝕核、迷霧模式、出口在 `continents.json`。最大一張 37,500 格、六張合計約 15 萬格——地形層是靜態的 `Uint8Array`，動態資料全是稀疏表，記憶體與存檔都小。

## 層 Layers

每張圖三個靜態層（內容檔）＋兩個動態層（存檔）：

| 層 | 性質 | 內容 |
|---|---|---|
| `base` | 靜態、每格一值 | 地形種類（`terrain-layers.json` 的 id）：潮海、淺灘、平野、荒野、林海、山脊、雲嶂、沙海、濕地、冰原、城廓、月壤、月坑、月脊 |
| `region` | 靜態、每格一值、可省 | 區域 id（「恆河口」「孟加拉灣蝕線」…）：給契約目標、文字描述、作戰 `Loc.region` 用；沒畫的格 region 為 `""` |
| `road` | 靜態、稀疏 | 道／軌格集合：地面行動者成本折半，船不受影響 |
| `blight` | 動態、稀疏 | 蝕塊（見 rifts-on-grid）：每格 `{ rift, patch, depth }` |
| `known` | 動態、稀疏 | 玩家對每格**物件與蝕域**的最後所見日（見迷霧） |

地形只影響四件事：移動成本（分 `air`／`ground` 兩欄）、視野修正、遭遇權重、以及 ScenarioGen 抽戰場地形的池（`battlePool`，取代 `NodeDef.terrainPool`）。全在資料檔，程式只查表。

## 可視區與迷霧

迷霧是**資訊年齡**不是黑幕。`continents.json` 的 `fog` 欄兩種：`charted`（地形永遠可見——天網還在、地球早畫過圖；只有行動者與蝕域要靠「看到」）、`dark`（地形也要看過才知道：月面背面、霧陸北半，星哨早斷了）。每天 tick 第 3 段結束後重算可見集合：船半徑 `sight`（基準 5 格，山脊上 +1、濕地雲嶂 −1、月面 +2）∪ 每個 `rep ≥ 0` 且有 `uplink` 服務的地點半徑 6（天網轉播）∪ 本日購得的情報（事件效果 `reveal { region | cell; radius; days }`）。可見格把 `known[cell] = { day, actors[], blight }` 寫成快照；畫面上用快照、年齡越大越灰。賣情報的地點（稽古學會、黑市）就是賣 `reveal`。對 AI 沒有迷霧（行動者 AI 直接讀真值；它們本來就只做簡單事）。

## 地點 PlaceDef（取代 NodeDef）

```ts
type PlaceDef = { id: Id; name: string; map: Id; at: Cell; footprint?: Cell[] /*預設只佔 at；城邦 3×3、蝕核城 5×5*/;
  kind: "city" | "port" | "ruin" | "outpost" | "rift-site" | "lunar-base" | "beacon";
  owner?: Id; pop?: number; services: ServiceId[] /*market／recruit／repair-dock／medbay／uplink／lane／registry…*/;
  ruin?: { depth: number; seedTable: Id; discovered: boolean }; sight?: number; tags: string[] };
type PlaceState = { def: Id; ownerOverride?: Id; wreckage: LootBundle[]; lastVisit?: number; flags: string[] };   // 原 NodeState 去掉 blight
```

地點是**格上物件**：船停在 `footprint` 任一格就能 `dock`（進城、開房間面板）；契約 `target.place`、事件 `where:"place"`、市場、招募池都掛它。`rift-site` 是裂縫開口的地點（開裂時由程式建立、封口後變 `ruin` 或刪除——異形自閉的留一個 `beacon` 當事件點）。遺跡仍是 `kind:"ruin"`，探勘入口不變。地球約 31 城＋ 20 港／據點＋ 25 遺跡，月面約 12 個；量級與第一版相同，只是多了座標。

## 航道 LaneDef（取代 RouteDef 與 FerryDef）

```ts
type LaneDef = { id: Id; a: Id /*place*/; b: Id /*place，可在另一張圖*/; kind: "land-bridge" | "sea-lane" | "air-lane" | "orbital";
  days: number; departDays?: number[] /*空＝隨時*/; fare?: NumExpr; fuelPerDay?: number; carriesShip: boolean;
  capacity?: { mechs: number; persons: number }; requires?: Id[]; hazards: Id[]; tags: string[] };
```

圖內**沒有**路線——那是尋路的事。航道只接**不同圖**（或同圖不相連的海島）：`land-bridge`（蘇伊士、巴拿馬、白令冰橋：1 天、免費、船自己飛過去）、`air-lane`（船自己跨洋：3–6 天、吃燃料、途中事件表是「洋上」）、`sea-lane`（船壞了或省燃料時被貨輪載：弦月開、票價、慢）、`orbital`（渡月船：三赤道港→靜海市，弦月開、3 天、船留港、生物系要密封艙——第一版渡輪規則原樣搬進來）。尋路跨圖時把航道當一條邊（見 movement）。

## 內容檔格式

```
content/<pack>/world/maps/<map>.json      # 一張圖一檔：尺寸、圖例、base／region 逐列 RLE、road 稀疏表
content/<pack>/world/places/<id>.json     # 一地點一檔（原 nodes/）
content/<pack>/world/lanes/<id>.json      # 一航道一檔（原 routes/ 與 ferry.json）
content/<pack>/world/regions/<map>.json   # 區域 id→名字、描述片語、所屬圖
```

圖檔不是一格一筆：`base.rows` 是**每列一個字串**、每字元一格查 `legend`；字元後可接重複數（`"~40.12^3"`＝40 格潮海、12 格平野、3 格山脊）；`region.rows` 同法、圖例另一張。長陸 250×150 原始 37.5 KB，RLE 後約 6–10 KB。載入器展開成 `Uint8Array`，再切 32×32 **區塊**供渲染與 dirty 追蹤（區塊是執行期概念，不進檔）。`npm run check` 驗：每列長度＝width、字元都在圖例、每個地點座標在圖內且不在雲嶂／潮海（港例外）、航道兩端存在、`fog:"dark"` 的圖至少有一個 `charted` 地點（登陸點）。圖檔由內容線用產生器從 1/4 解析度手畫字元圖放大＋雜訊生成，程式不管。

## 資料檔

`continents.json`（6 列）欄位：`id`、`name` 2108 叫法、`old_name` 舊名、`size` 寬×高、`cell_km`、`fog`、`cores` 蝕核城、`lanes_out` 出口摘要、`flavor` 一句。`terrain-layers.json`（14 列）欄位：`id`、`name`、`glyph` 圖例字元、`air_cost`／`ground_cost` 進格成本（移動點，`-`＝不可進）、`sight` 視野修正、`encounter` 遭遇權重倍率、`rift_affinity` 新裂縫落點權重、`battle_pool` 對應的戰場 TerrainDef、`flavor`。

## 替使用者做掉的決定

1. **一格＝十分之一日程**：比一半尺度少四倍格數，仍讓孟加拉灣那條蝕線有十幾格可以推；月面格減半讓一張圖裝兩面。
2. **五洲＋月面＝六張、南極只在 lore**：使用者說「每大洲」，南極沒有人就沒有契約；「被吞沒的洲」比「空白的洲」有故事。
3. **region 是第二張字元圖**：比多邊形便宜、比 Voronoi 可控，寫手畫得出來，作戰 `Loc.region` 直接有值。
4. **航道只接圖與圖**：圖內一律尋路，避免兩套移動模型並存。
5. **遺跡仍是地點、不是地形**：探勘入口與事件鏈不動。
