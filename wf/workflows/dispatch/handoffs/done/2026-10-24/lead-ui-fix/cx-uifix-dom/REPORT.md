# cx-uifix-dom：DOM 手感修正完成，26 個指定測試與 UI 型別檢查通過

## 做了什麼

完成 contract §1、§3 的 DOM 與 main.ts 接線：三欄佈局、固定指令按鈕節點重用、區分行動／選取／範圍／殘影，加入自動貼合、以格為錨的手動縮放、設定回呼與按鍵提示。量不到尺寸不送 resize。

完成路徑箭頭、攻擊線與命中格閃光、浮字及 group 延遲；同 id 不重播，epoch／skip 清除疊層與計時器；動畫關閉只保留 path、damage／miss，減少動態偏好採快模式。加入下一步選單、部位選擇、結束回合確認、敵方行動頂列與可點擊記錄。

main.ts 以 resolveKey 分流畫面設定與戰局操作；設定讀寫均包 try/catch，URL anim 優先；只保留一個 AI 推進計時器，延遲取演出剩餘時間與基本停頓最大值；提供 __battle.settle()。

固定驗收 5 條對應證據：

1. `node --test --test-isolation=none --test-reporter=tap src/ui-adapter/dom/render.test.ts src/ui-adapter/dom/input.test.ts src/ui-adapter/dom/uifix.test.ts`：exit 0，26 tests／26 pass／0 fail。既有 render 9、input 5 不變；新檔恰好 12 個 test()。沙箱外計數由領導重算。
2. 最後一次 `npx tsc --noEmit -p tsconfig.ui.json`：exit 0、無診斷。過程中曾有 VM 過渡錯誤，最終已消失。
3. 非測試、非 main.ts 的 TS import 僅 vm/types.ts 的 type-only 與同目錄模組；全域 document／window／localStorage 搜尋無命中。由 ownerDocument／defaultView 取得宿主。
4. 本線只改下面所列 DOM 檔、此 REPORT 與授權的 inbox 回報；未碰 integration.test.ts、VM 或其他線改動。DOM 新增 3 模組＋1 測試，非測試檔約 50 KB，未超過 90 KB gate。
5. 本檔含四段、SPEC-GAP 清單與 DOM 錨點表。

## 產出（檔清單）

修改 `src/ui-adapter/dom/` 內的 `board.ts`、`fixtures.ts`、`panels.ts`、`render.ts`、`style.css`、`main.ts`。

新增同目錄 `zoom.ts`（純縮放計算）、`fx.ts`（演出生命週期）、`menus.ts`（浮層）、`uifix.test.ts`（固定 12 條驗收測試）。原有 `render.test.ts`、`input.test.ts` 全過，無須改寫。

交付報告：`wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-dom/REPORT.md`。

## 沒做到或證據不足的

按交接書不跑瀏覽器、Playwright、dev server 或額外驗收；畫面觀感與 e2e 留給領導收線。沙箱外測試計數與型別重跑尚待領導執行。未 commit。

## 需要決定的事

無。本線已依固定驗收完成；code map 等範圍外文件由領導收線時同步。

## SPEC-GAP 清單

沿用 render.ts 的兩項最小解：滾輪 notch 無跨裝置單位，非零一般 wheel 依方向捲 3 格；非 busy 時快照無獨立行動者名稱，依可視格、選取單位、id 順序回退（busy 優先使用 busy.name）。

## DOM 錨點表

以下為新增的 data-ui；既有 commands、board、log 等保持不變。

| data-ui | 用途 |
|---|---|
| view-controls | 畫面設定容器 |
| anim-toggle | 動畫開／快／關 |
| zoom-in、zoom-out、zoom-fit | 放大、縮小、自動貼合 |
| board-zoom-in、board-zoom-out | 戰場角落縮放 |
| fx-layer | SVG／浮字疊層 |
| quick-menu | 棋子旁下一步選單 |
| part-picker | 部位數字選單 |
| confirm | alertdialog 確認框 |
| confirm-accept、confirm-cancel | 確定／取消 |

## 以後交接書該點名的工具

無。
