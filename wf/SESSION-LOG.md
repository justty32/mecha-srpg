# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 膨脹就拆：過大就開 `session_logs/` 按工作流拆檔＋index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [dispatch] 現役 Fable 規劃線 `plan-world-v2`（套用使用者今晚的推翻與補充，原地修訂 `specs/world/`）→ 收線後世界觀告一段落
- [dispatch] 現役 Fable 規劃線 `plan-spec`（核心引擎 spec：資料模型／規則／AI／內容格式／架構 → `planning/specs/core/`）→ 收線後 SPEC.md 改指向新 spec，依其「建議的實作切線」開實作團隊
- [planning] 專案重做為網頁文字 SRPG（[decisions](workflows/decisions.md)）；舊 Python 版 open 項已作廢 → spec 定案後封存 `src/`／`cpp/`／`docs/` 為 legacy
- [planning] 四條調查／規劃線已收線（技術棧、BB 卷、ToME 卷、世界觀 v1），證據在 `workflows/dispatch/handoffs/done/2026-10-23/`

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

