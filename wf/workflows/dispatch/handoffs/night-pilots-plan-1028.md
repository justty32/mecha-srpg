# 任務：設計兩名可用於展示的駕駛員與對應人物故事
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/acceptance-playtest.md`、`content/lore/README.md`、`content/lore/style.md`與style/people；共通規矩本session已讀可沿用，補讀person格式、既有範本與近鄰。
## 背景與唯一目標
夜間續填最後一個小型可玩人物設計批；前輪生活人物為lore，本批讓兩個新人物有實際person資料與一個展示情境。23:00前收尾，設計22:10前交，不加碼規模。
## 範圍
只寫 `wf/workflows/dispatch/handoffs/night-pilots-plan-1028/` PLAN/review/REPORT，內容與源碼唯讀。
不做：實作JSON、改既有設定/數值、招募池/市場/機制接線、時間線、罕見S機魂、新能力或perk、派子agent、舊人物矛盾裁決。
件數 gate：恰2個人類駕駛概念，預計2person+2lore character+1展示scenario=5新JSON，單實作批上限5；規劃附件最多10；容量 gate：2MB。
## 必用工具
| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | 索引、數值帶、人物與既有review有界查詢 |
| `rg` | 原檔語義近鄰與引用查核 |
## 資源與禁區
**唯讀調查線**：只寫自己報告目錄。子代理0，不跑npm/test/probe，不下載、不碰GUI鍵鼠螢幕、不刪檔、不commit/push/reset/rebase，不改其他線文件。
## 工作
1. 避開ZIP八人物全部主情節與第一輪四生活人物；選兩個已有勢力/地區的駕駛角色，有各自欲望、缺點與已做過的一件事，不能只是任職履歷或全由身份決定性格。可以有勇猛、黑色幽默、利害衝突，不一律靠拒絕權威守尊嚴結尾。
2. 對兩個既有person近鄰各做敘事與數值定位對照，明確只沿現有屬性/perk/能力，不新schema。兩人遊玩側有不同取捨，不能人人高意志高準度。若設定曾死或未成年不適合當現役展示；不給未被認主者開古代機。
3. 新id用night-p-前綴，person/lore同名、gameRefs正確對應。兩人的lore只引用既有勢力與事件，events可空，不修改既有人物反向關係。展示借用既有普及機型，引用確實存在；不改招募池，清楚只展示尚未加入戰役招募。
4. 輸出5檔白名單、每person完整可寫欄位/數值、每lore故事節奏與短介、既有合法配裝的展示與5seed/MCP方案；不自創display技能。展示兩新駕駛各至少有合法行動與可追溯人物id，平衡對照沿同frame只換person，控制變因。
5. 先交可核兩人概念再收完整REPORT，22:10前交；若無可寫缺口寧少交具體原因，不塞重複。不開工，等主線核可。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-plan-1028/REPORT.md`、PLAN與wf-table/1 review；已讀清單、近鄰與風險、只展示限制齊全。
## 驗收（固定 3 條）
1. 2人物每人2近鄰對照、獨立敘事動作與遊玩取捨、5檔精確寫集，引用可驗。
2. person屬性/perk都在既有契約，無新機制/招募接線/時間線，展示驗證方案可執行。
3. PLAN/review/REPORT存在，沒有內容與源碼改動，未測不宣稱已平衡。
