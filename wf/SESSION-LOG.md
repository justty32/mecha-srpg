# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [dispatch] 2026-10-24 使用者重開程式前全停：ai 已收線；`plan-ops-spec` 中止、半成品在 `specs/ops/`；續行點 [handoffs/STATE.md](workflows/dispatch/handoffs/STATE.md)
- [dispatch] 2026-10-24 `lead-impl-sim` 開工：sim 模組＋三個整合缺口，工人 cx-sim-engine／cx-sim-gaps → [handoffs/lead-impl-sim/](workflows/dispatch/handoffs/lead-impl-sim/contract.md)

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

