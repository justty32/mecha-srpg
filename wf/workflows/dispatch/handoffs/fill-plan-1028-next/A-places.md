# 子線 A：地點與日常生活（設計已可審）

先讀：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`與其適用子檔、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、本目錄[PLAN](PLAN.md)、[review](review.json) A01–A04及列明近鄰原檔。

## 目標與寫集

核可後由 gpt-6.1-sol 寫四地點。唯一內容寫集：

- `content/lore/places/fn28-tranquility-day-sleep.json`
- `content/lore/places/fn28-dhaka-shift-classroom.json`
- `content/lore/places/fn28-hamburg-low-mirror.json`
- `content/lore/places/fn28-makassar-wash-lines.json`

按 review 的掛到加入既有 id 連結；地點沒有 events 欄，事件引用放 body。四件均為舊城市內微型場所，不新增大地圖節點。人物保持匿名，不配人物檔。gameRefs 空陣列。

## A04修訂裁示

A01–A03已獲主線核可。A04改為「洗淨後衣箱錯交→高曬架招領→浮船繩籃換件→欠衣與賠工價未清」的港市鬧劇；不再寫挪團旗讓弱者先曬。差異證據加入共爐房與換禮角，詳review A04。A04此新版已由主線核可。

## 範圍與資源

本頁是待主線核可的交接設計，不是本線派工。由領導建立 detached worktree 與 draft manifest：單類別 lore/places、mode:add、前綴 fn28-、maxFiles:4。報告只寫領導指定 reportDir 的 REPORT.md、review.json、readlist.json、naming.json；主工作樹其他路徑不可寫。內容四檔合計≤128KB，超過先回報；不擴到八檔。

子代理0；全機工人最多3、重負載最多1，不自行搶位。禁改既有content、timeline、base、src、schemas、spec、index、batches、黃金；禁npm／全套／probe、刪檔、安裝下載、GUI鍵鼠、commit/push、寄信。原生工具回傳。不為取得反向引用修改母地點。

## 驗收（固定四項）

1. 四個新JSON、檔名=id尾段；引用只用已存在id；body每件500–900字，有用途、具體行動與status2108，白話≤60字。
2. 寫前與交稿各依review近鄰對照，附主動作／場所用途差異；若重回表列禁用鏡頭即重寫。REPORT第一段逐行已讀清單。
3. 在隔離worktree跑 `node content/lore/check.ts`，記真實退出碼；由領導對manifest跑content_gate。純lore無數值、遭遇或戰鬥單位，MCP/probe/戰鬥煙霧不適用。領導依batch收件，完整整合是否執行由主線統一，不在工人偷跑。
4. git差異只含明確寫集與報告；不修改timeline或既有檔。領導最終統一wf-lint、索引／帳本更新及整合驗收，不能把本線check稱全套通過。
