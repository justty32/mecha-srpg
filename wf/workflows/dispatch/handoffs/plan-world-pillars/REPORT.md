# REPORT — plan-world-pillars：世界觀設計支柱（頂層代存，2026-10-24）

STATUS：**DONE**。commit `958983f`（5 檔）。

## 產出
`wf/workflows/content/world-pillars.md`（入口，含十句話版與最常見的違反）＋`world-pillars/{world,mechs,bio-battle}.md`。守則 31 條：W1–W9 世界與營運、M1–M11 機甲與人物、B1–B11 怪獸與戰鬥；每條：原則／為什麼（使用者原話）／做／不做／→ design-notes 原段落。導航：`lore-text.md` 開頭一行、`content/README.md` 說明段後一行（被 lead-codex-pilot 的 `347f760` 一併帶入）。

## 發現的矛盾（頂層 2026-10-24 處理）
1. 古代機「認主深了到 SS」（spec `mech-lifecycles.md`、`ruins-and-ancient.md`）vs「SS／SSS 先不要設計」→ 問使用者。
2. 大地圖張數：design-notes「每大洲一張」、spec 六張（五洲＋月面，南極被吞）、lore `continent` 九選一（含南極、軌道）且 check 要求每洲 ≥3 地點 → 頂層定：方格圖六張；lore 的南極、軌道是地點分區，不另出圖。
3. `decisions/2026-10-24-bio-ui.md` 導航過期（應指 `design-notes/bio-mechs.md`）→ 收尾線修。
4. 機械系高階命名「A～SS」→ 內容一律寫 A–S。
5. 十分律原話只說「飛機與戰鬥機」，spec／numeric-bands 擴讀成所有 `conventional-arms` → 問使用者。
6. `ruins-and-ancient.md`「膽小的馴獸人」用字 → 交潤飾。

## 驗證
`wf-lint --strict` 本線檔 0 違規；`find_big_lists --min 1024` 0；design-notes 錨點以 check_anchors 驗過。
