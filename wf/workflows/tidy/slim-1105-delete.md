# slim-1105 刪除分類與連結影響

[slim-1105-plan](slim-1105-plan.md)｜逐列候選 [slim-1105-candidates.json](slim-1105-candidates.json)

路徑都寫成純文字，因為這些目標將來會刪掉。handoffs 指 `wf/workflows/dispatch/handoffs/`。

## A 封存（15.9 MB，1253 檔）

`handoffs/done/` 有 7 個日期夾，共 1235 檔，佔 15.8 MB；另外 `inbox/archive/` 的舊 ROSTER 8 份、`wf/inbox/done/`（messages.json 和只增不減的 ack-log）、`wf/archive/` 1 份、`handoffs/state/archive/` 2 份。

這些都不在執行鏈上：grep src、test、e2e、scripts、package.json 和 wf/tools，只找到註解，沒有一處會讀檔。`inbox_ack.sh` 用 `mkdir -p` 自己重建 `done/<日期>/`，`done/.gitkeep` 留著就好。

**例外**：`done/2026-10-23/lead-combat-ref/mechanics.json` 和 `lead-tome4-ref/mechanics-tome4.json`（共 166 KB）是 `specs/core/adoption.json` 的 `table_path` 目標，要先搬走。

## B 無限增長的紀錄（18.3 MB）

- 42 條舊線資料夾裡的證據檔：`.gz`、`.jsonl`、`.tap`、`.log`、`.txt`、`.png`、`.svg`、sha256 與 signatures 快照、`mcp-rpc`，以及 `evidence/`、`shots/`、`log/`、`trash/`。共 529 檔，night-combat-lead-1028 一條線就有 11.7 MB。全部只給人看。
- `wf/notes/close-*.md`：兩份收工流水。
- 活檔只修剪、不刪：`engine-backlog.json` 92 列中有 27 列已完成；`codex-batches.json` 大半是已完成列；`handoffs/done/README.md` 是只准追加的索引，隨 A 一起刪。

**執行時會讀、不能刪的：**

- `content/batches/`：`wf/tools/content_index.py` 讀它來產生索引的 batch 欄，`test/content/index.test.ts` 再驗證一致性。
- `test/golden/*.hash`、`test/campaigns/*.hash.json`：黃金基準。
- `wf/workflows/content/numeric-bands.json`、`playtest-baselines.json`：`src/sim/probe.ts`、`src/content/lint.ts`、`test/sim/probe.test.ts` 會直接讀。

manifest 的 `reportDir` 只是 `content_accept.sh` 的輸出目錄。目錄刪掉後，下次跑會重建，不會壞。

## C 過時的工作文件（13.9 MB，1205 檔）

- handoffs 頂層 42 個舊線目錄或散檔剩下的部分：交接書、REPORT、STATE、manifest 與結果 json。範圍是 10/26 到 10/29 的 lead-world-*、expansion-1028*、night-*、fill-*、lead-fill-*、lead-bigfill、lead-codex-pilot、lead-engine-next、lead-tidy2、mech-layers、svg-art、tidy-*、verify-import／night、integrate-zip、cm-recipe、close-night。CLAIMS 的「活躍工人」寫的是 0。
- 交棒散檔：`STATE.md`、`state/`、`next-session.md`、`next-tidy.md`、`codex-handover.md`、`fill-rulings.md`、`tidy-*-1027.md`、`codex-effects.json`。
- `wf/inbox/orders/cx-review-*-1028.md` 3 份、`notes/investigations/dev-start-2026-10-29.md`。
- `handoffs/pages-1029/` 是空目錄，沒有進版控，可以直接刪。

## D 需使用者個別決定

逐列見 candidates 的 D1～D8。

**legacy/**（0.3 MB）沒有程式引用，wf-lint 基準的 2 個壞連結和 6 份超過 8 KB 的 md 都在這裡。建議刪掉，INDEX 留一句「見 git 歷史」。

**art 四個試作**（共 21.4 MB）都還在 WAIT_USER 等評閱。建議現在只刪證據圖：canvas-mech 的 `viewer/evidence/`（8 MB）、mech-blueprint 的 `evidence/`（3.5 MB）、mech-3d 的 `viewer/evidence/`（1.3 MB）。原型本身等評閱完再決定。mech-3d 的 vendor three.js 要留，離線展示用得到。mech-blueprint 的 `data/overlaps.json`（1.5 MB）如果是生成物，可以改成按需重產。

**content-review-2026-10-28**（1.3 MB）：建議刪 coverage、entries、evidence 的 json 和 py，只留 README 與三份 REPORT。

**handoffs 的 plan-\* 與 talk-\***（0.19 MB）：約有 26 個連結連到這裡，多半來自 design-notes。建議逐份確認已經被 design-notes 或 spec 吸收再刪；還沒吸收的，移到 `planning/design-notes/`。

**specs/\*-1029.md 與 plans/**（14 檔）：10/29 已經實作。要先確認內容已併入 `specs/core`，再刪。

## E 不可刪

程式、測試、e2e、schemas、設定檔；content 的 base、lore、index、batches；`test/golden`、campaigns 與 fixtures；`specs/core`、ops、world 和 design-notes；現行工作流文件與 `wf/tools`。

1105 這批：verify-head-1105、audit-paused-1105、playtest-1105、`decisions/2026-11-05-fable-three.md`，以及 content-review-2026-10-27 底下的 fable-\*。這些都被 SESSION-LOG 連著，而且日期是今天。

## 連結影響

做法：掃所有保留的 md 和 json，把相對連結解析後，比對 A～C 的刪除集。結果是 39 個檔、176 個連結會斷：

- 資料檔：`engine-backlog.json` 70（`來源` 欄）、`planning-roadmap.json` 7、`specs/core/constraints.json` 7。處理方式是改成純文字線名加 commit。
- 導航：CLAIMS 13、handoffs/README 10、SESSION-LOG 8、WAIT_USER 3、engine-backlog.md 3、INDEX 1、notes/README 1、ROSTER 1。依新規則重寫，CLAIMS 的三張表直接清成空表。
- 內容與設計：content-review-2026-10-27 的 content／people 7、design-notes 17、art-review 4、`art/svg-study-1027` 4、audit-paused-1105 1、code-map.json 1；其餘約 22 個在 D 類檔內部，隨 D 的決定處理。依 archive 規則拿掉連結或改成純文字。
- 另外 `adoption.json` 有 131 個連結，靠搬檔而不是刪檔處理，用 fix_moved_links 改寫。

完成時要符合兩條：`bash wf/tools/wf-lint.sh --strict .` 的 broken 不多於基準的 2；`grep -rn 'handoffs/done' --include='*.md' wf | wc -l` 等於 0。
