# tide-sky／spec-proposal — 要改哪些 spec 段落、改成什麼（world 層已落筆，ops 層待引擎線）

[tide-sky 入口](../tide-sky.md)｜spec 入口 [specs/core](../../specs/core/README.md)、[specs/world](../../specs/world/README.md)、[specs/ops](../../specs/ops/README.md)

規矩：規劃線不直接改 spec，等使用者過目後由頂層落筆。**2026-10-24 使用者「就用暫定答案」：五題已定**；world 第 1–12 列由 lead-settle 照定案修正後落進 [specs/world/omens](../../specs/world/omens.md) 與相關 world spec（修正：連珠潮第 40 蝕月一次、不每 52；讖語失真是被蝕扭曲）；ops 第 13–20 列牽動引擎，列進 engine-backlog，spec 等引擎線一起落。段落標題照 2026-10-24 lead-rename 換詞後的檔（commit 506c18a），落筆時以當時標題為準。

目的：把「潮候／潮勢／星候」三層接進既有 spec，不推翻任何既有規則——28 日蝕月、初一十五漲潮、初七廿一平潮日、裂縫七態、蝕塊、蝕壓全部保留，只在每個「漲潮日做什麼」「放得過來多大」「長幾塊」的句子旁邊加潮勢與星候的修正，再補曆欄位、`omens/` 內容 kind、蝕曆面板與一列 constraints。

已抽到 [spec-proposal.json](spec-proposal.json)（20 列）。欄位：`序`（建議落筆順序）、`層`（world＝世界觀 12 列／ops＝營運規則 8 列）、`檔／段`（檔名與現行段落標題）、`改成什麼`（可直接落筆的句子或欄位）。

統計：world 12 列（rifts-and-territory 3、setting 2、operations 3、monsters 1、factions 2、ruins-and-ancient 1）；ops 8 列（time-and-tick 2、data-model-world-map 1、world-grid/rifts-on-grid 1、battle-interface／core scenario 1、content-format-ops/world 1、text-ui-contract 1、constraints-ops 1）。

## 落筆順序的理由

先改 world 的 rifts-and-territory 與 setting（世界觀的「說了就是」），再改 ops 的 time-and-tick（曆是其他段落的根），蝕塊那條等 lead-grid 第三波 `cx-grid-blight` 落地後再動，免得交接書與 spec 打架。constraints-ops 的 USR-14 最後加，等使用者拍板過。

## 不在 spec、交別線

- `content/lore/style.md` 用語段與 `terms.md`：新詞（潮候、潮勢、大潮、枯潮、朔潮、望潮、迫月、重蝕、月隱、星候、五星古名、蝕曆）2026-10-24 隨五題定案；定案表即 [glossary.json](glossary.json)，style 與 terms 只放指標（lead-settle）。
- `world-pillars`：W3 的「做」補一句「年表錨點可加天象註記」；不加新守則。
- lore 年表四條（[lore](lore.md) 末段）已於 lead-reconcile 落進 lore 年表（天象對照 2026-10-24 已定）。
- `design-notes.md` 分檔表加一列指向 [tide-sky](../tide-sky.md)（本線不改入口檔，請頂層順手加）。
