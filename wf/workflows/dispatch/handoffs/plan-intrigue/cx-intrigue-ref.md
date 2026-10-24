# 任務：上網查 18 部參考作品在「局勢」與「掙扎」上的做法，整理成一份資料檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（雜活，只讀這份；另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/data-files.md` 的「檔案格式」一節，照它寫 json）。

## 背景與唯一目標

本專案是 2108 地月機甲傭兵 SRPG。規劃線 `plan-intrigue` 正在寫一份設計筆記「局勢與掙扎」：使用者重溫 Call of Duty: Modern Warfare 初代三部曲後說，吸引他的不是表面特徵，而是「背後錯綜複雜的局勢，以及主角在其中的掙扎」——每一方都有站得住的理由（謝菲爾德失去三萬部下、扎卡耶夫覺得國家被出賣）、前一代的結局變成下一代的動機、主角是只看得到局勢一角的棋子（Roach 與 Ghost 被燒掉、No Russian 的艾倫、普萊斯與 Soap 脫離體制）。**唯一目標**：替規劃線查清楚下列參考作品各自是怎麼做到這兩件事的，抽的是**結構與手法**，不是表面元素（不要寫「它有機甲」「它有傭兵」），寫成一份 `wf-table/1` 資料檔。規劃線只讀你的產出檔，自己不上網。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**。

- 只查這 18 部（一部一列，順序照此）：(1) Call of Duty: Modern Warfare 2007／2009／2011 三部曲合寫一列；(2) Front Mission 3；(3) Front Mission 5；(4) 機動戰士鋼彈 0080 口袋裡的戰爭；(5) 機動戰士鋼彈 0083 星塵回憶；(6) 機動戰士鋼彈 鐵血的孤兒；(7) Armored Core: For Answer；(8) Armored Core VI；(9) 裝甲騎兵 VOTOMS；(10) BattleTech（2018，Harebrained）；(11) MechWarrior 5: Mercenaries；(12) Spec Ops: The Line；(13) 銀河英雄傳說（田中芳樹）；(14) Tactics Ogre: Let Us Cling Together（含 Reborn）；(15) Triangle Strategy；(16) Frostpunk；(17) This War of Mine；(18) The Wire＋勒卡雷（《鍋匠、裁縫、士兵、間諜》《冷戰諜魂》）合寫一列。
- 每列填滿這些欄：`work`（作品名，中文＋原文）、`medium_year`（媒介與年份）、`situation`（**局勢**是怎麼搭的：各方站得住的理由、舊帳怎麼接力到下一段、誰需要戰爭、誰從災難得利；三到五句）、`struggle`（**主角的掙扎**怎麼做：棋子視角、只看到一角、服從對良知、忠誠對真相、被自己人燒掉、脫離體制；三到五句）、`technique`（可以抽到別的作品用的**手法**，最多三條，一條一句，例「用前作結局當續作反派動機」「關鍵揭露放在玩家無法操作的過場」「同一事件用兩個陣營的任務各打一次」）、`pitfall`（它做壞、或模仿時容易學壞的地方，一兩句）、`relevance`（對一款「玩家是傭兵、站在勢力縫隙裡、契約有資訊迷霧、債務逼人接單」的遊戲，最可借的一句）、`sources`（2–3 條來源連結，優先官方、維基、開發者訪談、GDC 演講、有份量的評論；連結原樣放，不要只寫站名）。
- 文字用繁體中文、中文母語的語感：不逐字對譯英文概念，句子要像中文原創；專有名詞（人名、作品名、任務名）保留原文或通行中譯。
- 不做：這 18 部以外的作品；本專案任何設定的改寫或建議（那是規劃線的事）；下載影片或整本書；不寫 md 版的重複內容。
- 件數 gate：超過 18 列就停；容量 gate：json 超過 200 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| codex 內建 web search（啟動時已用 `--search` 開） | 每部作品查 2–3 個來源；不要自己 curl 網頁 |
| `wf/tools/inbox_poll.sh cx-intrigue-ref --once` | 每完成 6 列讀一次 orders |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/references.json` | 寫完驗 json 能開、`count` 為 18 |

## 資源與禁區

- **可寫程式碼線**（實際只寫資料檔）：只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/` 底下的 `references.json` 與 `cx-intrigue-ref/REPORT.md`；其他一律不寫。不 commit（由規劃線 commit）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 `git add`、不 commit；不 `rm -rf`（暫存搬 `/tmp/cx-intrigue-ref-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不寫 `src/`、`content/`、`wf/workflows/planning/`；子代理上限 0 個。

**分清錯誤來源**：工具或環境出錯（搜尋工具不可用、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。

## 工作

1. 讀 data-files.md「檔案格式」，建 `references.json` 骨架：`contract` 填 `wf-table/1`、`source` 填 `intrigue.md`、`extracted` 填 `2026-10-24`、`columns` 照上面欄位順序、`link_columns` 填 `[]`（連結是 http，不算相對路徑）。
2. 逐部作品查來源、寫列。每列 `situation`＋`struggle` 合計 150–350 字，`technique` 最多三條用「；」隔開。寫完每 6 列跑一次 `inbox_poll.sh`。
3. 跑 tabledb.py 驗 `count` 為 18、JSON 合法。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/cx-intrigue-ref/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 參考作品資料檔（18 列，wf-table/1） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/references.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/cx-intrigue-ref/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。「沒做到」段請逐部標出哪些列的來源只找到一條或品質不佳。

## 驗收（固定 3 條，一條不多，做完就停）

1. `references.json` 存在，`python3 wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/references.json` 印出 `count: 18`、`columns` 與上列欄位順序一致。
2. 18 列每列 `sources` 至少 2 條 `http` 開頭的連結、`technique` 非空、`relevance` 非空。
3. REPORT 存在且四段齊全。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（json 開不了、列數不對）→ 修到對；修不了就刪掉壞檔、發 `FAILED`，REPORT 寫證據。
- **測不出來**（搜尋工具整個不可用）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿憑記憶編的來源冒充查到的連結。

## 完成／阻塞回報（必做）

- 我是誰：`cx-intrigue-ref`。本線團隊：無。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-intrigue-ref --to plan-intrigue PROGRESS '上線，開始查 18 部' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-intrigue-ref --to plan-intrigue DONE '18 部查完，references.json 有 18 列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-intrigue/cx-intrigue-ref/REPORT.md`（失敗時把 `DONE` 換成 `BLOCKED`／`FAILED`、標題改成實際結論）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-intrigue-ref --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格由規劃線代登記。
