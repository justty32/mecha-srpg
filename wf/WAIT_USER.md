# WAIT_USER — 等待使用者（只列 open）

[INDEX](INDEX.md)｜我的進度另記 [SESSION-LOG](SESSION-LOG.md)

需要**使用者親自**做 / 驗證 / 決定的事：實機測試、外部服務登入、環境變數、權限、付費、需帳號的下載、去開另一個 agent。agent 做到結構性驗證的極限，跨不過的那關記這裡。

條目格式：`- [工作流] 請使用者做什麼 → 做完我接著做什麼`，做完即刪。等別的 session / agent 不記這裡（判別表見 [WORKFLOWS](WORKFLOWS.md)）。

> 膨脹就拆：堆多了就開 `wait-user/` 按類別拆檔，本檔只留一張 `| 類別 | open | 清單 |` 導航表，每列連到 `wait-user/<類別>.md`（照 [STRUCTURE](STRUCTURE.md)）。

## 待使用者項

- [content] 裁決人物清單 P01 朴仁哲失腿採前盾撞碎或閘門夾斷；其餘內容候選一併待審 → [審閱入口](notes/investigations/content-review-2026-10-27/README.md)。
- [planning] 使用者另開 Claude Fable 後，交付 [設計報告題綱](notes/investigations/content-review-2026-10-27/fable-brief.md)；取得報告與裁決後再派實作。

- [testing] 2026-10-27 使用者指定整合驗收留到家裡，公司 WSL 不安裝 → 回家通知接續後，依 [接續清單](workflows/dispatch/handoffs/next-session.md) 核對目前 HEAD 與黃金，再執行必要驗證；本次不視為已驗收。

- [feature-dev] 使用者 2026-10-25 已試玩（戰鬥 http://localhost:5173/、營運 `#/ops`、百科 `#/wiki`、機甲核心與座艙），尚未給具體回饋 → 有回饋就派對應修正線（戰鬥／營運／百科）。戰鬥九項見 [feedback](workflows/dispatch/handoffs/done/2026-10-24/lead-ui-fix/feedback.md)；機甲核心試玩重點見 [lead-cockpit REPORT「需要使用者決定或試玩」四點](workflows/dispatch/handoffs/done/2026-10-25/lead-cockpit/REPORT.md)（駕駛離職就終局的節奏、醒魂「相乘」讀法、長能力節奏、強化打擊／遠程分近遠增傷）

- [feature-dev] SVG美術、紙娃娃與機甲百層／五層深度演出待評閱；實際瀏覽器互動／動畫回家驗 → [展示與用法](../art/svg-study-1027/README.md)。
