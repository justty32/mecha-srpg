# 任務：補齊本輪目標資訊回歸並修正契約焦點

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、feature-dev、common/conventions、common/code-map（只讀ui兩列）、common/user、common/user/working、testing。均位於 wf/workflows，親自讀。資料表用 tabledb，禁止整份讀 code-map。

## 背景與唯一目標

完成11/24 UI收尾回歸切片。戰鬥三檔靜態修正已由 fix-mission-1124 完成且程序退出；本線唯一目標是讓本輪三項問題有回歸證據。參考 `wf/org/review-2026-11-24.json` 三列與前線 REPORT。使用者經 eca_main 11/24 確認 test-prune-1105 已無人執行，main 已撤 claim，可修改本線明列測試。HEAD fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2；開始時有大量既有 dirty，不能還原。

## 範圍（排除法寫死）

只可寫 `src/ui-adapter/ops/dom/tabs.ts`、`src/ui-adapter/ops/dom/render.test.ts`、`src/ui-adapter/vm/viewmodel.test.ts`、`src/ui-adapter/vm/controller.test.ts`、`src/ui-adapter/dom/render.test.ts` 與本線 REPORT/驗證log。戰鬥實作只讀；若發現有錯先報告，不自行擴張。不可修改其他檔、規則、內容、鎖、package、其他wf。不做測試刪減或效能優化。件數 gate：3項問題、5個原始碼檔；容量 gate：產物2 MB，超過即停回報。

契約焦點只在原先焦點位於契約頁時恢復相同契約列或summary，節點已消失／隱藏採合理可見fallback，不搶外部焦點。補真 focus→選取→render 測試，不能只收 action 不重繪。戰鬥新測試涵蓋 exits 有/無與 noRetreat 組合、邊界標記與目標文案、己方/可見敵機具名駕駛/未知敵機/公開怪獸。更新舊 exit deepEqual 與文案斷言，禁止只刪斷言讓測試綠。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/inbox_poll.sh fix-regression-1124 --once` | 每步查orders |
| `wf/tools/inbox_mail.sh` | 終局回報 |
| `git diff --check` | 差異驗證 |
| `sh scripts/heavy-lock.sh node --test --test-concurrency=1 --test-reporter=tap --test-name-pattern='目標|出口|契約|焦點'` | 只接本線修改的測試檔，單一相關驗證 |

## 資源與禁區

可寫程式碼線。模型codex gpt-6.1-sol/high，子代理上限0。codex啟動器豁免，但測試必經全機共用鎖。只允許上列相關測試（調整pattern包含自己新案例可），不跑全套/build/e2e/typecheck，main收件後另排。長命令用工具可追蹤背景工作並持續監看，不讓固定300秒工具時限殺測試。跑前確認沒有其他未經鎖的重負載；不巢狀套鎖。

不碰鍵鼠螢幕、不開GUI、不上網、不裝依賴、不刪檔、不rm -rf、不改config/.gitignore、不commit/push/建分支/rebase/reset、不還原既有dirty。main明列委派REPORT與log的wf寫入權；工具拒絕報BLOCKED，不繞過。

## 工作與驗收（固定4條）

1. 契約焦點測試先於修正跑紅，再修 tabs 跑綠；含選取列、summary更新、原頁外焦點不搶焦點。
2. 戰鬥回歸測試對應資料表兩問題，並修舊斷言；不得為紅綠證據還原共享程式。若無法安全做舊版紅燈，明示僅有新版本綠燈，不捏造。
3. 明列相關測試命令、exit、計數及log路徑；若測試失敗在範圍外，保留差異報BLOCKED，不擴工作。
4. git diff --check通過、僅改授權檔，REPORT區分已驗證與完整整合閘門尚未跑。

## 交付及回報

直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/fix-regression-1124/REPORT.md`，log只在同目錄。REPORT四段：做了什麼／產出／未做到／需要決定，末段工具經驗。只需短報告，不額外跑wf全套lint。16:15停新工作、16:45前交接。

線名fix-regression-1124、團隊無、上游dispatcher。終局用 `wf/tools/inbox_mail.sh fix-regression-1124 --up DONE '本輪UI回歸切片完成' /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/fix-regression-1124/REPORT.md`；阻塞改BLOCKED，超過10分鐘即報。回覆五行與REPORT路徑，不額外探索。
