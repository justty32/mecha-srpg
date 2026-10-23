# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [dispatch] 現役實作線：`lead-legacy-archive`（舊版封存進 `legacy/`、根檔與 wf 文件改指新 spec）→ 完成後 `lead-impl-foundation`（spec 切線 1＋2：core 型別／RNG／事件／內容載入器，node 24 原生 TS、零依賴）開寫 `src/`
- [dispatch] 現役 Fable 規劃線 `plan-world-v2`（套用使用者今晚的推翻與補充，原地修訂 `specs/world/`）→ 收線後世界觀告一段落
- [planning] 專案重做為網頁文字 SRPG（[decisions](workflows/decisions.md)）；舊 Python 版 open 項已作廢 → spec 定案後封存 `src/`／`cpp/`／`docs/` 為 legacy
- [planning] 核心引擎 spec v1 已收線（[specs/core](workflows/planning/specs/core/README.md)，含 9 條實作切線建議）→ world v2 收線後 SPEC.md 改指向、開實作團隊
- [planning] 四條調查／規劃線已收線（技術棧、BB 卷、ToME 卷、世界觀 v1），證據在 `workflows/dispatch/handoffs/done/2026-10-23/`

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

