# fix-mission-1124：戰鬥目標靜態修正完成，待動態驗證

## 做了什麼

親讀本線交接書、AGENTS.md、feature-dev 入口、conventions、code-map、dev-env、user、working、testing 及相關正式規則。只處理 review-2026-11-24 的 exit-semantics 與 pilot-disclosure 兩項問題，在既有未提交改動上增量修改，未還原差異。

出口語義以 `src/rules/objectives.ts:22` 的 reachExit、`:25` 的 escort 與 `src/rules/flow.ts:132` 的 retreat 為依據：前兩者接受明列出口格上的 active 單位或已 retreated 單位；空 exits 不會因 active 單位抵達邊界而完成。retreat 則在空 exits 時允許圖內四邊撤離，noRetreat 優先拒絕。上述規則檔完全未修改。

`viewmodel.ts:37` 共用 exitGoal 給 reachExit／escort，靜態分支為：有出口且可撤時寫明「抵達明列出口格或使用撤離」；有出口且禁撤時仍可描述抵達，並明示禁撤；無出口且可撤時要求到邊界撤離點使用「撤離」，僅抵達不算完成；無出口且禁撤時明示尚未撤離的單位無法達成。沒有新增目標判定或規則例外。

`viewmodel.ts:112` 將出口標記區分為 explicit／boundary；禁撤且無明列出口時不產生邊界標記，禁撤但有明列出口時保留出口。`board.ts:14`、`:31` 對應顯示「出口」或「撤離點」，並在 title、data-tip 與 aria-label 說明邊界須下撤離指令。`types.ts:31` 的新增 kind 為選填，既有 retreatAllowed 保留；舊資料省略 kind 時按明列出口呈現。本線產出的標記均明帶 kind。

姓名修正只在 mission 的輕量 targetName 分支，沒有為取名稱呼叫完整 unit()，也沒有增加部件快照或 seen 寫入。以下四種情境為程式路徑推導，未動態執行：

- 己方：`viewmodel.ts:32` 直接沿用 `text.ts:7` 的 unitName；駕駛／機體名稱與己方怪獸個體名維持原行為。
- 可見敵機：通過 `viewmodel.ts:33` 後在 `:35` 僅讀 frame.name，不讀人物或座位姓名；與一般單位面板 `:222` 的敵機名稱一致。
- 不可見敵機：`viewmodel.ts:33` 回傳「指定目標」，不使用 lastSeen 解封姓名；即使列為公知 presence，機甲仍在 `:35` 僅顯示機型。
- 怪獸：可見或公知 presence 的 species 於 `viewmodel.ts:35` 沿用 unitName；`text.ts:10` 至 `:13` 優先保留個體名及稱號，無個體稱號時保留既有物種名稱。不可見且非公知 presence 者仍遮名。

## 產出

本線只編輯 `src/ui-adapter/vm/viewmodel.ts`、`src/ui-adapter/vm/types.ts`、`src/ui-adapter/dom/board.ts` 與本 REPORT。兩項問題、三個原始碼檔，產物低於 1 MB；未修改測試、規則、內容、鎖腳本或其他工作流文件，未 commit、push、開分支或啟動子代理。

已唯讀搜尋 src、test、e2e 的 CellView、exit 屬性及出口消費端：唯一產生端是 viewmodel.cell；controller.snapshot（`controller.ts:327` 至 `:346`）完整傳遞 cell 並以 JSON.stringify 建立 dirty 指紋，因此新增 kind 會觸發重繪；board 是標記的 DOM 消費端。CellInfo 僅引用其他 CellView 子欄位，不需擴張範圍；render 的 mission 區塊直接呈現文字。未發現必須修改的範圍外正式程式碼。

`git diff --check` 已通過（exit 0）。`bash wf/tools/wf-lint.sh --strict .` 亦回傳 0，broken／residue／oversize／biglist／querycmd／local 均為 0；另有四項既有導航清單警告與五項交接資料過期警告，未擴張範圍處理。REPORT 的大清單檢查為 0 區塊。三個完整原始碼合計 51,154 bytes，REPORT 約 6 KB，低於容量 gate。這些是靜態文件及空白檢查證據，不代表功能驗收。

## 沒做到或證據不足

依本線限制，完全未執行 Node/npm、型別檢查、單元測試、DOM 測試、build、e2e 或實機操作。本報告不宣稱功能已驗收。

已靜態確認 `src/ui-adapter/vm/viewmodel.test.ts:43`、`:45` 的 deepEqual 仍只期待 retreatAllowed，與現在帶 kind 的物件不一致；本線未更動這些舊 claim 測試，也未把此推導寫成實跑失敗。其餘舊目標文案斷言也須由獲授權的主線核對。四種出口配置須各交叉 reachExit／escort，並用正式 objectiveDone 證明「邊界 active 不完成、retreated 完成」，再核對標記、提示與禁撤狀態。

SPEC-GAP（既存）：`specs/core/rules-battle-flow.md` 的撤離段只寫 map.exits，正式 flow.ts 已明載無出口時四邊可撤的 SPEC-GAP；本線依正式程式碼呈現，未改 spec 或規則。DOM 版面及三字「撤離點」標記尚未目視驗證。

## 需要決定

請 main／dispatcher 裁示 test-prune-1105 舊 claim 的測試修改權並安排紅綠驗證：先以舊實作確認出口語義與敵機姓名案例會紅，再驗本修正；包含己方、可見敵機、不可見敵機、具名怪獸及公知 presence。主線再依 testing 執行 test:dom、build、test:e2e，所有 Node/npm 工作經 scripts/heavy-lock.sh 共用鎖逐件排程。本線不代跑、不擴張 claim。

以後交接書應繼續點名 `wf/tools/inbox_poll.sh fix-mission-1124 --once`（每步查 orders）、`wf/tools/inbox_mail.sh`（REPORT 作正文終局回報）、`rg`（追型別及消費端）、`git diff --check`、`wc -c`（容量），以及動態驗證線專用的 `scripts/heavy-lock.sh`；明列測試權限與本線禁止 Node/npm 的界線。REPORT 路徑：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/fix-mission-1124/REPORT.md`。
