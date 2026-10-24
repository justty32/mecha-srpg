# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [content] lead-rename 已收線（2026-10-24）：全庫改名 18＋3 批收件、定案表 `design-notes/terms-rename.json`；待頂層代存 REPORT 並裁示「需要決定」4 項（src 顯示字串、刪兩份 residuals.json、lc-field-01 收件後再掃、全面翻譯腔重審）→ [handoffs/lead-rename](workflows/dispatch/handoffs/lead-rename/)
- [feature-dev] lead-tune 進行中（2026-10-24）：P1 首輪撤退／anchored／出戰數＋`part:undefined`（已 commit `b95dcd4`）；工人 cx-tune-intent、cx-tune-human 在跑 → [lead-tune](workflows/dispatch/handoffs/lead-tune/)
- [feature-dev] lead-grid：方格大地圖實作（engine-backlog P1）進行中，第一波 grid 核心＋長陸／月面樣本已 commit；第二波 cx-grid-migrate 跑中（`world/nodes/`→`places/`、`ferry.json`→`lanes/`、`routes/` 移出 content；lead-rename 若要改這些檔請等第二波 commit 後在新路徑改） → [handoffs/lead-grid](workflows/dispatch/handoffs/lead-grid/PLAN.md)
- [dispatch] 2026-10-24 段落收尾：lead-codex-pilot 已收線（REPORT 在 handoffs/lead-codex-pilot/）；現役 lead-wrapup（等第二階段寫 codex-handover）；新 session 從交棒書讀起 → [handoffs/STATE](workflows/dispatch/handoffs/STATE.md)

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

