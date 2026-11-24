# 任務：以新版新局複驗契約鍵盤操作及戰鬥撤退資訊

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/testing.md`、`wf/workflows/feature-dev/README.md`。親自讀適用規矩；code-map 僅按需查 UI 兩列，不整份讀。

## 背景與唯一目標

11/24 已完成出口／撤離點區分、敵機駕駛姓名遮蔽、契約重繪焦點修正。本線唯一目標是以 headless 新局驗證使用流程，補單元測試看不到的瀏覽器互動證據。先讀 `wf/workflows/dispatch/handoffs/fix-regression-1124/REPORT.md` 與 `wf/org/evidence-2026-11-24/playtest-gate.json`。只有此新驗收索引 status=done 且所列三個 exit 檔均為0才能啟動實玩；否則回報 BLOCKED，不等待也不重跑閘門。舊 ui-gate.status=failed 是原始歷史，不可改寫。

舊 `/tmp/mecha-play-1118` 已不存在，不可假稱復用第28天戰役。使用 seed 3 新局，遇到戰役隨機結果如實記錄，不改正式規則或既有測試使流程通過。

## 範圍

唯讀遊戲程式、既有 e2e；僅可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playtest-1124/` 內 REPORT、臨時驗證腳本、log、存檔。main 明列委派此 wf 路徑。不得改任何其他檔；不新增正式功能／測試，不做長局平衡或效能測試。

件數 gate：固定3項流程、最多6個自製附件；容量 gate：產物合計2 MB（不截圖），超過停報。重現需注入狀態時必須明確標示合成 fixture，不能當自然戰役證據；優先真實控制器／UI，禁止直接改 DOM 假造成功。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/workflows/dispatch/handoffs/playtest-1124.md` | 本brief為唯一派工範圍；每步以mailbox_read讀信、mailbox_send終局回報main |
| `sh scripts/heavy-lock.sh` | 整個 headless 工作階段只持一次全機共用鎖，不巢狀 |
| `git diff --check` | 確認未引入格式問題 |

## 資源與禁區

唯讀調查線（報告與臨時腳本例外僅限上述目錄），FSM GPT astra/high（aos pack astra），透過subagent啟動、mailbox回報；子代理上限0。全機同時只一人 headless 實玩。Node/npm/瀏覽器工作階段必經共用鎖，測試並行1；禁止跑完整 test/build/e2e 或下載安裝。可用既有 dist 及本機 Playwright；啟自己的 preview 先確認埠空閒，結束僅清自己的子程序，不停止使用者服務。程序逾時先收日誌與子程序狀態，不盲目重跑。每個工作階段只持一次鎖指禁止巢狀；自身腳本錯誤查證並清理後，可原地修正並開新序列持鎖階段，保留歷次log。14:05 main已明確授權修正首頁路由續驗，原15:29截止不延長。

不碰實體鍵盤滑鼠螢幕、不開GUI、不截圖；僅允許 headless browser 自動化合成輸入，不宣稱實體裝置手感。不上網、不刪檔、不rm -rf、不改config/.gitignore、不commit/push/建分支/rebase/reset、不還原既有dirty。工具／沙箱拒絕立即報BLOCKED，不換runner或權限繞過；自身臨時腳本錯誤可原地修正。長工作保留log/exit並前景監看，不讓工具timeout殺掉工作。

## 工作與驗收（固定3條）

1. 新局契約頁：透過鍵盤選取不同列並檢查 activeElement 與實際選取 id／詳情一致，重繪後 Tab 可繼續行進；有歷史時驗 summary 開合與焦點，沒有歷史則標未覆蓋或獨立合成 fixture。不可只判 controller action 收到。
2. 新局接約／出戰：記錄任務目標與出口／撤離點文案、可見敵方名稱；嘗試一次實際玩家移動與邊界撤退確認／取消／確認流程，記錄退場與結算結果。如自然場景不適用，只記原因及可重現路徑，不硬改任務或跨範圍修正。
3. 1280x800 與390x844 headless DOM量測頁面有無水平溢出、重要資訊是否可達；收 pageerror，REPORT 清楚分成功／失敗／未覆蓋，附命令、exit與證據檔。不把量測等同人眼或實機驗證。

最多90分鐘；16:15停止新工作，16:45前一定收線。發現缺陷先保留可重現證據，不自行修正式程式。

## 交付及回報

直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playtest-1124/REPORT.md`，四段：做了什麼／產出／未做到／需要決定；末段工具經驗。回覆5行與絕對路徑。不要跑wf全套lint。

線名playtest-1124，團隊無，上游main。透過 mailbox_send 回覆請求的 reply_to 並帶 in_reply_to，狀態DONE/FAILED/BLOCKED/NEEDS-USER；附REPORT絕對路徑。完成回報後退出，不做額外探索。
