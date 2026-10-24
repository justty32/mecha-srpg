# data-model-operations-war — 勢力自主作戰：資料模型、階段、抽象結算、tick 順序、後果

[ops README](README.md)｜裁示原文 [design-notes/world](../../design-notes/world.md)（2026-10-24 獵團＝自營傭兵、勢力自主作戰）｜外交 [data-model-diplomacy](data-model-diplomacy.md)｜參戰 [mercenary-contracts](mercenary-contracts.md)｜研發 [data-model-faction-rnd](data-model-faction-rnd.md)

裁示：各勢力自己組織部隊清剿／攻堅，是地圖上持續進行的戰役，不等玩家；傭兵可參戰。本檔定「作戰」實體：發起、推進、結束；不打戰鬥也能結算；玩家參戰的那一場才進戰術戰鬥。數值只給量級；測試在 [war-testing](war-testing.md)。

## 部隊 ForceState（勢力的常備軍）

```ts
type Loc = { map: Id /*六張圖之一*/; region: Id /*區域層的格群 id（world-grid map-and-terrain）*/; cell?: Cell /*真位置*/ };
type ForceUnit = { model: Id /*ModelDef→FrameDef*/; count: number; readiness: number /*0..1*/ };
type ForceState = { units: ForceUnit[]; supply: number /*0..100*/; morale: number /*−2..+2*/;
  pos: Id /*ActorState id：分遣隊在圖上的影子，march 建立、aftermath 刪除*/; speed: number /*＝ActorState.mp*/ };
// FactionState 加：forces: ForceState; shells: Id[] /*持有的古代機 ShellState*/; ops: Id[] /*進行中作戰*/; prestige: number
```

戰力點 `str(force) = Σ count × gp(grade) × readiness`，`gp`：D 1、C 3、B 9、A 27（每級 ×3）。開局由 `FactionOpsDef.roster` 展開；每蝕月第 1 天依 `scale` 補員（`forces/replenish.json`：state +15 gp、city +6、company +10、guild +2 量級），機型從該勢力已釋出的 `ModelDef` 池抽（舊型多、新型少）。`readiness` 戰損後掉、每蝕月回 0.25。`supply` 每場 engage −10、回地盤每日 +5。裂獸不是勢力軍：敵方戰力由 `RiftState`（寬度、深度、錨齡）算 `riftStr`，與現有 `EnemySnapshot` 同源。

## 作戰 OperationDef（模板，`operations/<kind>.json`）與 OperationState

```ts
type OperationDef = { id: Id; kind: OperationKind; actorScales: string[]; valid: Cond; weight: NumExpr;
  targetSel: "blight-edge" | "rift-core" | "lane" | "enemy-place" | "ruin-shell" | "port";   // 原 shallow-node／route／enemy-node
  commit: NumExpr /*投入 forces 比例 0.2..0.8*/; phases: { phase: Phase; days: NumExpr; objective?: ObjectiveTemplate }[];
  merc?: { minRep: number; share: NumExpr; supply: SupplyTier; slots: number; sides: "actor" | "both" }; covert?: boolean;
  onSuccess: OpsEffect[]; onFail: OpsEffect[]; onAbort: OpsEffect[]; requiresRelation?: RelState /*對目標勢力的最低敵意*/ };
type Phase = "muster" | "march" | "engage" | "resolve" | "aftermath";
type OperationState = { id: Id; def: Id; actor: Id; coActors: Id[]; target: { loc: Loc; rift?: Id; faction?: Id; shell?: Id; lane?: Loc[] };
  phase: Phase | "done" | "failed" | "aborted"; startDay: number; phaseEnd: number;
  force: ForceState /*從 actor.forces 切出的分遣隊*/; enemyStr: number; progress: number /*0..1*/;
  engagesLeft: number; mercSlots: { contract: Id; side: "actor" | "target" }[]; exposed: boolean; log: { day: number; kind: string; v: number }[] };
```

十種作戰已抽到 [operations-kinds.json](operations-kinds.json)（10 列）。欄位：`kind`／`name`／`actor` 可發起的規模／`target`／`enemy`／`engage_objective`／`success`／`fail`／`merc` 傭兵條款量級／`diplomacy` 外交後果／`note`。

**發起**：作戰是一張世界行動牌（效果 `startOperation`），每天與其他牌一起抽；`valid` 通常要戰力 ≥ `enemyStr × 0.8`、`supply ≥ 40`、同時進行數 < 上限（state 2、其他 1）、對人作戰要 `requiresRelation`（奪點／圍城需 `war`，襲擾 ≥ `tense`）。約 40 勢力下任一天約 5–10 場作戰在進行。

**階段與時程量級**：`muster` 3–5 天（傭兵契約在此期間掛契約板）→ `march`＝分遣隊從地盤出發、以移動點沿格走到目標區域（途中是可被遭遇、追擊、迴避的 `ActorState{kind:"force"}`；跨洲作戰要先走航道，v1 只有持港勢力會發）→ `engage` 1–10 天、每天一次交手 → `resolve` 1 天 → `aftermath` 2 天（後果生效、分贓、傭兵結算）。總長半個蝕月上下；圍堵固定在大潮日 engage。

**推進與結算**（抽象結算、玩家參戰的那一場、tick 第 2 段 2a–2f 順序、OpsEffect／事件後果詞彙）→ [data-model-operations-war/resolution](data-model-operations-war/resolution.md)

## 古代機的爭奪 ShellState

```ts
type ShellState = { id: Id; frame: Id /*ancient FrameDef*/; holder: Id /*faction*/ | "player" | { ruin: Id }; awakened: boolean; knownBy: Id[] };
```

古代機是世界物件：遺跡探勘 `ancientFound` 寫 `holder:{ruin}`；尋墟作戰搬成 `holder: faction`，2 蝕月後 `LineageOpened`（研發檔）；失古代機者對應血統 `stalled`。玩家取得寫 `holder:"player"`，`knownBy` 決定誰會來談、來買、來搶——古代機是外交籌碼與作戰目標。

## 替使用者做掉的決定

1. **作戰是行動牌的一種效果、不是新調度器**：沿用抽牌，只多一個狀態機。
2. **戰力用每級 ×3 的點數、交手用 √ 比例**：弱方拖得久、強方贏得慢，玩家一場改 0.4 進度，不能一人定乾坤。
3. **補給歸零＝退兵而非潰敗**：「圍久了自己走」成立，也給解圍時間窗。
4. **古代機是世界物件 ShellState**：古代機的爭奪才有「誰拿著」可查，血統與外交都掛它。
5. **玩家缺席的日子照抽象推進**：沙盒不等人，參戰是搭上正在開的船。
