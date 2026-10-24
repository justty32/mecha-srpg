import type { BattleState } from "./types-state.ts";
import type { GameEvent } from "./events.ts";

/** 日誌 payload 只有純量與扁平陣列，直接複製可省去通用序列化成本。 */
export function cloneBattleState(s: BattleState, keepHistory?: (event: GameEvent) => boolean): BattleState {
  const seen = new Map<object, unknown>();
  function clone<T>(value: T): T {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value) as T;
    const result = (Array.isArray(value) ? new Array(value.length) : {}) as Record<string, unknown>;
    seen.set(value, result);
    for (const key of Object.keys(value)) {
      const child = clone((value as Record<string, unknown>)[key]);
      if (key === "__proto__") Object.defineProperty(result, key, { value: child, writable: true, enumerable: true, configurable: true });
      else result[key] = child;
    }
    return result as T;
  }
  // 狀態契約只允許純資料；保留內部別名、Infinity 與 undefined。
  const copy = clone({ ...s, log: { ...s.log, events: [] as GameEvent[] } });
  const history = keepHistory ? s.log.events.filter(keepHistory) : s.log.events;
  if (keepHistory) copy.log.seqOffset = (s.log.seqOffset ?? 0) + s.log.events.length - history.length;
  copy.log.events = history.map(event => {
    const payload = { ...event.payload };
    for (const key of Object.keys(payload)) {
      const value = payload[key];
      if (Array.isArray(value)) payload[key] = value.slice();
    }
    return { ...event, payload };
  });
  return copy;
}
