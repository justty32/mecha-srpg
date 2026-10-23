---
from: cx-tome-talent
to: lead-tome4-ref
status: DONE
at: 2026-10-23T21:53:19+08:00
---
# talent 片段 14 列（天賦 8／AI 6），source 14/14 命中，建議採用 1／改造 12／不採用 1

# cx-tome-talent：ToME4 天賦與戰術 AI 機制片段

## 做了什麼

依交接書親讀專案 AGENTS 與指定 wf 規矩；上線已寄 PROGRESS，每個工作步驟後輪詢 orders。以指定的 ToME4 vendor 原始碼為證據，知識文件只作索引，整理 14 條可獨立取捨的機制：天賦 8 條、AI 6 條。涵蓋模式、成本、冷卻、需求、目標幾何、使用前檢查、啟閉生命週期、等級，以及 AI 隨機基線、候選、選目標、效果權重、需求與最終選招。

機甲改寫均為候選設計：駕駛員是人物，機甲與部件是裝備；能力與成本依來源實例解析，古代能力可獨立定義。未制定 spec 或平衡數值。只寫本目錄交付物並使用授權信箱工具，沒有修改 ToME4 原始碼。

## 產出

[fragment.json](fragment.json) 為 wf-table/1，共 14 列、11 欄，ID 為 TM-B01 至 TM-B14；採用 1／改造 12／不採用 1。每列含 vendor 檔案行號、原版規則、機甲改寫、裁示標籤、理由與待決問題；note 均留空。

完整產物路徑：

- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-talent/fragment.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-talent/REPORT.md`

固定三條驗收均通過：REPORT 存在且四段齊全；tabledb 可讀且 count=14，各列除 note 外十欄非空、recommendation 與 design_note_ref 均符合交接書；全部來源以同一迴圈核對檔案與行號前後五行的反引號識別字。只執行這三條，未追加驗收。

source 核對 14/14 命中

交付前容量 gate：兩份產物約 16 KB，未達 300 KB；列數為目標 14 列，未觸及超過 18 列的停止條件。

## 沒做到或證據不足的

無阻塞。這是指定檔案的靜態調查，未執行 ToME4 或推論所有 NPC 都走同一 AI。引擎 talented.lua 的隨機選招與模組 tactical.lua 的權重選招分開記錄；ActorAI.lua 的引擎 aiPreUseTalent 本體只回傳 true（第 221–223 行），不能把模組擴充行為誤記為引擎保證。

目標傳遞有靜態疑點：`vendor/t-engine4/modules/tome/mod/ai/tactical.lua:190–191` 將 force_target 存在候選項內，但 `:440` 讀的是候選清單 selected_talents.force_target，並未取被選中的第一項。未做執行時驗證，因此不宣稱這條強制目標路徑有效；TM-B11／TM-B14 的機甲改寫明確要求評估與執行傳遞同一目標。

知識索引的行號與部分說法不能取代本次原碼：例如 `vendor/t-engine4/modules/tome/mod/class/Actor.lua:6520–6521` 已有 postUseTalent hook。表格一律引用本次讀到的 vendor 行號。

## 需要決定的事

各機制的單一待決問題已放在 fragment.json 的 open_question，供領導合併；主要涉及能力歸屬與成長、換裝後冷卻、部位選擇、維持能力失效後果，以及 AI 的情報範圍與平分策略。這些是採用機制前的設計選擇，不阻塞本次調查交付。

若後續實作參考舊戰術 AI，需決定是否重寫目標傳遞並驗證上述 force_target 疑點；這超出本次只讀機制表的範圍。其他 AI 檔案與資源／效果／傷害內部實作留給對應調查線，本線不延伸拆解。

## 以後交接書該點名的工具

無。
