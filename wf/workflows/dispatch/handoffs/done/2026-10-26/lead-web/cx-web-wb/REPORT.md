# cx-web-wb 回報

## 做了什麼

我是 cx-web-wb；本團隊：無。終局 DONE（完整套件採交接書沙箱例外，須由調度者在沙箱外補驗）。先檢視並保留中斷留下的 index.ts、kinds.ts 與 index-new.test.ts，接續完成五個項目，未改遊戲規則、數值或內容資料。

W02：補齊 11 種中文分類及排序，採交接書建議譯名，沒有另外調整。W05：無 name／title 的機型由 frame 中文名推導「○○（機型）」，引用標籤同步；列表以次要文字保留原 ID，缺引用仍有原 ID 尾段可讀。W06：英文原名 nameEn、詞源 etymology 可搜尋並提供片段，保留名稱優先、忽略大小寫，以及 hidden 欄位不可搜尋的行為。U02：列表、搜尋傳遞 visibility／occurs；年表繼承事件或列本身的傳聞狀態；三頁沿用詳情卡 wiki-badge 樣式及「傳聞／可能發生」文案，possible 事件仍不進年表。W04：補齊 cls／origin／mode／slot／scope／symmetry 面向與中文選項、列表欄值，篩選與原資料仍使用原始枚舉；未知值保留原文。

測試對應：index-new.test.ts 含 W02、W05（包括真實機型）、W06、U02 與 W04 測試；pages.test.ts 新增 U02 跨頁徽章及 W04／W05 中文欄值、次要 ID 斷言。兩檔合計 15 個測試已用停用程序隔離的 node runner 通過；另以 node --test --test-isolation=none src/ui-adapter/vm/wiki/*.test.ts src/ui-adapter/dom/wiki/*.test.ts 執行全部百科 VM／DOM 測試，68／68 通過。npm run check 為 0 errors、10 個既有 warnings；npm run typecheck 通過。建置預設因唯讀 node_modules/.vite-temp 遇到 EROFS，改跑 npm run build -- --configLoader native --outDir /tmp/cx-web-wb-build 後通過。

npm test、npm run test:dom 均已依各項目執行；預設 node --test 只提供檔案層級計數，且執行異常緩慢，已中止未完成的重複執行，沒有宣稱完整套件全綠。停用程序隔離後重跑完整套件，程序以 exit 137 結束且無診斷輸出。針對完整套件出現的失敗另直接重現：src/mcp/cli.test.ts 的服務子程序未就緒、src/mcp/e2e.test.ts 的兩個 stdio 測試皆為 server 提前退出 0，src/ops/content/worldgen.test.ts 的實際 CLI 為 spawnSync node EPERM（同檔另外兩項純函式測試通過）。這些檔案未修改，依交接書已註明的程序隔離／spawn 沙箱例外，交調度者在沙箱外重跑 npm test 與 npm run test:dom；本線可採信的百科測試結果為 68／68；另外以 node --test --test-isolation=none --test-reporter=tap 與 test:dom 相同的 src/ui-adapter/**/*.test.ts glob 執行所有 UI 測試，最終 165／165 通過（含 DOM、VM 與模組邊界）。

固定四條驗收：每項實作與測試完成；內容檢查 0 錯、型別檢查及 UI 測試通過，完整 npm test 依前述沙箱例外留外部補驗；改動全在白名單；本 REPORT 已存在。

## 改了哪些檔

共 8 檔，全部在交接書白名單內；原有 node_modules 符號連結未動，新檔 index-new.test.ts 約 8.5 KB，兩個容量 gate 均未觸發。

- src/ui-adapter/vm/wiki/types.ts
- src/ui-adapter/vm/wiki/index.ts
- src/ui-adapter/vm/wiki/kinds.ts
- src/ui-adapter/vm/wiki/list.ts
- src/ui-adapter/vm/wiki/search.ts
- src/ui-adapter/vm/wiki/index-new.test.ts
- src/ui-adapter/dom/wiki/pages.ts
- src/ui-adapter/dom/wiki/pages.test.ts

## 沒做到的

完整套件未取得可信的全綠證據，詳見前述沙箱例外與受影響檔案，需調度者在沙箱外補驗。依交接書禁區未跑 Playwright、未開瀏覽器或截圖，未做視覺驗收。未修改 wf、內容、卡片線持有的檔案，未新增依賴、commit 或刪檔。wf-lint --strict 的既有問題為 legacy/docs/part1_window_and_loop.md 與 part2_battlefield.md 各一個壞連結，以及 wf/workflows/planning/specs/core/ai.md 超過 8192 bytes；不在本線可寫範圍。

## 需要決定的事

本次功能沒有待決事項。list.ts 依交接書自帶枚舉翻譯，可能與 cx-web-wa 的詳情卡對照重複，請調度者合併時統一；本線沒有 import 對方新檔。未更新 code-map（交接書禁止修改 wf），如需登記新測試，請調度者補記 index-new.test.ts。
