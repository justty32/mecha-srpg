# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-mech2 | `content/base/{frames,bodyplans,components,abilities,effects,lineages,research,markets,world/models}/` 新檔（effects 限 `m2-` 前綴；frames 不含 bio／corpse）、既有 `world/markets`／`world/lineages` 只插入、`content/lore/` 機甲相關**新檔**（既有 lore 檔與 timeline 屬 lead-tone-fix，不動）、`content/batches/2026-10/mech2-*`、`content/index/`、`test/golden/`＋`test/campaigns/`＋`src/ops/sim/fixtures/`（僅重錄時，錯開他線）、`wf/workflows/dispatch/handoffs/lead-mech2/`、engine-backlog 追加 | src、specs、design-notes；lead-tone-fix／lead-kaiju2 登記的檔 | 2026-10-26 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
