# 任務：核對匯入包在本機的整合測試差異
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/testing.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/common/data-files.md`、`wf/workflows/dispatch/handoffs/integrate-zip-1028/REPORT.md`。
## 背景與唯一目標
跨平台22件已納入main，包內1031案有10敗；需要本機固定快照的真實整合證據，避免將他平台沙箱限制視為此機限制。你是sol驗證線。
## 範圍
只寫本線 `wf/workflows/dispatch/handoffs/verify-import-1028/` 報告與log；使用 `/tmp/mecha-integrate-1028/replay` 已有隔離樹（先確認tree為b71d580579d70eddba7d9974d0809e8799e40878）。不做：任何內容/引擎/黃金/依賴修改、其他檔案寫入、主線index/commit、修bug或重錄fixture。
件數 gate：最多170個測試來源檔、最多30個產物；容量 gate：輸出最多15MB；超過先回報。
## 必用工具
| 工具 | 用途 |
|---|---|
| `git rev-parse` | 快照確認 |
| `node --test` | 非截圖整合suite，concurrency=2 |
| `python3 wf/tools/tabledb.py` | 歷史失敗資料有界查詢 |
## 資源與禁區
**唯讀調查線**：只寫自己報告與暫存log。子代理上限0。主線授予本線唯一重負載時段直到完成。nice -n 19，最多2個CPU（如taskset可用依可用CPU選前2）；並行測試=2；先核沒有其他測試/探針，不停止他人程序。不得GUI、鍵鼠螢幕、截圖、下載或依賴安裝、刪檔、git commit/push/reset/rebase，不設定UPDATE_GOLDEN/GOLDEN_UPDATE。
## 工作
1. 親讀包 `/tmp/mecha-integrate-1028/mecha-srpg-pending-integration/TESTS.md`、tests/COMMANDS.md，核固定快照與node_modules。範圍與包同：src/test的全部 *.test.ts，排除 src/mcp/ui.test.ts 中2個截圖測試；不把排除稱skip或全原始npm test。來源檔清單保存。
2. 在固定隔離樹執行一次 node --test --test-concurrency=2 --test-reporter=tap 的完整上述來源清單（避免xargs分批變成多次suite），nice19可用CPU限制。原始TAP與命令退出碼、耗時存本線。不中途重跑，總時間超35分鐘先回報狀態並由主線決定，不自行加碼。
3. 對照包內test-comparison/test-failures，分類相同已知敗、環境差異、新敗；只憑實測，未能判定標未知。不重跑基底或失敗case。確認受保護路徑無diff。
4. REPORT記snapshot、tests/pass/fail/未執行、每敗分類與證據、原命令、退出碼、時間、已讀清單。只回報，不修復。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/verify-import-1028/REPORT.md`，資料長表用wf-table/1；工具回傳進度與終局。未完成不得假稱全綠。
## 驗收（固定 3 條）
1. 固定tree確認與來源檔名清單存在。
2. 一次suite原始TAP、退出碼、耗時與統計存在，失敗有分類來源；兩截圖測試明列未執行。
3. REPORT存在、受保護路徑不變、沒有本線殘留測試程序。
