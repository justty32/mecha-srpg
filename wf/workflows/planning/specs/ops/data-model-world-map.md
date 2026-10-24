# data-model-world-map — 世界圖節點與路線、浮船、裂縫與蝕域狀態機、遺跡入口、地月渡輪

[ops README](README.md)｜世界觀來源 [world/operations](../world/operations.md)、[world/rifts-and-territory](../world/rifts-and-territory.md)｜時鐘在 [time-and-tick](time-and-tick.md)

裁示：世界是地球為主、月球為次；怪獸從裂縫出現、占地盤、衍生子體（只屬某些族）；遺跡大多在地球、有些在月球；世界圖是節點圖不是方格（world 暫定裁示）；**這是沙盒遊戲，玩家可以開著飛船去自己想去的地方**（2026-10-24 補充裁示）。

## 節點 NodeDef 與路線 RouteDef（內容檔）

```ts
type NodeDef = {
  id: Id; name: string; body: "earth" | "moon";
  kind: "city" | "wild" | "ruin" | "ferry-port" | "lunar-base";  // 蝕域不是 kind，是任何節點的狀態（見下）
  owner?: Id /*FactionDef*/; pop?: number;                    // city 才有；pop 只影響契約與招募池量級
  services: ServiceId[];                                      // market / recruit / repair-dock / medbay / ferry / registry…（登記檔）
  terrainPool: Id[];                                          // 戰場生成時抽的 TerrainDef 集合（地球地形那一半）
  ruin?: { depth: number; seedTable: Id; discovered: boolean }; // 遺跡：層數、每層事件表、是否已被人知道
  tags: string[];                                             // coastal / tide-line / equator-port / blockaded…
};
type RouteDef = { id: Id; a: Id; b: Id; days: number; kind: "air" | "ground" | "ferry";
  hazards: Id[] /*EventTable*/; tags: string[] };            // 浮船只走 air；ferry 只在弦月開船
```

**開放節點圖，無線性關卡**：任何節點只要有路線相連、燃料夠、不是深蝕，玩家下 `航` 就能去；沒有「解鎖區域」與「主線門」，城邦、蝕域、遺跡、裂縫、渡輪港、月面港全是可自由前往的目的地。契約與事件只是圖上的機會，不接也行；壓力來自世界自己在動（潮月、蔓延、勢力消長）。航行是玩家指令：目的地由玩家選，路徑用最短天數（可改選路線），每天結算一次位置，途中可改道。地球約 120 個節點（31 城邦、約 60 野地、約 20 遺跡、3 赤道渡輪港）、月面約 15 個（靜海市、月面車節點、遺跡帶、背面）。路線 `days` 是浮船滿載基準，實際天數再乘載重與風向（NumExpr）。

## 節點狀態 NodeState（存檔）與蝕域

```ts
type NodeState = { def: Id; blight?: { rift: Id; depth: "shallow" | "deep" | "core"; sinceDay: number };
  ownerOverride?: Id; wreckage: LootBundle[]; lastVisit?: number; flags: string[] };
```

**蝕域＝節點的 `blight` 狀態**，不是另一種節點：潮錨把「相鄰節點」蝕化，深度由蝕化天數換算（淺蝕 <1 潮月、深蝕 ≥2 潮月、核＝錨所在）。深蝕節點不可通行（路線視為斷）；城邦被蝕化即失守（`ownerOverride` 變裂獸）。戰場地圖由 `depth × rift.family` 選 `encounters/` 模板（見 [battle-interface](battle-interface.md)）。

## 裂縫 RiftState（存檔；模板在 `rifts/<family>.json`）

```ts
type RiftState = { id: Id; node: Id; family: Id /*SpeciesDef.family*/; width: Grade;   // D..S
  phase: "opening" | "anchored" | "unanchored" | "sealing" | "sealed" | "receding" | "closed";
  openedDay: number; anchorAge: number; anchor?: Id /*MechState 或 MonsterDef*/; zones: Id[] /*蝕化節點*/;
  fedCount: number;                                            // 「養裂」計數：錨死後沒守、又被送新錨的次數
  nextCheck: number };                                         // 下一個大潮日
```

狀態機（轉移只在**大潮日**或戰果回寫時發生）：`opening`（開後 0–3 天只有先鋒）→ 第 4 天 `anchored`（錨到，開始每大潮蝕化 `1 + floor(anchorAge/2)` 個相鄰節點；菌床固定 2）→ 錨被殺／捕 → `unanchored`（倒數到下個大潮）→ 大潮日：核區有守軍（玩家接了防守情境並勝）→ `sealing` → 下一個大潮仍守住 → `sealed`→ 之後每潮月 `receding` 退一區（菌絲節點要先 `burned` flag）→ 無 zones → `closed`。`unanchored` 無人守 → 新錨到，回 `anchored`、`fedCount++`、`anchorAge` 不重置。異形族模板宣告 `selfClose: true`：開一個大潮後直接 `closed`，無 `anchored`。殺遊蕩中的巢母游態＝刪除一個尚未開出的 `opening` 候選。

## 潮壓 Pressure（全局隱藏量）

`pressure: number`（0..∞）。每天 `+base`；每個 `sealed` 事件 `−k1`；每多一個蝕化節點 `+k2`／潮月。大潮日用它算：新裂縫數（泊松，均值 ∝ pressure）、新裂縫寬度上限、開在城邦邊的機率、野地事件表的凶險檔。新裂縫落點：七成抽既有蝕域相鄰節點（主族沿用）、三成野地（主族隨機）。潮壓**不會**因玩家變強而降，只會因封裂縫而換岸。SS／SSS 的「源頭」只留 `pressureSource?: Id` 欄位，不設計。

## 浮船 ShipState

```ts
type ShipState = { frame: Id /*ShipDef*/; at: Id /*node*/; route?: { to: Id; daysLeft: number };
  rooms: Record<RoomId, RoomState>;                           // bridge/hangar/stable/medbay/galley/cargo/mycelium…
  capacity: { mechBays: number; restraintSlots: number; berths: number; cargo: number };
  fuel: PoolState; hull: PoolState; upgrades: Id[] };
```

船是基地也是容器：機庫位、拘束位、鋪位、貨艙體積是硬限制，超載不能起航。`fuel`／`hull` 用 core 的 `PoolDecl` 機制（`inverted:false`）；每段路線扣燃料，穿越淺蝕節點必擲遭遇、深蝕不可通行。`hull` 歸零＝船毀，全團在當前節點變「徒步」flag，只能走 ground 路線到最近城邦。房間是營運畫面的面板單位，`RoomState` 只存「這房裡有誰、有什麼」的索引，描述、列表與按鈕由 text 層組（[text-ui-contract](text-ui-contract.md)）。

## 遺跡探勘入口

遺跡是 `kind:"ruin"` 節點；到達後指令 `探 <遺跡>` 開一段**逐層文字事件鏈**（每層一天、派 2–4 人徒步、花補給、擲特質），結果寫回：遺物（`LootBundle`）、刻痕（`LoreFlag`，寫進 `CampaignState.lore`）、傷勢（人物 Effect）、或 `ancientFound: Id /*FrameDef*/`。約三分之一遺跡的 `seedTable` 含古代機甲列。**認主**不在這裡：挖出的殼進機庫為 `dormant` 機甲，只能在大潮之夜由共鳴 ≥ threshold 的人物 `喚 <殼>`（走 core `ResonanceReq`）。本版探勘是事件鏈，不是地城，規則全在 `events/ruin-*.json`。

## 地月渡輪 FerryDef

```ts
type FerryDef = { id: Id; ports: Id[]; departDays: number[] /*[7,21]*/; transit: number /*3*/;
  capacity: { mechs: number; persons: number }; fare: NumExpr; returnFare: NumExpr; requires: Id[] /*密封艙部件*/ };
```

浮船留在港（繼續付泊費、船員留守）；渡輪只載列出的機甲與人；生物機甲無 `sealed-pod` 部件者拒載（菌絲共生層例外，由 tag 判）。月面節點子圖用同一套 `NodeDef`，`body:"moon"`，`terrainPool` 全是月面地形、`services` 幾乎只有塞勒涅。回程班次同日，票價 NumExpr 可依「欠塞勒涅多少」變動。

## 替使用者做掉的決定

1. **蝕域是節點狀態不是節點種類**：蔓延＝改鄰節點的 flag，收復＝退 flag；城邦失守不用換節點。
2. **裂縫狀態機只在大潮日與戰果回寫時轉移**：玩家能算得出「哪天該在哪」，也讓測試只需斷言兩類時點。
3. **潮壓用泊松抽新裂縫數**：讓「潮壓高」直覺地變成「開得多」，而非改機率表。
4. **遺跡探勘＝逐層事件鏈**（非地城戰鬥）：事件文字加兩三個選項是最省的形式，也省一套戰鬥模式。
5. **世界圖量級 120＋15 節點**：夠讓「繞路」有意義、又能在一個潮月內橫跨一洲；數字可調。
