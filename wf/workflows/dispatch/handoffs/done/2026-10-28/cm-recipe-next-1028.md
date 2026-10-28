# 任務：把CM兩輪失敗轉成可接續的設計修訂建議
先讀：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/playtest.md`；本session親讀可沿用，補CM最終報告與原始對照摘要。
## 背景與唯一目標
CM六檔已裁示整批不接受，兩輪測試上限已用完。剩餘時間補下次可審的配方與限制，不重開本輪實作／驗收；22:53前交。
## 範圍
只寫 `wf/workflows/dispatch/handoffs/cm-recipe-next-1028/REPORT.md` 與最多一份wf-table/1候選資料；其他路徑唯讀。不做：改舊PLAN/REPORT或草稿、測試、派工。
件數 gate：最多2文件、僅既有CM01/CM02兩概念；容量 gate：總16KB。
## 必用工具
| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | CM比較／末輪摘要有界讀取 |
| `rg` | 原設計與鄰近資料核對 |
## 資源與禁區
**唯讀調查線**（僅寫本線設計報告），astra創意設計，子代理0。不npm/probe/MCP/runner、GUI/下載/刪檔/改content/engine/AI/基準/黃金，不git寫入。不能把方案描述為已通過或再開第三輪調參。
## 工作
1. 讀既有CM01原側5/5換側2/5、CM02 accuracy2原側0/5與accuracy6兩側0/10證據，分清確證與推測、撤退判負與核心破壞。自然蓄熱／新招已用不代表有戰果。
2. CM01說明保留原稿再評估的必要控制變因；CM02提出一個首選重新定位／配方方案及一個較小備選，僅候選、不實作，不改共享件或基準。可以判定不宜靠單一accuracy繼續補，不為本晚湊入庫數保證能過。
3. 候選若列數值，明列原值／建議值、每一步獨立的假設與下次才可做的最小驗證；不掃參數，不新增能力或依賴檔。最多兩概念，無新種、新引擎規則。
4. REPORT首段交代已讀；指出下一輪需重新核可的新設計，既有六檔仍未接受。本線不動收尾成果計數與原證據。
## 交付
`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/cm-recipe-next-1028/REPORT.md`，原生工具終局回報，22:53前停止。
## 驗收（固定 3 條）
1. 結論引用兩輪實值，確證與假設分明，不冒稱新方案已驗證。
2. 修訂候選只涉及原六檔、不改基準/AI/引擎；明列下輪審核與測試需求。
3. 兩文件16KB內，未實作／未測／未派工，按時終局。

## 完成證據

Astra Sagan於22:48終局，主線已close。僅[REPORT](../../cm-recipe-next-1028/REPORT.md)與[candidates](../../cm-recipe-next-1028/candidates.json)兩文件，未實作、未測、未重開CM第三輪；六檔仍未接受。原brief SHA256：`43de53892662c0b7cd86df57e71fff622c66d15f981c28daf6cc3b497d64fb83`。
