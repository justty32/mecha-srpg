# 任務：規劃第二輪邊境地點與勢力事件
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`適用子檔、`content/lore/README.md`與style；本session已親讀可沿用，只補讀新領域、近鄰與本brief。
## 背景與唯一目標
本日持續填充至23:00。前輪12件生活lore與4個戰鬥概念已核可；第二輪改補冒險與勢力戲劇的地點/事件，避免連續寫現代日常小店與尊嚴寓言。astra設計，sol稍後產稿。
## 範圍
只寫 `wf/workflows/dispatch/handoffs/night-frontier-plan-1028/` PLAN/review/REPORT；其餘唯讀。
不做：新實作JSON、既有設定修正、timeline修改、引擎/數值/勢力史實裁決、新機甲能力、已待裁決角色故事、派子agent。
件數 gate：固定兩批各4概念（4地點、4事件），合計8，一概念一JSON，每批單類別；設計附件最多12檔；容量 gate：附件2MB；超過先回報。
## 必用工具
| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | 既有索引與review有界查詢 |
| `rg` | 近鄰名稱／主動作查重 |
## 資源與禁區
**唯讀調查線**：只寫自己報告目錄。子代理上限0。不跑任何npm/test/probe、不下載、不碰GUI鍵鼠螢幕、不刪檔、不commit/push/reset/rebase、不改其他線資料。
## 工作
1. 先有界讀前輪fill-plan-1028-next、night-combat-plan-1028與既有內容，避開它們的主要動作。選至少3個地理區域，優先非洲/南美/大洋洲/軌道等前輪較少地區，不因此虛構地圖機制。
2. 四地點具體冒險用途：既有守區邊緣、殘存大尺度建物、浮船停泊/換乘/遺跡進出等可選，但不能都是維修站/交易所/庇護所換名；必須有尺度意象、使用者能理解的現場動作與兩方利益。引用真實母地點/勢力，不新增大地圖node或可玩功能宣稱。
3. 四事件以勢力自主行動、外交/競爭、冒險代價為核心，不把玩家寫成唯一解救者；不能全用「拒絕→小動作守尊嚴」或主持者替弱者裁判。每件不同主動作與具體局部後果。新開場後事件全部possible+rumor、date只代表時段，不改既有史實或把新戰役勝負當定案。
4. 每件提供精確新檔/id（night-r2-前綴）、引用與近鄰原文段落2例、差異、風險、簡介≤60字、必填欄、故事節奏/場景；新檔互不依賴跨批未交內容。不自動新建人物/機甲配套。
5. 先交一批可核後再交另一批，不因研究無限延伸拖延產出；22:10前交完整設計，優先品質不湊數，無安全可寫缺口可少交並說明。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-frontier-plan-1028/REPORT.md`，首段已讀清單；PLAN.md、wf-table/1 review.json、兩批可執行寫集/近鄰證據。工具回報，未核可不派實作。
## 驗收（固定 3 條）
1. 8概念分兩單類別批，精確檔/id/既有引用/短介/2近鄰差異與風險完整（少於8說明原因）。
2. 不依賴前輪未落地內容、不改timeline/既有世界事實，寫集每批4檔且單檔16KB內。
3. REPORT/PLAN/review存在，實際已讀證據可查；沒有實作或源碼改動。
