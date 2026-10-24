# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-grid（Opus 領導；工人 codex `cx-grid-*`） | `src/ops/`（全目錄）；`src/ui-adapter/ops/`、`src/ui-adapter/dom/board.ts` 與新抽的 `GridView` 共用檔（大地圖面板）；`src/mcp/campaign*.ts`（營運視圖跟著遷移）；`test/campaigns/`（黃金重產）、`e2e/ops-*.spec.ts`；`content/base/world/` 的**結構檔**：`nodes/`→`places/`（git mv＋改 id）、`routes/`、`ferry.json`→`lanes/`、新資料夾 `maps/` `places/` `lanes/` `regions/` `wterrains/` `actors/`、`actions/ops-world.json`、`campaign-start/`，以及 `markets/` `recruit-pools/` `factions-ops/` `forces/` `operations/` `actions/` `templates/default.json` 裡的**結構鍵與 id 引用**（`node/…`→`place/…`、`transferNode`→`transferPlace`、事件型別鍵改名；不動文字）；`package.json` 的 scripts（不加依賴）；`wf/workflows/dispatch/handoffs/lead-grid/` | `src/ai/`（lead-tune）；content 既有檔的文字欄（lead-rename；`nodes/*.json` 的 name 在第二段 git mv 前請先改或之後重套）；lead-content 新增的 events／templates 等新檔不改（`where:"node"／"route"` 由程式相容為 place／field）；`content/lore/` | 2026-10-24 |
| lead-reconcile（Opus；工人 codex `cx-rc-*`） | `design-notes/world/`、`terms*`、`tide-sky/lore.md`；`specs/world/`；world-pillars；`content/lore/style.md`；`handoffs/talk-world/HANDOVER.md`、`handoffs/lead-reconcile/`；engine-backlog 追加；`content/lore/`＋`content/base/` 文字欄（polish 批次，lead-grid 結構檔除外）、`content/batches/2026-10/rc-*`、`content/index/` | lead-grid 全部領地 | 2026-10-24 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
