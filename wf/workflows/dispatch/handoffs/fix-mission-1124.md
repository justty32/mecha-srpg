# 任務：修正戰鬥目標的出口語義與敵方姓名顯示

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/testing.md`。親自閱讀，不只靠摘要。

## 背景與唯一目標

既有未提交戰鬥目標 UI 有兩項靜態確認問題，詳見 `wf/org/review-2026-11-24.json` 的 exit-semantics、pilot-disclosure。唯一目標是讓目標 UI 忠實呈現正式規則與可公開情報。HEAD fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2，既有差異證據 `wf/org/evidence-2026-11-24/baseline.patch`；不要還原既有改動。

## 範圍（排除法寫死）

只可修改 `src/ui-adapter/vm/viewmodel.ts`、`src/ui-adapter/vm/types.ts`、`src/ui-adapter/dom/board.ts` 及本線 REPORT。明列出口與邊界撤離點要區分，reachExit/escort 無出口時須說明需撤離，禁撤時不可暗示有可抵達出口；正式規則不變。敵方機甲目標名稱不得公開駕駛姓名，己方與可見公開怪獸名稱不得退化。

不做契約焦點、不改任何測試檔、規則、內容、鎖腳本、其他 wf 檔或任何範圍外路徑。測試檔仍屬 test-prune-1105 舊 claim，待裁示。件數 gate：最多 2 項問題、3 個原始碼檔。容量 gate：產物最多 1 MB，任一超過即停下回報。不要呼叫完整 unit() 只為取名字而增加不必要快照與副作用。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh fix-mission-1124 --once` | 每完成一步查 orders |
| `wf/tools/inbox_mail.sh` | 終局回報，正文給 REPORT 檔 |
| `git diff --check` | 完成後檢查差異空白 |

## 資源與禁區

可寫程式碼線，但本切片只做靜態修正，不執行 Node/npm 或測試；動態驗證由 main 另排。codex 工人啟動器本身已獲豁免；未授權的 Node 指令不能自跑。全機測試須經 `scripts/heavy-lock.sh` 的共用鎖，不自行加碼。

不碰鍵盤、滑鼠、螢幕，不開 GUI；不 commit/push、不建分支、不 rebase/reset，不還原既有 dirty 差異；不刪檔、不 rm -rf、不裝依賴、不改 ~/.codex/config.toml 或 .gitignore；不上網。子代理上限 0。模型 gpt-6.1-sol/high。只用已列路徑，main 明列委派本線 REPORT 的 wf 寫入權。工具拒絕即停下報 BLOCKED，不換路徑繞過。

## 工作

1. 核對正式 objectives/flow 與現有 unit 顯示，確認兩問題後增量修正。
2. 對所有 exit 型別消費端做唯讀搜尋，維持相容；若需改範圍外檔則回報，不自行擴張。
3. 寫 REPORT，清楚分開靜態證據與未跑測試。

## 交付

REPORT 直接寫到 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/fix-mission-1124/REPORT.md`。四段：做了什麼／產出／沒做到或證據不足／需要決定；附以後交接書該點名的工具。回覆五行摘要及絕對路徑。

## 驗收（固定 3 條）

1. 出口標記及目標文案區分明列出口與邊界撤離點，無明列出口時不再暗示僅抵達邊界即可完成 reachExit/escort；正式規則完全未改。
2. 目標名稱不洩露敵方機甲駕駛姓名；REPORT 列己方、可見敵機、不可見敵機及怪獸四情境的靜態路徑證據。
3. 只改明列檔案且 git diff --check 通過；REPORT 明示未跑測試及下一步紅綠驗證需求，不宣稱功能已驗收。

## 完成／阻塞回報

線名 fix-mission-1124，團隊無，上游 dispatcher。完成以 `wf/tools/inbox_mail.sh fix-mission-1124 --up DONE '戰鬥目標靜態修正完成，待動態驗證' /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/fix-mission-1124/REPORT.md` 回報；阻塞改 BLOCKED 並說解除條件。卡住超過10分鐘先回報，勿無聲等待。測不出來保留差異，不回滾；測出問題亦不得 git restore 既有改動，先回報。16:15 後不開新工作、16:45 前交接。
