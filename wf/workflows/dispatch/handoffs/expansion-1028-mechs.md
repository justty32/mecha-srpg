# 任務：產出本輪八台有戰術取捨的衍型機

先讀：`/workspace/scratch/4c78897e16f4/mecha-srpg/AGENTS.md` 與工作區根 AGENTS.md；親自讀 WORKFLOWS、common/user.md 及 working/art、team-model、dispatch/README.md 及 content-batch.md、content/ 全部適用 .md 與 world-pillars 子檔、content/lore/style.md 及 style/people.md、mechs.md、templates/numeric-bands/engine-facts 相關列、core 類別契約與 world/design-notes 適用設定。不只靠摘要；以當前code/tests優先判斷過期規矩的現況，不修改規矩。

## 背景與唯一目標

gpt-6.1-sol（xhigh）依已核定 astra 八列計畫產出一批不同主動配裝取捨的衍型機。計畫：`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-plan/mechs-ready.json`；manifest：`/workspace/scratch/4c78897e16f4/mecha-srpg/content/batches/2026-10/expansion-1028-mechs.json`。不續辦歷史 inbox、不把舊draft當verified、P01失腿矛盾不裁決。

## 範圍（排除法寫死）

只可在 `/tmp/expansion-1028/wt/mechs` 新增 manifest.plannedFiles 精確十八檔（八frame、八model、兩scenario），不在worktree留其他檔。worktree HEAD固定原base，禁止commit。另可寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-mechs/` 與 `/tmp/expansion-1028-mechs/`。件數 gate：十八內容檔；容量 gate：每檔最多16 KB、內容合計最多256 KB，Markdown報告最多8 KB；任一超限先回報。不做主樹content直接寫入、既有內容修改、引擎/schema/spec、舊faction、市場、其他隊檔案。不得換概念或追加檔。

完整readlist.json可至64KB；正式報告與metadata合計≤256KB；focused原始log各≤64KB。這不擴大內容檔數或內容檔容量，Markdown仍≤8KB。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 規劃／索引條件查詢，不整片讀 |
| `wf/tools/content_gate.py` | 最後focused範圍自查，manifest放主樹 |
| `src/content/loader.ts` | 最後一次內容檢查 |
| `content/lore/check.ts` | 最後一次lore檢查 |
| `wf/tools/brief_lint.py` | 交接品質 |

## 資源與禁區

可寫程式碼線：僅上述精確路徑。禁push、commit、建分支、rebase、reset、刪檔、GUI、螢幕、鍵鼠、下載安裝、秘密/設定變更、外部CLI agent。測試依賴已獲使用者本輪授權，由領導裝好。子代理上限0；全機最多3平行工人、1重負載。本線只跑focused check/lore/typecheck，不跑npm test/probe/MCP/sim；重驗由領導串行。自己打錯指令/路徑可安全修正；真正拒絕先查結果，同拒絕只有新相關證據且確知未執行才可一次重試，否則回報。

## 工作

依八列計畫與範本產出，數值同級暫填，文字可微調。frame必有實際可裝的defaultLoadout、血統/系列tags、nameEn/etymology；英文命名另記naming.json，不亂填aka。兩scenario合計覆蓋八新機，既有pilot不重複、有玩家敗條件；不加pilot。model前代/月分照計畫。若槽/部件不相容，在允許的新檔內最小調整並報具體證據，不能動舊件或改核心概念。新主動配件在試玩需可用，無法由AI有效使用的風險列REPORT。最後跑一次focused檢查、gate，寫報告，讓領導接手重驗。

## 交付

`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-mechs/REPORT.md`（開頭已讀清單逐條列manifest.report.mustRead；完整已讀仍放readlist.json）、review.json（八列繁中介紹，每件≤60字）、naming.json、focused-results.json與檢查原始log。報告分做了什麼/驗收證據/平衡待驗/需要決定；未跑不可標pass。回覆五行自足摘要與REPORT路徑。

## 驗收（固定 3 條，做完就停）

1. 十八精確內容檔存在；REPORT/readlist記自己親讀規矩及範本，沒有領地外改動。
2. review.json八列≤60字繁中介紹、naming.json八列英文意涵；REPORT列數值帶/配裝與語義去重差異。
3. focused check/lore/typecheck與gate結果具證據，無新錯誤；重測試未跑明列，由領導接手，不自行commit或帶回。
