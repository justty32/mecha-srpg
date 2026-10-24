# 任務：寫大地圖產生器並在暫存區產出長陸、靜海面樣本圖與地形、地點、區域、航道檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`content/lore/style.md`、`content/README.md`——**親自讀，不靠本交接書的摘要**。接著讀凍結格式 `wf/workflows/dispatch/handoffs/lead-grid/PLAN.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/` 的 `README.md`、`map-and-terrain.md`、`continents.json`、`terrain-layers.json`（只讀，不改；兩個 json 用 `python3 wf/tools/tabledb.py {檔} get <i>` 讀）。

## 背景與唯一目標

營運層要從節點圖換成方格大地圖（一格＝船一天航程的十分之一，長陸 250×150）。本線產出**第一批內容樣本**與可重用的產生器：從 1/4 解析度手畫字元草圖放大＋雜訊生成 RLE 圖檔。產物先放**暫存區**（另一條線同時在改載入器，產物進 `content/base/` 會打斷它的測試），領導之後搬進 `content/base/world/`。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：新檔 `src/ops/content/worldgen.ts`（產生器＋`--check` 自驗，純 node 標準庫）、`src/ops/content/worldgen.test.ts`；新目錄 `src/ops/content/worldgen/`（草圖 `longland.sketch.txt`、`lunar.sketch.txt` 與產生器設定 json）；暫存區 `wf/workflows/dispatch/handoffs/lead-grid/stage/world/` 底下的 `maps/`、`regions/`、`wterrains/`、`places/`、`lanes/`；REPORT 目錄 `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-maps/`。
- 產生器 CLI：`node src/ops/content/worldgen.ts {設定.json} --out {maps 目錄}`（設定指草圖、放大倍數、雜訊種子、圖例、region 草圖、`darkRects`、`riftRate` 等）與 `node src/ops/content/worldgen.ts --check {stage/world 目錄}`；同設定同種子輸出位元相同。雜訊只在海岸與地形交界擾動，不得讓地點所在格變成不可停的地形；用自帶的決定性 PRNG。
- **14 種地形**：`wterrains/{name}.json`，id 與數值照 `terrain-layers.json`（`wterrain/tidesea` 等；`air_cost`／`ground_cost` 的 `-` 寫 `null`；`battle_pool` 轉成 `terrain/{id}` 陣列，都已存在於 `content/base/terrains/`；城廓 `encounter` 寫 0.6 並加 `"encounterLost": 1.5`、`riftAffinity` 0.4；月坑 `riftAffinity` 1.0；`flavor` 照抄）。
- **長陸** `maps/longland.json` 250×150，`fog:"charted"`、`darkRects` 蓋北緯約 65° 以上、`riftRate` 1.0、`cellKm` 40。草圖 63×38 左右、手畫亞歐輪廓：投影 `x = round((經度+10)×250/190)`、`y = round((80−緯度)×150/90)`（西到大西洋岸、東到太平洋、北到北冰洋、南到爪哇）；要畫出印度次大陸、孟加拉灣、中南半島與馬來半島到新加坡、阿拉伯半島、日本、喜馬拉雅（雲嶂＋山脊）、西伯利亞冰原、中亞沙海、東南亞林海、恆河三角洲濕地。`region` 層：孟加拉灣周邊 10–20 個細區（恆河口、孟加拉灣蝕線、吉大港岸⋯），其餘大陸 10–15 個粗區；名字照 style.md 的太空歌劇語感、避免直譯（舊地名可留在 `phrase`）。`road` 可省或只畫幾條。`regions/longland.json` 照 PLAN 格式。
- **靜海面** `maps/lunar.json` 120×120，月壤／月坑／月脊三種、`darkRects` 蓋右半（x ≥ 60）、`riftRate` 0、`cellKm` 20；`regions/lunar.json` 3–6 區。
- **地點** `places/`：把 `content/base/world/nodes/` 現有 8 個節點（`dhaka`、`chittagong`、`delta`、`singapore`、`old-array`、`reed-marsh`、`ridge`、`salt-flat`）各轉一檔 `place/{同名}`：`name`、`owner`、`pop`、`services`、`tags`、`ruin` **原樣照抄、不改文字**；去掉 `body`、`terrainPool`；`kind` 對照 `city→city`、`wild→outpost`、`ruin→ruin`、`ferry-port→port`；座標依真實地理投影放在孟加拉灣周邊（虛構地點依它們在 `content/base/world/routes/` 的相鄰關係與名字意象放，相鄰的相距 3–15 格，新加坡在馬來半島尖端）；城邦 `size: 3`，其餘省略；footprint 互不重疊且至少隔 1 格，可在投影位置 ±4 格內挪；地點所在格不可是潮海與雲嶂（`port` 可在海岸潮海格）。另加月面 `place/selene-city`（`kind:"lunar-base"`、`size: 3`、在正面左半、`services: []`、`tags: []`，`name` 寫「靜海市」）。
- **航道** `lanes/selene.json`：照 PLAN 範例（新加坡→靜海市 `orbital`），數值取自 `content/base/world/ferry.json`。
- 不做：寫進 `content/` 任何位置（全部放暫存區）；改 `content/base/world/nodes/`、`routes/`、`ferry.json` 或任何既有檔；`src/ops/` 下 `worldgen*` 以外的檔（`grid.ts`、`load.ts`、`check.ts`、`types.ts` 由 `cx-grid-core` 同時在寫）；另外四張地球圖（赭洲、霧陸、綠淵、南殼）；`maps`／`places` 以外的新內容種類（actors、events…）；`package.json`；`wf/`（除暫存區與 REPORT 目錄）。
- 件數 gate：新增檔超過 45 件就停下回報；容量 gate：單一圖檔超過 40 KB 或暫存區合計超過 300 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node src/ops/content/worldgen.ts --check {暫存區 world 目錄}` | 產完每張圖都跑；要 0 錯 |
| `node --test src/ops/content/worldgen.test.ts`、`npm run typecheck` | 寫完產生器跑 |
| `python3 wf/tools/tabledb.py {檔.json} get <i>`／`columns` | 讀 spec 的 continents.json、terrain-layers.json |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-maps --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出新增了哪些檔）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（暫存搬 `/tmp/cx-grid-maps-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個，只准為推進正事開，它若做實質工作也要親自讀 AGENTS.md 與上列規矩。同一工作樹裡另有 codex 線 `cx-grid-core` 在寫 `src/ops/{world,content,state}/` 其他檔與 `content/base/world/actions/ops-world.json`，也有其他領導線在寫 `src/ai/`、`content/` 文字欄；看到別人的未提交改動不要還原。`npm test` 期間若因別線半成品而紅，不算你的錯，照實記錄即可（你的驗收不含 `npm test`）。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。

## 工作

1. 讀「先讀」；讀 `content/base/world/nodes/*.json`、`routes/*.json`、`ferry.json`、`content/base/terrains/` 檔名。
2. 寫 `worldgen.ts`：草圖解析 → 放大（最近鄰）→ 交界雜訊 → 逐列 RLE（字元後接重複數，重複 1 次省略數字；圖例字元不得是數字）→ 輸出圖檔；`--check` 驗：列解碼長度＝width、列數＝height、字元都在 legend、legend 指向存在的暫存 wterrain、地點座標在圖內且合規、footprint 不重疊、航道兩端存在、有 dark 的圖至少一地點在 charted 格。
3. 畫兩張草圖與 region 草圖、產 14 地形、兩張圖、兩個區域檔、9 個地點、1 條航道；`--check` 0 錯。
4. `worldgen.test.ts`：RLE 往返、決定性（同種子兩次相同）、`--check` 對壞輸入報錯且對暫存區 0 錯。
5. 在 REPORT 附長陸與靜海面的 1/4 縮圖字元預覽（每 4×4 取多數地形字元，地點用大寫字母標），寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-maps/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 產生器與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/content/worldgen.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/content/worldgen.test.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/content/worldgen/` |
| 暫存內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/stage/world/{maps,regions,wterrains,places,lanes}/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-maps/REPORT.md` |

REPORT 四段（做了什麼——新增檔清單；產出——兩張圖的尺寸、各地形格數、陸格數、RLE 檔大小、9 個地點座標表、縮圖預覽；沒做到或證據不足的；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node src/ops/content/worldgen.ts --check /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/stage/world` 回 0 錯、exit 0。
2. 暫存區有 14 個 wterrain、2 張圖（250×150、120×120）、2 個區域檔、9 個地點、1 條航道，id 與格式照 PLAN.md。
3. 8 個轉換地點的 `name`／`owner`／`pop`／`services`／`tags`／`ruin` 與原節點逐欄相同（REPORT 附比對指令與輸出）。
4. 同設定同種子重跑產生器，輸出檔 `sha256sum` 相同（REPORT 附兩次雜湊）；`node --test src/ops/content/worldgen.test.ts` 全過、`npm run typecheck` 0 錯。
5. REPORT 存在，含兩張縮圖預覽與地點座標表；改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-maps`。本線團隊：`teams/grid`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-maps --up DONE '一句自足結論' /tmp/cx-grid-maps/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-maps --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「產生器＋暫存區樣本」；任何需要寫進 `content/` 或改既有檔的需求寫進 REPORT，不動手——此條優先於工作步驟。
