# next-tidy — 重構拆檔與 tidy 清單（2026-10-26 lead-tidy2 做完一輪）

[handoffs](README.md)｜交棒 [STATE](STATE.md)｜流程 [tidy](../../tidy/README.md)、[refactor](../../refactor/README.md)｜結構 [STRUCTURE](../../../STRUCTURE.md)｜[本輪清單](lead-tidy2/done-this-round.md)

下次動手前重跑 `bash wf/tools/wf-lint.sh --strict .` 與 `git worktree list` 取新數字；刪檔一律先問使用者。

## 已完成（2026-10-26，lead-tidy2）

<!-- wf-nav -->
- [inbox REPORT](lead-tidy2/inbox/REPORT.md)（7a00591）：已收線 30 封信 ack、orders 5 份與團隊信箱 9 個歸檔 `wf/inbox/done/2026-10-26/`；ROSTER 已收線格封存，入口 4.4 KB。
- 拆檔（a6b2781）：近 8 KB 文件 15 份按語意拆成入口＋子檔，措辭不改、錨點 0；design-notes terms／scale／essence、world 六份、ops 四份、core data-model-mech、MCP README；CLAIMS 長格移到「現役細目」。見 [split-a](lead-tidy2/split-a/REPORT.md)／[split-b](lead-tidy2/split-b/REPORT.md)／[split-c](lead-tidy2/split-c/REPORT.md)。
- [handoffs REPORT](lead-tidy2/move/REPORT.md)（4472b98）：已收線 32 個線資料夾移 `done/<收線日>/`，修連結與 manifest reportDir；done 索引補五線。根層保留活文件、現役線、永久留原處的 lead-codex-pilot、plan-*、talk-*；[moves.tsv](lead-tidy2/moves.tsv)。
- [程式重構 REPORT](lead-tidy2/code/REPORT.md)（d65eb1c）：MCP battle／campaign、百科 cards／mount.test 四檔按職責拆出 battle-hub／campaign-support／card-builder／pages.test，原匯出不變；`npm test` 966／966。

上一輪（2026-10-24，lead-tidy）六節整理與證據見 [done/README 的 lead-tidy 列](done/README.md)。

## 殘留（下次）

<!-- wf-nav -->
- `BIGLIST-LINKS` warning：`legacy/docs/README.md`；legacy 只讀，加 `<!-- wf-nav -->` 需使用者同意。
- `src/ai/adapters/rules-adapter.ts:3`、`src/rules/index.ts:4` 註解舊路徑 `handoffs/lead-impl-ai`／`lead-impl-rules`：下次動這兩檔的程式線順手改為 `handoffs/done/2026-10-24/`。
- `handoffs/lead-codex-pilot/` 永久留原處（四份 batch manifest 指向它）。
- code-map：`wf/tools/content_*` 的列由 content 線補；world-grid 已列在 code-map.json ops 列。
- 待使用者決定刪除：`handoffs/done/2026-10-24/lead-tidy/trash/` 約 9.2 MB（7 線 codex log／pid、repo 根誤建 pilot tmp），清單見該線 REPORT。
- 仍超過 300 行的程式檔都在 lead-engine-next 領地，收線後再拆：`src/ops/sortie/scenario.ts` 382、`ui-adapter/vm/controller.ts` 345、`ops/world/actors.ts` 342、`ops/sim/policies.ts` 329、`sim/probe.ts` 323、`core/types-def.ts` 313、`content/loader.ts` 307、`test/ai/intent.test.ts` 301。
- `content/lore/README.md` 8131 B 逼近上限（lead-bigfill 領地，收線後拆）；一批 7.5–8.1 KB spec／流程檔（`specs/core/ai.md`、`inbox/README.md`、`content/lore/style.md` 等）下次動前先拆。
- `.gitignore` 的 `handoffs/*/trash/` 只蓋一層；搬進 `done/<日>/<線>/trash/` 不會被忽略，調度者決定要不要加 `handoffs/done/*/*/trash/`。
- `content/batches/2026-10/` 92 份清單扁平放，可按線分子資料夾，先確認 content 工具找清單方式。
- 封存檔與歷史 REPORT 正文的舊 handoffs 路徑照規則不改，清單 `handoffs/lead-tidy2/move/residual-paths.json`。
- 驗收 `find … -size +8192c` 若未排除 `dispatch/handoffs/`（REPORT 證據）與 gitignored `wf/inbox/.state/` 會數到數百個；建議範圍與 wf-lint 一致（它本來排除 handoffs）。
