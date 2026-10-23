# rules 層凍結契約（lead-impl-rules 寫死；三條工人線交接書的一部分）

[lead-impl-rules 交接書](../lead-impl-rules.md)

本檔是 `cx-rules-core`、`cx-rules-combat`、`cx-rules-people-flow` 三份交接書**共同引用的契約**：模組分工、匯出名稱與簽名、事件與信號的 payload 欄位、跨線呼叫方式。**名稱與簽名照抄，不得改名、不得增減參數**；檔內 helper 不匯出即可自由寫。契約有讓你寫不下去的洞 → 程式碼註解 `SPEC-GAP`＋選最小解＋寫進 REPORT，不要改別人的檔。

## 0. 全域規則

- node 24 原生跑 `.ts`：只用可擦除語法（不用 `enum`、`namespace`、建構子參數屬性）；相對 import 帶 `.ts`；型別匯入用 `import type`。不裝任何套件。
- 所有函式第一個參數是 `ctx: Ctx`（`{ db: ContentDB; s: BattleState }`），直接**就地改** `ctx.s`。
- 決定性：所有隨機只經 `ctx.s.rng`（`src/core/rng.ts`）；迭代 `Record` 一律先排序鍵；同分 tie-break 用 id 字典序。禁 `Math.random`、`Date`。
- 數值常數一律讀 `ctx.db.rules.constants`（用 `constant(ctx, key)`），程式碼不寫平衡數字。已登記的常數鍵：`hitChanceMin hitChanceMax critFactor permanentThreshold permanentChance conventionalFactor fatigueInitiativeK moveHeightCost rangeAccuracyPenalty heightAccuracyBonus ejectApCost xpPerKill xpKillShare conductDamageFactor controlAutonomyK berserkCheckK moraleRecoverStreak derelictRecoverRange defaultEffectOrder`。
- 執行期簿記在 `BattleState.rt`（型別 `RulesRuntime`，已由領導加進 `src/core/types-state.ts`，**不可再改**）。
- 距離＝Chebyshev（8 方向）；相鄰＝Chebyshev 距離 1。LOS＝兩格中心 Bresenham 線上、不含兩端的格子，任一格地形 `blocksLos` 即擋；單位不擋線（SPEC-GAP：遮擋換目標不做）。
- 事件只經 `emit()` 寫；payload 只放字串、有限數字、布林、null、扁平陣列。座標寫 `[x,y]` 陣列。
- 跨線呼叫**只經 core 的三個登記表**（`hooks.ts`：動詞、信號、指令），combat 與 people-flow 兩線之間**不得互相 import**；兩線都只 import core 線的檔與 `src/core/`、`src/content/`。

## 1. 模組分工

| 線 | 檔（`src/rules/`） |
|---|---|
| cx-rules-core | `state.ts` `contribs.ts` `pools.ts` `effects.ts` `hooks.ts` |
| cx-rules-combat | `turn.ts` `movement.ts` `command.ts` `attack.ts` `layers.ts` `conduct.ts` |
| cx-rules-people-flow | `morale.ts` `injury.ts` `will.ts` `control.ts` `flow.ts` `objectives.ts` |
| 領導 | `index.ts`（彙總匯出＋side-effect import 全部模組，讓登記生效）、`test/golden.test.ts` |

測試檔：與被測檔同目錄 `src/rules/<檔>.test.ts`，用 `node:test`＋`node:assert/strict`；測試用 `loadContentDirs(["content/base"]).db` 取真內容，或自組最小 `Ctx`。

## 2. core 線匯出（`state.ts`）

```ts
import type { ContentDB } from "../content/contentdb.ts";
export type Ctx = { db: ContentDB; s: BattleState };
export type RejectCode = "battle-over" | "not-active" | "bad-actor" | "no-commander" | "unknown-ability" | "require-failed"
  | "out-of-range" | "no-los" | "bad-target" | "bad-part" | "cannot-pay" | "cooldown" | "uses-exhausted" | "bad-path"
  | "no-locomotion" | "wait-used" | "not-at-exit" | "no-retreat" | "no-space" | "unsupported";
export type Rejection = { code: RejectCode; detail?: string };
export type Result = { ok: true; events: GameEvent[] } | { ok: false; rejection: Rejection };
export type Subject = { unit?: Id; person?: Id };                 // NumExpr 的 self／target 主體
export type UnitInit = { id: Id; owner: FactionSlot; pos: Cell; facing?: Dir;
  frame?: Id; monster?: { species: Id; grade: Grade };            // 二擇一
  components?: Record<SlotId, Id>; persons?: { id: Id; def: Id; seat: SeatId }[];
  pools?: Record<PoolId, number> };                               // 覆寫機甲與人物池初值（鍵同名者兩邊都套）
export function newRuntime(): RulesRuntime;                       // 全欄位空值；maxRounds null
export function rt(s: BattleState): RulesRuntime;                 // 無 rt 丟 Error
export function emit(ctx: Ctx, type: EventType, payload?: EventPayload): GameEvent;  // round=s.round，turn=rt.active（null 則不放）
export function constant(ctx: Ctx, key: string): number;          // 缺鍵丟 Error
export function unit(ctx: Ctx, id: Id): MechState;                // 缺丟 Error
export function person(ctx: Ctx, id: Id): PersonState;
export function unitTags(ctx: Ctx, unitId: Id): string[];         // frame（或 species）tags ∪ 機甲效果 tags，排序去重
export function personTags(ctx: Ctx, personId: Id): string[];
export function frameView(ctx: Ctx, unitId: Id): FrameDef;        // 怪獸單位由 species＋grade 合成 FrameDef（cls "bio"、baseAttrs=baseAttrsByGrade[grade]、innateAbilities=abilities、grade=該 grade）
export function partDefs(ctx: Ctx, unitId: Id): PartDef[];        // body plan 的部位，依 bodyplan 宣告順序
export function layerDefs(ctx: Ctx, unitId: Id, partId: PartId): LayerDef[];  // 實際層序列，見下
export function seatsOf(ctx: Ctx, unitId: Id): { seat: SeatId; role: SeatRole; person: Id }[]; // 有人的座位，依 seat id 排序；role＝該 SeatDecl.accepts[0]
export function isActive(ctx: Ctx, unitId: Id): boolean;         // rt.unitStatus === "active"
export function unitAt(ctx: Ctx, cell: Cell): Id | null;         // 該格的單位（含 derelict；不含 dead／retreated／captured）
export function terrainAt(ctx: Ctx, cell: Cell): TerrainDef;
export function inBounds(s: BattleState, cell: Cell): boolean;
export function distance(a: Cell, b: Cell): number;               // Chebyshev
export function hostile(ctx: Ctx, a: Id, b: Id): boolean;         // 兩單位 owner 不同即敵對；owner "berserk" 對誰都敵對
export function commanderOf(ctx: Ctx, unitId: Id): Id | null;     // rt.commander[unit]，未設時＝第一個 role pilot 的座位人物，否則 role soul，否則 null
export function evalCtxFor(ctx: Ctx, self: Subject, target?: Subject): EvalCtx;  // 見下「ref 路徑」
export function makePerson(ctx: Ctx, id: Id, def: Id): PersonState;   // 建立並寫入 s.persons
export function makeUnit(ctx: Ctx, init: UnitInit): MechState;        // 建立並寫入 s.units、rt.unitStatus=active、人物入座
```

- **層序列**（`layerDefs`）：部位自身 `layers` → 依 slot id 排序走過已裝部件，把 `layersAdd`（part 相符者）依 `insertAt` 插入 → 再依 slot id 序，對有 `hp` 的已裝部件**附加**一層 `{type:"component", hp, ablative:true, resist:{}, passThrough:{}, structural:false}`（SPEC-GAP：部件層放最內、非結構）。`PartState.layers[i]` 與 `layerDefs()[i]` 一一對應。
- **ref 路徑**（`evalCtxFor`）：`self.attrs.<a>`／`target.attrs.<a>`（主體有 person 用 `personAttr`，否則 `unitAttr`）、`self.pools.<p>.cur|max|regen`（person 優先，再 unit）、`self.grade`（GRADES 索引）、`self.resonance`（`commander.will.resonance[unit.frame] ?? 0`）、`battle.round`。`hasTag(t)`＝self 的 `personTags`／`unitTags` 含 t。其他路徑丟 `NumExprError`。
- **makeUnit**：機甲＝frame pools ∪ 已裝部件 pools（同 id 合併：max、regen 相加）；`initial` 以 self 求值；各部位 `layers` 依 `layerDefs` 初始化 hp；`components` 依 slot 找所屬部位；`controlMode` 有 pilot 座位人物＝"pilot"，只有 soul＝"soul"，無人＝"none"；monster 時 `frame` 欄填 species 的完整 id 並寫 `rt.monsters`。人物池同理（`PersonDef.pools`）。不寫事件。

## 3. core 線匯出（`contribs.ts`、`pools.ts`、`effects.ts`、`hooks.ts`）

```ts
// contribs.ts —— 逐筆加減、按 id 撤回（TM-34／TM-50）
export type Owner = { unit: Id } | { person: Id };
export function statValue(base: number, contribs: readonly ContributionInstance[], key: string): number; // 純函式：path===key 者，先 set（最後一筆）→ add 相加 → mul 連乘 → min／max 夾
export function addContrib(ctx: Ctx, owner: Owner, c: Contribution): string;  // value 以 owner 為 self 當下求值存成數字；id="c"+rt.nextContrib++；path 是池的 max／regen 時呼叫 recomputePool
export function removeContrib(ctx: Ctx, owner: Owner, id: string): boolean;
export function removeContribsBySource(ctx: Ctx, owner: Owner, source: Id): string[];
export function personAttr(ctx: Ctx, personId: Id, attr: AttrId): number;    // attrsBase[attr]??0 經 key "self.attrs.<attr>"
export function unitAttr(ctx: Ctx, unitId: Id, attr: AttrId): number;        // frameView.baseAttrs[attr]??0 經機甲 contribs
export function roleAttr(ctx: Ctx, s: Subject, role: AttrRole): number;      // attrByRole 找屬性；有 person 用 personAttr＋unitAttr，否則只 unitAttr（SPEC-GAP：無人單位用機體值）

// pools.ts —— 池鍵 key "self.pools.<id>.max" / ".regen"
export function poolDecls(ctx: Ctx, owner: Owner): PoolDecl[];               // 機甲：frameView pools ∪ 未毀部件 pools（合併）；人物：def.pools
export function recomputePool(ctx: Ctx, owner: Owner, pool: PoolId): void;   // max／regen 由 decl 求值＋contribs；hard 池 cur 夾回
export function changePool(ctx: Ctx, owner: Owner, pool: PoolId, delta: number, reason: string): number; // 回傳實際變化；hard 夾 [min,max]、soft 只夾 min；寫 PoolChanged；updateBand；由 >min 落到 <=min 時掛 onDepleted 並 signal("poolDepleted")
export function updateBand(ctx: Ctx, owner: Owner, pool: PoolId): void;      // band＝第一個 from<=cur<to（to null＝∞）的索引，無則 -1；變了就 removeBySource("band:<ownerId>:<pool>") 再掛新帶 effects（source 同字串）
export type Cost = { owner: "mech" | "person"; pool: PoolId; amount: number; allowOverload?: boolean };
export function canPay(ctx: Ctx, unitId: Id, personId: Id | null, costs: Cost[]): boolean;  // 全部一起判；沒有該池＝付不起；一般池 cur−amount>=min；inverted 池 cur+amount<=max，allowOverload 且 soft 則放行
export function pay(ctx: Ctx, unitId: Id, personId: Id | null, costs: Cost[], reason: string): void;  // 一般池扣、inverted 池加
export function regenTick(ctx: Ctx, owner: Owner): void;                     // 依池 id 序做 rules-resources-effects §時機 ①–⑤

// effects.ts
export type EffectTarget = { unit?: Id; person?: Id; part?: PartId; layer?: number; cell?: Cell; faction?: FactionSlot };
export function applyEffect(ctx: Ctx, ref: EffectRef, target: EffectTarget, source: Id): EffectInstance | null;
export function removeEffect(ctx: Ctx, uid: number, reason: string): boolean;
export function removeBySource(ctx: Ctx, source: Id): number;
export function removeByTags(ctx: Ctx, target: EffectTarget, tags: string[]): number;
export function tickEffects(ctx: Ctx, kind: "ownerTurns" | "rounds", target: EffectTarget | "field"): void; // 遞減 remaining、歸零撤除（reason "expired"）
export function consumeUse(ctx: Ctx, uid: number): void;                    // uses 時鐘 −1，歸零撤
export function effectsOf(ctx: Ctx, target: EffectTarget): EffectInstance[]; // 容器內、owner 相符者，依 uid 序
export function hasEffectTag(ctx: Ctx, target: EffectTarget, tag: string): boolean;
export function flushPending(ctx: Ctx): void;                                 // 把 s.pending 依序安裝

// hooks.ts —— 三個登記表（模組層級、同步；key 相同重登記＝覆蓋）
export type HookCtx = { inst: EffectInstance | null; self: EffectTarget; source: Id };
export type VerbHandler = (ctx: Ctx, action: HookAction, hc: HookCtx) => void;
export function registerVerb(verb: HookAction["do"], h: VerbHandler): void;
export function runActions(ctx: Ctx, actions: readonly HookAction[], hc: HookCtx): void; // 未登記動詞：emit("HookSkipped",{verb}) 不丟錯
export function dispatchHook(ctx: Ctx, hook: HookName, target: EffectTarget): void;      // 依（order??defaultEffectOrder、effect id、uid）排序；鉤子執行中新增的效果進 pending、本次不補跑，結束後 flushPending；onHit／onBeingHit 消費 uses
export type SignalName = "roundStart" | "roundEnd" | "turnStartPre" | "turnStartPost" | "turnEnd" | "layerBroken"
  | "partBroken" | "conducted" | "unitDied" | "unitRemoved" | "abilityResolved" | "poolDepleted" | "personDied";
export type SignalHandler = (ctx: Ctx, p: EventPayload) => void;
export function onSignal(name: SignalName, key: string, order: number, h: SignalHandler): void;
export function signal(ctx: Ctx, name: SignalName, p: EventPayload): void;  // 依（order、key）序呼叫
export type CommandHandler = (ctx: Ctx, cmd: Command) => Rejection | null;  // 回 Rejection 時不得改任何狀態
export function registerCommand(kind: Command["kind"], h: CommandHandler): void;
export function commandHandler(kind: Command["kind"]): CommandHandler | undefined;
```

- **applyEffect 語意**：解析 ref（字串或 `{effect, params, chance}`）；有 `chance` 先擲 `chance()`；目標 tags（personTags／unitTags）含 `immuneTags` 任一 → null；有 `save` → `d100 < attr − dc` 成功＝抵抗 → null。容器：scope person→`persons[person].effects`；part／layer／mech→`units[unit].effects`；cell／faction／battle→`rt.fieldEffects`。疊加鍵＝（effect id、容器、`perPartSeparate` 時再加 part）；同鍵已在 `s.pending` → null；`refresh` 重設 remaining、`stack` 未達 max 新增、`merge` 依 mergeOp 併入、`ignore` 不動、`separate` 一律新增。`remaining`：ownerTurns／rounds／uses／days＝`clock.n` 求值（缺＝1），permanent／whileSource＝null。安裝時：uid=rt.nextUid++、每筆 contribs 用 `addContrib`（source 改為 `fx:<uid>`）、跑 `onApply`、寫 `EffectApplied`。撤除：退 contribIds、跑 `onExpire`、寫 `EffectExpired`。cell／faction／battle scope 的時鐘一律當 rounds。
- core 線自己實作的動詞：`pool`、`apply`、`remove`、`emit`（hc.self 指向擁有者；`apply.to:"seats"`＝該單位座位人物）。`damage` 由 combat 的 `layers.ts` 登記；`setControl` 由 `control.ts`、`moraleCheck` 由 `morale.ts`、`spawn` 由 `flow.ts` 登記。

## 4. 事件 payload（寫死欄位名）

| 事件 | payload | 誰寫 |
|---|---|---|
| BattleStart／BattleEnd | `{units:[id…]}`／`{winner: slot\|null, reason}` | turn／objectives |
| RoundStart／RoundEnd | `{round}` | turn |
| TurnStart／TurnEnd | `{unit, resumed}`／`{unit}` | turn |
| Waited | `{unit}` | turn |
| PoolChanged | `{owner, pool, from, to, reason}` | pools |
| EffectApplied／EffectExpired | `{uid, effect, owner, part, source}`／`{uid, effect, owner, reason}`（owner＝unit 或 person id；field 效果寫 `"field"`；part 無則 null） | effects |
| HookSkipped | `{verb}` | hooks |
| Moved | `{unit, from:[x,y], to:[x,y], cost}` | movement |
| AbilityUsed | `{unit, ability, target, part}`（無則 null） | command |
| Hit／Miss | `{unit, target, ability, chance, roll, part}`（Miss 的 part＝null） | attack |
| LayerDamaged | `{unit, part, layer, layerType, damageType, amount, hp}`（amount＝本層吸收或被減掉的量） | layers |
| LayerBroken／PartBroken | `{unit, part, layer, layerType}`／`{unit, part}` | layers |
| Conducted | `{unit, part, person, when, layerType}` | conduct |
| UnitDied | `{unit, killer}` | attack |
| PersonDied | `{person, unit}` | injury |
| MoraleChanged | `{person, from, to}` | morale |
| ControlChanged | `{unit, from, to, commander}` | control |
| Ejected／Retreated／Captured | `{unit, infantry, persons:[id…]}`／`{unit}`／`{unit, by, frame}` | flow |

信號 payload：`roundStart/roundEnd {round}`、`turnStartPre {unit}`、`turnStartPost {unit, resumed}`、`turnEnd {unit}`、`layerBroken {unit, part, layer, layerType}`、`partBroken {unit, part, attacker}`、`conducted {unit, part, person, when, layerType, damageType, amount}`、`unitDied {unit, killer}`、`unitRemoved {unit, status}`、`abilityResolved {actor, ability, target, hit}`、`poolDepleted {owner, kind:"unit"|"person", pool}`、`personDied {person, unit}`。

## 5. combat 線匯出

```ts
// turn.ts
export function initiativeOf(ctx: Ctx, unitId: Id): number;   // roleAttr(commander, initiative)＋…（見 rules-turn-and-actions §排序；fatigue 池缺＝0）
export function computeOrder(ctx: Ctx): Id[];                  // active 單位，initiative 降冪、同分 id 升冪
export function startBattle(ctx: Ctx): void;                   // emit BattleStart → startRound
export function startRound(ctx: Ctx): void;                    // round+1、RoundStart、rounds 時鐘（全部單位／人物／field）、signal roundStart、排序、beginTurn(第一個)
export function beginTurn(ctx: Ctx, unitId: Id, resumed: boolean): void;
export function endTurn(ctx: Ctx): void;                       // onTurnEnd 鉤子、sustain drain、signal turnEnd、TurnEnd、acted、advance
export function advance(ctx: Ctx): void;                       // 下一個未行動 active 單位；沒有＝RoundEnd＋signal roundEnd，outcome 未定則 startRound；rt.outcome 非 null 時一律停（active=null）
export function currentActor(s: BattleState): Id | null;
// command.ts
export function tryCommand(ctx: Ctx, cmd: Command): Result;   // 行動入口 ①–⑦；events＝本次呼叫新增的事件
export function previewCommand(ctx: Ctx, cmd: Command): { result: Result; state: BattleState };  // structuredClone 後跑，ctx.s 不變
export function abilitiesOf(ctx: Ctx, unitId: Id): Id[];      // innateAbilities ∪ 部件層未毀的已裝部件 abilities，排序去重
export function checkAbility(ctx: Ctx, unitId: Id, abilityId: Id, target?: { unit?: Id; cell?: Cell; part?: PartId }): Rejection | null; // ①②③，無副作用
export function resolveCosts(ctx: Ctx, unitId: Id, abilityId: Id): Cost[];
// movement.ts
export function locomotionOf(ctx: Ctx, unitId: Id): LocomotionClass | null;  // 無未毀 locomotion 部位＝null；類別＝frame tags 中第一個登記在 locomotion 的值，否則 "leg"（SPEC-GAP）
export function stepCost(ctx: Ctx, unitId: Id, from: Cell, to: Cell): number | null;  // moveCost[loco]＋max(0,高差)×moveHeightCost；null＝不可走
export function moveAlong(ctx: Ctx, unitId: Id, path: Cell[]): void;          // 逐格付 AP、Moved、onEnter、機會攻擊；付不起或被擋即停
export function reachable(ctx: Ctx, unitId: Id): Record<CellKey, number>;     // AI 用：AP 內可達格→成本（Dijkstra，無副作用）
// attack.ts
export function hitChance(ctx: Ctx, actor: Id, abilityId: Id, target: Id, part?: PartId): number;
export function pickPart(ctx: Ctx, target: Id, aimed?: PartId): PartId;
export function modifiedAmount(ctx: Ctx, actor: Id | null, abilityId: Id | null, packet: DamagePacket, target: Id): number; // 修正鏈：求值→全局修正表→暴擊
export function resolveAbility(ctx: Ctx, actor: Id, abilityId: Id, target: { unit?: Id; cell?: Cell; part?: PartId }): void; // ②–⑨
// layers.ts
export type LayerSlot = { def: LayerDef; hp: number; broken: boolean };
export type PacketIn = { type: DamageType; amount: number; armorPen?: number; resistPen?: number; layerFilter?: LayerType[] };
export type LayerStep = { index: number; amount: number; broke: boolean };
export function runLayers(layers: readonly LayerSlot[], p: PacketIn): { layers: LayerSlot[]; steps: LayerStep[]; remaining: number }; // 純函式，不改輸入
export function applyPacket(ctx: Ctx, unitId: Id, partId: PartId, p: PacketIn, attacker: Id | null): LayerStep[];  // 改狀態＋事件＋層／部位鉤子＋傳導；回傳後由 attack 判死亡
export function isDead(ctx: Ctx, unitId: Id): boolean;       // 所有 core 功能部位 broken
// conduct.ts
export function conductRules(ctx: Ctx, unitId: Id, partId: PartId): ConductRule[];  // 部位 conduct ∪ 該機甲效果 def.conduct
export function conduct(ctx: Ctx, unitId: Id, partId: PartId, when: ConductRule["when"], layerType: LayerType | null, info: { damageType: DamageType; amount: number; conductBonus: number }): void;
```

- **runLayers** 照 rules-attack-resolution §④ 偽碼，`armorPen` 寫死為：`pass = rem×pt; hit = rem−pass; ap = clamp(armorPen,0,1); pass += hit×ap; hit −= hit×ap`，再乘 `(1 − max(0, resist − resistPen))`。
- **命中**：`clamp(roleAttr(攻方指令權者, accuracy) + accuracy 求值 − rangeAccuracyPenalty×max(0,距離−1) + heightAccuracyBonus×sign(攻方格高−守方格高) − roleAttr(守方, evasion) − 守方格 cover − 指定部位 penalty, hitChanceMin, hitChanceMax)`；`d100 < chance` 命中。
- **指令權者與 AP**：`commanderOf()`；AP＝指令權者的 `ap` 池；指令權者 null 時用機甲自己的 `ap` 池，都沒有＝移動付不起。能力 `actorRole` 有給時改由該角色座位人物出手與付 person 成本。
- **TurnStart 順序**（rules-resources-effects 與 rules-turn-and-actions 衝突處以前者為準：效果撤除在資源更新之前）：`TurnStart` 事件 → 非 resumed 時：signal turnStartPre → onTurnStart 鉤子（機甲與座位人物）→ 所在格地形 `onTurnStart` 效果 → ownerTurns 時鐘 → `regenTick`（機甲、座位人物）→ 冷卻 −1 → 護盾層 regen → signal turnStartPost。之後若單位不 active 或 `controlMode` 為 none／disabled → 自動 endTurn。
- **Wait**：`rt.waitUsed` 已含＝拒絕 `wait-used`；否則寫 `Waited`、單位移到 `order` 尾、本輪再輪到時 `beginTurn(…, true)`。
- 每次指令後若 active 單位已不 active（死亡、棄機、撤離、被捕）→ 自動 endTurn。`eject`／`retreat` 交給 `commandHandler(kind)`，沒登記＝拒絕 `unsupported`。

## 6. people-flow 線匯出

```ts
// morale.ts
export const MORALE_STAGES: readonly MoraleStage[];           // ["steady","shaken","breaking","fleeing"]
export function moraleCheck(ctx: Ctx, personId: Id, dc: number, reason: string): boolean;  // d100 < roleAttr(resolve)−dc 成功；失敗降一階；成功且非 steady 累計 streak，達 moraleRecoverStreak 升一階
export function moraleEvent(ctx: Ctx, event: string, personIds: Id[]): void;               // 查 db.rules.moraleEvents
export function setMorale(ctx: Ctx, personId: Id, stage: MoraleStage): void;               // 換階段效果（effect/morale-<stage>，steady 無）＋MoraleChanged
// injury.ts
export function injuryCandidates(ctx: Ctx, damageType: DamageType, layerType: LayerType | null, permanent: boolean): InjuryRow[];
export function resolveConductInjury(ctx: Ctx, personId: Id, info: { damageType: DamageType; layerType: LayerType | null; amount: number }): void;
export function killPerson(ctx: Ctx, personId: Id, unitId: Id | null): void;
// will.ts
export function resonanceScore(ctx: Ctx, personId: Id, req: ResonanceReq): number;
export function refreshResonance(ctx: Ctx, unitId: Id): void;          // 寫 commander.will.resonance[unit.frame]
export function burdenOf(ctx: Ctx, unitId: Id): number;                // frame.burden＋未毀部件 burden
export function burdenTick(ctx: Ctx, unitId: Id): void;               // turnStartPost：加承擔、失控檢定、回穩檢定
export function goBerserk(ctx: Ctx, unitId: Id): void;
export function recoverBerserk(ctx: Ctx, unitId: Id): void;
// control.ts
export function controlCheck(ctx: Ctx, unitId: Id): Id | null;        // contested 時的對抗擲骰，回傳贏家
export function setControl(ctx: Ctx, unitId: Id, mode: ControlMode, reason: string): void;
export function autonomyNodes(ctx: Ctx, personId: Id): number;
export function handOver(ctx: Ctx, unitId: Id): void;                 // 失去駕駛員後轉 soul／disabled／none
// flow.ts
export type BattleSetup = { id: string;
  map: { width: number; height: number; fill: Id; cells?: { at: Cell; terrain: Id }[]; exits: Cell[] };
  units: UnitInit[]; objectives: Objective[]; maxRounds?: number; noRetreat?: boolean };
export type BattleResult = { winner: FactionSlot | null; reason: string; rounds: number;
  units: { id: Id; status: "alive" | "dead" | "retreated" | "derelict-recovered" | "derelict-lost" | "captured"; state: MechState }[];
  persons: { id: Id; status: "alive" | "dead"; state: PersonState; xpGained: number }[];
  loot: { fromUnit: Id; components: Id[]; materials: Record<string, number> }[]; log: { events: number; hash: string } };
export function createBattle(db: ContentDB, setup: BattleSetup, seed: number): BattleState;  // round 0、不寫事件
export function eject(ctx: Ctx, unitId: Id): Rejection | null;
export function retreat(ctx: Ctx, unitId: Id): Rejection | null;
export function canCapture(ctx: Ctx, target: Id): boolean;
export function capture(ctx: Ctx, actor: Id, target: Id): void;
export function battleResult(ctx: Ctx): BattleResult | null;          // outcome 未定＝null
// objectives.ts
export function objectiveDone(ctx: Ctx, o: Objective): boolean;
export function evaluateObjectives(ctx: Ctx, atRoundEnd: boolean): BattleOutcome | null;  // 定案時寫 rt.outcome＋BattleEnd，只寫一次
```

## 7. 情境與黃金檔（領導寫執行器 `test/golden.test.ts`）

情境檔 `test/scenarios/<id>.json`：`{ "id", "seed", "setup": BattleSetup, "commands": [Command | {"cmd": Command, "reject": RejectCode}], "expect": { "sequence": [事件型別…], "minCounts": {型別: 次數}, "outcome": {"winner": slot|null} 可省 } }`。執行器：`createBattle(db, setup, seed)` → `startBattle` → 逐條 `tryCommand`（非 reject 項必須 ok）→ `hashLog(s.log)` 與 `test/golden/<id>.hash`（一行 16 hex）比對；`expect.sequence` 必須是 `typeSequence` 的子序列；`GOLDEN_UPDATE=1` 時改為寫 hash 檔。hash 算法＝`src/core/eventlog.ts` 的 `hashLog`（fnv1a64(canonicalJson(events))），不得另造。
