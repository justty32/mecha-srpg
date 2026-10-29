# 任務：修復營運存取與完整循環

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親自讀 WORKFLOWS、feature-dev、testing、planning、common/user 與子頁、conventions、code-map、dev-env、data-files；設計線另讀核心規格。

## 背景與唯一目標
使用者要完整可玩遊戲，營運存取為最高優先。本線只完成標題工作。

## 範圍
- 精確授權路徑及各項限制已抽至 [scope.json](playable-ops-1029/scope.json)；未列路徑須先回報隊長。
- 不做：其他產品檔、legacy、art、無關內容、wf整合檔、黃金重錄。
- 件數 gate：超過30件先報；容量 gate：超過2 MB先報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `git status --short` | 保護既有改動 |
| `node --test` | 只在隊長排程後跑指定單檔 |
| `python3 wf/tools/tabledb.py` | 查資料清單 |

## 資源與禁區
**可寫程式碼線**：只寫範圍路徑。子代理上限0。不commit/push、不建分支、不rebase/reset、不刪檔、不rm -rf、不改.gitignore或外部設定、不安裝下載、不開GUI、不碰鍵鼠螢幕。保護三個原有未追蹤review log。全樹工人最多3。所有npm測試/單檔/DOM/e2e由隊長排程同時只一個；不可自行開跑，允許唯讀調查。nice -n 19，低concurrency。外部查詢只能web工具，本線不需外網。

## 工作
1. 立即重現營運一直不能存取，檢查直接網址及頁內導航。修復具體根因，確保錯誤可讀與可恢復。完整新戰役→出戰→結算回營運。若需額外精確檔案先回報隊長鎖檔。先調查後回報測試排程申請；不可自行跑測試。
2. 延伸接線：依最新battlefield spec與engine凍結BattleResult.collectedSalvage，將玩家回收入stock:scrap/flesh，沿既有容量stash與交易去重；已回收怪獸sourceUnit不得再次發整屍選擇，非玩家回收不得入我方庫。補容量/重複結算/非玩家/怪獸不重選回歸。
3. 安全memo OpsSnapshot，dispatch入口失效，公開snapshot仍clone，key共用內部快照，fromSave清空；補污染/失效/存讀回歸，以減少完整循環重複昂貴重算。
4. 定期工具回報隊長發現與需要的擴檔；完成寫報告。

## 交付
REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-ops-1029/REPORT.md`，四段做了什麼／產出／沒做到或證據不足／需要決定，附以後工具。

## 驗收（固定2條）
1. 標題工作落地且有具體檔案與根因或設計取捨證據。
2. REPORT存在，測試結果或待排程指令明列，不虛報通過。

## 失敗怎麼處置
本線regression修好；拿不到證據回報BLOCKED保留現狀。原生工具回報終局，不能只口述不寫檔。

本輪營運圖契約：普通格無常駐地形／年齡文字，一區一個名稱；全圖最大四連通片內固定anchor，不因viewport／zoom／pan改選，未知anchor不公開。DOM依世界座標呈現，詳情與aria標籤保留。

## 完成證據（2026-10-29）

1. 標題工作落地且有具體檔案與根因或設計取捨證據。 → [本線REPORT](playable-ops-1029/REPORT.md)、[整合驗證](lead-playable-1029/verification.json)。
2. REPORT存在，測試結果或待排程指令明列，不虛報通過。 → [本線REPORT](playable-ops-1029/REPORT.md)、[整合驗證](lead-playable-1029/verification.json)。

源碼及驗證提交 `a3407d9711f991472cac6a9dc03dacd2e827edf2` 已push並核對origin/main。原生agent已FINAL_ANSWER，無外部inbox終局檔；本線服務／runner已停止。
