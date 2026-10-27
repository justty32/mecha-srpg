# 任務：審查第5輪六份成稿是否有實質差異

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/world-pillars.md`與適用子檔、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/lore-text.md`、`/mnt/c/code/mine/mecha-srpg/content/lore/README.md`、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`及地點同級範本。本線為terra簡查，遇到創作判斷不確定如實標明。

## 背景與唯一目標

sol成稿後再次查重，避免僅改名字保留相同人物行動、衝突、場所功能或勢力營運。只有本輪地點6件，不全面研究舊任務。

## 範圍

只可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-more-1027/round5-dedup.json` 與 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-more-1027/dedup-r5-REPORT.md`。來源讀主樹最新版全庫（含未提交wl-*、wn-*及wm-*），及`.git/wf-worktrees/wm-r5-places-1027` 內本批成稿；未存在的類別先略過，在全稿齊備後補完。若有計畫核准後改概念，不擅自改計畫或內容。
不做：內容創作、其他文件、其他wf、manifest、git index、任何改舊檔。件數 gate：6件審查；容量 gate：合計1MB。超出即回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 定向讀plan/review，寫wf-table/1審查表 |
| `git diff --check` | 自己文件空白檢查 |

## 資源與禁區

唯讀調查線，只寫指定新審查表與REPORT。子代理上限0；原生工具回傳。禁止安裝、網路、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定與掛載修改。不執行node、不改其他staged。

## 工作

1. 查主樹同類全庫及wl-*、wn-*、wm-*；按職能語義挑最相近2個。逐件讀新稿與最相似既有全文；只看名稱或摘要不能下結論。主樹舊候選與每批新稿都可對照，不因地區不同即通過。
2. 每列含id、category、files、nearestExisting（具體ID與主樹路徑）、otherCandidate、similarity、substantiveDifference、decision（accept/reject/needs-lead）、reason、fullTextRead（實際來源與版本摘要）。比較行動、衝突、場景功能；概念弱差異要reject或needs-lead，不湊數。
3. REPORT總結件數、退回及風險。表wf-table/1，讀寫用tabledb，不全表dump。證據不足先定向補讀，不以截斷當阻塞。

## 交付

`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-more-1027/round5-dedup.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-more-1027/dedup-r5-REPORT.md`。REPORT列已讀與有限審查，不宣稱整合或完整accepted。

## 驗收（固定3條）

1. 審查表6列，地點類6，每列對應一個成稿及具體近似既有ID／檔；全文閱讀來源可追查。
2. 每列有相似處、實質差異或reject理由；全庫含wl-*，新稿互相比對；不只比名字，不以地區差異作唯一理由。
3. REPORT與表存在，記明未驗整合平衡；git diff --check自己文件0，不追加驗證。

## 完成／阻塞回報

原生工具回傳DONE/BLOCKED與REPORT路徑；有明確重複立即通知領導，由領導退回創作者，自己不改內容。

已親讀規矩沿用；依新線總brief，近似來源最多兩個，以計畫已選來源起步，無明確缺口不再擴查。新稿逐件讀全文，普通Python僅輔助找相似詞，具體欲望／行動／衝突／結果必須人工語義比較。
