# handoffs — 交接書存放

[dispatch](../README.md)｜骨架 [TEMPLATE.handoff](../../TEMPLATE.handoff.md)

| 位置 | 放什麼 |
|------|--------|
| `handoffs/<線名>.md` | **現役**交接書，一線一檔；線名同 ROSTER／領地表／inbox session 名（只准 `A-Za-z0-9._-`，codex 線慣用 `cx-` 前綴、Opus 領導慣用 `lead-`）|
| `handoffs/<線名>/` | 該線的附件、`REPORT.md`、`trash/`（KB 級丟棄物）；長出來才建 |
| `handoffs/done/<YYYY-MM-DD>/<線名>.md` | **收線後**移入，檔尾追加「完成證據」段：驗收逐條的證據、`git log --oneline` 的 commit、inbox 終局訊息檔名 |
| `handoffs/done/<YYYY-MM-DD>/<線名>-REPORT.md` | 線的 REPORT（沒有附件夾時直接放這）|
| `handoffs/superseded/` | 被後續決定推翻、沒跑完的；檔頭一行寫為什麼（照 [STRUCTURE](../../../STRUCTURE.md) archive 規則，不刪）|
| `handoffs/{engine-backlog,next-tidy,codex-handover}.md` | 段落交棒文件（非 codex 工作、下次 tidy、codex 接手指南），不是交接書，`wf-lint-local.sh` 不當 brief 掃 |
| `handoffs/STATE.md` | 領導交棒時才有：誰在跑、卡在哪、下一步、誰監看；`inbox_ack.sh --state` 預設也追加到這裡 |

規矩：交接書**進版控**（它是「誰負責什麼」的證據）；線只能讀自己那份、寫自己的 REPORT，不得改交接書；改契約由調度者改並在 `wf/inbox/orders/<線名>.md` 通知。送出前跑 `python3 wf/tools/brief_lint.py handoffs/<線名>.md --strict`。`done/` 堆多了在 `done/README.md` 開一張索引表（線名、日期、一句結論），只准追加。
