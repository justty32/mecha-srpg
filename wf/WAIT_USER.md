# WAIT_USER — 等待使用者（只列 open）

[INDEX](INDEX.md)｜我的進度另記 [SESSION-LOG](SESSION-LOG.md)

需要**使用者親自**做 / 驗證 / 決定的事：實機測試、外部服務登入、環境變數、權限、付費、需帳號的下載、去開另一個 agent。agent 做到結構性驗證的極限，跨不過的那關記這裡。

條目格式：`- [工作流] 請使用者做什麼 → 做完我接著做什麼`，做完即刪。等別的 session / agent 不記這裡（判別表見 [WORKFLOWS](WORKFLOWS.md)）。

> 膨脹就拆：堆多了就開 `wait-user/` 按類別拆檔，本檔只留一張 `| 類別 | open | 清單 |` 導航表，每列連到 `wait-user/<類別>.md`（照 [STRUCTURE](STRUCTURE.md)）。

## 待使用者項

- [feature-dev] 使用者 2026-10-25 已試玩（戰鬥 http://localhost:5173/、營運 `#/ops`、百科 `#/wiki`、機甲核心與座艙），尚未給具體回饋 → 有回饋就派對應修正線（戰鬥／營運／百科）。戰鬥九項見 [feedback](workflows/dispatch/handoffs/done/2026-10-24/lead-ui-fix/feedback.md)；機甲核心試玩重點見 [lead-cockpit REPORT「需要使用者決定或試玩」四點](workflows/dispatch/handoffs/lead-cockpit/REPORT.md)（駕駛離職就終局的節奏、醒魂「相乘」讀法、長能力節奏、強化打擊／遠程分近遠增傷）
