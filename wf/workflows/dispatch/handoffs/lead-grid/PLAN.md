# lead-grid 動工計畫：方格大地圖實作（engine-backlog P1 第 1 列）

[handoffs](../README.md)｜spec [world-grid](../../../planning/specs/ops/world-grid/README.md)｜規劃 REPORT [plan-world-grid](../done/2026-10-24/plan-world-grid/REPORT.md)｜領地 [CLAIMS](../../CLAIMS.md)

領導 `lead-grid`（Opus）。工人全用 codex `gpt-6-astra`（reasoning high，`codex exec`）。本檔是各工人交接書共同引用的**凍結介面**：工人照這裡的型別與格式做，要改先回報領導。

## 波次

第一波（並行，純新增、不破壞現有節點圖）：`cx-grid-core` 做 `src/ops/world/grid.ts`（RLE、幾何、A\*、洪水填充、視野）、載入器新資料夾、`check` 五項驗證、40×40 測試圖；`cx-grid-maps` 做產生器 `src/ops/content/worldgen.ts` 與**暫存區**裡的長陸（250×150）、靜海面（120×120）樣本圖、14 種大地圖地形、現有 8 個節點轉成的地點、航道。暫存區在 `handoffs/lead-grid/stage/world/`，第二波由領導搬進 `content/base/world/`。

第二波（單線大改）：`cx-grid-migrate` 把營運從節點換成地點：型別、`travel.ts→move.ts`（`sail` 三型、移動點、航道、按移動日扣燃料）、`nodes.ts→places.ts`、`war/loc.ts`（`Loc.cell` 必填、行軍走格）、契約 `target.place`、ScenarioGen 讀格、文字層、`sim` 政策、MCP、ui-ops 最小適配、黃金重產。蝕域此波**暫存在地點上**（沿用舊 `blight` 欄、鄰接改為「同圖 N 格內的地點」），讓 `sim:campaign` 保持綠燈。

第三波（並行，檔案切開）：`cx-grid-blight`（蝕塊、LIFO 退、核 1→3×3、新裂縫落格、rift-site、城邦失守看 footprint、`war/operations.ts` 目標選擇）；`cx-grid-actors`（五種行動者 AI、接觸、遭遇四選、迷霧 `known`、tick 段 2c／3、`move.ts`、`war/loc.ts`／`forces.ts` 部隊影子）；`cx-grid-ui`（抽 `GridView`、大地圖面板、`keymap-ops.json` context `map`、e2e）。

第四波：`cx-grid-verify`：退化判準模擬（12 潮月蝕格 < 陸格 15%、行動者 [40,200]、遭遇 0.1–0.4／天）、黃金戰役、`sim:campaign --months 24` 經濟合理性與參數微調。

不在本線：另外四張地球圖（赭洲、霧陸、綠淵、南殼）與完整月面內容（交內容線，用本線的產生器）；`content/` 既有文字潤飾；`src/ai/`。

## 小決定（依 spec 精神，領導定）

1. 大地圖地形放 `world/wterrains/<name>.json`（kind `wterrain`，與戰場 `terrain` 分開）；欄位 camelCase（`airCost`／`groundCost` 用 `null` 表示不可進）。
2. 地點 `footprint` 可省，另給簡寫 `size`（奇數邊長，以 `at` 為中心展開）；兩者都省＝只佔 `at`。
3. 區域檔 `world/regions/<map>.json` 的 kind 叫 `regions`，id `regions/<map>`，內含 `map` 與 `regions: Record<regionKey, { name; phrase? }>`。
4. 迷霧 `dark` 的範圍用矩形清單 `darkRects`（圖檔欄位），不另做第三張字元圖。
5. 事件 `where` 相容舊值：`node`≡`place`、`route`≡`field`（內容線的既有與新增事件不必改檔）；條件／效果作用域保留 `node` 根與 `$node` 綁定當 `place` 的別名。
6. 舊 `routes/` 12 檔：刪檔需授權，第二波先由載入器標「已廢止、不載入」並在 REPORT 請頂層准刪。
7. 蝕域通行成本取 `max(地形成本, 蝕深成本)`；係數放 `action/ops-world` 的 `rules.grid`。

## 凍結格式：內容檔

```jsonc
// world/wterrains/plain.json
{ "id": "wterrain/plain", "name": "平野", "glyph": ".", "airCost": 10, "groundCost": 10, "sight": 0,
  "encounter": 1.0, "riftAffinity": 1.0, "battlePool": ["terrain/plain", "terrain/rubble"], "flavor": "…" }   // 城廓另有可省欄 "encounterLost": 1.5
// world/maps/longland.json（base.rows 每列一字串：字元＝legend 鍵，後接可省的重複數，"~40.12^3"）
{ "id": "map/longland", "name": "長陸", "oldName": "亞歐大陸", "width": 250, "height": 150, "cellKm": 40,
  "fog": "charted", "darkRects": [{ "x": 0, "y": 0, "w": 250, "h": 20 }], "riftRate": 1.0,
  "legend": { "~": "wterrain/tidesea", ".": "wterrain/plain" }, "base": { "rows": ["~250", "…"] },
  "region": { "legend": { "a": "ganges-mouth" }, "rows": ["…"] },   // 可省；同 RLE，空白字元 " " = 無區域，其餘查 legend
  "road": [[132, 94], [133, 94]] }                                   // 可省
// world/regions/longland.json
{ "id": "regions/longland", "map": "map/longland", "regions": { "ganges-mouth": { "name": "恆河口", "phrase": "…" } } }
// world/places/dhaka.json（取代 nodes/；無 terrainPool、無 body）
{ "id": "place/dhaka", "name": "達卡", "map": "map/longland", "at": { "x": 132, "y": 94 }, "size": 3,
  "kind": "city", "owner": "faction/migrant-crew", "pop": 12000, "services": ["service/market"], "tags": [] }
// world/lanes/selene.json（取代 ferry.json 與 routes/）
{ "id": "lane/selene", "a": "place/singapore", "b": "place/selene-city", "kind": "orbital", "days": 3,
  "departDays": [7, 21], "fare": 2800, "carriesShip": false, "capacity": { "mechs": 4, "persons": 8 },
  "requires": [], "hazards": [], "tags": [] }
```

地點 `kind` ∈ `city | port | ruin | outpost | rift-site | lunar-base | beacon`（舊 `wild`→`outpost`、`ferry-port`→`port`）。航道 `kind` ∈ `land-bridge | sea-lane | air-lane | orbital`。

## 凍結介面：`src/ops/world/grid.ts`（純函式、無狀態）

```ts
export type GridMap = { id: Id; width: number; height: number; base: Uint8Array /*terrains 索引*/; terrains: WTerrainDef[];
  region: Uint16Array; regionKeys: string[] /*索引 0 = ""*/; road: Set<number>; dark: Uint8Array /*1 = dark*/; land: number /*陸格數*/ };
export type Mover = { layer: "air" | "ground"; mp: number };
export type CostFn = (cell: Cell, terrainCost: number) => number | undefined;   // 呼叫端疊蝕域成本；undefined＝不可進
export function cellKey(c: Cell): string;               // "x,y"
export function parseCellKey(k: string): Cell;
export function idx(map: GridMap, c: Cell): number;     // y*width+x
export function inBounds(map: GridMap, c: Cell): boolean;
export function decodeRow(row: string, width: number): string[];
export function buildGridMap(def: MapDef, terrains: WTerrainDef[]): GridMap;
export function gridOf(world: WorldDB, mapId: Id): GridMap;   // 每個 WorldDB 快取
export function terrainAt(map: GridMap, c: Cell): WTerrainDef;
export function neighbors(map: GridMap, c: Cell): Cell[];      // 八鄰、界內、(y,x) 排序
export function chebyshev(a: Cell, b: Cell): number;
export function octile(a: Cell, b: Cell): number;              // 10×直 + 14×斜 的移動點啟發用
export function stepCost(map: GridMap, mover: Mover, from: Cell, to: Cell, cost?: CostFn): number | undefined; // 斜走 ×1.4 取整
export function findPath(map: GridMap, from: Cell, to: Cell, mover: Mover, cost?: CostFn):
  { cells: Cell[] /*不含起點、含終點*/; cost: number; days: number } | undefined;
export function floodFill(map: GridMap, seed: Cell, size: number, allow: (c: Cell) => boolean, rng: RngState): Cell[];
export function frontier(map: GridMap, cells: ReadonlySet<string>): Cell[];   // 八鄰有、自己無，(y,x) 排序
export function cellsWithin(map: GridMap, center: Cell, radius: number): Cell[];  // 切比雪夫半徑
export function footprintOf(def: PlaceDef): Cell[];
```

型別（加在 `src/ops/state/types.ts`，第一波只新增不改舊）：`WTerrainDef`、`MapDef`、`RegionsDef`、`PlaceDef`、`LaneDef`（照上方 JSON 與 spec）。`WorldDefByKind` 加 `wterrain`、`map`、`regions`、`place`、`lane`。第二波再加 `PlaceState`、`BlightPatch`、`ActorState`、`KnownCell` 與 `CampaignState` 新欄（`places`、`maps`、`patches`、`actors`，`version: 2`）。

## 驗收總表（本線結束時）

`npm test`、`npm run check`、`npm run typecheck`、`npm run test:e2e`、`npm run sim:campaign -- --months 24`、`bash wf/tools/wf-lint.sh --strict .` 全綠；engine-backlog 第 1 列標已完成；codex-effects 第 15、20 列依實況改。
