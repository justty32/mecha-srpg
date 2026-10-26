# 任務：照計畫產出萬潮葬王副線的兩件事件與四份定稿表

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT.md 第一段「已讀清單」逐行列出，驗收腳本逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/plan-wanchao/plan.md`、`content/lore/events/wreck-crown.json`、`content/lore/events/aegir-wakes.json`、`wf/workflows/dispatch/handoffs/lead-wanchao/plan/plan.md`（與同目錄 new-events／inserts／timeline-ops／base-drafts／review-draft 五個 json）、本交接書。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

計畫段（cx-wc-plan）已寫好逐件處置，領導已審。本線唯一目標：**照計畫加下方領導修正**，在隔離 worktree 寫出兩件 lore 事件檔，並在報告目錄寫出四份定稿表，供領導在 main 套用。

## 領導修正（優先於計畫）

1. 事件 id 與名：拍二 `event/wanchao-northward`、中文名「黑脊北行」（取代「海上移燈」）；拍三 `event/wanchao-at-gate`、中文名「城門未開」。年表與 review 同步改。
2. 兩件事件根欄**不放** `visibility`（public）；只放 `"occurs": "possible"`。tags 用 `["tide"]`（不放 rumor；年表條目才帶 rumor）。
3. 工頭名字是「葛西蓮」，中間沒有空格；所有表與正文照此。
4. 年份寫「2108 年」，不寫「兩千一百零八年」。
5. 哈米德的砲台不點名（既有檔「老鷺／老鸛」兩寫並存，不是本線的事）：寫「砲台」「值哨簿」即可。
6. 拍三末句改成主詞明確、不給牠手：「若那夜站在門邊，守門人會看見萬潮葬王停在城門外；他的手仍按著門閂。」到此停筆。
7. base-drafts 的 `文案大綱` 改成可直接上屏的定稿文案（≤ 200 字），列數不變。

## 守則（plan-wanchao 第三節，七條，照守）

1. 不給意圖：沒有「牠要、牠找、牠記得、牠回應」；砲火打在牠身上只寫人看見的火光。
2. 拍一、拍二不交戰：牠在戰場是地形級的在場，或根本不在戰場。
3. 不綁蝕壓源頭、不定族以外的來歷：那片蝕域不補名字、不補核心、不寫牠為什麼出來。
4. 不升格纜工、不讓候鳥號成為劇情必要；每拍至少三個勢力的人在場，沒有一個人跨三拍。
5. 不讓國家與塞勒涅萬能：朝廷、北美不來，塞勒涅只賣消息，夸父、刑天不下山，埃吉爾不綁牠。
6. 不寫 SS／SSS；不動既有數值與 wreck-crown 一字。
7. 不拿其他作品類比；新詞走兩步命名，不直譯。

主詞永遠是人；牠只有抬起、轉身、走、停、回海。不新增人物檔。正文用條件語氣（「若那夜…」），但要有畫面；body 300–1500 字、2–4 個 `## ` 小標；summary 一句。

## 產物

- worktree（你的 `-C`）內：`content/lore/events/wanchao-northward.json`、`content/lore/events/wanchao-at-gate.json`。欄位照 `content/lore/README.md` events 節（id、name、summary、body、tags、date、period、kind、occurs、factions、characters、places、consequences），引用照計畫 new-events.json。
- 報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wanchao/wc-01/`：
  - `inserts.json`（wf-table/1，欄同計畫，套修正 3–5；錨照計畫，不改）。
  - `timeline-ops.json`（wf-table/1，欄同計畫，套修正 1）。
  - `base-drafts.json`（wf-table/1，欄同計畫，套修正 7）。
  - `review.json`（wf-table/1，欄 `檔`、`類別`、`名稱`、`白話`（≤ 60 字）、`掛到`）：每件一列（兩事件、七處插入、兩條年表、十四列 base 草稿）。
  - `REPORT.md`：已讀清單、件數、自查結果、需要決定的事。

## 範圍（排除法寫死）

- 只做：上列 2 個事件檔＋報告目錄 5 個檔。
- 不做：改 worktree 內任何既有檔（含 timeline.json、人物、地點——那些由領導套用）；worktree 內不留任何其他檔；改 content/base、src、specs、design-notes、wf 其他檔；commit。
- 件數 gate：worktree 新檔超過 2 個就停；容量 gate：報告目錄超過 60 KB 就停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑） | 寫完事件檔自查 0 錯 |
| `python3 -c 'import json…'` | 驗證五個 json 可解析、錨唯一 |
| `grep -rn` / `rg` | 查引用 id 是否存在、查禁用詞 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-wc-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（內容檔）；可寫只有：worktree 的 `content/lore/events/wanchao-*.json`、報告目錄、`/tmp/cx-wc-01/`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，受同一範圍約束。
- 文筆只守禁忌：style.md 禁用詞、不直譯腔、正文不出現設計層字眼（節點、拍一／拍二／拍三、N10、副線、提案、裁定、開局、引擎、玩家）；base-drafts 是遊戲文案，可對玩家說「你」。
- **分清錯誤來源**：點名工具本身壞掉 → `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-wc-01 --up PROGRESS '已讀完，開始產出' < /dev/null`）。
2. 寫兩件事件，`node content/lore/check.ts` 0 錯。
3. 寫四份表與 REPORT.md，回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 事件檔 | worktree 的 `content/lore/events/` |
| 表與報告 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wanchao/wc-01/` |

回覆只要 5 行摘要＋REPORT.md 路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 0 錯，且 在 worktree 根跑 `git status --short` 只列兩個新事件檔（node_modules symlink 除外）。
2. 報告目錄五檔在、四個 json 可解析；inserts 每列錨在該檔 body 恰好一次（法蒂瑪、茉莉兩列照算）。
3. 兩事件與所有表的文字對 style.md 禁用詞 grep 0 命中、不含「葛西 蓮」與「兩千一百」。

## 失敗怎麼處置

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wc-01`。本線團隊：`teams/wanchao`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-wc-01 --up DONE 'wc-01 產出完成：2 事件、N 列表' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wanchao/wc-01/REPORT.md`（STATUS、N 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-wc-01` 屬 `teams/wanchao`）。
