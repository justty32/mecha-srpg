# cx-grid-core：方格核心、內容載入與指定測試完成

## 做了什麼——改／新增檔清單

完成 PLAN 凍結的 17 個函式、五種內容型別與載入資料夾、指定 rules.grid、內容檢查與獨立測試 pack。沿用先前保留的初稿完成驗證；未 commit，未改現有營運行為。

程式與設定改動如下（相對 repo 根）：

- `src/ops/world/grid.ts`、`src/ops/world/grid.test.ts`：RLE、圖層、幾何、二元堆 A*、洪水填充、視野、footprint 與測試。
- `src/ops/state/types.ts`：只新增五型別與 WorldDefByKind 五鍵。
- `src/ops/content/load.ts`：只新增 WORLD_FOLDERS 五項。
- `src/ops/content/check.ts`：新圖與地點等驗證；沿用既有 import.meta.main CLI。
- `src/ops/content/load.test.ts`：新增檢查的壞／好輸入與 CLI exit 1／0 驗證。
- `src/ops/world/nodes.ts`：只新增 WorldRules.grid。
- `content/base/world/actions/ops-world.json`：只新增指定 rules.grid。
- `package.json`：只改 scripts.check 串接營運檢查。
- `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-core/REPORT.md`：覆寫本報告。

新增測試 pack 共 19 檔；以下路徑全部相對 `src/ops/world/fixtures/grid40/`：
`pack.json`；
`world/maps/test40.json`、`world/maps/test-moon.json`；
`world/regions/test40.json`；
`world/lanes/island.json`、`world/lanes/moon.json`；
`world/places/city.json`、`world/places/island.json`、`world/places/moon.json`、`world/places/outpost.json`、`world/places/port.json`、`world/places/ruin.json`；
`world/wterrains/cloudwall.json`、`world/wterrains/forest.json`、`world/wterrains/moon-soil.json`、`world/wterrains/plain.json`、`world/wterrains/ridge.json`、`world/wterrains/shoal.json`、`world/wterrains/tidesea.json`。

依 orders 2026-10-24 15:55 的新 gate：程式／設定／REPORT 10 件（上限 15）；fixture JSON 19 件（另計，上限 35）。新程式最大 12,320 bytes；pack 合計 6,315 bytes，均未觸容量 gate。所有交付檔皆在允許範圍；inbox 與 /tmp 僅用於指定回報和驗證。

A* 進格成本先套道路與 CostFn，undefined 不可進，斜步四捨五入；採 octile 下界與 (y,x) tie-break。為避免低成本四捨五入高估，啟發式的最小成本取 min(base, round(base×1.4)/1.4)。gridOf 用 WorldDB 為鍵的 WeakMap 快取，圖 id 別名共用同一 GridMap。

非空 darkRects 覆蓋 fog、矩形外 charted；空或省略則全圖照 fog。地點與區域的 map 引用明確查 WorldDB，避免與既有戰場 map kind 混淆；既有戰場引用維持原查法。

## 產出——測試數與效能

`node --test src/ops/world/grid.test.ts` 通過。指定合跑 `node --test src/ops/world/grid.test.ts src/ops/content/load.test.ts` 通過；沙箱 runner 只顯示 2 個檔級項目，不當成實際案例總數。直接以 node 執行兩個測試檔取得細目：grid 19／19，load 24／24，共 43／43；load 包含既有 4 案與新增 20 案。

grid 覆蓋 12 個固定最短成本、無路徑、每步八鄰與可通行、重播相同、200 張固定 seed 隨機圖對獨立 O(V²) Dijkstra、輔助函式與 fixture 圖層。250×150 隨機圖 100 對 A* 最新實測均值 **2.336 ms**（門檻 < 10 ms；同時有完整 suite 執行）。輸出：`/tmp/cx-grid-core/grid-detail.log`、`grid-final.log`、`targeted.log`。

load 的 18 組壞／好雙向案例涵蓋 base／region 列長、列數、未知字元、缺地形、at／footprint 越界、雲嶂、潮海、兩層皆不可進、航道 a／b、暗圖登陸點與同圖重疊；另驗港口例外、跨圖相同座標及真實 CLI 壞圖 exit 1／修正 exit 0。CLI 以檔案承接 stdout／stderr，避免沙箱 child_process pipe 限制。輸出：`/tmp/cx-grid-core/load-detail.log`。

`npm run typecheck` 回傳 0，兩份 tsconfig 均通過；`npm run check` 回傳 0，已串接營運 CLI，base 末行 `OK 0 errors, 8 warnings`。既有 load/check base 案仍證明 checkWorld(base) 0 錯。輸出：`/tmp/cx-grid-core/final-typecheck.log`、`final-check.log`。

最新 `npm test` 回傳 1：沙箱檔級計數 137，134 通過、3 失敗；失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts`。本線兩個測試檔通過。輸出：`/tmp/cx-grid-core/final-test.log`。

## 沒做到或證據不足的

沙箱外完整 npm test 依 16:05 orders 由領導重跑；本線沒有宣稱完整 suite 全綠。兩個 MCP 失敗為交接書已知環境限制；另 worldgen.test.ts 的直接執行證據明示 `spawnSync node EPERM`，詳 `/tmp/cx-grid-core/worldgen-detail.log`，已寄 PROGRESS 提醒上游，未碰另一線檔案。

固定五條驗收中，第 1、2、3、5 已有本線證據；第 4 的沙箱外全綠證據待領導補齊。未增加驗收條目，也未跑 UI、sim 或其他額外驗收。

## 需要決定的事

本線功能無待決事項。領導整合時同步 code map／導航並完成沙箱外完整 suite；這些檔案依本線可寫範圍未修改。獨立 fixture 無 depends，地形 battlePool 留空，僅供本波純核心測試。

## 以後交接書該點名的工具

`node src/ops/world/grid.test.ts`、`node src/ops/content/load.test.ts`：沙箱 node --test 只輸出檔級計數時，可取得真正案例數與效能 stdout。
`spawnSync` 搭配檔案描述符 stdio：在 pipe 受限的沙箱執行 CLI 雙向驗證。
