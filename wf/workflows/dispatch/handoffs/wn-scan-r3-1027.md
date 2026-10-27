# 任務：提取第3輪全庫配裝與怪獸結構指紋供查重

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/WORKFLOWS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/team-model.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/content-batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`、world-pillars及適用mechs/bio-battle子檔、mechs.md、bio-monsters.md、abilities-effects.md、numeric-bands.md與適用表列、polish.md、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`。範本、骨架、能力與配件讀完整，規矩以主樹最新版為準。REPORT列已讀清單，長清單用wf-table資料檔或簡短散文，不全表dump。

## 背景與唯一目標

第2輪收件、去重與round報告完成後才啟動此線。提取第3輪全庫配裝與怪獸結構指紋供查重，不改規則與舊內容。

## 範圍

只可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-signatures.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/scan-r3-REPORT.md`。不做：內容創作、src/schema/spec、manifest、索引、其他計畫review、SESSION/CLAIMS、主樹或隔離區內容、任何未列路徑。
件數 gate：最多500列結構摘要；容量 gate：報告資料合計1MB。任一超出回報，不擴範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 定向讀寫wf-table/1與查數值表／範本 |
| `git diff --check` | 本線報告空白檢查 |

## 資源與禁區

唯讀調查線，只寫上列資料與REPORT。子代理上限0；原生工具回傳。禁止網路、安裝、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定或掛載修改。不跑node，不改任何staged。最多同時2子線，由領導監看。

## 工作

1. 用gpt-6.1-terra做簡單程式化指紋盤點，讀主樹content/base全庫含wl-*，不創作。機械frame以grade/bodyplan/defaultLoadout部件組合/innateAbilities/pools/定位tags形成結構簽章，附model對應；species以family/bodyplan/abilities/aiProfile/behaviors/capture形成簽章。只將差異摘要與原始檔ID保存wf-table/1到round3-signatures.json，供astra定向查詢，不把全表印入context。不跑node。若round3-plan已出，逐列找結構最近者，親讀完整對應JSON後標示簡單重複或近似，判斷不足交領導。不代替astra設計、不新造概念，不全面研究舊任務。
2. 機甲合法slots/types/size、核心／座艙、非凡鐵武器與pool能力相容，grade對model，mass遵本級建議；怪獸族別、core部位、捕捉要求、bio/corpse池及能力相容。plan若無法合法按同級模板實作就換概念，記證據，不去改引擎。
3. 留REPORT說明有限核對與未驗事項，直接原生回傳。

## 交付

`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-signatures.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/scan-r3-REPORT.md`；報告含已讀、產出、未做與需決定。不是內容交付或完整驗收。

## 驗收（固定3條）

1. wf-table/1表存在，摘要只源自實際全庫JSON含wl-*，並有ID與來源可追查，Python可核對。
2. 指紋比較依骨架／能力／配裝，不僅名稱；找到完全重複即明記；不要擴研究或新增規則。
3. REPORT含已讀清單與未驗整合平衡，git diff --check本線文件0。只做上述有限核對，不追加其他驗證。

## 完成／阻塞回報

原生回傳DONE/BLOCKED與表、REPORT路徑。自己指令或路徑錯誤自行修，不視環境阻塞。真機制矛盾暫留並換可行內容，不問未必要問題。
