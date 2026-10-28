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
| `handoffs/STATE.md` | 領導交棒時才有：誰在跑、卡在哪、下一步、誰監看（只放交棒內容，不放 ack 流水）|
| （ack 流水）| `inbox_ack.sh --state` 的一行流水 2026-10-24 起預設寫 `wf/inbox/done/ack-log.md`（放信處、不在本資料夾）；`--state-file` 可改 |

規矩：交接書**進版控**（它是「誰負責什麼」的證據）；線只能讀自己那份、寫自己的 REPORT，不得改交接書；改契約由調度者改並在 `wf/inbox/orders/<線名>.md` 通知。送出前跑 `python3 wf/tools/brief_lint.py handoffs/<線名>.md --strict`。收線索引在 [done/README.md](done/README.md)（日期、線名、一句結論），只准追加；收線時把 `handoffs/<線名>/` 整個 `git mv` 進 `done/<日期>/`，裡面 `.ts`／`.py` 工具的相對 import 要跟著補兩層 `../`。

## 七輪世界觀：創作完成，整合待驗收

[待驗收摘要](tidy-world-1027/pending.md)｜[第一輪](lead-world-life-1027/README.md)｜[第二三輪](lead-world-next-1027/README.md)｜[第四至七輪](lead-world-more-1027/README.md)｜[整理證據](tidy-world-1027/README.md)

三批各自 briefs/ 存放已執行創作契約與歷史證據，不是現役派工清單。報告與 manifest reportDir 原位置保留；報告所載狀態為當時快照。全部 draft、整合留回家，不移 done/archive，不代替四條舊線收線。

## SVG美術試作

[首批交付](svg-art-1027/README.md)：人物、機甲、環境、戰場格與特效的離線SVG樣張已完成，無現役工人；[展示與用法](../../../../art/svg-study-1027/README.md)待畫風評閱。

[機甲階層細節](mech-layers-1027/README.md)：延續紙娃娃，大／中／細零件樹與百層檢視已交付，無現役工人，待實機評閱。

兩批成果 `2863782`／`04bf2dd` 已提交並 push。已執行契約在各批 briefs/，報告／API 契約／程式／圖像證據維持原位置，未完成遊戲整合。[下次看圖與回家驗收](../../../notes/art-review-2026-10-27/README.md)。

## Canvas礁鷹試作

[本輪已交付](done/2026-10-28/lead-canvas-1028/README.md)：全新Canvas＋Konva分層機甲，基本整機與互動已過，無本輪現役工人；3D另輪。

## 衡岳真3D試作

[本輪已交付](done/2026-10-28/lead-mech3d-1028/README.md)：Three真體積/360相機/分層互動與六圖已過，無本輪現役工人，細部留主觀評閱。
