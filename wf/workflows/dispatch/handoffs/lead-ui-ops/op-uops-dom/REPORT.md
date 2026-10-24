# REPORT — op-uops-dom：營運畫面 DOM 層＋戰鬥銜接＋e2e（DONE；領導代存，子 agent 寫不了 REPORT 檔）

## 做了什麼
- 階段一：照凍結契約 `src/ui-adapter/ops/vm/types.ts`（未改）做 `mountOps(root,{onAction,onKey}) → {render,setActive,destroy}`：頂列、左欄分頁＋裂縫／工時小表、主區八分頁、右欄記錄（五色）；prompt（含命名輸入）、編成、戰果、說明四疊層＋提示列；按鈕一律 `button[data-action-id]`＋`kbd`＋`data-tip`（重用 `dom/tooltip.ts`），disabled 時 tooltip 末行寫原因。
- 世界圖可替換：`world-map.ts` 對外只有 `mountWorldMap(root,{onAction}) → {render,destroy}`；簡單 SVG 線＋圓＋標籤；縮放重用 `dom/zoom.ts` 的 `zoomStep`。
- 階段二：`battle-host.ts`（仿戰鬥頁 `start()`：演出計時、skip、動畫／縮放設定同 localStorage 鍵、忽略 `navigate`；勝負後 `button[data-ui="battle-return"]`（Enter）；掛鉤 `__opsBattle`），`main.ts`（`mountOpsPage(container)`：glob＋`loadWorldPacks`、讀 `seed`／`spectate`；戰鬥時藏營運、另層掛戰場；存檔寫 `mecha-srpg.ops.save`、頂列「讀檔」`dom:load`；掛鉤 `__ops`；殼藏頁時不收鍵）。
- 看截圖修了五個排版問題：根元素 hidden 被 display:flex 蓋掉；殼的 24px padding 讓面板超出視窗（掛載時歸零）；頂列換行推擠（改單行）；世界圖寬度截斷（改貼合寬度）；戰果報告與戰後事件互相遮蓋（改並排）。

## 產出
`src/ui-adapter/ops/dom/` 10 檔（render、tabs、world-map、overlays、ui、fixtures、ops.css、render.test、battle-host、main）、`e2e/ops-campaign.spec.ts`、`op-uops-dom/shots/` 六張（ship、world、contracts、mechs、sortie、report）。共 11 檔 1615 行。

驗收：dom 測試 11／11（改壞 selectNode 與 disabled reason 各一處，對應測試變紅、還原回綠）；typecheck 0；e2e 綠（`/?seed=3&spectate=1&anim=off#/ops`，快捷鍵推進→接約→航向→編成→親自指揮→`__opsBattle.settle()`→返回營運→戰果報告→Esc 關閉），連跑兩次結果相同、無 console error；build 0。

## 沒做到或證據不足的
- 當時 test:dom 2 紅在 vm 線 `controller.test.ts`（seed 3 首張契約由第 14 日變第 43 日，別線內容改動）——領導已移除寫死日數斷言。
- vm 的 Esc 在報告／說明開著時無對應按鈕——DOM 曾補 fallback，領導已改由 vm `resolveButtonKey` 處理並拿掉 DOM fallback。
- 目視小問題（ops／內容層）：記錄有「未登錄事件：WorldAction／DockFee／FuelUsed／Sailed」；「你付給  17.5 幣薪水」人名空白、小數；裂縫記錄顯示原始 id；節點詳情「服務」顯示原始 id；編成標題是「出戰編成」不是契約名。
- 只看了 1280×800；其他尺寸與手感交使用者。

## 需要決定的事
- 殼的 `[data-page="ops"]{padding:24px}` 與營運外距重複；殼拿掉後可刪 main.ts 的歸零行。
- 世界圖排版不再精修（大地圖將改方格）。

## 以後交接書該點名的工具
Playwright `page.screenshot` 後用 Read 親眼看圖；五個排版問題 happy-dom 與 e2e 都是綠的，全靠截圖發現。
