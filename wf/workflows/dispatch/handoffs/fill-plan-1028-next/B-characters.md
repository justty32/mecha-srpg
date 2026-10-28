# 子線 B：勢力內部人物關係（設計已可審）

先讀與禁區沿用[A子線](A-places.md)，另親讀 `wf/workflows/content/ancient-people.md`；以[review](review.json) B01–B04及其中近鄰為設計正文。基底範本 `content/lore/characters/ren-kasai.json` 只取欄位，不仿復仇主線。

## 目標與寫集

核可後由 gpt-6.1-sol 產出兩組平級／前後任合作人物，唯一內容寫集：

- `content/lore/characters/fn28-zheng-suting.json`
- `content/lore/characters/fn28-han-ling.json`
- `content/lore/characters/fn28-mare-besson.json`
- `content/lore/characters/fn28-idris-nasser.json`

四人全為human、gameRefs=[]、events=[]，只做lore。B01/B02同屬地勤會、B03/B04同屬稽古學會；兩組各自雙向relations一次交齊，不新增勢力或事件檔、不替舊人物追加關係。空events代表沒有冒稱參與既有歷史事件，正文仍連到已存在地點／勢力。每篇至少一個自己做的決定，不以四篇互相重述湊數。

## 範圍與資源

本頁是待主線核可的交接設計，不是本線派工。由領導建立 detached worktree 與 draft manifest：單類別 lore/characters、mode:add、前綴 fn28-、maxFiles:4。報告只寫領導指定 reportDir 的 REPORT.md、review.json、readlist.json、naming.json；主工作樹其他路徑不可寫。內容四檔合計≤128KB，超過先回報；不擴到八檔。

子代理0；全機工人最多3、重負載最多1，不自行搶位。禁改既有content、timeline、base、src、schemas、spec、index、batches、黃金；禁npm／全套／probe、刪檔、安裝下載、GUI鍵鼠、commit/push、寄信。原生工具回傳。不為取得反向引用修改母地點。

## 驗收（固定四項）

1. 四個新人物JSON、檔名=id尾段；引用只用已存在id；body每件500–900字，有獨立主動作、born/faction/role/relations/events，白話≤60字。
2. 寫前與交稿各依review近鄰對照，附主動作／場所用途差異；若重回表列禁用鏡頭即重寫。REPORT第一段逐行已讀清單。
3. 在隔離worktree跑 `node content/lore/check.ts`，記真實退出碼；由領導對manifest跑content_gate。純lore無數值、遭遇或戰鬥單位，MCP/probe/戰鬥煙霧不適用。領導依batch收件，完整整合是否執行由主線統一，不在工人偷跑。
4. git差異只含明確寫集與報告；不修改timeline或既有檔。領導最終統一wf-lint、索引／帳本更新及整合驗收，不能把本線check稱全套通過。
