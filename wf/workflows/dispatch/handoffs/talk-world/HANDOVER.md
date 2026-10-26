# talk-world 交棒摘要（2026-10-24，Fable 世界觀對談線）

[handoffs](../README.md)｜收線報告 [REPORT](REPORT.md)

> 由第一代 talk-world 寫、頂層代存；第二代接手維護第 2、4、5 節，2026-10-24 同日收線（使用者：「那些都隨意。弄一弄就差不多了」）。talk-world 已關閉，本檔改由 lead-reconcile 維護：2026-10-24 超過 8 KB，照 STRUCTURE「拆資料夾、原路徑當入口」把第 2–5 節搬進 `handover/`（第 2 節原話整段原樣搬移，只補記潮差概念作廢），第 4 節瘦身成指向 history-*.json 的指標。裁示落地：lead-world-land（已收線）、lead-history-lines（已收線）、lead-reconcile（待和解照建議）。

## 0. 這條線在做什麼

使用者想聊整個世界觀構建；只聊不改檔、不 commit、不改 spec／內容。聊出結論時以【可落地】列出要點，由頂層派人寫進 design-notes。背景：使用者重溫 Modern Warfare 初代三部曲，打動他的是錯綜複雜的局勢與主角的掙扎；他定了蝕潮用潮汐詞形容、天象以日月地三星為引配其他行星、天象效果不只強化。天象（plan-tide-sky）與局勢（plan-intrigue）各五題（2026-10-24 已定）。

## 1. 已讀材料（路徑）

- `AGENTS.md`、`wf/workflows/common/user.md`、`PROJECT.md`、`SPEC.md`
- `wf/workflows/planning/specs/world/`：README、setting、factions、rifts-and-territory、ruins-and-ancient、monsters、machine-souls、mech-lifecycles、operations（opening 未讀；monsters.json 未開）
- `wf/workflows/content/world-pillars.md` 與 `world-pillars/world.md`（W1–W9 索引；mechs／bio-battle 子檔只讀入口摘要）
- `wf/workflows/planning/design-notes.md`；`design-notes/world.md`＋`world/setting.md`、`world/rules.md`、`world/factions-and-map.md`；`design-notes/terms.md`；`design-notes/mechs.md`＋`mechs/bonds.md`、`mechs/ancient.md`、`mechs/mechanical.md`；`design-notes/bio-mechs.md`
- 天象：`design-notes/tide-sky.md`、`tide-sky/lore.md`、`tide-sky/mechanics.md`、`tide-sky/omen-effects.md`、`tide-sky/spec-proposal.md`、`tide-sky/omens.json`（15 列全讀）；REPORT `wf/workflows/dispatch/handoffs/plan-tide-sky/REPORT.md`
- 局勢：`design-notes/intrigue.md`、`intrigue/references.md`、`motives.md`、`fog.md`、`chain.md`、`crew.md`、`systems.md`、`arc-sample.md`、`intrigue/tide-sky.md`、`intrigue/motives.json`（20 列全讀）；REPORT `wf/workflows/dispatch/handoffs/plan-intrigue/REPORT.md`
- `content/lore/README.md`、`content/lore/style.md`；`content/lore/factions/*.json`（31 個，讀 id／name／type／summary／ideology）；`content/lore/timeline.json`（全部條目）；characters／events／places 只看檔名清單
- 用語定案表：`wf/workflows/planning/design-notes/terms-rename.json`（lead-rename 2026-10-24 收線，69 列）

## 2–5、7. 各節位置

<!-- wf-nav -->
| 節 | 檔 | 內容 |
|---|---|---|
| 2 | [handover/rulings.md](handover/rulings.md) | 使用者已拍板的原話（整段原樣；含 2026-10-24「都按照建議」「不用潮差＝威脅」補記） |
| 3 | [handover/numbers.md](handover/numbers.md) | 第一代提的世界尺度數字（v1）；v2 重算在 design-notes/world/scale（2026-10-24 已定） |
| 4 | [handover/open.md](handover/open.md) | 瘦身版：線與節點指向 history-*.json，留 1、1.5、5、6、7.5、7.7、7.9、8、9、10 條 |
| 5 | [handover/landing.md](handover/landing.md) | 【可落地】清單 A／A′／B |
| 7 | 已執行 | 八條長線派工草稿已由 lead-history-lines 完成，見其 [REPORT](../done/2026-10-24/lead-history-lines/REPORT.md) |

## 6. 對談語氣與使用者偏好

- 繁中、母語語感、一起構想的夥伴口吻，直接對使用者說，不寫報告腔。
- 短、先講結論；不要每段都是 bullet。
- 他問「要不要」時附可執行判準（門檻數字）與後果，讓他能改數字——所有數字都附開關，他很接受這種寫法。
- 他講話是零散即興的、一次一個想法，常用「...」，會直接否決（「太過依賴 MW 的後果」「實在太機械降神了」）、也會簡短肯定（「都對」「這兩個都好」）。順著他的話接，不要重新開大題；他沒回答的問題下一則再問一次就好，不要一直追。
- 他重視中文語感（避免直譯；「精粹」是他自己用的詞，照用）。
- 他喜歡把物理與政治接起來的推法（抵抗性→精粹→產能綁大潮→「沒人想要蝕潮結束」變成物理），這種「一刀修好好幾件事」的整理他會順著往下想。
- 世界觀工作方法：節點 → 線 → 填充（第 2 節），任何 lore 提案先給節點與線，不要先給大量條目。
- 禁區：不碰鍵盤滑鼠螢幕、不上網（要網路資料說出來由頂層派 codex）、不改 spec／內容。

新 session 接手時建議第一句：2026-10-24 數字 v2 與所有暫值題都已定（第 2 節末段 lead-settle 補記）；還沒有答案的只剩凡鐵數字、精粹矢價格、雙籤城權責、S 級能否墟出與 SS／SSS，加上第 4 節只有提案的第 5、6、7.5、7.7、7.8、7.9 條——從這幾題挑一題問他。
