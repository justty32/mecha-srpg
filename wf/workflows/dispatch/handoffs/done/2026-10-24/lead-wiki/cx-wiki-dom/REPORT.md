# cx-wiki-dom 回報

## 做了什麼
完成百科 DOM 六頁：首頁、分類清單、搜尋、詳情、年表、勢力關係。提供契約要求的 mountWiki／WikiApi／WikiMountOptions／WikiMount 與 renderBlocks；凍結錨點齊全。搜尋框保持同一節點，120ms debounce 使用 replace 導航；側欄手機抽屜、說明表、Escape 失焦與 destroy 清理完成。所有內容使用 DOM 節點與文字建立，內部連結保留修飾鍵／中鍵行為，外部連結加指定屬性。

2026-10-24 最終驗證：

- `node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/wiki/*.test.ts'`：exit 0；恰好 10 個 test()，TAP tests 10／pass 10／fail 0。
- `npx tsc --noEmit`：exit 0。
- `npx tsc --noEmit -p tsconfig.ui.json`：exit 0；每個檔完成後也已執行。

靜態檢查納入第 10 條，禁用寫入 API 與跨層 import 的負例皆確認可被辨識。boot.ts 依共用契約 §3 明文接線例外排除。每步已輪詢 orders，上線 PROGRESS 已送 lead-wiki。

## 產出（檔清單）
程式根目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/dom/wiki/`。

- `mount.ts`
- `markdown-dom.ts`
- `card-dom.ts`
- `pages.ts`
- `wiki.css`
- `mount.test.ts`
- `fixtures.ts`

另交付本檔：`wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-dom/REPORT.md`。共 7 個程式／測試檔，加 REPORT 為 8 個新檔；正式程式與 CSS 合計 31,094 bytes，含 REPORT 仍低於 70 KB。只拆 2 個附加模組。git status 核對本線產物皆在允許路徑；其他線的既有改動未碰。未 commit。

## 沒做到或證據不足的
沙箱外不帶 `--test-isolation=none` 的計數及重跑由領導執行，本文不冒稱已有沙箱外證據。中途曾遇別線 `vm/wiki/cards.ts:156` 型別錯誤，最終兩份 tsc 已全綠。依交接書未執行瀏覽器、Playwright 或額外驗收；視覺實機結果沒有證據。

## 需要決定的事
無。

## SPEC-GAP 清單
api.list／api.entry 回 null 時，契約未指定空頁樣式；採最小解顯示「分類未建立。」／「條目未建立。」。已在 mount.ts 註解 SPEC-GAP，未改凍結型別。

## 以後交接書該點名的工具
無。
