# data-model-mech — 機體、body plan、部位、層序列、資源池、部件

[core README](README.md)｜攻擊怎麼沿層結算 [rules-attack-resolution](rules-attack-resolution.md)｜資源規則 [rules-resources-effects](rules-resources-effects.md)

裁示：機甲就是裝備；部位多種多樣、依機體而異、每個部位有 HP；部位可分多種層，傷害沿層序列結算；機甲有零到多個資源池；部位打壞的後果與傳到駕駛員的方式都是效果清單。三類機甲與怪獸共用這套骨架。

## 五層資料：Frame → BodyPlan → Part → Layer；Component 插進 Part

```ts
type FrameDef = {                         // 機體（一種型號；古代機甲每台就是一個 FrameDef）
  id: Id; name: string; cls: "mechanical" | "bio" | "ancient"; grade: Grade;  // Grade = "D"|"C"|"B"|"A"|"S"|"SS"|"SSS"
  bodyPlan: Id; baseAttrs: Record<AttrId, number>;        // 速度、感測距離、載重……機體底值
  pools: PoolDecl[];                                      // 機體自帶的池（可為空：古代系常為空或獨有池）
  innateAbilities: Id[];                                  // 機體自帶能力（古代神異能力在這裡；共鳴門檻寫在能力的 require）
  resonance?: ResonanceReq; burden?: NumExpr;             // 古代：認主條件；生物：每回合承擔量
  repairPolicy: "repair-or-replace" | "repair-only";      // 古代＝repair-only（decisions 第 6 題）
  tags: string[];                                         // 例：kaiju、flight、amphibious
};
type BodyPlanDef = { id: Id; parts: PartDef[]; symmetry?: string };
type PartDef = {
  id: PartId; name: string; exposure: number;             // 暴露權重（未指定部位時的抽中機率基底）
  layers: LayerDef[];                                     // 由外到內的有序層序列
  slots: SlotDecl[];                                      // 可插部件的槽
  functions: PartFunction[];                              // locomotion | manipulator | sensor | cockpit | core | weaponMount | spawner…
  onLayerBroken: Record<LayerType, EffectRef[]>;          // 某類層被擊穿時掛的效果
  onBroken: EffectRef[];                                  // 部位毀損（結構層歸零）時的後果清單
  conduct: ConductRule[];                                 // 傳導到人物的規則，見下
  seats?: SeatDecl[];                                     // 只有 functions 含 cockpit 的部位有
};
type LayerDef = {
  type: LayerType;                                        // 內容包登記：shield / armor / chitin / flesh / organ / cockpit-shell…
  hp: number; ablative: boolean;                          // ablative=true 擋下即扣（BB 式）；false＝不消耗的減傷（ToME 式）
  reduce?: { flat?: number; pct?: number };               // ablative=false 時的減傷量
  resist: Record<DamageType, number>;                     // 材質抗性 0..1（TM-41）
  passThrough: Record<DamageType, number>;                // 該類傷害直接穿過本層的比例（例：flesh 對 kinetic 0.3）
  structural: boolean;                                    // 結構層：歸零＝部位毀損
  regen?: NumExpr; regenPool?: PoolId;                    // 護盾類：每回合回復，可要求從某池扣
  onHit?: EffectRef[];                                    // 本層被命中（不論擊穿）時掛的效果
};
type ConductRule = { when: "layerHit" | "layerBroken" | "partBroken"; layer?: LayerType;
                     to: "pilot" | "soul" | "allSeats"; effects: EffectRef[]; chance?: NumExpr };
```

「部位有 HP」＝每層各有 HP，部位沒有獨立 HP；UI 顯示的部位 HP 是各層 HP 加總。層的種類 `LayerType` 與 `DamageType`、`PartFunction`、`SlotType` 都在內容包的登記檔（content-format），程式不列舉。

## 資源池 PoolDecl（機體、部件、人物三處都能宣告）

```ts
type PoolDecl = {
  id: PoolId; name: string;                                 // 例：heat、charge、bio-acid、rpm、instinct、ap、fatigue
  min: number; max: NumExpr | null;                         // null＝無上限
  capKind: "hard" | "soft";                                 // soft 允許超載（decisions ToME 第 2 題）
  inverted: boolean;                                        // true＝越高越糟（燼 heat、疲勞、承擔）
  initial: NumExpr; regen: NumExpr;                         // 每回合增減（可負＝衰減）
  decayCurve?: { kind: "toward"; baseline: NumExpr; rate: NumExpr };   // TM-05：離開刺激後向基準值收斂
  bands: PoolBand[];                                        // 閾值帶，見 rules-resources-effects
  onDepleted?: EffectRef[]; onOverflow?: EffectRef[];
};
```

機甲實例的池＝機體 pools ∪ 所有已裝部件 pools；同 id 的池合併（上限相加、regen 相加）。池的 `id` 是機制名（`heat`、`charge`…），`name` 是給玩家看的風格名（燼、流光…），對照表在 [README](README.md)。人物的池與機甲的池是同一機制、不同容器；能力成本可同時點名兩邊（decisions ToME 第 1 題）。提供池的部件被毀→該池 `max` 重算，儲量超出的部分依 `capKind` 處理（hard 截掉、soft 留著進超載帶）。

## 部件 ComponentDef

```ts
type ComponentDef = {
  id: Id; name: string; slot: SlotType; size: number; mass: number;
  origin: "mechanical" | "bio" | "ancient";                 // 來源決定是否觸發意志軸
  pools: PoolDecl[]; poolMods: { pool: PoolId; max?: NumExpr; regen?: NumExpr }[];
  attrMods: Contribution[];                                 // 對機體或人物屬性的貢獻（TM-50，可撤回）
  abilities: Id[];                                          // 授予的能力，來源綁本部件（CMB-19）
  layersAdd?: { part: PartId; insertAt: number; layer: LayerDef }[];   // 外掛裝甲／護盾：往某部位層序列插層
  burden?: NumExpr; resonance?: ResonanceReq;               // 生物／古代部件的意志要求（design-notes 嫁接）
  hp?: number; onBroken?: EffectRef[];                      // 部件自身可被打壞（當作所在部位的一層，type=component）
  tags: string[];
};
```

生物系的「拘束裝置」「駕駛艙」就是 `origin: "mechanical"` 的部件，插在怪獸 body plan 預留的 `restraint`／`cockpit` 槽；捕捉成功後怪獸個體轉成 FrameDef 實例（rules-battle-flow §捕捉）。

## 機甲實例 MechState

```ts
type MechState = {
  id: Id; frame: Id; owner: FactionId; pos: Cell; facing?: Dir;
  parts: Record<PartId, { layers: { hp: number; broken: boolean }[]; broken: boolean; components: Record<SlotId, Id | null> }>;
  pools: Record<PoolId, PoolState>; contribs: Contribution[]; effects: EffectInstance[];
  seats: Record<SeatId, Id | null>; controlMode: ControlMode; cooldowns: Record<Id, number>;
  sustained: Id[];                                          // 啟用中的維持型能力（TM-10）
};
```

戰後不補滿：`MechState.parts` 與人物 HP 類效果原樣帶回營運層（decisions 第 6 題）。

## 替使用者做掉的決定

1. **部位沒有獨立 HP，HP 全在層上**：避免「部位 HP」與「各層 HP」兩套數字打架；結構層歸零＝部位毀。
2. **層可由部件插入**（`layersAdd`）：外掛護盾／附加裝甲不用另造機制，沿用層序列。
3. **部件本身也是一層**（type=component）：讓「打壞武器」與「打穿裝甲」走同一條結算。
4. **同 id 池合併、上限相加**：最簡單、可預測；若要「不合併」改 PoolDecl 加 `mergePolicy` 即可。
5. **古代機甲每台一個 FrameDef**：使用者說每台獨一無二，用型號層表達最直接，也讓 `innateAbilities` 逐台填。
