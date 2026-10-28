# 任務：產出本輪八個有個人衝突的人物與可用駕駛

先讀：`/workspace/scratch/4c78897e16f4/mecha-srpg/AGENTS.md` 與工作區根 AGENTS.md；親自讀 WORKFLOWS、common/user.md 及 working/art、team-model、dispatch/README.md 及 content-batch.md、content/ 全部適用 .md 與 world-pillars 子檔、content/lore/style.md 及 style/people.md、ancient-people/lore-text、templates/numeric-bands/engine-facts 相關列、core人物與world/design-notes適用契約。不靠上層摘要。

## 背景與唯一目標

gpt-6.1-sol（xhigh）依核定 astra 八列計畫產出八human的person+lore，兩展示情境讓人物可用。計畫：`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-plan/people-ready.json`；manifest：`/workspace/scratch/4c78897e16f4/mecha-srpg/content/batches/2026-10/expansion-1028-characters.json`。不續歷史 inbox、舊draft不當verified；歷史朴仁哲P01失腿矛盾留白，新review請用EX-P01等前綴避免混淆。

## 範圍（排除法寫死）

只在 `/tmp/expansion-1028/wt/characters` 新增 manifest.plannedFiles 精確十八檔（八person、八lore character、兩scenario），worktree不留其他檔且HEAD固定原base，禁止commit。另只可寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-characters/` 與 `/tmp/expansion-1028-characters/`。件數 gate：十八內容檔；容量 gate：每檔≤16KB、內容總量≤256KB；Markdown報告≤8KB；任一超限先報。不做主樹content直接寫入、舊檔修改、引擎/schema/spec、新trait/ability/perk/機魂、招募池、歷史事件或年表、新機甲強制引用；不用既有人的待決命運補故事。

完整readlist.json可至64KB；正式報告與metadata合計≤256KB；focused原始log各≤64KB。這不擴大內容檔數或內容檔容量，Markdown仍≤8KB。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 核定計畫/索引條件查詢 |
| `wf/tools/content_gate.py` | 最後focused範圍自查 |
| `src/content/loader.ts` | 最後內容檢查 |
| `content/lore/check.ts` | lore引用與格式檢查 |
| `wf/tools/brief_lint.py` | 交接品質 |

## 資源與禁區

可寫程式碼線：僅上述精確路徑。禁push、commit、建分支、rebase、reset、刪檔、GUI、螢幕、鍵鼠、下載安裝、secret/config變更、外部CLI agent。依賴已按本輪使用者授權裝好，勿再裝。子代理上限0；全機3平行工人/1重負載。本線最後僅focused check/lore/typecheck與gate各一次；不跑npm test/probe/MCP/sim，重驗由領導串行。自己打錯指令路徑可安全修正，真正拒絕先查結果，同拒絕只有新相關證據且確知未執行才可一次重試，否則回報。

## 工作

依八列人物理念與屬性暫填，文筆可微調，不改主衝突。person三池、1–2既有特質與既有信念；兩檔姓名一致，nameEn/etymology留英文意涵。lore全文300–700字，有一件真的做過的事與未被道德結論收掉的棱角；born/faction/role/relations/events齊，gameRefs指本列person，無既有事件也可events空陣列，別假造引用。兩scenario覆蓋八新pilot、每人只坐一台既有frame（生物系用正確拘束/座艙），配裝可用、有玩家敗條件；不保證已在營運招募池接線。先自己比對計畫最近敘事，最後focused檢查與gate，回報領導接重驗。

## 交付

`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-characters/REPORT.md`（開頭已讀清單逐條列manifest.report.mustRead，完整readlist.json）、review.json（八列EX-P前綴，每件≤60字繁中介紹）、naming.json、focused-results.json與原始logs。報告分做了什麼/驗收證據/平衡待驗/需要決定；未跑不得標pass。回覆五行自足摘要與REPORT路徑。

## 驗收（固定 3 條，做完就停）

1. 十八精確檔存在，八人物對應且無新非human或未授權引用；無領地外改動。
2. 八列review短介紹與naming英文意涵齊；REPORT逐條列mustRead、數值帶與語義區別，完整已讀在readlist。
3. focused check/lore/typecheck與gate有原始證據、無新錯誤；重驗未跑明列，等待領導，不自行commit或帶回。

## 完成證據

本線已回報終局；本輪產出與獨立後查由原生工具收件。報告／帳本保持原reportDir，整輪技術結論及未驗項目見本輪領導REPORT；後續lead整合檢查不代表工人仍在執行。
