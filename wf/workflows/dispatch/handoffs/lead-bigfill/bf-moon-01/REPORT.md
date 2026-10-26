# 已讀清單

下列為親自閱讀的交接書先讀路徑；相對路徑以 worktree 為準。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/d-moon.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/before-collapse.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`
- `content/lore/places/tranquility-city.json`
- `content/lore/places/moonbow.json`
- `content/lore/events/chaebol-ascent.json`
- `content/lore/events/tranquility-strike.json`
- `content/lore/events/whiteglove-incident.json`
- `content/lore/factions/whitegloves.json`
- `content/lore/factions/selene.json`
- `content/lore/factions/ground-union.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/cx-bf-moon-01.md`

`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md` 在本 worktree 不存在，實際替代讀取 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`；其他指定相對檔均存在並已讀。主 repo 與 worktree 的 AGENTS.md 都已親讀。

另讀：`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`。以 tabledb 條件查詢主 repo 的 moon-plan/design-table.json 中 batch=bf-moon-01 的12列，未整份輸出資料表。

## 做了什麼

cx-bf-moon-01 依審定計畫只新增12件：5地點、1匿名住戶群像、3受僱人物、3歷史事件側景。逐件一句與D線／節點／既有年表掛點見 [review-rows.json](review-rows.json)，共12列。每件保留指定光景，五句指定喊話均已進正文；唯一吃食核心是林淑琴。古代機、人口與公司知情不加新答案，2098人駕原型與2105無魂鐵偶各按原史。

先比對主 repo 與 worktree 全部新id與中文名，無撞名，再依人物、地點、群像、事件順序寫入。所有 visibility=public、secrets=[]，無 occurs 欄。本文長度382–468字（含Markdown標題、標點與換行），容量gate未觸發。沒有派子代理，子代理成本為零。

插入候選見 [inserts.json](inserts.json)，共5筆append：塞勒涅與地勤會各加靜海渡月港，地勤會另加分光階、月弓換班屋，靜海市加穹頂住戶。未直接套用。依交接書交 [timeline-add.json](timeline-add.json) 合法空表，不擅增年表建議。

## 產出

新內容位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/content/lore`；明列的12個檔名全部等於id的name段。實際清單在review-rows，三個wf-table/1均使用交接書絕對路徑作source、extracted=2026-10-26。

檢查輸出保存在本目錄：

- [lore-baseline.txt](lore-baseline.txt)：寫前 errors=0 warnings=0。
- [lore-check.txt](lore-check.txt)：寫後 errors=0 warnings=3；三個新增事件均因未出現在timeline警告。
- [npm-check.txt](npm-check.txt)：末行 `OK 0 errors, 10 warnings`，一次執行；警告位於既有base資料。
- [scope-and-reports.txt](scope-and-reports.txt)：固定驗收第3、4條的檔案範圍與表格契約證據。

只有兩項指定Node檢查，沒有加跑typecheck、test、content_accept或wf-lint。既有追蹤檔無修改，新增content恰好12檔；起始已有的未追蹤node_modules保留，未安裝依賴、未commit。

## 沒做到或證據不足的

終局 FAILED：固定驗收第1條未通過，warnings由0增加到3。其餘三條通過。不是工具故障，兩項檢查均可執行，沒有拿舊輸出代替本次結果。

`content/lore/check.ts:248–252` 無條件要求所有非possible事件被年表引用。交接書第10–12件又明定為已發生、occurs不設、年表空，且禁止改既有timeline或check.ts。因此在授權範圍內無法消除這三則警告；把歷史改成possible、改id避檢或修改年表均不符合交接書，未採用。保留12件內容與完整輸出供領導處理。

## 需要決定的事

需領導處理「歷史側景不入年表」與「warnings不得高於baseline」的契約衝突。可在領導權限下裁定側景事件的年表引用方式，或另派工具線釐清免年表側景的表達；本線不改既有資料、不代放寬驗收。

新名依交接書維持提案：靜海渡月港（提案）、望地長廊（提案）、分光階（提案）、月弓換班屋（提案）、穹頂花房（提案）、穹頂住戶（提案）、艾拉・維伊（提案）、韓妍（提案）、林淑琴（提案）、玻璃上的雨（提案）、弓前不返工（提案）、白牆先踏一步（提案）。出生年與側景細部同屬本批創作，未另造規格外專名。

既有朴仁哲斷腿機制不一致、D線知情時間與selene.secrets分層差異，沿計畫留白；本批只寫失去一腿，不覆寫任何既有答案。沒有新增需要跨批引用的id。

## 以後交接書該點名的工具

已點名的lore check、npm check、tabledb、inbox_poll與inbox_mail足夠。若仍要求歷史側景不入年表，派工前應先核lore check的年表覆蓋警告規則，讓固定欄位與警告門檻可同時成立；不增加工人驗收條數。
