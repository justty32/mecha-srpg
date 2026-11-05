# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 上限 4096 bytes：超過代表有做完的項沒刪，先刪再說，不拆檔（照 [STRUCTURE](STRUCTURE.md)）。收工狀態只寫這裡一行和 commit，不另寫收工流水。

## 最新進度

- [feature-dev] fix-playtest-1105：試玩問題與平衡修正進行中（隔離 worktree，Opus）→ 完成後由頂層 merge／[試玩報告](workflows/dispatch/handoffs/playtest-1105/REPORT.md)
- [feature-dev] Fable 三題已裁決（2026-11-05），實作排在 fix-playtest 合併之後，避免同時改戰鬥碼與黃金 → [報告](notes/investigations/content-review-2026-10-27/fable-report.md)
- [testing] 使用者 2026-11-05 不追認 a3407d97 對黃金與斷言的改寫；待 fix-playtest 合併後開 Opus 線，逐條比對 10/28 九條的行為改變 → [驗收基準](workflows/dispatch/handoffs/verify-head-1105/REPORT.md)
