# 任務：把 BB「人物、傷勢、士氣與戰後結算」拆解消化成機甲 SRPG 可選機制表片段（14–22 列 json＋REPORT）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes.md`——**親自讀，不靠本交接書的摘要**。

## 背景與唯一目標

使用者決定機甲 SRPG 的戰鬥系統走 Battle Brothers（BB）式、**機甲就是裝備**：駕駛員是持久角色，機甲與部件是裝備；部位佈局、部位打壞的後果、傷害傳到駕駛員的方式都是資料驅動的效果清單（裁示原文在 design-notes）。領導 `lead-combat-ref` 要合併五組片段成一份「可選機制表」給使用者逐條挑。唯一目標：**把下列 BB 拆解檔裡「人物生成與背景、天賦星、升級骰、XP 與 perk、trait、傷勢（暫時／永久）、士氣、死亡與撤退、戰後經驗與戰利品」這些機制，各寫成一列：BB 怎麼做、搬到機甲要怎麼改、對應哪條裁示、建議採用／改造／不採用**。不寫 spec、不定數值。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只讀：`/home/lorkhan/repo/moddings/battle-brothers/wf/workflows/investigations/character-rules.md`、`/home/lorkhan/repo/moddings/battle-brothers/wf/workflows/investigations/character-backgrounds.md`、`/home/lorkhan/repo/moddings/battle-brothers/wf/workflows/investigations/battle-results.md`、`/home/lorkhan/repo/moddings/battle-brothers/wf/workflows/investigations/battle-results-loot-xp.md`；必要時可讀證據表 `/home/lorkhan/repo/moddings/battle-brothers/analysis/character-rules/`、`/home/lorkhan/repo/moddings/battle-brothers/analysis/character-effects/`、`/home/lorkhan/repo/moddings/battle-brothers/analysis/battle-results/`（只讀，用來確認細節，**不當 source**）。
- 只寫：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/fragment.json` 與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/REPORT.md`。
- 不做：世界觀；數值平衡（不寫具體數字建議）；程式碼；重跑 BB 反編譯或工具；讀 `/home/lorkhan/repo/moddings/battle-brothers/vendor/` 或任何反編譯原碼；修改 BB repo 任何檔；上網；讀上列以外的 BB 拆解主題（其他組在做）。
- 件數 gate：片段超過 22 列就停下精簡到 22 列內；容量 gate：兩個產物合計超過 300 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一步跑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bb-character --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線發 PROGRESS、終局回報（正文給 REPORT 檔）|
| `wf/tools/tabledb.py` | 寫完 `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/fragment.json` 驗讀得出與列數 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫上列兩個產物（codex 跑在 `-s workspace-write`，可寫範圍只有 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/` 與 `wf/inbox`）。ROSTER 由領導代登記，你不必寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不 commit、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-bb-character-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 0 個。

**分清錯誤來源**：工具或環境出錯（檔案讀不到、沙箱拒寫）→ 停下發 `BLOCKED`；自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 上線：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bb-character --up PROGRESS 'cx-bb-character 上線，開始消化 人物、傷勢、士氣與戰後結算' < /dev/null`。
2. 讀完上列拆解檔，挑出 14–22 條**對機甲 SRPG 有取捨意義**的機制（一條＝一個可獨立採用或不採用的規則，不把整篇壓成一列、也不把同一規則拆成多列）。
3. 每條寫一列到 `fragment.json`，格式為 wf-table/1（契約見 data-files）：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-23","columns":[下列九欄],"rows":[…]}`。九欄全為字串、全部非空：
   - `id`：`CHR-01` 起連號。
   - `domain`：固定 `人物`（若某列明顯屬於 戰鬥／人物／AI／營運／資料 中的另一類，可改填那一類）。
   - `bb_mechanic`：BB 原版怎麼做，一到三句，含觸發條件與後果。
   - `source`：`【拆解檔絕對路徑】 § 【段名】`，段名必須是該檔某一行標題（`#`／`##`／`###` 開頭那行去掉井號與前導空白）的**完整原文**，使 `grep -F '【段名】' 【檔】` 命中。例：`/home/lorkhan/repo/moddings/battle-brothers/wf/workflows/investigations/character-rules.md § 【該檔某標題】`。
   - `mecha_adaptation`：搬到「駕駛員＝人物、機甲與部件＝裝備、部位有 HP 且可分層、部位效果是資料清單、戰鬥不限單位數、地圖尺寸是資料」設定要怎麼改寫，一到三句。
   - `design_note_ref`：對應 design-notes 2026-10-23 裁示的段名，從這七個裡選一到多個、用「；」分隔：`戰鬥規模與地圖`、`地圖呈現`、`營運層`、`戰鬥系統路線`、`機甲結構`、`部位打壞的後果與傳到駕駛員`、`架構`。
   - `recommendation`：`採用`／`改造`／`不採用` 三選一。
   - `why`：一句理由。
   - `open_question`：使用者要先拍板的一個問題；真的沒有就寫 `無`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 機制片段 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/fragment.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. `REPORT.md` 存在且四段齊全。
2. `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/fragment.json` 讀得出，`count` 在 14–22 之間，每列九欄非空、`recommendation` 只用三個值。
3. 每列 `source` 的檔案存在，且 `grep -F '【段名】' 【檔】` 命中（用一個迴圈全跑，結果寫進 REPORT 一行：`source 核對 N/N 命中`）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（某列 source 對不上）→ 自己改到對上或刪掉該列；列數掉到 14 以下才發 `FAILED`。
- **測不出來**（拆解檔讀不到、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bb-character`。本線團隊：`teams/combatref`。上線先發 `PROGRESS`（工作第 1 步）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bb-character --up 【STATUS】 '【一句自足結論】' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-character/REPORT.md`——會自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bb-character --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論（例：「combat 片段 18 列，source 18/18 命中，建議採用 9／改造 7／不採用 2」），不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
