# ai 層凍結契約（lead-impl-ai 寫死；兩條工人線交接書的一部分）

[lead-impl-ai 交接書](../lead-impl-ai.md)

本檔是 `cx-ai-knowledge-score`、`cx-ai-policies` 兩份交接書**共同引用的契約**：模組分工、匯出名稱與簽名、替身（stub）行為。**名稱與簽名照抄，不得改名、不得增減參數**；檔內 helper 不匯出即可自由寫。契約有讓你寫不下去的洞 → 程式碼註解 `SPEC-GAP`＋選最小解＋寫進 REPORT，不要改別人的檔。已凍結、**不可修改**的兩檔：`src/ai/rules-query.ts`（`RulesQuery`、`ExecCommand`、`QueryResult`）與 `src/ai/policy.ts`（`AiCtx`、`Agent`、`Candidate`、`Policy`、`Assignment`、`DangerMap`、`registerPolicy`、`getPolicy`、`selectCandidate`、`candidateKey`）——先讀這兩檔。

## 0. 全域規則

- node 24 原生跑 `.ts`：只用可擦除語法（不用 `enum`、`namespace`、建構子參數屬性）；相對 import 帶 `.ts`；型別匯入用 `import type`。不裝任何套件。
- **依賴**：`src/ai/` 只准 import `src/core/` 與 `src/ai/` 內的檔；**不准** import `src/rules/`、`src/content/`。規則與內容一律經 `RulesQuery`（`ctx.q`）。
- **不作弊**：估值、危險圖、preview 一律在 `view`（`maskedState` 的知識狀態）上跑；只有「自己單位」的資訊可讀真實狀態 `s`。
- **不改狀態**：AI 不改 `s`；唯一的狀態變化是呼叫 `ExecCommand`。
- **決定性**：隨機只用 `ctx.rng`（AI 專用串流，`createRng(seed, 101)`），**不碰 `s.rng`**（SPEC-GAP：spec 寫 ctx.rng；若 AI 抽 s.rng，按指令重播時規則的亂數序列會對不上）；`Record` 迭代先排序鍵；同分 tie-break 用 id 字典序或 `candidateKey`。禁 `Math.random`、`Date`。
- 距離＝`q.distance`（Chebyshev）；格鍵＝`cellKey(x,y)`（`src/core/ids.ts`，`"x,y"`）。
- 數值係數一律讀 `ctx.params`（aiprofile params）並給預設值，預設值寫成檔頂 `const DEFAULTS`，不散寫在式子裡。

## 1. 模組分工

| 線 | 檔 |
|---|---|
| cx-ai-knowledge-score | `src/ai/knowledge.ts` `src/ai/danger.ts` `src/ai/score.ts`；`test/ai/stub-rules.ts`、`test/ai/fixtures/abilities.json`；測試 `test/ai/{stub-rules,knowledge,danger,score}.test.ts` |
| cx-ai-policies | `src/ai/strategy.ts` `src/ai/agent.ts` `src/ai/index.ts` `src/ai/policies/{tactical,berserk,swarm,sentinel,flee,scripted}.ts`；測試 `test/ai/{policies,agent,strategy,smoke}.test.ts` |
| 領導 | `src/ai/rules-query.ts`、`src/ai/policy.ts`、`src/ai/adapters/rules-adapter.ts`、`test/ai/integration.test.ts` |

測試一律放 `test/ai/`（都靠 stub），`node:test`＋`node:assert/strict`。

## 2. knowledge.ts（ai.md §知識模型；DC-C09、DC-T08、AI-05）

```ts
export function emptyKnowledge(): FactionKnowledge;               // {visible:[], lastSeen:{}, revealed:{}}
export function ownUnits(q: RulesQuery, s: BattleState, slot: FactionSlot): Id[];  // owner===slot 且 isActive，排序
export function updateKnowledge(q: RulesQuery, s: BattleState, slot: FactionSlot, prev: FactionKnowledge, ttl?: number): FactionKnowledge;
export function publicLayers(q: RulesQuery, s: BattleState, unitId: Id): Record<PartId, LayerKnowledge[]>;
export function reveal(q: RulesQuery, s: BattleState, k: FactionKnowledge, unitId: Id): FactionKnowledge;
export function observe(q: RulesQuery, s: BattleState, k: FactionKnowledge, slot: FactionSlot, events: readonly GameEvent[]): FactionKnowledge;
export function knownLayers(q: RulesQuery, s: BattleState, k: FactionKnowledge, unitId: Id, partId: PartId): LayerKnowledge[];
export function maskedState(q: RulesQuery, s: BattleState, slot: FactionSlot, k: FactionKnowledge): BattleState;
```

- 全部是純函式，回傳新物件，不改輸入。
- `updateKnowledge`：感測＝本方每個 active 單位以 `q.perception` 為半徑（Chebyshev）的聯集；`visible`＝owner≠slot、isActive、落在感測內的單位，排序；`lastSeen`：visible 者寫 `{cell: 位置複本, round: s.round}`，不可見者保留，`s.round − round > ttl`（預設 3）移除；`revealed` 沿用 prev，但移除不在 `s.units` 或已不 active 的鍵。
- `publicLayers`：依 `q.partDefs` 與 `q.layerDefs` 列每層 `{type, max: def.hp, hp}`；**最外層（index 0）hp＝實際值**（看得見外殼），其餘 hp＝`null`（未偵察，ai.md「對手內層只知公開欄」）。
- `reveal`：`revealed[unitId]`＝每部位每層的實際 hp。`observe`：事件中 `AbilityUsed` 的 `payload.unit` 屬本方、該能力 `tags` 含 `"scan"`、`payload.target` 是單位 id → `reveal(target)`。
- `knownLayers`：revealed 有就用，否則 `publicLayers`。
- `maskedState`：`structuredClone(s)`；刪除 owner≠slot 且不在 `visible` 的單位（`units`、`order`；有 `rt` 時一併刪 `rt.unitStatus` 該鍵）；可見敵方單位的每層 hp 改成 `knownLayers` 的估計（`null`＝當作滿 HP、`broken:false`；部位 `broken` 保持實際值）。

## 3. danger.ts（AI-18、AI-14）

```ts
export function threatOf(q: RulesQuery, s: BattleState, unitId: Id): number;   // Σ 能力的 ai.tactics.attack＋attackArea＋disable（q.evalNum，self=unitId），下限 0
export function dangerMap(q: RulesQuery, view: BattleState, slot: FactionSlot, know: FactionKnowledge): DangerMap;
export function dangerAt(d: DangerMap, cell: Cell): number;                      // 缺鍵＝0
```

- `dangerMap`：對 `view` 中 owner≠slot 的每個 active 單位 e：`reach`＝`q.reachable(view,e)` 各格到 e 位置距離的最大值（無＝0），`r`＝e 的攻擊類能力（tactics attack 或 attackArea 權重 >0）`q.abilityRange(...).max` 的最大值（無則跳過 e）；與 e 距離 ≤ reach＋r 的每個界內格 `+= threatOf(e)`；與 e 距離 1 的格（ZoC）再 `+= threatOf(e) × 0.5`。`know.lastSeen` 中不在 view 的單位：以 lastSeen.cell 為中心、半徑 2 的格 `+= 1`（SPEC-GAP：不可見者的能力未知，給常數）。只走界內格的外接矩形，不掃全圖。

## 4. score.ts（ai.md §第 1、3 步；AI-08、TM-24、TM-25、AI-11、AI-17）

```ts
export const TACTICS: readonly string[];   // ["attack","attackArea","disable","heal","buff","debuff","escape","protect","capture","scout"]
export function tacticWeights(q: RulesQuery, s: BattleState, actor: Id, abilityId: Id): Record<string, number>;  // ai.tactics 逐鍵 q.evalNum
export function hpFraction(q: RulesQuery, s: BattleState, unitId: Id): number;   // 該狀態中全部層 hp 總和 / layerDefs hp 總和，0..1
export type PreviewOutcome = { damage: Record<Id, number>; killed: Id[]; hitRuns: number; runs: number };
export function previewOutcome(q: RulesQuery, view: BattleState, cmd: Command, move?: Cell, tries?: number): PreviewOutcome;
export function targetValue(q: RulesQuery, view: BattleState, target: Id, focus?: Id): number;
export function forceRatio(q: RulesQuery, s: BattleState, view: BattleState, slot: FactionSlot): number;  // 見 want
export function want(ctx: AiCtx, unitId: Id): Record<string, number>;
export function scoreCandidate(ctx: AiCtx, agent: Agent, c: Candidate): number;
```

- `previewOutcome`：有 move 先 `q.previewCommand(view, {kind:"move", actor, path: q.pathTo(view, actor, move)})` 取其 state（path null＝回傳全 0）；再對第 i 次（i<tries，預設 3）用 `{...state, rng: createRng(1000+i, 7)}` 跑 `q.previewCommand(…, cmd)`。`damage[u]`＝`LayerDamaged` 事件 `payload.amount` 依 `payload.unit` 加總，**只在有 `Hit` 事件的那幾次平均**（＝命中條件下的期望）；`killed`＝任一次出現 `UnitDied` 的 `payload.unit`，排序；`hitRuns`＝有 Hit 的次數。
- `targetValue`＝`(1 + GRADES 索引(q.unitGrade)) × (1 + threatOf) × (1.5 − hpFraction) × (target===focus ? focusBonus : 1)`。
- `want`（SPEC-GAP：profile params 是數字，不是 NumExpr；需求公式寫在這裡、係數在 params）：`survive = (1 − hpFraction(s,自己)) × params.survive`；`attack = attackArea = params.attack`；`disable = params.disable`；`debuff = params.debuff`；`capture = params.capture`；`protect = assignment?.protect ? params.protect : 0`；`heal = params.heal`；`buff = params.buff`；`scout = know.visible 為空 ? params.scout : params.scout × 0.2`；`escape = survive`；`retreat = (兵力比 < 0.5 或 指令權者士氣 breaking／fleeing) ? params.retreat : 0`。兵力比 `forceRatio`＝Σ 本方 active（讀 s）`threatOf×hpFraction` / max(1e-6, Σ view 中敵方 active 同值)。
- `scoreCandidate`（ai.md 第 3 步公式）：
  - `useAbility`：`Σ_t tacticWeights[t] × want[t] × value_t × hit − cost − danger`。`hit`＝目標是單位時 `q.hitChance(view, actor, ability, target, part)/100`，否則 1。`value_t`：attack／disable／debuff／capture＝`targetValue(target) × min(2, damage[target] / max(1, 目標已知剩餘 hp))`，killed 含 target 再 `+ targetValue`；attackArea＝Σ 敵方（`q.hostile`）同式 − Σ 友方同式 × `params.friendlyFirePenalty`；heal／buff／protect＝友方目標 `1.5 − hpFraction(target)`；scout＝`1 + 不可見的 lastSeen 數`；escape＝`max(0, dangerAt(現位) − dangerAt(move 或現位))`。`targetPref.parts` 與指定部位的 `functions` 相交時 disable 值 ×1.5。
  - `move`（只移動）：`params.reposition × (到最近已知敵人距離的縮短量) − danger`；`wait`：`params.waitScore`；`end`：`params.endScore`；`retreat`：`want.retreat × 10`；`eject`：`hpFraction < params.ejectBelow 且 assignment?.allowRetreat ? want.survive × 5 : 0`。
  - `cost`＝`params.moveCost × 移動格數`；`danger`＝`params.dangerK × dangerAt(移動後位置)`。
- 預設係數（`DEFAULTS`）：`survive 1, heal 1, buff 0.5, attack 1, disable 0.5, debuff 0.5, capture 0, protect 1, scout 0.3, retreat 1, focusBonus 1.5, friendlyFirePenalty 1, reposition 0.3, waitScore 0.02, endScore 0.01, ejectBelow 0.15, moveCost 0.01, dangerK 0.05, band 0.8`。

## 5. stub（`test/ai/stub-rules.ts`，純記憶體替身）

```ts
export type StubPart = { id: PartId; functions: string[]; layers: { type: string; hp: number }[] };
export type StubUnit = { id: Id; owner: FactionSlot; pos: Cell; abilities: Id[]; ap?: number; perception?: number;
  grade?: Grade; parts?: StubPart[]; tags?: string[]; controlMode?: ControlMode; commander?: { id: Id; morale?: MoraleStage } };
export type StubBattle = { width: number; height: number; walls?: Cell[]; exits?: Cell[]; units: StubUnit[] };
export function loadStubAbilities(): Record<Id, AbilityDef>;        // 讀 test/ai/fixtures/abilities.json
export function makeStubBattle(spec: StubBattle, seed: number): BattleState;
export function createStubRules(abilities?: Record<Id, AbilityDef>): { q: RulesQuery; exec: ExecCommand; startRound(s: BattleState): void };
```

- 狀態：真的 `BattleState`（`createRng(seed)`、`createLog()`、`map.terrain` 全填 `"stub:plain"`、`knowledge` 每 slot 空、`rt` 自組（`unitStatus` 全 active、`exits` 取 spec、其餘空值））。預設部位：`torso`（functions `["core"]`，layers armor 40、structure 30）、`legs`（`["locomotion"]`，armor 20、structure 20）。AP 放機甲池 `ap`（hard、max＝ap 預設 4）；perception 預設 5；grade 預設 `"C"`。有 commander 時建一個 PersonState 並入座，`commanderOf` 回它。
- 規則（簡化）：每步 8 方向、1 AP；牆與其他單位擋路；`reachable` 為 AP 內 BFS；`los` Bresenham 不含兩端、牆擋線。能力成本只認 `pool:"ap"`（數字 amount）；`checkAbility` 依序檢 actor active→能力在 abilitiesOf→成本→射程（`target.range` 數字）→LOS→目標合法（friendly no/only/yes），回 rules 的 RejectCode 字串。命中＝`d100(s.rng) < hitChance`，`hitChance = clamp(75 − 5×(距離−1) + (accuracy 數字 ?? 0), 5, 95)`。傷害＝packets amount 數字總和，打指定部位或第一個未毀部位，由外層往內扣、溢出進下一層；層歸零 broken、全部層 broken＝部位 broken；全部 `core` 部位 broken＝死亡（unitStatus dead）。`ball`／`cell` 目標：對 `radius`（數字，預設 0）內所有單位各結算一次。`retreat`：在 exits 上才合法→unitStatus retreated；`eject`→拒絕 `unsupported`；`wait`、`end`→ok（end 把 AP 歸零）。
- 事件（用 `appendEvent`，payload 欄名照 rules contract §4）：`Moved`、`AbilityUsed`、`Hit`／`Miss`、`LayerDamaged`、`LayerBroken`、`PartBroken`、`UnitDied`、`Retreated`。
- `previewCommand`＝`structuredClone(s)` 後跑 exec。`evalNum`＝core `evalNum`，ref 一律回 0（數字常數照算）。`startRound`：`round+1`、全部 active 單位 AP 回滿。

## 6. strategy.ts（AI-01、AI-06、AI-15、AI-17）

```ts
export type Deploy = { unit: Id; cell: Cell };
export type StrategyCtx = { q: RulesQuery; s: BattleState; view: BattleState; slot: FactionSlot; know: FactionKnowledge; params: AiParams };
export interface Strategy { id: Id; deploy(ctx: StrategyCtx): Deploy[]; roundPlan(ctx: StrategyCtx): Assignment[]; onEvent(ev: GameEvent): void }
export function createDefaultStrategy(): Strategy;   // id "default"
```

- `roundPlan`：本方 active 單位（排序）各一筆 Assignment。兵力比用 score 的 `forceRatio`；`stance`＝比 ≥ `params.attackRatio`(0.8) → attack；≥ `params.holdRatio`(0.4) → defend；否則 hold。`focus`＝view 中敵方 `targetValue / max(1, 剩餘 hp)` 最高者（同分 id 小者）。接敵登記：每個敵人最多 `params.maxEngage`(3) 個本方單位；各單位 target＝未滿額者中最近的（focus 優先若距離差 ≤2）。defend 時 `protect`＝本方 hpFraction 最低者（自己除外）。`allowRetreat`＝比 < holdRatio。
- `deploy`：回傳本方單位現位置（SPEC-GAP：部署由 sim／情境決定）。`onEvent`：`UnitDied` 時從接敵登記移除。

## 7. agent.ts（ai.md 第 5 步；AI-16）

```ts
export type TurnEnv = { q: RulesQuery; s: BattleState; slot: FactionSlot; know: FactionKnowledge; assignment: Assignment | null; params: AiParams; rng: RngState; exec: ExecCommand };
export type TurnOptions = { maxActions?: number; maxRetries?: number };   // 預設 8、3
export function createAgent(unit: Id, policy: Id, memory?: Record<string, unknown>): Agent;
export function policyFor(q: RulesQuery, s: BattleState, unitId: Id, fallback: Id): Id;  // controlMode "berserk"→"berserk"；指令權者 morale "fleeing"→"flee"；否則 fallback
export function takeTurn(env: TurnEnv, agent: Agent, opts?: TurnOptions): Command[];
```

- `takeTurn` 迴圈（最多 maxActions 次）：取 policy（`getPolicy(policyFor(...))`）→ `view=maskedState`、`danger=dangerMap` → `propose`、逐一 `score` → band＝`policy.band ?? params.band ?? 0.8` → `selectCandidate`；null＝exec `{kind:"end"}` 結束。候選有 move：先 exec move（path＝`q.pathTo(s,…)`，null 或被拒＝剔除該候選重選）；再 exec `cmd`，被拒＝剔除重選；連續 maxRetries 次失敗＝exec end 結束。成功＝記錄已執行指令、呼叫 `policy.onExecuted?.(agent,c)`、`env.know = observe(updateKnowledge(...))`；`cmd.kind` 是 end／wait／retreat／eject 或單位已不 active＝結束。迴圈跑滿＝exec end。回傳**實際成功執行**的指令序列（含最後的 end）。

## 8. policies（`registerPolicy` 於模組載入時呼叫；ai.md §三層）

| id | propose | score | band |
|---|---|---|---|
| `tactical` | 匯出 `proposeTactical(ctx, agent, opts?: {maxMoves?: number; hostileOnly?: boolean})`：站位＝原地＋`reachable` 中依（到最近已知敵人距離、危險）粗篩的前 N 格（預設 8，AI-13）；每個站位先 preview move，在該 state 上對每個 `abilitiesOf`（mode activated）× 合法目標（unit／part（partAim.allowed 且 targetPref.parts 相交）／ball 與 cell 用敵方所在格／self）用 `q.checkAbility` 篩；另加只移動候選（cmd＝move）、`wait`、`end`、`retreat`（站在 exit 上）、`eject` | `scoreCandidate` | 預設 |
| `berserk` | 所有其他 active 單位都算目標（不分敵我，AI-11：友傷懲罰 0）；只攻擊或朝最近單位移動；不 wait／retreat／eject | 攻擊：`10 + 1/(1+距離)`；移動：`1/(1+移動後到最近單位距離)` | 1 |
| `swarm` | 母體＝`memory.parent` 或最近帶 tag `spawner` 的友方，否則最近友方；離母體 > `params.leash`(3)＝只出朝母體移動的候選；否則 tactical 候選中只留站位距母體 ≤ leash 者 | tactical 分數；朝母體移動＝`1/(1+距離)` | 預設 |
| `sentinel` | 守點＝`assignment.hold ?? memory.home`（第一次呼叫記下現位）；不在守點＝只出回守點的移動；在守點＝只出原地能力候選＋end（不追） | `scoreCandidate` | 預設 |
| `flee` | `retreat`（在 exit 上）＋`reachable` 中的移動候選；不攻擊 | retreat 100；移動：`(到最近已知敵人距離) − dangerK×危險 − (到最近 exit 距離)×0.1` | 1 |
| `scripted` | `memory.script`（`Command[]`，actor 由 agent.unit 覆寫）的第 `memory.step ?? 0` 步；用完＝end | 1 | 1 |

`scripted.onExecuted` 讓 `memory.step += 1`。

## 9. index.ts

```ts
export * from "./rules-query.ts"; export * from "./policy.ts"; export * from "./knowledge.ts"; export * from "./danger.ts";
export * from "./score.ts"; export * from "./strategy.ts"; export * from "./agent.ts";   // 並 side-effect import 六個 policies
export const AI_RNG_STREAM = 101;
export type FactionAI = { slot: FactionSlot; strategy: Strategy; agents: Record<Id, Agent>; know: FactionKnowledge; rng: RngState;
  params: AiParams; defaultPolicy: Id; assignments: Record<Id, Assignment> };
export function createFactionAI(opts: { slot: FactionSlot; seed: number; policy?: Id; params?: AiParams;
  unitPolicies?: Record<Id, Id>; memory?: Record<Id, Record<string, unknown>> }): FactionAI;
export function startRound(ai: FactionAI, q: RulesQuery, s: BattleState): void;   // 更新 know、roundPlan、為新單位建 agent
export function runUnitTurn(ai: FactionAI, q: RulesQuery, s: BattleState, unitId: Id, exec: ExecCommand, opts?: TurnOptions): Command[];
export function observeEvents(ai: FactionAI, q: RulesQuery, s: BattleState, events: readonly GameEvent[]): void;
```
