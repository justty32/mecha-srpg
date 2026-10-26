# 任務：把既有年表 127 條逐條掛到八條長線上，並寫十節點表、孤兒表與待和解表

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」要逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/dispatch/handoffs/talk-world/HANDOVER.md`（第 2、4、5、7 節全讀）、`wf/workflows/dispatch/handoffs/talk-world/REPORT.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/design-notes/world/scale.md`、`content/lore/timeline.json`（127 條全讀）、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/guide.md`。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。**最重要的是 guide.md**：節點代號、分期、標記格式、已知待和解 R01–R09 都在那裡。

## 背景與唯一目標

使用者要先定「主線劇情」：十個關鍵歷史節點與八條長線，再填充地方與人物。另兩個工人在寫八條線的敘述；本線的唯一目標是做骨架資料：年表每一條掛到哪條線、十個節點的前因後果表、掛不上的孤兒表、所有衝突的待和解表。

## 範圍（排除法寫死）

- 只做四個資料檔（格式 `wf-table/1`，見 data-files.md），寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-map/`：
  1. `history-timeline.json`：127 列，一條年表一列，順序同 timeline.json。欄位 `序`（timeline.json 的 0-based index，字串）、`年月`、`標題`（兩者逐字複製）、`主線`（A–H 一個字母，掛不上填空字串）、`副線`（其他相關線字母，逗號分隔，可空）、`節點`（N01–N10，該條屬於某節點的前因、本體或後果時填，可多個，逗號分隔，可空）、`期`（前史／崩年／碎國／築牆／守線／開局後）、`掛線理由`（一句，說它在該線因果鏈上是前因還是後果、接哪個節點）、`與新裁示的出入`（該條現行字和 HANDOVER 第 2 節裁示或第 4 節提案衝突時寫一句並引 R 編號，沒有就空）。
  2. `history-orphans.json`：主線為空的條目，欄位 `序`、`年月`、`標題`、`為何掛不上`、`可能歸屬（提案）`。
  3. `history-nodes.json`：10 列（N01–N10），欄位 `id`、`年月`、`名`、`打結的線`（字母，逗號分隔；**每列至少三條**，以 HANDOVER 7.85–7.94 實際寫到的線為準）、`前因`、`後果`（各從對應的 7.8x 節濃縮，句後照 guide 標記，**不增加 HANDOVER 沒有的事件或人名**）、`既有年表條目`（`〔date｜title〕` 格式，逗號分隔，必須逐字對得上 timeline.json）、`狀態`（裁示／暫值／提案；N01 的「原因＝月球人口」是裁示，其他依實際）、`待和解`（R 編號，逗號分隔，可空）。
  4. `history-reconcile.json`：欄位 `id`、`議題`、`說法甲（出處）`、`說法乙（出處）`、`建議（提案）`、`影響的線與節點`、`需誰裁示`。R01–R09 必列（文字照 guide 補足出處），你另外找到的衝突從 R10 起編。
- 「掛上」的判準：該條是某線因果鏈上的前因、節點本體或後果，或 HANDOVER 7.8 該線的鏈明寫了它。只是「發生在那一期當背景」不算掛上。怪獸二名之夜、單一型號下線這類群像與填充條目，能指出它接哪條線的哪個節點才掛，指不出就進孤兒表，不要硬掛。
- 不做：線的敘述（另兩個工人寫）、`history-lines.json`、任何 md；不改任何既有檔（HANDOVER、timeline、design-notes、spec、content、src 全都只讀）；不 commit；工作目錄以外不寫任何檔（筆記與腳本放 `/tmp/cx-hl-map/`）。
- 件數 gate：`history-reconcile.json` 超過 30 列、或 `history-orphans.json` 超過 45 列就停下回報（代表掛線判準可能用錯）；容量 gate：四個檔合計超過 120 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/terms-rename.json grep 背面`（另可 `get`／`find`） | 讀 terms-rename.json、timeline 以外的 wf-table 檔；不要整份 cat 大檔 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py history-nodes.json`（四個檔逐一） 與 `python3 -c 'import json; json.load(open(...))'` | 每寫完一個檔驗格式 |
| 一支你自己寫的臨時腳本（放 `/tmp/cx-hl-map/`） | 核 `history-nodes.json` 的每個 `〔date｜title〕` 都逐字存在於 timeline.json、`history-timeline.json` 列數 127 且 `序` 連續 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-hl-map --once` | 每完成一個檔讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本線只寫文件與資料檔，不碰程式碼）。可寫範圍：只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-map/` 與 `/tmp/cx-hl-map/`；**不 commit**（沙箱下 `.git` 唯讀，領導統稿後提交）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；**不上網**。
- **子代理上限 0 個**。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. 寫 `history-nodes.json`（先定節點，掛線才有錨）。
3. 逐條寫 `history-timeline.json`，同時收孤兒與衝突。
4. 寫 `history-orphans.json`、`history-reconcile.json`，跑核對腳本。
5. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-map/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 四個資料檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-map/history-{timeline,orphans,nodes,reconcile}.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-map/REPORT.md` |

REPORT 結構：「已讀清單」；「做了什麼」；「統計」（每條線當主線的條數、孤兒條數、每個節點打結幾條線）；「核對腳本輸出」（只貼最後的摘要行）；「沒做到或證據不足的」；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 四個檔都能被 `tabledb.py` 讀、`contract` 是 `wf-table/1`、欄位與上面所列一致。
2. `history-timeline.json` 127 列、`序` 0–126 連續；主線為空的列數等於 `history-orphans.json` 列數。
3. `history-nodes.json` 10 列、每列 `打結的線` 至少三個字母，`既有年表條目` 每個引用都逐字存在於 timeline.json（核對腳本 0 錯）。
4. `history-reconcile.json` 含 R01–R09。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-hl-map`。本線團隊：`teams/hl`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-hl-map --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-hl-map --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-map/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是骨架資料；任何需要寫敘述、改既有檔或改結構的需求一律寫進 REPORT，不動手。
