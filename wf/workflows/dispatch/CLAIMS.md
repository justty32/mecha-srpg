# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-tune（Opus 領導；工人 codex `cx-tune-*`） | `src/ai/`（全目錄）；`src/rules/effects.ts`＋`effects.test.ts`；平衡用既有數值：`content/base/` 下的 `aiprofile/`、`monster/nestmother-*`、人類遭遇編成與 `budgetByGrade` 所在檔（動前逐檔查本表與 lead-rename 是否持有）；黃金／hash 重產（若被 AI 改動牽動，在 commit 說明）；`wf/workflows/dispatch/handoffs/lead-tune/` | **不寫 `src/ops/`**（lead-grid 領地，只讀；營運派遣邏輯若要改先發信協調）；不寫 lead-rename／lead-content 持有的 content 檔；文字潤飾不做 | 2026-10-24 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
