# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 活躍工人

- playable-ops-1029（sol）：營運與已授整合測試修正，精確範圍及限制見 [scope](handoffs/playable-ops-1029/scope.json)；已交待隊長增量驗證，無 runner，不碰使用者 Vite。子 gate 30 件／2 MB；全輪產品 gate 162 件（含9 index）／25 MB。
- playable-design-1029（astra）：凍結default demo硬剛20回合平衡契約，不寫產品。

- playable-review-1029（sol，唯讀審查中）：僅本輪diff與直接依賴，不跑測試；只寫自己REPORT。


- playable-engine-1029（sol，修正中；本輪附件交付gate90件，產品162門檻不變）：精確授權與限制見 [交接書](handoffs/playable-engine-1029.md)及其 scope；五級移動與原default 4v4十回合重創驗收依新spec。本線總交付90件 gate僅擴附件；整輪產品162件／25 MB不變。UI不得改型別。


10/29 `lead-playable-1029`：sol 隊長接手完整遊玩整合；可寫 `src/`、`content/base/`、`content/index/`、`test/`，限本輪交接所列功能及阻斷問題；wf 管理路徑與根目錄條件授權見 [交接書](handoffs/lead-playable-1029.md)。子線精確鎖檔由隊長追加，最多 3 平行工人；舊暫停線無正在執行的工人。

`expansion-1028-investigate-ops`已終局（sol、子代理0）：三條唯讀資料流與optional可行性兩份報告已交，不測試／不改內容；契約歸當日done。

本輪expansion-1028所有產出／後查agents已終局，無本輪現役工人；領導單獨串行驗收與打包中。契約已歸 [當日done](handoffs/done/2026-10-28/expansion-1028-README.md)，報告／manifest沿原reportDir，不改舊暫停線。



10/28 增量審閱、Canvas `69403bc2`、真 3D `573575ec` 已完成，REPORT 均在當日 done。主線已關閉今天原生 agents（證據見 [收工記錄](../../notes/close-2026-10-28.md)）；本輪子代理 0，有界文件收尾完成。此處「暫停」與「待驗收」不是派工或占用中的領地。

## 世界觀三批待整合驗收

七輪創作與限定查重完成，82 概念／124 新 JSON／六條年表已提交 `8ba72b4`，`c9ce4e8` 補記錄；全部 draft。工人已結束，隔離 worktrees 保留，整合驗收下次再做；不在此保留已結束工人的現役領地。

[待驗收摘要](handoffs/tidy-world-1027/pending.md)｜[第一輪](handoffs/lead-world-life-1027/README.md)｜[第二三輪](handoffs/lead-world-next-1027/README.md)｜[第四至七輪](handoffs/lead-world-more-1027/README.md)

## 四條舊線暫停，未收線

以下保留原領地契約與未完成行政收線事項，並非有工人正在執行。續線需主線核對領地；完成證據與接續見 [STATE](handoffs/STATE.md)。small 已在 `69924b0` 入庫，`lead-small/report.md` 是本機未追蹤暫停報告，尚未入庫、下次需核對；仍不能視為已驗收收線。

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

## 本輪 10/28 接續

本輪所有agent已DONE/close，現役0、runner0；R2八lore已提交ff949a2f，base凍結3a20a436，CM未接受。suite1031案／1022過／9同基準敗，wiki6/6；CM後續配方只存未實作建議。詳[收尾入口](../../notes/close-night-2026-10-28.md)。
