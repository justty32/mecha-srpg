# 任務：以一次原案分段計時診斷觀戰逾時

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/testing.md`；親讀規矩。再讀 `wf/workflows/dispatch/handoffs/investigate-e2e-1124/REPORT.md`。

## 唯一目標與範圍

main裁定執行靜態報告建議的單次分段診斷。只改 `e2e/battle.spec.ts` 中正式default觀戰案的診斷輸出，不動其他案例；可寫本線REPORT/log。保留既有dirty，該e2e檔目前無dirty。不做：產品修正、效能優化、放寬timeout、改seed／輪數／斷言、全套測試、實玩、重試。件數 gate：1檔、1次測試執行；容量 gate：REPORT 6000 bytes，全部附件2 MB，超過停報。main明列委派本線wf寫入。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/inbox_poll.sh diagnose-e2e-1124 --once` | 每步讀orders |
| `wf/tools/inbox_mail.sh` | 終局回報 |
| `git diff --check` | 差異驗證 |
| `sh scripts/heavy-lock.sh ./node_modules/.bin/playwright test e2e/battle.spec.ts --grep '^正式default觀戰與node同seed命令、hash及逐單位真終局一致$' --workers=1 --retries=0 --reporter=line` | 只跑一次原失敗案 |

## 資源與禁區

可寫程式碼線。codex gpt-6.1-sol/high，子代理上限0。本線是固定e2e診斷，不是自由實玩。只准上列測試，原30秒保持；webServer自動build/preview是此指令既有部分。不另外Node/npm/build/typecheck、不巢狀套鎖。全機共用鎖；不開GUI、不碰實體鍵鼠螢幕、不截圖、不下載、不裝依賴、不刪檔、不commit/push/reset/rebase、不改config/.gitignore、不停止使用者服務。工具／沙箱錯誤立即BLOCKED，不換runner、權限、隔離模式繞過。長測試保留退出碼並前景監看。最多30分鐘，16:15不開新工作、16:45收線。

## 工作與驗收（固定3條）

1. 原案加單調時間輸出：起點、loadContentDirs、scenarioToSetup、runBattle、goto、標題、settle請求／返回或catch/finally；即時印elapsedMs與分段耗時，node終局輪數與commands長度。瀏覽器console只轉發本線前綴，evaluate內原settle前後印performance.now；既有peek只讀round/busy/outcome，不額外snapshot、不插state修改。
2. 經鎖只跑原案一次，保留完整log/exit；即使失敗也不再重跑。不因診斷失敗回退其他dirty或刪斷言。成功也保留計時供main審，不宣稱已修復原問題。
3. REPORT <=6000 bytes，明確區分前段耗盡預算／settle進入但未返回／evaluate未進入／原比較完成，引用時間與原斷言結果；仍不能歸因就明示。結束確認本線程序退出且僅授權檔變更。

## 交付及回報

`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/diagnose-e2e-1124/REPORT.md`，log同目錄。REPORT四段做了什麼／產出／未做到／需要決定，末段工具經驗。
線名diagnose-e2e-1124、團隊無、上游dispatcher。終局 `wf/tools/inbox_mail.sh diagnose-e2e-1124 --up DONE '觀戰單次分段診斷完成' /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/diagnose-e2e-1124/REPORT.md`，工具阻塞改BLOCKED；產品測試失敗不等於診斷未完成，報告如實列exit。五行回覆後退出，不探索。
