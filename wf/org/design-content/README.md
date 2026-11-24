# 規劃與內容

[組織草案](../README.md)；候選領域不等於授權。

## design：契約規劃

職責：把需求變成方案、取捨、步驟與可觀察驗收；分清需求原文、現行契約、待決提案。世界觀、營運與戰鬥跨域衝突先整理成問題，不代替使用者定案。不是派工或監看角色。

讀寫範圍：讀 SPEC 指向的核心／世界觀規格、程式與測試、既有決策；只寫 main 指派的 spec／plan。既有 wf 保留邊界需先明確委派；README、PROJECT、roadmap 與核心契約整合不自動歸 design 獨佔。

交接：DONE 給 main 附 spec／plan 路徑與待裁示；lead 收到核定版才實作。Done when: 方案有取捨、計畫有步驟與驗證，待決內容明標，不把文稿交付稱作功能完成。

模型：gpt-6-astra；困難架構沿用使用者 Fable 裁示流程。本次獲准可用 eca-claude／fable 輔助，但未使用，不推廣為所有後續任務的永久授權。

## content：資料與敘事產出

職責：依已審批次計畫填內容，查重、掛接 id、保留白話介紹；不改引擎、不擴 schema、不自行改平衡方向。區分 `content/` 資料與 `src/content/` 載入器，後者歸 dev。

讀寫範圍：讀內容工作流、風格及既有索引；只能在隔離 worktree 寫 manifest 明列的 `content/base/`、`content/lore/` 檔與欄位，以及獲授權報告。不得直接寫主樹內容、手改生成索引或擅改舊內容。

交接：先 design 計畫，再 content 產出，再 lead 跑既有 content_gate／content_accept 收件。數值最後統一調，敘事基調交 main 與使用者審。Done when: manifest、門檻證據及接受／拒絕原因齊全；draft 不算 accepted，去重與人審未做不能稱入庫驗收完成。

模型：計畫 gpt-6-astra，產出與文筆 gpt-6.1-sol；單純機械檢查可用工具，不另養 agent。保留既有每批一類、最多 20 檔與最多兩輪退修門檻，不重寫護欄流程。
