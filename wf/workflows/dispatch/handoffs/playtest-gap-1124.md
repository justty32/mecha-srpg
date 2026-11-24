# 任務：下班前補驗三項瀏覽器缺口

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/testing.md`、`wf/workflows/feature-dev/README.md`、前線 `wf/workflows/dispatch/handoffs/playtest-1124/REPORT.md`。親讀適用規矩。

## 背景與唯一目標

使用者15:29同意補驗後整理十分鐘實機試玩單。僅補三個既有缺口，不新增產品功能。既有UI208案/build/e2e19案成功證據在 `wf/org/evidence-2026-11-24/playtest-gate.json`，確認所列exit=0；不重跑全套。HEAD fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2，dirty皆保留，不回退。

## 範圍

唯讀正式程式、既有測試與前線腳本；唯一可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playtest-gap-1124/`，限REPORT/腳本/log/exit/pid等證據。件數 gate：固定3條驗收，含REPORT最多6檔；容量 gate：共2 MB，REPORT小於8 KB。只摘必要VM欄位，不dump全VM。不改正式程式/測試/config，不做平衡、效能、長戰役或具名敵機第四項。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/workflows/dispatch/handoffs/playtest-gap-1124.md` | 唯一brief；每步mailbox_read，終局mailbox_send回main原REQUEST |
| `sh scripts/heavy-lock.sh` | 每個Node/headless完整階段只套一層共用鎖 |
| `git diff --check` | 收線格式檢查 |

## 資源與禁區

唯讀調查線（僅本線證據目錄可寫），FSM astra/high、子代理上限0；你是唯一headless實玩者。Node/npm/browser序列共用鎖、concurrency1，不巢狀；先查埠，HTTP200 smoke後再進遊戲。復用前線修好的server做法與現有dist、本機工具，不build/全套test/下載。自身腳本錯誤查證清理後可原地修正，保留失敗證據；真正工具拒絕即BLOCKED不換runner繞過。長工作有pid/log/exit並監看終局，只清自己服務，不停使用者服務。

不GUI/截圖/實體鍵鼠，不commit/push/刪檔/回退dirty。只能headless合成輸入，不冒稱實機。自然場景優先；可用明示合成fixture經真實控制器/renderer驗證，不直接改DOM假造結果；如果需build/改正式檔才能注入就列未覆蓋，不擴張。

## 工作與驗收（固定3條）

1. 歷史契約summary及歷史列焦點，在真實重繪後核對activeElement與選取語義，Tab能續行；需證明重繪確實發生，不只原生details開關。自然歷史不易取得時明示合成fixture。
2. 390x844展開戰鬥任務區後，逐項驗目標/撤退/時限資訊可捲達，量測矩形及水平溢出；不以textContent存在當可讀。
3. 無明列出口場景的fallback邊界標記與提示，驗「撤離點」而非「出口」、需執行撤離的說明；自然無此場景可使用明示合成fixture，記明限制，不擅造新產品規則。

15:30起最多40分鐘，16:10開始收尾，16:15以前結束動態工作並清理；遇缺陷只留重現證據不修產品。三項可成功/失敗/未覆蓋，誠實即可，不為綠反覆重跑。

## 交付及回報

寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playtest-gap-1124/REPORT.md`：做了什麼／產出／未做到／需要決定及工具經驗，附精確命令/exit/清理。自然與合成分開，附可供main轉成真人十分鐘試玩路線的入口與操作提示。終局mailbox_send回本REQUEST reply_to並in_reply_to，DONE/FAILED/BLOCKED/NEEDS-USER。完成即停，不等追加工作。
