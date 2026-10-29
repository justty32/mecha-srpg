# 任務：唯讀盤點 GitHub Pages 可行性

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、common/user與user/working（雜活盤點）。

## 背景與唯一目標

使用者詢問能否走GitHub Pages。只回可行性與最小修改，不實施部署；原生collaboration啟動與回報，terra簡單唯讀盤點。

## 範圍（排除法寫死）

只讀本repo remote、visibility、.github/workflows、vite/index/runtime與hash路由、儲存方式。只寫自己的REPORT。不做：任何產品、部署設定、發布、push、網站操作。件數gate 1檔，容量gate 1MB；任一超過停下回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `git remote -v`、`rg` | 本地事實 |
| `gh repo view --json nameWithOwner,visibility` | 若現有CLI可用，唯讀辨識visibility；不可登入/安裝 |
| 原生collaboration | 終局回報 |

## 資源與禁區

唯讀調查線；不測試、不npm、不啟服務、不上網搜尋（root另查官方Pages），不碰GUI鍵鼠、不安裝、不刪檔、不commit/push、不branch/rebase/reset、不改全域設定。子代理上限0；全隊最多3工人，唯一runner歸領導。

## 工作

盤點remote/visibility、現有workflow、Vite base與絕對資產路徑、runtime是否需server、hash路由與localStorage限制；說最小所需修改、授權與障礙。拿不到visibility即據實說明，不擴環境修復。

## 交付

REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/mobile-1029-pages-check/REPORT.md`，四段：做了什麼／產出／證據不足／需要決定。摘要回領導與root。

## 驗收（固定2條）

1. 報告引用實際路徑/符號，區分靜態hosting可行性與未授權部署。
2. 未改產品或部署／未啟runner，原生工具回報DONE與報告路徑。

## 完成／阻塞回報

原生collaboration回報DONE/BLOCKED；只報證據，不發布。

## 完成證據

產品7478bd35已push；本線原生工具已終局。UI DOM231/231、正式批次28/29；最後touch三連1/3，圖外模擬pointerdown觀測限制未宣稱全綠，依主線16:48裁示帶限制交付。精確證據及主線後續見lead-mobile-1029/REPORT.md。
