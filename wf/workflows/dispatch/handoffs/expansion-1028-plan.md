# 任務：規劃本輪三類內容擴充並完成概念去重

先讀：`/workspace/scratch/4c78897e16f4/mecha-srpg/AGENTS.md`，親自讀 WORKFLOWS、common/user 與 working/art、team-model、dispatch、content 全部適用流程與世界支柱子檔、lore/style、core/world 類別契約及設計裁示，不靠上層摘要。

## 背景與唯一目標

由 gpt-6-astra（xhigh）規劃新的機甲／怪獸／人物各八件容量目標，讓後續 sol 產出 meaningful distinct content；這不是歷史待驗收批次的續線。

## 範圍（排除法寫死）

只可寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-plan/` 與 `/tmp/expansion-1028-plan/`。必交 PLAN.md、review.json、concept-dedupe.json。件數 gate：最多二十四主體概念、每批最多二十內容檔；容量 gate：每檔最多16 KB、bodyplan最多24 KB、總報告最多1 MB；任一超限先報告。不做正式內容、引擎／schema／spec、舊檔變更、待裁決舊 lore、歷史 inbox。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 索引與資料檔條件查詢 |
| `wf/tools/content_index.py` | 查引用、核既有內容 |
| `wf/tools/brief_lint.py` | 交接書品質 |

## 資源與禁區

唯讀調查線：只寫自己的新報告。不 push／commit／建分支／rebase／reset，不刪檔，不改 secrets/config，不安裝或下載，不用外部 CLI agent。禁 GUI、螢幕、鍵鼠。子代理上限0。平行產出工人最多3、全機一個重負載；本線不跑重測試。普通工後續由 sol 擔任。工具拒絕先查結果；同一拒絕只有新相關證據且確知未執行才可一次重試，否則回報。

## 工作

先讀規矩，再從既有與 draft 候選查近似，做精確檔案／件數／容量範圍。每件留英文命名意涵、繁中短介紹（≤60字）、最近概念的區別及可驗玩法。不要只用既有 species 換怪獸個體名湊數；可同類拆子批以容納配套。

## 交付

寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-plan/PLAN.md`、同目錄 review.json 與 concept-dedupe.json，透過原生工具回報自足摘要與路徑。

## 驗收（固定 3 條，做完就停）

1. 計畫有各類數量、明列路徑、類別分批、每批≤20檔與容量上限。
2. review.json 與 concept-dedupe.json 是 wf-table/1，每主體有≤60字繁中介紹及語義近似比對。
3. 未改正式內容、引擎／schema／spec，舊裁決未擅定，報告列已讀規矩與限制。
