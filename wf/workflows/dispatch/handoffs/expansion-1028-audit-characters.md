# 任務：獨立核對八人物的語義重複與世界觀邊界

先讀：`/workspace/scratch/4c78897e16f4/mecha-srpg/AGENTS.md` 及本輪適用 content/batch、world-pillars、ancient-people、lore-text、lore/style/people 與 common/user；本人前階段已全文親讀者可核對閱讀記錄，不只靠別人摘要。

## 背景與唯一目標

由已完工機甲隊 gpt-6.1-sol（xhigh）作獨立交稿後去重，不是代人物隊重寫。原base c09b026；人物新稿在 `/tmp/expansion-1028/wt/characters`，核定八列在主樹 expansion-1028-plan/people-ready.json。

## 範圍（排除法寫死）

只讀人物manifest plannedFiles的十八檔、候選nearest與必要既有相鄰記錄；只可寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-dedupe/characters.json` 與 `/tmp/expansion-1028-audit-characters/`。件數 gate：八主體一輪審查；容量 gate：報告≤64KB、任何Markdown≤8KB；任一超限先報。不做內容修改、測試、引擎/schema/spec、歷史訂單、P01決議或增加審核標的。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 規劃表／索引條件查詢 |
| `wf/tools/content_index.py` | 必要引用背景 |
| `wf/tools/brief_lint.py` | 交接品質 |

## 資源與禁區

唯讀調查線：只寫指定報告。不push/commit/建分支/rebase/reset/刪檔，不GUI/螢幕/鍵鼠，不下載安裝，不秘密設定，不外部CLI agent。子代理上限0，全機最多3平行工人、1重負載；本線不跑任何測試或probe。真正拒絕先查結果，有新相關證據且確知未執行才可一次重試，否則回報。

## 工作

逐篇新lore讀全文，核與plan.nearest、其他最接近現有及draft人物的具體事件／欲望／轉折／功能，而非只比名字；對照自身八篇是否互抄。核人物真做過的事、年代/三系代價/群像與留白。名字全庫精確搜索即可加功能核。正確標既有draft不等verified。若發現高近似或硬違規，給具體兩檔／段落／可觀察差異與最小退修建議，不自行定舊 lore。

## 交付

`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-dedupe/characters.json`，wf-table/1，八列，欄主體/新檔/最近既有/具體比較/判定/需要退修。回報自足摘要與證據路徑。

## 驗收（固定 3 條，做完就停）

1. 八主體各有具體最近既有與交稿後差異，含draft與自身互比，不只比名稱。
2. 有無硬違規、重複風險與退修建議分清；不冒稱技術或使用者敘事驗收。
3. 未改內容或跑重測試，八列報告在指定路徑，回報終局。
