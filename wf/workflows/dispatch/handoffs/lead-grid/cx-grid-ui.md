# 任務：做營運大地圖面板（抽出戰場共用 GridView、WorldViewModel、圖層、map 快捷鍵、e2e）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（含「改 `src/ui-adapter/` 必跑」段）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/lead-grid/PLAN.md`、第二波 REPORT `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-migrate/REPORT.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/ui-contract.md`、`map-and-terrain.md`（只讀，不改）。

## 背景與唯一目標

營運層已換成方格（第二波），但營運畫面的「世界」分頁還是暫時的 SVG 圓點圖。本線照 ui-contract 做**真正的大地圖面板**：把戰場的可視區方格渲染抽成共用 `GridView`（DOM 真格子、每格一個 `div`、可視區＋dirty），營運端寫 `WorldViewModel`，提供圖層、游標、路徑預覽、tooltip、縮圖與 `map` context 快捷鍵；戰場畫面行為不變。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：`src/ui-adapter/ops/**`（`dom/world-map.ts` 換成方格版、`vm/layout.ts` 可改或移除其用途、新增 `vm/world.ts` 之類的 WorldViewModel、`vm/types.ts` 加世界視圖型別）；新檔 `src/ui-adapter/dom/grid-view.ts`（＋測試）與 `src/ui-adapter/dom/board.ts` 改用它（戰場行為與 DOM 結構對外不變）；`src/ui-adapter/dom/style.css` 與 `src/ui-adapter/ops/dom/ops.css` 的方格樣式；`content/base/world/keymap-ops.json`（加 context `map` 的綁定，不改既有綁定）；`e2e/ops-campaign.spec.ts` 與新檔 `e2e/ops-map.spec.ts`；REPORT 目錄 `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-ui/`。
- 讀營運狀態一律走 `src/ui-adapter/ops/vm/` 現有方式（controller／snapshot 讀 `CampaignState` 與 WorldDB），可呼叫 `src/ops/world/grid.ts`（`gridOf`、`findPath` 等）、`src/ops/world/places.ts`（`placeDef`／`allPlaces`）、`src/ops/world/blight.ts`（`blightAt`）、`src/ops/world/move.ts` 的路徑預估函式——**只呼叫、不改**；需要 ops 端新函式就寫進 REPORT「需要決定」，自己在 vm 裡做等價的唯讀計算。DOM 層照現行邊界只 import vm 型別。
- 圖層：`terrain`、`blight`（讀 `s.maps[map].blight`，第三波才有資料，空也要能畫）、`places`、`actors`（讀 `s.actors`，現在為空，空也要能畫）、`path`、`region`、`fog`（`darkRects` 區且 `known` 無快照的格畫黑；`known` 現為空）、`sight`、`territory`；預設全開。縮放三段（1、½、¼；¼ 可用單一 canvas 或背景，只接受點擊跳轉）、右下縮圖點擊跳 `viewport`、可視區以船為中心。
- 操作：游標移動與捲動沿用戰場鍵；`Enter`＝對游標格下 `sail`（有地點航向地點、否則航向格）；`Tab`／`Shift+Tab` 在地點間跳；`c` 回船；`d` 泊／懸（在地點 footprint 內送 `dock`、否則 `drift`）；`w` 等一天；`t` 切圖；`l` 圖層選單；`m` 縮圖開關；`Escape` 取消預覽；滑鼠點格移游標、雙擊＝Enter、滾輪縮放、hover tooltip（座標、地形、區域、蝕深、地點、到此 N 天 M 燃料）。右側按鈕列：航／泊／懸／等／切圖／圖層／回船，標鍵、不可用時灰掉並寫原因。
- 不做：任何 `src/ops/` 檔的修改（第三波另兩條線 `cx-grid-blight`／之後的 `cx-grid-actors` 持有）；`src/ui-adapter/` 的 `vm/`（戰場 vm）、`dom/render.ts` 以外的戰場行為改動（`board.ts` 改用 GridView 時對外行為不變）；百科（`wiki`）；`content/` 其他檔；`src/mcp/`；`wf/`（除 REPORT 目錄）。
- 件數 gate：改＋新增檔超過 30 件就停下回報；容量 gate：單一新檔超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run test:dom`、`npm run typecheck`、`npm run build` | 每完成一步跑 |
| `npm test` | 收尾跑（沙箱外由領導重跑） |
| `npm run test:e2e` | 收尾跑；沙箱內起不了 preview 伺服器時照實寫，由領導在外面跑 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-ui --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗（Playwright 只准 headless）；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（要丟的檔搬 `/tmp/cx-grid-ui-trash/` 並在 REPORT 列出）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個，只准為推進正事開，它若做實質工作也要親自讀 AGENTS.md 與上列規矩。工作樹裡同時有 codex 線 `cx-grid-blight` 在寫 `src/ops/`，以及其他領導線在寫 `src/ai/`、`content/` 文字欄；看到別人的未提交改動不要還原，`src/ops/` 測試若因對方半成品而紅，不算你的錯、照實記錄。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準是已知現象。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 測試、Playwright 與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**；REPORT 註明，由領導在沙箱外重跑。

## 工作

1. 讀「先讀」與 `src/ui-adapter/dom/{board,render,zoom}.ts`、`src/ui-adapter/vm/types.ts` 的 viewport／cells／dirty 契約、`src/ui-adapter/ops/**` 現況。
2. 抽 `GridView`（吃 ui-contract 的 `GridSource` 形狀：`size`、`viewport`、`cell(x,y)`、`dirty()`），`board.ts` 改用它，`npm run test:dom` 與戰場 e2e 不變。
3. `WorldViewModel`（vm，純資料、node 可測）：圖層、游標、`hover`、`pathPreview`、`minimap`、`actions`；vm 單元測試含：游標到地點→Enter 產生的 `cmd` 是 `{ v:"sail", to: 地點 id }`；游標到空格→`to` 是格；`pathPreview` 天數與 `findPath` 一致；`blight`／`actors` 為空時不拋錯。
4. DOM 世界分頁換成方格大地圖；`keymap-ops.json` 加 `map` context；happy-dom 測試：方格數＝viewport 格數、切圖層後 class 改變、Enter 送出 sail。
5. e2e：`e2e/ops-map.spec.ts` 一條「開局→世界分頁→游標移到地點→Enter→推進到抵達→泊」；`ops-campaign.spec.ts` 若受影響就修。
6. 跑「必用工具」全部，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-ui/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 共用方格渲染 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/dom/grid-view.ts` |
| 大地圖 vm 與 dom | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/` |
| e2e | `/home/lorkhan/repo/game_dev/mecha-srpg/e2e/ops-map.spec.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-ui/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單；產出——新測試名、`npm run build` 結果、e2e 結果或沙箱限制說明；沒做到或證據不足的——含 `SPEC-GAP`；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run typecheck` 0 錯、`npm run build` 成功。
2. `npm run test:dom` 全過，含「工作」第 3、4 步列的 vm 與 DOM 測試（REPORT 列測試名）。
3. `npm run test:e2e` 全過（含新的 `ops-map.spec.ts` 與既有戰鬥 7 條；沙箱外由領導重跑）。
4. `src/ui-adapter/dom/board.ts` 經 `grid-view.ts` 渲染，戰場 DOM 選擇器（`.battle-cell`、`data-x`／`data-y`）不變。
5. REPORT 存在，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-ui`。本線團隊：`teams/grid`。上線先發 `PROGRESS`；每完成「工作」一步發一封 `PROGRESS`（一句話）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-ui --up DONE '一句自足結論' /tmp/cx-grid-ui/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-ui --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「大地圖面板與共用 GridView」；`src/ops/` 一律不改——此條優先於工作步驟與 spec 原文（spec 說 `Screen.panels.map` 由 `ops/text` 產出，本線改在 vm 內算，標 `SPEC-GAP`）。
