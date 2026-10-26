# 任務：把已收線的 handoffs 線資料夾搬進 done/收線日/ 並修好所有指向它們的路徑

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/common.md`（共通規則，必讀），再讀 `wf/workflows/tidy/README.md`、`wf/workflows/tidy/gotchas.md`、`wf/workflows/refactor/moving-things.md`、`wf/workflows/dispatch/handoffs/done/README.md`（看格式與上次怎麼做）。

## 範圍（排除法寫死）

件數 gate：超過下表 36 個資料夾就停；容量 gate：搬動總量超過 60 MB 就停。

搬移表（`wf/workflows/dispatch/handoffs/` 底下，左＝資料夾，右＝目標 `done/DATE/`；DIR＝資料夾名、DATE＝收線日）：

| 日期 | 資料夾 |
|---|---|
| 2026-10-24 | lead-content、lead-grid、lead-history-lines、lead-pilot-essence、lead-reconcile、lead-rename、lead-settle、lead-tidy、lead-tune、lead-world-land、lead-wrapup |
| 2026-10-25 | lead-cockpit、lead-decide-land、lead-polish |
| 2026-10-26 | lead-aegir、lead-dedup、lead-epic-land、lead-fill、lead-fill-af、lead-fill-am、lead-fill-ea、lead-fill-kaiju、lead-fill-mech、lead-ironsword、lead-kaiju2、lead-mech2、lead-rep、lead-resist、lead-secret、lead-tide-cal、lead-tone-fix、lead-wanchao |

不做（不搬）：`done/`、`lead-engine-next`、`lead-bigfill`、`lead-tidy2`、`lead-codex-pilot`（永久留原處）、所有 `plan-*`、`talk-*`、頂層 md／json（活依據）。

步驟（**第 2 輪**：第 1、2 步領導已在沙箱外做完——資料夾已用 `mv` 搬到 `done/DATE/`，moves.tsv 已寫好；你從第 3 步開始，**不用 git mv、不碰 git**）：
1. 每個資料夾：`git mv DIR done/DATE/DIR`（已追蹤檔）；之後原處若還剩未追蹤／gitignored 的檔（log、pid、trash），用 `mv` 搬到同一個目標資料夾裡（保持相對位置），原處空了就留空目錄不管。
2. 寫 `ROOT/wf/workflows/dispatch/handoffs/lead-tidy2/moves.tsv`（`舊路徑TAB新路徑`，ROOT 相對，一個資料夾一列）。
3. `python3 wf/tools/fix_moved_links.py ROOT/wf/workflows/dispatch/handoffs/lead-tidy2/moves.tsv`（先 dry-run 看清單，再 `--apply`）。
4. fix_moved_links 不處理的路徑字串，自己用腳本修（只改路徑前綴 `wf/workflows/dispatch/handoffs/DIR/` → `wf/workflows/dispatch/handoffs/done/DATE/DIR/`，或相對寫法 `handoffs/DIR/` → `handoffs/done/DATE/DIR/`）：
   - `content/batches/**/*.json` 的 `reportDir`、`report.file` 等路徑欄；
   - `wf/` 底下 md／json 裡的裸路徑（反引號內的 `handoffs/DIR/...`）；
   - 被搬資料夾內的 `.ts`／`.py`／`.sh` 工具：相對 import／路徑往上補兩層（`done/DATE/`；DIR＝資料夾名、DATE＝收線日），能跑的挑 2 支實跑確認不報找不到模組。
   - **不改**：`src/`、`test/`、`content/lore/`、`content/base/`、`content/index/`、`wf/workflows/dispatch/handoffs/lead-engine-next/`、`wf/inbox/.state/`、任何 `archive/` 下的檔、被搬的資料夾內部的歷史 REPORT 正文（只修工具的 import）。這些地方若有舊路徑，列在 REPORT。
5. `done/README.md` 追加列：lead-grid、lead-pilot-essence、lead-rename、lead-tidy、lead-wrapup 目前沒有索引列，各補一列（日期 2026-10-24、一句結論取自該資料夾的 REPORT 首段或 `git log -1 -- DIR` 訊息，附件夾連結）；其他已有索引列的，把附件夾連結改到新位置（fix_moved_links 會做，核對即可）。
6. `wf/workflows/dispatch/handoffs/README.md` 若有逐一列出線資料夾，同步。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `git mv` | 搬已追蹤檔 |
| `python3 wf/tools/fix_moved_links.py` | 修 md／wf-table 資料檔的連結 |
| `bash wf/tools/wf-lint.sh --strict .` | 驗 0 違規 |
| `python3 wf/tools/check_anchors.py` | 驗錨點 |

## 資源與禁區

**可寫程式碼線**：只寫「範圍」列的路徑。共通禁區見 common.md（不 commit、不刪、不碰現役線、不碰鍵鼠 GUI、不 push）。

## 交付

REPORT 寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/move/REPORT.md`（附 moves.tsv 路徑、fix_moved_links 改了幾檔、手修了哪些檔、殘留舊路徑清單）。

## 驗收（固定 5 條）

1. `ls wf/workflows/dispatch/handoffs/` 不再有搬移表裡的任何資料夾名（空目錄也搬走或不存在；若留空目錄，REPORT 列出）。
2. （領導核）跳過，寫「領導核」。
3. `grep -rnE 'handoffs/(lead-(content|grid|history-lines|pilot-essence|reconcile|rename|settle|tidy|tune|world-land|wrapup|cockpit|decide-land|polish|aegir|dedup|epic-land|fill|fill-af|fill-am|fill-ea|fill-kaiju|fill-mech|ironsword|kaiju2|mech2|rep|resist|secret|tide-cal|tone-fix|wanchao))/' wf content/batches --include='*.md' --include='*.json' | grep -v '/archive/' | grep -v 'handoffs/done/' | wc -l` → 0（或只剩 REPORT 列明的歷史正文）。
4. `bash wf/tools/wf-lint.sh --strict .` → `TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`。
5. `python3 wf/tools/check_anchors.py` → 0。
