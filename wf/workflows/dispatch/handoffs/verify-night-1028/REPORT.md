# 夜間固定快照整合驗證 REPORT（DONE）

唯一一次非截圖suite：1031案／1022過／9敗；cancelled=0、skipped=0。Node exit 1，耗時 515.01 秒。對照前輪本機1031／1022／9：{"相同": 9}。已釋放唯一runner；無殘留本線測試程序。此結果不代表自動接受整批內容。

主線正式GO指定commit `3a20a4367944cc3ed4ea62ee49552991b2f3d87e`，tree `9a5ab936bc2804c9ed36497b7047b1b448e5cead`，於 `/tmp/mecha-night-verify-1028` detached執行，前後commit/tree相同；未取main浮動HEAD。Node v24.14.1，nice19、CPU [0, 1]、concurrency2；開始 2026-10-28T22:32:28.795588+08:00，結束 2026-10-28T22:41:03.805827+08:00。主線確認內容線DONE及runner釋放，開跑前pgrep未找到其他runner。

[158檔來源](sources.txt)與基準逐筆完全相同，固定快照沒有新增或刪除測試來源。一次argv傳入，未分批。原命令見 [command](command.txt)，完整原始stdout/stderr見 [原始TAP壓縮檔](suite-original.tap.gz)，[可讀TAP](suite.tap)只整理行尾空白，原始SHA256記於status，退出碼、耗時、統計及資源釋放見 [status](status.json)。兩個黃金更新環境變數移除；只沿用既有node_modules連結，未下載安裝。

[逐項分類](comparison.json)保存本輪與本機基準完整診斷。比較錯誤類別／訊息與expected、actual、hash、events、day，忽略耗時、checkout前綴及堆疊；缺證據列未知。基準沿用 [verify-import](../verify-import-1028/REPORT.md)，未重跑基底或失敗case。wait及ops-relic先前已有的歷史軌跡改變限制仍保留。

明列未執行的兩案：`ui_screenshot：預設戰場回 PNG 與回合資訊`、`ui_screenshot：?spectate=1 全 AI 觀戰，steps 後仍有回合資訊`（src/mcp/ui.test.ts整檔排除），不算skipped，不能稱原始npm test全跑。

受保護範圍含所有tracked內容、引擎、schemas、specs、黃金與依賴；[diff](protected.diff)為空。[執行前](before-status.txt)與[執行後](after-status.txt)相同，只保留既有依賴連結。前輪證據未寫入；未修內容／黃金、未stage/commit/push、未GUI或截圖、未派子代理。

已讀：本session親讀AGENTS、WORKFLOWS、testing、dispatch、common/user、user/working、data-files、conventions、code-map、dev-env；本輪親讀verify-night brief及基準REPORT，以tabledb讀基準失敗資料。準備與分類方法見 [STATE](STATE.md)。

## 主線另授最後wiki窄測

此項在主樹固定HEAD `4a139221d82210dc23e7a3f129f13794a22e935a`、tree `d8f73178f2a9e7c73c3d70c8bb6ff5b2eee5ebe4`，包含R2 lore；與完整suite的commit `3a20a4367944cc3ed4ea62ee49552991b2f3d87e`／tree `9a5ab936bc2804c9ed36497b7047b1b448e5cead` 是不同快照，不合併宣稱同tree驗證。

只執行 `src/ui-adapter/vm/wiki/index-new.test.ts` 一次：6案／6過／0敗，exit 0，耗時0.111秒。nice19、CPU [0, 1]、concurrency2；2026-10-28T22:41:58.187460+08:00 開始、2026-10-28T22:41:58.301011+08:00 結束即釋放runner。原始 [TAP](wiki-suite.tap)、[命令](wiki-command.txt)、[快照與統計](wiki-status.json) 分別保存。

[前content diff](wiki-before-content.diff)與[後content diff](wiki-after-content.diff)均為空；涵蓋content/base、content/lore及content內索引，全部content檔名與位元組聚合SHA256前後相同（3156檔），HEAD/tree亦未變。沒有再跑完整suite、未修改前一隔離快照。
