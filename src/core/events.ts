// core/events — 事件型別（architecture §狀態與事件）。
// 每個狀態變化對應一個事件；payload 只放 id 與數字（文字在 ui-adapter 組）。
// 事件型別是開放字串（HookAction "emit" 可發自訂事件），EVENT_TYPES 列出引擎內建的名字。

import type { Id } from "./ids.ts";

export const EVENT_TYPES = [
  "BattleStart", "BattleEnd", "RoundStart", "RoundEnd", "TurnStart", "TurnEnd",
  "PoolChanged", "LayerDamaged", "LayerBroken", "PartBroken", "EffectApplied", "EffectExpired",
  "Moved", "AbilityUsed", "Hit", "Miss", "Conducted", "MoraleChanged", "ControlChanged",
  "UnitDied", "Retreated", "Ejected", "Captured", "IntentDeclared", "IntentChanged",
] as const;
export type BuiltinEventType = (typeof EVENT_TYPES)[number];
export type EventType = BuiltinEventType | (string & {});

/** payload 值：id（字串）、有限數字、布林、null，或它們的扁平陣列。不允許巢狀物件。 */
export type PayloadValue = string | number | boolean | null | (string | number)[];
export type EventPayload = Record<string, PayloadValue>;

/** spec 名稱為 Event；為避免與 DOM 全域 Event 混淆，主名用 GameEvent，另匯出別名 Event。 */
export type GameEvent = { seq: number; round: number; turn?: Id; type: EventType; payload: EventPayload };
export type Event = GameEvent;

/** 事件日誌：純資料（可 structuredClone／JSON），存在 BattleState.log。操作函式在 eventlog.ts。 */
export type EventLog = { events: GameEvent[] };
