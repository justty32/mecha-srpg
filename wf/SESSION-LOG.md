# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [planning] 2026-10-23 專案重做為網頁文字 SRPG（決定見 [decisions](workflows/decisions.md)）；舊程式碼四條 open（介面統一／pytest／mtcore／HTML 導覽）隨之作廢已刪 → 等使用者世界觀／戰鬥系統輸入後由 Fable 寫 spec
- [dispatch] 現役兩條 Opus 領導線：`lead-techstack`（技術棧選型，spike 在 /tmp）、`lead-combat-ref`（BB 機制→機甲可選機制表）；交接書在 [handoffs](workflows/dispatch/handoffs/) → 收線後 commit、把結論交使用者拍板，再由 Fable 寫 spec

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

