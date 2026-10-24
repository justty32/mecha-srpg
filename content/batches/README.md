# content/batches — 內容批次帳本（一批一檔）

[content 包說明](../README.md)｜索引 [index](../index/README.md)｜流程 [content 工作流的 batch 流程](../../wf/workflows/content/batch.md)

每一批由 agent（多半是 codex）產出的內容在這裡留一份 manifest：`<YYYY-MM>/<batch-id>.json`，契約 `content-batch/1`。它同時是**派工前的授權書**（模式、允許的目錄、命名前綴、件數上限，閘門照它判）與**完工後的出處帳本**（作者模型、日期、新增檔與 id、驗收結果、probe 數字、被閘門擋下的越界嘗試、重做輪數）。分片索引的 `batch`／`status` 欄由這裡推出。

欄位定義與每一步怎麼填見 [batch 流程](../../wf/workflows/content/batch.md)。按月份分子資料夾，一個月一個。
