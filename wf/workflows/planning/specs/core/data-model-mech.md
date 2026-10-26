# data-model-mech — 機體、body plan、部位、層序列、資源池、部件

[core README](README.md)｜攻擊怎麼沿層結算 [rules-attack-resolution](rules-attack-resolution.md)｜資源規則 [rules-resources-effects](rules-resources-effects.md)

裁示：機甲就是裝備；部位多種多樣、依機體而異、每個部位有 HP；部位可分多種層，傷害沿層序列結算；機甲有零到多個資源池；部位打壞的後果與傳到駕駛員的方式都是效果清單。三類機甲與怪獸共用這套骨架。

## 五層資料：Frame → BodyPlan → Part → Layer；Component 插進 Part

```ts
type FrameDef = {                         // 機體（一種型號；古代機甲每台就是一個 FrameDef）
  id: Id; name: string; cls: "mechanical" | "bio" | "ancient"; grade: Grade;  // Grade = "D"|"C"|"B"|"A"|"S"|"SS"|"SSS"；古代機無上限、會自我進化（world/mech-lifecycles），超出量尺的表示法待引擎
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

見 [資源池、部件與機甲實例](data-model-mech/equipment-and-state.md#資源池-pooldecl機體部件人物三處都能宣告)：資源池與部件型別、機甲實例及設計決定。

## 部件 ComponentDef

見 [資源池、部件與機甲實例](data-model-mech/equipment-and-state.md#部件-componentdef)。

## 機甲實例 MechState

見 [資源池、部件與機甲實例](data-model-mech/equipment-and-state.md#機甲實例-mechstate)。

## 替使用者做掉的決定

見 [資源池、部件與機甲實例](data-model-mech/equipment-and-state.md#替使用者做掉的決定)。
