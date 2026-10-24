# WAIT_USER — 等待使用者（只列 open）

[INDEX](INDEX.md)｜我的進度另記 [SESSION-LOG](SESSION-LOG.md)

需要**使用者親自**做 / 驗證 / 決定的事：實機測試、外部服務登入、環境變數、權限、付費、需帳號的下載、去開另一個 agent。agent 做到結構性驗證的極限，跨不過的那關記這裡。

條目格式：`- [工作流] 請使用者做什麼 → 做完我接著做什麼`，做完即刪。等別的 session / agent 不記這裡（判別表見 [WORKFLOWS](WORKFLOWS.md)）。

> 膨脹就拆：堆多了就開 `wait-user/` 按類別拆檔，本檔只留一張 `| 類別 | open | 清單 |` 導航表，每列連到 `wait-user/<類別>.md`（照 [STRUCTURE](STRUCTURE.md)）。

## 待使用者項

- [planning] 世界觀與 BB 式細節／營運層範圍（已裁示的見 [design-notes](workflows/planning/design-notes.md)）→ Fable 寫 spec，再派線
- [feature-dev] 請使用者 `npm run dev` 開 http://localhost:5173/ 試玩 lead-ui-fix 改版，九項逐條確認（見 [feedback](workflows/dispatch/handoffs/lead-ui-fix/feedback.md)）→ 回饋後派下一輪 UI 修正
- [feature-dev] 請使用者開 http://localhost:5173/#/ops 試玩營運畫面：接約→航行→出戰（親自指揮）→回營運看戰果；回饋手感、記錄是否太吵、世界圖可讀性、存讀檔 → 回饋後派營運 UI 修正線
