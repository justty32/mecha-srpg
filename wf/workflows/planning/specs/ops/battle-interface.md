# battle-interface — 出戰編成→情境生成→戰果回寫

[ops README](README.md)｜core 出口 [core/rules-battle-flow](../core/rules-battle-flow.md)（`BattleResult`）｜情境資料 [core/data-model-world](../core/data-model-world.md)

裁示：戰後不補滿；捕捉是生物系來源；撤離與棄機後機甲可能被占或回收；敵軍接約前固定不縮放；凡鐵兵器是破甲輔助火力（2026-10-24 晚：十分律改抵抗性，凡鐵殺不了獸）。**營運層只經 `sim.runBattle` 與 `BattleResult` 與戰鬥層往來**，不讀戰鬥內部狀態（core 的唯一出口裁示）。

## 一、出戰編成 Sortie

```ts
type Sortie = { id: Id; day: number; contract?: Id; loc: Loc /*原 node；格上戰鬥只有格*/; rift?: Id; operation?: Id; actors?: Id[] /*遭遇在場行動者*/;
  trigger: "contract" | "ambush" | "defend" | "ruin-exit" | "collection" | "operation" | "intercept";   // operation＝參戰型；intercept＝大地圖遭遇開打
  units: { mech: Id; seats: Record<SeatId, Id | null>; controlMode: ControlMode }[];
  supplies: { airstrikeTickets: number; restraintRounds: number; shipOverhead: boolean };
  injected: { target: "mech" | "person"; id: Id; effect: EffectRef }[] };   // 營運→戰場的狀態注入（mood、同調、欠薪…）
```

合法性由營運層檢查（純函式 `validateSortie`）：機甲在機庫或拘束艙、不在修理佇列中「開工」狀態（排隊中可拉出，但 job 退回佇列尾）；活捕獸 `wear < 100`、不在蛻皮窗口、不是整屍；座位人物活著、未 `withering`；古代機甲座位必是認主者；活捕獸要載人必須至少一個拘束裝置已 `install`；沒有拘束的活捕獸只能**無座位出戰**（`controlMode:"instinct"`，本能交 AI、不可控，Screen 要警告）；屍體改裝機與衍型機同規則；`shipOverhead` 需船在該格或地點 footprint 內。**出戰不耗 tick**。注入清單把營運狀態翻成 core Effect（全是 contribution／起始值，core 零修改）：`mood<0 → 起始 shaken`、`bond → burdenLimit contribution`、`wear ≥ 50 → instinct 起始值 + (wear−50)/2`、`vitality < 50 → 速度／AP contribution −`、`RosterState.trust[soul][pilot] → contested 檢定修正`、`RosterState.mastery[soul][node] → 該節點 perk 貢獻 × mastery`（未練熟＝乘數 <1）。

## 二、情境生成 ScenarioGen

`generateScenario(sortie, campaign, content, rng) → ScenarioDef`，純函式，用營運層自己的 RNG 串流抽（戰鬥用另一個 seed，寫進 `ScenarioDef.seed`）。步驟：(1) **地圖**：**從格讀**（[world-grid/actors-and-encounters](world-grid/actors-and-encounters.md)）——地形池＝該格與八鄰 `base` 地形的 `battle_pool` 加權聯集、蝕深＝該格 `blight.depth`、族＝蝕塊所屬裂縫或 swarm、地點 footprint 內疊地點模板、`road` 格加一條道，再用 `encounters/<family>-<depth>.json` 的尺寸與配方合成 `MapDef`（`cells`＋`legend`）。(2) **敵方**：來自 `ContractState.target.snapshot`（`EnemySnapshot`：族、寬度、深度、錨齡、**`phase`**→ 預算 → 從 `monsters.json` 等級清單抽 `UnitSpawn`；`anchored` 以上的核區才加入蝕錨本尊 `MonsterDef`，`opening` 期只有先鋒）；遭遇戰由在場行動者的預算抽，第三方入 `third` slot。(3) **目標**：契約模板 `ObjectiveTemplate` 展開（clear→eliminate（目標見 factions-contracts「清剿打什麼」）、seal→hold 核區 N 輪、escort→escort、capture 類契約→capture、defend→hold＋設施 `destructible` 計數）。(4) **支援**：`airstrikeTickets` 變成玩家 slot 的「呼叫支援」能力次數；`shipOverhead` 加入艦砲單位（會飛的裂獸會去咬它）；城邦地點加砲台單位（`conventional-arms`）。(5) **注入**：`sortie.injected` 寫進 `UnitSpawn` 的 `effects`（core `UnitSpawn` 無此欄 → 見「與 core 的差異」）。(6) `rules.conventionalFactor` 預設 0.1。(7) **參戰型**（`trigger:"operation"`）：敵方改由作戰目標（裂縫快照或敵勢力分遣隊）抽、友軍依指揮權填 `ally` slot 或併入 `player` slot、`allies` 由外交態映射、軍令為 optional 目標——細則在 [mercenary-contracts](mercenary-contracts.md)；回寫多三組：作戰進度、友軍折損、古代機的持有者。

**三、戰果回寫 applyBattleResult**（八組回寫欄位：單位、人物、戰利品、契約、裂縫、聲望、耗材、記錄）→ [battle-interface/apply-result](battle-interface/apply-result.md)

## 與 core 的差異（提出，不改 core）

(1) `UnitSpawn.effects?: EffectRef[]` 承接注入（core 2026-10-24 已採用為可選欄）。(2) 古代機甲 `dead`→`dormant` 由營運層看 `FrameDef.cls` 判斷，core 不改。(3) 空援券＝玩家 slot 加一個 `conventional-arms` 虛擬單位、能力池 `max = tickets`。(4) 無座位活捕獸用 core `controlMode:"instinct"`（已實作）。

## 替使用者做掉的決定

1. **出戰不耗 tick、戰鬥在一天之內**：「漲潮當天連打兩場」成立，時間不在兩層間重複結算。
2. **營運→戰場的狀態全走 Effect 注入**：心情、同調、磨損、活性、信任都不進 core 型別，core 零修改。
3. **戰場用獨立 seed、由營運 RNG 抽出**：campaign 重播只需營運指令序列。
4. **殘骸留一天可取、再過一天消失**：給「先回船卸貨再來」一次機會，又不讓地圖堆垃圾。
5. **有效戰果以單位死亡計、部位不算頭**：OPS-16 的多部位重複領賞直接封死。
6. **`opening` 期殲滅先鋒即關裂縫**：給「趕第四天」真實報酬；錨到了才是真裂縫（2026-10-24 補，lead-ops-bio-balance 缺口）。


## SPEC-GAP 補（2026-10-26 lead-engine-next）

`UnitSpawn.presence?` 與 `UnitInit.presence?` 承接 `{aura:EffectRef,engageable?:boolean,captureLocked?:boolean}`；runtime 保存 `rt.presences`，`UnitStatus` 增加 presence。這是佔邊格的公開在場單位，`isActive=false`：不進初始或後續 order／currentActor，不能移動、wait、撤離、棄機、發能力、作單體／部位／AoE／捕捉目標，但 unitAt 仍阻格。UI 顯示「在場／不可交戰」marker，點格、循環、部位及目標選取排除它。偵察部署 engageable=false；普通護送／「守牆但牠不來」不部署此 S。

光環引用既有 effect/kx-tidal-dread，原 accuracy -10、dc40 士氣檢定、ownerTurns=1 與 refresh 均不改。戰鬥開始給敵我 active 單位，真正新回合在 ownerTurns 清理後再施；wait resumed 不重施。來源 presence 或迎戰後 active 時有效，死亡／捕獲／撤退後停止。presence 不算殲滅、守區或其他勝負人頭，battleResult 排除仍為 presence 的單位，fuzz 仍驗池、格、隊列與 result 排除不變量。

`Sortie.lordEncounter?:{lord:Id,beat:"gate"}` 標識第40蝕月唯一守牆戰。營運驗 pending id、gateSortie、當日、灣內且未結算；遠端灣內援防只改 sortie.loc，不傳送船、不開艦砲。接受守牆後 S 仍是 presence；明確玩家指令 `{kind:"engagePresence",actor,target}` 才能把 engageable=true 的目標改 active，保留原數值與怪獸控制，不扣 AP，只插一次當輪隊列末端、不搶目前回合，發 PresenceEngaged。拍二強送拒絕，AI auto／spectate 不替玩家迎戰。迎戰後玩家目標改為此 S 的 killTarget 或 capture 兩條 win，敵方仍以玩家全滅為勝。

唯一捕捉權威為 CampaignState.namedLords[lord].captured。setup 將 gate 可捕捉與鎖帶進 runtime；canCapture 仍守原 species/tidespine 的核完整與部位破壞條件，且本場須已迎戰、未鎖。首次 Captured 即鎖 runtime；applySortieResult 在去重後、入庫前驗證唯一 S 戰果，原子寫 captured／battleFinished，其他 sortie 或重送不能多獸或酬金。拘束位不足、釋放、出售或丟棄都不解鎖。setup／snapshot／command 存讀重播保持同 hash；campaign 重播仍只套戰果，不重跑戰鬥。無 presence 的舊戰場不新增空 metadata 或光環事件。

守牆結算只記 wallOutcome=held／won／withdrew／lost／timeout 與當時城市快照，gate 關閉且王跡 gone；不覆寫吉大港歸屬、不自動建立第四核心。四情報來源商品／誤報、前40月如何累積城市最終存亡、S 世界 AI、MCP 專用迎戰工具仍未實作；現有通用輸出可讀王跡與戰果，headless 呼叫者可明確送迎戰指令。
