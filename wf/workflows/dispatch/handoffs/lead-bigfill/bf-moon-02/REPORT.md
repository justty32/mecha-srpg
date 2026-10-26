# 已讀清單

以下路徑均親自讀取；相對路徑以 worktree 為根。bf-common 的相對位置不存在，已讀主 repo 同份檔，替代路徑一併列出。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/d-moon.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/before-collapse.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`
- `content/lore/places/ferry-lane.json`
- `content/lore/places/tranquility-city.json`
- `content/lore/events/equator-ports-accord.json`
- `content/lore/events/nairobi-port-incident.json`
- `content/lore/events/whiteglove-incident.json`
- `content/lore/events/credit-accord.json`
- `content/lore/factions/whitegloves.json`
- `content/lore/places/singapore.json`
- `content/lore/characters/old-pigeon.json`
- `content/lore/characters/mina-darzi.json`
- `content/lore/factions/migrant-crew.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/cx-bf-moon-02.md`

另讀 wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/workflows/inbox/README.md、wf/workflows/common/data-files.md 與 world-pillars 的 world／mechs／bio-battle 入口。資料表透過主 repo tabledb 讀寫，年表只條件查 2066 條目。

## 做了什麼

cx-bf-moon-02 在指定 worktree 新增 3 地點、1 職業群像、4 人物、4 事件，共 12 檔。只引用 HEAD 或同批 id，沒有修改既有檔；未 commit，未用子代理。每件都有指定光景，家書核心只用於候領處。逐件白話與掛點見 review-rows.json。

望鄉號：望鄉號拖光升空，窗外地球漸小、月亮漸滿。掛到 D；2066 定班、2096 赤道港協定；N09。

靜海修船塢：白艙板展如翼，塢工撤離後把船交回船員。掛到 D；2066 定班；N07；底色 1.2。

靜海家書候領處：離港光掃過窄櫃，未領家書仍朝向地球。掛到 D；2066 定班；底色 1.8；N09。

渡月船員：船員接力唱名，在離港光裡喊人齊才開船。掛到 D；2066 定班；底色 1.2、1.4。

阿莉雅・納瑟：船長等搬工退淨踏板，才抬手吼向地球。掛到 D；2066 定班；N09。

伊沃・馬洛：貨艙領班割開卡住的空網，最後離開踏板。掛到 D；2066 定班；底色 1.2、1.4。

陳月河：引導員舉旗分開人潮，帶回程旅客走向船邊。掛到 D；2107 渡月船票價調漲；N09。

莎拉・凱特：艙門地勤逐一數過同伴，才將白船交回船員。掛到 D；N07；底色 1.2。

弦月啟航：定班首日，無名船員喊下一班還回來。掛到 D；2066 渡月航路定班。

回程排到門外：回程隊伍走向船，有人回望穹頂喊月亮送我走。掛到 D；2107 渡月船票價調漲；N09。

白手套下船：第一通催收之後，白手套鐵偶在新加坡下船攔貨。掛到 D；2107 信貸協定；N09。

空位留到開船：若末位持票者未到，開船令停在船長舉起的手裡。掛到 D；2107 票價調漲的後果；N09。

插入候選只交 inserts.json 的 4 筆：塞勒涅 places 加望鄉號、地勤會 places 加修船塢、渡月航路 factions 加渡月船員，以及 2066 定班既有條目補 event 鍵。條件查得現有索引為 entries[5]，日期 2066、標題「渡月航路定班」，目前沒有 event 鍵；領導套用前仍須重新定位。timeline-add.json 為空表；沒有把 possible 事件加入年表。

## 產出

worktree：/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02

本目錄有 REPORT.md、review-rows.json（12 列，白話均 ≤60 字）、inserts.json（4 列）、timeline-add.json（0 列）。三表由 tabledb.Table 寫出，source 為本交接書絕對路徑，extracted 為 2026-10-26。

固定驗收四條結果如下，未增加條數：

1. **不符**。改前 lore-baseline.txt 末行 `errors=0 warnings=0`；新增後 lore-check.txt 末行 `errors=0 warnings=3`。警告分別為 ferry-first-departure、return-fare-queue、whitegloves-come-ashore 未出現在 timeline。
2. **通過**。npm-check.txt 末行 `OK 0 errors, 10 warnings`；只跑這一次 npm run check。
3. **通過**。12 指定新檔齊，檔名等於 id name 段；git diff 無既有檔修改，content 下未追蹤檔恰為指定 12 檔。起始已有未追蹤 node_modules，由領導準備，未動它。body 370–446 字，沒有觸發容量或件數 gate。
4. **通過**。REPORT 開頭已讀清單齊，三份合法 wf-table/1 存在；review 12 列，名稱全部標（提案），白話最大長度 22 字。

檢查輸出保留本目錄 lore-baseline.txt、lore-check.txt、npm-check.txt；本批沒有跑 npm test、typecheck、content_accept 或其他加碼驗收。

## 沒做到或證據不足的

終局 **FAILED**，原因是固定驗收第 1 條警告不得增加未達成。check.ts:248–252 對每件已發生、未被年表 event 鍵引用的事件發警告；possible 才豁免。本交接書把三件設為已發生，又禁止工人修改 timeline，並明示側景不另增年表，因此本線範圍內無法消除這 3 個警告。沒有把歷史事件假改 possible、沒有隱藏警告，也沒有用 baseline 代替新增後結果。保持產物供領導審查，不回滾。

## 需要決定的事

需要領導處理「只增歷史側景、不改年表」與「警告不得高於 baseline」的衝突。既有授權中的 2066 插入候選合併後可消除其中一個警告；另兩件明定不新增年表，本線不擅增候選或改 checker。其餘內容與固定欄位均按交接書。

提案名稱：望鄉號（提案）、靜海修船塢（提案）、靜海家書候領處（提案）、渡月船員（提案）、阿莉雅・納瑟（提案）、伊沃・馬洛（提案）、陳月河（提案）、莎拉・凱特（提案）、弦月啟航（提案）、回程排到門外（提案）、白手套下船（提案）、空位留到開船（提案）。沒有另造專名；英文原意沿用計畫命名表，沒有回填 aka。出生年與細部敘事沿計畫，仍供 Fable＋使用者審核。既有知情、人口、朴仁哲腿傷細節、M-3 與阿鏽來源不加答案。

## 以後交接書該點名的工具

現有 lore checker 會要求歷史事件有 timeline event 引用；派「只增側景、不得改年表」前應讓計畫與驗收使用同一規則。保留已點名的 lore check、npm run check、tabledb、inbox_poll、inbox_mail 即足夠，本線未新增工具需求。
