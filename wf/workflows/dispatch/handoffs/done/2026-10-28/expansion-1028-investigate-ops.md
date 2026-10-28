# 任務：定位本輪新增內容可能影響營運隨機池的入口

先讀：`/workspace/scratch/4c78897e16f4/mecha-srpg/AGENTS.md`、common/user、common/conventions與code-map的ops相關列、investigation工作流；本人此前content規矩閱讀證據可沿用，不靠摘要。

## 背景與唯一目標

全輪整合suite出現MCP sortie燃料、wait終局日及營運黃金hash失敗，乾淨c09三項對照正排隊（不可在本線另跑）。尚未證明是本輪或舊問題。只定位三類新增資料可能進營運隨機選擇的實際程式入口，為若有回歸準備窄修，不擅自修引擎。

## 範圍（排除法寫死）

只唯讀src/ops與直接引用的content loader/相關test，以及本輪52檔；只可寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-dedupe/ops-impact.json` 與同目錄 `pack-feasibility.json`。件數 gate：最多三條資料流（frame/model、monster、person）；容量 gate：每份報告≤16KB；任一超限先報。不做內容／engine／schema／spec／黃金修改，不跑測試、不重跑全套，不查無關歷史問題或舊任務。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | code map／索引限定查詢 |
| `wf/tools/brief_lint.py` | 交接品質 |

## 資源與禁區

唯讀調查線：只寫指定報告，子代理0。禁push/commit/刪檔/GUI/鍵鼠/螢幕/安裝下載/secret-config/外部CLI agent。不啟動任何重負載；全機同時只有一條整合suite，基底對照已由lead排隊。真正拒絕先查結果，有新相關證據且確知未執行才可一次重試，否則回報。

## 交付

`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-dedupe/ops-impact.json`，wf-table/1，列實際函式／過濾條件／新增資料可能改變的選擇／可用的既有資料隔離方式；明確區分證據與尚未證實的推測。先回報重要函式與結論，不等打磨全文。

## 驗收（固定 2 條，做完就停）

1. 三條以內資料流有實際程式位置與判斷，不能把未證實回歸說成舊問題或確定原因。
2. 未做任何修改／測試，報告在指定路徑且只給既有契約內可行的窄修選項；若無隔離機制如實說，別發明tag或engine行為。

## 唯讀補問（同一窄調查）

確認既有optional pack的browser／MCP／probe啟用入口、lore跨pack引用和gate約束，五分鐘內交可行性；不搬檔、不測試、不修改引擎或新內容。追加同目錄pack-feasibility.json，不擴大到修復實作。

## 完成記錄

兩份唯讀報告已交，未改內容或測試。父線暫不做optional；全部九條基底對照由lead完成。內容技術ACCEPT而整合未全綠，等待使用者交付裁決，不把資料流可達性當成已證實因果。
