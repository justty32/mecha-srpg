# investigate-e2e-1124：正式觀戰逾時靜態診斷

## 做了什麼

親讀交接書、AGENTS、investigation、user／working、testing、conventions、dev-env 與 inbox 規範；code-map 僅查 UI 描述。唯讀現有 e2e／UI log、相關程式、git diff 及 baseline.patch，逐步 inbox_poll。僅新增本 REPORT；未啟動子代理、Node/npm、瀏覽器、build、測試、wf lint，未改正式程式、設定或既有 dirty。

問題限於 `e2e/battle.spec.ts:202` 一案。結論：**確定是整案預算耗盡，無確定根因；不能判成 hash 不符，也不能斷言 settle 自己已跑滿 30 秒。**

## 產出

**30 秒涵蓋什麼。** `playwright.config.ts:8` 設整案 30,000 ms；此案沒有覆寫。測試主體依序同步載 `content/base`（`battle.spec.ts:204`）、建立正式情境並跑完整 node `runBattle`（`:208`）、檢查 node 終局、`page.goto`（`:215`）、等標題（`:216`）、`settle`（`:217`），之後才讀 audit 與逐項比對（`:218` 起）。因此內容載入、scenarioToSetup、node 模擬、導航／瀏覽器初始化與 settle 共用預算；fixture 等測試前置亦可能占用預算。同步 node 工作會阻塞 runner，不能由錯誤落點倒算各段耗時。

`ui-e2e.log:31` 顯示此案 36.5 秒，`:51` 起明載 Test timeout of 30000ms exceeded，`:64` 至 `:65` 指向 settle 的 page.evaluate。36.5 秒不是 settle 時間，也不足以推斷超時後清理耗時。測試已抵達 `:217`，故前面的 node outcome／eliminate 斷言與標題檢查已過；但 `:218` 後的 browser audit、commands、hash、數值及死亡清單斷言均未完成。webServer 的 build／preview 是另設 60 秒的啟動流程，不可把 log 中 17.3 秒 build 塞進此案 30 秒。整套 6.4 分鐘也不是個案耗時。

**settle 的實際工作。** `dom/main.ts:119` 的掛鉤把 settle 接成 `send(skip)`。send 先清 FX、先取一次 controller.snapshot 供快捷鍵查詢（`:73`），dispatch(skip) 再在完成 skip 後取 snapshot（`vm/controller.ts:220`），最後 render、schedule（`dom/main.ts:74` 至 `:77`）。`skip()` 是同步 `while (busy()) step()`（`controller.ts:86`）；spectate 無玩家回合，因此這次呼叫通常須跑到全戰局終止，並非只取消動畫。`anim=off` 只移除排程延遲，不移除模擬或快照成本；頁面初始化後原有 0 ms step 計時器也可能在 evaluate 前先推進一些回合。

skip 迴圈內沒有每步 controller.snapshot／DOM render，但每台 AI 回合仍有 session.stepAi 與 presentation.collect（`controller.ts:78`）。`vm/session.ts:64` 的 track 在指令前後呼叫 observers；viewmodel 註冊的 captureVisible 逐可見單位呼叫完整 unit（`viewmodel.ts:22,71`），會建部件／層資料及敵方 seen 副本（`:184` 至 `:208`）。presentation.collect 仍掃 batches、建 log／FX，skip 最後才清 FX（`presentation.ts:20`，`controller.ts:88`）。這些均是實際存在的額外工作，尚無分段時間證明誰主導。

另一個已定位的差異：瀏覽器使用的 sim session 每台 AI 先 `structuredClone(state)`，在副本執行 AI 指令，再於真狀態重播（`src/sim/session.ts:171` 至 `:195`）；node `runBattle` 直接在真狀態跑 runUnitTurn（`src/sim/run.ts:194` 附近）。因此 node 與瀏覽器各做一次完整戰鬥，而瀏覽器另含回放、knowledge／viewmodel／presentation 成本。此路徑未在本輪修改，不能稱為本輪新增回歸。

**本輪 mission／出口的影響。** 比對 HEAD→現況與 baseline.patch：controller 增加 mission 欄位、render 增加 mission 區塊，均已存在於開工 baseline；baseline→現況的正式增量集中在 viewmodel 的出口語義／輕量名稱、types.kind 與 board 提示。`git diff --name-only` 確認 e2e、playwright.config、dom/main、vm/session、presentation、sim／rules／ai／content 沒有 tracked 修改；這表示相對 HEAD 未改，不代表 HEAD 歷史中沒有變更。

mission 每次 snapshot 會重建文字物件（`controller.ts:353`），render 每次 stringify 比 key，只有 key 變更才重建 mission DOM（`render.ts:287`）。正式情境是兩個 params 為空的 eliminate、20 輪、禁撤，沒有名稱目標；本輪 targetName 分支因此不會觸發完整 unit 快照，實作本身也未呼叫 unit。出口新增 atRetreatExit 對每個 cell 掃 exits；正式圖 20×20、20 個明列出口，單次完整圖掃描最多約 8,000 次座標比較（另有 inspect／commands 呼叫）。這是相對 HEAD 新增的重複查詢，但 baseline 已有；目前 kind／文案不會隨回合持續變化，未見它們讓所有 cell 每步變髒或在 skip 內反覆重繪的路徑。mission 區塊增加高度可能改變 measure／resize（`render.ts:165,314`），尚無動態證據顯示重繪風暴。

**既有綠燈的界線。** `ui-dom.log:1251` 起為 208 案通過、0 失敗、1743.766 秒。觀戰 hash 案（`:854`）8.797 秒通過，但 `vm/session.test.ts:32` 至 `:44` 明確把正式情境縮成 3 輪，再以同樣 3 輪 runBattle 比 hash／指令；沒有 DOM，也未驗正式 20 輪 eliminate 終局。故此綠燈支持短局路徑一致，不能推出正式 e2e 應在剩餘預算內完成。出口／目標 DOM、runtime、姓名與契約焦點回歸均列通過（log `:212,218,362,674,884,890,896,902`），但沒有這些功能的長局效能斷言。較短的觀戰冒煙 e2e（`battle.spec.ts:176`）6.4 秒通過，未驗 seed=1 正式終局及 hash，不可替代失敗案。

靜態另見非進展風險：controller.skip 無進度護欄；若 sim 已 stalled 而 outcome 尚空，`src/sim/session.ts:208` 會回 null，UI stepAi 重試後回傳，但 busy 仍可能成立，形成空轉。這只是可定位的既有分支風險，**沒有證據證明本次進入它**；不能據此宣稱死迴圈。

## 未做到

未重跑、未修正、未調 timeout，未建立額外診斷檔或更新其他 wf。現有 log 缺內容載入、node runBattle、導航、settle 各段時間，也缺逾時時 browser 的回合／指令進度；無法定量歸因於 CPU／GC、renderer 執行、頁面排程或非進展。未做目視／實玩，也不宣稱正式觀戰 hash 通過或失敗。既有 build 通過沿用交接證據，本線不新增動態驗收。

## 需要決定

請 main 裁定是否安排**原失敗案一次、測試側分段計時**；本線不執行。保留 seed=1、20 輪、原所有斷言、30 秒 timeout、單 worker、零 retry，不重跑全套。由獲授權線僅在該案加診斷輸出後，預計在根目錄執行：

```sh
sh scripts/heavy-lock.sh ./node_modules/.bin/playwright test e2e/battle.spec.ts --grep '^正式default觀戰與node同seed命令、hash及逐單位真終局一致$' --workers=1 --retries=0 --reporter=line
```

先依共用資源規則確認沒有其他 Node/npm 工作，且不巢狀套鎖。測試側用單調時鐘記主體起點、loadContentDirs 前後、scenarioToSetup 前後、runBattle 前後、goto 前後、標題完成、settle 請求／回傳或 catch／finally；每段即時印 elapsedMs 與 durationMs，避免只在成功後印。瀏覽器 evaluate 內在呼叫原 __battle.settle 前／後印 performance.now，透過 page console 即時收取；前後用既有 peek 只取 round／busy／outcome／log.length，完整 audit 僅在成功返回後沿原流程讀取。不要為觀測再呼叫 snapshot，因為它有 dirty／capture 副作用。另記 expected.commands.length、node 終局輪數，供判讀工作量。

區分判準：令 R 為 30,000 減去 settle 請求時的測試已耗時（主體計時只給近似值，fixture 成本需併看 runner 時間）。若 R 已很小，且 node runBattle／內容載入占前段大宗，先定位為前段壓縮預算；若前段短、瀏覽器 settle-enter 已收到而 exit 缺失，則確認瀏覽器同步 settle 路徑在剩餘預算內未完成。若 enter 本身沒收到，先定位到 evaluate 送達前的 renderer 忙碌／排程，不能稱 skip 空轉。若 settle 返回且原 audit 全過，這次證明同 seed 終局一致，僅支持原逾時可能受當時負載影響，不證明已修復；若 audit 真的出現差異，才依實際斷言另案判定行為問題。單次時間不能分解 AI、視野快照與 presentation 占比，也不能證明／排除非進展，後續須由 main 依結果另裁定。

工具經驗：git diff 與 baseline.patch 應分兩層比對，避免把開工前 dirty 誤算本輪新增；rg 先定位實際 dom/main.ts，再用行號窄讀；TAP 名稱相同仍須親讀測試輪數。每步 inbox_poll，終局用指定 inbox_mail 投遞本 REPORT；容量以 UTF-8 bytes 與本線目錄總量核對，不跑額外驗證。
