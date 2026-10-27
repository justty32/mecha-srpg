# 任務：規劃第2輪十八個具實質差異的世界觀概念

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/WORKFLOWS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/team-model.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/content-batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/world-pillars.md` 與適用子檔、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/lore-text.md`、`/mnt/c/code/mine/mecha-srpg/content/lore/README.md`、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md` 與 style/people.md。親讀主樹最新版；適用範本與world spec全文讀。REPORT開頭列已讀清單。

## 背景與唯一目標

規劃第2輪十八個具實質差異的世界觀概念，供領導審核後才派sol創作。正式總brief：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/briefs/lead-world-next-1027.md`。

## 範圍

只可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/plan-r2-REPORT.md`。不做：內容創作、其他計畫或審閱檔、manifest、主樹content、src、spec、SESSION/CLAIMS、其他線任何檔案。只讀主樹最新版；HEAD不含wl-*，查重仍須包含wl-*。
件數 gate：18個採用概念及最多6個reject；容量 gate：產物合計最多1MB。超出即回報，不擴範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 查詢及寫入wf-table/1，只定向輸出 |
| `git diff --check` | 自己報告的空白檢查 |

## 資源與禁區

唯讀調查線：只寫上述新附件，不改既有內容。子代理上限0；本線原生工具回傳。禁止安裝、網路、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定／掛載修改、修改索引或其他人的staged。不得開node檢查。不得自行派人。

## 工作

1. 以 gpt-6-astra 規劃人物、地點、勢力各6，共18；不寫內容。優先月面、非洲、大洋洲，依既有設定；避開前輪地區與欠薪爭租／救人撤退單一套路。群像、太空歌劇與日常並存。每列含 category、id、name、targetFiles、region、concept、action、conflict、sceneFunction、hooks（只用HEAD已存在ID）、template、nearestExisting（具體ID與主樹檔案）、similarity、substantiveDifference、decision、reason、fullTextRead（候選最相似既有全文閱讀證據）。至少兩個相似候選，再挑最相近全文讀。全庫含主樹未提交wl-*，不能只比名稱。每類本批只引用HEAD既有項或同批新項，不用wl引用；精確檔名前綴wn-r2-。逐列實質差異不足改概念，保留reject理由。主樹round2-candidates.json可能稍後出現，可作輔助；不必等待它開始查閱。計畫用wf-table/1；不得整份dump大表，讀寫用tabledb。
2. 報告未確定設定與拒用原因；真機制矛盾改選可行概念。
3. 留REPORT並以原生工具回傳，不能只回計畫不寫檔。

## 交付

表：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan.json`。報告：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/plan-r2-REPORT.md`。報告含已讀清單、產出、證據不足、需決定；規劃不能宣稱內容已完成。

## 驗收（固定3條）

1. 表存在且為wf-table/1，採用恰18列且三類各6，欄位與數量Python可核對。
2. 每列具體來源與相似判斷可追查，最相似既有全文閱讀後才寫差異；REPORT記明查重納入wl-*，採用概念引用可在HEAD查得。
3. REPORT有已讀清單、有限檢查及剩餘風險；git diff --check自己的文件為0。不追加其他驗證。

## 完成／阻塞回報

原生工具回傳DONE/BLOCKED與表、REPORT路徑；工具路徑打錯自行修。沒有parent id無須找inbox；不要發外部訊息。不要等待使用者代做已授權工作。
