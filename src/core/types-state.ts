// core/types-state — 執行期狀態型別（State＝會變、會存檔的資料）。
// BattleState 是純資料（可 structuredClone、可 JSON 化）：不放 Set／Map／BigInt／函式。
// 來源：architecture §狀態與事件、§存檔格式；data-model-{people,mech} 的 *State；ai.md §知識模型。

import type { Id, CellKey } from "./ids.ts";
import type {
  AttrId, PoolId, PartId, SlotId, SeatId, SeatRole, ControlMode, MoraleStage, Cell, Dir,
  FactionSlot, Contribution, EffectScope, LayerType,
} from "./types-def.ts";
import type { Grade, Objective } from "./types-def.ts";
import type { NumExpr } from "./types-def.ts";
import type { EventLog } from "./events.ts";

// ---------- RNG（core/rng 的 PCG32） ----------
/** PCG32 狀態：64 位元 state 與 inc 以 16 位小寫 hex 字串保存（BigInt 不能 JSON 化）。 */
export type RngState = { state: string; inc: string };

// ---------- 資源池（rules-resources-effects §資源池實例） ----------
export type PoolState = { cur: number; max: number; regen: number; band: number };   // max=Infinity 表無上限

// ---------- 效果實例 ----------
export type EffectOwner = { unit?: Id; person?: Id; part?: PartId; layer?: number; cell?: Cell; faction?: FactionSlot };
export type EffectInstance = {
  uid: number;                        // 戰鬥內遞增編號
  effect: Id; source: Id; scope: EffectScope; owner: EffectOwner;
  remaining: number | null;           // 時鐘剩餘；permanent／whileSource 為 null
  magnitude: number; stacks: number;
  params?: Record<string, number>;
  contribIds: string[];               // 本實例掛上的 Contribution.id，撤除時依此退回（TM-34）
};
/** 已分配 id 的貢獻（容器 contribs 裡存的形狀）。 */
export type ContributionInstance = Contribution & { id: string };

// ---------- 人物（data-model-people §PersonState） ----------
export type WillState = {
  burden: number;
  resonance: Record<Id, number>;
  soulTree?: { nodes: Id[]; research: number; companionship: number };
};
export type PersonState = {
  abilities?: Id[]; driveHours?: number; maxDrivenGrade?: Grade;
  id: Id;                             // SPEC-GAP：spec 的 PersonState 沒有 id 欄；BattleState.persons 以此為鍵
  def: Id; attrsBase: Record<AttrId, number>;
  contribs: ContributionInstance[]; pools: Record<PoolId, PoolState>;
  effects: EffectInstance[];
  morale: MoraleStage; will: WillState; xp: number; level: number;
  seat?: { mech: Id; role: SeatRole };
};

// ---------- 機甲實例（data-model-mech §MechState；怪獸也是 MechState） ----------
export type LayerState = { hp: number; broken: boolean; maxHp?: number };
export type PartState = { layers: LayerState[]; broken: boolean; components: Record<SlotId, Id | null> };
export type MechState = {
  aiBattles?: number;
  core: boolean; crew?: "ai" | "remote";
  id: Id; frame: Id; owner: FactionSlot; pos: Cell; facing?: Dir;
  parts: Record<PartId, PartState>;
  pools: Record<PoolId, PoolState>; contribs: ContributionInstance[]; effects: EffectInstance[];
  seats: Record<SeatId, Id | null>; controlMode: ControlMode; cooldowns: Record<Id, number>;
  sustained: Id[];
};

// ---------- 地圖、陣營、知識 ----------
export type MapState = {
  def: Id; width: number; height: number;
  terrain: Id[];                      // row-major，長度 width*height
  featureHp: Record<CellKey, number>;
};
export type FactionState = { faction: Id; retreated: Id[]; lost: Id[]; captured: Id[] };
export type LayerKnowledge = { type: LayerType; max: number; hp: number | null };   // null＝未偵察
/** SPEC-GAP：ai.md 的 visible 是 Set；為了 JSON 化改成排序過的 Id 陣列。 */
export type FactionKnowledge = {
  visible: Id[];
  lastSeen: Record<Id, { cell: Cell; round: number }>;
  revealed: Record<Id, Record<PartId, LayerKnowledge[]>>;
};

// ---------- 戰鬥狀態 ----------
export type BattleState = {
  round: number; order: Id[];
  units: Record<Id, MechState>; persons: Record<Id, PersonState>;
  map: MapState;
  factions: Record<FactionSlot, FactionState>;
  knowledge: Record<FactionSlot, FactionKnowledge>;
  rng: RngState;
  pending: EffectInstance[];
  log: EventLog;
  rt?: RulesRuntime;                  // rules 層的執行期簿記（lead-impl-rules 新增；createBattle 一定會填）
};

// ---------- rules 層執行期簿記（lead-impl-rules 新增；只放純資料） ----------
export type UnitStatus = "active" | "dead" | "retreated" | "derelict" | "captured";
export type BattleOutcome = { winner: FactionSlot | null; reason: string; detail?: "eliminated" | "repelled" };
export type RulesRuntime = {
  globals: { tide?: NumExpr; light?: number };
  allies: Record<FactionSlot, FactionSlot[]>;
  nextUid: number;                    // 下一個 EffectInstance.uid
  nextContrib: number;                // 下一個 contribution id 的序號（id = "c" + 序號）
  actionSeq: number;                  // 每次 tryCommand 成功 +1（reaction oncePer:"action" 用）
  active: Id | null;                  // 目前回合的單位
  acted: Id[]; waited: Id[]; waitUsed: Id[];   // 本輪已行動／Wait 到隊尾／本輪已用過 Wait
  reactUsed: Record<string, number>;  // reaction 觸發計數，鍵由 command.ts 定
  commander: Record<Id, Id | null>;   // 單位 → 本回合握指令權的人物（control.ts 寫）
  unitStatus: Record<Id, UnitStatus>;
  spawnParents?: Record<Id, Id>;     // spawn 子單位 → 母體；舊存檔可省略
  monsters: Record<Id, { species: Id; grade: Grade; def?: Id }>;   // 怪獸單位：MechState.frame 填 species id
  capturedMonsters?: Record<Id, Id>; // 捕捉轉換 frame 後仍保留 MonsterDef id
  moraleStreak: Record<Id, number>;   // 人物連續士氣檢定成功次數
  berserkFrom: Record<Id, FactionSlot>; // 失控單位的原 slot
  xpGained: Record<Id, number>;
  fieldEffects: EffectInstance[];     // scope = cell／faction／battle 的效果
  objectives: Objective[]; maxRounds: number | null; exits: Cell[]; noRetreat: boolean;
  outcome: BattleOutcome | null;
  holdProgress?: Record<string, { round: number; count: number }>;
};

// ---------- 指令（rules-turn-and-actions：Move | UseAbility | Wait | End | Eject | Retreat） ----------
export type Command =
  | { kind: "move"; actor: Id; path: Cell[] }
  | { kind: "useAbility"; actor: Id; ability: Id; target?: { unit?: Id; cell?: Cell; part?: PartId } }
  | { kind: "wait"; actor: Id }
  | { kind: "end"; actor: Id }
  | { kind: "eject"; actor: Id }
  | { kind: "retreat"; actor: Id };

// ---------- 存檔（architecture §存檔格式） ----------
export type SaveFile = {
  version: 1;
  contentPacks: { id: Id; version: string; hash: string }[];
  scenario: Id; seed: number;
  commands: Command[];
  snapshot?: BattleState;
  campaignBlob?: unknown;
};
