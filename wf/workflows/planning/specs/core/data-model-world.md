# data-model-world — 地形、地圖、勢力、怪獸族與個體、情境

[core README](README.md)｜戰局規則 [rules-battle-flow](rules-battle-flow.md)｜AI 的陣營層 [ai](ai.md)

裁示：地圖有大有小、尺寸是資料；方格（真格子）；怪獸多族（蟲／獸／異形／菌絲……），族是 body plan 與層組合的分類；母體／子體與蛻皮只是某些族的可選行為；等級 D–SSS，SS／SSS 先不設計；勢力大小不限、很多；傳統兵器可存在。

## 地形 TerrainDef 與地圖 MapDef

```ts
type TerrainDef = {
  id: Id; name: string; glyph: string; color: string;                   // 給 ui-adapter 的最小呈現契約
  moveCost: Record<LocomotionClass, number | null>;                     // null＝不可進（leg/track/hover/flight/burrow/amphibious…由登記檔定義）
  height: number; cover: number; blocksLos: boolean;                    // cover 加到被攻擊方防禦
  onEnter: EffectRef[]; onTurnStart: EffectRef[];                       // 例：酸沼每回合腐蝕 flesh 層；菌絲地侵蝕 component 層
  destructible?: { hp: number; becomes: Id };                           // 建築被打壞變廢墟
  tags: string[];                                                       // water、urban、ruin、mycelium…
};
type MapDef = { id: Id; width: number; height: number;                  // 任意尺寸；>120×120 由 ui-adapter 可視區渲染
  cells: string;                                                        // 每格一個 glyph，查 legend；或 { rle: string }
  legend: Record<string, Id>; features?: { at: Cell; terrain: Id; hp?: number }[];
  deployZones: Record<FactionSlot, Cell[]>; exits: Cell[];              // exits＝撤離邊；預設四邊全部
  globals?: { tide?: NumExpr; light?: number };                         // battle.* 可引用的全局值
};
```

## 勢力 FactionDef（世界圖上的任何集團）

```ts
type FactionDef = {
  id: Id; name: string; scale: "band" | "company" | "city" | "cult" | "swarm" | "state";   // 只是標籤
  relations: Record<Id, "ally" | "neutral" | "hostile">;              // 戰場陣營由情境再映射
  strategy: Id;                                                       // ai 策略插件 id（見 ai.md）
  sensing: "shared";                                                  // 本版唯一值；保留欄位供日後「各機獨立」
  tags: string[];                                                     // human、kaiju、conventional-arms…
};
```

戰場上的「陣營」是情境把多個 FactionDef 映射到 `FactionSlot`（player／enemy／third…）的結果；同 slot 共享感測。怪獸的「裂獸」也是 FactionDef（`tags:["kaiju"]`），失控單位會被移到情境預留的 `berserk` slot（對所有人敵對）。

## 怪獸族 SpeciesDef 與個體 MonsterDef

```ts
type SpeciesDef = {
  id: Id; name: string; family: "insect" | "beast" | "aberrant" | "mycelial" | string;   // 開放字串
  bodyPlan: Id; gradeRange: Grade[];                                   // 本族會出現的等級（不是成長階段）
  baseAttrsByGrade: Record<Grade, Record<AttrId, number>>;
  pools: PoolDecl[]; abilities: Id[];                                   // 族共通能力
  capture: { requireIntact: PartFunction[]; requireBroken: PartFunction[]; ability: Id; frame: Id };   // 捕後變哪個 FrameDef
  behaviors?: {                                                        // 全部可選，只有某些族有
    spawner?: { child: Id; cadence: NumExpr; max: number; tether: "dieWithParent" | "freeOnParentDeath" };
    molt?: { to: Id /*SpeciesDef*/; when: Cond; duringMoltEffects: EffectRef[] };
    telegraph?: boolean;                                               // 意圖提前一回合可見（ai.md）
    territorial?: { spreads: Id /*TerrainDef*/; cadence: NumExpr };    // 菌絲族把地形改成菌絲地
  };
  aiProfile: Id; tags: string[];
};
type MonsterDef = { id: Id; species: Id; grade: Grade; name?: string;   // 命名個體（S 以上多半在此）
  attrMods?: Contribution[]; extraAbilities?: Id[]; partsOverride?: Partial<PartDef>[]; tags: string[] };
```

怪獸的戰場實例就是 `MechState`（frame 指向由 species＋grade 合成的虛擬 FrameDef），座位為空；捕捉後把 `capture.frame` 當新 frame、保留各層 HP。「B 級不是 C 級蛻變而來」：`gradeRange` 列出本族各等級**各自生成**，`molt` 只在宣告了的族才存在。

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

## 替使用者做掉的決定

1. **族的 `family` 開放字串、四族只是預設值**：使用者用了「等」字，不封閉。
2. **菌絲族給 `territorial` 行為**（把格子改成菌絲地形）：使用者形容菌絲是「地形化／擴散型」，用地形改寫表達最省。
3. **意圖宣告 `telegraph` 掛在族上而非全局**：Into the Breach 式可見意圖是裂獸的特色，人類機甲不透明。
4. **陣營 slot 與 FactionDef 分離**：勢力「很多、大小不限」，但一場戰鬥只需要少量 slot；失控者有專屬 slot。
5. **地圖 cells 用字串＋legend**：比二維陣列省 JSON 體積、人可讀、支援 RLE；大地圖靠可視區渲染不靠壓資料。
