# cx-web-wa 交接報告

## 做了什麼

W01：物種卡與怪獸繼承區共用生態行為、捕獲條件、AI 策略。繁殖列子代連結、間隔回合、上限與子代存續；蛻變列目標、條件與期間效果；攻擊預兆呈現物種設定。捕獲條件的功能名稱改中文，能力、機體與 AI 策略保留連結。`cards-new.test.ts` 前兩項涵蓋真實閘母、掘犬資料與缺失物種容錯。

W03：部件新增屬性／資源池修正、附加層、共鳴條件及負擔；機型列對應機體與製造勢力連結、價階、造價、出口政策、前置機型與解鎖條件；天象列週期、指定日期、湧現條件、潮級改變與效果；曆法列每蝕月日數、年／開局資訊、朔望漲潮日與小潮日。保留其他原始資料區。`cards-new.test.ts` 三項 W03 測試涵蓋四種卡與未知欄位保存。

W04：卡片欄位／徽章按情境轉譯 cls／origin、mode、八種 slot、scope、symmetry、人物 human／soul，補「對稱性」欄名；構型內槽位亦適用。普通文字、稱號、本文、未知枚舉與引用識別碼保持原文。`cards-new.test.ts` 兩項 W04 測試逐一核對集合及情境邊界；既有 `cards.test.ts` 僅將 W04 本來就要改的 ancient 顯示期望改為「古代機」。未修改遊戲規則與數值。

每項完成均執行 `npm test`、`npm run check`、`npm run typecheck` 與指定 orders 輪詢。`npm run check` 三輪皆 exit 0、0 errors（既有 10 warnings）；最終 `npm run typecheck` exit 0。最終卡片測試 19／19、百科測試 53／53 通過（使用 `--test-isolation=none` 取得實際案例數）。`npm run test:dom` exit 0，27／27 檔案通過；沙箱的預設 node --test 計數為檔案數。

W01、W03、W04 三輪完整 `npm test` 均為 155 個檔案中 152 通過、3 個子行程測試檔失敗（exit 1）；失敗清單相同，詳見下段沙箱例外。驗證紀錄位於 `/tmp/cx-web-wa-w01-test.log`、`/tmp/cx-web-wa-w03-test.log`、`/tmp/cx-web-wa-w04-test.log`、`/tmp/cx-web-wa-dom.log`、`/tmp/cx-web-wa-wiki-final.log`、`/tmp/cx-web-wa-cards-final.log`。

固定四條驗收：三個項目均有實作及測試；內容／型別檢查通過，完整測試僅容許下述已知沙箱例外；5 個程式／測試改動均在只寫清單；本 REPORT 已建立。未 commit。

## 改了哪些檔

- `src/ui-adapter/vm/wiki/cards.ts`
- `src/ui-adapter/vm/wiki/card-builder.ts`
- `src/ui-adapter/vm/wiki/card-labels.ts`（新增，約 2.1 KB）
- `src/ui-adapter/vm/wiki/cards-new.test.ts`（新增，約 11.2 KB）
- `src/ui-adapter/vm/wiki/cards.test.ts`（僅 W04 對應的一個既有期望）

另寫本報告；原有未追蹤的 `node_modules` 符號連結未動。未觸及 DOM、其他線持有檔、content、wf 或依賴；件數與新檔容量皆未觸發 gate。

## 沒做到的

沙箱內無法讓完整 `npm test` 全綠，受影響檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts`。最小 Node 子行程探針與 worldgen 單檔重跑均取得 `spawnSync … EPERM`；MCP 子行程提前退出、socket 就緒檢查失敗。依交接書已知環境例外保留改動，交調度者在沙箱外重跑。證據：`/tmp/cx-web-wa-sandbox-spawn.log`、`/tmp/cx-web-wa-worldgen-sandbox.log`、`/tmp/cx-web-wa-sandbox-cli.log`、`/tmp/cx-web-wa-e2e-sandbox.log`。

## 需要決定的事

無待決事項。調度者取回五個改動檔，並在沙箱外重跑完整測試即可；本線未增訂驗收條件。
