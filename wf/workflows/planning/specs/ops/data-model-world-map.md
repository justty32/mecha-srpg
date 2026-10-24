# data-model-world-map — 裂縫與蝕域狀態機、蝕壓、浮船、遺跡入口（節點／路線已由 world-grid 取代）

[ops README](README.md)｜方格大地圖 [world-grid/](world-grid/README.md)｜世界觀來源 [world/operations](../world/operations.md)、[world/rifts-and-territory](../world/rifts-and-territory.md)｜時鐘在 [time-and-tick](time-and-tick.md)

裁示：世界是地球為主、月球為次；怪獸從裂縫出現、占地盤、衍生子體（只屬某些族）；遺跡大多在地球、有些在月球；**沙盒**——玩家開著船去自己想去的地方（2026-10-24）；**大地圖本身是方格、每大洲一張、船在格上自由行動**（2026-10-24，USR-11）。第一版「世界圖是節點圖不是方格」的暫定裁示已被推翻；本檔只留**不隨地圖模型變**的部分：裂縫狀態機、蝕壓、浮船、遺跡入口。

## 節點與路線（已取代，2026-10-24）

第一版的 `NodeDef`／`RouteDef`／`NodeState`／`FerryDef` 整節**由 [world-grid](world-grid/README.md) 取代**：節點→格上地點 `PlaceDef`／`PlaceState`（[map-and-terrain](world-grid/map-and-terrain.md)），路線→圖內一律尋路、圖間走航道 `LaneDef`（渡月船是 `kind:"orbital"`），蝕域→格群「蝕塊」`BlightPatch`（[rifts-on-grid](world-grid/rifts-on-grid.md)），移動→移動點＋八方向 A\*（[movement](world-grid/movement.md)）。型別對照表在 [migration-and-testing](world-grid/migration-and-testing.md)。本檔以下所有「位置」欄一律是 `Loc = { map; region; cell }`（定義在 [data-model-operations-war](data-model-operations-war.md)）。

## 裂縫 RiftState（存檔；模板在 `rifts/<family>.json`）

```ts
type RiftState = { id: Id; at: Loc /*核心格*/; site: Id /*開裂時自動建立的 rift-site 地點*/; family: Id /*SpeciesDef.family*/; width: Grade;   // D..S
  phase: "opening" | "anchored" | "unanchored" | "sealing" | "sealed" | "receding" | "closed";
  openedDay: number; anchorAge: number; anchor?: Id /*MechState 或 MonsterDef*/; patches: Id[] /*蝕塊 BlightPatch id，取代 zones*/;
  fedCount: number;                                            // 「養裂」計數：錨死後沒守、又被送新錨的次數
  nextCheck: number };                                         // 下一個大潮日
```

狀態機（轉移只在**大潮日**或戰果回寫時發生）：`opening`（開後 0–3 天只有先鋒；此期清剿殲滅先鋒即直接 `closed`，見 [data-model-factions-contracts](data-model-factions-contracts.md)）→ 第 4 天 `anchored`（錨到，核由 1 格長成 3×3，開始每大潮蝕化 `1 + floor(anchorAge/2)` 個相鄰**蝕塊**；菌床固定 2）→ 錨被殺／捕 → `unanchored`（倒數到下個大潮）→ 大潮日：核區有守軍（玩家接了防守情境並勝）→ `sealing` → 下一個大潮仍守住 → `sealed`→ 之後每蝕月 `receding` 退最年輕的一塊（LIFO；菌絲塊要先 `burned`）→ 無 patches → `closed`（`site` 變 `ruin` 或刪除）。`unanchored` 無人守 → 新錨到，回 `anchored`、`fedCount++`、`anchorAge` 不重置。異形族模板宣告 `selfClose: true`：開一個大潮後直接 `closed`、留一個 `beacon` 地點，無 `anchored`。殺遊蕩中的巢母游態（`swarm` 行動者）＝刪除一個尚未開出的 `opening` 候選。蝕塊怎麼長、深度怎麼算、城邦何時失守，在 [rifts-on-grid](world-grid/rifts-on-grid.md)。

## 蝕壓 Pressure（全局隱藏量）

`pressure: number`（0..∞）。每天 `+base`；每個 `sealed` 事件 `−k1`；每多一塊蝕塊 `+k2`／蝕月（一塊約 10 格，量級與第一版一節點相當）。大潮日用它算：新裂縫數（泊松，均值 ∝ pressure，按各圖陸格數比例分配）、新裂縫寬度上限、開在城邦邊的機率、野地事件表的凶險檔。新裂縫落點：七成抽既有蝕域邊緣 ≤ 3 格的陸格（主族沿用）、三成離城 ≥ 6 格的野地（主族隨機），候選權重用地形 `rift_affinity`；月面不開新裂縫（內容開關 `continents.json.rift_rate`）。蝕壓**不會**因玩家變強而降，只會因封裂縫而換岸。SS／SSS 的「源頭」只留 `pressureSource?: Id` 欄位，不設計。

## 浮船 ShipState

```ts
type ShipState = { frame: Id /*ShipDef*/; pos: Loc; path?: { cells: Cell[]; lane?: { id: Id; daysLeft: number }; to: Loc | { actor: Id }; via: Loc[] };
  mpCarry: number; drifting: boolean;                         // 連續移動時帶到明天的剩餘移動點；懸停旗
  rooms: Record<RoomId, RoomState>;                           // bridge/hangar/restraint/medbay/galley/cargo/mycelium…
  capacity: { mechBays: number; restraintSlots: number; berths: number; cargo: number };
  fuel: PoolState; hull: PoolState; upgrades: Id[] };
```

船是基地也是容器：機庫位、拘束位、鋪位、貨艙體積是硬限制，超載不能起航。`fuel`／`hull` 用 core 的 `PoolDecl` 機制（`inverted:false`）；燃料按**移動日**扣（深蝕與核的日子 ×2），淺蝕格每天擲遭遇、深蝕可飛過但貴且必遭遇、核只有接了契約或自願才會到（[movement](world-grid/movement.md)）。`hull` 歸零＝船毀，全團在當前格變地面行動者（`mp = 40`、只走 `ground_cost`、深蝕不可進），拖著機甲走到最近城邦。房間是營運畫面的面板單位，`RoomState` 只存「這房裡有誰、有什麼」的索引，描述、列表與按鈕由 text 層組（[text-ui-contract](text-ui-contract.md)）；大地圖是艦橋的一個面板（[world-grid/ui-contract](world-grid/ui-contract.md)）。

## 遺跡探勘入口

遺跡是 `kind:"ruin"` 的**地點**；船停進其 `footprint` 後指令 `探 <遺跡>` 開一段**逐層文字事件鏈**（每層一天、派 2–4 人徒步、花補給、擲特質），結果寫回：遺物（`LootBundle`）、刻痕（`LoreFlag`，寫進 `CampaignState.lore`）、傷勢（人物 Effect）、或 `ancientFound: Id /*FrameDef*/`（同時建 `ShellState{holder:{ruin}}`，見 operations-war）。約三分之一遺跡的 `seedTable` 含古代機甲列；封口後的裂縫 `site` 也可能變成帶 `seedTable` 的遺跡。**認主**不在這裡：挖出的古代機進機庫為 `dormant` 機甲，只能在大潮之夜由共鳴 ≥ threshold 的人物 `喚 <古代機>`（走 core `ResonanceReq`）。本版探勘是事件鏈，不是地城，規則全在 `events/ruin-*.json`。

## 地月渡月船（已併入航道 LaneDef）

第一版 `FerryDef` 整個併入 `LaneDef{ kind:"orbital" }`（[map-and-terrain](world-grid/map-and-terrain.md)）：三赤道港→靜海市、弦月開（`departDays:[7,21]`）、3 天、`carriesShip:false`（船留港繼續付泊費、船員留守）、`capacity` 四機八人、`requires` 密封艙部件（生物機甲無 `sealed-pod` 者拒載，菌絲共生層例外由 tag 判）、票價 `fare` 是 NumExpr 可依「欠塞勒涅多少」變動、回程同日。月面是第六張圖「靜海面」：沒有船只有月面車（地面行動者）、`services` 幾乎只有塞勒涅。

## 替使用者做掉的決定

1. ~~蝕域是節點狀態不是節點種類~~ **作廢（2026-10-24）**：蝕域改為格群「蝕塊」，見 rifts-on-grid 決定 1。
2. **裂縫狀態機只在大潮日與戰果回寫時轉移**：玩家能算得出「哪天該在哪」，也讓測試只需斷言兩類時點。
3. **蝕壓用泊松抽新裂縫數**：讓「蝕壓高」直覺地變成「開得多」，而非改機率表。
4. **遺跡探勘＝逐層事件鏈**（非地城戰鬥）：事件文字加兩三個選項是最省的形式，也省一套戰鬥模式。
5. ~~世界圖量級 120＋15 節點~~ **作廢（2026-10-24）**：改六張方格圖、地點量級見 map-and-terrain。
