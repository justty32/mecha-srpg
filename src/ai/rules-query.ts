// ai/rules-query — AI 對規則層的唯一依賴介面（純型別，執行期為空）。
// AI 不 import src/rules/：真規則由 src/ai/adapters/rules-adapter.ts 包成 RulesQuery，
// 單元測試用 test/ai/stub-rules.ts 的替身。名稱照 spec 與 lead-impl-rules contract §5 的預覽／查詢函式命名
// （reachable、abilitiesOf、checkAbility、hitChance、previewCommand、hostile、unitAt、commanderOf…），
// 差別只在第一個參數：規則層收 Ctx {db, s}，這裡收 BattleState（db 由 adapter 閉包持有）。
// 凍結契約：lead-impl-ai 寫死；改簽名要同時改 adapter、stub 與全部呼叫點。

import type { Id, CellKey } from "../core/ids.ts";
import type { FactionSlot } from "../core/types-def.ts";
import type { AbilityDef, Cell, Grade, LayerDef, NumExpr, PartDef, PartId } from "../core/types-def.ts";
import type { BattleState, Command } from "../core/types-state.ts";
import type { GameEvent } from "../core/events.ts";

/** 與 rules 的 Rejection 結構相容（code 是 RejectCode 字串）。 */
export type QueryRejection = { code: string; detail?: string };
/** 與 rules 的 Result 結構相容。 */
export type QueryResult = { ok: true; events: GameEvent[] } | { ok: false; rejection: QueryRejection };
export type AbilityTarget = { unit?: Id; cell?: Cell; part?: PartId };

export interface RulesQuery {
  /** 在單次唯讀決策內重用查詢；snapshot 一旦改動，呼叫端必須丟棄此查詢器。 */
  forSnapshot?(snapshot: BattleState): RulesQuery;
  /** AI 估值用的獨立副本；日誌可只保留規則會讀取的歷史，新事件序號不變。 */
  predictionState?(s: BattleState): BattleState;
  // ---------- 地圖與單位（唯讀） ----------
  inBounds(s: BattleState, cell: Cell): boolean;
  /** Chebyshev 距離（8 方向）。 */
  distance(a: Cell, b: Cell): number;
  /** 該格的單位（含 derelict；不含 dead／retreated／captured）。 */
  unitAt(s: BattleState, cell: Cell): Id | null;
  isActive(s: BattleState, unitId: Id): boolean;
  /** owner 不同即敵對；owner "berserk" 對誰都敵對。 */
  hostile(s: BattleState, a: Id, b: Id): boolean;
  hostileSlots?(s: BattleState, a: FactionSlot, b: FactionSlot): boolean;
  commanderOf(s: BattleState, unitId: Id): Id | null;
  /** 兩格中心連線不被地形擋（不含兩端；單位不擋線）。 */
  los(s: BattleState, from: Cell, to: Cell): boolean;
  /** 感測半徑（格，Chebyshev）：指令權者 perception（含感測部件 contribs），無人用機體值。 */
  perception(s: BattleState, unitId: Id): number;
  unitGrade(s: BattleState, unitId: Id): Grade;
  unitTags(s: BattleState, unitId: Id): string[];
  /** 物種既有行為與 profile 數值；只查己方單位，不擴充內容 schema。 */
  speciesIntent?(s: BattleState, unitId: Id): { behaviors: string[]; params: Record<string, number> } | undefined;
  /** body plan 的部位，依宣告順序（公開情報）。 */
  partDefs(s: BattleState, unitId: Id): PartDef[];
  /** 實際層序列；與 MechState.parts[partId].layers 一一對應（公開情報：種類、順序、最大 HP）。 */
  layerDefs(s: BattleState, unitId: Id, partId: PartId): LayerDef[];

  // ---------- 移動 ----------
  /** AP 內可達格 → 成本（不含起點；無副作用）。 */
  reachable(s: BattleState, unitId: Id): Record<CellKey, number>;
  /** 到 to 的最便宜路徑，不含起點、含終點；不可達＝null。直接放進 Command move 的 path。 */
  pathTo(s: BattleState, unitId: Id, to: Cell): Cell[] | null;

  // ---------- 能力 ----------
  /** innateAbilities ∪ 未毀部件的 abilities，排序去重。 */
  abilitiesOf(s: BattleState, unitId: Id): Id[];
  abilityDef(abilityId: Id): AbilityDef;
  /** target.range 以 unitId 為 self 求值。 */
  abilityRange(s: BattleState, unitId: Id, abilityId: Id): { min: number; max: number };
  /** 行動入口 ①②③（含成本、冷卻、射程、LOS），無副作用；合法＝null。 */
  checkAbility(s: BattleState, unitId: Id, abilityId: Id, target?: AbilityTarget): QueryRejection | null;
  /** 命中率（0..100，與 d100 比較）。 */
  hitChance(s: BattleState, actor: Id, abilityId: Id, target: Id, part?: PartId): number;
  /** 以 self（與可選 target）為主體求值 NumExpr（例：ability.ai.tactics 的權重）。 */
  evalNum(s: BattleState, expr: NumExpr, self: Id, target?: Id): number;

  // ---------- 預覽 ----------
  /** 在 s 的複本上跑同一條行動入口；s 不變。state＝跑完後的複本。 */
  previewCommand(s: BattleState, cmd: Command): { result: QueryResult; state: BattleState };
}

/** 執行指令（sim 或測試提供；真規則＝tryCommand，就地改 s）。AI 只透過它下指令。 */
export type ExecCommand = (s: BattleState, cmd: Command) => QueryResult;
