// core/types-def — 內容定義型別（Def＝內容檔的形狀，唯讀）。
// 來源：specs/core 的 data-model-{people,mech,abilities-effects,world}.md 與 content-format.md。
// 本檔只有型別（type stripping 下執行期為空）。列舉值（屬性、層種類、傷害類型…）一律是 string，
// 由內容包 registries/ 登記，程式不寫死（content-format）。
// 標 SPEC-GAP 的是 spec 沒寫死、本線自選的最小解法，彙整在 lead-impl-foundation REPORT。

import type { Id } from "./ids.ts";

// nameEn／etymology：各內容 def 通用可選欄（英文原名、意涵；2026-10 engine-backlog 9）。只供顯示／百科，不影響規則。

// ---------- 登記檔列舉（開放字串，值由 registries/*.json 決定） ----------
export type AttrId = string;
export type PoolId = string;
export type PartId = string;
export type SlotId = string;
export type SeatId = string;
export type LayerType = string;
export type DamageType = string;
export type PartFunction = string;
export type SlotType = string;
export type LocomotionClass = string;
export type Tactic = string;
export type RefPath = string;         // 例 "self.attrs.resolve"；根限 self|target|part|layer|battle|rng

// ---------- 程式封閉的列舉 ----------
export type Grade = "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";
export const GRADES: readonly Grade[] = ["D", "C", "B", "A", "S", "SS", "SSS"];
export type FrameClass = "mechanical" | "bio" | "ancient";
export type PersonKind = "human" | "soul";
export type SeatRole = "pilot" | "soul" | "passenger";
// "instinct"：無座位人物的怪獸由本能驅動（lead-impl-sim 2026-10-24 追加；SPEC-GAP，spec 只列七值）。
export type ControlMode = "pilot" | "soul" | "shared" | "contested" | "none" | "disabled" | "berserk" | "instinct" | "scripted";
export type MoraleStage = "steady" | "shaken" | "breaking" | "fleeing";
export type AttrRole = "accuracy" | "evasion" | "resolve" | "initiative" | "perception" | "control" | "maneuver";
export type Cell = { x: number; y: number };
export type Dir = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";   // SPEC-GAP：spec 只寫 facing?: Dir
export type FactionSlot = string;     // player / enemy / third / berserk…（情境決定）

// ---------- NumExpr 與 Cond（data-model-abilities-effects §NumExpr） ----------
export type NumExpr =
  | number
  | { ref: RefPath; mul?: number; add?: number; min?: number; max?: number }
  | { sum: NumExpr[] }
  | { product: NumExpr[] }
  | { pick: { if: Cond; then: NumExpr; else: NumExpr } };
export type CmpOp = "<" | "<=" | "==" | ">=" | ">";
export type Cond = {
  tag?: string;                       // SPEC-GAP：spec 未定 tag 對誰比對；求值器交給 EvalCtx.hasTag 決定
  not?: Cond; all?: Cond[]; any?: Cond[];
  cmp?: { a: NumExpr; op: CmpOp; b: NumExpr };
};

// ---------- 效果（data-model-abilities-effects §EffectDef） ----------
export type EffectScope = "part" | "layer" | "mech" | "person" | "cell" | "faction" | "battle";
export type ClockKind = "ownerTurns" | "rounds" | "uses" | "days" | "permanent" | "whileSource";
export type StackPolicy = "refresh" | "stack" | "merge" | "ignore" | "separate";
export type HookName =
  | "onApply" | "onExpire" | "onTick" | "onHit" | "onBeingHit" | "onTurnStart" | "onTurnEnd"
  | "onPartBroken" | "onLayerBroken" | "onMove";
export type EffectRef = Id | { effect: Id; params?: Record<string, NumExpr>; chance?: NumExpr };
export type ContribOp = "add" | "mul" | "set" | "min" | "max";
export type Contribution = { id?: string; path: RefPath; op: ContribOp; value: NumExpr; source: Id };
export type ConductRule = {
  when: "layerHit" | "layerBroken" | "partBroken"; layer?: LayerType;
  to: "pilot" | "soul" | "allSeats"; effects: EffectRef[]; chance?: NumExpr;
};
export type DamagePacket = {
  type: DamageType; amount: NumExpr; armorPen?: NumExpr; resistPen?: NumExpr; crit?: NumExpr;
  layerFilter?: LayerType[]; conductBonus?: NumExpr;
};
export type HookAction =
  | { do: "damage"; packets: DamagePacket[]; target: "self" | "source" | "seats" | "adjacent" }
  | { do: "pool"; owner: "mech" | "person"; pool: PoolId; delta: NumExpr }
  | { do: "apply"; to: "self" | "source" | "seats" | "cell"; effects: EffectRef[] }
  | { do: "remove"; tags: string[] }
  | { do: "setControl"; mode: ControlMode }
  | { do: "moraleCheck"; dc: NumExpr }
  | { do: "spawn"; species: Id; grade: Grade; at: "adjacent" | "cell" }
  | { do: "emit"; event: string; payload?: Record<string, NumExpr> };
export const HOOK_VERBS = ["damage", "pool", "apply", "remove", "setControl", "moraleCheck", "spawn", "emit"] as const;
export type EffectDef = {
  id: Id; nameEn?: string; etymology?: string; name: string; scope: EffectScope;
  clock: { kind: ClockKind; n?: NumExpr };
  stack: { policy: StackPolicy; max?: number; mergeOp?: "sumMag" | "maxMag" | "sumDur" };
  perPartSeparate?: boolean;
  contribs: Contribution[];
  hooks: Partial<Record<HookName, HookAction[]>>;
  conduct?: ConductRule[];
  save?: { attr: AttrId; dc: NumExpr }; immuneTags?: string[];
  tags: string[];
  magnitude?: NumExpr;
  order?: number;                     // 鉤子分派序（rules-resources-effects §鉤子分派順序），預設 100
  ui: { badge: string; color?: string; hidden?: boolean };
};

// ---------- 資源池（data-model-mech §PoolDecl、rules-resources-effects §PoolBand） ----------
export type PoolBand = { from: NumExpr; to: NumExpr | null; effects: EffectRef[]; label?: string };
export type PoolDecl = {
  vital?: boolean;
  id: PoolId; name: string;
  min: number; max: NumExpr | null;
  capKind: "hard" | "soft";
  inverted: boolean;
  initial: NumExpr; regen: NumExpr;
  decayCurve?: { kind: "toward"; baseline: NumExpr; rate: NumExpr };
  bands: PoolBand[];
  onDepleted?: EffectRef[]; onOverflow?: EffectRef[];
};

// ---------- 意志軸（data-model-people §意志軸） ----------
export type ResonanceReq = { beliefs: string[]; threshold: number; deeds?: string[] };   // SPEC-GAP：spec 只列三個欄名
export type WillDef = { beliefs: string[]; burdenLimit: NumExpr; resonanceAffinity?: Record<string, number> };

// ---------- 機體（data-model-mech） ----------
export type LayerDef = {
  type: LayerType; hp: number; ablative: boolean;
  reduce?: { flat?: number; pct?: number };
  resist: Record<DamageType, number>;
  passThrough: Record<DamageType, number>;
  structural: boolean;
  regen?: NumExpr; regenPool?: PoolId;
  onHit?: EffectRef[];
};
export type SlotDecl = { id: SlotId; type: SlotType; size: number };            // SPEC-GAP：spec 未展開
export type SeatDecl = { id: SeatId; accepts: SeatRole[] };                     // SPEC-GAP：spec 未展開
export type PartDef = {
  targetRadius?: number; mobility?: LocomotionClass[];
  id: PartId; name: string; exposure: number;
  layers: LayerDef[];
  slots: SlotDecl[];
  functions: PartFunction[];
  onLayerBroken: Record<LayerType, EffectRef[]>;
  onBroken: EffectRef[];
  conduct: ConductRule[];
  seats?: SeatDecl[];
};
export type BodyPlanDef = { targetRadius?: number; partAdjacency?: Record<PartId, PartId[]>; mobilityMinimum?: Record<LocomotionClass, number>; abilityParts?: Record<Id, { parts: PartId[]; min: number }>; id: Id; nameEn?: string; etymology?: string; name?: string; parts: PartDef[]; symmetry?: string };
export type FrameDef = {
  moveBudget?: number; moveLoadCapacity?: number;
  core?: boolean;
  series?: string;
  mark?: number;
  /** 各勢力對本機型的叫法（lead-gaps-battle 2026-10-24；SPEC-GAP，spec 未定欄名）。faction 為勢力 id。 */
  aka?: { faction: Id; name: string }[];
  id: Id; nameEn?: string; etymology?: string; name: string; cls: FrameClass; grade: Grade;
  bodyPlan: Id; baseAttrs: Record<AttrId, number>;
  pools: PoolDecl[];
  innateAbilities: Id[];
  resonance?: ResonanceReq; burden?: NumExpr;
  repairPolicy: "repair-or-replace" | "repair-only";
  tags: string[];
  /** 機體預設配裝：slot id → component id；情境 UnitSpawn 未給 components 時套用（ISS-001，lead-rules-fuzz 2026-10-24）。 */
  defaultLoadout?: Record<SlotId, Id>;
};
export type ComponentDef = {
  id: Id; nameEn?: string; etymology?: string; name: string; slot: SlotType; size: number; mass: number;
  origin: FrameClass;
  pools: PoolDecl[];
  poolMods?: { pool: PoolId; max?: NumExpr; regen?: NumExpr }[];   // spec 列為必填；範例省略→選填
  attrMods?: Contribution[];                                        // 同上
  abilities: Id[];
  layersAdd?: { part: PartId; insertAt: number; layer: LayerDef }[];
  burden?: NumExpr; resonance?: ResonanceReq;
  hp?: number; onBroken?: EffectRef[];
  tags: string[];
};

// ---------- 能力（data-model-abilities-effects §AbilityDef） ----------
export type AbilityMode = "activated" | "sustained" | "passive" | "reaction";
export type CostLike = { pool: PoolId; owner: "mech" | "person"; amount: NumExpr };
export type AbilityCost = CostLike & { allowOverload?: boolean };
export type TargetSpec = {
  kind: "self" | "unit" | "cell" | "line" | "cone" | "ball" | "part";
  range: { min: NumExpr; max: NumExpr }; radius?: NumExpr; los: boolean; friendly: "no" | "yes" | "only";
};
export type TriggerSpec = { event: string; cond?: Cond; oncePer: "action" | "turn" };
export type AiHints = {
  tactics: Partial<Record<Tactic, NumExpr>>;
  targetPref?: { parts?: PartFunction[]; grades?: Grade[] };
  cooldownValue?: number;
};
export type PartPattern = { kind: "spread"; fractions: number[]; selection: "adjacent" | "exposed" } | { kind: "penetrate"; maxParts: 2 | 3; falloff: number; selection: "adjacent" };
export type AbilityDef = {
  partPattern?: PartPattern;
  aim?: { dispersion: number; trackingDelay: number; projectileSpeed: number; windup?: number };
  defense?: { kind: "block" | "parry"; charges: number; maxImpact: number; maxSizeRatio: number; damageFactor?: number; onOverload?: EffectRef[] };
  id: Id; nameEn?: string; etymology?: string; name: string; mode: AbilityMode;
  grade?: Grade;
  /** 武器的精粹等級（抵抗性結算；engine-backlog 28）。省略＝取攻方機體等級；帶 conventional-arms 的一律算凡鐵。 */
  essence?: Grade;
  actorRole?: SeatRole;
  costs: AbilityCost[];
  produces: CostLike[];
  sustain?: { lock: CostLike[]; drain: CostLike[]; removeOnZero: boolean };
  cooldown?: NumExpr; usesPerBattle?: number; ammoPool?: PoolId;
  require: Cond[];
  target: TargetSpec; accuracy?: NumExpr; partAim?: { allowed: boolean; penalty: NumExpr };
  packets: DamagePacket[];
  effects: { on: "hit" | "miss" | "self" | "cell" | "always"; apply: EffectRef[] }[];
  trigger?: TriggerSpec;
  tags: string[];
  ai: AiHints;                        // tactics 必填（content-format 決定 4）
};

// ---------- 人物（data-model-people） ----------
export type HumanGrowth = { xpCurve: Id; levelDice: Record<AttrId, number[]>; perkPointsAt: number[] };
export type SoulGrowth = { tree: Id; researchPerDirection: Record<string, number>; companionshipRate: NumExpr };
export type PersonDef = {
  id: Id; nameEn?: string; etymology?: string; name: string; kind: PersonKind;
  abilities?: Id[]; age?: number; activeYears?: number;
  soulGrade?: Grade; // 只允許 kind=soul，由載入器檢查
  attrs: Record<AttrId, number>;
  traits: Id[]; perks: Id[];
  pools: PoolDecl[];
  will: WillDef;
  growth: HumanGrowth | SoulGrowth;   // kind=human→HumanGrowth；kind=soul→SoulGrowth
  tags: string[];
};
/** SPEC-GAP：soultrees/ 與 curves/ 的檔案形狀 spec 未定，以下為最小解。 */
export type SoulTreeDef = {
  id: Id; nameEn?: string; etymology?: string; name: string;
  nodes: { id: string; perk: Id; research?: Record<string, number>; companionship?: number; requires: string[] }[];
};
export type CurveDef = { id: Id; nameEn?: string; etymology?: string; name: string; points: number[] };   // 第 i 級所需累積值

// ---------- 世界（data-model-world） ----------
export type TerrainDef = {
  id: Id; nameEn?: string; etymology?: string; name: string; glyph: string; color: string;
  moveCost: Record<LocomotionClass, number | null>;
  height: number; cover: number; blocksLos: boolean;
  onEnter: EffectRef[]; onTurnStart: EffectRef[];
  destructible?: { hp: number; becomes: Id };
  tags: string[];
};
export type BattlefieldObjectDef = {
  id: string; name: string; kind: "pickup" | "wreck" | "corpse" | "debris"; at: Cell; effects?: EffectRef[];
  salvage?: Record<string, number>; debris?: number;
};
export type MapDef = {
  objects?: BattlefieldObjectDef[];
  id: Id; nameEn?: string; etymology?: string; width: number; height: number;
  cells: string | { rle: string };
  legend: Record<string, Id>;
  features?: { at: Cell; terrain: Id; hp?: number }[];
  deployZones: Record<FactionSlot, Cell[]>;
  exits: Cell[];
  globals?: { tide?: NumExpr; light?: number };
};
export type FactionDef = {
  id: Id; nameEn?: string; etymology?: string; name: string; scale: "band" | "company" | "city" | "cult" | "swarm" | "state";
  relations: Record<Id, "ally" | "neutral" | "hostile">;
  strategy: Id; sensing: "shared"; tags: string[];
};
export type SpeciesDef = {
  moveBudget?: number;
  id: Id; nameEn?: string; etymology?: string; name: string; family: string;
  bodyPlan: Id; gradeRange: Grade[];
  baseAttrsByGrade: Partial<Record<Grade, Record<AttrId, number>>>;
  pools: PoolDecl[]; abilities: Id[];
  capture: { requireIntact: PartFunction[]; requireBroken: PartFunction[]; ability: Id; frame: Id };
  behaviors?: {
    spawner?: { child: Id; cadence: NumExpr; max: number; tether: "dieWithParent" | "freeOnParentDeath" };
    molt?: { to: Id; when: Cond; duringMoltEffects: EffectRef[] };
    telegraph?: boolean;
    territorial?: { spreads: Id; cadence: NumExpr };
  };
  aiProfile: Id; tags: string[];
};
export type MonsterDef = {
  id: Id; nameEn?: string; etymology?: string; species: Id; grade: Grade; name?: string; epithet?: string;
  attrMods?: Contribution[]; extraAbilities?: Id[]; partsOverride?: Partial<PartDef>[]; tags: string[];
};
/** SPEC-GAP：在場單位沿用原個體；光環與是否可主動迎戰屬情境資料。 */
export type PresenceDef = { aura: Id; engageable?: boolean; captureLocked?: boolean };
export type UnitSpawn = { presence?: PresenceDef; core?: boolean; crew?: "ai" | "remote"; mech?: Id; monster?: Id; persons?: { id: Id; seat: SeatRole }[]; at: Cell | "zone"; grade?: Grade; pools?: Record<PoolId, number>;
  /** 情境替機甲裝部件：slot id → component id；給了就整組取代 FrameDef.defaultLoadout（ISS-001）。 */
  components?: Record<SlotId, Id> };
export type Objective = {
  kind: "eliminate" | "survive" | "hold" | "escort" | "capture" | "reachExit" | "killTarget";
  params: Record<string, unknown>; for: FactionSlot; onComplete: "win" | "lose" | "continue";
};
export type ScenarioDef = {
  id: Id; nameEn?: string; etymology?: string; map: Id;
  /** 顯示名與一段簡介（lead-gaps-battle 2026-10-24；SPEC-GAP，spec 未列）。只給 UI／MCP／百科顯示，不影響規則。 */
  name?: string; brief?: string;
  slots: Record<FactionSlot, { faction: Id; units: UnitSpawn[]; ai?: Id; allies?: FactionSlot[] /* 情境層同盟（lead-fix-scenario-ai 新增） */ }>;
  objectives: Objective[]; rounds?: number;
  rules?: { conventionalFactor?: number; scriptedAccuracyBase?: number; noRetreat?: boolean }; seed?: number;
};
/** SPEC-GAP：loot/ 與 aiprofiles/ 形狀 spec 未定，以下為最小解。 */
export type LootDef = { id: Id; nameEn?: string; etymology?: string; entries: { item: Id; weight: number; count?: number }[] };
export type AiProfileDef = { id: Id; nameEn?: string; etymology?: string; name: string; policy: string; params: Record<string, number> };

// ---------- 內容包、登記檔、規則表（content-format） ----------
export type PackDef = { id: string; version: string; depends: string[]; registries?: Record<string, string> };
export const REGISTRY_KINDS = [
  "attrs", "layer-types", "damage-types", "part-functions", "slot-types", "locomotion", "tactics",
] as const;
export type RegistryKind = (typeof REGISTRY_KINDS)[number];
export type RegistryEntry = { id: string; name: string; role?: AttrRole; min?: number; max?: number; tags?: string[] };
export type RegistryFile = { kind: RegistryKind; entries: RegistryEntry[] };

export const RULE_FILES = ["constants", "damage-modifiers", "morale-events", "injuries", "cockpit"] as const;
export type CockpitGrowth = {
  driveHoursPerRound: number; soulGrowthFactor: number; abilityCap: number; abilityHours: number[];
  abilityGradeCap: Grade; abilityPool: Id[]; agingRate: number; driveHoursPerYear: number; daysPerYear: number;
  awakenMinAiBattles: number; awakenChanceTide: number; awakenChanceAncient: number; awakenSoulTemplate: Id;
};
export type CockpitRules = { basicAbilities: Id[]; drivenOnlyTags: string[]; crewPools: Record<"ai" | "remote", PoolDecl[]>; growth?: CockpitGrowth };
export type RuleFileKind = (typeof RULE_FILES)[number];
/** rules/constants.json：數值常數表（命中上下限、暴擊倍率、永久傷門檻…）。 */
export type RulesConstants = { constants: Record<string, number> };
/** rules/damage-modifiers.json：全局修正表（rules-attack-resolution ⑤；含十分之一規則）。 */
export type DamageModifierRow = { sourceTag: string; targetTag: string; factor: number };
export type DamageModifiersFile = { rows: DamageModifierRow[] };
/** rules/morale-events.json：士氣檢定事件（rules-people §士氣）。SPEC-GAP：列形狀自選。 */
export type MoraleEventRow = { id: string; event: string; when?: Cond; dc: NumExpr; personTags?: string[]; immuneTags?: string[] };
export type MoraleEventsFile = { rows: MoraleEventRow[] };
/** rules/injuries.json：傷勢候選表（rules-people §傷勢）。SPEC-GAP：列形狀自選。 */
export type InjuryRow = { effect: Id; damageTypes: DamageType[]; layerTypes: LayerType[]; weight: number; permanent: boolean };
export type InjuriesFile = { rows: InjuryRow[] };

/** kind → Def 型別對照（loader／contentdb 用）。 */
export type DefByKind = {
  frame: FrameDef; bodyplan: BodyPlanDef; component: ComponentDef; ability: AbilityDef; effect: EffectDef;
  person: PersonDef; soultree: SoulTreeDef; terrain: TerrainDef; map: MapDef; faction: FactionDef;
  species: SpeciesDef; monster: MonsterDef; scenario: ScenarioDef; loot: LootDef; aiprofile: AiProfileDef; curve: CurveDef;
};
