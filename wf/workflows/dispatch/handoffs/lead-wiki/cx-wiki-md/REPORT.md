# cx-wiki-md 執行報告

## 做了什麼
已實作百科最小 markdown → MdBlock[]：標題、合併段落與明確換行、粗斜體及巢狀、行內碼、跳脫、有序／無序巢狀清單、一般與 wiki 連結、表格、引用、圍欄程式碼與分隔線。原始 HTML 留在 text；外部連結只接受 http(s)，禁止 scheme 降級為文字。保留 extractLinkTargets 與 plainText 的既有實作及簽名。

2026-10-24 執行 `node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/markdown.test.ts'`：exit 0，tests 10／pass 10／fail 0；檔案中恰好 10 個頂層 test()。沒有增加驗收項目。

每個程式檔完成後均執行 UI 型別檢查，並依步驟輪詢 inbox。最終兩個 tsc 指令均完整執行，本線兩檔零診斷；其他線診斷詳見下段。

## 產出（檔清單）
修改既有骨架 `src/ui-adapter/vm/wiki/markdown.ts`（11,254 bytes，未達 20 KB gate）；新增 `src/ui-adapter/vm/wiki/markdown.test.ts` 與 `wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-md/REPORT.md`，新檔恰好兩個。所有路徑均相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

git status --short 顯示這三個路徑均為 ??：markdown.ts 原骨架在開工時已屬未追蹤目錄，並非本線新建。本線寫入僅上述三檔及授權的 inbox 通訊；其他工作樹改動未碰。未 add、commit、push。

## 沒做到或證據不足的
沙箱外測試計數與最終型別重跑依交接書留給領導，本線沒有宣稱完成沙箱外驗證。

最終 `npx tsc --noEmit` 回傳 1：route.ts:9 的 URLSearchParams 未定義；wiki/cards.ts:156 對 unknown 呼叫 Object.keys 的 TS2769；wiki/index.test.ts:116、119、122 的 URL 未定義。全部位於 src/ui-adapter/vm/ 下，均非本線檔案。

最終 `npx tsc --noEmit -p tsconfig.ui.json` 回傳 1，只有同一筆 wiki/cards.ts:156 的 TS2769。依交接書將別線錯誤記錄於此，不越界修正，也不視為本線阻塞。

## 需要決定的事
無需阻塞本線的決策。領導整合時請處理上述別線型別錯誤，並按既定流程同步 code map；本線依範圍限制未修改導航文件。

## SPEC-GAP 清單
程式對以下三項均有 SPEC-GAP 註解，採最小解：

- 巢狀上限未定：達 64 層退為文字，避免呼叫堆疊溢位。
- pack:kind/name 與 scheme 規則相交：依凍結型別明列的 pack 引用形狀交給 resolver；javascript／data／vbscript 仍禁止，其他非 pack 形狀 scheme 亦降級。
- 表格不齊欄位：以表頭欄數為準，短列補空 cell、長列截斷、缺少的對齊值補 null。

## 以後交接書該點名的工具
無。
