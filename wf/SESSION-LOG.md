# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [dispatch] 現役實作線 `lead-impl-foundation`（spec 切線 1＋2：core 型別／RNG／事件／內容載入器，node 24 原生 TS、零依賴）→ 收線後開切線 3–5（rules）
- [planning] 舊版 Python 專案已封存 `legacy/`（2026-10-24）；SPEC.md 已改指 `specs/core/`＋`specs/world/`
- [planning] 四條調查／規劃線已收線（技術棧、BB 卷、ToME 卷、世界觀 v1），證據在 `workflows/dispatch/handoffs/done/2026-10-23/`

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

