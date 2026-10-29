# GitHub Pages 遊玩入口

[線上戰鬥](https://justty32.github.io/mecha-srpg/)｜[營運](https://justty32.github.io/mecha-srpg/#/ops)｜[百科](https://justty32.github.io/mecha-srpg/#/wiki)

每次推送 main 後，[Pages 工作流](https://github.com/justty32/mecha-srpg/actions/workflows/pages.yml) 以 Node 24 與現有 lock 建置，只發布 dist。也可在 Actions 手動執行；成功後等待網站更新再重新整理。部署使用 `/mecha-srpg/` base，本機仍以 `npm run dev` 開啟根路徑。

營運存檔與操作設定保存在該瀏覽器的 localStorage。localhost 與 Pages 的存檔分開，不會自動轉移；不同裝置、瀏覽器或瀏覽器設定檔也不會同步。清除網站資料會移除該瀏覽器的存檔。

實際部署與驗證證據見 [REPORT](../workflows/dispatch/handoffs/done/2026-10-29/pages-1029/REPORT.md)。
