# 任務：規劃第3輪六個合法且有實質差異的戰鬥概念

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/WORKFLOWS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/team-model.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/content-batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`、world-pillars及適用mechs/bio-battle子檔、mechs.md、bio-monsters.md、abilities-effects.md、numeric-bands.md與適用表列、polish.md、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`。範本、骨架、能力與配件讀完整，規矩以主樹最新版為準。REPORT列已讀清單，長清單用wf-table資料檔或簡短散文，不全表dump。

## 背景與唯一目標

第2輪收件、去重與round報告完成後才啟動此線。規劃第3輪六個合法且有實質差異的戰鬥概念，不改規則與舊內容。

## 範圍

只可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-plan.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/plan-r3-REPORT.md`。不做：內容創作、src/schema/spec、manifest、索引、其他計畫review、SESSION/CLAIMS、主樹或隔離區內容、任何未列路徑。
件數 gate：6個採用及最多4個reject概念；容量 gate：報告資料合計1MB。任一超出回報，不擴範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 定向讀寫wf-table/1與查數值表／範本 |
| `git diff --check` | 本線報告空白檢查 |

## 資源與禁區

唯讀調查線，只寫上列資料與REPORT。子代理上限0；原生工具回傳。禁止網路、安裝、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定或掛載修改。不跑node，不改任何staged。最多同時2子線，由領導監看。

## 工作

1. 用gpt-6-astra規劃機甲3、怪獸3共6個實質差異概念，輸出wf-table/1到round3-plan.json。每列含category、id、name、targetFiles、concept、role、template（同級HEAD檔）、grade、bodyplan、loadout或abilities、companionFiles、nearestExisting（具體ID+主樹file）、similarCandidates至少2、similarity、substantiveDifference、decision adopt/reject、reason、fullTextRead（讀過全文的路徑/hash/關鍵事實）、writingConstraints。先用現有同級合法配裝／骨架，不加能力、部件、效果、規則、bodyplans。機甲每件frame+world/model；怪獸每件species+monster+bio frame+corpse frame，敘事寫既有etymology；全批最多18個新內容檔（6+12），不要加示例情境。對主樹全庫含wl-*比角色定位與實際配裝，怪獸比能力組合、骨架和可用AI行為。只換名、出沒地區、數值或現有組合重出不能採用。不同species相同bodyplan可以，但能力組合及戰場取捨須有實質差異。新怪不造二名給B以下；不造無法拘束卻敘事活捕的矛盾；不動其他設定。引用只限HEAD已有ID或同批配套，主樹新wl-*僅查重不引用；新檔全部wn-r3-。計畫只需要足夠欄位、具體來源和差異，不寫劇本，不重做全庫研究。讀最相似全文後直接落檔，準備好任一類3列即可先交。領導審後才sol創作。若有工具/機制真矛盾記reject並換合法概念。可定向查round3-signatures.json（可能稍後出現），不必等它開始。
2. 機甲合法slots/types/size、核心／座艙、非凡鐵武器與pool能力相容，grade對model，mass遵本級建議；怪獸族別、core部位、捕捉要求、bio/corpse池及能力相容。plan若無法合法按同級模板實作就換概念，記證據，不去改引擎。
3. 留REPORT說明有限核對與未驗事項，直接原生回傳。

## 交付

`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-plan.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/plan-r3-REPORT.md`；報告含已讀、產出、未做與需決定。不是內容交付或完整驗收。

## 驗收（固定3條）

1. wf-table/1表存在，採用機甲3怪獸3，精確配套6+12檔；若不足逐件reject理由，Python可核對。
2. 每列最近相似具體ID／檔、相似處、實質差異或reject理由，至少最近全文已讀且HEAD引用可查；不要擴研究或新增規則。
3. REPORT含已讀清單與未驗整合平衡，git diff --check本線文件0。只做上述有限核對，不追加其他驗證。

## 完成／阻塞回報

原生回傳DONE/BLOCKED與表、REPORT路徑。自己指令或路徑錯誤自行修，不視環境阻塞。真機制矛盾暫留並換可行內容，不問未必要問題。
