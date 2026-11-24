# diagnose-e2e-1124：單次原案診斷 BLOCKED

## 做了什麼

親讀指定交接、AGENTS、investigation、user／working、testing、conventions、code-map、dev-env、inbox 入口及前線 REPORT；各步輪詢 orders，未開子代理。

只在 `e2e/battle.spec.ts` 的「正式default觀戰與node同seed命令、hash及逐單位真終局一致」加入診斷。Node 以 performance.now 記錄起點、內容載入、setup、runBattle、goto、標題、settle 請求／返回、audit、比較完成與 catch／finally；另記 node 終局輪數及 commands 長度。瀏覽器僅轉發本線前綴，在 evaluate／原 settle 前後記錄單調時間，透過既有 peek 只讀 round／busy／outcome；沒有額外 snapshot 或狀態修改。

seed=1、正式 20 輪、30,000 ms 個案 timeout 與全部原斷言保留。其他案例逐字不變。沒有產品修正、效能優化、自由實玩、另外的 Node/npm/build/typecheck、重試或 timeout 修改。

## 產出

僅執行以下命令一次，完整 stdout／stderr 保存在 `test.log`，退出碼保存在 `exit.log`：

```sh
sh scripts/heavy-lock.sh ./node_modules/.bin/playwright test e2e/battle.spec.ts --grep '^正式default觀戰與node同seed命令、hash及逐單位真終局一致$' --workers=1 --retries=0 --reporter=line
```

**exit 1，啟動環境阻塞。** 唯一輸出為 `Error: Timed out waiting 60000ms from config.webServer.`。這是既有 webServer 的 60 秒啟動等待上限，不是指定案例的 30 秒 timeout。未輸出 Running tests 或任何本線計時事件，因此本次未取得案例主體、node 模擬或瀏覽器 settle 的時間。

分類結果：前段耗盡個案預算、settle 進入未返回、evaluate 未進入、原比較完成，四者都沒有可用的案例執行證據；本次阻塞發生於 webServer 啟動階段。原 node 終局、commands、hash、逐單位狀態等斷言均未執行，不能報成比較通過或不符。

`static-check.log` 記錄其他案例與原 expect 行比對通過；`diff-check.log` 對應 `git diff --check` exit 0。`baseline.log`／`scope-check.log` 確認其餘 tracked 檔及既有 diff 的雜湊均一致，既有 dirty 保留。指定前景命令已完整退出並保留 exit 1，未另啟動測試或服務。容量核對見 `capacity.log`。

## 未做到

未取得任何分段耗時、node 終局輪數或命令數，也未進行原終局比較。本次不能歸因前次觀戰逾時，更不能宣稱修復。沒有額外探查 webServer 為何未就緒；未換 runner、權限或隔離模式。因工具／啟動環境阻塞依交接立即停止診斷，未跑額外驗證。未 commit、push、刪檔或回退既有 dirty。

## 需要決定

請 main／dispatcher 先判定 webServer 啟動阻塞的處置及後續是否另行授權診斷；本線唯一一次執行額度已使用，不再執行。診斷程式保留供審閱，終局以 BLOCKED 投遞。

工具經驗：只看退出碼不足以判定產品失敗，須區分 webServer 啟動等待與個案預算；即時階段標記完全缺席時，不可把啟動錯誤算成 settle 失敗。以原檔比對保留斷言、其餘 tracked 雜湊與 diff 雜湊確認範圍；容量採 UTF-8 bytes，報告先保持精簡。
