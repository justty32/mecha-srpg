# 已讀清單

以下均為親自閱讀；相對路徑以本隔離 worktree 為根。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/mechs.md`
- `wf/workflows/planning/design-notes/terms.md`
- `src/mcp/README.md`
- `content/base/world/lineages/universal-bulwark.json`
- `content/base/world/lineages/universal-longspear.json`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/tools/stats.ts`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `AGENTS.md`
- `wf/WAIT_USER.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/dev-env.md`
- `wf/workflows/inbox/PROTOCOL.md`
- `wf/workflows/dispatch/lessons.md`
- `src/mcp/e2e.test.ts`
- `content/lore/events/shield-open-carving.json`
- `content/lore/events/longspear-leak.json`
- `content/lore/events/golmud-split.json`
- `content/lore/timeline.json`

- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/round2-order.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/cx-pilot-iron.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/orders/cx-pilot-iron.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/REPORT.md`（上一輪）
- `wf/workflows/testing.md`

本輪重新閱讀退回單、交接書、orders、上一輪 REPORT、先讀行規矩與 content 工作流；表格以 tabledb 定向讀取。上列也保留上一輪已驗收的閱讀紀錄。用語以 orders 兩次更正為準。

## 做了什麼

第 2 輪四項內容修正完成；終局 STATUS 為 **BLOCKED**：最終 npm test 仍有兩個 Node 子行程環境失敗，不能宣稱整體驗收通過。內容 check、lore、ops、typecheck、指定 probe 與本輪 MCP 均已取得新證據。

1. **world 移出**：確認領導已移走五個 models 與 universal-ironsword lineage，沒有重建或修改 world/。原檔在本報告目錄 `deferred/world/`。lore 事件現有內容沒有 `base:` lineage/model 引用，故不需再改；frame 的 `lineage-kuafu` 是既有血統 tag，保留。naming.json 已移出這六筆延期內容的列。
2. **平射與隊長槍**：平射保留 AP3、傷害22、charge10、heat12、射程1–5與 attack:1，只新增 `partAim:{allowed:true,penalty:10}`。隊長機右手改成新部件 ix-watch-rifle／能力 ix-watch-shot（守望光矢槍／守望一矢），平射只留 B 型載體。沒有改 AI 程式、profile、tactics 權重或既有武器。
3. **展示情境**：保留原五敵，增加一隻 reaper-c（17,4）與一隻 mite-d（18,10），玩家仍為五型鐵劍。25 輪與原有勝敗條件不變；最終 n10 為 6勝4敗0平、平均10.0輪、0例外。
4. **命名**：「行裝鎧甲」改為「野戰鎧甲」；英文及意涵同步改為 Field Plate／野戰途中可拆換的共用甲片。兩個新槍名也已加入 naming.json。

鐵劍來歷仍是 2106-06 達卡工坊與獵團公開夸父公刻圖系的共用骨架、備件規格與修造冊，讓沿途小工坊都會造修。維持均衡萬用、非近戰特化。以下前代與月份是原設計／延期 model 的規劃，**本批沒有營運模型，尚未接研發或市場**。

| frame/ | 級 | 規劃前代 | 規劃開局月偏移 | 定位 |
|---|---|---|---|---|
| ix-01 | D | 無 | 0 | 共用入門骨架 |
| ix-ii | C | ix-01 | 1 | 雙臂共通掛座 |
| ix-iii | B | ix-ii | 3 | 護衛、煙幕、可瞄部位的平射 |
| ix-ii-loom | C | ix-ii | 2 | 達卡織工型，感知換初動 |
| ix-homeward | A | ix-iii | 6 | 歸航隊長機，守望槍與同伴掩護 |

## 產出

最終 worktree 為 **12 新檔＋timeline 純插入＝13 件**、51,375 bytes；新增檔最大3,135 bytes。五 frame、三 component、兩 ability、一 scenario、一 lore event；未新增 effect。timeline 的單條插入保留，去除此條後的 JSON 與 HEAD 完全相等；既有大檔容量豁免仍按 orders。除原有 node_modules symlink 外，git status 全在允許範圍。world/、src/、schemas/、tests、索引、package.json 均未修改，沒有 commit。

交付：本 REPORT、13 列 naming.json、3 列 playtest.json，以及本輪 mcp-log/r2m1.txt～r2m3.txt。上一輪 m1～m3 原始 log 保留作歷史，**不拿來充當本輪新版測量**。本輪三場全部使用最終七敵情境，五型均出場。命名表不再宣稱延期 models/lineage 屬本批交付。

### 非數值診斷與修正證據

平射 `attack:1` 正確；單體敵方目標、LOS、射程1–5可合法提案。AP3可由駕駛AP9支付；B型有 charge80/regen12、heat110/regen−18，沒有缺池；舊A型也有charge90、heat120。不是成本池不存在或永遠射程不足。

同機評分量測（原配裝，對 bulwark-iv-rampart seed1）：第2輪 AP9，原地平射最高0.1617，散射0.267005；前段門檻為最高分×0.8，平射低於0.213604。第1輪剩AP3時平射0.13965、架勢0.25，同樣被排在區間外。診斷以暫存 runner 包住既有 policy.score 只記錄分數，不改評分；見 `/tmp/cx-pilot-iron/r2-diagnose.json`。

`ability-forms` 明列單體攻擊可用 partAim；既有 AI 會為可瞄部位的武器提出核心候選並按核心剩餘HP估值。新增瞄準後平射對人42次、對怪26次，對應兩組各n5；未靠提高傷害或 AI 權重。A槍單獨能力探針使用12／18次。兩能力的正式探針載體分別為 IX-III、歸航，均0例外。

### 數值帶

HP沿上一輪方法只算 bodyplan 與 layersAdd，不重複把部件自身hp算進機體層；原生骨架結構與抗性不變。

| 型號／級 | 總層HP | 部位／原生層＋外掛層 | 初動／感知／迴避 | heat max/regen | charge max/regen | mass |
|---|---:|---|---|---|---|---|
| ix-01 D | 280（內） | 5／10＋1（內） | 4/5/−1（內） | 100/−15（內） | 40/8（內） | 5≤6 |
| ix-ii C | 370（內） | 6／12（內） | 6/5/−1（內） | 100/−15（內） | 60/10（內） | 6≤9 |
| ix-ii-loom C | 370（內） | 6／12（內） | 5/6/−1（內） | 100/−15（內） | 60/10（內） | 7≤9 |
| ix-iii B | 480（內） | 6／12＋1（內） | 6/6/0（內） | 110/−18（內） | 80/12（內） | 10≤12 |
| ix-homeward A | 635（內） | 6／12＋1（內） | 7/7/0（內） | 120/−20（內） | 90/15（內） | 12≤15 |

跨級HP倍率1.32／1.30／1.32（建議1.3–1.4，內）。heat soft/inverted、max與1.25max閾值（內）；charge hard、initial=max（內）。B accuracy+3無獨立機體數值帶，未假稱帶內。沿用散熱片、儲光匣，但上述池值列 frame 原值，不把未證實的 poolMods 加成算進成績。

野戰鎧甲：外掛HP35（25–55內）、resist0（≤0.25內）、部件hp16／size1／mass2，裝甲不套武器等級帶。列裝光矢槍：hp18／size2／mass3，B帶內；不再裝A隊長機。

平射（B）：AP3（3–5內）、單發22（18–26內）、傷害/AP7.33（建議5–6.5外，低耗主攻、charge10與產熱12約束，未越硬界8）；射程1–5（max內、min低於遠程建議2，近中距自衛槍，須LOS）；accuracy0／armorPen0／crit0（B內）；charge10低於強招20–40建議，無附效基本射擊；單發heat12、AP9最多三發36≤110×0.6（內）；無cooldown／次數上限為基本攻擊豁免；新增瞄準懲罰10（8–15內）。

守望光矢槍（A）：hp22／size2／mass4（各帶內）、無私有池，吃隊長的charge／heat。守望一矢：AP4（4–5內）、單發28（24–34內）、傷害/AP7（6–7.5內）、射程2–6（A遠程2–7內）、accuracy+5（5–15內）、armorPen0.2（0.15–0.3內）、crit0.15（0.15–0.2內）、charge20（20–40內）、單發heat16（5–30內）、AP9最多兩發32≤120×0.6（內）、瞄準懲罰10（8–15內）；無附效、無cooldown的基本射擊。A載體下新槍／新招沒有 probe 超帶欄位。

保留的既有共用招帶外：D架拳14、符文槍20高於D傷害上限9，槍射程6>4；C符文槍射程6>5，同級參照也沿用。B架拳14、頭砲8、散射16低於18，頭砲／煙幕AP2<3，架勢射程0<1；它們是備用、範圍／對人、煙幕與自增益。A架拳／架勢／掩護／散射AP3<4、頭砲AP2<4；架拳14／頭砲8／散射16<24；架拳／頭砲armorPen0、散射0.1<0.15；架勢射程0<1。這些既有備用能力未改，新A主武器已合帶，不再把平射的A帶外理由當豁免。

情境玩家5、敵7、2陣營、25輪；敵數落4–10場景配方內，但超過通用每slot2–6建議，因本輪需要多一隻弱敵形成壓力且已實測60%勝率。部署x2對x17/18，距離至少15格（≥10內）。沿用20×20圖，小於C場建議24–40邊；無新地圖、無timeout。沒有營運model，不列model成本為本批實測數值。

### Probe（全部本輪重跑）

每配對 n5、seed1–5；格式「勝/敗/平；平均輪」，新機與參照對手完全相同。全部例外0。

| 新機 | 對手機／怪 | 新機 | 同級參照 |
|---|---|---|---|
| ix-01 | bulwark-i／mite-d | 4/1/0;8.0 ／ 5/0/0;11.0 | bulwark-i：5/0/0;7.6 ／ 4/0/1;11.8 |
| ix-ii | bulwark-ii／reaper-c | 5/0/0;8.2 ／ 5/0/0;8.4 | bulwark-ii：5/0/0;8.2 ／ 5/0/0;8.0 |
| ix-ii-loom | bulwark-ii／reaper-c | 5/0/0;8.4 ／ 5/0/0;8.0 | longspear-v4：5/0/0;6.8 ／ 5/0/0;7.6 |
| ix-iii | bulwark-iv-rampart／siegebeetle-b | 4/1/0;8.2 ／ 5/0/0;8.0 | bulwark-iv-rampart：3/2/0;8.2 ／ 5/0/0;8.6 |
| ix-homeward | selene-aurora／cliffjaw-red-eye | 5/0/0;8.0 ／ 5/0/0;8.0 | bulwark-old-city：5/0/0;8.0 ／ 5/0/0;8.2 |

原始命令為 `npm run content:probe -- <五frame、兩ability、五reference> --n 5 --json -`，完整 argv 在 `/tmp/cx-pilot-iron/r2-frames.stdout`，JSON與摘要分別在該檔及 r2-frames-summary.txt。B／A與兩能力為最終配裝資料。舊有高勝率多與參照同向；D對mite100% vs80%差一個seed仍保留限制，不宣稱全面平衡。

情境用 `npm run content:probe -- scenario/ix-common-road --n 10 --json -`，seed1–10。依序每次只改一項：新版武器＋原5敵100%；加C鐮肢100%；再加C鐮肢30%；最後新增者x17→18仍30%；其y5→10仍30%；該新增者C鐮肢→D蝕蟲後60%。檔案對應 `/tmp/cx-pilot-iron/r2-scenario0.stdout` 至 `r2-scenario5.stdout`（各有-summary.txt）。最後一份是有效最終證據：6/4/0、平均10.0輪、例外0；主角平射37次、守望一矢42次。沒有同時改部署、數值或輪數。

### MCP 本輪三場

全程自己啟動的 stdio/FIFO，沒有socket、GUI或截圖。r2m1為親自選擇移動、射擊部位、架勢與目標，後段以明確指定的每單位動作清單送 battle_act_many；暫存腳本只傳送這些手選指令，不用policy選招或代選目標。每輪讀observe與legal_actions；無效射程、錯部位、資源不足等拒絕完整保留，拒絕不算能力使用。敵人第9輪撤離時守住陣地結束回合。

- r2m1：seed1，mcp-manual，9輪，player／eliminate:repelled；擊毀損失我0／敵0；平射14、守望8，共22次，AI使用否；hash `2a839659c70839d6`。
- r2m2：seed2，mcp-spectate，10輪，player／eliminate:repelled；擊毀損失我0／敵1（蝕蟲）；平射4、守望7，共11次，AI使用是；hash `004d3e060a7a2763`。
- r2m3：seed3，mcp-auto，10輪，player／eliminate:repelled；擊毀損失我0／敵0；平射2、守望4，共6次，AI使用是；hash `6ad5891d56327044`。auto同seed再spectate取完整事件，hash一致，只記同一場。

newAbilityUses欄是兩個新能力的合計；逐能力分項如上。以battle_events的「使用」文字逐筆計次，不重算命中行。三場事件均取到戰鬥結束，0/1擊毀不與部位毀損或撤退混淆。隊長槍在手動與兩場AI均有使用。三個session與自己的server已關閉。

### 檢查結果

每個內容檔寫後均執行check；最終內容check＝OK 0 errors, 12 warnings（原有警告），lore＝errors0/warnings2（原有兩事件未入年表），ops＝OK 0 errors, 8 warnings，typecheck exit0。禁用詞、命名覆蓋與路徑／容量已檢查；timeline純插入，黃金與campaign fixtures的git狀態為空。

最終 `npm test` exit1：135個檔級結果，133 pass／2 fail（沙箱Node計數只列每檔1項，依交接書不把這件事本身算阻塞）。**之前的5條戰役黃金、MCP戰役與war研發失敗本輪不再出現**；剩 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`。直接跑兩檔仍失敗：e2e兩項均 server提前退出0；CLI未收到server就緒。最小子行程重現 `spawnSync(process.execPath,["-e","console.log(process.version)"])` 回status0、stdout空、stderr空；直接node印版本正常。這是子行程測試證據缺失，未把exit0或空輸出說成通過。證據：r2-final-test.txt、r2-e2e-direct.txt、r2-cli-direct.txt，均在 `/tmp/cx-pilot-iron/`。FIFO實際MCP可用已由三場證明，但不能取代兩個原測試。

`bash wf/tools/wf-lint.sh --strict .` exit1：未修改的legacy/docs兩個外部連結失效、wf/workflows/inbox/ROSTER.md超8KB、wf/workflows/content/polish.md既有BIGLIST。沒有本輪wf內容改動；四處均屬禁止範圍，未修。完整輸出在r2-wf-lint.txt。

## 沒做到或證據不足的

整體驗收尚未全綠，不能發DONE。四項內容修正與指定探針／試玩已完成；**阻塞在測試執行環境**，解除條件是領導在能正常啟動Node子行程的環境重跑兩個MCP測試及npm test。沒有改測試、引擎或黃金來湊過關，也沒重建延期world檔。

情境60%只代表這10個固定seed；手動1場與AI2場不足以推論人類玩家勝率。多數勝因仍是擊退，不能當成殲滅能力或長期維修費證明。便宜好修的敘事保留，但本批model已移出，不再以營運cost或generic/open作已實作證據；市場、研發接線與費用折扣均未交付。

## 需要決定的事

請領導在正常子行程環境重驗npm test；若仍失敗，依實際輸出交由引擎／工具線查，內容線不改src。全庫wf-lint的既有問題另案處理。本輪不要求擴權修改它們。

world六檔留下一批，由頂層授權及引擎線確認新增通用血統與黃金重產，再接營運研發。既有勢力mechSeries、市場與研究、三系列舊文一致性仍是後續事項。poolMods有效性與nameEn欄位等上一輪引擎觀察沒有新結論，不在這輪擴作。

## 子代理

0個；本輪亦由cx-pilot-iron親自閱讀、診斷、修改與驗證，沒有派子代理。

## 以後交接書該點名的工具

無。原交接書已點名stdio/FIFO、probe、tabledb與inbox；本輪補記Node子行程失效時，FIFO可完成實際MCP，但npm test仍需上游正常環境重驗。
