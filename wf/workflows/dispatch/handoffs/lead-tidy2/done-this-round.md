# lead-tidy2 本輪清單（給 cx-td2-state 用）

[lead-tidy2](common.md)

## 已完成（2026-10-26，lead-tidy2）

- inbox（7a00591）：已收線 30 封信 ack、orders 5 份與團隊信箱 9 個歸檔 `wf/inbox/done/2026-10-26/`；ROSTER 已收線格封存 `inbox/archive/ROSTER-2026-10-26.md`，入口 4.4 KB。
- 拆檔（a6b2781）：近 8 KB 文件 15 份按語意拆成入口＋子檔，措辭不改、錨點 0——design-notes `terms`、`world/scale`、`world/essence`；specs/world `setting`、`operations`、`factions`、`README`（拆出 `world-history.md`）、`rifts-and-territory`、`machine-souls`；specs/ops `time-and-tick`、`data-model-faction-rnd`、`architecture-ops`、`mercenary-contracts`；specs/core `data-model-mech`；`src/mcp/README.md`（9962 B 超標）。CLAIMS 現役表長格移到「現役細目」段（表格 >1 KB 會被 lint 判大表）。
- handoffs（4472b98）：已收線 32 個線資料夾移 `done/<收線日>/`（moves.tsv 在 `handoffs/lead-tidy2/moves.tsv`）；`fix_moved_links` 與手修（content/batches 清單的 reportDir、engine-backlog、STATE 等）；done 索引補 lead-grid、lead-pilot-essence、lead-rename、lead-tidy、lead-wrapup 五列。handoffs 根層現在只剩活文件、現役線、`lead-codex-pilot`（永久留）、`plan-*`、`talk-*`。
- 程式重構（d65eb1c）：`src/mcp/battle.ts`、`campaign.ts`、`ui-adapter/vm/wiki/cards.ts`、`dom/wiki/mount.test.ts` 按職責拆出 `battle-hub`、`campaign-support`、`card-builder`、`pages.test`，原匯出不變；`npm test` 966／966。

## 新殘留（加進 next-tidy 殘留段）

- 仍超過 300 行的程式檔都在 lead-engine-next 領地，等它收線再拆：`src/ops/sortie/scenario.ts` 382、`ui-adapter/vm/controller.ts` 345、`ops/world/actors.ts` 342、`ops/sim/policies.ts` 329、`sim/probe.ts` 323、`core/types-def.ts` 313、`content/loader.ts` 307、`test/ai/intent.test.ts` 301。
- `content/lore/README.md` 8131 B 逼近上限（lead-bigfill 領地，收線後拆）；另有一批 7.5–8.1 KB 的 spec／流程檔（`specs/core/ai.md`、`inbox/README.md`、`content/lore/style.md` 等），下次動前先拆。
- `.gitignore` 的 `handoffs/*/trash/` 只蓋一層，搬進 `done/<日>/<線>/trash/` 的不會被忽略——調度者決定要不要加 `handoffs/done/*/*/trash/`。
- `content/batches/2026-10/` 92 份清單扁平放，可按線分子資料夾（要先確認 content 工具怎麼找清單）。
- 被封存檔與歷史 REPORT 正文裡的舊 handoffs 路徑照規則不改（清單 `handoffs/lead-tidy2/move/residual-paths.json`）。
- 驗收用的 `find … -size +8192c` 若不排除 `dispatch/handoffs/`（工人 REPORT 證據）與 gitignored 的 `wf/inbox/.state/`，會數到數百個——wf-lint 本來就排除 handoffs，建議驗收命令照 lint 的範圍。
