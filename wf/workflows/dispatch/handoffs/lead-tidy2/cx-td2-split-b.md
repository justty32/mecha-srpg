# 任務：把六份逼近 8 KB 的文件按語意拆成入口＋子檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/common.md`（共通規則，必讀），再讀 `wf/workflows/tidy/README.md`、`wf/workflows/tidy/gotchas.md`、`wf/workflows/common/data-files.md`（B 法）。

## 範圍（排除法寫死）

件數 gate：超過本節列出的檔數就停；容量 gate：新增內容超過 0.2 MB 就停。

只拆這 6 檔（ROOT 相對路徑）：
1. `wf/workflows/planning/specs/world/setting.md`
2. `wf/workflows/planning/specs/world/operations.md`
3. `wf/workflows/planning/specs/world/factions.md`
4. `wf/workflows/planning/specs/world/README.md`
5. `wf/workflows/planning/specs/world/rifts-and-territory.md`
6. `wf/workflows/planning/specs/world/machine-souls.md`

做法（B 法）：原路徑保留當入口（導航＋各子檔一句話摘要＋仍需留在入口的段落），其餘段落按主題搬進同名資料夾（例 `specs/world/setting/主題名.md`；`README.md` 入口改拆成 `specs/world/` 下的新主題檔，不建 `README/` 資料夾；若同名資料夾已存在就放進去，檔名不和既有檔撞）。**被其他檔用 `#錨點` 連到的標題要留在入口**（先 `grep -rn 'terms.md#' ROOT --include='*.md' --include='*.json'` 這類指令查哪些錨點被引用；或把錨點連結一併改指新子檔）。每個子檔開頭一行導航連回入口。措辭一字不改。入口目標 ≤ 5 KB，子檔各 ≤ 6 KB。

不做：其他任何檔的內容；不改檔名；不動 `content/`；spec 內 `SPEC-GAP`／編號條目照原樣搬。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `bash wf/tools/wf-lint.sh --strict .` | 拆完驗 0 違規 |
| `python3 wf/tools/check_anchors.py` | 驗錨點 |
| `python3 wf/tools/fix_moved_links.py` | 若有連結要改指子檔 |

## 資源與禁區

**可寫程式碼線**：只寫「範圍」列的路徑。共通禁區見 common.md（不 commit、不刪、不碰現役線、不碰鍵鼠 GUI、不 push）。

## 交付

REPORT 寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/split-b/REPORT.md`。

## 驗收（固定 4 條）

1. `wc -c` 這 6 個入口與所有新子檔都 ≤ 6144。
2. `bash wf/tools/wf-lint.sh --strict .` → `TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`。
3. `python3 wf/tools/check_anchors.py` → 0 個壞錨點。
4. 拆前拆後段落總數對得上（REPORT 附每檔「原段落標題 → 新位置」對照表）。

