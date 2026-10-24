# 任務：寫 E 魂、F 蝕線與歸還、G 傘政治、H 信仰四條長線的連續敘述

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」要逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/dispatch/handoffs/talk-world/HANDOVER.md`（第 2、4、5、7 節全讀）、`wf/workflows/dispatch/handoffs/talk-world/REPORT.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/design-notes/world/scale.md`、`content/lore/timeline.json`（127 條全讀）、`wf/workflows/dispatch/handoffs/lead-history-lines/guide.md`。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。**最重要的是 guide.md**：節點代號 N01–N10、分期、引用與標記格式、已知待和解 R01–R09 都在那裡，必須照用。

## 背景與唯一目標

使用者要先定「主線劇情」：十個關鍵歷史節點與八條長線（節點優先、不暴力產 lore）。本線唯一目標：把 E、F、G、H 四條線各寫成一篇從前史走到開局後第 40 蝕月、不斷鏈的因果敘述，只串已有的節點與年表條目。另一個工人同時寫 A–D，第三個工人做年表掛線與節點表；領導最後統稿。

## 範圍（排除法寫死）

- 只做五個檔，寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/`：
  1. `e-soul.md`、`f-rift-line.md`、`g-umbrella.md`、`h-faith.md`：每檔一條線。結構固定：標題行照 `# A 門線` 的格式（各檔換成自己的字母與線名）；一行導航 `[長線入口](../history-lines.md)｜[節點表](../history-nodes.json)`（這是統稿後的相對路徑，現在會是壞連結，照寫）；接著六段，段首粗體依序是 **前史**、**崩年（2089–2092）**、**碎國（2093–2096）**、**築牆（2097–2101）**、**守線（2102–2108-01）**、**開局後到第 40 蝕月**；每段是連續散文，寫這條線從上一期帶進什麼、經過哪些節點與年表條目、交給下一期什麼；最後一段 **尚未定的事**。不用條列、不用表格。每檔 3,500–7,000 bytes（`wc -c`）。
  2. `history-lines.part.json`（`wf-table/1`）：4 列（E、F、G、H），欄位 `線`（例：`E 魂線`）、`一句話`、`起點`、`節點序列`（例：`N01→N04→N10`）、`開局時的狀態（2108-01）`、`第 40 蝕月的問題`、`尚未定的事`、`敘述_path`（例：`history-lines/e-soul.md`，統稿後的相對路徑）；`link_columns` 設 `["敘述_path"]`。
- 每條線必須經過的節點：以 guide 節點表與 HANDOVER 7.85–7.94 實際寫到該線的節點為準，全部都要出現在敘述裡；每期至少引用一個年表條目或節點，**任何一期都不可空白**（那就是斷鏈）。某期確實沒有材料時，寫明「這一期本線沒有既有條目，延續靠 X（提案）」並列進 REPORT。
- 不做：A–D 四條線、年表掛線表、節點表、任何既有檔的修改（HANDOVER、timeline、design-notes、spec、content、src 全都只讀）；不 commit；工作目錄以外不寫任何檔（筆記與腳本放 `/tmp/cx-hl-eh/`）。
- 件數 gate：產出超過上面五個檔就停下回報；容量 gate：任一敘述檔超過 7,000 bytes 就先自己刪減，刪不下就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/terms-rename.json grep 背面`（另可 `get`／`find`） | 查 terms-rename.json；不要整份 cat |
| 一支你自己寫的臨時腳本（放 `/tmp/cx-hl-eh/`） | 核四個敘述檔裡每個 `〔date｜title〕` 都逐字存在於 timeline.json，並列出每檔引用了哪些節點 |
| `wc -c` | 核每檔大小 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-hl-eh --once` | 每寫完一條線讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本線只寫文件與資料檔，不碰程式碼）。可寫範圍：只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/` 與 `/tmp/cx-hl-eh/`；**不 commit**（領導統稿後提交）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；**不上網**。
- **子代理上限 0 個**。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；把 HANDOVER 7.85–7.94 裡寫到 E、F、G、H 的句子逐節點摘出（筆記放 `/tmp/cx-hl-eh/`）。
2. 依序寫 E、F、G、H 四檔；每寫完一檔跑核對腳本與 `wc -c`。
3. 寫 `history-lines.part.json`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 四篇敘述 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/{e-soul,f-rift-line,g-umbrella,h-faith}.md` |
| 四列資料 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/history-lines.part.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/REPORT.md` |

REPORT 結構：「已讀清單」；「做了什麼」；「每條線經過的節點與引用的年表條目」（每線一行，只列代號與 date）；「核對腳本輸出」（只貼摘要行）；「斷鏈風險」（哪一期材料最薄、靠哪個提案接上）；「待和解候選」（引 R 編號，新發現的寫兩邊出處）；「沒做到或證據不足的」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 四個敘述檔都存在、各有六個期段加「尚未定的事」，每檔 3,500–7,000 bytes。
2. 核對腳本 0 錯：每個 `〔date｜title〕` 都逐字存在於 timeline.json。
3. 每條線的敘述裡出現了 guide 節點表與 HANDOVER 7.85–7.94 寫到該線的全部節點代號，且 N10 在每檔都出現。
4. `history-lines.part.json` 能被 `tabledb.py` 讀、4 列、欄位與上面一致。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-hl-eh`。本線團隊：`teams/hl`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-hl-eh --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-hl-eh --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是四條線的因果敘述；不新增人名、事件、專名；任何需要改既有檔或改結構的需求一律寫進 REPORT，不動手。
