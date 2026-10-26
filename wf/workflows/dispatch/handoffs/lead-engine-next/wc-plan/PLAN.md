# 已讀清單

本線 `cx-en-wc-plan`，2026-10-26；repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg`。以下均親自讀取。本次只寫本 PLAN；發信與輪詢依交接書授權。文件內同質清單保留於本檔，是「只交一個 PLAN、14 列逐列照抄」的任務特例，不另拆 JSON。

已讀入口：`AGENTS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`wf/workflows/dev-env.md`、`wf/workflows/planning.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`。頂層新信已查閱，未處理其他線的任務或搬動其信件。

已讀交接與原始裁示：`wf/workflows/dispatch/handoffs/lead-engine-next/cx-en-wc-plan.md`、`wf/workflows/dispatch/handoffs/plan-wanchao/plan.md` 全文（含第三節、末尾裁示）、`wf/workflows/dispatch/handoffs/lead-wanchao/report.md`、`wf/workflows/dispatch/handoffs/lead-wanchao/base-drafts.json` 全部 14 列及 metadata「執行說明」、`wf/workflows/dispatch/handoffs/lead-tide-cal/REPORT.md`。用 `python3 wf/tools/tabledb.py` 查 code-map 的 ops／rules／sim／ui-ops／mcp、testing-checks 第 1、2 列（index 0、1）、engine-backlog 序 57–61；base-drafts 用 metadata 與兩個 slice 讀完。

已讀規格：`wf/workflows/planning/specs/ops/README.md`、`time-and-tick.md`、`time-and-tick/calendar.md`、`data-model-world-map.md`、`battle-interface.md`、`battle-interface/apply-result.md`、`content-format-ops.md` 及子檔 `world.md`／`crew-text.md`／`factions-war.md`；`world-grid/README.md` 及 `map-and-terrain.md`／`movement.md`／`actors-and-encounters.md`／`rifts-on-grid.md`／`migration-and-testing.md`／`ui-contract.md`；`wf/workflows/planning/specs/world/monsters.md`。

已讀內容：`content/lore/events/wanchao-northward.json`、`content/lore/events/wanchao-at-gate.json`、`content/lore/places/chittagong.json`、`content/base/monsters/tidespine-chittagong.json`、`content/lore/style.md`；另查既有 world places／regions／campaign-start／omens／factions-ops、`species/tidespine.json`、`effects/kx-tidal-dread.json`。

程式調查涵蓋 `src/ops/{time,world,sortie,content,state,text}/` 的相關實作、`contracts/lifecycle.ts`、`war/loc.ts`、`sim/{cli,save,replay,invariants}.ts`；`src/rules/{state,command,turn,flow,objectives,attack,effects,contribs}.ts`；`src/sim/{run,session,save,replay}.ts`；`src/ui-adapter/ops/vm/{snapshot,formation,world}.ts`、戰鬥 `vm/{viewmodel,controller,text}.ts`、`src/mcp/campaign-view.ts`、fuzz 不變量與黃金重錄入口。用 grep 查函式／地點／AI 的 `q.isActive` 呼叫，未修改 `src/ai/`。

## 1. 現況與接點

這是一份可交產出線的最小版計畫，不是已實作報告。守則直接約束下列設計：不替牠寫意圖；拍一、拍二不可交戰；不把牠連到蝕壓源頭，不命名其出身蝕域或核心；不新增人物、不設計更高等級；不改萬潮葬王既有數值、不碰 wreck-crown；不借別作品類比。北行與玩家接約無關，外灘不解封，E4 只動一區。

**曆與 tick。** `skyAt`／`clock` 組 `Clock`，`omens`／`tide`／`stage`／`syncOmenFlags` 在 `src/ops/state/`；大潮是 `clock.tide >= GREAT_TIDE`（3），不能以 `phase === "spring"` 冒充。`tickDaily` 段 1 更新曆與天象，段 2 `worldDaily2` → `contractsDaily2`，段 3 航行、行動者、`refreshFog`，段 4 `eventsDaily4`。`pendingChoices`／`pendingBattle` 暫停續點，跨日須逐日結算。

調查指令 `npm run sim:campaign -- --months 30 --policy idle --continue-after-end --seed 1` exit 0、day 840、OK。CLI 不列逐日潮級，另以現成 `skyAt` 唯讀列曆：day 70（month 2, dom 15）、84（3,1）、280（10,1）、490（17,15）是前 25 個 clock.month 中的大潮；8–24 窗口候選為 280、490。另跑同命令 `--months 40`，exit 0、day 1120、OK；`skyAt(1120)` 的 month=40、dom=1、tide=4，包含 `omen/grand-syzygy`。idle 玩家 day 132 已終局，因此這只證明「continue-after-end 的世界時鐘可達」，不是玩家必能活到那夜。

**月份落差須明訂。** 目前 `grand-syzygy.json.at.month=40` 是零起算 clock.month；營運網頁標頭卻印 month+1。最小版服從現成天象排程，E5 用 month=40/day1120，不另造 day1092 的第二次連珠潮。E2 的「開局後第 8–24 蝕月」也沿資料的 clock.month=8..24，兩候選不受一格顯示落差影響。SPEC-GAP：全 UI 蝕月序號統一交後續，不在本線改曆或代表年。

**蝕區。** `BlightPatch {id,rift,map,cells,sinceDay,burned?}`；`patchDepth` 先認 rift.patches[0] 為 core，再用 `worldRules(ctx).nodes.deepMonths * daysPerMonth` 判深淺。`addPatch`／`growPatch`／`removePatch` 管格群與 LIFO；`rebuildBlightIndex` 從 patches 重建 maps[].blight，拒重疊。`placesDaily2` 檢查城 footprint 失守，不是只看深蝕。只重設 sinceDay 既會重新變深，也會破壞 `checkInvariants` 的塊齡排序，不能直接當永久重畫。

**OpsEffect。** `applyOpsEffect` 的實際辨識鍵為 reveal、setGoal、spawnActor、startOperation、opProgress、relation、declareWar、treaty、leakModel、forceLoss、transferPlace、transferShell、ledger、rep、flag、mood、techHours、spawnContract、spawnEvent、setPlace、setRift、nameMech、restraintChoice、salvage、applyEffect；目前沒有 blightShift，也沒有通用「出現 boss」動作。`checkWorld` 的 EFFECT_KEYS 與遞迴 walk 是驗證接點。`setPlace.clearBlight` 會移除附近非核心塊，不適合精確改北岸一區。

**事件／news／契約。** 事件 `EventDef` 是 where/when/weight/text/choices/next；路線已改 field/lane。`offerEvent`、`queuedEvents` 讀 pendingEvents；`eventsDaily4` 會消耗 s.rng 抽隨機事件。現有 news 是事件命名慣例，不是另一套新聞 DB。最小版的五則 news 用 `CampaignEvent` 配 `TemplatesDef.entries` 投放，`eventLog`／`templateEntries` 負責文字，避免五個強制對話連續攔船。契約從 pendingContracts 經 `contractsDaily2`、`offerContract` 進板，必要條件包括 issuer alive／rep／scale／`FactionOpsDef.contractKinds`；只新增 contract JSON 不會自動發包。

**戰場。** `generateScenario`／`generateStandardScenario` 產 `SortieScenario`，`scenarioToSetup` 把 UnitSpawn 轉 UnitInit，`prepareSetup` 重映射戰鬥單位與目標 id；`runSortie` 或 `sortieBattleSetup` 接 sim，`applySortieResult`／`applyBattleResult` 回寫。普通情境選怪從快照與 gradeByWidth 取；不得把唯一 S 混進隨機池。spec 稱 sortie/encounter，但現況遭遇主體在 `sortie/scenario.ts`，目錄只有 `encounter.test.ts`，沒有 `sortie/encounter.ts`。

**呈現。** `render` 產 Screen.room.desc、panels、log、prompt；`buildSnapshot` 產 OpsSnapshot，八分頁是 ship/world/contracts/roster/mechs/ledger/market/calendar。王跡直接在艦橋 room.desc 加一行，UI 既有 room 與 MCP `screenText`／campaign view 都能帶出；結構化列加 `Screen.panels.namedLords`，MCP 既有泛用 panels 複製可承接。契約長文目前缺欄，須加 `ContractTemplate.text`、ContractView.text、snapshot 與 `contractDetail` 顯示。

**四站對照（全部使用既有長陸地圖，不新增靜態地點）。** WorldDB 實際 id 皆帶 `base:`；region 是裸鍵，不能誤寫成 `base:region/...`。

| 敘事站 | 既有地點 id／座標 | 腳本實際 Loc（map 均 base:map/longland） | 選用理由 |
|---|---|---|---|
| 吉大港外灘 | base:place/chittagong (136,97) | white-sail，(136,99)，shoal | 港外一格，不把 S 放城內；沒有外灘獨立 id |
| 鹽灘外海 | base:place/salt-flat (126,99) | reed-hymn，(126,100)，shoal | 既有鹽灘旁的灘海格；按資料不是臆造 salt-flat-offshore |
| 第七哨外海 | base:place/delta (130,100) | tide-scar，(130,98)，shoal | bay-seventh-post 的 territory 正是 delta；lore place/bay-tide-line 在 base 不存在 |
| 達卡北郊河口 | base:place/dhaka (132,94) | tide-scar，(132,96)，shoal | 作為通向北郊的水道口替代；北郊裂縫位置另用 river-crown (132,92)，mire |

路徑是上述四站的敘事順序，不是 A*／每格行軍，不能要求 y 單調下降；既有粗圖鹽灘在西南。北岸 E4 的單一區域明定為 x=129..131、y=97..99 九個連通淺灘格（全為 tide-scar），不含吉大港、達卡或 delta 的 footprint。

實查缺口：default 開局 rifts 只有孟買，沒有達卡北郊裂縫；北岸也不是預置深蝕塊。下面 E2 初始化普通北郊裂縫、E4 初始化一個無核心的既存蝕區，才能讓「封／未封」和「改區」有可操作對象，不能假稱現有資料已具備。這些屬 SPEC-GAP 最小補，與 S 的出身無關。

## 2. E1 王跡

新增可選 `CampaignState.namedLords`，以完整 monster id 為 key；缺此功能資料的測試包保持原樣，不能每個 start 都硬塞本故事。

```ts
type NamedLordState = {
  loc: Loc; heading: "none" | "north";
  sinceDay: number; status: "present" | "northward" | "gone";
  northwardDay: number; routeIndex: number; moved: boolean;
  visited: number[]; northRift?: string;
  gate: "unseen" | "offered" | "accepted" | "closed";
  gateDay?: number; gateSortie?: string;
  captured: boolean; battleFinished: boolean;
};
```

開局在外灘 Loc、heading none、sinceDay=start.day、present、routeIndex=0、visited=[0]、moved=false、captured=false。`initNamedLords(s,ctx,seed)` 在 `newCampaign` 世界資料初始化之後呼叫；只對配置的 `start/default` 啟用。純 getter `lordTrace(s,ctx)` 回傳固定文字及獨立時間欄，不將動態座標插進原句。

三句原文：present＝「吉大港外灘：在。」；northward＝「第七哨外海：往北。」；gone＝「北岸哨所：不見了。」。前綴「王跡」是欄名；sinceDay 可另顯示「最後目擊第 N 天」。northward 顯示的是最後北行報訊，不保證此刻仍站在第七哨。

最小情報政策：艦橋與結構化 campaign view 永遠可見最新一行；進其他地區也能看，不新增市場商品、收費、聲望門檻、誤報亂數。沿用既有 room.desc 顯示，無須改 MCP server。DaySummary 不每日重複寫王跡；變更日用專用模板事件，避免黃金每日增加一欄。

SPEC-GAP（backlog 43 後續）：殘聯免費報上一漲潮位置、塞勒涅訂閱報下一大潮方向、沐蝕會三成不準讖語、哨所賣天網影像，四來源本版都不實作。五則 F2 news 只是原文，不等於已實作訂閱漲價。gone 僅最後目擊失效；captured／戰死用獨立戰果旗，不從 gone 推論。

## 3. E2 腳本移動

**資料與最小範圍。** 用 `content/base/world/actions/wanchao-script.json`（既有 kind action，`actor:"world", valid:{any:[]}, weight:0, cooldownDays:0, effects:[]`），新增選填 `WorldActionDef.lordScript` 的具型別欄位。沿 `action/ops-world.rules` 的現成做法，不新開 world kind，不改 WORLD_FOLDERS／loader。`checkWorld` 加此欄專屬驗證；normalize 已遞迴處理引用。world map 引用須明確用 WorldDB 驗，避免同名 core map kind 誤查。

配置包含 lord、startIds、windowMonths:[8,24]、minTide:3、route（四個 Loc＋對應 place）、routeDelta:1、gradeCap:"A"、observationDays（取一個既有曆月長度，非 S 戰鬥數值）、branchRiftAt (132,92)、branchFamily:"rift/insect"、branchWidth:"D"、blight 區格、gate month:40／omen／allowedRegions、F1 三句、F2 route prompts／choices、F3 gate prompt。戰鬥光環引用既有 effect/kx-tidal-dread。

**擲哪次大潮。** 初始化用 `skyAt` 列出 month 8..24 中 tide>=3 的排序日，另確認日序前已有一次大潮；以既有 `cloneRng(s.rng)`／`nextInt` 在複本抽一次，保存 northwardDay，不回寫主 RNG。抽籤點固定在 newCampaign 原始 createRng(seed) 後、其他消耗之前（可先算 day，稍後初始化地理）；不另造 PRNG，不消耗 warRng／actorRng，也不在每次讀檔重抽。相同 seed 的候選與索引可重現，與主 RNG 的相關性是最小版接受的取捨。候選空列表由 check 拒絕，不偷偷改成普通漲潮或窗口外日期。

**一夜四站。** tick 段 2 的 `worldDaily2` 完成後、`contractsDaily2` 前呼叫新 `namedLordsDaily2`；日期等於 northwardDay 且 !moved 時，同一 tick 依序寫 loc、routeIndex、visited、sinceDay、heading north，各站寫觀測事件；最後 moved=true、status=northward。不開 actor AI，不經船路徑，不要求接約、聲望或玩家在灣內。

每站的「沿途區抬一級」是當夜出獸等級上限加一，**不是永久把每塊都改深、不是產生第二隻 S**。保存 `routeBoosts:{map,region,day,delta:1}`（同 region 當日去重）；`generateStandardScenario` 在當日當地快照的 gradeByWidth 查詢後上移一級並 cap A，不改已 offered 契約的快照、monster def 或 anchor 本尊。未實作全世界天象 effects/backlog40 不擋此局部函式；後續統一時把本函式接進同一查詢，禁止疊加兩遍。前一日無加成、翌日不用移除旗也不生效；已進戰場的 setup 固定。

**北郊裂縫缺口的補法。** 配置 enabled 的新戰役，在 (132,92) 用 `openRift` 建一個普通 D 蟲族 opening 裂縫，使用現成動態 rift-site 機制，將回傳 id 存 northRift；不新增 place JSON，不把牠設為其 anchor。現有 place/ridge (134,87) 雖在北方，但不是河口且距離更遠，不能用它冒稱北郊舊口；這是唯一必要的動態地點，沿程式既有命名，不新增 lore 地名。玩家可照既有清剿／封口系統在北行前封住它。初始普通裂縫改變世界軌跡是實質黃金變更，不用抽籤 RNG 隔離掩蓋。

北行到終站時，只認初始化存下的 northRift，不能抓當天任意「最近」新裂縫。sealed／receding／closed（含已清剿移除 site）視為已封；只記經過。其他 phase 的 width 按 GRADES D→C→B→A 上移一級並 cap A，保持 phase／anchorAge／patches，不再改 S。保存當夜結果 `northBranch:"sealed"|"raised"`，河口問訊依當時結果給一句見聞，不能依數月後現況改寫歷史。「當夜寬度抬一級」本版解為該夜發生一次永久 width 變更；沿途普通加成則只限當夜，兩者不得相加到第二級（北郊命中分支者只用更新後 width）。

**走完的順序。** 先 E4 一次，再寫北行完成旗，再投五則 news、三筆 ContractRequest、兩則路線 prompt 的待觸發旗。moved 和事件去重旗在同一 state 交易內。三筆請求指定 issuer/place，仍由 contractsDaily2 走 eligible：偵察 residual-league→delta；護送 dhaka-weavers→dhaka；守牆 bay-seventh-post→delta。各 faction-ops.contractKinds 加自己的模板；不可加到隨機發包 action，避免平日刷出。

路線事件直接由 `namedLordsDaily4` 在既有隨機事件前檢查位置與待觸發旗，push 現成 Prompt；文字、選項及效果都從 action 配置讀，不另發明文字 DB。第一件在 salt-flat/delta 路段（對應 region 的位置集合）且北行後 observationDays 內一次；第二件在 dhaka/delta 河口路段、E4 已完成後一次。Prompt 不填不存在的 event id（避免 choose 的 next 查找失敗），將「已看／問訊」旗放 choices.effects。首件問訊、轉向，次件問清、幫抬／留下見聞，都不影響世界北行。

偵察合約於觀測窗結束後失效；窗內生成戰場，S 以 E3 presence 在邊緣，仍是此個體的最後可觀測路段。窗結束 status=gone、sinceDay=當日，撤下未接約；已接未出戰也不再生成 S 舊快照。護送／守牆用普通流獸，守牆必不部署 S。短觀測窗相較世界移動是玩法容許的停留，Loc 保持終站水道口，不宣稱牠一直走；不新增第二段 AI 路徑。

## 4. E3 不可交戰在場單位

最小戰鬥方案用真正的 UnitSpawn，加 `presence?:{aura:EffectRef;engageable?:boolean}`，不動 monster 定義。`scenarioToSetup` 傳到 UnitInit；`makeUnit` 存 `rt.presences[id]`，`UnitStatus` 加 "presence"。`isActive` 既有精確比較 status==active，故 presence 自然不進 `computeOrder`／`advance` 補隊列、`checkAbility`／`resolveAbility` 的單體與 AoE 目標、`canCapture`、殲滅／守區計數。`createBattle` 初始 push order 也需改成只收 active，不能只修後續 computeOrder。

採**佔邊緣一格且不可進入**：`unitAt` 加 presence，故 movement／部署衝突沿既有查詢阻擋；在地圖右上保留一個可通行邊格，移出一般 enemy deployZone，兩方一般部署都不得用。這是一格的情境表現，不擴體型、換數值。它本身不能移動、wait、retreat、eject 或發能力。presence 沒有人物、不要憑空生成駕駛。rules 對它的傷害入口仍受 active 限制，生成器不掛對它的直接傷害 hook。

**AI 排除。** 已查 `src/ai/adapters/rules-adapter.ts` 的 q.isActive 委託 R.isActive；knowledge／strategy／tactical／danger／intent 都透過此查詢篩敵我。status=presence 即在 rules 層斷開目標選取，`checkAbility` 再擋偽造直接指令。AI 視野可不認其為對手，UI 另外畫 presence 公開標記。不改 src/ai，不新增評分。AI 原本對總兵力的部分統計可能掃所有 unit，但本版不調評分；這不允許其攻擊 presence。若產出時發現任何繞過合法性直接攻擊的 AI 路徑，先交領導合併，不能順手改並行線。

**光環。** 使用原檔 `effect/kx-tidal-dread`：accuracy -10、onApply moraleCheck dc40、ownerTurns 1、refresh，全部原數值。最小版全戰場有效，敵我所有 active 單位皆受，不對 presence 自己施加。在 `beginTurn` 的 ownerTurns 清理後（turnStartPost 前的確定位置）呼叫 `applyPresenceAuras`，依來源 id 排序對當前 active unit 呼叫 `applyEffect`，故每次真正新回合都覆蓋行動時段；wait resumed 不重施。battle start 可先給所有 active 一次，避免第一輪未輪到者完全無潮懼；refresh 避免疊數值，士氣檢定沿原 effect 行為。來源 presence 保留在 state，因此 effect source 可追；不使用需要來源 active 的自動能力。迎戰後仍保存 aura metadata，來源 active 時光環繼續，死亡／捕獲／撤退後停止。既有 -10 不換成新 debuff 數值。

**勝負與安全接縫。** presence 不算要殺的敵軍、不算守區敵軍，不可作 killTarget/capture 的強制目標。跟蹤偵察用既有 survive 目標（rounds 沿 opsBattleMaxRounds），普通流獸為干擾敵；守牆用 hold。不能用 eliminate 並只有 presence 的空場，否則會開場自動勝。`battleResult` 過濾仍為 presence 的單位，避免被當 alive／戰利品／有效人頭回營運；迎戰後的 active/dead/captured 按一般戰果返回。fuzz `termination` 遇 presence 必須斷言 result 無該 id；加「不在 order、不為 currentActor、格不重疊、部位池仍有效」不變量，不整體豁免。

**UI。** BattleViewModel.cell 在一般知識過濾之外加入 rt.presences 的公開 marker，UnitView／CellView 帶 `selectable:false` 與「在場／不可交戰」文字；controller 的點格、循環選取、選部位與目標都排除，仍可讀 tooltip。棋盤沿既有 cell.unit 渲染，無新圖層／CSS／美術。迎戰後 marker 轉正常 unit，其可視性可公開到本場結束，不依賴被 AI knowledge 視為敵人的時刻。

**存讀／replay。** setup、rt.presences 與 status 都保留，不能從存檔或指令重播刪除。sim save 的 shape 驗 optional presence 與 E5 新 command；replay 走同一 createBattle／tryCommand，必須得到同 hash。campaign 仍記結果而不重跑戰鬥，presence 過濾只發生在戰果輸出，不改 setup。沒有 presence 的舊情境不加空 metadata、不發光環事件，保住既有戰鬥黃金。

## 5. E4 事件改區

最小 effect：`{blightShift:{patch:string,to:"shallow"}}`，只支援**完整單一非核心 patch**。不做任意 cells 切割、不做 clear、不改外灘，避免切成斷裂塊與核心退位。新增 `BlightPatch.depthOverride?:"shallow"`；`patchDepth` 的 core 優先不變，非核心才讀 override。套用記錄 day／事件旗，但**不改 sinceDay**，保住 LIFO 與塊齡排序；永久淺蝕是此劇情的不可逆改區語意，並非每過兩個月又長深。`rebuildBlightIndex` 後沿正常 fog 更新；不直接改 known 成全圖全知。

北岸目前未有預置深塊，MVP 在配置啟用的開局建固定 `wanchao-north-coast` 九格 patch，`origin:"event"`、`rift:""`（明確的無裂縫 sentinel）、sinceDay=開局減既有 deepMonths×月長。它代表已有蝕區，**沒有核心、沒有錨、不是 S 的出生點**。不新增 RiftState、不用孟買 rift 偷掛這片海岸。型別及不變量明訂：origin 未填或 rift 類維持原嚴格父子檢查；event 類必須 rift==""、非 core、<=12 格、連通、合法、索引一致。只有初始化與 blightShift 能寫此 patch，正常 rift LIFO 不持有它。`pressureDaily2` 算 patch 數時排除 event 類，防止把這條故事掛上蝕壓來源。現有 growPatch 用索引判占格，會避開此區，不吞併或重疊。

這個無裂縫區的 MVP 只影響蝕深、通行與顯示；`wildEncounter` 因 rift 空不另外生野群，拍二合約普通流獸由情境明確生成。這是避免捏造源頭／核心所需的有限例外，寫 SPEC-GAP，將來統一獨立蝕區模型時再處理野群。不得宣稱通用事件蝕區完整落地。

`checkWorld` 驗 patch 配置九格、同圖連通、合法且不落城 footprint；effect.to 只准 shallow，目標必是配置的固定 event patch 或合法 runtime 非核心 patch。runtime 不存在／為 core → false，外層 applyCommand clone 回滾；同目標已 shallow → true、無第二筆事件。E2 只在 moved 首次完成時呼叫，之後不重畫；不因重載重複發 news。

SPEC-GAP 補 `world-grid/rifts-on-grid.md` 的深度與 event patch 例外；補 `content-format-ops/world.md` 的 action.lordScript／blightShift 欄位與錯誤語意。北岸之外全圖的自然蝕區仍照原狀態機變化，E4 的寫集精確限制這九格。

## 6. E5 守牆情境＋capture-once

**觸發。** 已有 omen/grand-syzygy、clock.month=40、dom=1，且 gate==unseen。孟加拉灣判定為 `map/longland` 上配置的既有區域鍵集合：river-crown、reed-hymn、white-sail、salt-oath、tide-scar、mourning-sails、green-lantern、ivory-gate、storm-veil、pilgrim-depth、choir-coast、sunset-watch、broken-moon、silver-vigil；不把整個長陸當孟加拉灣。段 4 在航行後位置檢查，只要當夜在集合內即可；段 3 遭遇先處理，resume4 再發。不在灣內則該日結束關閉本次窗口，不在別洲遙控城門戰。此處不讀 calendar UI 的 month+1。

F3 原文是 action 配置 `gate.text`；`namedLordsDaily4` 建現成 Prompt，兩選「離開」「接下守牆」，effects 用新增 `lordChoice:{lord,choice:"decline"|"accept"}`。`applyOpsEffect` 委派 lords.ts 的小函式，驗當日／當前 gate／沒有別場 pendingBattle，不能僅靠任意 flag 伪造入口。

拒絕直接 gate=closed、status=gone、sinceDay=當日，記「轉身回海」事件、**不建立戰鬥、不傳送船**。選 gone 是三句固定文案的最小映射：已看到回海不代表之後確認仍在外灘，王跡仍只說最後目擊失效；回海是獨立事件事實，不以「不見了」推論死亡。未能出戰、離開後或錯過該夜也不發第二張懸賞。

接受建立 `pendingBattle`，trigger 沿 defend，新增 `Sortie.lordEncounter:{lord,beat:"gate"}`，loc 指吉大港、shipOverhead=false。這是灣內受邀援防的遠端出戰例外，船保持原格，不假稱船已抵港；編成預設會把 shipOverhead 改 true 的地方要保留 pendingBattle 的 false（目前 draftSortie clone pendingBattle 已能保留）。`validateSortie` 檢查 pending id、gateSortie、當日、灣內、未結算；不允許手造第二 sortie。可在編成取消後重新編成同一 pending，但不開始第二場。既有營運 API 沒有取消 pendingBattle 動詞，接受之前保留離開選項；戰場中可沿既有出口撤離。

**先 presence，玩家主動迎戰。** gate 情境加入同一 S（engageable=true），預設 presence；一般流獸用既有配方，守牆以 hold／survive 沿既有 rounds，未迎戰也可以守到結束，牠不自動變敵人。新增戰鬥 command `{kind:"engagePresence",actor,target}`，在 flow.ts 用 registerCommand 註冊，tryCommand 的既有 active actor／battle-over／commander 門檻先擋。handler 再驗來源 actor.owner===player、target status==presence、engageable true、此場尚未迎戰；不扣戰鬥 AP（這是開戰確認，不是攻擊）。它把 status 改 active、恢復原怪獸控制，不動任何屬性／池／裝備，插入當輪未行動隊列末端，不搶目前玩家回合，發 PresenceEngaged 事件。拍二 engageable=false，強送同一指令仍拒絕。

UI 在玩家回合的現成 command options 加「迎戰萬潮葬王」與確認；不需選到 presence 本體。controller 用 session.submit 送上述命令；AI legalActions 不提供此入口，auto/spectate 不替玩家決定開打。headless 呼叫者可以明確 submit 命令；MCP 本版仍可看 campaign 王跡與戰果，專用迎戰 tool schema 暫不擴充，列 SPEC-GAP。如需全 AI 打 boss，必須由人先迎戰再切自動。

迎戰把玩家目標切為此 S 的 killTarget **或** capture（兩條 onComplete win），取代原 hold/survive，敵方仍以玩家全滅為勝；普通流獸不必全殺才結束 boss 戰。`prepareSetup` 須同步重映射 presence 目標引用（最好 metadata 存在 UnitInit 本體，避免多餘 id 字串），不能保留 enemy-N 臨時 id。

**捕捉一次。** namedLords.captured 是跨戰役權威；sortie 生成時將可捕獲的 lord def 與 captured 狀態帶入 rt 的情境限制。`canCapture` 額外驗本 lord 必在 gate、已迎戰、未 captured；仍照 species/tidespine.capture 的核完整與 locomotion/manipulator/sensor 損壞條件。第一次 Captured 後 runtime 立即鎖，第二次同場捕捉不生事件。`applySortieResult` 在既有戰果去重後、入庫前檢查唯一 S 捕獲，原子寫 captured=true 與 battleFinished=true；新的 sortie id 也不能再授獎。拘束位不足沿既有戰利品處置，仍鎖唯一個體；不能靠釋放／賣掉／丟棄回到未捕獲。

回寫 presence 未迎戰的戰果不包含 S；迎戰後正常帶 monster def，可辨認 Captured 改 frame 後的唯一個體。偽造非 gate 的 S 戰果拒絕，僅判名詞不能把其他潮脊個體當同一隻；不擴展隨機 S 生成池。

**城的結果。** 玩家未迎戰而守住 hold、迎戰獲勝、撤退／敗北／超時，記獨立 `wallOutcome`（held／won／withdrew／lost／timeout）與當時吉大港狀態快照，不預寫城歸屬；不把 lost 直接設第四核心。已被其他世界事件占領仍可記援防結果，不能暗中收復。SPEC-GAP：前四十月如何累積成吉大港最終存亡、第四核心如何形成，後續規則題，本版不設計核心／新蝕域。gate 當場結束後無論成敗都 closed，唯一捕獲機會不重刷。

## 7. 文案落地表（14 列原文）

序號為 base-drafts 的人類第 1–14 列（index 0–13）。以下正文直接從 tabledb 讀出的「文案大綱」複製；標題為原名稱，只有 Markdown 包裝，沒有改句。路線與守牆 Prompt 刻意合併到同一 action 資料檔，沿現成 Prompt 形狀，降低檔數；不宣稱它們是已存在的 EventDef。

### 7.1 F1／王跡：在

落點：`content/base/world/actions/wanchao-script.json` 的 `lordScript.trace.present`。觸發：開局 present；王跡 getter 固定輸出。依賴：E1。

> 吉大港外灘：在。

### 7.2 F1／王跡：往北

落點：`content/base/world/actions/wanchao-script.json` 的 `lordScript.trace.northward`。觸發：北行當夜起至觀測窗結束，status=northward。依賴：E1、E2。

> 第七哨外海：往北。

### 7.3 F1／王跡：不見了

落點：`content/base/world/actions/wanchao-script.json` 的 `lordScript.trace.gone`。觸發：觀測窗逾期、或拍三離開／收場後 status=gone。依賴：E1、E2、E5。

> 北岸哨所：不見了。

### 7.4 F2／路線事件：海面一條黑脊往北

落點：`content/base/world/actions/wanchao-script.json` 的 `lordScript.routePrompts[0].text`。觸發：北行已完成且在鹽灘／第七哨路段，觀測窗內首次；不抽牌。依賴：E1、E2、E3。

> 海面一條黑脊往北，船肋間掛著斷桅。殘聯聯絡員催你記下時刻。你可以留在遠處報訊，也可以轉向避開。旁邊的拆船工收起鐵鉤，艇板上只有濕透的舊船骨。

### 7.5 F2／路線事件：河口換旗

落點：`content/base/world/actions/wanchao-script.json` 的 `lordScript.routePrompts[1].text`。觸發：北行與改區完成後，達卡／delta 河口路段首次；問訊依 northBranch。依賴：E2、E4。

> 織工衛正在河口接傷員，第七哨哨兵扛著界旗涉過泥水。「第七哨外海，這一區重畫。」他指向岸圖。北郊的舊裂縫已有報訊，你可以上前問清，再幫忙抬擔架；也可以留下沿途見聞，趁艇還沒滿離開。

### 7.6 F2／契約：跟蹤偵察

落點：`content/base/world/contracts/wanchao-scout.json` 的 `text`。觸發：北行完成後一次入板；觀測窗內接約出戰，部署 presence。依賴：E1、E2、E3。

> 殘聯把偵察懸賞掛到歷來最高，聯絡員卻只給你一張目擊簿：「盯著牠，別去碰牠。」沿岸記下黑脊的位置與時刻，帶回報訊便能交差。萬潮葬王遠在海面，望見船骨間的斷桅，你便覺得胸口發緊。

### 7.7 F2／契約：撤離護送

落點：`content/base/world/contracts/wanchao-evacuation.json` 的 `text`。觸發：北行完成後一次入板；護送人群，普通流獸可交戰。依賴：E2、E3。

> 紡織公會的人把撤離名單遞給你：「先把人送到岸上。」織工衛在水道盡頭接應，鹽鷗只等離船後的一小時。沿路若有流獸，替人群擋開；把人送到便能交差。遠處黑脊仍在海上。

### 7.8 F2／契約：守牆但牠不來

落點：`content/base/world/contracts/wanchao-watch.json` 的 `text`。觸發：北行完成後一次入板；第七哨守牆，戰場不部署 S。依賴：E1、E2。

> 第七哨的值哨人交給你一盞燈：「守住這段，等換班。」撤離的人要從海堤通過，你得擋住沿途的流獸。直到天亮，你也沒在牆外看見萬潮葬王；換班人帶來報訊，黑脊已經往北。

### 7.9 F2／news：殘聯徵集目擊

落點：`content/base/world/templates/wanchao.json` 的 `entries.WanchaoLeagueNews.text`。觸發：北行完成後同日全域消息一次。依賴：E1、E2。

> 【殘聯沿岸通告】聯絡員攤開新名冊：「萬潮葬王，吉大港的那隻。」報酬只給目擊與時刻，補給車先去接撤離的人；沒有人領到追殺令。

### 7.10 F2／news：塞勒涅加價

落點：`content/base/world/templates/wanchao.json` 的 `entries.WanchaoSeleneNews.text`。觸發：北行完成後收到全域消息一次；不真的扣訂閱費。依賴：E1、E2。

> 【塞勒涅蝕訊】訂閱櫃檯換了價牌，下一次大潮的方向另售。職員收起星哨影像。客人追問救援，她把提問單原樣推回。

### 7.11 F2／news：沐蝕會改向

落點：`content/base/world/templates/wanchao.json` 的 `entries.WanchaoFaithNews.text`。觸發：北行完成後全域消息一次；不額外擲讖語。依賴：E1、E2。

> 【灣岸目擊】沐蝕會信徒把香爐轉向北面，解拘者跪在濕沙裡。有人喊「王將北行」，旁邊的人仍抄著另一個方向；沒有人能替那句話作證。

### 7.12 F2／news：歸還黨徵兵

落點：`content/base/world/templates/wanchao.json` 的 `entries.WanchaoReturnersNews.text`。觸發：北行完成後轉傳蘇拉特消息一次；不要求新增蘇拉特營運城。依賴：E1、E2。

> 【蘇拉特街頭】歸還黨招募者指著傳來的天網影像：「殘聯連走路的都管不了。」人群裡有人報名，有人走開。影像中的斷桅仍在孟加拉灣。

### 7.13 F2／news：第七哨天亮

落點：`content/base/world/templates/wanchao.json` 的 `entries.WanchaoSeventhNews.text`。觸發：北行且 E4 已成功，當日日結以天亮報訊體例送一次。依賴：E2、E4。

> 【第七哨報平安】哈米德收好孩子名單，讓值哨人報空床。兩座砲台吼過一夜，守砲人只看見火光映在黑脊上。天亮換班，名單沒有多一行。

### 7.14 F3／情境：吉大港守牆

落點：`content/base/world/actions/wanchao-script.json` 的 `lordScript.gate.text`。觸發：clock.month=40 連珠潮夜在灣內，首次守牆邀請；接受後沿用為 scenario.brief。依賴：E5。

> 城門外的斷桅高過牆頭。拆船幫守門人纏著傷手，鐵砧駕駛員托住橫梁，軍械庫聯絡官把補給箱推到你腳邊。你可以離開，也可以接下守牆。萬潮葬王或許會轉身回海；若你決定迎戰，這是唯一能嘗試捕捉牠的一夜。城能否守住，還沒有答案。

第 5 列「上前問清」另掛已封／抬級的見聞結果（程式生成的後續訊息），不得把兩種分支一起塞進上述原文。三件契約以 text 原文顯示於板上詳情及 scenario.brief；name 仍為原工作標題。第 8 列的天亮敘述原文保留，不改寫為新結果保證。

## 8. 產出線工作清單與影響面

**預算：60 檔＝7 新增＋53 修改／預留修改**，包含 spec、索引、測試及全部可能重錄的營運黃金；無差異的候選不寫。這是估算上限，不宣稱每個候選必變。本次 PLAN 不算未來產出線檔數。不得增加第 61 檔，出現就停下交領導看砍法。下方 # 是同節檔案清單序號，跨步驟重用不重複計數。

### 8.1 分步驟與明列路徑

1. **E4 地基**：先補 #39–41 的 SPEC-GAP，再做 #1–4、6–9、30，完整非核心 patch 轉淺，初始化固定 event patch，核／錯 id 拒絕；測試集中 #38。不用任意格切割或 clear。
2. **E1**：#1、2、6、13、30；王跡 getter、開局、艦橋 room.desc 與 Screen.panels；MCP 原有泛用輸出承接，不增加 server 檔。
3. **E2**：#2、3、5、6、10、30、35–37；候選日複本抽籤、北郊普通裂縫、四站旗、當夜抬級與封口分支、一次 E4、news／合約請求。段 4 優先 prompt。普通裂縫與 event patch 都不是 S 的出身設定。
4. **E3**：#10、17–24、25–29；schema 與 TS 同步、presence 狀態／阻格／初始 order／光環／戰果排除、sim 轉換與 UI 禁選。checkAbility、computeOrder、resolveAbility、objectiveDone 原先透過 isActive 的路徑沿用；不需修改這些函式所在檔，更不碰 src/ai。
5. **E5**：#1、3–6、10–12、18、21、24–28、30；拒絕、接受 pendingBattle、迎戰 command、capture-once、戰果回寫、存讀。接受不是迎戰，auto 不替人選戰。
6. **文案與收尾**：#13–16、30–37 依第 7 節落原文；#38 測試；#42 用 tabledb 更新接點；#43–47 產生索引；#48–60 僅在實際差異／舊 id 失效時重錄。不要新增 lore、人物、故事怪數值或 AI 評分。

| # | 明列路徑 | 類型 |
|---:|---|---|
| 1 | `src/ops/state/types.ts` | 改／預留 |
| 2 | `src/ops/content/start.ts` | 改／預留 |
| 3 | `src/ops/content/check.ts` | 改／預留 |
| 4 | `src/ops/content/opseffect.ts` | 改／預留 |
| 5 | `src/ops/time/tick.ts` | 改／預留 |
| 6 | `src/ops/world/lords.ts` | 新 |
| 7 | `src/ops/world/blight.ts` | 改／預留 |
| 8 | `src/ops/world/pressure.ts` | 改／預留 |
| 9 | `src/ops/sim/invariants.ts` | 改／預留 |
| 10 | `src/ops/sortie/scenario.ts` | 改／預留 |
| 11 | `src/ops/sortie/validate.ts` | 改／預留 |
| 12 | `src/ops/sortie/run.ts` | 改／預留 |
| 13 | `src/ops/text/render.ts` | 改／預留 |
| 14 | `src/ui-adapter/ops/vm/snapshot.ts` | 改／預留 |
| 15 | `src/ui-adapter/ops/vm/types.ts` | 改／預留 |
| 16 | `src/ui-adapter/ops/dom/tabs.ts` | 改／預留 |
| 17 | `src/core/types-def.ts` | 改／預留 |
| 18 | `src/core/types-state.ts` | 改／預留 |
| 19 | `schemas/content.schema.json` | 改／預留 |
| 20 | `src/rules/state.ts` | 改／預留 |
| 21 | `src/rules/flow.ts` | 改／預留 |
| 22 | `src/rules/turn.ts` | 改／預留 |
| 23 | `src/sim/run.ts` | 改／預留 |
| 24 | `src/sim/save.ts` | 改／預留 |
| 25 | `src/ui-adapter/vm/types.ts` | 改／預留 |
| 26 | `src/ui-adapter/vm/viewmodel.ts` | 改／預留 |
| 27 | `src/ui-adapter/vm/controller.ts` | 改／預留 |
| 28 | `src/ui-adapter/vm/text.ts` | 改／預留 |
| 29 | `test/fuzz/invariants.ts` | 改／預留 |
| 30 | `content/base/world/actions/wanchao-script.json` | 新 |
| 31 | `content/base/world/contracts/wanchao-scout.json` | 新 |
| 32 | `content/base/world/contracts/wanchao-evacuation.json` | 新 |
| 33 | `content/base/world/contracts/wanchao-watch.json` | 新 |
| 34 | `content/base/world/templates/wanchao.json` | 新 |
| 35 | `content/base/world/factions-ops/residual-league.json` | 改／預留 |
| 36 | `content/base/world/factions-ops/dhaka-weavers.json` | 改／預留 |
| 37 | `content/base/world/factions-ops/bay-seventh-post.json` | 改／預留 |
| 38 | `src/ops/world/lords.test.ts` | 新 |
| 39 | `wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md` | 改／預留 |
| 40 | `wf/workflows/planning/specs/ops/content-format-ops/world.md` | 改／預留 |
| 41 | `wf/workflows/planning/specs/ops/battle-interface.md` | 改／預留 |
| 42 | `wf/workflows/common/code-map.json` | 改／預留 |
| 43 | `content/index/base-action.json` | 改／預留 |
| 44 | `content/index/base-contract.json` | 改／預留 |
| 45 | `content/index/base-templates.json` | 改／預留 |
| 46 | `content/index/base-faction-ops.json` | 改／預留 |
| 47 | `content/index/_summary.json` | 改／預留 |
| 48 | `test/campaigns/ops-war-assault.json` | 改／預留 |
| 49 | `test/campaigns/ops-betrayal.json` | 改／預留 |
| 50 | `test/campaigns/ops-leak.json` | 改／預留 |
| 51 | `test/campaigns/ops-relic.json` | 改／預留 |
| 52 | `test/campaigns/ops-merc-join.json` | 改／預留 |
| 53 | `test/campaigns/ops-war-assault.hash.json` | 改／預留 |
| 54 | `test/campaigns/ops-betrayal.hash.json` | 改／預留 |
| 55 | `test/campaigns/ops-leak.hash.json` | 改／預留 |
| 56 | `test/campaigns/ops-relic.hash.json` | 改／預留 |
| 57 | `test/campaigns/ops-merc-join.hash.json` | 改／預留 |
| 58 | `test/campaigns/grid-actors.hash.json` | 改／預留 |
| 59 | `src/ops/sim/fixtures/campaign.json` | 改／預留 |
| 60 | `src/ops/sim/fixtures/campaign-hash.json` | 改／預留 |

#6 集中本線純 helper（initNamedLords、lordTrace、namedLordsDaily2／Daily4、applyLordChoice、shiftBlight）；不讓 world 模組反向 import contracts。#12 的 applySortieResult 在既有去重之後入庫之前驗證唯一 S，不另改 apply.ts。#21 用既有 registerCommand，不新增 rules 模組登記。#28 補 PresenceEngaged 文本；presence marker 狀態由 viewmodel 直接給，不另開 labels 檔。#38 以三組 describe 集中世界、戰鬥接縫、UI／存讀測試，避免每案例一檔。

**北郊初始化 ID 決策**：#2 呼叫 #6 時按 openRift／ensureCore 的現有結構建立固定命名空間的 rift、動態 site、core patch，保持 s.idCounter 不變；northRift 記這個固定 id。第 3 節提到 openRift 是行為模型，最終採此固定 id 建構，避免初始化插號使五條舊戰役全失效。不得先呼叫 openRift 再只改 rift.id：site、patch.rift、索引、事件引用必須一致。正常後續擴散仍用既有 growPatch，世界行為差異照實重錄。

### 8.2 單元測試清單（產出線執行）

以下全加到 `src/ops/world/lords.test.ts`，可調用公開 sim／rules／UI API；配合 #29、#9 的現成不變量，不另改 fuzz generator。這些是未來功能驗證，**不是本次 PLAN 的新驗收條目**。

- 開局王跡精確為「吉大港外灘：在。」；無配置的測試包不新增故事 state。相同 seed 抽到相同候選；所有候選落在 8–24 蝕月大潮日且此前已有大潮；抽日期不改主／war／actor RNG。
- 不接任何合約也北行；多日與逐日推進的四站 visited、loc、day 一致，news／合約／E4 各一次。沿途上限加一、cap A、翌日失效；北郊已封不抬、未封 width 抬一次，不能再疊沿途第二級。
- 北行後恰北岸九格永久 shallow；其他區與外灘未被 E4 寫入。相同 effect 再套不重發事件；core／不存在 patch 的反例拒絕且回滾；event patch 不增加 pressure 項；存讀後索引一致、正常 patch 父子與 sinceDay 排序仍成立。
- presence 不進 order/currentActor，阻止進格，單體／部位／AoE 均不可打；q.isActive=false，直接 checkAbility／tryCommand 也不能繞過。敵我 active 單位都受原潮懼 accuracy -10；wait resumed 不重施，來源死／捕後停。勝負忽略 presence，battleResult 無該單位；偵察有牠、「守牆但牠不來」無牠。
- F3 拒絕＝沒有 pendingBattle／BattleResolved；接受仍不可瞄準，明確迎戰後才可攻擊；拍二強送迎戰拒絕，AI auto 不迎戰。迎戰只插隊列一次、不搶目前回合。捕捉原部位條件未達拒絕；成功後第二次同場／另 sortie／重送結果均不能多一頭獸或報酬；城歸屬不被寫死。
- presence setup／snapshot 與迎戰 command save/replay hash 相等；北行前後、gate 待選、capture 鎖都可存讀；campaign replay 仍只套戰果不重跑戰鬥。BattleController 的點格與循環不能選 presence，確認迎戰才 submit；OpsSnapshot／五則 news／契約 text 與 14 列原文一致。
- checkWorld 餵空候選、越界格、不連通區、錯 map／monster／effect 至少一個真實反例會紅，再驗正資料綠；不能只用自造 stub 恆真檢查。fuzz termination 明訂 presence 必須不在 result，其他池／層／重播不變量保留。

### 8.3 SPEC-GAP 補段

`world-grid/rifts-on-grid.md` 補 event patch、rift 空 sentinel、無核心、永久 depthOverride、索引／pressure 例外。`content-format-ops/world.md` 補 action.lordScript 全形狀、月份 clock.month 慣例、RNG 複本、固定普通裂縫、Prompt 原文／news／合約、blightShift 與 lordChoice 驗證。`battle-interface.md` 補 UnitSpawn／UnitInit／UnitStatus／engagePresence 的跨層契約、光環、結果排除與唯一捕捉；附四情報來源、城市最終存亡及 MCP 專用迎戰入口未做。

三檔是本波全部規格寫集；第 1 節月份問題在 content-format-ops/world 的腳本段明示，第 2 節情報政策在 battle-interface 的限制段明示，不為它們再改別的規格檔。之後若要把完整 core 契約搬回 core/data-model-world，交領導另做整理，不偷加第 61 檔。

### 8.4 黃金影響與重錄方法

既有不含 presence 的戰鬥情境不加空 metadata／新事件／光環，預期 `test/golden/` 不變。新戰場與迎戰先用本線測試證明 replay 相等，不新增整套黃金檔。若並行 AI 線使舊戰鬥黃金改變，由領導歸因與統一重錄，不能盲歸本線。

戰役黃金可能變：普通北郊裂縫改日結、契約與後續 RNG；固定北岸區改地圖；day280/490 後新增北行／新聞／合約／改區。抽日期已不消耗別的流，這些仍是實質行為變更。#48–60 全部列為候選，不是只算 hash 隱藏指令重錄成本。

先閱讀事件差異，在 repo 根依序：

```sh
node test/campaigns/rerecord.ts
GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts test/campaigns/grid-actors.test.ts src/ops/sim/golden.test.ts
```

rerecord 依原指令意圖重走，hash 另產。寫死 contract id 的戰役必須按 template＋issuer＋target＋事件順序手動對應，不能全部作數字位移。`src/ops/sim/fixtures/campaign.json` 不在上述重錄器範圍，失效時手動對應後再產 campaign-hash。若共用 golden-spec.ts 的固定作戰 id 仍失效，不擴白名單去改子序列繞驗收，先看固定 ID 初始化是否正確，仍不可行就停下依 8.5 回報。

領導若已有依據需重錄舊戰鬥黃金，指令是 `GOLDEN_UPDATE=1 node --test test/golden.test.ts`；其新增寫集交黃金收尾線，不算本線已授權修改。索引用 `python3 -I wf/tools/content_index.py`，只重寫有差異分片。

產出線依既有 testing-checks 前兩列跑 `npm test`、`npm run check`、`npm run typecheck`、提交前黃金與 `bash wf/tools/wf-lint.sh --strict .`；UI 依 testing.md 跑 `npm run test:dom`、`npm run build`、`npm run test:e2e`（headless）。這些是未來實作的工程要求，本次計畫線不跑，不增加本次四條驗收。

### 8.5 超出預期時的最小可行版與砍法

已砍四情報來源、任意 cells 切區／clear、真實城市失守演算、S 世界 AI、新 MCP 迎戰工具、光環距離系統；14 列集中五個內容檔，測試集中一檔。若必要改動超過 60 檔，停止並列出第 61 個需求及理由。

可再砍北郊「新預置普通裂縫」：只綁開局已存在的指定北郊裂縫，沒有就保存 northBranch=missing，不冒稱已封、不發不存在口的抬級見聞。其餘 E1–E5 與14列主文可運作，封／未封分支用 fixture 驗。此砍法降低早期世界／黃金連鎖，但正式 base 暫無可封口分支，必須明報「E2 部分完成」交領導決定；完整最小版能在60檔內就不先砍。

若灣內遠端援防牽動過多接縫，可砍為只有吉大港附近能接受出戰，其餘灣內只收原文消息與離開選項；這縮減了原要求的可接範圍，必須交領導裁定，不能無聲替換。不砍主動迎戰／拍二禁戰／capture-once 來省檔。

### 沒做到或證據不足的

只交計畫，未實作 E1–E5，未跑功能單元／UI／黃金，未改既有檔、lore 或 commit。30 蝕月指定模擬與40蝕月補充唯讀調查都完成；idle 玩家早終局，40蝕月只證明世界可達。60檔是包括候選黃金的預估，不宣稱未寫出的程式已編譯通過。

### 需要決定的事

無阻擋本 PLAN 的待答問題，已有可執行預設。領導產出前可覆核：沿 clock.month=40；補普通北郊裂縫與無核心北岸 event patch；灣內遠端援防而船不傳送。若不接受初始化，按8.5明報縮減。四來源、城市最終歸屬、MCP迎戰工具留後續。lore 代表年不作引擎日期，本線不需要改 lore。lead-wanchao 所列 wreck-crown 正面斬擊與拍一守則落差、哈米德「老鷺／老鸛」兩寫仍交 lore 持有線，本線不改。

### 以後交接書該點名的工具

保留 tabledb、grep、inbox_poll／inbox_mail、sim:campaign；另點名 skyAt／omens 的唯讀 Node 查詢（CLI 月報不列潮級）、gridOf／locAt／terrainAt（區分 lore ID 與實際格）、content_index.py（新增內容索引）、test/campaigns/rerecord.ts（僅改 hash 不會修寫死 id）。應寫清「30 蝕月不會跑滿40」與月份零起算，直接指定40蝕月調查以取得對應證據。
