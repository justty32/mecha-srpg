# next-tidy — 重構拆檔與 tidy 清單（2026-10-24 lead-tidy 做完一輪）

[handoffs](README.md)｜交棒 [STATE](STATE.md)｜流程 [tidy](../../tidy/README.md)、[refactor](../../refactor/README.md)、結構原則 [STRUCTURE](../../../STRUCTURE.md)｜本輪報告 `lead-tidy/REPORT.md`（頂層代存）

2026-10-24 收尾時盤點的六節清單，已由 lead-tidy 跑完一輪。下面分「已完成」與「殘留」；下次動手前重跑 `bash wf/tools/wf-lint.sh --strict .` 與 `git worktree list` 取新數字，刪檔一律先問使用者。

## 已完成（2026-10-24，lead-tidy）

- **wf-lint**：`OVERSIZE ROSTER.md`（24569 B）→ 已收線 38 格封存 `inbox/archive/ROSTER-2026-10-24-c.md`，入口 3.8 KB；`BIGLIST CLAIMS.md` → 已收線三列移除、歷史段改指 [done/README](done/README.md)。lint 從 `oversize=1 biglist=1` 降到全 0（只剩 2 條連結表 warning，見殘留）。
- **近 8 KB 檔**：design-notes `mechs.md`／`world.md`、`content/world-pillars/{mechs,world,bio-battle}.md`、`decisions.md`（2026-10-23 五筆）、`team-model.md`（分級與消耗速度表）、spec `core/data-model-world.md`、`ops/{battle-interface,data-model-factions-contracts,README,text-ui-contract,data-model-operations-war}.md` 都按主題拆成子檔，原路徑保留當入口、措辭不改、被錨定的標題留入口；`check_anchors.py` 0。
- **活狀態與收信**：`inbox/new/` 的 lead-gaps-ops REQUEST（`part:undefined`）已在 [engine-backlog](engine-backlog.md) → ack；`mail/` 7 格 41 封已收線工人信 ack，空信箱移除；`teams/` 已收的 ancient／content-monster／content-world／playtest 用 `inbox_team.sh close` 歸檔；已收線的 orders 移 `inbox/done/2026-10-24/orders/`；`done/2026-10-24/teams/` 16 隊名冊進版控。`inbox_ack.sh --state` 預設改寫 `wf/inbox/done/ack-log.md`，STATE.md 不再混 ack 流水。
- **handoffs**：43 個已收線 `<線名>/` 與 `plan-ops-spec.md` 以 `git mv` 移 `done/<收線日>/`（2026-10-23 四線放 `done/2026-10-23/`，跟它們的交接書同處），開 [done/README](done/README.md) 索引；`fix_moved_links.py` 修 49 檔；搬入的量測工具（`balance-probe.ts`、`bench-ops.ts`、`battle-bench.ts`、`scenario-measure.ts`、`anchored-tally.ts`、`sweep.ts`、`gen_maps.py`、`lint_world.py`）相對 import 補兩層並實跑確認；`testing-checks.json`、content 子流程檔、e2e 註解的工具路徑同步。7 個 `trash/` 與 repo 根 `tmp/` 移進 gitignored 的 `lead-tidy/trash/`（待使用者決定刪不刪）。
- **worktree**：lead-codex-pilot 收線時已自行清掉，`git worktree list` 只剩主工作樹。
- **文件同步**：`decisions/2026-10-24-bio-ui.md` 導航改指 `design-notes/bio-mechs.md`（UI 部分指 `mechanics.md`）；spec 殘留三處（`core/rules-battle-flow.md:49` 戰機、砲兵→鐵翼、鐵龜；world-grid json「兩百公里」→「十格」（月面一格 20 km）；`specs/world/README.md` 月弓改 2043 與 lore 一致）；`planning.md` 想法表清空；roadmap 移除已完成 3 列；testing-checks 與 `package.json` scripts 對過（`test:dom`／`test:e2e` 寫在 testing.md）。pilot 收線後追加：`content/README.md` 件數重數（frames 7→89 等，補 `world/` 一列）並標 wf-nav；`content/acceptance-playtest.md` 的 sweep 跑法（`--content` 只吃單一目錄）與 MCP 連線（改 stdio，同 playtest.md）修正；SESSION-LOG 的 pilot 行改已收線。

## 殘留（下次）

- `BIGLIST-LINKS`（warning）：`legacy/docs/README.md`（legacy 只讀，要加 `<!-- wf-nav -->` 需使用者同意動 legacy）。
- `src/ai/adapters/rules-adapter.ts:3`、`src/rules/index.ts:4` 的註解仍寫舊路徑 `handoffs/lead-impl-ai`／`lead-impl-rules`（現在在 `handoffs/done/2026-10-24/`）；下次動那兩檔的程式線順手改。
- `handoffs/lead-codex-pilot/` **永久留原處**（四份 batch manifest 指向它）；`lead-wrapup/`、`lead-tidy/` 等 lead-wrapup 第二階段（`codex-handover.md`）寫完後移 `done/2026-10-24/` 並在 done/README 追加列（lead-tidy 的 trash 先由使用者決定刪除）。
- [STATE](STATE.md)「現役」段仍寫 pilot 進行中、wrapup 待第二階段——交給 lead-wrapup 第二階段改。
- code-map：world-grid 落地後補列；`wf/tools/content_*` 的列由 content 線補。
- 待使用者決定刪除：`handoffs/lead-tidy/trash/`（約 9.2 MB：7 線的 codex log／pid 與 repo 根誤建的 pilot `tmp/`，清單在 lead-tidy REPORT）。
