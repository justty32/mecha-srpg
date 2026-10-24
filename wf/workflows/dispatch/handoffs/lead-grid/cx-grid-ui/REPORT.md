# cx-grid-ui 交付報告

2026-10-24；團隊 teams/grid。實作完成，終局 BLOCKED：Playwright 在沙箱內無法啟動／連線 preview，須領導於沙箱外完成固定第 3 條驗收。保留全部改動，未 commit。

## 做了什麼

抽出 `dom/grid-view.ts`，以 size／viewport／cell／dirty 管理可視格與增量更新。戰場 board 透過它渲染，原有 `.battle-cell`、`data-x`、`data-y`、格內 glyph／unit／HP 結構保留。

新增純資料 WorldViewModel，讀 CampaignState／WorldDB，航程直接使用 shortestPath。世界分頁改成方格 DOM；提供九圖層、游標、滑鼠 tooltip、路徑預覽、三段縮放、右下縮圖與全圖點擊跳轉。DOM 對最新可視格做差異比較，日結只重畫改變的格；離開再回世界分頁與縮放回來會保留／重新整理正確格子。

新增 map context，原有 context 綁定未改。支援方向鍵、Shift 方向鍵捲 10 格、加減／0、Enter、Tab／Shift+Tab、c／d／w／t／l／m／Escape；懸停另標 Shift+D。右列按鈕由 vm 提供指令、鍵、航程成本與拒絕原因；真正命令先走現有 applyCommand 唯讀試算。

完整檔清單見 [files.json](files.json)。本線共 18 件（15 件程式／測試／內容，3 件報告產物），低於 30 件；最大新程式檔 world.ts 約 17 KB，低於 40 KB。沒有修改 src/ops、其他 content、戰場 vm、百科、MCP 或範圍外 wf；沒有 commit、刪檔、丟棄檔案或安裝依賴。

## 產出

固定五條驗收如下，沒有另加驗收項。

| 條 | 結果 |
|---|---|
| 1 | typecheck exit 0；build exit 0。最終證據見 `/tmp/cx-grid-ui/verified-1.log`、`verified-2.log`。 |
| 2 | test:dom exit 0，24 個測試檔全過、0 fail／cancelled。證據 `/tmp/cx-grid-ui/verified-0.log`；沙箱以檔計數，未冒稱細項數。 |
| 3 | 已執行 test:e2e；webServer 啟動 exit 1，localhost:4174 回 EPERM。尚無任何瀏覽器通過證據，含既有戰鬥 7 條，由領導沙箱外重跑。 |
| 4 | board.ts 改經 GridView；既有戰場 DOM 測試全過，選擇器保留。 |
| 5 | REPORT 與 files.json 已落盤；清單全在允許範圍。 |

新測試精確名稱：`GridView：可視格數、dirty 更新與同尺寸捲動`（dom/grid-view.test.ts）；`世界游標到地點 Enter 航向 id；空格 Enter 航向座標`、`世界 pathPreview 天數與 findPath 一致；空 blight／actors 可畫`（ops/vm/world.test.ts）。

happy-dom 的固定測試為 `世界方格：格數等於 viewport、切圖層改 class、Enter 送 sail`（ops/dom/render.test.ts，取代舊 SVG 測試）；實際走 controller.key／dispatch，驗證 sail 之後船有路徑。細項證據另在 `/tmp/cx-grid-ui/dom-detail.log`、`world-detail.log`。

新增 e2e 名稱 `大地圖：開局 → 世界分頁 → 游標到地點 → Enter → 抵達 → 泊`（e2e/ops-map.spec.ts）；既有 ops-campaign 改用方格選擇器，世界頁的 c 已是回船，故切契約改點分頁按鈕。e2e 證據 `/tmp/cx-grid-ui/final-e2e.log`。

必用工具 npm test 已跑完，exit 1：139 個測試檔，126 pass、13 fail、0 cancelled，見 `/tmp/cx-grid-ui/final-3.log`。所有 UI 測試通過；失敗檔分布於 MCP、營運內容載入／worldgen、營運模擬與 golden、war-invariants、encounter／scenario、tick／move、campaign golden，均不在本線修改範圍。執行期間蝕域線與內容線同時改動工作樹，因此這份完整測試不能當成它們完成後的穩定結果。

## 沒做到或證據不足的

E2E 阻塞證據：`connect EPERM ::1:4174` 與 `connect EPERM 127.0.0.1:4174`，接著 `Process from config.webServer was not able to start. Exit code: 1`。沒有截圖、GUI 或實機目視驗證，也不宣稱這些已通過。解除條件：領導在沙箱外跑 npm run test:e2e，若測出不符再依實際失敗修正。

npm test 的失敗尚未逐一取得 assertion 證據，不能全歸因沙箱；由各持有線及領導在工作樹穩定後重跑。為排除本線 keymap 對載入檢查的影響，另重跑 load.test.ts，25 個細項全過（`/tmp/cx-grid-ui/load-detail.log`）；沒有用此結果覆寫前述完整測試的 13 fail。開發中 typecheck 曾受蝕域型別遷移影響，最終重跑已 exit 0，沒有改它們的檔案。

SPEC-GAP：依交接書範圍優先規則，沒有新增 ops/text 的 Screen.panels.map，改由 vm 產生。尚無可呼叫的 fog 視野公開函式，vm 依目前地形、船 sight 與 uplink 設定做唯讀計算。known 尚無行動者完整歷史位置快照，行動者由 s.actors 畫出；dark 且沒有 known 的格仍遮黑。迷霧與行動者後續契約到位後應由持有線補齊歷史快照語意。

共用 GridSource 的 dirty 可接受 all；世界 vm 供純資料 snapshot，DOM 以格資料差異轉成 dirty 集合，未搬出可變 CampaignState。縮圖以每 4×4 格取樣並覆蓋地點／船／路徑標記；¼ 總覽使用 canvas，點擊只跳視窗。沒有追加效能 benchmark 驗收。

## 需要決定的事

領導於沙箱外重跑完整 E2E，並在蝕域／內容線收斂後重跑 npm test。新增 code-map 與 spec 同步超出本線允許的 wf 路徑，交領導更新。沒有擅自補做額外功能；不要求使用者再決定既有授權範圍內的事項。

## 以後交接書該點名的工具

`DEBUG=pw:webserver npm run test:e2e` 可保留 preview 連線 EPERM 的實際證據；`node 某測試.test.ts` 可補 node --test 只報檔級結果時的 assertion 證據。檔案清單使用既有 tabledb Python API 寫入。
