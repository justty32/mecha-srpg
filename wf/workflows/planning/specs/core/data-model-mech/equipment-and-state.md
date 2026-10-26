[data-model-mech 入口](../data-model-mech.md)

# 資源池、部件與機甲實例

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

機甲實例的池＝機體 pools ∪ 所有已裝部件 pools；同 id 的池合併（上限相加、regen 相加）。池的 `id` 是機制名（`heat`、`charge`…），`name` 是給玩家看的風格名（燼、流光…），對照表在 [README](../README.md)。人物的池與機甲的池是同一機制、不同容器；能力成本可同時點名兩邊（decisions ToME 第 1 題）。提供池的部件被毀→該池 `max` 重算，儲量超出的部分依 `capKind` 處理（hard 截掉、soft 留著進超載帶）。

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
