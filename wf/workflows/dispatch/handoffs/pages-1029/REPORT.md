# GitHub Pages 部署證據

## 做了什麼

以既有 gh 管理權限啟用公開倉庫 justty32/mecha-srpg 的 Pages，build_type=workflow；未改 visibility、保護或付費設定。新增 main push／手動部署流程，Node 24、npm ci、CLI base=/mecha-srpg/，僅上傳 dist。官方 actions release 與 commit 以 GitHub API 核對後固定 SHA。

## 產出

[網站](https://justty32.github.io/mecha-srpg/)｜[工作流](https://github.com/justty32/mecha-srpg/actions/workflows/pages.yml)｜[使用說明](../../../../notes/github-pages-1029.md)

本機 `npm run build -- --base=/mecha-srpg/` 成功（11.33 秒）。獨佔 runner、nice 19、單 browser 依序驗戰鬥 board／round／點格 inspect、營運 snapshot／世界圖／地點詳情、百科搜尋／條目詳情；無 pageerror、console error 或 HTTP >=400。4181 preview 與 browser 已關閉。線上 smoke、部署 run 與最終 SHA 待實際驗證後補入。

## 限制

瀏覽器 localStorage 存檔不跨來源或裝置同步。建置仍有既有 node:fs／node:path 外部化與大 chunk 警告，三頁實互動未出錯。全庫 strict exit 1：兩條 legacy 外 repo broken link 與共享 mobile spec BIGLIST，本線檔案無違規；由 root 統整共享文件。

## 需要決定

目前沒有外部權限阻礙或需使用者決定事項。
