# data-model-world／scenario — 情境 ScenarioDef、同盟與敵對、全局值、地物受損

[data-model-world 入口](../data-model-world.md)｜[core README](../README.md)｜戰局規則 [rules-battle-flow](../rules-battle-flow.md)｜AI 的陣營層 [ai](../ai.md)

## 情境 ScenarioDef（一場戰鬥的入口）

```ts
type ScenarioDef = { id: Id; map: Id; slots: Record<FactionSlot, { faction: Id; units: UnitSpawn[]; ai?: Id; allies?: FactionSlot[] }>;
  objectives: Objective[]; rounds?: number; rules?: { conventionalFactor?: number /*預設 0.1*/ }; seed?: number };
type UnitSpawn = { mech?: Id; monster?: Id; persons?: { id: Id; seat: SeatRole }[]; at: Cell | "zone"; grade?: Grade };
type Objective = { kind: "eliminate" | "survive" | "hold" | "escort" | "capture" | "reachExit" | "killTarget";
  params: Record<string, unknown>; for: FactionSlot; onComplete: "win" | "lose" | "continue" };
```

### 同盟、敵對與全局值（2026-10-24 修正線已實作）

- **同盟**：`slots[].allies?` 是情境層同盟，與各 slot `FactionDef.relations` 裡的 `ally` 取**聯集**、**對稱化**後存進規則執行期 `RulesRuntime.allies: Record<FactionSlot, FactionSlot[]>`；敵對判定只有 `hostileSlots(a, b)`＝`a ≠ b` 且不在 allies 內。規則與 AI 都只經它。`eliminate` 只計**敵對 slot** 的單位。世界關係 `neutral` 在戰場上**算敵對**（頂層代決，見下）。
- **killTarget**：內容只寫 `params.target`＝def id（`MonsterDef`／`FrameDef`），組裝期（`scenarioToSetup`）翻成單位 id 清單；同 def 多個單位要**全部死亡**才達成；找不到目標在組裝期報錯。
- **全局值**：`MapDef.globals` 載入後存 `RulesRuntime.globals`；`NumExpr`／`Cond` 可引用 `battle.tide`（NumExpr 逐回合求值）與 `battle.light`（常數）。
- **可破壞格**：`TerrainDef.destructible` 的格在組裝期初始化 `featureHp`：`MapDef.features[].hp` 優先，無則用地形 `destructible.hp`。

### 地物受損（提案，待實作）

可破壞格是**可被瞄準的目標**：能力 `target.kind` 為 `cell` 或範圍型（`ball`／`line`）時，範圍內每個 `destructible` 格都吃一次該能力的傷害包，傷害型乘以地形 `destructible.resist?: Partial<Record<DamageType, number>>`（預設 1）；直接對單位的單體攻擊**不**順帶打到它腳下的地物。`featureHp ≤ 0` → 地形換成 `becomes`、寫 `FeatureDestroyed{ at, from, to }`，格上單位吃地形 `destructible.onCollapse?: EffectRef[]`，`cover`／`blocksLos`／`moveCost` 立即以新地形計；AI 只把 `tags` 含 `objective` 的可破壞格當目標，其餘地物只在擋路或擋視線時納入估值。十分律只對 `kaiju` 單位，地物吃全額；菌絲族 `territorial` 擴散不經傷害、直接改格。

### 替使用者做掉的決定（2026-10-24 補）

6. **neutral 在戰場算敵對**：同場就是威脅，AI 省掉第三種態度；中立觀望由 `allies` 顯式宣告。
7. **killTarget 用 def id、同 def 全死**：內容作者不知道單位 id；「殺光」比「殺其一」直覺。
8. **地物只被 cell／範圍攻擊打到**：「打牆」是選擇不是副作用；新欄全選填。
