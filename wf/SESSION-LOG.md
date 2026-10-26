# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [dispatch] 2026-10-26 lead-bigfill 暫停（2026-10-26 晚）：215 件已入庫 634e7ad0 → 接續見 `wf/workflows/dispatch/handoffs/lead-bigfill/report.md`


## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

- [dispatch] 2026-10-26 lead-fill-gear open：填充機甲部件、武器、戰利品與市場商品 → 交接區 `wf/workflows/dispatch/handoffs/lead-fill-gear/`（暫停 2026-10-26 晚→接續見 report.md）
- [dispatch] 2026-10-26 lead-fill-pilots open：暫停（2026-10-26 晚）→ 接續見 report.md；填充可玩駕駛員與船員（招募池、背景、persons、少數 lore 人物）；codex 兩段式 → 交接區 `wf/workflows/dispatch/handoffs/lead-fill-pilots/`
- [dispatch] 2026-10-26 lead-small open：北岸改區擴大（既有蝕區轉淺蝕）＋第三刃營運勢力 → 交接區 `wf/workflows/dispatch/handoffs/lead-small/`
