# GitHub Pages 部署證據

## 做了什麼

以既有 gh 管理權限啟用公開倉庫 justty32/mecha-srpg 的 Pages，build_type=workflow；未改 visibility、保護或付費設定。新增 main push／手動部署流程，Node 24、npm ci、CLI base=/mecha-srpg/，僅上傳 dist。官方 actions release 與 commit 以 GitHub API 核對後固定 SHA。

## 產出

[網站](https://justty32.github.io/mecha-srpg/)｜[工作流](https://github.com/justty32/mecha-srpg/actions/workflows/pages.yml)｜[使用說明](../../../../../../notes/github-pages-1029.md)

本機 `npm run build -- --base=/mecha-srpg/` 成功（11.33 秒）。獨佔 runner、nice 19、單 browser 依序驗戰鬥 board／round／點格 inspect、營運 snapshot／世界圖／地點詳情、百科搜尋／條目詳情；無 pageerror、console error 或 HTTP >=400。4181 preview 與 browser 已關閉。公開網站同一組三頁實互動 smoke 全過，無 pageerror、console error 或 HTTP >=400。首次外網 Chromium 暫時出現 ERR_NETWORK_CHANGED，curl 同資產 200，第二次 browser 正常；未修改產品。首部署 [run 40835768900](https://github.com/justty32/mecha-srpg/actions/runs/40835768900) build／deploy 成功，SHA `529c8d0fd755cb50c2089f5409db7d2aaac9f926`，deployment `7406559686` status=success（台北15:30:15）。最終手機產品 SHA `7478bd35393d76318fbc22f6162e57e51bd8fa7a` 的 [run 40845496826](https://github.com/justty32/mecha-srpg/actions/runs/40845496826) build／deploy 成功。公開網站最終短 smoke 全過：三頁互動、快捷操作的釘選／最近使用／我的最愛，以及桌面滑鼠拖曳確實改變地圖視野；無 pageerror、console error 或 HTTP >=400。最終 root metadata push 後僅需核對最新部署 SHA，不重跑 browser。

## 限制

瀏覽器 localStorage 存檔不跨來源或裝置同步。建置仍有既有 node:fs／node:path 外部化與大 chunk 警告，三頁實互動未出錯。全庫 strict exit 1：兩條 legacy 外 repo broken link 與共享 mobile spec BIGLIST，本線檔案無違規；由 root 統整共享文件。

## 需要決定

目前沒有外部權限阻礙或需使用者決定事項。
