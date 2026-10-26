# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `lead-engine-next` | 見下「現役細目」 | 見下「現役細目」 | 2026-10-26 |
| `lead-bigfill` | 見下「現役細目」 | 見下「現役細目」 | 2026-10-26 |

### 現役細目

表格只放線名，完整領地寫在這裡（表格超過 1 KB 會被 wf-lint 判成大表）；收線時連同表格那格一起刪。

**`lead-engine-next`**　可寫：`src/`（含測試）、`content/base/`、`content/index/`、`specs/`（最小必要）、`test/` 黃金與 fixtures、`wf/workflows/dispatch/handoffs/lead-engine-next/`、engine-backlog 第 57–61／68／73 列狀態。唯讀／禁區：`content/lore/`（sonnet-lore-insert）、`wf/workflows/content/mechs.md`。

**`lead-bigfill`**　可寫：`content/lore/` 新檔＋既有檔只插入（含 `timeline.json`，插入前看 HEAD）、`content/base/world/` 下契約／事件／對話／遭遇／新聞／地點等可玩內容（新檔＋只插入；**不碰** AI 與萬潮葬王相關檔）、`content/batches/2026-10/bf-*.json`、`content/index/`（git add 後重產）、`wf/workflows/dispatch/handoffs/lead-bigfill/`、engine-backlog 只追加新列；黃金重錄（可玩內容整批後一次，與 lead-engine-next 錯開）。唯讀／禁區：`src/`、`specs/`、`design-notes/`、萬潮葬王（`monster/tidespine-chittagong` 等）、AI 檔。

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
