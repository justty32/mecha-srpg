# handoffs — 交接書存放

[dispatch](../README.md)｜骨架 [TEMPLATE.handoff](../../TEMPLATE.handoff.md)

| 位置 | 放什麼 |
|------|--------|
| `handoffs/<線名>.md` | **現役**交接書，一線一檔，收線即刪；線名同 ROSTER／CLAIMS／inbox session 名（只准 `A-Za-z0-9._-`，codex 線慣用 `cx-` 前綴、Opus 領導慣用 `lead-`）|
| `handoffs/<線名>/` | 該線的附件夾：交接書附件、`REPORT.md`、必要的小型結果（每線合計 ≤ 1 MB）；長出來才建 |
| `handoffs/<線名>/raw/` | 原始 log、tap、jsonl、gz、截圖、MCP 錄音；**不進版控**（`.gitignore`），只留本機 |
| `handoffs/<線名>/trash/` | KB 級丟棄物，不進版控 |
| `handoffs/STATE.md` | 領導交棒時才有：誰在跑、卡在哪、下一步、誰監看；交棒結束即刪 |

規矩：交接書**進版控**（它是「誰負責什麼」的證據）；線只能讀自己那份、寫自己的 REPORT，不得改交接書；改契約由調度者改並在 `wf/inbox/orders/<線名>.md` 通知。送出前跑 `brief_lint.py --strict`。

**git 歷史即封存**：沒有 `done/`、`superseded/`。收線時收線證據（驗收逐條結果、commit 清單、終局訊息摘要）寫進收線 commit 訊息，剩餘工作每件追加一列到 [engine-backlog](engine-backlog.md)，然後 `git rm -r` 交接書與附件夾；活文件裡指向它們的連結改純文字（要追溯就寫 commit hash）。

**報告保留期**：線收掉，報告跟著刪。審查、驗證、試玩這類單次報告，在下一份同類報告產生時或 14 天後刪除，先到者為準；刪前結論要先併進 backlog、decisions 或 spec。

## 現況（2026-11-05）

<!-- wf-nav -->
- [verify-head-1105](verify-head-1105/REPORT.md)：HEAD 整合驗收基準（1143/1143）。
- [audit-paused-1105](audit-paused-1105/REPORT.md)：四條暫停線的唯讀審查；四線已依此收線。
- [playtest-1105](playtest-1105/REPORT.md)：agent 試玩報告，fix-playtest-1105 依此修正。
- [engine-backlog](engine-backlog.md)：非 codex 的引擎工作清單。
- `codex-batches.json`：可直接開的內容批次（content 工作流用）。
