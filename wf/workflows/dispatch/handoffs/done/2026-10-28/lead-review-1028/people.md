# 任務：審閱people增量跨批內容

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、wf/WORKFLOWS.md、common/user.md及user/working.md、dispatch/README.md、investigation.md、content/README.md、world-pillars.md與全部子檔、data-files.md、team-model.md、dev-env.md、testing.md、inbox/README.md及PROTOCOL.md（均在wf/workflows下）；親自讀不靠摘要。再讀主brief與10/27 people/content摘要、fill-rulings，舊16＋16候選避免重做。3d79f69/9364f46舊識別此clone不存在；現行對應b0a5ebef/8a577dcf，以原檔而非舊摘要裁定。

## 背景與唯一目標
增量比較新七輪與舊批，形成有操作價值的審閱文件，不為湊數提同題材。正常系列/配套/刻意變體不可誤判真重複。

## 必用工具
| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 所有wf-table讀寫，僅切片入context |
| `wf/tools/inbox_poll.sh` | 每完成一步以自己線名--once讀orders |
| `wf/tools/inbox_mail.sh` | 上線PROGRESS與終局--up，正文給REPORT檔 |
| `rg` | 機械索引與候選定位 |

舊表rows有list而非dict導致tabledb CLI slice出錯：用Python from tabledb import load，逐列以dict(zip(t.columns,row))在記憶體正規化；不改來源。新表用load後Table.add/save，無整表輸出。新表統一wf-table/1，路徑若欄名_path要相對JSON或用gitRoot格式。

## 資源與禁區
可寫程式碼線：僅可寫分派文件目錄；不得寫程式/內容。子代理上限0，不可再開agent；全機最多3工人，無重負載。不碰鍵鼠螢幕、不GUI、不下載、不安裝、不上網、不commit/push、不建分支、不rebase/reset、不刪檔不清worktree、不改codex設定；不跑遊戲測試/lint/build/check/sim。只讀content/src/spec/golden/index/batches與其他線資料。ROSTER由領導代登記，自己只准用inbox腳本投本輪信及poll狀態。

## 工作
核實入口清單實數、來源到現行檔案映射及缺漏。機械索引可全庫，參照庫不得無限遞移全文。所有候選全文讀完兩端（含字段/行號、sha256、相似與差異、建議、信心），區分確認問題/待裁決/已排除。既知P01、九槽缺口不重開新問題。沒有高價值新問題可明寫零，不硬湊。至少交1組新跨批的全文排除對照供領導抽核。每份完整讀過的content檔逐檔記coverage，機械索引與全文狀態分開；未讀區域明列限制。不宣稱全庫審完。

## 交付

唯一交付絕對目錄：`/mnt/c/code/mine/mecha-srpg/wf/notes/investigations/content-review-2026-10-28/people/`。
分區README.md（含問題/方法/發現/結論/來源）、REPORT.md（四段做了什麼/產出/不足/待決）、coverage.json（逐檔read_level與sha256、入口歸屬）、evidence.json（每組兩端檔案+字段/行號、判定/信心/建議），寫到下述唯一絕對目錄。其餘路徑不可寫（本輪mail/poll例外）。超1KB同質清單全部放wf-table，不整表入context。已修歷史不列現行問題。

## 驗收（固定2條）
1. 交付與coverage/evidence真實存在，候選兩端全文讀過、每項有可定位來源；入口/候選/容量未超gate。
2. 寫REPORT後以自己線名inbox_mail.sh --up DONE（或BLOCKED/FAILED）寄自足標題，正文用REPORT絕對路徑，最後5行摘要與REPORT路徑後停止，不自行加碼驗證。

## 完成／阻塞回報
先以自己線名--up PROGRESS寄上線摘要（可用本brief作正文），每步poll一次。終局必寄--up，不能只留last.txt；工具阻塞照實報告，10分鐘卡住需BLOCKED。需使用者裁決寫清單繼續其他工作。工人不得變更brief。

## 範圍（排除法寫死）

只做：pilots148組（review484列配套）＋bigfill人物34＋七輪人物18概念。只主責人物/人物lore；參照既有人物及新勢力/地點限必要對照；新七輪人物wl-、wn-r2-、wm-r4-為增量重心。

不做：範圍外審閱與任何內容修改。件數 gate：最多200批次入口、最多50組候選；容量 gate：產物最多0.5MB；超出先回報領導實數，不擴張。配套檔另記檔案覆蓋不重複算語義入口。

自己的線名：cx-review-people-1028；團隊review-1028，領導lead-review-1028。唯一可寫交付絕對目錄：`/mnt/c/code/mine/mecha-srpg/wf/notes/investigations/content-review-2026-10-28/people`。
