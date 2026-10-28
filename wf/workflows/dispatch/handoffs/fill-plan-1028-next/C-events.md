# 子線 C：事件與後續影響（設計已可審）

先讀與禁區沿用[A子線](A-places.md)，以[review](review.json) C01–C04及列明近鄰原檔為設計正文。範本 `content/lore/events/antarctic-shell.json` 只取格式，不採其秘密知情或災難鏡頭；日期與possible格式按 `content/lore/README.md`。

## 目標與寫集

核可後由 gpt-6.1-sol 產出以下四件，唯一內容寫集：

- `content/lore/events/fn28-salt-flat-borrowed-hawsers.json`
- `content/lore/events/fn28-hamburg-open-pattern-lessons.json`
- `content/lore/events/fn28-incheon-statue-crossing.json`
- `content/lore/events/fn28-tranquility-table-crates.json`

共通 `date:2108-02` 僅代表開場後可能時段、`period:era/league`、`occurs:possible`、`visibility:rumor`、`tags:[rumor]`。summary/body須明示「若發生／可能」，不能以假日期暗定史實；每條consequences用條件式，地方後果不得寫成已生效的全洲政策。無天象日期推算、無timeline寫入。既有事件引用放body，不加未定義的previousEvent欄。

四件鏡頭分別是共同扶船及耗材爭議、開棚教習與趕工打架、居民搬像尋名牌、食堂拆桌隨返鄉者分散。不得統一改成「一人拒絕權威，靠小動作贏回尊嚴」。不新增可玩事件、機體、數值、地點或人物；C03人物引用僅背景，徐海謙不替群眾作終局裁決。

## 範圍與資源

本頁是待主線核可的交接設計，不是本線派工。由領導建立 detached worktree 與 draft manifest：單類別 lore/events、mode:add、前綴 fn28-、maxFiles:4。報告只寫領導指定 reportDir 的 REPORT.md、review.json、readlist.json、naming.json；主工作樹其他路徑不可寫。內容四檔合計≤128KB，超過先回報；不擴到八檔。

子代理0；全機工人最多3、重負載最多1，不自行搶位。禁改既有content、timeline、base、src、schemas、spec、index、batches、黃金；禁npm／全套／probe、刪檔、安裝下載、GUI鍵鼠、commit/push、寄信。原生工具回傳。不為取得反向引用修改母地點。

## 驗收（固定四項）

1. 四個新事件JSON、檔名=id尾段；引用只用已存在id；body每件600–1000字、3–5小標，有既有事件前因、具體行動與至少兩條條件式consequences，白話≤60字。
2. 寫前與交稿各依review近鄰對照，附主動作／場所用途差異；若重回表列禁用鏡頭即重寫。REPORT第一段逐行已讀清單。
3. 在隔離worktree跑 `node content/lore/check.ts`，記真實退出碼；由領導對manifest跑content_gate。純lore無數值、遭遇或戰鬥單位，MCP/probe/戰鬥煙霧不適用。領導依batch收件，完整整合是否執行由主線統一，不在工人偷跑。
4. git差異只含明確寫集與報告；不修改timeline或既有檔。領導最終統一wf-lint、索引／帳本更新及整合驗收，不能把本線check稱全套通過。
