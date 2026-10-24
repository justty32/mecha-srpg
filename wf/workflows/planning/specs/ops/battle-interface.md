# battle-interface — 出戰編成→情境生成→戰果回寫

[ops README](README.md)｜core 出口 [core/rules-battle-flow](../core/rules-battle-flow.md)（`BattleResult`）｜情境資料 [core/data-model-world](../core/data-model-world.md)

裁示：戰後不補滿；捕捉是生物系來源；撤離與棄機後機甲可能被占或回收；敵軍接約前固定不縮放；十分律兵器是昂貴輔助火力。**營運層只經 `sim.runBattle` 與 `BattleResult` 與戰鬥層往來**，不讀戰鬥內部狀態（core 的唯一出口裁示）。

## 一、出戰編成 Sortie

```ts
type Sortie = { id: Id; day: number; contract?: Id; loc: Loc /*原 node；格上戰鬥只有格*/; rift?: Id; operation?: Id; actors?: Id[] /*遭遇在場行動者*/;
  trigger: "contract" | "ambush" | "defend" | "ruin-exit" | "collection" | "operation" | "intercept";   // operation＝參戰型；intercept＝大地圖遭遇開打
  units: { mech: Id; seats: Record<SeatId, Id | null>; controlMode: ControlMode }[];
  supplies: { airstrikeTickets: number; restraintRounds: number; shipOverhead: boolean };
  injected: { target: "mech" | "person"; id: Id; effect: EffectRef }[] };   // 營運→戰場的狀態注入（mood、同調、欠薪…）
```

合法性由營運層檢查（純函式 `validateSortie`）：機甲在機庫或拘束艙、不在修理佇列中「開工」狀態（排隊中可拉出，但 job 退回佇列尾）；活捕獸 `wear < 100`、不在蛻皮窗口、不是整屍；座位人物活著、未 `withering`；古代機甲座位必是認主者；活捕獸要載人必須至少一個拘束裝置已 `install`；沒有拘束的活捕獸只能**無座位出戰**（`controlMode:"instinct"`，本能交 AI、不可控，Screen 要警告）；屍體改裝機與摹機同規則；`shipOverhead` 需船在該格或地點 footprint 內。**出戰不耗 tick**。注入清單把營運狀態翻成 core Effect（全是 contribution／起始值，core 零修改）：`mood<0 → 起始 shaken`、`bond → burdenLimit contribution`、`wear ≥ 50 → instinct 起始值 + (wear−50)/2`、`vitality < 50 → 速度／AP contribution −`、`RosterState.trust[soul][pilot] → contested 檢定修正`、`RosterState.mastery[soul][node] → 該節點 perk 貢獻 × mastery`（未練熟＝乘數 <1）。

## 二、情境生成 ScenarioGen

`generateScenario(sortie, campaign, content, rng) → ScenarioDef`，純函式，用營運層自己的 RNG 串流抽（戰鬥用另一個 seed，寫進 `ScenarioDef.seed`）。步驟：(1) **地圖**：**從格讀**（[world-grid/actors-and-encounters](world-grid/actors-and-encounters.md)）——地形池＝該格與八鄰 `base` 地形的 `battle_pool` 加權聯集、蝕深＝該格 `blight.depth`、族＝蝕塊所屬裂縫或 swarm、地點 footprint 內疊地點模板、`road` 格加一條道，再用 `encounters/<family>-<depth>.json` 的尺寸與配方合成 `MapDef`（`cells`＋`legend`）。(2) **敵方**：來自 `ContractState.target.snapshot`（`EnemySnapshot`：族、寬度、深度、錨齡、**`phase`**→ 預算 → 從 `monsters.json` 等級清單抽 `UnitSpawn`；`anchored` 以上的核區才加入潮錨本尊 `MonsterDef`，`opening` 期只有先鋒）；遭遇戰由在場行動者的預算抽，第三方入 `third` slot。(3) **目標**：契約模板 `ObjectiveTemplate` 展開（clear→eliminate（目標見 factions-contracts「清剿打什麼」）、seal→hold 核區 N 輪、escort→escort、capture 類契約→capture、defend→hold＋設施 `destructible` 計數）。(4) **支援**：`airstrikeTickets` 變成玩家 slot 的「呼叫支援」能力次數；`shipOverhead` 加入艦砲單位（會飛的裂獸會去咬它）；城邦地點加砲台單位（`conventional-arms`）。(5) **注入**：`sortie.injected` 寫進 `UnitSpawn` 的 `effects`（core `UnitSpawn` 無此欄 → 見「與 core 的差異」）。(6) `rules.conventionalFactor` 預設 0.1。(7) **參戰型**（`trigger:"operation"`）：敵方改由作戰目標（裂縫快照或敵勢力分遣隊）抽、友軍依指揮權填 `ally` slot 或併入 `player` slot、`allies` 由外交態映射、軍令為 optional 目標——細則在 [mercenary-contracts](mercenary-contracts.md)；回寫多三組：作戰進度、友軍折損、殼的持有者。

## 三、戰果回寫 applyBattleResult

`applyBattleResult(campaign, sortie, result: BattleResult) → (campaign', CampaignEvent[])`，純函式。**回寫欄位**共八組，逐組如下。

**`units[].status`／`state`**：`alive` → `MechState.parts`／`pools`（戰鬥限定池不存在於機甲；`heat`（燼）等依 `PoolDecl.decayCurve` 歸基線；`ammo*` 池由停泊時的補給補滿，見經濟檔）原樣寫回機庫；`dead` → 殘骸：拆成 `LootBundle`（可回收部件保留層 HP、材料進帳本），古代機甲 `dead` 改為 `dormant`＋`grudge`；`retreated` → 同 alive；`derelict-recovered` → 回機庫，座位清空；`derelict-lost` → 從機庫移除、寫 `LostMech` 事件（勢力記憶：競爭獵團可能撿去）；`captured` → 新 `BeastState(kind:"live", wear:0)`，拘束艙無空位則留在該格的 `wreckage` 一天；可拘束族的 `dead` 可改選**留整屍**（`CarcassState`，占一位，供屍體改裝）。

**`persons[].status`／`state`／`xpGained`**：`alive` → 原樣寫回（傷勢、hp 池、共鳴、`burden` 依內容包衰減或歸零、soulTree 不變）；`xpGained` 已含在 state 的 `xp`，營運層只在回船時結升級；`dead` → `RosterState.dead`、全團 mood −1、該人 `boundTo` 部件留下、認主機甲 `dormant`。

**`loot[]`**：`components` → Inventory（戰損 HP 保留）、`materials` → 帳本 `stock:*`（每筆 `reason` 帶 `result.log` 的 hash）；容量不足的留在 `PlaceState.wreckage`（野外格掛 `maps[].wreckage[cell]`），**下一天**仍可取、再過一天消失（CHR-20 答案）。

**契約（`ContractState`）**：`heads` 按有效戰果計（`UnitDied` 事件中敵方單位、同一單位只算一次，不算部位）；目標完成 → `done`、付尾款（`cash +`）與 `onComplete`；失敗 → `failed`；部分成功 → 半額。

**裂縫（`RiftState.phase`）**：敵方 `anchor` 單位 `dead` 或 `captured` → `unanchored`；`seal` 類情境勝 → `sealing`；**`opening` 期**清剿勝且先鋒全滅 → 直接 `closed`（快照 `phase` 接約當天凍結；拖過第四天照 `opening` 打但半額、關不掉已 `anchored` 的）；游態巢母死 → 刪 `opening` 候選。

**聲望（`FactionState.rep`）**：契約模板與事件表的 `rep` 變動；在城邦邊使用空援／艦砲誤傷設施 → 城邦 rep −。

**耗材（`Inventory.tickets`）**：`airstrikeTickets` 按 `AbilityUsed` 事件實際使用數扣；拘束矢按 `capture` 能力使用數扣。

**記錄（`CampaignEvent`）**：`{type:"BattleResolved", payload:{sortie, hash(result.log), rounds, winner}}`，重播用。

## 與 core 的差異（提出，不改 core）

(1) `UnitSpawn.effects?: EffectRef[]` 承接注入（core 2026-10-24 已採用為可選欄）。(2) 古代機甲 `dead`→`dormant` 由營運層看 `FrameDef.cls` 判斷，core 不改。(3) 空援券＝玩家 slot 加一個 `conventional-arms` 虛擬單位、能力池 `max = tickets`。(4) 無座位活捕獸用 core `controlMode:"instinct"`（已實作）。

## 替使用者做掉的決定

1. **出戰不耗 tick、戰鬥在一天之內**：「大潮當天連打兩場」成立，時間不在兩層間重複結算。
2. **營運→戰場的狀態全走 Effect 注入**：心情、同調、磨損、活性、信任都不進 core 型別，core 零修改。
3. **戰場用獨立 seed、由營運 RNG 抽出**：campaign 重播只需營運指令序列。
4. **殘骸留一天可取、再過一天消失**：給「先回船卸貨再來」一次機會，又不讓地圖堆垃圾。
5. **有效戰果以單位死亡計、部位不算頭**：OPS-16 的多部位重複領賞直接封死。
6. **`opening` 期殲滅先鋒即關裂縫**：給「趕第四天」真實報酬；錨到了才是真裂縫（2026-10-24 補，lead-ops-bio-balance 缺口）。
