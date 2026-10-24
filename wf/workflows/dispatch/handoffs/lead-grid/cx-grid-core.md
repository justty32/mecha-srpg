# 任務：新增方格大地圖的幾何與尋路核心（grid.ts）、載入器新資料夾與 check 驗證、40×40 測試圖

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀凍結介面 `wf/workflows/dispatch/handoffs/lead-grid/PLAN.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/` 的 `README.md`、`map-and-terrain.md`、`movement.md`、`migration-and-testing.md`（只讀，不改）。

## 背景與唯一目標

營運層要從節點圖換成 spec 的方格大地圖。本線是第一波地基：**只新增**方格的純函式核心與內容載入能力，現有節點圖照常運作、所有既有測試保持綠燈。做完後，`content/{pack}/world/` 可以放 `maps/`、`places/`、`lanes/`、`regions/`、`wterrains/` 五種新資料夾並被載入與驗證，`src/ops/world/grid.ts` 提供 PLAN.md 列出的全部函式。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：新檔 `src/ops/world/grid.ts`、`src/ops/world/grid.test.ts`；新目錄 `src/ops/world/fixtures/grid40/`（測試用 pack）；改 `src/ops/state/types.ts`（**只新增** `WTerrainDef`、`MapDef`、`RegionsDef`、`PlaceDef`、`LaneDef` 與 `WorldDefByKind` 五個新鍵，不改任何既有型別）；改 `src/ops/content/load.ts`（`WORLD_FOLDERS` 加 `maps→map`、`places→place`、`lanes→lane`、`regions→regions`、`wterrains→wterrain`）；改 `src/ops/content/check.ts`（加驗證並加 `import.meta.main` CLI：`node src/ops/content/check.ts content/base` 印錯誤、有錯 exit 1）；改 `src/ops/content/load.test.ts`（加新驗證的雙向測試）；改 `src/ops/world/nodes.ts` **只限** `WorldRules` 型別加 `grid` 段；改 `content/base/world/actions/ops-world.json` **只限** `rules` 加 `grid` 段；改 `package.json` **只限** `scripts.check` 改成 `node src/content/loader.ts content/base && node src/ops/content/check.ts content/base`；寫 REPORT。
- `rules.grid` 段內容（數值照 spec movement）：`{ "shipMp": 100, "groundMp": 60, "diagonal": 1.4, "blightCost": { "shallow": 12, "deep": 20, "core": 25 }, "contact": { "air": 2, "ground": 1 }, "sight": 5, "uplinkSight": 6 }`。
- check 新驗證（spec map-and-terrain「內容檔格式」五項＋兩項）：每列解碼後長度＝`width`、列數＝`height`；字元都在 `legend`（base 與 region 各自）；`legend` 值都是存在的 `wterrain`；每個地點 `at` 與 footprint 在圖內，且不在 `airCost` 與 `groundCost` 皆為 `null` 的格、不在潮海與雲嶂（`kind:"port"` 例外可在潮海）；航道兩端地點存在；`fog:"dark"` 的圖或有 `darkRects` 的圖至少一個地點在 charted 格；同圖地點 footprint 不重疊。
- 測試 pack `fixtures/grid40/`：兩張圖——`map/test40`（40×40，有山脊、雲嶂、淺灘、潮海、林海、一條道）與 `map/test-moon`（12×12）；6 個地點、2 條航道（其中一條 `orbital` 連到 test-moon、一條 `air-lane` 連到 test40 內被潮海隔開的小島）；只放測試需要的 `wterrain`（自帶，不依賴 base 有 wterrain）。pack 怎麼載入（要不要 `pack.json`、是否 depends base）照 `src/content/loader.ts` 與 `src/ops/content/load.ts` 現行規則自己判斷。
- 不做：任何既有 ops 行為（`travel.ts`、`rifts.ts`、`pressure.ts`、`tick.ts`、契約、文字層、sim、UI、MCP）；`content/base/world/` 除 `actions/ops-world.json` 以外的檔；不新增 base 的 maps／places 等內容（另一條線 `cx-grid-maps` 在做，會在暫存區）；不碰 `src/ops/content/worldgen.ts`（另一線持有）；`src/ai/`、`src/rules/`、`src/core/`、`src/content/`、`src/ui-adapter/`、`test/`、`wf/`（除交付的 REPORT 目錄）。
- 件數 gate：改＋新增檔超過 25 件就停下回報；容量 gate：單一新檔超過 60 KB 或測試 pack 合計超過 200 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run typecheck`、`npm run check` | 每完成一步跑；最後三者都要綠 |
| `node --test src/ops/world/grid.test.ts src/ops/content/load.test.ts` | 開發中快速跑本線測試 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-core --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（沙箱下 `.git` 可能唯讀，commit 由領導做；REPORT 列出改了哪些檔）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（暫存搬 `/tmp/cx-grid-core-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 dispatch/lessons）；子代理上限 1 個，只准為推進正事開，它若做實質工作也要親自讀 AGENTS.md 與上列規矩。同一工作樹裡另有 codex 線 `cx-grid-maps` 在寫 `src/ops/content/worldgen*` 與 `wf/workflows/dispatch/handoffs/lead-grid/stage/`，別動那些檔；也有其他領導線在寫 `src/ai/`、`content/` 文字欄，看到別人的未提交改動不要還原。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準（每檔只算 1 項）是已知現象，不算阻塞，照實寫進 REPORT。

## 工作

1. 讀「先讀」；讀 `src/ops/content/{load,check,worlddb}.ts`、`src/ops/state/types.ts`、`src/ops/world/nodes.ts`、`src/core/rng.ts`、`src/core/types-def.ts` 的 `Cell`。
2. 加型別與載入器資料夾；`PlaceDef` 依 PLAN（`size` 簡寫、`footprint` 可省）；`WTerrainDef` 另加可省欄 `encounterLost?: number`（城廓失守後遭遇倍率）。
3. 寫 `grid.ts`：函式簽名與語意照 PLAN.md「凍結介面」，不得改名或改參數順序；A\* 用二元堆、八方向、斜走成本 `round(base×1.4)`、啟發式 `octile` 乘以「圖上最小進格成本／10」保證 admissible、同成本以 `(y, x)` 字典序 tie-break；`days = ceil(cost / mp)`；`CostFn` 回 `undefined` 時該格不可進；`gridOf` 用 以 WorldDB 為鍵的 WeakMap（值為 mapId→GridMap 的 Map） 快取。
4. `grid.test.ts`（spec migration-and-testing「(1) 尋路正確」）：固定小圖 12 個已知最短成本案例（直線、斜線、繞山、繞雲嶂、穿淺灘、ground 不可進潮海等；跨航道屬第二波、本線不做）；無路徑回 `undefined`；每步八鄰且無不可進格；同輸入兩次逐格相同；A\* 成本＝Dijkstra 成本（隨機 200 張小圖）；250×150 隨機圖 100 對平均 < 10 ms（印出實測均值）；`decodeRow`／`floodFill`（連通、恰 size 或可達上限）／`frontier`／`cellsWithin`／`footprintOf` 各至少一例。
5. check 驗證與雙向測試：每項驗證先餵壞輸入確認報錯、再餵好輸入確認 0 錯（testing.md「綠燈不等於有檢查」）；`checkWorld(base)` 仍 0 錯。
6. 跑 `npm test`、`npm run typecheck`、`npm run check`，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-core/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 核心模組與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/grid.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/grid.test.ts` |
| 測試 pack | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/fixtures/grid40/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-core/REPORT.md` |

REPORT 四段（做了什麼——改／新增檔清單；產出——測試數、A\* 效能實測均值；沒做到或證據不足的；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `grid.ts` 匯出 PLAN.md「凍結介面」列的全部函式，簽名一致（`npm run typecheck` 0 錯）。
2. `node --test src/ops/world/grid.test.ts` 全過，含 12 個已知成本案例、A\*＝Dijkstra 200 圖、250×150 效能案例（REPORT 附實測均值）。
3. `npm run check` 會跑 `src/ops/content/check.ts` 且對 base 末行顯示 0 錯；故意壞的圖（列長錯、未知字元、地點在雲嶂、航道端點不存在）在 `load.test.ts` 各有一個報錯測試。
4. `npm test` 全過（沙箱外由領導重跑；沙箱內計數不準照實寫）。
5. REPORT 存在且列出所有改動檔，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-core`。本線團隊：`teams/grid`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-core --up DONE '一句自足結論' /tmp/cx-grid-core/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-core --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「純新增地基、既有行為不變」；任何需要改既有行為的需求寫進 REPORT，不動手——此條優先於工作步驟。
