# 手機介面與地圖拖曳交付

## 做了什麼

戰場／世界地圖支援手指與滑鼠拖曳，8px閾值分辨輕點；拖曳不派遊戲命令，保留縮放、鍵盤、迷霧與投影。新增分scope最近6項／最愛8項、獨立釘選與滿額提示，只存穩定id，執行時重解當前可用操作；end沿原確認。手機、橫向及百科正常文流，44px控制，修正橫向快捷互蓋與桌面重要數字截斷。不改玩法／數值。

## 產出

21個UI／e2e產品檔；設計見[手機契約](../../../../../planning/specs/mobile-ui-1029.md)。來源雜湊及精確命令見[驗證資料](verification.json)。七張headless圖已由astra複審，無可見P1/P2。

UI DOM 231/231、core/UI typecheck、build通過；最新快照含已push AI產品26ab375e／docs a40e28da。正式29案批次28過、唯一touch案圖外scroll測試未過；最終完整Chrome三連1過2敗（exit1），失敗均在圖外emulated touch pointerdown觀測，三次move啟用、真拖、cancel、邊界反向、zoom後唯一trusted click與真格座標皆過。不稱單次29全綠或三連全綠。

低階極短CDP連拖在無app空HTML也可缺click；使用有時間/速度的browser手勢後恢復原生click，不把速度或防fling其中一項單獨宣稱根因。原生page pan需官方mouse→touch emulation；bare頁400→693已證，正式長鏈仍有上述可驗性限制。產品試改全部撤回，沒有tap fallback或全應用activation重寫。

## 證據不足

圖外page pan最後三連未穩定，未刪硬斷言求綠；真實手機手感待實機。最後觸控驗證使用完整Chromium1248 headless，路徑 `/home/guanyu/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`，不宣稱headless_shell完成此三連。文件lint基準有兩條legacy外部壞鏈，最終行政收線由主線接續。

## 需要決定

主線16:48裁示先推已驗手機產品並明列限制；不再開新診斷。原三份review logs與使用者dev服務保留，自有4178 preview收線關閉。本線已最小歸檔；SESSION／CLAIMS由root統一收尾，Pages另線負責最終線上smoke。

產品提交：`7478bd35393d76318fbc22f6162e57e51bd8fa7a`；Pages最終線上smoke三頁及快捷／desktop drag皆通過（Pages線回報）。
