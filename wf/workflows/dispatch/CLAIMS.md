# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-fill（Opus，lore 填充層） | 新增：`content/lore/places/`、`content/lore/events/` 下本線新建檔；追加：`content/lore/timeline.json`（只追加）；小修文字（黑幫城市歸屬）：`content/lore/places/chittagong.json`、`factions/chittagong-breakers.json`；`content/batches/2026-10/fill-*.json`、`content/index/`（本線批次重產）；第 0 步：`design-notes/world/city-types.md`、`polity.md`、`history-nodes.json`；`history-orphans.json`（標已填）；`wf/workflows/dispatch/handoffs/lead-fill/`、`codex-batches.json` 追加列 | lead-aegir 登記的檔（埃吉爾、鹽鷗、歐傘）；既有 lore 檔不改（bay-of-bengal-campaign、migrant-split 不重寫）；src、specs | 2026-10-26 |
| lead-aegir（Opus，埃吉爾認主與歐傘填充） | 新增：`content/lore/events/{aegir-wakes,aegir-lien,first-bid-sheet}.json`、`content/lore/factions/{euro-umbrella,inner-sea-houses}.json`、`content/lore/places/{genoa-yards,alpine-shell}.json`；修改（只插入或小修文字）：`content/lore/factions/salt-gull.json`、`characters/molly-van-den-berg.json`、`places/{skagerrak-shell,rotterdam-roost,hamburg,saint-malo,istanbul}.json`；追加：`content/lore/timeline.json`（只追加）、`engine-backlog.json`、`codex-batches.json`；`content/batches/2026-10/ag-*.json`、`content/index/`（本線批次重產）；`design-notes/world/aegir.md`；`wf/workflows/dispatch/handoffs/lead-aegir/` | lead-fill 登記的檔（city-types、polity、history-nodes、其新建 lore 檔）；src、specs | 2026-10-26 |
| lead-fill-am（Opus，lore 填充層：南北美洲） | 新增：`content/lore/{factions,places,events,characters}/` 下本線新建檔（檔名清單見各批 manifest `content/batches/2026-10/am-*.json`）；修改（只插入）：`content/lore/places/{montreal,mexico-city,sao-paulo-blight,ring-road,great-lakes-mycelium,yukon-shell,quito,titicaca-ruin}.json`、`factions/{quito,ring-caravan}.json`；追加：`content/lore/timeline.json`（只追加）、`codex-batches.json`、`engine-backlog.json`；`history-orphans.json`（標已填）；`content/batches/2026-10/am-*.json`、`content/index/`（本線批次重產）；`wf/workflows/dispatch/handoffs/lead-fill-am/` | 他線登記的檔；既有 lore 不重寫（shell-society、xingtian、remnant-wings、selene 等不動）；src、specs、design-notes | 2026-10-26 |
| lead-fill-af（Opus，lore 填充層：撒南非洲＋北非＋西亞） | 新增：`content/lore/{factions,places,events,characters}/` 下本線新建檔（檔名清單見各批 manifest `content/batches/2026-10/af-*.json`）；修改（只插入）：`content/lore/places/{nairobi,accra,lagos-blight,green-line}.json`、`factions/{nairobi,accra,green-line}.json`；追加：`content/lore/timeline.json`（只追加）、`codex-batches.json`、`engine-backlog.json`；`history-orphans.json`（標已填）；`content/batches/2026-10/af-*.json`、`content/index/`（本線批次重產）；`wf/workflows/dispatch/handoffs/lead-fill-af/` | 他線登記的檔（istanbul 歸 lead-aegir）；既有 lore 不重寫（league、remnant-wings、tide-creed、selene 等不動）；src、specs、design-notes | 2026-10-26 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
