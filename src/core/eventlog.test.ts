import { test } from "node:test";
import assert from "node:assert/strict";
import type { EventPayload } from "./events.ts";
import { createLog, appendEvent, canonicalJson, fnv1a64, hashLog, eventsOfType, typeSequence } from "./eventlog.ts";
import { createRng, d100 } from "./rng.ts";

test("createLog 建立獨立空日誌，appendEvent 的 seq 連續", () => {
  const log = createLog();
  assert.deepEqual(log, { events: [] });
  const first = appendEvent(log, { round: 1, type: "RoundStart" });
  const second = appendEvent(log, { round: 1, type: "Hit", turn: "unit-a" });
  assert.deepEqual(first, { seq: 0, round: 1, type: "RoundStart", payload: {} });
  assert.equal(Object.hasOwn(first, "turn"), false);
  assert.equal(second.seq, 1);
  assert.equal(second.turn, "unit-a");
  assert.strictEqual(log.events[1], second);
  assert.deepEqual(createLog().events, []);
});

test("appendEvent 複製 payload 與陣列，允許所有契約值", () => {
  const log = createLog();
  const payload: EventPayload = { id: "unit-a", roll: 3, hit: true, target: null, parts: ["arm", 2] };
  const event = appendEvent(log, { round: 1, type: "Hit", payload });
  assert.deepEqual(event.payload, payload);
  assert.notStrictEqual(event.payload, payload);
  assert.notStrictEqual(event.payload.parts, payload.parts);
  payload.roll = 99;
  (payload.parts as (string | number)[]).push("leg");
  assert.equal(event.payload.roll, 3);
  assert.deepEqual(event.payload.parts, ["arm", 2]);
  const special = appendEvent(log, { round: 1, type: "Hit", payload: JSON.parse('{"__proto__":"id"}') });
  assert.equal(Object.hasOwn(special.payload, "__proto__"), true);
});

test("appendEvent 拒絕巢狀物件與非法 payload，失敗不追加事件", () => {
  const log = createLog();
  for (const value of [{ nested: 1 }, [true], [null], [[1]], [Infinity], Infinity, NaN, undefined]) {
    assert.throws(() => appendEvent(log, {
      round: 1, type: "Hit", payload: { value } as unknown as EventPayload,
    }), TypeError);
  }
  assert.deepEqual(log.events, []);
});

test("canonicalJson 遞迴鍵序無關，UTF-16 排序也適用數字形狀的鍵", () => {
  const a = { z: [{ b: 2, a: 1 }], a: { y: true, x: null }, omitted: undefined };
  const b = { a: { x: null, y: true }, z: [{ a: 1, b: 2 }] };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(canonicalJson(a), '{"a":{"x":null,"y":true},"z":[{"a":1,"b":2}]}');
  assert.equal(canonicalJson({ "2": 2, "10": 10, "😀": 1, "\ue000": 2 }), '{"10":10,"2":2,"😀":1,"\ue000":2}');
  assert.equal(canonicalJson({ text: 'a\n"b', zero: -0 }), '{"text":"a\\n\\"b","zero":0}');
});

test("canonicalJson 拒絕非有限數字與循環，保留合法共用子物件", () => {
  for (const value of [NaN, Infinity, -Infinity, { value: Infinity }, [NaN]]) {
    assert.throws(() => canonicalJson(value), TypeError);
  }
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  assert.throws(() => canonicalJson(cycle), TypeError);
  const shared = { a: 1 };
  assert.equal(canonicalJson([shared, shared]), '[{"a":1},{"a":1}]');
  assert.equal(canonicalJson([undefined, , null]), '[null,null,null]');
});

test("fnv1a64 的空字串與 a 符合指定向量，非 ASCII 使用 UTF-8", () => {
  assert.equal(fnv1a64(""), "cbf29ce484222325");
  assert.equal(fnv1a64("a"), "af63dc4c8601ec8c");
  let expected = 0xcbf29ce484222325n;
  // é 的 UTF-8 位元組為 c3 a9，與 UTF-16 碼元 e9 不同。
  for (const byte of [0xc3, 0xa9]) expected = ((expected ^ BigInt(byte)) * 0x100000001b3n) & 0xffffffffffffffffn;
  assert.equal(fnv1a64("é"), expected.toString(16).padStart(16, "0"));
});

test("eventsOfType 與 typeSequence 保留事件順序，hashLog 雜湊 events", () => {
  const log = createLog();
  const first = appendEvent(log, { round: 1, type: "Hit" });
  appendEvent(log, { round: 1, type: "Miss" });
  const last = appendEvent(log, { round: 2, type: "Hit" });
  assert.deepEqual(eventsOfType(log, "Hit"), [first, last]);
  assert.deepEqual(eventsOfType(log, "Moved"), []);
  assert.deepEqual(typeSequence(log), ["Hit", "Miss", "Hit"]);
  assert.equal(hashLog(log), fnv1a64(canonicalJson(log.events)));
});

test("決定性：seed 7 重跑二十次 Hit 的 hash 相同，seed 8 不同", () => {
  function run(seed: number): string {
    const rng = createRng(seed);
    const log = createLog();
    for (let i = 0; i < 20; i++) {
      appendEvent(log, { round: 1 + Math.floor(i / 5), type: "Hit", payload: { roll: d100(rng) } });
    }
    return hashLog(log);
  }
  assert.equal(run(7), run(7));
  assert.notEqual(run(7), run(8));
});
