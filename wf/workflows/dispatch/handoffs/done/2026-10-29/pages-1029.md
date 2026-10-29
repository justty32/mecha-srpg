# 任務：部署可直接遊玩的 GitHub Pages

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，feature-dev、dispatch、testing、common/user、conventions、dev-env；實質子agent先讀wf。

## 背景與唯一目標

使用者問能否GitHub Pages，root確認公開倉庫justty32/mecha-srpg、靜態前端可行；使用者隨後授權「好，去吧，17:10下班前弄好push」。本線完成最小Pages建置與公開部署，台北2026-10-29 17:10硬截止，16:45前備妥流程並留時間確認最終main部署。現有手機與AI線仍進行，不能只部署舊版後忽略最新push。

## 範圍（排除法寫死）

可寫 `.github/workflows/pages.yml`、`wf/notes/github-pages-1029.md`、本brief、`pages-1029/REPORT.md`及本輪證據。必要時可改`vite.config.ts`的部署base參數（保留optimizeDeps.entries），但優先workflow內 `npm run build -- --base=/mecha-srpg/`，不影響本機根路徑。任何runtime絕對路徑障礙先回root明列擴範圍。

件數 gate：產品最多2檔；容量 gate：產品最多100 KB，任一超過先回root。文件附件6檔／1 MB。可設定此repo的Pages build_type=workflow及所需github-pages environment，沿既有權限／分支保護。

不做：改倉庫visibility、放寬既有保護、新建帳號／付費方案、處理其他repo、動網域／DNS、上傳dist以外工作區。其他源碼/content/art/legacy/套件lock不寫；原三logs不動。

## 必用工具

| 工具 | 用途 |
|---|---|
| `gh` CLI/API | 已有驗證身分的repo/Pages/Actions查驗與授權部署，不輸出token |
| 原生collaboration | 向root及mobile_lead協調runner／git |
| `node --test`、現有Playwright | 必要靜態站點smoke；只在取得唯一時段後 |
| `git log --oneline`、`git status --short` | 明確路徑提交推送 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件基線核對，不重跑無關套件 |

## 資源與禁區

可寫程式碼線，sol領導兼小實作，簡單盤點可terra；子代理上限1。當全隊3名工人在修改檔案時先唯讀準備，和mobile_lead協調。全隊唯一測試／重runner由 `/root/mobile_lead` 管理；未拿時段不跑local build、browser或npm測試。GitHub workflow僅npm ci/build部署，不另跑全套測試，Actions Pages concurrency只一個部署。

可commit main明列路徑並push、可在上述公開repo啟用並部署Pages（本輪授權），不git add -A/目錄add、不branch/reset/rebase/delete、不改全域設定、不碰GUI或使用者服務、不本機裝依賴。權限不足要提供實際API錯誤，不索取token。若需使用者操作，先把workflow與建置驗證完成再回具體一步。

## 工作

官方已查：`https://vite.dev/guide/static-deploy#github-pages`，project site base需`/mecha-srpg/`；`https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages`，Actions建置dist、artifact上傳、pages/id-token最小部署權限。可用gh API查官方actions releases/commit驗版本，勿依記憶亂升依賴。以Node24和現有lock建置，不將node後端或CLI作網站。

盤點報告在mobile-1029-pages-check/REPORT.md；hash路由、內容glob打包已確認，localStorage不跨localhost與Pages／裝置。設定main push及手動觸發流程，保留單分支main。先以子路徑建置檢查資產與三頁直達；取得授權的repo設定完成後push並等實際Actions結果。確認線上根頁、營運及百科載入與靜態資產無404；最後核最新main的部署SHA（手機/AI可能接著push），不把HTTP200外殼當完整可玩。

## 交付

REPORT寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/pages-1029/REPORT.md`，含做了什麼／產出／限制／需決定，提供真實URL、Actions run連結與部署SHA。簡短使用說明寫 `/mnt/c/code/mine/mecha-srpg/wf/notes/github-pages-1029.md`，說明瀏覽器存檔隔離。

## 驗收（固定 4 條）

1. workflow正確建置並只上傳dist，子路徑資產與hash路由載入正常，本地dev入口不退化。
2. 實際GitHub Pages部署成功，提供網址與run結果；權限阻塞則保留已完成可審閱設定與精確所需使用者步驟。
3. 線上首頁／營運／百科smoke符合現有功能，不宣稱跨裝置存檔同步；所有本線測試與mobile_lead串行。
4. 17:10前明列提交/push並確認最新main部署版本、工作樹本線無遺留；原logs與其他線保留，無新文件硬違規。

## 完成／阻塞回報

原生工具回root，先確認可行權限與計畫。與mobile_lead、roles線協調唯一runner及git。必要結果齊即可收線，不額外潤飾大量文件。

## 完成證據（2026-10-29）

四條驗收已完成：workflow只建置／上傳dist，base子路徑本機與線上三頁實互動成功；實際Pages部署與手機產品7478bd35的run40845496826成功；快捷釘選與桌面拖曳視野也通過公開網站短smoke。部署實作提交529c8d0f，驗證／限制與完整SHA見 [REPORT](pages-1029/REPORT.md)。原生日誌回傳root，沒有外部inbox信件；本線未開子工。
