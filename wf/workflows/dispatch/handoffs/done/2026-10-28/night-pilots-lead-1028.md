# 任務：製作核可的兩名駕駛員與展示
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/playtest.md`、`wf/workflows/dispatch/content-batch.md`、`wf/workflows/testing.md`、`content/lore/README.md`及style；已在本session親讀共通規矩可沿用，補本brief、person格式與近鄰。
## 背景與唯一目標
主線核可night-pilots-plan-1028後，sol領導製作兩名可展示駕駛與對應故事，不改機制與招募池。需23:00前收尾，避免為最後小批延誤整合。
## 範圍
只寫 `wf/workflows/dispatch/handoffs/night-pilots-lead-1028/`、`content/batches/2026-10/night-p-*.json`、核可manifest列出的 `content/base/persons/night-p-*.json`兩檔、`content/lore/characters/night-p-*.json`兩檔、`content/base/scenarios/night-p-*.json`一檔；帶回後重產content/index。
不做：既有內容/屬性/perk/能力/人物關係修改、新招募池/市場/事件、timeline、src/schema/spec/依賴/黃金、全套suite、未核可概念。
件數 gate：一批2概念5個新內容JSON，不擴配套；容量 gate：每內容檔16KB、證據總10MB；最多退修2輪，超界回報。
## 必用工具
| 工具 | 用途 |
|---|---|
| `git worktree add --detach` | 隔離批次 |
| `python3 wf/tools/brief_lint.py` | 工人brief strict0 |
| `python3 wf/tools/tabledb.py` | 索引/設計/近鄰有界查詢 |
| `python3 -I wf/tools/content_gate.py` | 白名單與帶回 |
| `bash wf/tools/content_accept.sh` | 固定檢查與證據 |
| `node src/mcp/server.ts` | stdio合法行動與展示 |
| `npm run content:index` | 已stage來源產索引 |
## 資源與禁區
**可寫程式碼線**：僅核可資料白名單和本線報告，不能改引擎。子代理1個sol，優先復用已讀wf的工人；全機工人含astra≤3，領導自行與既有CM/CK/R2排隊，不同時加第四人。
不GUI/鍵鼠螢幕/截圖/下載安裝/刪檔/清worktree/全域設定/reset/rebase。不建分支、不自行push，main commit沿主線git窗口、明列路徑，禁止git add -A。工人不stage/commit。
重驗仍遵全機單一runner、nice19、最多2CPU；本批尚未獲重驗窗口，待主線核可時指明，可與既有CM/CK窗口串行共用但絕不並跑。不跑完整npm test/test:dom/e2e/fuzz，重用已驗證MCP/probe驅動僅換配置，不建通用新框架。
## 工作
1. 主線核可後凍結5檔manifest/brief及對照來源，隔離寫兩person、兩同名lore、一展示；親讀格式/核可故事/兩近鄰。person與lore名字/年代/勢力/機體一致，gameRefs正確、反向關係只在新稿內，不改既有資料。
2. 寫前與交稿查重；故事有具體自己做過的事與代價，玩法兩人有可測的不同取捨，不能人人全優。沿既有合法屬性與perk，不藉調數字偷加能力。check/lore/typecheck/gate均保留真實結果。
3. 新展示5seed零例外，兩person都曾生成合法動作且有實際行動紀錄；同frame/同部署/AI只換person對照，不宣稱差異全由單一屬性造成。至少1場MCP auto到outcome及3完整round合法操作，有兩person對應unit證據。新能力覆蓋不適用（不得新能力），不假報需要能力的新測試。
4. content_accept checks明列check/lore/typecheck/probe/playtest/readlist，按scenario走既有probe；完整suite主線統一。局部合格才carry，manifest保持draft/integration pending，展示可用尚未接戰役招募。不得waiver掩飾失敗或改基準。
5. 22:25前力求交稿與局部驗證，22:35後不開新重驗；未完成保留隔離draft、不硬入庫。與既有戰鬥批共用一次最終主線suite，不另加全套。提交明列5檔+manifest+索引+本線報告。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-lead-1028/REPORT.md`、state、brief、review/naming/readlist/dedup、驗證/MCP證據。REPORT首段已讀、四段產出/驗證/限制/待決。原生工具回報。
## 驗收（固定 4 條）
1. 2person/2lore/1scenario共5檔與manifest/brief存在，引用/名字一致，gate與brief_lint0。
2. check/lore/typecheck與5seed/MCP/兩人物行動證據完整，失敗與未跑項誠實記錄。
3. 全文去重與遊玩差異對照可查，既有內容/黃金/源碼不變，commit明列範圍。
4. 終局REPORT/state可接續，所有本線工人與程序停止，未完成稿保留、不冒稱整合全綠。


## 行政收線證據（2026-10-28，領導終局）

主線確認領導 Pasteur 已 DONE 並 close，三內容工人已 DONE／close，並明確授權本 brief 搬移。原位[REPORT](../../night-pilots-lead-1028/REPORT.md)與[工人終局證據](../../fill-lead-1028-night/worker-terminal-evidence.json)保留；附件／reportDir、readlist及hash均不搬不改。相關提交：`pilot 3a20a4367944cc3ed4ea62ee49552991b2f3d87e；收尾4a139221`。R2及收尾commit已唯讀核存在，主線正push，未據此宣稱push完成。

創作與收件完成，驗證及最後行政仍進行：固定suite在3a20a436執行中，R2 wiki尚未跑、待suite後另GO；manifest仍draft／integration pending。verify-night brief不搬。原始brief SHA256：`49b70034215c9e95b80143ddcf21bcb5618c959e6e024ef0fcdc02e79de24de1`；上方原文逐位元保留。
