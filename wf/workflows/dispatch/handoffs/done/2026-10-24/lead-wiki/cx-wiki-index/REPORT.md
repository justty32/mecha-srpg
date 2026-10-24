# cx-wiki-index 回報

## 做了什麼

完成百科索引、分類中文名稱與面向、搜尋、年表、勢力關係矩陣及首頁的七個純 TypeScript 模組。索引先建立條目與名稱，再解析跨 pack 引用、反向引用與面向；壞結構記錄 issues，重複鍵採後一筆。未改凍結型別、markdown、content 或其他線檔案，未 commit。

固定驗收三條的本線證據如下。

1. `node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/*.test.ts'` 最後執行 exit 0，32 pass、0 fail（含別線 cards 10 條與 markdown 10 條）。本線兩個測試檔恰好 12 個 `test()`：index.test.ts 9 個、views.test.ts 3 個，涵蓋交接書指定的十二項，沒有增加測試條數。真實 base 遞迴載入，斷言條目數等於檔數、引用與分類存在、每個名稱可搜回自身；沒有固定內容 id 或件數斷言。
2. `npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 已執行，本線九個檔案均零錯誤；全專案 exit 1 的來源列於下一段。每個檔案完成及修改後均執行 UI 型別檢查。
3. 本 REPORT 位於指定路徑，四段與補充段齊全。`git status --short --untracked-files=all` 查核本線新增檔均在授權範圍；七個功能檔與兩個測試檔，共九個程式檔，非測試功能檔約 18.5 KB，未達 60 KB gate。REPORT 依交接書「外加你的 REPORT」另計。

## 產出（檔清單）

程式與測試均位於 `src/ui-adapter/vm/wiki/`：

- [kinds.ts](../../../../../../../../src/ui-adapter/vm/wiki/kinds.ts)
- [index.ts](../../../../../../../../src/ui-adapter/vm/wiki/index.ts)
- [list.ts](../../../../../../../../src/ui-adapter/vm/wiki/list.ts)
- [search.ts](../../../../../../../../src/ui-adapter/vm/wiki/search.ts)
- [timeline.ts](../../../../../../../../src/ui-adapter/vm/wiki/timeline.ts)
- [relations.ts](../../../../../../../../src/ui-adapter/vm/wiki/relations.ts)
- [home.ts](../../../../../../../../src/ui-adapter/vm/wiki/home.ts)
- [index.test.ts](../../../../../../../../src/ui-adapter/vm/wiki/index.test.ts)
- [views.test.ts](../../../../../../../../src/ui-adapter/vm/wiki/views.test.ts)

交付文件為本檔 `wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-index/REPORT.md`；上線與終局信件走 `inbox_mail.sh cx-wiki-index --up`。

## 沒做到或證據不足的

沙箱外測試計數與型別重跑依交接書交由領導執行。最後一次本機無 DOM 型別檢查的別線錯誤：`vm/route.ts:9` 找不到 URLSearchParams；`wiki/cards.test.ts:204,207` 找不到 URL、205 行 readdirSync 的 recursive 選項不在型別內；`wiki/cards.ts:156` 的 unknown 無法傳入 Object.keys。UI 型別檢查僅剩 cards.ts:156 相同錯誤。這些檔不在本線範圍，未修改；並行線可能繼續更新，以領導重跑結果為準。

依固定驗收未加跑 build、DOM、Playwright 或其他驗收；沒有實機畫面驗證主張。

## 需要決定的事

本線無阻塞決策。領導收線時需處理上述別線型別錯誤，並執行交接書指定的沙箱外驗收。下列規格缺口已採最小解並在程式標記，可由領導統一確認。

## SPEC-GAP 清單

- 無 id 檔的分類取最近父目錄；根目錄檔缺少目錄名時用 `file`。
- 頂層 id 是條目身分，不建立自我引用；body 交由 markdown 連結抽取，避免整段文字被誤作引用。
- 分類面向選項與計數取整個分類，套用篩選後仍保留其他選項。
- 年表 total 為篩選後筆數，面向計數取整份年表，時代區塊依最早出現日期排序。

## 以後交接書該點名的工具

無。
