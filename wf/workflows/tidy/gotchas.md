# tidy／gotchas — 整理與拆檔踩過的坑

[tidy](README.md)｜通用規則在 [README](README.md) 與 [data-files](../common/data-files.md)

## 刪檔與搬檔

<!-- wf-nav -->
- ```markdown 圍籬內可能刻意放「壞」連結當測試字串；改寫器與檢查都要跳過 code fence。
- **目錄改名**會留正文引註殘留（`x.md:48` 這種），連結檢查抓不到，要另外 grep 舊目錄名。
- 刪整個目錄前，除了連結還要 grep **純文字路徑**（反引號裡的工具、護欄、契約路徑）：連結掃描抓不到，活工作流可能正照著它做事（slim-1105：content 工作流引用 `done/` 裡的 sweep.ts 與護欄，先搬 `scripts/` 或精簡併入才刪）。
- 名冊、領地登記這種表格類活檔要**把規則段留在活檔**、只搬歷史條目；表格裡的「狀態」欄不可信，判準改用 `SESSION-LOG.md` 或明確給出的現役清單作證據，交接書要直接給出證據，否則線會「不敢猜」留一半。
- 「不搬某個現役目錄」與「清指向被刪檔的連結」會在同一批檔上打架；驗收命令只擋 rename／delete（`git diff --cached --name-status -M <dir>/ | grep -v '^M'`），不擋 modify。
- 資料夾可能有 `.` 開頭的隱藏檔；用 `ls -A`，否則大小統計也可能漏掉。
- 上千個路徑的 `git rm`／`git commit --` 用 `xargs -a <清單>` 餵；zsh 不會把 `$VAR` 拆字，`git ls-files -- $DEL` 會靜默變成 0 個檔。
- 線報告的「需要裁示」清單要照 [WAIT_USER](../../WAIT_USER.md) 的格式落地，不能只留在回報裡。

## 拆檔與資料檔

<!-- wf-nav -->
- `link_columns` 只列**整格＝相對路徑或單一 md 連結**的欄。把散文欄（`body`、`理由`、`機制`）或機外路徑欄列進去，lint 會把整格當路徑驗、報大量假斷鏈；散文裡的 md 連結所有欄本來就會掃，不必標。
- B 拆檔最常見的破壞是**別處的 `#錨點`**：子 repo 的 wf-lint 不抓跨 repo 的錨點，母 repo 根的全庫檢查才抓；拆前先 `grep -rn '<檔名>#'`，被錨定的標題原文保留在入口。
- 入口壓到 8192 邊緣（8125／8094／7979）再改一個字就爆；改字前先 `wc -c`。`wc -c … | awk '$1>8192'` 會被 total 行騙，用 `find -size +8192c`。
- 給人讀的總覽表（README 能力表、tools 說明表）不是記錄表，抽成 json 會被退回；判準是「一列一個要去的地方／要知道的事」對上「一列一筆同構記錄」。
- `grep -c` 接在不存在的腳本後面會印 `0` 假通過；驗收命令要在腳本所在 repo 根跑，或先 `test -f`。
- 用空行把清單切塊躲 BIGLIST 不算解；檢查器會把單一空行分隔的塊併起來。導航清單加 `<!-- wf-nav -->`，同質記錄抽資料檔。

## 派線與工人

<!-- wf-nav -->
- 便宜模型的工人可能把中途追加的規則當側路訊息拒收；規則改了就開新工人、把規則寫進主交接書，不要用續訊息機制追加。
- 工人偶爾漏 stage 改過的 md；管理線驗收要含 `git status --short | grep -v '^[MADR] '` → 0，並以明確路徑補 `git add`。
- 工人的暫存要放 scratchpad 並帶批次前綴；曾有暫存檔落到 repo 根、兩個工人撞同名暫存檔。

## 執行環境

<!-- wf-nav -->
- **`command -v` 只判存在、不判能不能跑。** `python3` 若是系統塞的假 shim，`wf-lint.sh` 會判成「有」而不印 WARN，實際呼叫失敗又被 `2>/dev/null` 吃掉——BIGLIST／錨點／資料檔三項是「沒跑」不是「乾淨」，只有 broken／residue／oversize（純 bash）算數。要驗那三項就直接手跑一次對應的 `.py`，別拿這種綠燈當證據。
- **CRLF checkout 會同時弄壞執行與計數。** `.sh` 帶 `\r` 在 Linux／WSL 直接跑不動；`wc -c` 每行多算 1 byte，8192 上限在 Windows 工作區會誤報超標（CI 看的是 LF）。量大小用 `git show HEAD:<檔> | wc -c`，要在 WSL 跑就先複製一份 `sed -i 's/\r$//'` 過的。
