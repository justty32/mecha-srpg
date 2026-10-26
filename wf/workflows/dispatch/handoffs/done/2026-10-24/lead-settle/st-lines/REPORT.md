## 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀）
- `AGENTS.md`（隔離 worktree）
- `wf/workflows/common/user.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/dispatch/handoffs/lead-settle/guide.md`
- `wf/workflows/dispatch/handoffs/talk-world/handover/open.md`

相對路徑均以指定 worktree 為根；另讀開場進度、工作流入口與 inbox 規矩。

## 做了什麼

cx-st-lines 已完成 13 檔的定案標記更新，共 82 個文字替換點；未 commit。依 D1–D14 轉標已定；四期框架沿 D1 與既有 R07 讀法。第二代與本線的提案、提案事件及傳聞原樣保留。D6、D13、D14 無須改標。

未定項目均屬明留問題，未刪項。連珠潮週期與讖語失真原已符合定案。

產出位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-lines/wf/workflows/planning/design-notes/world/`。只改指定 13 檔；既有 `node_modules` 未碰。筆記與輸出在 `/tmp/cx-st-lines/`。

## 逐檔摘要

以下「處」按文字替換點計，一段可含多處；括號內列 D 代碼。檔名均相對上述 world 目錄。

`history-lines.md` 改 6 處（D1、D7）：標記說明「使用者授權先定的標暫值」→「2026-10-24 起，D1–D14 對應的暫值已轉為已定」；數字「待確認」→「已定」，並保留原話「OK」「就用暫定答案」。

`history-lines/a-gate.md` 改 5 處（D7、D9、D10）：「重蝕加連珠（暫值）」→「重蝕加連珠（已定：2026-10-24）」；「R01 採此暫值」→「R01 採此定案」。

`history-lines/b-ancient.md` 改 5 處（D5、D7、D10）：「新的我（暫值）」→「新的我（已定：2026-10-24）」；聚煉歸屬及共同影像同樣改標已定。

`history-lines/c-essence.md` 改 6 處（D1、D2、D3、D5）：「仍按授權暫定」→「已定（2026-10-24）」；數字「提案 v2，待使用者確認」→「數字 v2（已定：2026-10-24）」。

`history-lines/d-moon.md` 改 4 處（D5、D9、D10）：「也要買墟（暫值）」及「最早看見蝕訊（暫值）」→日期已定標記；哈薩克賣墟仍是提案事件。

`history-lines/e-soul.md` 改 4 處（D4、D7、D8、D10）：「暫定讀法（暫值）」→「讀法，已定（2026-10-24）」；辰星通訊窗改已定。

`history-lines/f-rift-line.md` 改 5 處（D1、D9、D10、D11、D12）：「均已暫定成立」→「均成立，已定（2026-10-24）」；撤走精粹矢那一擊改已定。四期中的供應鏈死因與站穩口徑沿既有採用讀法轉標。

`history-lines/g-umbrella.md` 改 7 處（D1、D2、D8、D10、D12）：「十五傘框架沿用暫值」→「十五傘框架已定（2026-10-24）」；東非雙籤城、撒南生物系與兩個政體轉已定。

`history-lines/h-faith.md` 改 8 處（D5、D7、D8、D9、D10、D12）：「第 8 題的細節暫值」→「細節，已定（2026-10-24）」；承擔煉及兩個解拘之夜改已定。

`history-lines.json` 改 16 處（D1、D2、D3、D4、D5、D7、D8、D9、D10、D12）：「精粹為煉成品（暫值）」與「魂核等級定天花板…（暫值）」→日期已定標記；尚未定欄未改。

`history-nodes.json` 改 5 處（D2、D7、D10）：N02 夢召影像、N04 答案形狀、N08 雙籤城、N10 排程及共同影像的「暫值」→日期已定標記；節點接法仍是提案。

`history-timeline.json` 改 7 處（D2、D7、D9、D10）：「月面蝕墟同夜配重蝕，沿授權暫值」→「已定（2026-10-24）」；R08 雙籤城同樣轉標，年月與標題原樣保留。

`history-reconcile.json` 僅「採用讀法（2026-10-24）」改 4 處（D1、D2、D10；R01、R07、R08、R31）：「東非雙籤城（暫值）」→日期已定標記；數字 v2 待確認→已定。其他欄位保留歷史原文；tabledb 儲存另補檔末換行。

## 仍留在尚未定的事

A：門檻人口、公司知情時間與確信度、增加人口的影響，依 guide 保留 open 7.8 提案；記憶內容、能否再封門、蝕壓源頭與 S 領主依 D7 留白。

B：恩底彌翁／銀環血統、赫卡忒／M-3 真相、賣墟後續、刑天是否認伊爾瑟，依 guide「劇情留白」保留；封門能否重做依 D7。

C：R08 雙籤城跨傘權責與 R24 S 級能否墟出，均為 guide 明留項。

D：公司知情、人口門檻、壓艙與地勤家屬關係，依 open 7.8 提案及劇情留白保留；2098 原型演變、N10 動作、M-3 去向與方舟後果亦屬劇情留白。

E：N10 無籤會／公司動作、魂解放或收編結果；F：第二次攻勢結果、收復地歸屬、先破的線、難民結盟；均依 guide「劇情留白」保留。

G：R08 依 D2 明留未定；軍備競賽幅度、N10 破約者與土地歸屬依劇情留白。H：N10 影像及各方回應依 D7 明留未定。上述八線的資料欄同步保留；nodes N08、timeline 殘聯成立列與 reconcile R08 的權責未定亦照舊。

## 殘留

固定 grep 共命中 9 行、10 處語句；逐處理由如下。

`history-lines.md:5` 的「就用暫定答案」是必留使用者原話，「暫值已轉為已定」是交接書指定的標記沿革說明，同一處保留。

`history-lines/e-soul.md:11`「月面背面墟帶位置（暫值）」：open 10 的月海地理讀法，不在 D1–D14；`:15`「不每 52 蝕月重排」：否定舊排程，符合 D10，並非未定週期。

`history-lines/f-rift-line.md:7`「野地住內陸較安全…精粹更遠（暫值）」：open 10 的居住與供給推論，D1 只定數字，未升格此因果。

`history-lines/g-umbrella.md:7`「群島與日…需求因地分岐（暫值）」：各區壓力推論超出 D1 數量分布；`:15`「兩棲機甲與海上獵團地位上升…（暫值）」：政治影響屬 open 10 推論，不在 D1–D14。

`history-lines/h-faith.md:13`「與吉大港同接海岸防衛的壓力（暫值）」：河口來源已有依據，兩地壓力的接法仍是地理推論；不把 D9 的天象定案擴張成地理定案。

`history-lines.json:74`（F 開局狀態）「城往內陸退…歸還黨仍要收港（暫值／提案）」：同 F 線居住與供給推論；`:84`（G 開局狀態）兩處分別為「歐傘兩岸分工…（依 14.2 改讀；暫值）」及「群島與日…海上獵團地位上升（暫值）」：均沿 open 10 的地理／政治推論，未以 D1 數字定案替其升格。

三個 history 資料檔中的 nodes、timeline 無固定 grep 殘留；「提案 v2」「待使用者確認」在驗收範圍均為 0。

逐檔 grep 另掃過 reconcile：其採用讀法欄殘留為 0。以下 15 個歷史欄位命中均按交接書禁止修改，理由相同：R01 的說法甲、說法乙、建議、需誰裁示；R07 建議；R08 說法乙；R26 說法乙與需誰裁示；R27 說法乙與需誰裁示；R29 議題、說法乙、建議；R31 建議；R32 說法甲。以上為歷史紀錄。

## 固定四條驗收

1. 完成指定 grep；上述每處殘留均已說明，數字待確認標記無殘留。
2. 九篇 md 均不超過 8,000 bytes，年表引用序列逐檔與改前完全相同。入口 7035；A 6707、B 6851、C 7106、D 7022、E 6260、F 6716、G 7163、H 6966 bytes。
3. 四檔各跑 tabledb check，皆輸出 `[]`、0 壞連結。列數改前後均為 lines 8、nodes 10、timeline 127、reconcile 32。
4. 本報告第一段逐行列出指定的全部先讀路徑，包含主 repo 與 worktree 的 AGENTS.md。

未加碼執行其他驗收。13 檔件數 gate 未超限；每次改檔後均 grep 並讀 orders，未收到新指示。

## 需要決定的事

無新增待決事項；既有未定題照原狀保留。

## 以後交接書該點名的工具

無。
