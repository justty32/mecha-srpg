# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [content] lead-polish 現役（2026-10-25）：B5 翻譯腔重審三批 polish dl-01／02／03 並行開跑（codex gpt-6-astra），驗收後逐批合入 → [b5/guide](workflows/dispatch/handoffs/lead-decide-land/b5/guide.md)
- [feature-dev] lead-cockpit 現役（2026-10-25）：engine-backlog 30（機甲核心與座艙狀態、白手套六情境）→ 47／48／49；codex 工人 cx-cockpit-core 先跑 → [handoffs/lead-cockpit](workflows/dispatch/handoffs/lead-cockpit/)

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

