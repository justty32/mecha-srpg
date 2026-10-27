# 任務：整理今日收尾所需的wf活入口與接續狀態

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/STRUCTURE.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/tidy/README.md`、`wf/workflows/tidy/gotchas.md`、`wf/workflows/refactor/moving-things.md`、`wf/workflows/dispatch/README.md`；親讀。舊世界觀與舊線僅作狀態證據，不代驗收。

## 背景與唯一目標

把過大的 `STATE.md`、接近門檻的 `user.md` 與今日看圖／接續入口整理成薄導航與語意子檔，校正已在家與 small REPORT 已可見的現況；保留全部未完成項與原裁示。

## 範圍（排除法寫死）

- 可寫：`wf/workflows/dispatch/handoffs/STATE.md`、`next-session.md`及其必要新續行子檔；`wf/workflows/common/user.md`及其必要新語意子檔；`wf/notes/art-review-2026-10-27/README.md`；必要 `wf/INDEX.md`、`wf/workflows/common/README.md` 導航連結；本線 REPORT。
- 不做：寫 `wf/SESSION-LOG.md`、`WAIT_USER.md`、`wf/workflows/dispatch/CLAIMS.md`、`wf/workflows/common/code-map.md`（領導整合）、其他舊線 REPORT、任一 art／src／content／spec／legacy、kernel/工具/AGENTS。不可將世界觀或暫停舊線標完成。
- 件數 gate：本線實質變更最多20檔；容量 gate：新增內容最多1MB；觸發即回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 wf/tools/fix_moved_links.py` | 如有實體搬移先 dry-run，再請領導做跨寫集修正 |
| `bash wf/tools/wf-lint.sh --strict .` | 活入口／連結驗收；由領導整合時統一終驗 |
| `git diff --check`、`rg` | 核連結、敘述與格式 |

## 資源與禁區

- 可寫程式碼線（本線實際只寫文件）：只改寫集，不 commit/push、不開分支、不 reset/rebase、不 `git add -A`，不刪檔、不重寫歷史報告。不碰鍵鼠螢幕、不開GUI、不下載安裝、不改全域設定。子代理上限0、平行工人最多3；全機最多1重負載，本線只跑輕量文件檢查。搬移來源已commit/push；複製驗證後交領導收rename，不留雙份活真相。

## 工作

1. 讀活檔與 small REPORT 實體證據；列出仍open、已完成但未主觀驗收、已在家三類事實。
2. 語意拆 `STATE.md` 與 `user.md`，原路徑留入口；修 `next-session.md`、看圖入口的舊現況敘述。新子目錄留README，連結指向有效活路徑。
3. 跑輕量檢查，寫 REPORT，列 before/after bytes、搬移與六類斷裂掃描結果；不代領導跑全庫重負載。

## 交付

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/tidy-mech-wf/REPORT.md` 與寫集文件。REPORT 四段：做了什麼／產出／沒做到或證據不足／需要決定的事；末尾「以後交接書該點名的工具」。

## 驗收（固定 3 條）

1. `STATE.md`、`user.md` 作薄入口且≤8192 bytes，新語意目錄有 README；原裁示與未完成狀態可逐項找到。
2. `next-session.md`、看圖入口反映在家與small REPORT可見，但世界觀整合、四舊線與主觀美術評閱仍為pending；沒有改歷史報告。
3. REPORT 有 before/after bytes、路徑與斷裂掃描證據；`git diff --check` exit0，文件連結在寫集內可解析。

## 失敗與回報

語意差異先修回原意；環境阻塞保留改動報 BLOCKED。原生 agent 用工具回傳五行摘要與 REPORT 絕對路徑，不用 inbox；終局必為 DONE／BLOCKED／FAILED。
