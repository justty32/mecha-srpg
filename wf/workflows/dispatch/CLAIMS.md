# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-fill-ea（Opus，lore 填充層：中日韓俄＋東北亞與中亞邊緣） | 新增：`content/lore/{factions,places,events,characters}/` 下本線新建檔（檔名清單見各批 manifest `content/batches/2026-10/ea-*.json`）；修改（只插入）：`content/lore/factions/{shell-wardens,busan}.json`、`places/{golmud-nest,yakutsk-bed,busan}.json`；追加：`content/lore/timeline.json`（只追加）、`codex-batches.json`、`engine-backlog.json`；`history-orphans.json`（標已填）；`content/batches/2026-10/ea-*.json`、`content/index/`（本線批次重產）；`wf/workflows/dispatch/handoffs/lead-fill-ea/` | 他線登記的檔；既有 lore 不重寫（kuafu、golmud-split、gyeongju-contest、third-blade、selene 等不動）；src、specs、design-notes | 2026-10-26 |
| lead-fill-kaiju（Opus，怪獸填充：二名之夜、物種、蝕域生態） | 新增：`content/lore/events/{landlord-sits,red-eye-first-seen,white-night-first-seen,first-nest-taken,star-grave-named,last-vesper-named}.json`（第二批另列於 `kj-*` manifest）；`content/base/` 下怪獸新檔（`monsters/nestmother-{c,b}.json`；新物種的 `species/`、`bodyplans/`、`frames/{bio,corpse}-<物種>.json`、`monsters/`、`abilities/kx-<物種>-*`、`effects/kx-<物種>-*`，檔名見 `kj-*` manifest）；修改（只插入）：`content/base/species/nestmother.json`、`content/base/world/rifts/{alien,insect}.json`；修改文字：`content/lore/factions/rift-beasts.json` 的 body；追加：`content/lore/timeline.json`（只追加，既有怪獸條目只補 `event` 欄）；重錄時 `test/campaigns/*.json`、`test/golden/`、`src/ops/sim/fixtures/campaign-hash.json`；`content/batches/2026-10/kj-*.json`、`content/index/`（重產）；`history-orphans.json`（標已填）、`codex-batches.json`／`engine-backlog.json` 追加列；`wf/workflows/dispatch/handoffs/lead-fill-kaiju/` | 他線登記的檔（yakutsk-bed 歸 ea、nairobi／lagos-blight 歸 af、sao-paulo-blight／great-lakes 歸 am）；既有 lore 事件不重寫；既有怪獸數值；src、specs、design-notes | 2026-10-26 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
