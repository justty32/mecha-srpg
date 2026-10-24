# WAIT_USER — 等待使用者（只列 open）

[INDEX](INDEX.md)｜我的進度另記 [SESSION-LOG](SESSION-LOG.md)

需要**使用者親自**做 / 驗證 / 決定的事：實機測試、外部服務登入、環境變數、權限、付費、需帳號的下載、去開另一個 agent。agent 做到結構性驗證的極限，跨不過的那關記這裡。

條目格式：`- [工作流] 請使用者做什麼 → 做完我接著做什麼`，做完即刪。等別的 session / agent 不記這裡（判別表見 [WORKFLOWS](WORKFLOWS.md)）。

> 膨脹就拆：堆多了就開 `wait-user/` 按類別拆檔，本檔只留一張 `| 類別 | open | 清單 |` 導航表，每列連到 `wait-user/<類別>.md`（照 [STRUCTURE](STRUCTURE.md)）。

## 待使用者項

- [feature-dev] 請試玩**戰鬥** http://localhost:5173/（`npm run dev`；九項見 [feedback](workflows/dispatch/handoffs/done/2026-10-24/lead-ui-fix/feedback.md)，另有意圖撤退、擊退勝）→ 派戰鬥修正線
- [feature-dev] 請試玩**營運** `#/ops`：接約→航行→親自出戰→看戰果；回饋手感、記錄、世界圖、存讀檔、債務 → 派營運修正線
- [feature-dev] 請試玩**百科** `#/wiki`（F1 進出、搜尋、交叉連結、年表）→ 派百科修正線
