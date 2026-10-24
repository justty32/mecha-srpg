# actors-and-encounters — 移動物件與簡化 AI、接觸範圍、遭遇四選、從格生成戰場

[world-grid README](README.md)｜移動共用函式在 [movement](movement.md)｜部隊與作戰在 [data-model-operations-war](../data-model-operations-war.md)｜情境生成在 [battle-interface](../battle-interface.md)

## 行動者 ActorState

```ts
type ActorState = { id: Id; kind: "force" | "patrol" | "caravan" | "swarm" | "band"; faction: Id; pos: Loc; path?: Cell[]; mp: number;
  goal: { type: "idle" | "goto" | "patrol" | "raid" | "return" | "hunt" | "trade" | "escort" | "flee"; target?: Loc | Id; until?: number };
  str: number /*戰力點，operations-war 的 gp 制*/; roster?: Id /*競爭獵團預算快照*/; swarm?: { rift: Id; family: Id; grades: Grade[] };
  cargo?: number; stance: "hostile" | "wary" | "neutral" | "friendly"; born: number; lastSeenByPlayer?: number; flags: string[] };
```

勢力部隊 `force` 是 `OperationState.force` 在圖上的影子（作戰 `march` 階段建立、`aftermath` 刪除；`ForceState.pos` 就指它）。其餘四種由行動牌與裂縫產生：巡邏（勢力地盤每城 0–1 支）、商隊（城與城之間走道、`trade` 牌產生）、裂獸群（裂縫在大潮日放出，見下）、別的獵團（`spawnRival` 牌、有名字、會接契約）。全世界同時約 **60–120 個**行動者；存 `CampaignState.actors`，依 `id` 序迭代。

## 簡化 AI（每天一次，tick 第 2c／3 段）

每種 kind 一張小表 `actors/<kind>.json`，程式只做「選目標→尋路→走→接觸」：

**force** 的目標由作戰給：`march` 往目標區域、`engage` 停在那、`aftermath` 回最近己方城；途中遇敵對行動者強的就打、弱的繞。**patrol** 在 `territory` 內的 2–4 個地點間繞圈，看見敵對（含 `rep ≤ −30` 的玩家、蝕匪）且 `str` 占優就追 3 天，否則只回報（事件 `Sighted`）。**caravan** 從 A 城沿道走到 B 城、停 2 天再回，見敵對就 `flee` 往最近城，被打掉＝兩城市場缺貨、價格上漲；護送契約就是跟著它走。**swarm** 依族四種節拍：蟲族大潮日出巢 `raid` 往最近城／商隊、第 7 天 `return` 回蝕域（繫）；獸族 `hunt` 隨機遊走偏向有人的格、不回頭、殺光崖牙後散成小群；異形 `idle` 隨機漫步、每潮月換圖位；菌絲不產行動者（它只長地）。群離開蝕域每天 `str −5%`（蟲族）或不減（獸族）。**band** 挑最近、評等夠的契約去做（抽象：到站等 1–3 天後 `ContractContested`），遇玩家依 `stance`——`wary` 繞開、`hostile` 且 `str` 占優就攔。

全部純函式 `(actor, world, rng) → actor'`，一天最多一次重算路徑；沒有迷霧（AI 讀真值）。

## 接觸與遭遇

**接觸範圍**：船與會飛的群 2 格、地面 1 格（切比雪夫距離）。每個行動者走完一格、以及船走完一格時檢查：有敵對或 `wary` 行動者進範圍 → 船停下、`pendingEncounter` 寫入、`pendingTicks` 保留；同一對一天只觸發一次；非敵對擦身只寫 `Sighted` 事件不停船。遭遇是 `prompt` 四選（不合法的灰掉並寫原因）：

1. **迴避** `drift`：速度檢定——船 `mp` ≥ 對方 ×1.2 自動成功（花 1 天、燃料 ×2）；否則擲 `d100 < 50 + (船mp − 對方mp)`，失敗轉戰鬥且對方先手（情境 `ambush`）。深蝕格內迴避 −20。
2. **追擊／攔截**（對方想逃時）：同上反過來；成功就開打、失敗對方跑掉 2 格。
3. **交涉**：只對人類行動者；選項由對方勢力 `dialogues/encounter-<kind>.json` 給：讓路、付買路財（商隊）、談臨時契約（護送到站、聯合清群）、威嚇（`str` 比較）。結果走 `OpsEffect`（rep、cash、`spawnContract`）。
4. **開打**：寫 `pendingBattle`（`Sortie.trigger:"intercept"`、`loc`、`actors[]`），接觸範圍內的其他行動者按陣營入 slot：友軍 `ally`、第三方敵對 `third`（三方戰）。

敵對判定用 operations-war 的 `RelState` 與 `FactionState.rep`；裂獸永遠敵對。被攔的商隊、被追的巡邏也會對玩家發起相同四選（AI 用同一張表的 `aiChoice` 權重）。

## 從格生成戰場 ScenarioGen

`generateScenario` 的第 (1) 步改為讀格：**地形池**＝該格與八鄰格 `base` 地形的 `battle_pool` 加權聯集（鄰格權重 ½）；**蝕深**＝該格 `blight.depth`（無蝕＝地球版）；**族**＝蝕塊所屬裂縫或 swarm 的 `family`；**地點**在 footprint 內則疊加地點模板（城牆、港岸、遺跡入口，`encounters/place-<kind>.json`）；`road` 格加一條道；月面圖一律用月面池。敵方單位：swarm 由 `grades` 與 `str` 換算預算；force 由 `ForceUnit[]` 直接展開；band 由 `roster` 預算。地圖尺寸仍由 encounter 模板給。情境 `globals.tide` 由當天潮相填。這一步取代 `node.terrainPool`——節點沒了，地形從格來。

## 行動牌新增

`spawnActor { kind; at: "territory" | "rift" | "place"; def }`、`setGoal { actor; goal }`、`reveal { cell | region; radius; days }`；事件 `ActorSpawned/Despawned`、`Sighted`、`EncounterOffered`、`Evaded`、`Intercepted`、`CaravanLost`、`ContractContested`。

## 替使用者做掉的決定

1. **五種 kind 一張表各一**：AI 是查表不是行為樹，六十到一百二十個行動者一天跑完 < 20 ms。
2. **AI 沒有迷霧**：它們只做簡單事，給它們全知比做一套感知便宜，玩家也看不出差別。
3. **接觸＝切比雪夫 1／2 格、一對一天一次**：避免每天被同一支巡邏攔三次。
4. **迴避是速度檢定不是擲骰為主**：浮船比地面快是設定，玩家該能靠它逃；在蝕淵上逃不掉是代價。
5. **三方戰直接入 `third` slot**：core 已有 allies／hostileSlots，不另造規則。
