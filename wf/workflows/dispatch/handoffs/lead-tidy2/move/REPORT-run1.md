# cx-td2-move REPORT

## 做了什麼

已親自讀交接書指定的 AGENTS.md、common.md、STRUCTURE、使用者偏好、tidy 入口與 gotchas、moving-things、done 索引，以及工作流派發器；開場已查 SESSION-LOG／WAIT_USER 並讀新信箱（無信）。

盤點搬移表實際列出的 32 個資料夾（交接書 gate 為最多 36 個），共 2,490 檔、33,372,617 bytes，未超過 60 MB；來源皆存在，目標皆未存在。未擴充搬移範圍或驗收條數。

嘗試第一個搬移即遇環境錯誤，依 common.md「工具或環境出錯（沙箱拒寫、指令不存在）→ 停下，把情況寫進 REPORT 的『沒做到』並結束」停止。

## 產出

只有本 REPORT；未搬動資料夾，未修改既有檔案，未 commit。

預定搬移表路徑為 `wf/workflows/dispatch/handoffs/lead-tidy2/moves.tsv`，因尚無成功搬移而未建立，避免將規劃誤記為完成。

`fix_moved_links.py` 尚未執行，修改 0 檔；手修檔案 0 檔。

## 沒做到或證據不足的

第一個命令：

```sh
git mv wf/workflows/dispatch/handoffs/lead-content wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content
```

退出碼 128：

```text
fatal: Unable to create '/home/lorkhan/repo/game_dev/mecha-srpg/.git/index.lock': Read-only file system
```

搬移、搬移表、連結 dry-run／apply、裸路徑修正、工具 import 修正與兩支實跑、done 索引補五列、handoffs 索引同步均未執行。未掃描殘留舊路徑清單；所有來源仍在原處，不能宣稱只剩歷史正文。

固定五條驗收的狀態如下，未另加條件：

1. 來源資料夾清空：未達成，32 個來源仍在原處。
2. rename／刪除計數：未執行；首個 `git mv` 已因 index 唯讀失敗。
3. 舊路徑殘留：未執行，未做路徑修正。
4. `bash wf/tools/wf-lint.sh --strict .`：未執行，依共通規則在環境錯誤後停止。
5. `python3 wf/tools/check_anchors.py`：未執行，同上。

## 需要決定的事

無內容或範圍裁示需求；需由領導在 `.git` 可寫的執行環境重新執行原交接書。本線不繞過沙箱，也不以普通 `mv` 取代已追蹤檔必用的 `git mv`。

以後交接書該點名的工具：`git mv`、`python3 wf/tools/fix_moved_links.py`（dry-run 後 apply）、`bash wf/tools/wf-lint.sh --strict .`、`python3 wf/tools/check_anchors.py`；原交接書皆已點名。
