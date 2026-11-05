# LINK-01／backlog 74：部件常駐修正的生效階段

[報告入口](fable-report.md)｜[題綱](fable-brief.md)｜設計與驗證另見 [fable-link01-design](fable-link01-design.md)

## 問題

`ComponentDef.poolMods`／`attrMods` 該在哪個實體建構階段生效、怎麼不重複、存讀檔相容、最小驗證。

## 已證實缺口（唯讀 HEAD）

**零消費**：型別在 `src/core/types-def.ts:157-166`（註「spec 列為必填」）、schema `schemas/content.schema.json:48-49`。全 `src/` 非測試消費者只有 UI 文案 `src/ui-adapter/vm/viewmodel.ts:144-145`（顯示「調整資源／調整機體性能」）與百科 `vm/wiki/cards.ts:60`；rules 沒有。`attrMods` 唯一套用點是怪獸 `src/rules/state.ts:246-249`。實測：`lead-fill-gear/fg-ga-0{1,2,3,4}/REPORT.md` 差值全 0（ga-02：AV-2 heat.max 預期 120 實 100）。

**兩段建構與流向**：營運 `src/ops/content/instantiate.ts:29-49`（pools＝frame.pools＋component.pools，`contribs: []`）；戰鬥 `src/rules/state.ts:218-300` makeUnit（237 層；238-245 池宣告＝frame＋components＋crewPools→initializePools；246-249 怪獸 attrMods；264-267 `init.pools` 夾限；269-277 parts／effects 匯入）。營運→戰鬥 `src/ops/sortie/run.ts:25-39` 只帶 components（def id）、parts、effects、pools.cur、controlMode；`UnitInit`（state.ts:20-27）沒有單位 contribs 欄，戰鬥每場從零建。戰後 `src/ops/sortie/apply.ts:37-47` mechAfter 寫回 after.pools、contribs 設回 before（營運側永遠 `[]`）。安裝 `src/ops/crew/workqueue.ts:118-125` finishJob 只寫 `part.components[slot]`，不重算池。

**基礎設施已在**：`src/rules/contribs.ts:29-39` addContrib 對 path `self.pools.<id>.max|regen` 會 recomputePool；`src/rules/pools.ts:41-52` recomputePool＝statValue(宣告基值, contribs)；`src/rules/layers.ts:83,97` 部件層毀／部位毀時全池重算，poolDecls（pools.ts:13-27）已排除毀損部件的 pools；`removeContribsBySource`（contribs.ts:47-51）可按 source 撤。

**曝險與黃金**：全庫 61 件有欄位（gear 49＋舊件 12）。其中 8 件 mx-*（essence-cell charge max+40、rift-heart charge regen+12／heat+5、frost-fins heat regen−8、hawk-eye accuracy+6、flare-wings、rift-needle、thousand-eye、tide-leap）出現在 68 台 frame defaultLoadout 與 5 個 scenario，修復必改戰鬥黃金與戰役黃金。

**文件與規格**：`wf/workflows/content/engine-facts.json` EF-02 教內容「被動寫 attrMods」、EF-13 說 MonsterDef.attrMods 未實作（state.ts:248 已實作）；`content/mechs.md:50` 也以 poolMods 為可用，修完要同步。`specs/core/rules-people.md:21` 要求古代部件共鳴未達標時 attrMods 不生效；`src/rules/will.ts:32` 已算 `will.resonance[componentId]` 但 rules 無消費點。現有帶 resonance 的部件（fl-tomb-chime、fl-fallen-step、fl-lake-votive、mx-relic-halo）都沒有 attrMods／poolMods，第一階段可不處理共鳴。

## 推測（待驗）

- 戰鬥存檔 `src/sim/save.ts:122` 整份 JSON 載入、不重跑 makeUnit → 新 contribs 隨檔走；舊戰鬥存檔載入後缺部件修正（戰鬥級，可接受）。
- poolMods 指向機體沒有的池（生物機裝機械件）：recomputePool 對不存在的池直接 return（pools.ts:43），contrib 殘留無害，但未驗。
