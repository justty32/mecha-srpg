# 人物跨批去重與矛盾審閱（2026-10-27）

**問題**：pilots 148 人、bigfill 人物與既有人物，是否同名重複、角色重複或設定衝突？

**方法**：全量機械比對 186 person＋271 lore 人物（姓名 104,196 組、正文 36,585 組），再深入核對 16 組相似候選。兩批審核表經資料工具讀取，結論以目前 content 為準；另核 155 條 lore→person、148 條背景→person 配套。未跑測試、golden、lint，未改 content。

**發現**：確定矛盾 1 項（P01：朴仁哲失腿機制），文案辨識度待審 1 組（P02：三地堅盾護船）；沒有可確認的重複人物。155 條 person/lore 連結屬正常配套，「七號機魂」是七號別名，「會長」是通用稱謂。

詳細證據已存 [people.json](people.json)（22 列）。欄位：id 識別碼、status 判定、priority 優先序、topic 主題、evidence 檔案／行號／字段／短引文、judgment 判斷、next_step 後續；掃描統計、候選門檻與限制在資料檔 metadata。

**結論**：本輪只有證據清單，不動遊戲內容。推薦先裁定 P01，接著審 P02 是否需要差異化；其餘候選保留。人物一人一份 lore 與其他架構難題留給另開 Claude Fable 報告，不在這裡裁決。

**覆蓋限制**：bigfill 34 人物與 pilots 148 人物皆納入機械比對；語義只深入候選，並非逐句審完全部人物。共解析 2,695 份 content JSON 以核範圍／配套，不代表其餘內容全已語義驗證；未擴成全面事件年表、人口知情 D 線或引擎稽核。

**來源**：[fill-rulings](../../../workflows/dispatch/handoffs/fill-rulings.md)、[pilots report](../../../workflows/dispatch/handoffs/lead-fill-pilots/report.md)、[bigfill report](../../../workflows/dispatch/handoffs/lead-bigfill/report.md)；逐項現檔出處見資料檔 evidence。
