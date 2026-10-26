# 任務：把蝕域從「掛在地點上」改成格上的蝕塊（擴散、LIFO 收縮、核長大、新裂縫落格、裂縫口地點、城邦失守、蝕核城開局）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/PLAN.md`、第二波 REPORT `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-migrate/REPORT.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md`、`map-and-terrain.md`、`migration-and-testing.md`（只讀，不改）。

## 背景與唯一目標

第二波已把營運層換成方格，但蝕域還暫掛在地點上（`PlaceState.blight`，`blightAt` 以地點外擴 4 格近似）。本線把它換成 spec 的**蝕塊**：裂縫在格上、一塊 7–12 格地長、退最年輕的一塊、深度由塊齡算、核由 1 格長成 3×3、新裂縫落在格上並自動建立 `rift-site` 動態地點、城邦 footprint 被蝕即失守。做完後 `PlaceState.blight` 與 `RiftState.zones` 消失，`sim:campaign` 照常跑且蝕域量級合理。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：`src/ops/world/{blight,rifts,pressure,places}.ts` 與其測試、新檔 `src/ops/world/patches.ts`（可選）；`src/ops/state/types.ts` 中 `PlaceState`、`RiftState`、`BlightPatch`、`StartDef.rifts` 與 `CampaignState` 的蝕域相關欄位（**只動這幾個型別**）；`src/ops/content/{start,opseffect,check}.ts` 中與蝕域、開局裂縫、`setPlace.clearBlight`、`transferPlace` 清蝕相關的段落；`src/ops/war/operations.ts`（作戰目標選擇與 contain 清蝕改讀蝕塊）；`src/ops/contracts/lifecycle.ts`（契約快照的蝕深、裂縫目標＝`rift.site`、城邦失守時的契約處置）；`src/ops/sim/{invariants,campaign,cli}.ts` 與 `sim` 測試（蝕域不變量、每潮月一行改印蝕格數）；`src/ops/time/tick.ts` 的 `dailySummary` 蝕域欄；`src/ops/text/` 中蝕域與裂縫口地點名稱的顯示；`src/mcp/campaign-view.ts` 的蝕域欄；`content/base/world/places/mumbai.json`（新檔）、`content/base/world/campaign-start/default.json` 的 `rifts`、`content/base/world/actions/ops-world.json` 的 `rules`（加蝕塊係數）、`content/base/world/rifts/*.json` 的結構欄（不動文字）；`test/campaigns/`（黃金重產）；REPORT 目錄 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-blight/`。
- 不做：行動者、迷霧、遭遇四選（`cx-grid-actors` 之後做）；`src/ops/world/move.ts`、`src/ops/sortie/`、`src/ops/war/{loc,forces}.ts`（它們只透過 `blightAt` 讀蝕域，介面不變）；`src/ui-adapter/`（`cx-grid-ui` 同時在寫）與 `src/ops/text/map-panel.ts`；另外四張地球圖；`content/` 文字欄與 `content/lore/`；`src/ai/`、`src/rules/`、`src/core/`；`wf/`（除 REPORT 目錄）。
- 件數 gate：改＋新增檔超過 45 件就停下回報；容量 gate：單一新檔超過 40 KB 就停下回報。任一觸發都停。

## 規格（照 spec rifts-on-grid；與 spec 衝突處以本段為準並標 `SPEC-GAP`）

`RiftState` 的 `zones`→`patches: Id[]`；`BlightPatch = { id; rift; map; cells; sinceDay; burned? }`，`s.patches` 存本體、`s.maps[map].blight` 是由 patches 推導的索引（cellKey→`{ rift, patch }`），提供 `rebuildBlightIndex(s)` 並在讀檔／開局後呼叫。**深度**：核塊（每裂縫第 0 塊）＝`core`；其餘塊齡 < `rules.nodes.deepMonths` 潮月＝`shallow`、否則 `deep`。`blightAt(s, ctx, loc)` 介面不變、改讀索引，回 `{ rift, patch, depth }`。**核**：開裂時 1 格（`at`），錨到（`anchored`）時擴成 3×3（裁掉不可進格）。**擴散**：大潮日 `anchored` 裂縫長 `spreadPerTide` 塊；每塊從該裂縫蝕域的 `frontier` 抽種子，權重＝地形 `riftAffinity` × 族偏好（`rules.blight.familyAffinity`：蟲族城廓與林海 ×2、獸族平野與荒野 ×2、菌絲全 1、異形不長），以 `floodFill` 長到 `rules.blight.patchSize`（7–12 均勻抽）格，不進潮海與雲嶂（淺灘可）、不進別的蝕塊；菌絲固定 `rules.blight.myceliumPerTide`（2）塊。**收縮**：`sealed`／`receding` 每潮月退最年輕的非核塊（菌絲塊要先 `burned`），非核塊退完再退核塊並 `closed`；殘聯收復金照退回塊數付（沿用現行收復金的觸發點）。**新裂縫**：數量沿用泊松；均值按各圖「陸格數 × `riftRate`」比例分到各圖；落點七成取既有蝕域 frontier ≤ 3 格的陸格（族沿用該蝕域）、三成取離任何城邦 footprint ≥ 6 格的野地陸格（族隨機），城邦邊 ≤ 2 格的候選權重 ×（1＋`cityBiasPerPressure`×pressure）；候選權重＝`riftAffinity`，0 的不選。**裂縫口地點**：開裂時建一個動態地點（`PlaceState.dyn`，`kind:"rift-site"`，名字由族名與區域名組，例「恆河口的蟲潮」，組字模板放 `rules.blight.siteName`），`rift.site` 指它，契約、事件、`sail` 都指它；`closed` 時三分之一機率變 `kind:"ruin"`（帶族對應的 `seedTable`，沒有就用 `event/ruin-entry`）、其餘移除。**城邦失守**：城邦（`kind:"city"`）footprint 任一格在蝕域 → `ownerOverride`＝裂獸勢力、`CityLost`，該城為目標的 `offered` 契約 `expired`；footprint 乾淨 → `PlaceReclaimed`、owner 回來、一個潮月內服務標 `recovering`（市場與招募拒絕，錯誤碼 `recovering`）。**潮壓**：`blightPerMonth` 的計數單位改為蝕塊數。**蝕核城**：新增 `place/mumbai`（`kind:"city"`、`size: 5`、真實投影座標、`name`「孟買」、`owner` 省略、`services: []`、`tags: ["core-city"]`），開局裂縫 `{ site: "place/mumbai", family 蟲族, width "A", phase "anchored", anchorAge 8, prePatches N }`：開局時核塊為 5×5、再決定性長 N 塊（N 讓蝕域半徑約 15–25 格，用 `s.rng`）。**天象預留掛鉤（只留位置、不實作規則）**：擴散塊數＝`spreadPerTide` 求值 ＋ `spreadDelta(s, ctx, day)`（新函式，本線固定回 0，註解指向 `wf/workflows/planning/design-notes/tide-sky/mechanics.md`）；`opening→anchored` 判斷處預留 `anchorInstant(s, ctx, rift): boolean`（本線固定回 false；回 true 時當天直接錨到、跳過 opening 剩餘天數），兩者各一個測試證明掛鉤被呼叫（例如以參數注入或 stub 改回傳值時行為改變）。`setPlace.clearBlight` 與 `transferPlace` 清蝕＝移除與該地點 footprint（外擴 1 格）相交的所有非核塊。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run typecheck`、`npm test`、`npm run check` | 每完成一步跑 |
| `npm run sim:campaign -- --months 12 --seed 1`（另跑 seed 2、3） | 量蝕格數與增量 |
| `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts` | 行為變更後重產黃金 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-blight --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（要丟的檔搬 `/tmp/cx-grid-blight-trash/` 並在 REPORT 列出）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個，只准為推進正事開，它若做實質工作也要親自讀 AGENTS.md 與上列規矩。工作樹裡同時有 codex 線 `cx-grid-ui` 在寫 `src/ui-adapter/`、`src/ops/text/map-panel.ts`、`content/base/world/keymap-ops.json`、`test/e2e/`，以及其他領導線在寫 `src/ai/`、`content/` 文字欄；看到別人的未提交改動不要還原。改 `types.ts` 前先重讀該檔（別人可能剛改過）。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準是已知現象。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 的 cli／e2e 測試與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**；REPORT 註明，完整 `npm test` 由領導在沙箱外重跑。

## 工作

1. 讀「先讀」與 `src/ops/world/{blight,rifts,pressure,places}.ts`、`src/ops/content/start.ts`、`src/ops/war/operations.ts` 現況。
2. 型別與索引：`BlightPatch`、`patches`、`rebuildBlightIndex`、`blightAt` 改讀索引；刪 `PlaceState.blight`、`RiftState.zones`。
3. 核、擴散、收縮、新裂縫落格、裂縫口動態地點、城邦失守／收復、潮壓計數、蝕核城開局。
4. 測試（spec migration-and-testing (4)）：每塊 7–12 格且連通（或受地形所限時 ≤ 12 且連通、REPORT 說明）；深度與 `sinceDay` 一致；LIFO 退塊後 `patches` 仍是開裂順序的前綴；城邦 footprint 被蝕 ⇔ `ownerOverride`；菌絲未 `burned` 不退；核塊永遠含 `at`；同 seed 兩次結果相同；`rebuildBlightIndex` 後索引與 patches 一致。
5. 量測：`sim:campaign --months 12` 三個 seed，記每潮月蝕格數；目標 12 潮月後蝕格 < 長陸陸格 15%、每潮月增量 < 3%；超標就調 `rules` 係數（一次一個旋鈕）並記錄。
6. 跑「必用工具」全部、黃金重產，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-blight/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/`（及範圍列的其他檔） |
| 蝕核城與開局 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/places/mumbai.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/campaign-start/default.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-blight/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單；產出——新測試名、三個 seed 的 12 潮月蝕格數表與調過的係數；沒做到或證據不足的——含 `SPEC-GAP`；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `grep -rnE 'zones\b|\.blight\?\.(depth|rift)|PlaceState\[.blight' src/ops` 無命中於非測試檔的蝕域邏輯（`maps[].blight` 索引除外）；`npm run typecheck` 0 錯。
2. `npm run check` 0 錯；`npm test` 全過（沙箱外由領導重跑）。
3. 「工作」第 4 步 8 類測試都存在且通過（REPORT 列測試名）。
4. `npm run sim:campaign -- --months 12` 三個 seed 不拋錯，12 潮月後蝕格 < 長陸陸格 15%（REPORT 附表）。
5. 開局 `place/mumbai` footprint 5×5 全是核、蝕域半徑在 15–25 格（測試或 REPORT 附量測）。
6. REPORT 存在，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-blight`。本線團隊：`teams/grid`。上線先發 `PROGRESS`；每完成「工作」一步發一封 `PROGRESS`（一句話）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-blight --up DONE '一句自足結論' /tmp/cx-grid-blight/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-blight --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「蝕域改成格上蝕塊且驗證全綠」；行動者、迷霧、UI 一律不做——此條優先於工作步驟與 spec 原文。
