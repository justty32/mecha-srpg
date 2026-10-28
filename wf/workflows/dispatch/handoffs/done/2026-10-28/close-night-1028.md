# 任務：本輪夜間內容的行政收尾
先讀：`AGENTS.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/common/data-files.md`；簡單文件雜活，模型terra，按主線給的終局證據，不另查遊戲設計。
## 背景與唯一目標
23:00前將本輪已停止的派線與待驗內容清楚分開，保留所有草稿與原始證據。主線另給確定的終局與commit，不依檔名猜完成。
## 範圍
只寫 `wf/notes/close-night-2026-10-28.md`、`wf/workflows/dispatch/handoffs/close-night-1028/`、`wf/workflows/dispatch/handoffs/done/README.md`，並將主線逐一確認已終局的本輪10份頂層brief移至 `wf/workflows/dispatch/handoffs/done/2026-10-28/`：integrate-zip-1028、verify-import-1028、fill-plan-1028-next、fill-lead-1028-night、night-combat-plan-1028、night-frontier-plan-1028、night-pilots-plan-1028、night-combat-lead-1028、night-pilots-lead-1028、verify-night-1028（均.md）。未終局者先不移。
不做：SESSION/CLAIMS/WAIT_USER、content/index或任何內容、舊四暫停線／七輪世界觀／原expansion線、現有inbox、任何引擎或黃金修改。
件數 gate：最多10brief搬移、3新增報告/清單、1歷史索引更新；容量 gate：新增文字合計32KB，不複製大證據。
## 必用工具
| 工具 | 用途 |
|---|---|
| `git log` | 核指定commit及範圍，唯讀 |
| `python3 wf/tools/tabledb.py` | manifest與同質長表有界讀寫 |
| `rg` | 核名稱與導航連結 |
## 資源與禁區
**可寫程式碼線**（本線僅文件雜活，不寫遊戲程式），子代理0；不測試/npm/probe、GUI、下載、刪檔、清worktree、git stage/index/commit/push。搬移僅filesystem rename，保留原文並附完成證據。主線處理git與SESSION/CLAIMS連結。
本輪所有manifest仍draft/integration pending，CM未接受；主線明確裁示附件/reportDir維持原位置，以保留可重現證據與manifest連結。只搬終局brief，不能把「agent停止」寫成「內容整合全過」。不改readlist歷史路徑/雜湊與原始log。
## 工作
1. 先核主線提供的已終局名單、commit與驗證結果，等待中的只標等待，不替未回傳agent宣告完成。
2. 寫收尾入口：跨平台22件、新入庫夜間各批數量與路徑、CM隔離六檔可攜位置、CK matchesReference／soft警告、pilot自然traits限制、整合suite真實結果／兩截圖未執行；未取得結果留明確待主線補，不猜。
3. 已終局brief搬至done並加證據段（report連結、commit、原生工具終局由主線提供），done README追加本輪導航。其他報告附件不搬、不刪。列出需要主線更新的活連結，勿改歷史快照。
4. 回報精確變更清單和未完成項；工作完成即終局，不等自己收線。不跑全庫驗證，主線最後統一wf strict與diff check。
## 交付
`/home/lorkhan/repo/game_dev/mecha-srpg/wf/notes/close-night-2026-10-28.md` 與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/close-night-1028/REPORT.md`，原生工具回傳。
## 驗收（固定 3 條）
1. 已終局brief保留原文並有完成證據，未終局者未搬；來源附件與manifest路徑保持。
2. 入庫／隔離／整合待驗區分清楚，數量及測試實值有來源，沒有假報全綠。
3. 變更白名單與需主線補的連結清單齊，無git寫入或其他測試程序。

## 完成證據（主線收線）

terra Nash已終局並由主線close；十份任務brief歸檔、24概念導航及真實suite/wiki結果已核。附件原位保留，未代替整合驗收。見[行政報告](../../close-night-1028/REPORT.md)與[收尾入口](../../../../../notes/close-night-2026-10-28.md)。原始brief SHA256：`995f6420631c407d225852c398b59a7f0c77b8b269618ca2ffe0a2bc58c6c85d`。本契約由主線另行歸檔，不併入terra十份搬移計數。
