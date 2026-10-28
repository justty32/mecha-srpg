# 任務：實作核可兩名駕駛與展示五檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/README.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/ancient-people.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/acceptance-playtest.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/playtest.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/content-batch.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/testing.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/README.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-lead-1028.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-plan-1028/PLAN.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-plan-1028/SHOWCASE.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-plan-1028/REPORT.md`，親讀適用規矩；你是原A工人Carson，共通已讀可沿用，補person格式、核可正文/三附件與近鄰。核可review兩列、readlist/references/validation用tabledb有界查，不整表進context。

## 背景與唯一目標

Astra已終局、主線正式GO，復用Carson作第三sol，產核可兩person＋兩lore＋一scenario。makePerson自然路徑不掛traits，按base真值展示，不預填effects/contribs或修引擎。

## 範圍

只新增隔離 `/tmp/night-pilots-lead-1028/wt-pilots` 的五檔：

- `/tmp/night-pilots-lead-1028/wt-pilots/content/base/persons/night-p-serin-sowe.json`
- `/tmp/night-pilots-lead-1028/wt-pilots/content/lore/characters/night-p-serin-sowe.json`
- `/tmp/night-pilots-lead-1028/wt-pilots/content/base/persons/night-p-mateus-vieira.json`
- `/tmp/night-pilots-lead-1028/wt-pilots/content/lore/characters/night-p-mateus-vieira.json`
- `/tmp/night-pilots-lead-1028/wt-pilots/content/base/scenarios/night-p-two-ledgers.json`

報告/runner/log證據只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-lead-1028`。件數 gate：5個新內容JSON；容量 gate：每檔16KB、內容80KB、證據總10MB，超額回報。不做既有資料、反向關係、招募池、perk/新能力、timeline、src/schema/spec/依賴/黃金/主線SESSION/CLAIMS；不自行寫manifest/index。

## 必用工具

| 工具 | 用途 |
|---|---|
| `rg` | 引用與語義去重、近鄰與makePerson原碼 |
| `python3 wf/tools/tabledb.py` | 設計及資料有界查詢 |
| `npm run check` | 格式輕量驗證 |
| `node content/lore/check.ts` | lore輕量驗證 |
| `npm run typecheck` | 型別輕量驗證，既有node_modules已接 |
| `git status --short` | 只讀精確寫集 |

## 資源與禁區

**可寫程式碼線**：五檔與本線報告；sol high，子代理0，全機最多3。先只資料及輕量，CK正在唯一runner，**未收到領導CK釋放GO前禁止probe/sim/MCP/node --test**。之後nice19最多兩CPU串行、窗口22:35硬截止，SHOWCASE對照最多20seed配置，不擴框架，復用既有驅動只換配置。禁止GUI鍵鼠螢幕截圖/安裝下載/刪檔或worktree/全域設定/git stage/commit/push/reset/rebase/stash；原生回傳不寄信。

## 工作

1. 親讀七份計畫來源與兩近鄰；凍結兩person全配方、lore名字/年代/勢力/gameRefs與person一致，relations/events空。兩故事各有自己做過的事和代價、正文650–900字四小標；不重述同事件、不改既有角色。
2. 自然base：瑟琳56/6/44/5/7/46、馬特烏斯48/9/56/7/6/50（準/迴/志/反/感/操）；traits只資料宣告，不把標稱增益當自然已生效。scenario兩人均長槍-V4按既有配裝，無state覆寫、無soul，只展示未招募。
3. 只跑check/lore/typecheck各一次，留原輸出真實exit。寫REPORT首段完整repo相對code已讀路徑；review/naming/readlist/dedup用wf-table/1，舊信與/tmp只code不失效連結。資料稿完成先回DONE及限制；可準備必要runner但禁止未GO執行。
4. 重驗待CK釋放，既定五seed自然/兩person合法動作與實際AbilityUsed、同frame單獨替人對照與互換部署總最多20seed、MCP auto outcome及三完整round，不新能力覆蓋、不預掛traits。不足/失敗保留draft，不waiver或改基準。

## 交付

REPORT絕對路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-pilots-lead-1028/REPORT.md`，原生工具回DONE/BLOCKED/FAILED。重驗未跑如實記錄，局部合格才交領導carry，整合pending。22:35後不開新測，留主線最終suite。

## 驗收（固定4條）

1. 精確五檔、名字/gameRefs/引用一致，容量內，既有資料不變。
2. check/lore/typecheck與去重命名/REPORT齊全，原始exit可查，未GO重驗不冒稱通過。
3. 自然base/空traits路徑限制明列，零state預掛，不修引擎/招募/能力。
4. 隔離僅五新檔，報告只本線，無git寫入或未授重負載；資料交稿後等待GO。
