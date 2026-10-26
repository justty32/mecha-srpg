# 任務：寫萬潮葬王副線填充的計畫表——F1–F5 拆成逐件、寫死的處置

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；plan.md 第一段「已讀清單」逐行列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/README.md`（含可見度、`occurs: possible`）、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/plan-wanchao/plan.md`（**全文，含文末使用者裁示**）、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md` 第五節、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/lore/events/wreck-crown.json`、`content/lore/events/aegir-wakes.json`（occurs: possible 的範例）、`content/lore/places/chittagong.json`、`content/lore/characters/{captain-hamid,rashid-ironmouth,anil-chowdhury,fatima-begum,molly-van-den-berg}.json`、`content/base/monsters/tidespine-chittagong.json`、本交接書。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

萬潮葬王（吉大港的那隻 S 級潮脊種）的副線已由 Fable 規劃、使用者裁示：拍二北上（吉大港外灘→第七哨外海→達卡北郊那道開局裂縫的河口）、拍三允許正面打（可選不必選、全遊戲唯一一次可捕捉）、蝕線重畫一區（孟加拉灣北岸一段轉淺蝕）、蝕訊欄名「王跡」（提案名）。本線唯一目標：**只讀不改**，寫出一份計畫表，讓產出線照表就能寫、不必再判斷。

## 守則（plan-wanchao 第三節，原文照守，七條）

1. 不給意圖：沒有「牠要、牠找、牠記得、牠回應」；砲火打在牠身上只寫人看見的火光。
2. 拍一、拍二不交戰：牠在戰場是地形級的在場，或根本不在戰場。
3. 不綁蝕壓源頭、不定族以外的來歷：牠從吉大港外圍的蝕域出來，那片蝕域不補名字、不補核心、不寫牠為什麼出來。
4. 不升格纜工、不讓候鳥號成為劇情必要；每拍至少三個勢力的人在場，沒有一個人跨三拍。
5. 不讓國家與塞勒涅萬能：朝廷、北美不來，塞勒涅只賣消息，夸父、刑天不下山，埃吉爾的 possible 事件不綁牠。
6. 不寫 SS／SSS，展現過的最強力量仍是 S；不動既有數值與 wreck-crown 一字。
7. 不拿其他作品類比；新詞走兩步命名，不直譯。

另：主詞永遠是人；牠只有抬起、轉身、走、停、回海。**不新增人物檔**（具名小人物只在事件正文出現、無檔）。拍二、拍三寫成 `occurs: possible`，正文不寫成已發生（「若那夜…」或預報、傳聞口吻皆可，但要有畫面）。

## 計畫要覆蓋的件（逐件都要有列）

- **F1**：吉大港地點檔插入開局狀態——外灘水面仍封、拆船幫少一片灘、鹽鷗交屍改到鹽灘更南、市場與招募池聽到「外灘封了」；工頭葛西蓮（無人物檔）2108 一句也放這裡。王跡三句（在／往北／不見了）是遊戲顯示文案，列 base-drafts。
- **F2**：拍二主事件 1 件（lore 新檔，occurs: possible）；路線事件 2、契約文案 3（跟蹤偵察／撤離護送／守牆但牠不來）、news 體例勢力反應 4–5——這些是遊戲資料，引擎（王跡、世界移動）未落地前**只寫草稿**，列 base-drafts，不進 content/base。
- **F3**：拍三事件 1 件（lore 新檔，occurs: possible，寫到牠停下為止，兩個出口都不寫結果）；守牆情境 1 的大綱列 base-drafts。
- **F4**：哈米德、拉希德、阿尼爾、法蒂瑪、茉莉各一句 2108 狀態（插入既有人物檔 body，**只插入、不改原文任何一字**；給錨點＝原文中一段唯一的子字串，插在其後）。法蒂瑪、茉莉兩檔另一條線正在潤飾，照寫但在 `備註` 標「待 tf-03」。
- **F5**：年表兩條（拍二、拍三），照 aegir-wakes 的掛法：帶 `rumor` tag、`event` 指向新事件。拍二代表日期用 `2109`，拍三用第 40 蝕月的代表年（你依 great-tide.md 與蝕月長度估，寫理由）。

## 產物（全寫進 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-wanchao/plan/`）

- `plan.md`（≤ 6 KB）：已讀清單、兩件新事件的設計理念（畫面、在場勢力、哪一刻停筆）、兩步命名（英文原名｜意涵｜中文名）、風險與需要決定的事。
- `new-events.json`（wf-table/1，`columns`＋`rows`）：欄 `id`（`event/wanchao-…`）、`name`、`date`、`period`、`places`、`factions`、`characters`、`kind`、`tags`、`consequences`（陣列，每條一句，寫成「若發生…」）、`大綱`（≤ 300 字）、`白話`（≤ 60 字）。所有引用必須指向存在的檔（`ls content/lore/events/` 等目錄查）。
- `inserts.json`（wf-table/1）：欄 `件`（F1／F4）、`檔`、`欄`（body）、`錨`（原文唯一子字串）、`插入`（要插入的句子，含必要的換行 `\n`）、`備註`。
- `timeline-ops.json`（wf-table/1）：欄 `op`（insert）、`entry`（完整物件：date、title、summary、event、era、factions、tags）、`理由`。年表用 python json 讀 `content/lore/timeline.json` 的 `entries`。
- `base-drafts.json`（wf-table/1）：欄 `件`、`類`（王跡／路線事件／契約／news／情境）、`名稱`、`文案大綱`（≤ 200 字）、`依賴`（engine-backlog 第 57–61 列中哪一列）。
- `review-draft.json`（wf-table/1）：欄 `檔`、`類別`、`名稱`、`白話`（≤ 60 字）、`掛到`——每件（新事件、每處插入、年表、base 草稿各類）一列。

## 範圍（排除法寫死）

- 只做：寫上列 `plan/` 目錄裡的六個檔。
- 不做：改任何 content、design-notes、wf 其他檔；commit；設計數值。
- 件數 gate：新事件超過 2 件、inserts 超過 8 列、base-drafts 超過 14 列就停下回報；容量 gate：plan/ 目錄總量超過 60 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `grep -rn` / `rg` | 查人物、勢力、地點 id 與既有說法 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 檔 grep 詞` | 讀 engine-backlog.json（第 57–61 列）等 wf-table 檔 |
| `python3 -c 'import json…'` | 讀 timeline.json entries、驗證產物可解析 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-wc-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**（唯一可寫的是 `plan/` 六檔）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，只讀、把結果交你彙整。
- 文筆只守禁忌：style.md 禁用詞、不直譯腔、不拿其他作品類比、正文與插入句不出現設計層字眼（節點、拍一／拍二／拍三、N10、副線、提案、裁定、開局、引擎）。
- **分清錯誤來源**：點名工具本身壞掉 → `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-wc-plan --up PROGRESS '已讀完，開始寫計畫' < /dev/null`）。
2. 逐件寫 new-events／inserts／timeline-ops／base-drafts／review-draft。
3. 寫 plan.md 並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 六檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-wanchao/plan/` |

回覆只要 5 行摘要＋plan.md 路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. 六檔都在且 JSON 可解析。
2. F1–F5 每件在 new-events、inserts、timeline-ops 或 base-drafts 至少一列（plan.md 附對照）。
3. inserts 每列的 `錨` 在該檔 body 中恰好出現一次（用 python 數 `body.count(錨)==1`）；new-events 的引用 id 都存在。

## 失敗怎麼處置

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wc-plan`。本線團隊：`teams/wanchao`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-wc-plan --up DONE 'wc 計畫完成：N 列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-wanchao/plan/plan.md`（STATUS、N 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-wc-plan` 屬 `teams/wanchao`）。
