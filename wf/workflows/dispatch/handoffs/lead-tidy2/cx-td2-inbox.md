# 任務：把 wf/inbox 裡已收線的信、orders、團隊信箱歸檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/common.md`（共通規則，必讀），再讀 `wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`，以及 `wf/tools/inbox_ack.sh`、`wf/tools/inbox_team.sh` 的用法（`--help` 或讀檔頭）。

## 背景

以下線都已收線（見 `wf/workflows/dispatch/handoffs/done/README.md`），它們的信沒人會再辦。**現役不碰**：`lead-engine-next`（mail、teams/engnext）、`lead-bigfill`（mail、teams/bigfill）、`lead-tidy2`。

## 範圍（排除法寫死）

件數 gate：歸檔超過 400 封就停下回報；容量 gate：搬動超過 50 MB 就停。

只做：
1. `wf/inbox/new/` 全部 13 封 `cx-tf-*`（lead-tone-fix 已收線）→ `wf/tools/inbox_ack.sh 信檔路徑… --apply` 歸檔。
2. `wf/inbox/mail/` 底下除 `lead-engine-next`、`lead-bigfill`、`lead-tidy2` 以外的每一格（目前 cx-kj-01、lead-aegir、lead-cockpit、lead-dedup、lead-epic-land、lead-fill、lead-fill-af、lead-fill-am、lead-fill-ea、lead-fill-kaiju、lead-fill-mech、lead-mech2、lead-rep、lead-tone-fix、lead-wanchao）的信全部 ack 歸檔；歸檔後空掉的信箱資料夾搬進 `ROOT/wf/workflows/dispatch/handoffs/lead-tidy2/trash/cx-td2-inbox/`（不 rm）。
3. `wf/inbox/orders/` 的 cx-fill-01、cx-fill-02、cx-kj2-04、cx-mf-01、cx-rep-01（皆已收線）→ 搬 `wf/inbox/done/2026-10-26/orders/`（照上次慣例，見 `wf/inbox/done/2026-10-24/orders/`）。
4. `wf/inbox/teams/` 除 `engnext`、`bigfill` 以外（aegir、fill-af、fill-am、fill-ea、grid、kaiju、mech、mech2、wanchao）→ `wf/tools/inbox_team.sh close 隊名` 歸檔（工具若要求參數不同照它的 usage）；`grid`、`kaiju`、`mech` 若查不到對應已收線紀錄，照樣歸檔但在 REPORT 註明。
5. `wf/workflows/inbox/ROSTER.md`：上述已收線者的格改「已收線」；若檔案 > 6 KB，把已收線格封存到 `wf/workflows/inbox/archive/ROSTER-2026-10-26.md`（照既有 `archive/ROSTER-2026-10-24-c.md` 的格式，archive/README 加一列），入口只留現役＋一行指向封存。

不做：上列以外的信；`wf/inbox/.state/`（gitignored，不碰）；任何非 inbox 的檔。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_ack.sh … --apply` | 歸檔信 |
| `wf/tools/inbox_team.sh close` | 歸檔團隊信箱 |
| `bash wf/tools/wf-lint.sh --strict .` | 驗 inbox_pending |

## 資源與禁區

**可寫程式碼線**：只寫「範圍」列的路徑。共通禁區見 common.md（不 commit、不刪、不碰現役線、不碰鍵鼠 GUI、不 push）。

## 交付

REPORT 寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/inbox/REPORT.md`（附：新增或變動的 `wf/inbox/done/` 檔清單，供領導 commit）。

## 驗收（固定 4 條）

1. `ls wf/inbox/new` 為空；`ls wf/inbox/mail` 只剩現役三格（可能不存在的格不算）。
2. `ls wf/inbox/orders` 不含上列 5 檔；`ls wf/inbox/teams` 只剩 `engnext`、`bigfill`。
3. `wc -c wf/workflows/inbox/ROSTER.md` ≤ 6144。
4. `bash wf/tools/wf-lint.sh --strict .` 的 `inbox_pending=0` 且 `broken=0`。

