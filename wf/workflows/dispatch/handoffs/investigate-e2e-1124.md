# 任務：定位正式觀戰e2e逾時的原因與最小後續驗證

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/testing.md`。親讀適用規矩；code-map僅查UI相關列。

## 唯一目標與範圍

main完整UI測試208案通過（1743秒）、build通過；e2e 18/19通過，唯一失敗 `e2e/battle.spec.ts:202` 在line217 settle(page)遇整案30秒timeout。log `wf/org/evidence-2026-11-24/ui-e2e.log`。唯一目標：靜態定位可能的效能／行為原因，提出一條最小區分驗證，不直接修正、不自行重跑。

唯讀程式、e2e、現有git diff及 `wf/org/evidence-2026-11-24/baseline.patch`；允許寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/investigate-e2e-1124/REPORT.md`。main明列委派此wf寫入。不得改其他任何檔，不跑Node/npm/build/測試/瀏覽器，不實玩，不改時限，不還原dirty。件數 gate：1個失敗、1份報告；容量 gate：報告8 KB，整線產物2 MB，超過停報。不做：全專案效能調查、正式修正、動態重跑、任何額外工作。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/inbox_poll.sh investigate-e2e-1124 --once` | 每步讀orders |
| `wf/tools/inbox_mail.sh` | 終局回報 |
| `git diff` | 區分今日修改、既有dirty與未改路徑 |

## 資源與禁區

唯讀調查線，codex gpt-6.1-sol/high，workspace-write只供報告；子代理上限0。不開GUI、不碰鍵鼠螢幕、不上網、不安裝、不刪檔、不commit/push/建分支/reset/rebase、不改config/.gitignore；工具拒絕報BLOCKED不繞過。查程序僅簡短PID/comm欄，Node comm可能是MainThread。嚴禁額外跑驗證、wf lint、整份code-map。最多30分鐘；16:15停新工作、16:45收線。

## 工作與驗收（固定3條）

1. 分解測試30秒涵蓋範圍（內容載入、node runBattle、導航、settle），區分已知證據與猜測；讀現有log，不能把timeout說成hash不符。
2. 追正式settle到controller/snapshot/render路徑，核對本輪mission/出口差異是否引入不必要重活，對照208案中觀戰hash與相關回歸。只報有定位的發現，無確定根因明示。
3. REPORT提供最小診斷建議（預計指令、要記哪些時間、何種結果能區分原因），不要直接建議調高timeout掩蓋。先報main裁定執行。

## 交付與回報

REPORT四段：做了什麼／產出／未做到／需要決定；末段工具經驗。絕對路徑 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/investigate-e2e-1124/REPORT.md`。
線名investigate-e2e-1124，團隊無，上游dispatcher。終局 `wf/tools/inbox_mail.sh investigate-e2e-1124 --up DONE '觀戰逾時靜態調查完成' /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/investigate-e2e-1124/REPORT.md`；阻塞改BLOCKED。回覆5行與路徑後退出。
