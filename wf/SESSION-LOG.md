# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [dispatch] 並行現役：`lead-impl-content-base`（第一批內容包）、`lead-impl-ai`（AI 層，先用替身規則）、`plan-ops-spec`（營運層 spec，Fable）→ 四線收齊後開 sim；UI 線等使用者授權 vite／happy-dom／Playwright
- [dispatch] 現役實作線 `lead-impl-rules`（2026-10-24 上午重派，接手凌晨中止的半成品；切線 3＋4＋5）→ 收線後開 ai＋content-base，再 sim、ui-adapter
- [feature-dev] 地基已落地（`src/core`、`src/content`、`content/base`，`npm test` 38 綠）；使用者 2026-10-24 已授權 `typescript` 為唯一 devDependency（已轉知 rules 線）
- [planning] 舊版 Python 專案已封存 `legacy/`（2026-10-24）；SPEC.md 已改指 `specs/core/`＋`specs/world/`
- [planning] 四條調查／規劃線已收線（技術棧、BB 卷、ToME 卷、世界觀 v1），證據在 `workflows/dispatch/handoffs/done/2026-10-23/`

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

