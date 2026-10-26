# 任務：上網蒐集全球潮差資料，整理主要沿海城市潮差表與一頁說明

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」要逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/dispatch/handoffs/talk-world/HANDOVER.md` 第 2 節末段「怪獸從海洋來」與第 4 節第 10 條。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

使用者裁示：怪獸從海洋來、跟隨潮汐、環太平洋為主、內陸盡量少；**潮差地圖就是威脅地圖**，暫值門檻是平均潮差小於 1 m 幾乎不開裂、1–3 m 普通、大於 5 m 凶。本線唯一目標：用真實世界資料做一張主要沿海城市潮差表，加一頁 M2 分潮振幅全球分佈的說明，供世界觀線校準裂縫與蝕線的地理。這是真實地理資料，不寫任何遊戲設定。

## 範圍（排除法寫死）

- 只做兩個檔，寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/`：
  1. `tide-range.json`（`wf-table/1`，`source` 填 `tide-range.md`）。欄位：`城市`（中文常用譯名）、`英文名`、`國家／地區`、`洲`、`平均潮差_m`（mean range，數字字串，一位小數）、`大潮差_m`（spring range；查不到就空字串並在備註說明）、`威脅級`（照平均潮差：`小於1 幾乎不開裂`／`1–3 普通`／`3–5 未定區間`／`大於5 凶`）、`來源_link`（一個 https URL，指向該數字的潮站頁、潮汐表或文獻）、`資料類型`（潮站實測／官方潮汐表／文獻／鄰近潮站代用）、`年表或 lore 有出現`（是／否）、`備註`。`link_columns` 設 `["來源_link"]`。
  2. `tide-range.md`：一頁說明（≤ 6,000 bytes，散文為主、不貼長清單）。寫：資料怎麼取得與口徑（mean range 與 spring range 的差別、M2 振幅與潮差的關係）、全球 M2 振幅分佈的描述（大潮差區、無潮點與小潮差海，各附來源 URL）、本表統計（列數、各威脅級幾座、各洲幾座）、資料缺口。第一行標題、第二行放 `[潮差表](tide-range.json)`。
- 城市清單（一城一列，合計 70–120 列）：
  - 必含：`content/lore/timeline.json` 與 `content/lore/places/*.json` 裡出現的所有沿海或河口城市（例：孟買、達卡、吉大港、新加坡、釜山、漢堡、鹿特丹、伊斯坦堡、拉哥斯、阿克拉、蒙巴薩、三蘭港、雪梨、奧克蘭、蘇拉特、聖保羅〔以桑托斯港代表〕、馬尼拉、雅加達、上海〔長江口〕、聖馬洛；內陸城市如奈洛比、基多、浦那、蒙特婁不列，但 HANDOVER 提到的河口城市要列）。
  - HANDOVER 第 4 節第 10 條點名的潮差區各至少一座代表港：孟加拉灣、長江口／杭州灣、鄂霍次克海、芬迪灣、布里斯托海峽、阿拉斯加（安克拉治）、巴塔哥尼亞、莫三比克海峽、阿拉伯海；以及「安全海」地中海、波羅的海、黑海各至少兩座。
  - 其餘名額補各洲主要港口，環太平洋沿岸優先。
- 不做：任何遊戲設定或威脅級以外的詮釋；不改任何既有檔；不 commit；工作目錄以外不寫任何檔（筆記放 `/tmp/cx-hl-tide/`）；不在工作目錄放網頁全文、搜尋結果傾印。
- 件數 gate：超過 120 列就停下回報；容量 gate：兩檔合計超過 80 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| codex 內建 web search（啟動時已用 `codex --search exec` 開） | 每座城查潮站或潮汐表數字；優先官方來源（NOAA Tides & Currents、UKHO、各國水文署、PSMSL／UHSLC、學術文獻），全球分佈查 TPXO／FES 類潮汐模型或教科書級來源；不要自己 curl 網頁 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py tide-range.json` | 驗格式 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-hl-tide --once` | 每完成一洲讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**（只上網查資料與寫上述兩檔與 REPORT）：可寫範圍只有 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/` 與 `/tmp/cx-hl-tide/`；不 commit。
- **網路**：只准用 codex 內建 web search，不用 curl／wget、不下載檔案、不登入任何網站、不送出表單。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP。
- **子代理上限 0 個**。
- **分清錯誤來源**：web search 不可用、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」，從 timeline 與 places 列出必含城市清單（筆記放 `/tmp/cx-hl-tide/`）。
2. 逐洲查數字寫 `tide-range.json`，每列一個可回查的 URL；查不到的數字留空並在備註說明，**不得編造數字**。
3. 寫 `tide-range.md`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 潮差表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/tide-range.json` |
| 說明頁 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/tide-range.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/REPORT.md` |

REPORT 結構：「已讀清單」；「做了什麼」；「必含城市核對」（年表與 places 的沿海城市逐一列出是否進表）；「資料缺口與代用」；「沒做到或證據不足的」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `tide-range.json` 能被 `tabledb.py` 讀、`contract` 是 `wf-table/1`、70–120 列、欄位與上面一致。
2. 每列 `來源_link` 是 https URL；`平均潮差_m` 非空的列，`威脅級` 與門檻一致。
3. 上面「必含」清單的城市與潮差區代表港都在表內（REPORT「必含城市核對」逐一列）。
4. `tide-range.md` ≤ 6,000 bytes，含全球分佈描述與來源 URL、本表統計。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-hl-tide`。本線團隊：`teams/hl`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-hl-tide --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-hl-tide --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/cx-hl-tide/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是真實潮差資料；不寫遊戲設定，查不到就留空，不編數字。
