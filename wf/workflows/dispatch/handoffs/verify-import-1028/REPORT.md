# 本機整合驗證 REPORT（DONE）

一次非截圖 suite：1031 案、1022 通過、9 失敗；cancelled=0、skipped=0。Node exit 1，實際耗時 510.009 秒。未全綠，不修復、不重錄黃金、不重跑基底或失敗案例。

快照 HEAD `e65486ac4fc350c23c8dbd390644e40a6ad884f1`，tree `b71d580579d70eddba7d9974d0809e8799e40878`，執行前後一致。使用 `/tmp/mecha-integrate-1028/replay`，不在 main 測試；node_modules 為既有主樹依賴唯讀連結，未安裝。Node v24.14.1；nice 19、CPU [0, 1]、concurrency=2。開跑前沒有其他實際測試／探針程序（pgrep 命中自身查詢 shell，已辨識）。

158 個來源檔名見 [sources](sources.txt)，由 src/test 下全部 *.test.ts 排除 src/mcp/ui.test.ts 產生，以單次 argv 傳入 node，未使用 xargs。原命令全文見 [command](command.txt)，原始合併 stdout/stderr 見 [TAP](suite.tap)，退出碼、起訖、耗時、統計見 [status](status.json)。兩個 UPDATE 環境變數均移除。

逐敗診斷與包內來源對照見 [失敗分類](failures.json)（9 列），本機與他平台差異見 [差異](differences.json)（1 列）。歷史基底比較來自包內資料，並非本線重測。wait 與 ops-relic 即使重現包內失敗，仍保留原基底→擴充內容的軌跡改變限制；不可稱未受影響的舊敗。無足夠證據的差異標未知。

明列未執行：`ui_screenshot：預設戰場回 PNG 與回合資訊`、`ui_screenshot：?spectate=1 全 AI 觀戰，steps 後仍有回合資訊`，共兩案，不計 skipped；不能稱原始 npm test 全跑。未做 GUI、截圖、e2e 或人工視覺驗收。

隔離樹所有 tracked 路徑對 HEAD 的 [diff](protected.diff) 為空，涵蓋引擎、schemas、specs、黃金、內容、依賴；[前狀態](before-status.txt) 與 [後狀態](after-status.txt) 相同，僅既有 node_modules 連結。主樹只寫本線報告目錄，不以持續變動的 main 為測試基準。已讀清單見 [read-list](read-list.json)。未寄信、未 commit/push，無子代理。

九敗均與包內擴充整合的斷言實值／錯誤一致，零新敗。wait 本機仍為 90（期待132；歷史基底118）；ops-relic 本機仍為 b3d1e67583ca10c5／19939 events／day896（歷史基底 ad03741d873661ba／20889 events）。socket CLI 是唯一改善：包內 EPERM，本機通過。這只證明本機此快照的測試差異，不能取消兩條既有內容軌跡限制。

終局 `/proc` 核對：隔離樹無殘留 Node 測試程序。產物共 13 件、約 267101 bytes，符合30件／15MB gate；來源158檔符合170檔 gate。三條指定驗收證據均已保存。
