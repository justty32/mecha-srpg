# data-model-abilities-effects — 能力、效果、NumExpr

[core README](README.md)｜結算順序 [rules-attack-resolution](rules-attack-resolution.md)、[rules-resources-effects](rules-resources-effects.md)｜AI 怎麼讀權重 [ai](ai.md)

裁示：部件與技能宣告「消耗哪個資源多少、產生哪個多少」；部位後果與傳導都是效果清單；古代神異能力用效果系統逐台定義；AI 資料驅動。能力與效果是整個引擎唯一的「動詞」來源。

## NumExpr：結構化數值，不用字串 DSL

```ts
type NumExpr = number
  | { ref: RefPath; mul?: number; add?: number; min?: number; max?: number }   // ref 例："self.attrs.resolve"、"self.pools.heat.cur"、"target.grade"
  | { sum: NumExpr[] } | { product: NumExpr[] } | { pick: { if: Cond; then: NumExpr; else: NumExpr } };
type Cond = { tag?: string; not?: Cond; all?: Cond[]; any?: Cond[]; cmp?: { a: NumExpr; op: "<"|"<="|"=="|">="|">"; b: NumExpr } };
```

可引用的 `RefPath` 根：`self`、`target`、`part`（當前結算的部位）、`layer`、`battle`（回合數、蝕壓等全局值）、`rng`（只在 rules 層允許）。無副作用、可靜態驗證、AI 預估與實扣用同一份求值結果（TM-07、CMB-04 教訓）。

## AbilityDef

```ts
type AbilityDef = {
  id: Id; name: string;
  mode: "activated" | "sustained" | "passive" | "reaction";           // TM-13；reaction 由 trigger 觸發（機會攻擊、反擊）
  actorRole?: SeatRole;                                              // 誰出手（預設握指令權者）
  costs: { pool: PoolId; owner: "mech" | "person"; amount: NumExpr; allowOverload?: boolean }[];
  produces: { pool: PoolId; owner: "mech" | "person"; amount: NumExpr }[];
  sustain?: { lock: CostLike[]; drain: CostLike[]; removeOnZero: boolean };   // TM-10/11/12
  cooldown?: NumExpr; usesPerBattle?: number; ammoPool?: PoolId;
  require: Cond[];                                                   // 例：共鳴 ≥ 0.6、某部位未毀、某部件已裝
  target: TargetSpec; accuracy?: NumExpr; partAim?: { allowed: boolean; penalty: NumExpr };
  packets: DamagePacket[];                                           // 可空（純效果能力）
  effects: { on: "hit" | "miss" | "self" | "cell" | "always"; apply: EffectRef[] }[];
  trigger?: TriggerSpec;                                             // reaction：{ event, cond, oncePer: "action" | "turn" }
  tags: string[];                                                    // conventional-arms、melee、ranged、capture、restraint、telegraph…
  ai: AiHints;                                                       // 戰術權重，見下
};
type TargetSpec = { kind: "self" | "unit" | "cell" | "line" | "cone" | "ball" | "part";
  range: { min: NumExpr; max: NumExpr }; radius?: NumExpr; los: boolean; friendly: "no" | "yes" | "only" };
type DamagePacket = { type: DamageType; amount: NumExpr; armorPen?: NumExpr; resistPen?: NumExpr; crit?: NumExpr;
  layerFilter?: LayerType[];                                         // 只對某些層有效（例：EMP 只打 shield 與 component）
  conductBonus?: NumExpr };                                          // 提高傳導到人物的機率
type AiHints = { tactics: Partial<Record<Tactic, NumExpr>>;         // Tactic = attack | attackArea | disable | heal | buff | debuff | escape | protect | capture | scout
  targetPref?: { parts?: PartFunction[]; grades?: Grade[] }; cooldownValue?: number };
```

**成本不足＝不能用**（除非該筆 `allowOverload` 且池是 soft）。沒有該池的機甲／人物視為成本不可支付——所以古代機甲不宣告 `heat` 就永遠不會積燼受限，也用不了需要 `heat` 的部件能力。

## EffectDef 與 EffectInstance

```ts
type EffectDef = {
  id: Id; name: string; scope: "part" | "layer" | "mech" | "person" | "cell" | "faction" | "battle";
  clock: { kind: "ownerTurns" | "rounds" | "uses" | "days" | "permanent" | "whileSource"; n?: NumExpr };  // 預設 ownerTurns（decisions ToME 第 4 題）
  stack: { policy: "refresh" | "stack" | "merge" | "ignore" | "separate"; max?: number; mergeOp?: "sumMag" | "maxMag" | "sumDur" };
  perPartSeparate?: boolean;                                         // scope=part 時同名故障預設分部位各算（decisions ToME 第 5 題）
  contribs: Contribution[];                                          // 屬性／池上限／regen 的可撤回貢獻（TM-34）
  hooks: Partial<Record<HookName, HookAction[]>>;                    // onApply / onExpire / onTick / onHit / onBeingHit / onTurnStart / onPartBroken…
  conduct?: ConductRule[];                                           // 自身再傳導（例：座艙起火→每回合燒駕駛員）
  save?: { attr: AttrId; dc: NumExpr }; immuneTags?: string[];       // TM-36/37
  tags: string[];                                                    // injury:temporary、morale、burden-band、cleanse:fire…
  magnitude?: NumExpr;                                               // 疊加與 merge 用的量
  ui: { badge: string; color?: string; hidden?: boolean };
};
type EffectRef = Id | { effect: Id; params?: Record<string, NumExpr>; chance?: NumExpr };
type Contribution = { id?: string; path: RefPath; op: "add" | "mul" | "set" | "min" | "max"; value: NumExpr; source: Id };
type HookAction =
  | { do: "damage"; packets: DamagePacket[]; target: "self" | "source" | "seats" | "adjacent" }
  | { do: "pool"; owner: "mech" | "person"; pool: PoolId; delta: NumExpr }
  | { do: "apply"; to: "self" | "source" | "seats" | "cell"; effects: EffectRef[] }
  | { do: "remove"; tags: string[] } | { do: "setControl"; mode: ControlMode }
  | { do: "moraleCheck"; dc: NumExpr } | { do: "spawn"; species: Id; grade: Grade; at: "adjacent" | "cell" }
  | { do: "emit"; event: string; payload?: Record<string, NumExpr> };
```

`HookAction` 是程式提供的**動詞封閉集合**（約 10 個）；內容包只能組合，不能擴充動詞——這是「程式只提供效果詞彙」的落點。新動詞＝改 rules 層＋加一列 adoption／constraints。

## 傷勢、士氣、承擔帶、共鳴帶都是效果

- 傷勢：`scope=person`、`tags:["injury:temporary"]`、`clock:{kind:"days"}`。
- 士氣階段：四個效果 id（steady 無效果），由 `moraleCheck` 動作切換。
- 承擔帶：`burden-band-1..n`，`contribs` 給加成，`hooks.onTurnStart` 做失控檢定。
- 共鳴帶：`resonance-band-*` 由古代機體資料宣告，達成即掛上。

## 替使用者做掉的決定

1. **NumExpr 用結構化 JSON、不開字串運算式**：可 schema 驗證、可靜態列出引用、AI 求值安全；代價是手寫較囉嗦。
2. **HookAction 動詞封閉**：擴充性放在資料組合，不放在腳本——內容作者不需要寫程式，也沒有腳本注入面。
3. **沒有池＝付不起**：比「沒有池就免費」更不會出 bug，也讓古代機甲「不產熱」自然成立。
4. **reaction 模式納入 AbilityDef**：機會攻擊／反擊／護盾自動開啟都走同一型別（CMB-07/08 改造），不另造「被動觸發表」。
5. **效果有 `ui.badge`**：給 ui-adapter 的最小契約，避免 UI 自己維護效果對照表。
