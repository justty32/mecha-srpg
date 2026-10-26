# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| sonnet-rep-tune | `content/base/world/actions/board-presence.json`、`test/campaigns/`、`wf/workflows/common/code-map.json` | 其餘唯讀 | 2026-10-26 |
| lead-tone-fix | `content/lore/{characters,events,factions,places,eras}/*.json`、`content/lore/timeline.json`、`content/lore/glossary.json`（不含 check.ts、README、style）、`content/batches/2026-10/tf-*.json`、`content/index/lore-*.json`＋`_summary.json`／`_batches-2026-10-tf.json`、`wf/workflows/planning/design-notes/world/`（必要時）、`wf/workflows/dispatch/handoffs/lead-tone-fix/`、`handoffs/fill-rulings.md`（只追加）、`handoffs/done/README.md`（只追加）、`design-notes/world/history-orphans.json` | `content/base/`、`src/`、specs 唯讀；lore 機甲／怪獸檔若 lead-mech2／lead-kaiju2 已動先協調 | 2026-10-26 |
| lead-mech2 | `content/base/{frames,bodyplans,components,abilities,lineages,research,markets,world/models}/` 新檔、`content/lore/` 機甲相關新檔、`content/batches/2026-10/mech2-*`、`content/index/`、`test/golden/`＋`test/campaigns/`＋`src/ops/sim/fixtures/`（僅重錄時，錯開他線）、`wf/workflows/dispatch/handoffs/lead-mech2/`、engine-backlog 追加 | src、specs、design-notes；lead-tone-fix／lead-kaiju2 登記的檔 | 2026-10-26 |
| lead-kaiju2 | `content/base/{species,monsters,bodyplans,abilities,aiprofiles,effects,world/beasts,world/rifts,world/encounters}/` 新檔與 rifts 名單插入、`content/base/frames/{bio,corpse}-*` 新檔、展示用 `content/base/scenarios/` 新檔、`content/lore/` 怪獸相關新檔（＋timeline.json 只插入）、`content/batches/2026-10/kaiju2-*`、`content/index/`、`test/golden/`＋`test/campaigns/`＋`src/ops/sim/fixtures/`（僅必要重錄，錯開他線）、`wf/workflows/dispatch/handoffs/lead-kaiju2/`、engine-backlog 追加、history-orphans | src、specs、design-notes；lead-tone-fix／lead-mech2 登記的檔；萬潮葬王 | 2026-10-26 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
