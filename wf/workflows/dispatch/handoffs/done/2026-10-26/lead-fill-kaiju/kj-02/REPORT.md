# 已讀清單

`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；`AGENTS.md`；`wf/workflows/common/user.md`；`wf/workflows/content/README.md`；`wf/workflows/content/batch.md`；`wf/workflows/content/polish.md`；`wf/workflows/content/world-pillars.md`；`wf/workflows/content/bio-monsters.md`；`wf/workflows/content/numeric-bands.md`；`wf/workflows/content/abilities-effects.md`；`wf/workflows/content/playtest.md`；`wf/workflows/content/acceptance-playtest.md`；`content/lore/style.md`；`wf/workflows/planning/specs/world/monsters.md`；`wf/workflows/dispatch/handoffs/lead-fill-kaiju/cx-kj-02.md`。交接書由主 repo 的 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/cx-kj-02.md` 親讀；相對位置尚未出現在 worktree 快照。

另已親讀 `wf/workflows/content/` 其餘原則檔（ancient-people、battle-field、lore-text、mechs、ops-content）、world-pillars 全部子檔、`tools/stats.ts`；四張資料表 `templates.json`、`engine-facts.json`、`numeric-bands.json`、`ability-forms.json` 與 `playtest-baselines.json` 透過 `wf/tools/tabledb.py` 查讀。亦讀 SESSION-LOG、WAIT_USER、WORKFLOWS、common/conventions、common/code-map、common/data-files、dev-env、inbox README／PROTOCOL、dispatch/lessons；history-lines.md 的框架與底色、F 線；指定 species／bodyplan／monster／frame 範本與異形能力、效果範本，並讀 MCP e2e、battle、tool、server、probe、state 的相關實作。

# 做了什麼

狀態：**BLOCKED**。固定六條中，第 2 條的 npm test 0 fail 尚未成立；其餘五條的證據齊全。依交接書「測不出來 → 保持現狀，發 BLOCKED」停止內容工作，保留所有產出。

cx-kj-02 完成巢母 C／B 與環太平洋岸異形 C「攀堤者」（新命名均為提案），含活捕與屍體 frame、兩個新招、一個減益與一個展示情境。base 共 12 檔（1 修改＋11 新增），18,110 bytes，最大單檔 3,649 bytes；既有巢母只插入 C／B gradeRange 與屬性鍵，原鍵值不變。未 commit。

巢母掛 world/monsters.md「等級觀」：窄裂縫的錨是同種縮小版，與寬度同級；年表 2103「第一隻被捕的巢母」、2108-01「達卡北郊裂縫」已有 C 級依據，B 是此規則的同種較寬裂縫對照，不是新增歷史個體。攀堤者掛 history-lines.md「海洋與潮汐」裁示、底色 1.4「精粹在海邊」、F 線「蝕線＝海岸線」；平時貼在環太平洋港口、防波堤、碼頭樁，隨漲潮爬上岸。沒有以潮差解釋威脅，也沒有補怪獸心思、對白或馴養。設計表見 [design.json](design.json)，命名表見 [naming.json](naming.json)，三件主內容白話見 [review.json](review.json)。

# 產出與驗收證據

每檔如下（路徑均在 worktree 的 content/base/）：

- `species/nestmother.json`：`species/nestmother`；C／B（保留 A）；只補級別與屬性；掛到等級觀；2103／2108 年表。
- `monsters/nestmother-c.json`：`monster/nestmother-c`；C；420 HP、薄核心 11 的巢母；掛到等級觀；2103／2108 C 錨。
- `monsters/nestmother-b.json`：`monster/nestmother-b`；B；1050 HP、薄核心 28 的巢母；掛到同種蝕錨隨裂縫寬度對級。
- `species/breakwater-clinger.json`：`species/breakwater-clinger`；C；貼岸構造、隨漲潮攀上的異形；掛到海洋與潮汐；1.4；F 線。
- `bodyplans/alien-breakwater-clinger.json`：`bodyplan/alien-breakwater-clinger`；C；五部位、不對稱、左抗右裸；掛到異形四族；岸線結構形象。
- `frames/bio-breakwater-clinger.json`：`frame/bio-breakwater-clinger`；C；活捕懸囊、本能池、承擔 6；掛到異形拘束與 B1／B5／B6。
- `frames/corpse-breakwater-clinger.json`：`frame/corpse-breakwater-clinger`；C；屍體改裝、無本能池、承擔 0、無再生；掛到B1 屍體改裝。
- `monsters/breakwater-clinger-c.json`：`monster/breakwater-clinger-c`；C；無二名的常見岸獸；掛到海洋與潮汐；1.4；F 線。
- `abilities/kx-breakwater-clinger-rend.json`：`ability/kx-breakwater-clinger-rend`；C；掀岸一撕；近戰 18 傷／3 AP；掛到翻越堤沿後撕過岸面。
- `abilities/kx-breakwater-clinger-drag.json`：`ability/kx-breakwater-clinger-drag`；C；掛足拖行；12 傷／3 AP＋纏足；掛到垂臂掛足的貼身限制。
- `effects/kx-breakwater-clinger-snared.json`：`effect/kx-breakwater-clinger-snared`；C；纏足；迴避 −8、先攻 −2、2 回合；掛到異形 debuff；badge 纏足。
- `scenarios/kj-quay-rise.json`：`scenario/kj-quay-rise`；C／B 展示；四台我方、三隻新怪獸、20 輪生存或擊退；掛到碼頭岸線展示；不新增史實。

固定六條驗收的證據：

1. 路徑、12 件、容量、巢母插入型 diff 通過；見 [git-status.txt](validation/git-status.txt)、[gates.json](validation/gates.json)。黃金檔狀態為空。
2. 每檔寫完均跑 npm run check，12 次 exit 0，最後末行 `OK 0 errors, 10 warnings`（戰鬥載入器為 `OK 0 errors, 14 warnings`）；新警告見下。npm run typecheck exit 0。npm test exit 1：151 個檔案級結果，147 pass、4 fail、0 cancelled、0 skipped，耗時 809,366 ms；未通過此條。這是沙箱 node --test 的檔案級計數，不當成實際測試案例總數。完整結果見 [test.log](validation/test.log)。
3. 三新＋四參照皆 monster kind，seed 1–5、n=5、預設 20 輪與撤退開啟，七組 0 例外；新兩招 AI 使用見下。
4. [playtest.json](playtest.json) 兩列，原始日誌均存在；一場手打、一場 MCP 全 AI 觀戰。
5. naming／review 齊；白話各不超過 60 字。新 base 文本禁用詞、舊詞皆 0，唯一「潮」為展示簡介的海洋本義「漲潮」。B 以下三個 monster 均無 name／epithet，沒有新 registry 值。
6. 第一段逐條列出交接書「先讀」全部路徑；所有適用內容原則親讀。

新增警告逐條（兩個檢查器各印一次，非四個不同問題）：

- `content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly`。
- `content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly`。

原因：依交接書以 partsOverride 縮野怪血量，capture.frame 仍沿既有 bio-nestmother 的 A 級原形；capture 與 frame 不在本線可改範圍。其餘 12 條戰鬥／8 條營運警告在第一檔插入完成後已存在，沒有新增。每次完整輸出保存在 validation/check-01.log 至 check-12.log。

probe 數字並列（勝敗以怪獸主角方計；C 對兩台堅盾-II、B 對兩台堅盾-IV、A 對兩台極光；完整數字含能力與超帶存 [probe-summary.json](probe-summary.json)，原始輸出在 [probe.log](validation/probe.log)）：

| 組別 | monster id | 勝／敗／平 | 勝率 | 平均輪數 | 例外 |
|---|---|---|---|---|---|
| new | nestmother-c | 3／2／0 | 60% | 6.60 | 0 |
| new | nestmother-b | 0／5／0 | 0% | 8.20 | 0 |
| new | breakwater-clinger-c | 0／5／0 | 0% | 7.60 | 0 |
| reference | spitter-c | 0／5／0 | 0% | 8.40 | 0 |
| reference | reaper-c | 0／5／0 | 0% | 8.40 | 0 |
| reference | lancewing-b | 0／5／0 | 0% | 7.80 | 0 |
| reference | nestmother-landlord | 0／5／0 | 0% | 9.40 | 0 |

新招在攀堤者 monster probe 的主角 AI 出手：掛足拖行 15 次、掀岸一撕 34 次；皆非 0。巢母 C 的既有孵生 12 次／根系拖纏 51 次，巢母 B 為 10／59 次。

MCP 試玩：手打 seed 2，第 6 輪 player 以 eliminate:repelled 獲勝，我方擊毀 0、敵方擊毀 3（含子體）；新招拖行 4／撕擊 5 次，其中敵 AI 拖行 1／撕擊 2 次。全 AI seed 3，第 11 輪同樣擊退獲勝，我方擊毀 0、敵方擊毀 5；新招拖行 7／撕擊 13 次，均為 AI 使用。兩場三個新怪獸都出場，bio frame 亦出場；只試這兩場，未追加平衡驗收。手打前四輪親自移動、射擊、使用兩新招，第五輪留守觀察撤離，第六輪擊毀餘下子體結算。手打有因 AP 不足、順序改變、目標已毀而被拒的指令，原始紀錄保留，均未改資料規避。

數值帶：巢母 C 總層 HP 420（300–480）、B 1050（800–1400）；A 有效體層 1580、核心 42，按其約 2.66% 比例縮為 C 核心 11、B 核心 28（四捨五入差歸軀幹，不加厚核心）。兩級沿 A 的八個部位與層型，超過 C 建議 3–6、B 建議 4–6 部位，因交接書要求沿既有骨架且只縮血。先攻 C 7、B 8，是同級建議減 2 的慢型個性；其餘感知／命中／迴避沿同級。攀堤者 420 HP、五部位一核，左甲 kinetic／energy 抗性 0.3、右側全 0、全體 thermal 0；兩新招 18／12 傷、3 AP、射程 1／2、減益招冷卻 2，均在 C 帶；纏足迴避 −8（C 帶）、先攻 −2 比通用效果幅度 ±5–10 低，沿 rooted 的輕控制量級，不是硬定身。生物 frame 承擔 6、屍體 0，無超帶加強。展示用既有 20×20 圖，小於 C 情境建議 24–40 邊，為讓三隻新單位在 MCP 集中出場，未新增地圖。

probe 自動列出的巢母超帶只來自共用舊招：nest-birth 射程 0（self 孵生，不是射程失效）；root-drag 傷害 10，低於 C 12／B 18 下限。依「既有鍵值一字不改、數值比照、不做平衡」保留，參照 A 同樣列低傷／低 AP／低 armorPen。參照 spitter-c 射程 6／7、lancewing-b 酸刺 14 也有既有超帶，不改。巢母 C 3/5 勝，B／攀堤者 0/5；參照 C 兩種、B、A 均 0/5；照交接書不追調勝率。

# 沒做到或證據不足的

npm test 已收尾，失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts`、`test/content/index.test.ts`，均顯示 testCodeFailure／exitCode 1，檔案級 reporter 只給「test failed」，未提供內部斷言。第 2 條未達成，不能發 DONE。

已知證據：本線 Node child_process 啟動 server 與簡單 node -p 子程序均提早 exit 0、沒有 stdout；同樣 server 用直接 shell／Python subprocess 則能完成 initialize 及兩場戰鬥。CLI 測試本身依賴 Unix socket，e2e、worldgen、index 測試都使用 child_process。這支持環境／子程序執行異常的推論，**不證明四項全因同一環境問題**；尤其索引測試的內部錯誤仍證據不足。未為了綠燈改測試或其他禁區檔，也沒有略過失敗的測試重跑整套。未接 world/rifts、encounters、beasts，未改 lore／索引／manifest／引擎／黃金。MCP 展示不是「只替換一個基準單位」的對照實驗，因此兩場勝率不作平衡結論；同級比較以指定的七組 probe 為準。屍體 frame 沿範本建立，沒有另加本交接書未要求的專場。

# 需要決定的事

解除條件：請領導在允許既有測試所需 socket、且 Node child_process 能正常回傳 stdout 的執行環境，對此 worktree 跑既定 npm test 並取得 0 fail；若索引斷言仍失敗，應在允許處理 content/index 的主線整批整合階段定位與更新。本線沒有改 index／src／test 的授權；取得完整失敗斷言後，由領導區分既有問題、索引接入與新內容問題再派可寫範圍。

活捕 C／B 巢母仍指向既有 A 級 bio-nestmother，可能造成捕獲後級別與血量跳變；本線禁止改 capture、bodyplan 與既有 frame，請領導決定另線補同級活捕表達。C 巢母沿現有八部位保留三個囊口，2108 達卡 lore 寫兩個囊口；遵守部位 id 不變，是否另外做小型骨架由領導決定。接進營運的裂縫、遭遇與 beasts 由領導另做。

world-pillars 與 bio-monsters 的 EF-13 仍稱 partsOverride 未實作；現行 state.ts 與 probe 都已合併覆寫，試玩 C／B HP 也正確；可另線更新文件，本線未碰。MCP 的 Node child_process driver 會靜默 exit 0，Python 子程序啟動同一 `node src/mcp/server.ts` 的 stdio 成功；改用同協定、同 initialize／tools/call 生命週期後完成兩場，保留失敗嘗試，不改 server。

# 子代理

未啟用；成本 0、品質由本線親讀、寫作與固定六條驗收負責。

# 以後交接書該點名的工具

Python subprocess 的 stdio MCP driver 可避開本沙箱 Node child_process 提前退出；仍直接呼叫既有 node src/mcp/server.ts，無 socket。
