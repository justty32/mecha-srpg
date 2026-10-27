# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

2026-10-27 核對：下列四線均為暫停、未完成行政收線，不代表目前有工人在跑；內容入庫與驗收狀態以 [STATE](handoffs/STATE.md) 為準。small 已於 `69924b0` 入庫，本 checkout 缺該線 report；公司僅盤點，整合驗收留回家。

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `lead-bigfill` | 見下「現役細目」 | 見下「現役細目」 | 2026-10-26 |
| `lead-fill-pilots` | 見下「現役細目」 | 見下「現役細目」 | 2026-10-26 |
| `lead-fill-gear` | 見下「現役細目」 | 見下「現役細目」 | 2026-10-26 |
| `lead-small`（暫停 2026-10-26 晚）| 見下「現役細目」 | 見下「現役細目」 | 2026-10-26 |
| `lead-world-life-1027` | 見下「六類填充」 | 其他線領地與引擎唯讀 | 2026-10-27 |

| `lead-world-next-1027`（內容已帶回，完整驗收待回家） | `wn-*` 五類新內容、獨立 worktrees、批次帳本、索引與本線報告 | 舊內容與其他線唯讀 | 2026-10-27 |

| `lead-world-more-1027`（內容已帶回，驗收待回家） | `wm-*` 新內容、隔離區、批次、索引及本線報告 | 舊內容及其他線唯讀 | 2026-10-27 |

### 現役細目

**第4至7輪 `lead-world-more-1027`**：24概念／36新JSON已帶回及暫存，索引完成，領導與子agent均已結束。全部draft、未commit，worktrees保留；整合與平衡待回家。詳見 [交付報告](handoffs/lead-world-more-1027/REPORT.md)。

**六類填充 `lead-world-life-1027`**（創作與查重已完成，無運行中工人；34 概念、52 個新 JSON 與六條年表已全部帶回，完整驗收待回家）：astra 規劃、sol 六類分批、同時最多三工人。各批僅可寫 repo 內 `.git/wf-worktrees/wl-{mechs,monsters,characters,places,events,factions}-1027/` 的 manifest 允許路徑與 `handoffs/lead-world-life-1027/` 對應類別報告；主線管理 `content/batches/2026-10/wl-*-1027.json` 與收件。2026-10-27 使用者授權年表 WSL MODE 誤報本次例外手動帶回，原 gate 失敗歷史保留，並非改為通過。全部 draft、未 commit；具體六份交接書為 `handoffs/wl-*-1027.md`。events 只准插入年表，其他不改舊內容；不安裝，整合驗收／試玩／平衡留回家。

表格只放線名，完整領地寫在這裡（表格超過 1 KB 會被 wf-lint 判成大表）；收線時連同表格那格一起刪。

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
