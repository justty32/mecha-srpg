# 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/playtest.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-kaiju2/cx-kj2-04.md`

另親自讀過 `wf/workflows/content/` 全部其餘檔（資料表分段查詢，未整份倒入 context）：

- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/tools/stats.ts`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/world-pillars/bio-battle/battle.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/mechs/ancient.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/mechs/mechanical.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/content/world-pillars/world/monsters.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`

其中 `templates.json`、`engine-facts.json`、`ability-forms.json` 均透過 `python3 wf/tools/tabledb.py` 分段讀過。`kj2-plan/roster.json` 的本批四列由 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/roster.json` 以 `find batch=kj2-04` 查讀；同時讀了計畫 `review-draft.json` 的相關六列。

另讀最新主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md` 第 12 段，及 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/orders/cx-kj2-04.md`。依 orders 使用青鬣／外港青鬣／斷纜青鬣／長鬣，覆蓋 worktree 舊計畫的名稱。

入口與協議另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/data-files.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/dev-env.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/dispatch/lessons.md`。

本批範本親自讀過：`content/base/species/cliffjaw.json`、`content/base/bodyplans/quadruped-cliffjaw.json`、`content/base/frames/bio-cliffjaw.json`、`content/base/frames/corpse-cliffjaw.json`、`content/base/monsters/mite-d.json`、`content/base/monsters/breakwater-clinger-c.json`、`content/base/monsters/bulwark-b.json`、`content/base/monsters/cliffjaw-red-eye.json`、`content/base/abilities/kx-thorn-snipe.json`、`content/base/abilities/kx-ground-stomp.json`、`content/base/abilities/kx-carapace-brace.json`、`content/base/effects/kx-staggered.json`、`content/lore/places/seattle.json`、`content/base/scenarios/rift-edge-nest.json`。另核對瓦爾帕萊索既有地點、既有四個 AI profile、展示地圖 cells，以及能力未出手相關的 AI 原始碼。


## 做了什麼

cx-kj2-04 只新增核定 37 檔：species 4、bodyplan 4、frame 8、monster 4、ability 9、effect 6、lore place 1、scenario 1。逐種完成即跑 check，未調平衡、未修改既有檔、未 commit。全部新增內容合計 42,023 bytes，最大檔 beast-storm-mane.json 為 5,212 bytes，未觸發 37 件／16 KB／1 MB gate。完整路徑見 review.json（37 列），原始 git status 見 `/tmp/cx-kj2-04/git-status.txt`。

展示情境沿既有 map/rift-edge-60，玩家兩台為活體／屍體崖牙，駕駛分別陳小海、葛西 蓮；敵方各一種，不覆寫 species AI。中央四格守八輪，玩家全滅先判敗，敵方存活二十輪兜底；seed=210804。所選部署與守區均是既有平地格，部署最近距離二十格，沒有新增地圖、地形或勢力。

### 固定五條驗收

1. `git status --short --untracked-files=all` 除既有 node_modules 外，恰好是交接書允許的 37 個新檔；tracked／staged 變更均 0。
2. 四次逐種 check 與最後一次 check 全部 exit 0。最後 core loader 為 `OK 0 errors, 24 warnings`，ops checker 末行為 `OK 0 errors, 10 warnings`；保留工具原文，沒有裁掉警告假造末行。lore check `errors=0 warnings=2`，兩條是既有事件未入年表。typecheck exit 0。npm test 結果見下方實測紀錄。
3. 指定四種新 monster 加四種參照，各五 seed：新組二十場與參照二十場全為 0 例外；九招有七招被主角 AI 用過，另兩招的原因與證據限制逐項記在下方。
4. naming.json 61 列（含新部位與沿用 AI 的名字）、review.json 37 列且白話最長 34 字、timeline-add.json 一條皆已寫入交付目錄。B／C／D monster 無 name／epithet。新敘述與命名舊詞／禁詞 0 命中；瓦港與瓦爾帕萊索屬地名豁免，遊戲 id 與英文原名不作敘述詞掃描。
5. 本報告首段已逐條列先讀路徑，並記主 repo 更新計畫及 orders。

### 新警告（逐條）

下列八條全部是 `[soft-overflow-band]`、`instinct: no band covers values above max`。照計畫第 5 段保留獸族 soft 本能池與 `bands: []`，不自行補門檻規則：

- `content/base/species/shell-ear.json` `$.pools[0].bands`
- `content/base/species/split-fin.json` `$.pools[0].bands`
- `content/base/species/trench-maw.json` `$.pools[0].bands`
- `content/base/species/storm-mane.json` `$.pools[0].bands`
- `content/base/frames/bio-shell-ear.json` `$.pools[0].bands`
- `content/base/frames/bio-split-fin.json` `$.pools[0].bands`
- `content/base/frames/bio-trench-maw.json` `$.pools[0].bands`
- `content/base/frames/bio-storm-mane.json` `$.pools[0].bands`

原始輸出分別在 `/tmp/cx-kj2-04/check-shell-ear.log`、`check-split-fin.log`、`check-trench-maw.log`、`check-storm-mane.log`、`check-final.log`；lore 與型別輸出為同目錄 `lore-check.log`、`typecheck.log`。最後 ops 的十條警告皆指既有 monsters 的捕獲層 HP 差異；core 其餘十六條皆指既有檔。

## 產出

- `species/shell-ear`／`monster/shell-ear-d`：D 級定點遠射，雙耳破損累計降命中；掛瓦爾帕萊索外港濕石，智利巡階民兵最常先遇到牠。
- `species/split-fin`／`monster/split-fin-c`：C 級群體追咬與短時增閃，斷尾不等於斷足；掛近海溪口與涵口，基多備件護送隊常遇到牠。
- `species/trench-maw`／`monster/trench-maw-b`：B 級厚甲、低回復、直線泥息，深胸核暴露較低；掛通海礁溝外端，拖救工與守軍遇到牠，深海來源只保留岸邊見聞。
- `species/storm-mane`／`monster/storm-mane-a`：A 級青鬣，俗名外港青鬣、二名斷纜青鬣，高行動點狂攻、破長鬣削回復；掛外階斷纜與內側續纜拖救，工班、智利民兵與受雇獵團遇到牠。

四種均承接 F 線蝕線即海岸線、底色 1.4／1.5／1.11 與商路約後的備件護送。新地點交代牠們沿海出現的理由、常見地貌與遭遇者，內港繼續卸貨，智利國屬港守住。timeline-add.json 的 2107 條目是拖救當夜的地方記錄，不是物種誕生時間，也不另設主線節點。

## Probe 與參照數字、超帶欄位與理由

指令：`npm run content:probe -- monster/shell-ear-d monster/split-fin-c monster/trench-maw-b monster/storm-mane-a monster/tidewolf-d monster/hound-c monster/bulwark-b monster/cliffjaw-red-eye --n 5 --json /tmp/cx-kj2-04/probe.json`。原始文字在 `/tmp/cx-kj2-04/probe.log`，完整每 seed 證據在 probe.json。seed 1–5、上限二十輪、預設允許意圖撤退。每一列均打同級基準衍型機兩台。

| 等級 | 新 monster／平均輪數 | 參照 monster／平均輪數 | 新／參照勝率 | 平手率 | 例外 |
|---|---|---|---|---|---|
| D | shell-ear-d／7.80 | tidewolf-d／8.00 | 0%／0% | 0%／0% | 0／0 |
| C | split-fin-c／8.00 | hound-c／7.40 | 0%／0% | 0%／0% | 0／0 |
| B | trench-maw-b／8.20 | bulwark-b／8.20 | 0%／0% | 0%／0% | 0／0 |
| A | storm-mane-a／8.00 | cliffjaw-red-eye／7.20 | 0%／0% | 0%／0% | 0／0 |

D／C／B／A 對手分別為 bulwark-i、bulwark-ii、bulwark-iv-rampart、selene-aurora。新組共十九場以 eliminate:repelled 結束，伏耳另有一場 eliminate；參照二十場皆為 eliminate:repelled。兩組同向全敗是此次實測，不宣稱已平衡，也未依勝率改數值。

| 新能力 | 主角 AI 使用總次數 |
|---|---:|
| ability/kx-shell-ear-hush | 14 |
| ability/kx-shell-ear-spit | 0 |
| ability/kx-split-fin-rush | 15 |
| ability/kx-split-fin-swerve | 5 |
| ability/kx-storm-mane-bite | 27 |
| ability/kx-storm-mane-lash | 5 |
| ability/kx-storm-mane-rise | 0 |
| ability/kx-trench-maw-bite | 11 |
| ability/kx-trench-maw-breath | 10 |

伏石吐丸 0 次：同組只觀測到抖耳落灰 14 次。既有 sentinel 只在原守格出手，不追敵；吐丸最短距離兩格。推測短接敵窗口、灰罩評分與敵人貼身共同影響出手，這次 probe 未保留位置及每次評分，不能將推測當成已證明的唯一原因；未以改射程或改 AI 湊覆蓋。

豎鬣追岸 0 次：`src/ai/policies/berserk.ts` 明確排除以自己為目標的能力，且只保留 attack／attackArea。roster 指定沿用 tide-cultist，所以純 buff 招不會由這個野生 AI 主動選用；資料保留給操作活體／屍體機甲時使用，未宣稱手動試玩已驗證。

四種 HP＝130／400／1300／1700，部位數＝4／5／5／5，各一核；accuracy＝50／55／60／65，evasion＝5／8／8／12；活體 burden＝2／5／8／12。全部 HP 帶內，淵顎先手 8 與閃避 8 為同級慣例內減二；骨層專長最高 0.5、每種都有全層零抗性型別。九招成本、傷害、射程與冷卻逐項保留 roster，未另加命中、穿甲或暴擊。

本批 probe 列出的十項超帶：

- 伏石吐丸、抖耳落灰各射程 5，高於 D 帶 4：計畫刻意採定點遠射小獸；吐丸有近距死角，不為警告縮射程。
- 甩尾折返 AP 2 低於 C 帶 3、射程 0 低於 1：自用短時增益，按增益成本與 self 形態填值。
- 張口瀉泥傷害 16 低於 B 單體帶 18：直線每目標傷害約近咬 26 的六成。
- 拖纜裂咬、甩鬣掠電 armorPen 0 低於 A 帶 0.15：計畫通則未列穿甲即 0，不擅自增加。
- 甩鬣掠電傷害 20 低於 A 單體帶 24：扇面每目標傷害為近咬 30 的三分之二。
- 豎鬣追岸 AP 2 低於 A 帶 4、射程 0 低於 1：增益成本與 self 形態，並非單體傷害招。

其他需人工解讀的暫值：伏耳兩次耳折合計命中 -8、岔鰭鰭裂閃避 -6，屬可破部位留下的永久損傷，沿計畫而非套永久人物特質 ±5；青鬣鬣張命中 +8／先手 +2 低於 A 短效建議幅度，是計畫指定輕量增益。青鬣咬 AP 5 高於一般「基本攻擊≤4」建議，但位於 A 成本帶 4–5。三種自用／減益招無傷害，不能套傷害／AP 低於 3 的傷害招判準。範圍傷害每目標與 A 無穿甲均與既有崖牙參照類似，不做平衡補值。

參照也有自身超帶：潮狼 D 的咬／撲傷害 18／12 高於 D 單體 9；掘犬自益與盾甲豎甲的 self 射程 0；崖牙咬 armorPen 0、踏地傷害 20／armorPen 0、仰頭 AP 3 低於 A 攻擊帶。完整欄位仍見 probe.json。

## 沒做到或證據不足的

本批依交接書不要求 MCP 試玩，沒有把展示情境的可載入檢查冒認成手動試玩或平衡驗證。能力 AI 覆蓋為 7／9；零使用的兩招原因如上，未補額外場次。新本能池沒有溢出帶，保留計畫要求與八條警告。

`npm test` 只完整執行一次，exit 1；實測 152 個檔級測試，147 pass、5 fail、0 cancelled、0 skipped，總耗時 1,013.224 秒。原始完整輸出為 `/tmp/cx-kj2-04/test.log`。失敗檔為：

- `src/mcp/cli.test.ts`（2,028.654 ms）
- `src/mcp/e2e.test.ts`（3,165.887 ms）
- `src/ops/content/worldgen.test.ts`（1,391.429 ms）
- `src/ops/world/grid.test.ts`（3,358.301 ms）
- `test/sim/invariants.test.ts`（35,173.073 ms）

前四個符合交接書預先列明的沙箱檔級失敗類別。工具僅列 `testCodeFailure / ERR_TEST_FAILURE / exitCode 1`，沒有輸出其內部斷言，因此不捏造具體權限錯誤。

第五個不在預先豁免清單，已進一步診斷，沒有略過：同一工作樹執行 `node --test --test-reporter=tap test/sim/invariants.test.ts`，exit 0、1 pass／0 fail、2,200.989 ms，原始輸出 `/tmp/cx-kj2-04/invariants-diagnostic.log`。該檔及其 helpers 有「生成軌跡／重播各不超過三十秒」的時間斷言；全套時檔級耗時逾三十五秒、單跑約兩秒，推測是併發長測時的計時門檻問題，但原失敗輸出未揭示具體斷言，不能確證唯一原因。helpers 的固定隨機軌跡只取既有潮狼／巢母與既有機甲，不使用這四種新獸；未修改測試、引擎或既有內容。這次局部診斷屬釐清第五個失敗，沒有把完整 npm test 的 147／5 改報為全綠。


## 需要決定的事與需要引擎支援的玩法

數值留後期統調。若希望野生青鬣主動豎鬣，需要讓既有 berserk 支援自用增益，或另由領導批准不同 profile；本線不改 AI。伏耳遠射的實戰出手窗口，留後續 AI／平衡線針對位置與評分調查。

淵顎深海與岔鰭游水只有岸上形態，未賦予水域通行；真正潛水／水深、斷武器部位禁用內建招、按地域篩選獸種等需要計畫第 10 段的引擎工作。長鬣破損只實作本體 AP regen -3，捕獲後不能宣稱同時扣駕駛人物 AP（守則 B7 的多池與資料驅動後果）。營運 world/rifts 與年表插入由領導接手，沿本批禁區不落地。

上線 PROGRESS 已按指定 inbox_mail.sh --up 送出，工具回報 delivered to dispatcher；當時主 repo 未將本線辨識為 kaiju2 team member，未自行改名冊。終局同樣走 --up；完整內容與交付路徑在本報告。

## 子代理

無。全部由本線親自讀規範、寫檔與審核，子代理成本 0，沒有以平行摘要替代必讀。品質證據為固定五條驗收與原始工具輸出。

## 以後交接書該點名的工具

無。
