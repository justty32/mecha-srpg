# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 活躍工人

本次整理交付時無活躍世界觀創作工人；本線整理亦已結束。此處「暫停」與「待驗收」不是派工或占用中的領地。

## 世界觀三批待整合驗收

七輪創作與限定查重完成，82 概念／124 新 JSON／六條年表已提交 `8ba72b4`，`c9ce4e8` 補記錄；全部 draft。工人已結束，隔離 worktrees 保留，整合驗收回家再做；不在此保留已結束工人的現役領地。

[待驗收摘要](handoffs/tidy-world-1027/pending.md)｜[第一輪](handoffs/lead-world-life-1027/README.md)｜[第二三輪](handoffs/lead-world-next-1027/README.md)｜[第四至七輪](handoffs/lead-world-more-1027/README.md)

## 四條舊線暫停，未收線

以下保留原領地契約與未完成行政收線事項，並非有工人正在執行。續線需主線核對領地；完成證據與接續見 [STATE](handoffs/STATE.md)。small 已在 `69924b0` 入庫，但本 checkout 缺 report，不能視為已驗收收線。

**`lead-bigfill`**　暫停（2026-10-26 晚）→ 接續見 `handoffs/lead-bigfill/report.md`。可寫：`content/lore/` 新檔＋既有檔只插入（含 `timeline.json`，插入前看 HEAD）、`content/base/world/` 下契約／事件／對話／遭遇／新聞／地點等可玩內容（新檔＋只插入；**不碰** AI 與萬潮葬王相關檔）、`content/batches/2026-10/bf-*.json`、`content/index/`（git add 後重產）、`wf/workflows/dispatch/handoffs/lead-bigfill/`、engine-backlog 只追加新列；黃金重錄（可玩內容整批後一次，與 lead-engine-next 錯開）。唯讀／禁區：`src/`、`specs/`、`design-notes/`、萬潮葬王（`monster/tidespine-chittagong` 等）、AI 檔。

**`lead-fill-gear`**　【暫停（2026-10-26 晚）→ 接續見 report.md；黃金重錄未收（fg-golden）】可寫：`content/base/components/`、`content/base/abilities/`、`content/base/effects/`（只新增，檔名用 `fg-` 前綴軌道碼）、`content/base/world/markets/`（新檔＋只插入既有上架）、`content/base/world/services/`、`content/base/world/research/`（新檔）、loot／掉落相關資料（盤點後明列）、`content/batches/2026-10/fg-*.json`、`content/index/`（git add 後重產）、`wf/workflows/dispatch/handoffs/lead-fill-gear/`；黃金重錄（整批後一次；重錄前在此加「黃金重錄中」）。唯讀／禁區：`src/`、`specs/`、`design-notes/`、`content/lore/`、AI 檔、萬潮葬王相關、既有 id 檔的數值。

**`lead-fill-pilots`**　可寫：`content/base/persons/`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/world/names/`、`content/base/soultrees/`（必要時）、`content/lore/characters/`（新檔＋只插入）、`content/batches/2026-10/fp-*.json`、`content/index/`（git add 後重產）、`wf/workflows/dispatch/handoffs/lead-fill-pilots/`、engine-backlog 只追加新列；黃金重錄（整批後一次）。唯讀／禁區：`src/`、`specs/`、`design-notes/`、AI 檔、萬潮葬王。 暫停（2026-10-26 晚）→ 接續見 report.md。

**`lead-small`**　可寫：`src/ops/world/lords.ts`、`src/ops/world/lords.test.ts`（北岸改區）；`content/base/factions/third-blade.json`、`content/base/world/factions-ops/third-blade.json`、`content/base/world/models/thirdblade-*.json`（只改 maker）、`content/base/world/contracts/ls-*.json`（新檔）、`content/batches/2026-10/ls-*.json`、`content/index/`（git add 後重產）、`test/campaigns/`＋`test/golden/`＋軌跡相依測試（黃金重錄，整批後一次）、`wf/workflows/dispatch/handoffs/lead-small/`。唯讀／禁區：其餘 `src/`、`specs/`、`design-notes/`、`content/lore/`、萬潮葬王資料檔（wanchao-script 不改）。

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
