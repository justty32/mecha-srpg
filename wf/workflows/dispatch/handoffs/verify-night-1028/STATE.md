DONE：唯一suite完成，runner已釋放。終局見 [REPORT](REPORT.md) 與 [status](status.json)。

# 夜間驗證準備狀態

歷史啟動紀錄：主線已正式GO，固定commit 3a20a4367944cc3ed4ea62ee49552991b2f3d87e，tree 9a5ab936bc2804c9ed36497b7047b1b448e5cead。158檔集合與基準完全相同，22:32:28（台北）於 /tmp/mecha-night-verify-1028 啟動唯一suite；本線持有runner直到測試完成。

基準為 [verify-import報告](../verify-import-1028/REPORT.md) 的1031案／1022過／9敗，基準證據僅讀取。狀態見 [status](status.json)，待用清單見 [sources](sources.txt)。收到GO後先核主線確認CM/CK/pilot釋放與實際程序，再在指定commit建立隔離樹，核對tree及測試來源集合；未核查前不稱清單已符合新快照。

分類方法：以完整測試名稱與來源檔識別測例，逐筆查基準 failures.json 與原TAP；比較錯誤類別／訊息、expected、actual、hash、events、day。只忽略絕對checkout前綴、耗時及Node內部堆疊行號。斷言與錯誤一致為「相同」；同名失敗的語意實值不同為「失敗軌跡改變」；基準通過而本輪失敗為「新增失敗」；基準失敗而本輪明確ok為「失敗消失」。缺結果、取消、同名歧義或診斷不足列「未知」，不當通過。保留原始診斷並用wf-table/1寫分類；wait與ops-relic的歷史軌跡限制繼續保留。

授權後僅一次suite，來源一次argv傳入；nice19、可用CPU前兩個、concurrency2，超12分鐘回報。移除黃金更新環境變數；排除src/mcp/ui.test.ts兩截圖，明列未執行。完成即釋放runner，保存TAP、exit、耗時、before/after tree與diff及殘留程序證據。上限170來源／30附件／15MB，不重跑基底。

本session已親讀AGENTS與基準報告；本次重讀新brief、WORKFLOWS、testing、dispatch、common/user、user/working、data-files。準備階段僅讀文件與資料、寫本線三份準備檔；未跑test、probe或typecheck。

最後另授wiki窄測已完成：4a139221快照六案全過、exit0，runner釋放；所有任務終局。詳REPORT末段及wiki-status.json。
