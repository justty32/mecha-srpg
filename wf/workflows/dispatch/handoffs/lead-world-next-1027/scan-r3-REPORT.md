# 第三輪結構指紋盤點 REPORT

## 已讀

`AGENTS.md`、`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/content-batch.md`、交接書 `wf/workflows/dispatch/handoffs/wn-scan-r3-1027.md`；`wf/workflows/content/README.md`、`batch.md`、`polish.md`、`world-pillars.md`、`world-pillars/mechs.md` 及其 `mechanical.md`、`bonds.md`、`ancient.md`，`world-pillars/bio-battle.md` 及其 `bio.md`、`battle.md`；`mechs.md`、`bio-monsters.md`、`abilities-effects.md`、`numeric-bands.md`、`content/lore/style.md`。以 tabledb 讀取 `templates.json`、`numeric-bands.json`、`engine-facts.json`、`ability-forms.json`，依指紋程式完整解析主樹相關 frame、species、bodyplan、component、ability、effect、model、monster、AI profile JSON（含所指範本）；未將全表送入上下文。

## 產出與有限核對

[round3-signatures.json](round3-signatures.json) 為 wf-table/1：232 列，含 184 frame 與 48 species；其中檔名 `wl-*` 為 14 frame、4 species，另讀 6 個 `wl-*` model。來源為當下 `content/base`；同時讀取 71 bodyplan、186 component、230 ability、171 effect、85 model、60 monster、20 AI profile。每列含原始 ID 與來源路徑；frame 含等級、骨架功能與層、槽位配裝及部件與能力、固有能力、池、tags、對應 model；species 含族別、骨架、能力、AI profile、行為、捕捉與對應 monster。

`exact_signature_peers` 比較整個摘要投影及其引用 ID，沒有完全一致的投影；不同 ID 即使功能相似也不會列為完全一致，這不是全庫語義查重結論。骨架摘要省略槽大小、層數值；能力摘要省略數值與效果內文，需依來源與 ID 親讀完整 JSON 後判斷。配裝規則依 mechs.md：槽型及大小相符、核心與座艙、至少一把非凡鐵對獸武器、池成本與產出相容，D/C/B/A 建議總 mass 上限 6/9/12/15；model tier 對 frame grade。怪獸須核對族別、core 與結構層、捕捉 function、bio/corpse 池和能力。這些是後續逐案核對要點，並非對既有全庫逐項合法性認證。

## 未做與需決定

盤點時本目錄沒有第三輪 plan，無候選可逐列找最近者、親讀對照或判定重複，也無法判定計畫能否依同級範本合法實作；待 plan 出現後交規劃者定向查詢、比對完整來源並決定。未創作或修改內容、引擎與規則，未驗整合、平衡、執行行為或測試；亦未做全庫近似排序。指紋為盤點當下快照，來源後續變動須重新核對。
