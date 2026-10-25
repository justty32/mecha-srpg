# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-polish（cx-dl-0N） | `content/lore/`（batch 白名單敘述欄）、`content/index/`、`content/batches/2026-10/dl-*`、`lead-decide-land/b5/`、codex-batches、STATE、done 索引、SESSION-LOG、本列、ROSTER 本格 | `src/`、`test/`、`content/base/`、spec、design-notes；不刪檔 | 2026-10-25 |
| lead-cockpit（工人 cx-cockpit-core／cx-cockpit-growth） | `src/`、`test/`、`e2e/`、`schemas/`、`content/base/`（情境、單位、規則、人物資料）、`content/index/base-*.json`（重產）、黃金檔、`specs/core/`（rules-people 等本線相關段）、`specs/ops/`（time-and-tick、constraints-ops 本線相關段）、`specs/world/pilots.md`、`design-notes/world/`（drive、essence、scale、terms 與拆出的子檔）、`wf/workflows/content/{README.md,ancient-people.md,templates.json}`、`common/code-map.json`、engine-backlog、`handoffs/lead-cockpit/`、`handoffs/{STATE.md,done/README.md}`、SESSION-LOG、CLAIMS 本列、ROSTER 本格、`wf/inbox/` 本線信件 | `content/lore/` 敘述欄（lead-polish 在跑）、AGENTS.md／CLAUDE.md；不刪檔、不裝依賴、不做經濟／士氣數值調校 | 2026-10-25 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
