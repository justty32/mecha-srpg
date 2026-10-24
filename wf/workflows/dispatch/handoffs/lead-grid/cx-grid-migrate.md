# 任務：把營運層從節點圖遷移到方格大地圖的地點與逐格移動（第二波大改，蝕域暫掛地點）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（含 `testing-checks.json`，用 `python3 wf/tools/tabledb.py wf/workflows/testing-checks.json --slice 0 12` 讀）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/lead-grid/PLAN.md`（凍結介面與小決定）、第一波兩份 REPORT（`wf/workflows/dispatch/handoffs/lead-grid/cx-grid-core/REPORT.md`、`.../cx-grid-maps/REPORT.md`），以及 spec `wf/workflows/planning/specs/ops/world-grid/` 全部 md（只讀，不改）。

## 背景與唯一目標

第一波已落地 `src/ops/world/grid.ts`（尋路與幾何）、載入器的 `maps/ places/ lanes/ regions/ wterrains/`，領導也已把長陸、靜海面樣本圖與 9 個地點、1 條航道放進 `content/base/world/`（舊 `nodes/` 已 `git mv` 成 `places/`、`ferry.json` 成 `lanes/selene.json`、`routes/` 已移出 content）。本線把營運層的**位置模型**整個換成方格：節點→地點、路線→逐格尋路、船每天用移動點沿格走、航道跨圖。**唯一目標：遷移完成後所有驗證回到綠燈**，遊戲在長陸上照常可玩。蝕域這一波**暫掛在地點上**（第三波 `cx-grid-blight` 才改蝕塊），行動者與迷霧是第三波 `cx-grid-actors` 的事。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：`src/ops/**`；`src/mcp/campaign.ts`、`src/mcp/campaign-view.ts` 與其測試；`src/ui-adapter/ops/**`（最小適配，見下）；`test/campaigns/**`（指令改 id、黃金用 `GOLDEN_UPDATE=1` 重產）；`test/e2e/ops-campaign.spec.ts`；`content/base/world/` 下這些檔的**結構鍵與 id 引用**（不動任何文字欄）：`places/`、`lanes/`、`campaign-start/`、`markets/`、`recruit-pools/`、`factions-ops/`、`forces/`、`operations/`、`actions/`、`templates/default.json`（只改事件型別鍵名）；`src/ops/content/check.ts` 對舊鍵的檢查；REPORT 目錄 `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-migrate/`。
- 不做：蝕塊、行動者、迷霧、遭遇四選、`GridView`／大地圖面板（第三波）；`src/ai/`、`src/rules/`、`src/core/`、`src/content/`、`src/sim/`（戰鬥 sim）、`src/ui-adapter/` 的 `ops/` 以外目錄；`content/` 任何文字欄（name／text／title／flavor／lines…）與 `content/lore/`；`content/base/world/events/`（`where:"node"／"route"` 由程式相容，不改檔）；`wf/`（除 REPORT 目錄）；`package.json`。
- 件數 gate：改＋新增檔超過 120 件就停下回報；容量 gate：單一新檔超過 60 KB 就停下回報。任一觸發都停。

## 遷移規格（照做；與 spec 衝突處以本段為準並在 REPORT 標 `SPEC-GAP`）

**型別**（`src/ops/state/types.ts`）：刪 `NodeDef`／`NodeState`／`RouteDef`／`FerryDef` 與 `WorldDefByKind` 的 `node`／`route`／`ferry`；`PlaceState = { def; ownerOverride?; wreckage; lastVisit?; flags; blight?: { rift; depth: "shallow"|"deep"|"core"; sinceDay } }`（`blight` 是本波暫存，第三波刪）；`CampaignState` 的 `nodes`→`places`，新增 `maps`（每張圖一筆 `{ blight, known }`，兩者都是以 cellKey 為鍵的稀疏表，值分別為 `{ rift; patch }` 與 `KnownCell`）（開局每張圖一格空表）、`patches`（id→`BlightPatch`）、`actors`（id→`ActorState`）（兩者開局空、本波不用）、`version: 2`；`BlightPatch`／`ActorState`／`KnownCell` 型別照 spec 原文宣告。`Loc = { map; region; cell: Cell }`（`cell` 必填，`region` 為該格區域鍵、無則 `""`）。`ShipState = { frame; pos: Loc; path?: { cells: Cell[]; lane?: { id; daysLeft }; legs: …自行設計的跨圖段… ; to: Loc | { place: Id } | { actor: Id }; via: Loc[] }; mpCarry; drifting; rooms; capacity; fuel; hull; upgrades }`（取代 `at`／`route` 與 `TravelState.drifting`）。`RiftState` 的 `node`→`at: Loc`＋`site: Id`（所在地點；本波仍是既有地點），`zones` 本波保留（地點 id）。`Sortie.node`→`loc: Loc`＋`place?: Id`，`trigger` 加 `"intercept"`。`ContractState.target = { place; loc?; rift?; snapshot? }`。`StartDef.node`→`place`。`OpsCommand` 的 `sail` 改 `{ v:"sail"; to: Id | Cell | { actor: Id }; via?: (Id | Cell)[] }`、`accompany.node`→`place`。`OpsEffect`：`transferNode`→`transferPlace { place; to }`、`setNode`→`setPlace { id; patch; clearBlight? }`、`salvage.node`→`salvage.place`；`EventDef.where` 為 `"place"|"field"|"lane"|"ship"|"ruin"`，載入時 `node`→`place`、`route`→`field`。事件型別改名 `NodeTransferred`→`PlaceTransferred`、`NodeReclaimed`→`PlaceReclaimed`、`NodeBlighted`→`PlaceBlighted`。條件作用域加 `place` 根與 `$place` 綁定，`node`／`$node` 保留為同義別名（內容不必改）。

**移動**（`world/travel.ts` 改名 `world/move.ts`，用 `git mv` 不可行時直接新建＋舊檔改為空殼後回報）：`cmdSail` 不耗 tick，算路寫進 `ship.path`、`pendingTicks` 設成估計天數；`to` 三型：地點（航向其 footprint 最近格，尋路終點取 `at`）、格（當前圖）、`{actor}`（本波 `s.actors` 為空，回 `unknown-actor`）；`via` 依序串接；跨圖：窮舉「本圖可到的航道端點 → 航道 → 目標圖 A\*」取最短總天數（含等船天數：`departDays` 非空時等到下一個開船日）。拒絕條件沿用：`pending-encounter`、`overloaded`、`no-route`、`already-there`、`insufficient-fuel`（估計移動日 × `fuelPerDay` ＋航道燃料 > 可用燃料）。`moveDaily3`（tick 段 3）照 spec movement「與 tick 的銜接」(a)–(e)：當天 `mp` ＝`rules.grid.shipMp` × 修正（船體 < 50% ×0.75、大潮日 ×0.9、弦月 ×1.1；係數放 `rules.grid.mpMods`），逐格扣成本、扣不起停下、`mpCarry` 只在連續移動時帶到明天；每個移動日扣一次 `fuelPerDay`（當天走過的格有 deep／core 蝕則 ×2）；到終點或進入目標地點 footprint 就 `Arrived { place?, cell }` 並刪 `path`、`pendingTicks = 0`；航道端點遇不開船日 `Waiting`；航道段每天 `daysLeft−−`、到站換 `pos.map`、收 `fare`（記帳 reason `lane-fare`）；`carriesShip:false` 的語意本波不做（船照樣跟著過去，標 `SPEC-GAP`）。船體歸零＝地面行動者：`mp = rules.grid.hulkMp`（40）、走 `groundCost`。`cmdDock` 只在地點 footprint 內成立（否則 `no-place`），`cmdDrift` 在野外懸停（保留現行「伏擊時花燃料脫離」語意）。所有「已停泊」判斷（市場、招募、補彈、服務、探勘）改為 `ship.pos` 在該地點 footprint 內且無 `path`、非 `drifting`。

**蝕域暫掛地點**：`blightAt(s, ctx, loc)`（新檔 `world/blight.ts`，第三波會重寫內部）回傳 footprint 外擴 `rules.grid.interimZoneRadius`（4）格內最近一個有 `blight` 的地點的 `{ rift, depth }`；`moveDaily3` 用它：通行成本取 `max(地形, rules.grid.blightCost[depth])`，當天走過蝕格就擲一次遭遇（`rules.grid.blightEncounter`：shallow 0.25、deep 0.6、core 1.0），中了照現行 `ambush` 寫 `pendingBattle`。`world/nodes.ts` 改名 `world/places.ts`；`adjacentNodes` 改成 `nearbyPlaces(ctx, place)`＝同圖、footprint 切比雪夫距離 ≤ `rules.grid.interimAdjacency`（12）的地點；`rifts.ts`／`pressure.ts` 只做最小替換（新裂縫落在非月面、`riftRate > 0` 圖上的地點，`site` 指它、`at` 取其 `at`）。

**其餘模組**：`war/loc.ts` 是唯一知道地點↔`Loc` 對照的檔（`placeLoc`、`placeAt(loc)`）；常備軍行軍改 `findPath`（ground、無視蝕域），`ForceState.speed` 當 `rules.grid.groundMp` 的倍率（標 `SPEC-GAP`），`path` 存格序。契約：`target.place`，可達性用尋路，`nearby` 改「在地盤地點或距地盤地點 ≤ `rules.grid.nearbyRadius`（20）格」。ScenarioGen：`terrainMix` 的 `"$node"`（保留此字面）＝該格與八鄰格地形 `battlePool` 的加權聯集（鄰格權重 ½），蝕深用 `blightAt`。文字層：`航 達卡`／`航 120,44`／`航 @名`／`航 靜海市 經 新加坡` 往返一致；名稱解析與地圖面板改列地點（含座標與「N 天」）。`sim` 政策 greedy／random／merc 改用路程天數；不變量加「船永不在不可進格、`pos.map` 是存在的圖」。MCP 營運視圖改出地點與座標。ui-ops 最小適配：`vm/layout.ts` 依地點座標縮放擺位、`dom/world-map.ts` 照畫圓點與標籤（不畫路線）、其餘照舊；`test/e2e/ops-campaign.spec.ts` 必要時改選擇器。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run typecheck` | 改型別後先讓它 0 錯，再修測試 |
| `npm test`、`npm run check` | 每完成一個模組跑一次 |
| `npm run sim:campaign -- --months 12` | 遷移完跑，不得拋錯 |
| `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts` | 指令改完 id 後重產黃金 |
| `npm run build` | 改 ui-ops 後跑 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-migrate --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。`npm run test:e2e` 需要起 preview 伺服器，沙箱內可能跑不了——跑不了就照實寫，由領導在外面跑。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（要丟的檔搬 `/tmp/cx-grid-migrate-trash/` 並在 REPORT 列出）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 2 個，只准為推進正事開，它若做實質工作也要親自讀 AGENTS.md 與上列規矩，且只能寫本線範圍。工作樹裡另有其他領導線在寫 `src/ai/`、`content/` 文字欄與新內容檔；看到別人的未提交改動不要還原，也不要把它們算成你的。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準（每檔只算 1 項）是已知現象。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 的 cli／e2e 測試與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**：照常做完，REPORT 註明，完整 `npm test` 由領導在沙箱外重跑。

## 工作

1. 讀「先讀」與 `src/ops/` 全部非測試檔的 node／route／ferry 用法（`grep -rn 'node\|route\|ferry' src/ops src/mcp src/ui-adapter/ops`）。
2. 改型別與載入、開局（`content/start.ts`）、`check.ts`，讓 `npm run typecheck` 指出所有待改處。
3. 依「遷移規格」逐模組改：move、places、blight、rifts、pressure、war、contracts、sortie、text、time、sim、mcp、ui-ops；內容結構鍵與 id。
4. 新測試（spec migration-and-testing (2) 與 (6)）：連續航行總天數＝`ceil(Σcost/mp)`；直達 ≤ 中途停一天再走；每個移動日恰扣一次燃料（蝕格 ×2）；`等 7` 與七次 `等 1` 在航行中事件序列相同；`pendingBattle`／`pendingChoices` 非空時 `pos` 不變；船永不在不可進格；跨圖航道含等船天數；`sail` 三型 `parse(formatCommand())` 往返一致。
5. 既有測試全部改到綠；`test/campaigns` 黃金重產（REPORT 說明哪些 hash 變了、為什麼）。
6. 跑「必用工具」全部，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-migrate/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 遷移後程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/` |
| 黃金戰役 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/campaigns/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-migrate/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單按模組分組；產出——新測試清單、`sim:campaign --months 12` 末三行輸出、黃金 hash 變動說明；沒做到或證據不足的——含所有 `SPEC-GAP`；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` 0 錯；`grep -rnE 'NodeDef|NodeState|RouteDef|FerryDef|ship\.at\b|ship\.route\b|s\.nodes\b' src/` 無命中。
2. `npm run check` 0 錯。
3. `npm test` 全過（沙箱外由領導重跑；沙箱內 MCP 失敗照實寫）。
4. `npm run sim:campaign -- --months 12` 跑完不拋錯，末行 `OK`（或終局行），REPORT 附末三行。
5. 「工作」第 4 步列的 8 類新測試都存在且通過（REPORT 列測試名）。
6. REPORT 存在，改動檔全在「範圍」清單內，所有 `SPEC-GAP` 列出。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-migrate`。本線團隊：`teams/grid`。上線先發 `PROGRESS`；每完成「工作」一步發一封 `PROGRESS`（一句話）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-migrate --up DONE '一句自足結論' /tmp/cx-grid-migrate/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-migrate --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「位置模型換成方格且全部驗證回綠」；蝕塊、行動者、迷霧、大地圖面板一律不做——此條優先於工作步驟與 spec 原文。
