# 六類內容填充 — 2026-10-27

[接續清單](../next-session.md)｜[內容流程](../../../content/batch.md)

使用者希望多 agent 擴充機甲、怪獸、人物、地點、事件、勢力。首輪 34 個概念（機甲、人物、地點、事件、勢力各六，怪獸四）；astra 統籌計畫，sol 分類產出，terra 做簡單核對。機制設計題延後交 Fable，不阻擋本輪內容。

各批以獨立 worktree 與 manifest 限制可寫範圍；公司不安裝，只做資料格式、引用與敘事審閱，整合測試／試玩／平衡留回家。未完成的驗收保留在 draft 帳本，不冒稱整批通過。

計畫、各類報告與白話審閱已在本資料夾交付；詳細內容來源仍是各批 JSON，不另立世界規則。

## 交付導航

<!-- wf-nav -->
- 機甲：[報告](mechs/REPORT.md)｜[白話審閱](mechs/review.json)
- 怪獸：[報告](monsters/REPORT.md)｜[白話審閱](monsters/review.json)
- 地點：[報告](places/REPORT.md)｜[白話審閱](places/review.json)
- 人物：[報告](characters/REPORT.md)｜[白話審閱](characters/review.json)
- 事件：[報告](events/REPORT.md)｜[白話審閱](events/review.json)
- 勢力：[報告](factions/REPORT.md)｜[白話審閱](factions/review.json)
- 六類核對：[去重與文字檢查](dedup.md)

機甲六台附六份型錄；怪獸四種各附物種、個體、活體與屍改配套。兩個只有出現地點不同的怪獸候選未實作，保留在計畫 decision 欄作為審查證據。怪獸敘事已寫入既有 species.etymology，不只放在報告。

## 回家接續

各批維持 draft。公司僅做路徑、JSON、引用、lore 與已讀清單檢查；content_accept 的 ACCEPT 僅表示 manifest 指定的有限檢查通過。機甲與怪獸 loader 均為 0 errors、32 warnings，未新增基線警告。未執行整合測試、戰鬥探針、MCP 試玩或平衡驗收。

先確認工作樹與帳本，再做完整內容驗收及出場／取得流程確認。機甲保留範本配套並補座艙、魂核後，部分 C 級 mass 超過建議，留待平衡審閱；鹽紗只能採收，活體 frame 是既有契約所需的不可捕配套。型錄存在不代表市場已上架，lore 人物與地點也不等同新增招募池或營運場所。

公司不安裝、不改引擎、不重錄黃金、不提交、不清除隔離 worktree。既有 legacy 兩條失效外部連結仍使 wf-lint strict 回傳失敗，並非這批新增違規。

## 收件狀態

34 個概念共 52 個新內容 JSON，另有六條年表插入，已全部帶回主工作樹。2026-10-27 使用者授權年表 WSL MODE 誤報本次例外手動帶回。年表唯一閘門違規為 MODE：此 WSL 檔案權限回報 777，chmod 無效；主線已核對舊 222 條、相對順序與其他欄位完全保留，僅新增六條；事件隔離區 lore 檢查 0 errors、0 warnings。原閘門失敗證據保留，這次例外不是 gate 改為通過。

六類內容與 manifest 已按明確路徑暫存以重產內容索引，全部維持 draft、尚未 commit。所有創作與查重 agent 已結束；整合驗收、平衡及行政收線仍待回家。
