# 任務：產出並驗證核定的四個戰鬥內容概念
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/playtest.md`、`wf/workflows/dispatch/content-batch.md`、`wf/workflows/testing.md`及每類content規矩；所有實質工人親自讀，REPORT列已讀清單。
## 背景與唯一目標
使用者要持續填充至本日23:00。astra於night-combat-plan-1028設計2機甲2怪獸，主線逐批核可後才可實作。你是sol領導，派sol產稿，按新單位用途/差異/平衡與可執行證據驗收；不能只收JSON合法。
## 範圍
只寫本線 `wf/workflows/dispatch/handoffs/night-combat-lead-1028/`、`content/batches/2026-10/night-cm-*.json`與`night-ck-*.json`、核可manifest凍結的 `content/base/frames/night-cm-*.json`、`content/base/monsters/night-ck-*.json`、`content/base/abilities/night-cm-*.json`／`night-ck-*.json`、`content/base/effects/night-cm-*.json`／`night-ck-*.json`、`content/base/scenarios/night-cm-*.json`／`night-ck-*.json`；另明確授權 `content/base/bodyplans/night-cm-twinwick.json` 與 `content/base/components/night-cm-cinderbell.json`；另核定CK精確8檔：species/night-ck-crookbow.json、species/night-ck-keeljaw.json、bodyplans/night-ck-crookbow.json、bodyplans/night-ck-keeljaw.json、frames/night-ck-bio-crookbow.json、frames/night-ck-corpse-crookbow.json、frames/night-ck-bio-keeljaw.json、frames/night-ck-corpse-keeljaw.json（均在content/base/）；其餘kind需先向主線明列路徑取得範圍擴充。接受後重產content/index。
不做：任何既有內容修改、世界模型/市場/招募取得接線、lore/timeline、src/schemas/specs/art/依賴、黃金重錄、舊draft接受、全套suite。新單位僅展示可用，取得未接不能寫已進戰役市場。
件數 gate：2批，每批≤20新內容JSON，合計≤40；每批2單位、1展示情境；容量 gate：每檔≤16KB（bodyplan若另授權24KB），本線證據≤20MB；最多退修2輪，任何超界先回報。
## 必用工具
| 工具 | 用途 |
|---|---|
| `git worktree add --detach` | 每批隔離 |
| `python3 wf/tools/brief_lint.py` | 派工前strict0 |
| `python3 -I wf/tools/content_gate.py` | 白名單／欄位保護及carry |
| `bash wf/tools/content_accept.sh` | 固定checks驗收、保留真實結果 |
| `python3 wf/tools/tabledb.py` | 資料與引擎事實有界查詢 |
| `node src/mcp/server.ts` | stdio MCP試玩 |
| `npm run content:probe` | 同級5seed探針與參照 |
| `npm run content:index` | staged來源產索引 |
## 資源與禁區
**可寫程式碼線**：只准content白名單與本線報告，不准引擎程式。子代理最多2並行，全機包含astra最多3工人，後代也計入。model普通sol、雜活terra、設計需改先向主線/astra回報，可再派模型不限但不得超資源。
任何probe/sim/MCP auto/單檔test都視為重負載：先工具向主線請求時段，主線核准後nice19、最多兩CPU，串行完成，其他線不可同跑。工人先只寫資料與lore/check/typecheck，重負載由領導排隊或指定單一工人。禁止完整npm test/test:dom/e2e/fuzz，不濫跑。禁止GUI/鍵鼠螢幕/截圖/下載安裝/刪檔/清worktree/全域設定/git reset或rebase。main commit沿用主線授權窗口，只add明確檔，push主線統一。
## 主線時段授權

2026-10-28 21:48至22:25（Asia/Taipei），本領導獨占全機本任務重負載窗口，可依序跑第一輪lore wiki窄測、CM、CK核定驗證；全程單一runner、nice19、最多兩CPU，不需各子步重問。超時或超過兩輪退修回報，不擴全套。

## 工作
1. 主線核可後依PLAN凍結manifest及brief、建立隔離worktree；必須先查重再寫，再查重後交。brief_lint strict0，REPORT首段已讀清單。
2. 凍結每新單位數值帶／基準對手；只有新單位及新scenario可微調，禁止改基準或AI過門檻。配裝、部位、能力要有實際戰鬥差異與弱點，顯示文字遵style。
3. gate/check/typecheck；安排單機串行5seed probe（單位與必要參照）及新能力AI使用≥1次、5seed零例外、無五場無效timeout。新能力沒用就查配置與既有AI支援，不能假稱設定已生效。反應技能需直接機制證據。
4. 每批至少1場MCP展示到outcome、另至少3回合合法操作，原始記錄與wf-table/1 playtest保存；不擅改腳本降低標準。同級單方全勝等不平衡旗標依workflow修訂或明確保留，不任意新增waiver接受。
5. content_accept checks明列check/typecheck/probe/playtest/readlist（有lore才含lore），full test僅主線統一；即使局部ACCEPT也保持manifest draft並註明整合未綠，技術acceptance與整合status分開。本機匯入基線1031/1022/9失敗已證，不可將其冒充新內容驗證。
6. 收件全文審閱與語義去重，只有局部合格稿carry，commit白名單+manifest+index+本線報告。新能力或怪獸警告逐條比較基底，不能藏告警。未合格稿留隔離draft，不硬帶回。
7. 22:35後不開新重負載驗證，22:45前收稿交主線，尚未跑完保留證據與狀態；23:00前主線整理push。若發現引擎缺口只回報，不開修復線。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028/REPORT.md` 與state.md；各批brief/review/naming/readlist/probe/MCP/log/accept在本線子目錄。工具回報每個階段與終局，不發inbox。
## 驗收（固定 4 條）
1. 兩批各2單位，manifest/brief/已讀REPORT存在；白名單與容量合格，brief_lint/gate可重算。
2. 真實check/typecheck/5seed/能力覆蓋/MCP證據完整，失衡/告警與未跑項明列，不假稱全綠。
3. 全文去重與退修記錄存在；main提交只含核可路徑，既有內容/黃金/引擎不變。
4. REPORT/state記每線、worktree、commit與限制，無本線殘留程序或未回傳工人；不刪隔離稿。


## 行政收線證據（2026-10-28，領導終局）

主線確認領導 Pasteur 已 DONE 並 close，三內容工人已 DONE／close，並明確授權本 brief 搬移。原位[REPORT](../../night-combat-lead-1028/REPORT.md)與[工人終局證據](../../fill-lead-1028-night/worker-terminal-evidence.json)保留；附件／reportDir、readlist及hash均不搬不改。相關提交：`CK 64ff8125；收尾4a139221；CM六檔未收`。R2及收尾commit已唯讀核存在，主線正push，未據此宣稱push完成。

創作與收件完成，驗證及最後行政仍進行：固定suite在3a20a436執行中，R2 wiki尚未跑、待suite後另GO；manifest仍draft／integration pending。verify-night brief不搬。原始brief SHA256：`574aeb3bff555c1e1bbac8f4d3eeceb89e08934801da50d095ede2c10e7951d1`；上方原文逐位元保留。
