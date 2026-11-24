# fix-regression-1124

## 做了什麼

完成 exit-semantics、pilot-disclosure、contract-focus 三項回歸切片。保留開工既有 dirty，未 commit；戰鬥實作、規則、內容、鎖與設定均未修改，沒有子代理。

契約頁重繪前只保存原本位於可見契約頁內的焦點。重繪後按契約 id 恢復同列、保留 summary 或原詳情按鈕；歷史收合、列消失時改用可見 summary／選取列／其他列／空板標題，不搶頁外焦點。測試含真 focus → Enter／空白 → OpsController.dispatch → render；歷史狀態由測試快照固定，選取與詳情仍由真 controller 產生。另驗 summary 更新、歷史列隱藏、列消失、空板與頁外焦點。

戰鬥測試交叉 reachExit／escort、exits 有／無、noRetreat true／false；經 session.preview(end) 的正式輪末 evaluateObjectives → objectiveDone 驗 active 邊界與 retreated，未跨 UI 邊界直接 import rules。正式 controller 快照再驗 DOM 出口／撤離點標記、title、data-tip、aria 與目標文字；保留舊快照缺 kind 的相容檢查。更新舊 exit deepEqual 與撤離文案斷言，未刪斷言。

姓名案例明確建立具名敵方駕駛，驗己方姓名保留、可見／公知敵機僅顯機型、未知敵機即使有 lastSeen 仍遮名；可見／公知怪獸保留個體名與稱號。mission 名稱測試禁止呼叫完整 vm.unit，並驗讀取不改寫 knowledge。

## 產出

僅增量修改授權五檔：`src/ui-adapter/ops/dom/tabs.ts`、`src/ui-adapter/ops/dom/render.test.ts`、`src/ui-adapter/vm/viewmodel.test.ts`、`src/ui-adapter/vm/controller.test.ts`、`src/ui-adapter/dom/render.test.ts`。另寫本目錄 REPORT／驗證 log。`baseline.log` 與 `scope-check.log` 核對開工雜湊；容量詳見 `capacity.log`，低於 2 MB。

以下命令均在專案根執行，測試全經共用 heavy-lock，未巢狀套鎖；跑前程序檢查無其他測試負載。

契約修正前：

```sh
sh scripts/heavy-lock.sh node --test --test-concurrency=1 --test-reporter=tap --test-name-pattern='契約焦點' --test-isolation=none src/ui-adapter/ops/dom/render.test.ts
```

exit 1，2 案、0 通過、2 失敗，明確失敗於「重繪後焦點應在同一契約列」及「日期更新仍停在 summary」。log：`focus-diagnostic-red.log`。此前標準模式兩次僅回報檔案級失敗（各 exit 1、1 失敗），見 `focus-red.log`、`focus-summary-red.log`，故補單程序診斷取得個案證據；最初另有一次手動中止 exit 130，不作紅燈證據。

修正後單一相關驗證：

```sh
sh scripts/heavy-lock.sh node --test --test-concurrency=1 --test-reporter=tap --test-name-pattern='目標|出口|契約|焦點' src/ui-adapter/ops/dom/render.test.ts src/ui-adapter/vm/viewmodel.test.ts src/ui-adapter/vm/controller.test.ts src/ui-adapter/dom/render.test.ts
```

exit 0，TAP 計數為 **4 個檔案層級子測試通過、0 失敗**，耗時 207.10 秒；此 runner 未展開檔內個案計數，不將 4 誤稱為個案總數。log：`related-green.log`。契約紅燈案例均包含於已通過的營運 DOM 檔。`git diff --check` exit 0，見 `diff-check.log`。

## 未做到

戰鬥只驗新版綠燈，未還原共享實作取得舊版紅燈，不宣稱有該證據。沒有跑全套、test:dom 全套、build、e2e、typecheck 或 wf 全套 lint；完整整合閘門仍待 main 排程。沒有 GUI／實機驗證，原生 Tab 後續行為與目視版面未驗。

## 需要決定

本切片無待決策；請 main 收件後依既定排程處理完整整合驗收。

工具經驗：標準 runner 此次只呈現檔案層級結果，紅燈需以同檔、同鎖的單程序診斷取得失敗斷言；DOM 節點比較用布林身分判斷，避免輸出整個物件圖。查表應直接用精確 find；初次 grep 跨欄位誤帶 sim／ops 兩列，後已收斂至 ui 兩列。每步持續 inbox_poll，終局以 inbox_mail 回報，不另改其他 wf 文件。
