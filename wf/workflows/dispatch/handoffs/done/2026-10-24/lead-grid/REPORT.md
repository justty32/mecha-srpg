# REPORT — lead-grid：方格大地圖實作（engine-backlog P1 第 1 列）

[PLAN](PLAN.md)｜spec [world-grid](../../../planning/specs/ops/world-grid/README.md)｜[engine-backlog](../engine-backlog.md)

> 由頂層代存（harness 擋子 agent 寫報告檔）。

STATUS：**DONE**（2026-10-24）。營運層已從節點圖換成方格大地圖；工人全用 codex `gpt-6-astra`（reasoning high），共 9 條線，領導只做拆工、監看、驗收、合併與小修。

## 做了什麼

分六波：

1. `cx-grid-core`、`cx-grid-maps` 並行：`src/ops/world/grid.ts`（RLE、八鄰、A\*、洪水填充、視野）、載入器新資料夾與 `npm run check` 的 world 驗證、40×40 測試 pack；產生器 `src/ops/content/worldgen.ts` 與長陸 250×150、靜海面 120×120、14 種大地圖地形。
2. `cx-grid-migrate`：節點換成地點、逐格移動點、跨圖航道、`Loc.cell`、契約 `target.place`、ScenarioGen 讀格、`sail` 三型（地點／格／`@行動者`）、MCP 與 ui-ops 適配。
3. `cx-grid-blight`、`cx-grid-ui` 並行：格上蝕塊（7–12 格、族偏好、退最年輕的塊、核 1→3×3、塊齡定深、新裂縫落格與 rift-site 動態地點、城邦 footprint 失守、孟買 5×5 蝕核城開局、天象掛鉤 `spreadDelta`／`anchorInstant`）；共用 `GridView`（戰場 board 也改用）與大地圖面板。
4. `cx-grid-actors`：五種行動者、人口下限補生、作戰部隊影子、遭遇四選與被劫、攔截戰規模上限、迷霧 `known` 快照與天網 uplink。
5. `cx-grid-verify`（FAILED）接 `cx-grid-verify2`：停泊安全、敵意照聲望／戰爭判定、`npm run sim:grid-health` 量測、24 蝕月不終局。
6. `cx-grid-terms`：頂層交辦的 src 舊詞顯示字串。

主要 commit：`de49460`（核心）、`9b561da`（遷移）、`1a0ae23`（蝕塊）、`2c8d2d5`（UI）、`77137ff`（行動者）、`c9c42f8`（驗證調參）、`539ca75`（用語）、`9596ed7`（收線）。各工人的 REPORT 在本資料夾 `cx-grid-*/`。

## 驗收證據（沙箱外，領導重跑）

`npm test` 912／912；`npm run check` 兩段皆 0 錯；`npm run typecheck` 0；`npm run test:e2e` 13／13（新增 `e2e/ops-map.spec.ts`）；`npm run build` 成功；`npm run sim:campaign -- --months 24` 跑滿 24 蝕月、印 OK，第 24 蝕月蝕格 1,852（長陸陸格 16,300 的 11%）、行動者 104、累計遭遇 45；`npm run sim:grid-health` 九組全 PASS；`wf-lint --strict` 0 違規。engine-backlog 第 1 列標已完成、第 5 列改寫；codex-effects 第 20 列轉「會」，第 15 列改備註；code-map 的 ops、ui-ops 列已更新。

## 判斷

架構可以放心：位置模型、移動、蝕域、行動者都照 spec 做了，spec 測試策略 (1)(2)(4)(6) 有覆蓋，(3)(5) 做了主要部分。平衡還沒好：verify 線為了讓 greedy 第二年不破產，把偵察／護送契約報酬加倍、潮壓的蝕塊正回饋係數設 0，結果預設 seed 第 24 蝕月現金約 15 萬、債務沒動，現在偏寬，屬 engine-backlog 第 5 列。長陸草圖偏粗（印度次大陸過窄），正式圖交內容線重畫。

## 替使用者做掉的決定（皆標 SPEC-GAP 或記在 PLAN）

- 大地圖地形獨立成 kind `wterrain`；地點可用 `size` 簡寫 footprint；迷霧暗區用 `darkRects`。
- 事件 `where:"node"／"route"` 與條件 `$node` 保留為 place／field 的別名，內容線舊檔不必改。
- 舊 `routes/` 12 檔先 `git mv` 到 `archive/routes/`；2026-10-24 使用者同意後由頂層 `git rm`。
- 警戒行動者只記「目擊」、不攔船；停泊中的船不遭遇（失守城例外）。
- 遭遇率按航行日計，蝕域遭遇只在移動日擲骰。
- 攔截戰加入的友軍或第三方每方最多 1 個行動者、每個最多 4 台、全場最多 16 台，商隊只出 0–2 台護衛；無人可戰又逃不掉時以「被劫」扣 10% 現金結算。
- 行動者人口下限 45（每日最多補 5）；航道不載船（`carriesShip:false`）時船仍跟著過去；常備軍 `speed` 當地面移動點的倍率。
- `jobs/repair.json` 補 structure 層修理係數（原本 structure 歸零的部位永遠修不了）。

## 需要決定

1. 第二年經濟重調（engine-backlog 第 5 列）：建議目標「第 24 蝕月現金低於開局債務 2 倍、第二年每月現金變化在 ±1,000 內」，用 `npm run sim:grid-health -- --months 24` 量。
2. ~~`archive/routes/` 12 檔要不要 `git rm`~~：已刪（使用者同意，2026-10-24）。
3. 剩餘工作：四張地球圖（赭洲、霧陸、綠淵、南殼）與完整月面交內容線（用 worldgen 產）；地點模板 `encounters/place-*`、護送綁商隊、join 綁部隊、交涉對白 `dialogues/encounter-*`、月面載具交引擎線。
4. lead-tune 情報：出戰前 mood<0 注入 `morale-shaken`（`src/ops/sortie/scenario.ts`），ops 端要不要出戰前回復士氣，未處理。

## 以後交接書該點名的工具／教訓

- 沙箱禁止 socket listen 與部分 `spawnSync`。交接書要明寫「MCP／子行程測試在沙箱內失敗是已知限制、不要停工」，否則 codex 會自停（本線發生兩次）；完整 `npm test` 與 e2e 由領導在沙箱外跑。
- git index 是共用的。領導搬檔後不要把 `git mv` 留在暫存區；commit 用 `git add -A -- <路徑> && git commit -- <路徑>` 一次做完；重產索引用 `GIT_INDEX_FILE=<tmp> git read-tree HEAD` 的暫存 index。
- codex 遇到範圍外的必要接線會逐件請示；授權時順帶寫「同類不必再問」可以省很多來回。
- 判準要和政策一起想：idle 的船不動、greedy 多半停泊，「每天遭遇率」對它們沒有意義。
