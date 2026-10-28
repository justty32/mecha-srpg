# 未接受CM六檔可攜備份

此為主線裁示整批未接受的隔離稿證據，不是入庫包。僅六白名單內容檔，沒有node_modules/.git/其他base，保持原相對路徑。解開前先檢查tar目錄與SHA256清單，後續設計須另取得核可；不可據此覆蓋或直接入庫。

最終稿 [六檔tar.gz](final-isolated-six.tar.gz)，逐檔 [SHA256SUMS](final-isolated-SHA256SUMS)，[原base與最終manifest](final-isolated-manifest.json) 記base40976305、draft/integration pending/local not-accepted；最後六檔唯一差異為CM02 accuracy2→6，見 [單欄差異](last-round-single-field-diff.json)。首輪原文保存在round1-source/content/base，來源雜湊見 [首輪hash](round1-source-hashes.json)。首輪／末輪結果與操作證據均在同目錄log，MCP／fixture執行時accuracy2，不冒稱最終accuracy6快照。
