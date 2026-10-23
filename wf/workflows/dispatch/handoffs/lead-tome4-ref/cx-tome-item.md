# 任務：把 ToME4「物品、ego 詞綴與神器」拆成機甲 SRPG 可選機制表片段（目標 11 列 json＋REPORT）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes.md`——**親自讀，不靠本交接書的摘要**。

## 背景與唯一目標

使用者裁示機甲 SRPG「一切資料驅動、可擴充」：機甲有零到多個資源池（熱量／電能／生物酸／轉速／本能……）、部位是多層序列、部位壞掉的後果與傳到駕駛員的方式都是效果清單、古代機甲逐台獨有能力、要有 AI（原文在 design-notes）。ToME4（Tales of Maj'Eyal）正是這類設計的成熟範本。領導 `lead-tome4-ref` 要合併五組片段成「可選機制表」第二卷。唯一目標：**把 ToME 的物品資料驅動修飾：`wielder` 穿戴屬性、ego 詞綴（前綴／後綴、`keywords`、ego 疊加與限制）、神器（`unique`、`define_as`、自帶主動技 `use_power`／`use_talent`／`max_power`+`power_regen`、觸發欄位 `talent_on_hit`／`special_on_hit`、`on_wear`／`on_takeoff`）、套裝（set）、隨機神器生成，各寫成一列：ToME 原版怎麼做（附 `檔案:行號`）、搬到機甲設定怎麼改寫、對應哪條裁示、建議採用／改造／不採用**。不寫 spec、不定數值。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只讀（ToME repo 根是 `/home/lorkhan/repo/moddings/tome4/`，全部唯讀）：
  - /home/lorkhan/repo/moddings/tome4/docs/knowledge/items-and-egos.md（只當索引）
  - /home/lorkhan/repo/moddings/tome4/vendor/t-engine4/modules/tome/mod/class/Object.lua
  - /home/lorkhan/repo/moddings/tome4/vendor/t-engine4/engines/te4-1.7.6/engine/interface/ObjectActivable.lua
  - /home/lorkhan/repo/moddings/tome4/vendor/t-engine4/modules/tome/data/general/objects/world-artifacts.lua（取幾個神器實例）
  - /home/lorkhan/repo/moddings/tome4/vendor/t-engine4/modules/tome/data/general/objects/egos/ 底下任選幾檔（取 ego 實例）
  - /home/lorkhan/repo/moddings/tome4/vendor/t-engine4/modules/tome/mod/class/Actor.lua（只看 `onWear`／`onTakeoff`，用 grep 定位）
  - /home/lorkhan/repo/moddings/tome4/vendor/t-engine4/engines/te4-1.7.6/engine/interface/ActorInventory.lua（只看穿脫相關段）
- 只寫：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/fragment.json` 與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/REPORT.md`。
- 不做：ToME 的種族／職業內容、地城／任務／大地圖、UI、粒子、addon 開發流程；其他四組的主題（資源、天賦與 AI、時效效果、傷害結算、物品神器分屬五組，本組只做「物品、ego 詞綴與神器」）；數值平衡（不寫具體數字建議）；程式碼；修改 tome4 repo 任何檔；上網。
- 件數 gate：**目標 11 列**；超過 15 列就停下精簡到 15 列內。容量 gate：兩個產物合計超過 300 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一步跑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-tome-item --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線發 PROGRESS、終局回報（正文給 REPORT 檔）|
| `wf/tools/tabledb.py` | 寫完跑 `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/fragment.json` 驗讀得出與列數 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫上列兩個產物（codex 跑在 `-s workspace-write`，可寫範圍只有 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/` 與 `wf/inbox`）。ROSTER 由領導代登記，你不必寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不 commit、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-tome-item-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 0 個。

**分清錯誤來源**：工具或環境出錯（檔案讀不到、沙箱拒寫）→ 停下發 `BLOCKED`；自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 上線：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-tome-item --up PROGRESS 'cx-tome-item 上線，開始拆 ToME4 物品、ego 詞綴與神器' < /dev/null`。
2. 讀上列原始碼，挑出**目標 11 條**對機甲 SRPG 有取捨意義的機制（一條＝一個可獨立採用或不採用的規則，不把整個系統壓成一列、也不把同一規則拆成多列）。至少 3 列以「古代能力」為主對應：古代機甲＝逐台獨一無二、自帶特殊能力的物件，對照 ToME 神器怎麼做。
3. 每條寫一列到 `fragment.json`，格式 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-23","columns":[下列十一欄],"rows":[…]}`。欄位全為字串，**除 `note` 外全部非空**：
   - `id`：`TM-E01` 起連號（領導合併時重編）。
   - `domain`：固定 `物品`。
   - `ref_game`：固定 `tome4`。
   - `ref_mechanic`：ToME 原版怎麼做，一到三句，含觸發條件與後果；**必須用反引號寫出至少一個識別字**（函式名、欄位名、表鍵），且該識別字原文出現在 `source` 那行 ±5 行內。
   - `source`：`相對路徑:行號`，路徑相對 ToME repo 根、**必須在 `vendor/` 底下的原始碼**（不引 `docs/`），例：`vendor/t-engine4/engines/te4-1.7.6/engine/interface/ActorResource.lua:45`。行號指向能單獨證實這條主張的那一行（定義處或關鍵判斷處）。
   - `mecha_adaptation`：搬到「駕駛員＝人物、機甲與部件＝裝備、機甲有零到多個資源池、部位是有序的層序列、部位後果與傳到駕駛員是效果清單、古代機甲逐台獨有能力、AI 與玩家共用同一動作入口」設定要怎麼改寫，一到三句。
   - `design_note_ref`：從這七個標籤選**最多兩個**、用「；」分隔、**第一個是主對應**：`資源`（機甲的資源池裁示）、`層`（部位的層裁示）、`效果`（部位打壞的後果與傳到駕駛員裁示）、`古代能力`（古代機甲的能力裁示）、`AI`（架構裁示中的「要有 AI」）、`架構`（解耦、資料好擴充）、`戰鬥系統路線`（BB 式、機甲即裝備）。
   - `recommendation`：`採用`／`改造`／`不採用` 三選一。
   - `why`：一句理由。
   - `open_question`：使用者要先拍板的一個問題；真的沒有就寫 `無`。
   - `note`：留空字串（領導合併時填與 BB 卷的互補／衝突）。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 機制片段 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/fragment.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. `REPORT.md` 存在且四段齊全。
2. `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/fragment.json` 讀得出，`count` 在 7–15 之間，每列除 `note` 外十欄非空、`recommendation` 只用三個值、`design_note_ref` 最多兩個標籤且都在七個之內。
3. 每列 `source` 的檔案存在於 `/home/lorkhan/repo/moddings/tome4/`，且 `ref_mechanic` 反引號裡至少一個識別字出現在該行號 ±5 行內（用一個迴圈全跑，結果寫進 REPORT 一行：`source 核對 N/N 命中`）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（某列行號對不上）→ 自己改到對上或刪掉該列；列數掉到 7 以下才發 `FAILED`。
- **測不出來**（原始碼讀不到、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tome-item`。本線團隊：`teams/tome4ref`。上線先發 `PROGRESS`（工作第 1 步）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-tome-item --up 【STATUS】 '【一句自足結論】' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-item/REPORT.md`——會自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-tome-item --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論（例：「item 片段 11 列，source 11/11 命中，建議採用 4／改造 6／不採用 2」），不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
