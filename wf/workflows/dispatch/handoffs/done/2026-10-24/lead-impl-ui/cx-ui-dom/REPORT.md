# cx-ui-dom：DOM 實作完成，14 測試全過且整體型別檢查通過

## 做了什麼

完成 `mountBattle`、戰場 CSS grid 與 dirty 局部更新、單位徽章與血條、分組指令與快捷鍵、單位／查看／記錄／提示／結算／說明面板、自繪 tooltip、深色 CSS。輸入轉送 clickCell、hoverCell、scroll、CommandOption.action、KeyInput；支援 Shift 水平捲動、四向 10 格按鈕與可用時的 ResizeObserver。destroy 移除事件、observer 與本次掛載節點。

只消費凍結型別，未引用 vm 實作；DOM 取自 root.ownerDocument／defaultView。手造 fixture 為 160×160 地圖、30×20 可視區。每檔完成均跑 typecheck 與 inbox_poll；本線未 commit、未開 GUI、未安裝依賴。

固定驗收五條的證據：

1. 沙箱內指定指令 `node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/*.test.ts'` exit 0：tests 14、pass 14、fail 0（render 9、input 5）。最後一次 `npm run typecheck` exit 0，兩段 tsc 全過；沙箱外重算仍交領導。
2. 本線非測試檔 imports 只有 `../vm/types.ts` 的 type import 與同目錄模組；全域 document/window 存取搜尋無命中。本線不含領導的 main.ts。
3. 全部指定 data-ui 錨點，以及 data-cmd、data-x、data-y 已實作；錨點由 anchor helper 與 dataset 寫入。
4. 本線只新建下列 8 個 DOM 檔與本 REPORT。開場 git status 已有 package、tsconfig、wf 等改動；執行期間其他線新增 main.ts、e2e、ops 等檔，因此全工作區 status 無法宣稱只有本線檔案，本線未修改它們。
5. 本 REPORT 具四段、SPEC-GAP 清單與工具段。共 9 個交付檔，8 個 DOM 檔合計 36,060 bytes，加 REPORT 仍小於 80 KB。

## 產出（檔清單）

程式目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/dom/`

- `render.ts`：mountBattle、版面、輸入與生命週期。
- `board.ts`：格節點與 dirty 渲染。
- `panels.ts`：指令、單位、查看、記錄、說明等面板。
- `tooltip.ts`：滑鼠與鍵盤焦點提示。
- `style.css`：方格與面板樣式。
- `fixtures.ts`：手造快照。
- `render.test.ts`：固定 9 個測試。
- `input.test.ts`：固定 5 個測試。

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-dom/REPORT.md`

## 沒做到或證據不足的

終局狀態：**DONE**。本線程式、固定測試與型別檢查已完成；既定沙箱外重算由領導執行。未執行瀏覽器、Playwright 或額外驗收。

稍早 main.ts 缺少 vm/index.ts，曾發出 BLOCKED；寫 REPORT 期間別線交付依賴，最後 `npm run typecheck` 已 exit 0。後續 DONE 取代該暫時阻塞回報。

本版 happy-dom WheelEvent 未提供 MouseEvent 的 shiftKey，固定滾輪測試用 Object.defineProperty 補上此瀏覽器欄位，再驗證水平 action；未改套件或產品邏輯。

## 需要決定的事

無需使用者裁決。請領導完成既定的沙箱外驗收與主程式接線；本線沒有改動 main.ts、vm、code-map 或 SESSION-LOG 的授權。

## SPEC-GAP 清單

- wheel 的 notch 沒有跨裝置明確單位：採每個非零 wheel 事件依方向送 3 格；Shift 取水平，原生 deltaX 亦可水平。已在 render.ts 註解。
- UiSnapshot 沒有獨立行動者名稱：優先由可視格單位／selected 查名稱，找不到就顯示 activeUnit id，不從其他層補資料。已在 render.ts 註解。

## 以後交接書該點名的工具

無。
