import type { EventLog, GameEvent, EventType, EventPayload } from "./events.ts";

export function createLog(): EventLog {
  return { events: [] };
}

function isScalar(value: unknown): value is string | number {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

export function appendEvent(log: EventLog, e: { round: number; type: EventType; payload?: EventPayload; turn?: string }): GameEvent {
  const source = e.payload === undefined ? {} : e.payload;
  if (source === null || typeof source !== "object" || Array.isArray(source)) {
    throw new TypeError("payload 必須是物件");
  }
  const payload: EventPayload = Object.fromEntries(Object.entries(source).map(([key, value]) => {
    if (Array.isArray(value)) {
      const copy = Array.from(value);
      if (!copy.every(isScalar)) throw new TypeError(`payload.${key} 陣列只准字串或有限數字`);
      return [key, copy];
    }
    if (value !== null && typeof value !== "boolean" && !isScalar(value)) {
      throw new TypeError(`payload.${key} 的值不合法`);
    }
    return [key, value];
  }));
  const event: GameEvent = { seq: log.events.length, round: e.round, type: e.type, payload };
  if (e.turn !== undefined) event.turn = e.turn;
  log.events.push(event);
  return event;
}

export function canonicalJson(v: unknown): string {
  const ancestors = new Set<object>();
  function encode(value: unknown): string {
    if (value === null) return "null";
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new TypeError("JSON 不接受非有限數字");
      return JSON.stringify(value);
    }
    if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
    // SPEC-GAP：非 JSON 型別與循環引用拒絕；陣列 undefined／空洞沿用 JSON 的 null。
    if (typeof value !== "object") throw new TypeError("不支援的 JSON 值");
    if (ancestors.has(value)) throw new TypeError("JSON 不接受循環引用");
    ancestors.add(value);
    let result: string;
    if (Array.isArray(value)) {
      result = `[${Array.from(value, (item) => item === undefined ? "null" : encode(item)).join(",")}]`;
    } else {
      const object = value as Record<string, unknown>;
      const entries: string[] = [];
      for (const key of Object.keys(object).sort()) {
        const item = object[key];
        if (item !== undefined) entries.push(`${JSON.stringify(key)}:${encode(item)}`);
      }
      result = `{${entries.join(",")}}`;
    }
    ancestors.delete(value);
    return result;
  }
  return encode(v);
}

export function fnv1a64(s: string): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(s)) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

export function hashLog(log: EventLog): string {
  return fnv1a64(canonicalJson(log.events));
}

export function eventsOfType(log: EventLog, type: EventType): GameEvent[] {
  return log.events.filter((event) => event.type === type);
}

export function typeSequence(log: EventLog): string[] {
  return log.events.map((event) => event.type);
}
