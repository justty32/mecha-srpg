# SIZE-01～09：部件尺寸與骨架相容

[報告入口](fable-report.md)｜[題綱](fable-brief.md)

## 問題

9 件 size 2 甲／系統拆件沒有任何可裝的槽：保留大型並補骨架，還是縮成 size 1？

## 已證實（唯讀，HEAD 4d47f485）

**哪 9 件**：`content/base/components/fl-{antler-cup,tomb-chime}.json`（systemMount, size 2）、`fl-{gate-flap,grove-shroud,mirror-splinter,rack-rib,shelf-ridge,tidespine-keel,vault-ply}.json`（armorMount, size 2）。

**全庫零槽**：掃 74 bodyplan／216 frame（bio 102、mechanical 101、ancient 13），armorMount 19 槽、systemMount 27 槽全是 size 1；size≥2 只有 weaponMount（2／3）、backMount（2）、restraint（2／4）。6 個 ancient bodyplan 根本沒有甲／系統槽，「157 台非 ancient」仍低估。

**擋在哪、哪裡不擋**：`src/ops/content/instantiate.ts:34`（`slot.size < def.size` 擲錯）、`src/ops/crew/workqueue.ts:72`（install 找不到槽→`no-compatible-slot`）。戰鬥層 `src/rules/state.ts:229-234` makeUnit 不檢查 size，情境 `UnitSpawn.components` 硬塞仍可進戰鬥。`src/content/lint.ts` 沒有 size 規則，`src/ops/content/check.ts:283` 只驗 campaign-start 配裝。

**來歷**：`lead-fill-gear/plan-gl/plan.md:42` 把 size 綁等級（B／A／S→2），引用 `wf/workflows/content/numeric-bands.json` 第 5 列「武器 hp／size／mass」，該列觀察值來自 weaponMount；既有 armorMount 30 件、systemMount 24 件全 size 1。同批 backMount 兩件 size 2（fl-dusk-curtain、fl-lake-votive）沒事，因 backMount 槽是 2。

**引用面與數值**：9 件只被 `content/base/world/research/fl-*-study.json`、`content/batches/`、`content/index/` 引用，無 frame defaultLoadout、scenario、encounter 使用，兩條路都不動既有配裝。對照同槽 size 1 件：甲層 HP 25–55（mx-runeweave-plate 55／mass 5、fa-abutment 45／mass 4）；9 件層 HP 35–55、mass 4–5、burden 4–12（size 1 生物件 burden 1–2）；系統件 antler-cup charge 30／regen 0、tomb-chime 20／2。

## 推測（未驗）

- 黃金 hash 來自戰鬥事件，不含 bodyplan 槽尺寸；改槽 size 不動黃金——待跑 golden 確認。

## 選項

**A 保留 size 2，放大重型骨架槽**：`SlotDecl.size` 只做 `>=` 比較，把 torso armorMount／一個 systemMount 由 1 改 2 純屬解鎖，size 1 件照裝。候選 `content/base/bodyplans/`：mx-biped-heavy（5 台）、mx-fortress-a（5，兩個 armorMount）、m2-hexapod-b（5）、mx-ace-a（8）、mx-selene-s（1），共 24 台。效果：9 件成「重型機專用拆件」，與 burden／mass 定位一致。改 5 個 JSON，不改引擎。

**B 縮成 size 1**：改 9 檔 `size`。數值已在帶內（層 HP ≤55、resist ≤0.25、mass ≤5），不必再降；區別只剩 burden 與層種。失去「大型」敘事，S 級潮脊斷梁和 size 1 的 B 件只差 burden 12。

**C 混合**：A／S 四件（antler-cup、gate-flap、grove-shroud、tidespine-keel）留 2 走 A；B 五件縮 1。對應 numeric-bands C 列 size「1–2」的模糊帶。

## 推薦：A（退而求其次 C）

理由：題綱禁止為過資料縮尺寸；A 與 B 成本同為純資料，A 保留 gl 計畫「拆件比整獸低、S 高承擔是刻意代價」的設計，也讓重型骨架第一次有專屬理由。判準：使用者要「任何機都裝得了」→ B；接受「重型機才扛得住巨獸甲」→ A。

## 需使用者裁決

1. 升哪些 bodyplan（建議上列 5 個；保守版只升 mx-biped-heavy＋mx-fortress-a，10 台）。
2. systemMount 升哪一槽（mx-ace-a／mx-biped-heavy 有兩個，建議只升 system-1）。
3. 是否補 lint「每件部件至少有一個相容槽」。

## 修改路徑

A：上述 bodyplan 檔 `parts[].slots[].size`。B：9 檔 `size`。另建議 `src/content/lint.ts` 加警告規則（需 lint 能讀 bodyplan；待查）。

## 驗證（回家後）

`npm run check`；新測試呼叫 `instantiateMech(重型 frame, {armor-1: "component/fl-tidespine-keel"})` 不擲、`workqueue` install 回 ok；百科卡 size 顯示正確；golden 全套一次確認不變。本輪依規矩未跑 node。
