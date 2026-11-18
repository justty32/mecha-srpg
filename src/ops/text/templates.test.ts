import { test } from "node:test";
import assert from "node:assert/strict";
import { interpolate, eventLog, eventsLog, filterLogEvents, templateEntries } from "./templates.ts";
import { EVENT_TYPES } from "../state/events.ts";
import { createWorldDB } from "../content/worlddb.ts";
import { fixture } from "./fixtures.ts";

test("templates：巢狀插值、零值與事件名稱", () => {
  assert.equal(interpolate("{a.b}：{zero}/{missing}/{a.__proto__}", { a: { b: "潮" }, zero: 0 }), "潮：0//");
  const { state, world } = fixture();
  const row = eventLog({ seq: 0, day: 3, type: "WagePaid", payload: { person: "person-1", amount: 20 } }, state, world);
  assert.match(row.text, /阿九/); assert.match(row.text, /20/); assert.equal(row.kind, "money");
});
test("templates：每個 EVENT_TYPES 都有可渲染模板且五種 kind 齊全", () => {
  const { state, world } = fixture(), entries = templateEntries(world);
  for (const type of EVENT_TYPES) { assert.ok(entries[type], type); assert.ok(eventLog({ seq: 0, day: 0, type, payload: {} }, state, world).text.length); }
  assert.deepEqual([...new Set(Object.values(entries).map(t => t.kind))].sort(), ["blood", "info", "money", "soul", "warn"]);
});

test("eventsLog：只合併同日連續行動訊號，先合併再限行且原始歷史不變", () => {
  const { state, world } = fixture();
  const types = ["WagePaid", "ActorSpawned", "ActorSpawned", "DayStart", "ActorSpawned", "ActorSpawned", "ActorSpawned"];
  const events = types.map((type, seq) => ({ seq, day: seq === 6 ? 2 : 1, type, payload: {} }));
  const before = structuredClone(events), rows = eventsLog(events, state, world);
  assert.deepEqual(rows, [eventLog(events[0]!, state, world),
    { day: 1, text: "天網收到 2 則行動訊號。", kind: "info" }, eventLog(events[3]!, state, world),
    { day: 1, text: "天網收到 2 則行動訊號。", kind: "info" }, eventLog(events[6]!, state, world)]);
  assert.deepEqual(eventsLog(events, state, world, 3), rows.slice(-3));
  assert.deepEqual(eventsLog(events, state, world, 0), []);
  assert.deepEqual(events, before);
  const flood = Array.from({ length: 250 }, (_, seq) => ({ seq: seq + 1, day: 1, type: "ActorSpawned", payload: {} }));
  assert.deepEqual(eventsLog([events[0]!, ...flood], state, world, 2), [rows[0],
    { day: 1, text: "天網收到 250 則行動訊號。", kind: "info" }]);
});

test("eventsLog：背景情報各自摘要，警報、戰果、劇情與契約期限逐筆保留", () => {
  const { state, world } = fixture();
  const types = ["Sighted", "Sighted", "EncounterOffered", "Sighted", "WorldAction", "WorldAction",
    "BattleResolved", "WorldAction", "ContractOffered", "ContractOffered", "ContractExpired", "EventOffered", "ContractOffered"];
  const events = types.map((type, seq) => ({ seq, day: 1, type, payload: { actor: "person-1", node: "base:place/dhaka" } }));
  const before = structuredClone(events), rows = eventsLog(events, state, world);
  assert.deepEqual(rows, [
    { day: 1, text: "瞭望員回報 2 則附近隊伍目擊情報，可到世界圖查看。", kind: "info" },
    eventLog(events[2]!, state, world), eventLog(events[3]!, state, world),
    { day: 1, text: "天網收到 2 則勢力動向。", kind: "info" },
    eventLog(events[6]!, state, world), eventLog(events[7]!, state, world),
    { day: 1, text: "艦橋收到 2 份新契約，可到「契約」頁籤查看地點、報酬與期限。", kind: "info" },
    eventLog(events[10]!, state, world), eventLog(events[11]!, state, world), eventLog(events[12]!, state, world),
  ]);
  assert.match(rows[2]!.text, /阿九/);
  assert.equal(rows[5]!.text, templateEntries(world).WorldAction!.text);
  assert.match(rows[9]!.text, /達卡/);
  assert.deepEqual(eventsLog(events, state, world, 4), rows.slice(-4));
  assert.deepEqual(events, before);
  for (const type of ["Sighted", "WorldAction", "ContractOffered"]) {
    const split = [{ seq: 0, day: 1, type, payload: {} }, { seq: 1, day: 2, type, payload: {} }];
    assert.deepEqual(eventsLog(split, state, world), split.map(event => eventLog(event, state, world)));
  }
});

test("網頁通知：地圖日常全分類排除，先按分類篩選再限制200行", () => {
  const { state, world } = fixture();
  const types = ["EventOffered", "EncounterOffered", "ContractContested", "Arrived", "Plundered", "LostMech", "MechSeized", "WageOwed", "DebtArrears", "TravelBlocked", "BattleResolved", "ContractOffered", "ContractOffered"];
  const important = types.map((type, seq) => ({ seq, day: 1, type, payload: {} }));
  const flood = Array.from({ length: 250 }, (_, i) => ({ seq: i + types.length, day: 1, type: ["ActorSpawned", "Sighted", "ActorDespawned", "WorldAction"][i % 4]!, payload: {} }));
  const events = [...important, ...flood], before = structuredClone(events);
  for (const filter of ["important", "contracts", "money", "crew", "world", "all"] as const) {
    assert.ok(!filterLogEvents(events, state, filter, world).some(e => flood.includes(e)));
  }
  const selected = filterLogEvents(events, state, "important", world);
  assert.deepEqual(selected, important);
  assert.equal(eventsLog(selected, state, world, 200).length, types.length - 1);
  assert.deepEqual(filterLogEvents(events, state, "money", world).map(e => e.type), ["Plundered", "MechSeized", "WageOwed", "DebtArrears"]);
  assert.deepEqual(filterLogEvents(events, state, "contracts", world).map(e => e.type), ["ContractContested", "ContractOffered", "ContractOffered"]);
  assert.deepEqual(events, before);
});

test("網頁通知：帳務與世界分類可查日常紀錄，重點保留已接約後續及未知警報", () => {
  const { state, world: source } = fixture();
  const templates = structuredClone(source.all("templates"));
  const entries = templates.find(def => def.id === "base:templates/default")!.entries;
  entries.WorldNewDanger = { kind: "warn", text: "新危機。" };
  entries.WorldNewInfo = { kind: "info", text: "一般消息。" };
  const world = createWorldDB(source.packs, { templates: Object.fromEntries(templates.map(def => [def.id, def])) });
  const events = [
    { seq: 0, day: 1, type: "ContractAccepted", payload: { contract: "taken" } },
    { seq: 1, day: 1, type: "ContractExpired", payload: { contract: "taken" } },
    { seq: 2, day: 1, type: "ContractExpired", payload: { contract: "offered" } },
    { seq: 3, day: 1, type: "WagePaid", payload: {} },
    { seq: 4, day: 1, type: "WorldNewDanger", payload: {} },
    { seq: 5, day: 1, type: "WarDeclared", payload: { a: "distant", b: "other" } },
    { seq: 6, day: 1, type: "OperationFailed", payload: { player: 1 } },
    { seq: 7, day: 1, type: "WorldNewInfo", payload: {} },
    { seq: 8, day: 1, type: "Posted", payload: {} },
    { seq: 9, day: 1, type: "WagePaid", payload: { person: "person-1" } },
  ];
  assert.deepEqual(filterLogEvents(events, state, "important", world).map(e => e.seq), [0, 1, 4, 6, 9]);
  assert.deepEqual(filterLogEvents(events, state, "contracts", world).map(e => e.seq), [0, 1, 2]);
  assert.deepEqual(filterLogEvents(events, state, "money", world).map(e => e.seq), [3, 9]);
  assert.deepEqual(filterLogEvents(events, state, "world", world).map(e => e.seq), [5, 6]);
  assert.deepEqual(filterLogEvents(events, state, "all", world).map(e => e.seq), [0, 1, 2, 3, 4, 5, 6, 7, 9]);
});

function storyFixture(custom = false) {
  const { state, world: source } = fixture(), templates = structuredClone(source.all("templates"));
  if (custom) Object.assign(templates.find(def => def.id === "base:templates/default")!.entries, {
    EventOffered: { text: "自訂提示。", kind: "info" }, Chosen: { text: "自訂選擇。", kind: "info" },
  });
  const def = { ...source.all("event")[0]!, id: "base:event/recap-test", text: "終端傳來債主的聲音。",
    choices: [{ text: "確認欠款。", effects: [], next: "base:event/secret-next", requires: { tag: "secret-requirement" } }] };
  const world = createWorldDB(source.packs, { templates: Object.fromEntries(templates.map(t => [t.id, t])), event: { [def.id]: def } });
  const event = (type: string, seq: number, payload: Record<string, unknown> = { event: def.id, choice: 1 }) => ({ type, seq, day: 0, payload });
  return { state, world, def, event };
}

test("劇情記錄：已答事件在重點只留具體選擇，全部保留已揭露正文，未答提示保留", () => {
  const { state, world, def, event } = storyFixture();
  const offered = event("EventOffered", 0), chosen = event("Chosen", 1), waiting = event("EventOffered", 2);
  const events = [offered, chosen, waiting], before = structuredClone(events);
  assert.deepEqual(filterLogEvents(events, state, "important", world), [chosen, waiting]);
  assert.deepEqual(filterLogEvents(events, state, "all", world), events);
  assert.deepEqual(eventsLog(events, state, world).map(row => row.text), [def.text, "你選擇：確認欠款。", def.text]);
  assert.deepEqual(events, before);
  assert.ok(!JSON.stringify(eventsLog(events, state, world)).includes("secret"));
});

test("劇情記錄：重複事件逐次配對；同時重複、缺id、非法choice都保留備援", () => {
  const { state, world, def, event } = storyFixture();
  const repeated = [event("EventOffered", 0), event("Chosen", 1), event("EventOffered", 2), event("Chosen", 3)];
  assert.deepEqual(filterLogEvents(repeated, state, "important", world), [repeated[1], repeated[3]]);
  const ambiguous = [event("EventOffered", 0), event("EventOffered", 1), event("Chosen", 2)];
  assert.deepEqual(filterLogEvents(ambiguous, state, "important", world), ambiguous);
  for (const payload of [{ choice: 1 }, { event: "event/missing", choice: 1 }, { event: def.id, choice: 0 },
    { event: def.id, choice: 1.5 }, { event: def.id, choice: 2 }, { event: def.id, choice: "1" }]) {
    const events = [event("EventOffered", 0), event("Chosen", 1, payload)];
    assert.deepEqual(filterLogEvents(events, state, "important", world), events);
    assert.equal(eventLog(events[1]!, state, world).text, "你做了決定，船上的人照做。");
  }
  const uncertain = [event("EventOffered", 0), event("Chosen", 1, { choice: 1 }), event("Chosen", 2)];
  assert.deepEqual(filterLogEvents(uncertain, state, "important", world), uncertain, "缺少id的舊回答後不可猜配後來回答");
  const missing = event("EventOffered", 0, {});
  assert.equal(eventLog(missing, state, world).text, "有件事等你拍板。");
});

test("劇情記錄：自訂事件模板不被替換或合併", () => {
  const { state, world, event } = storyFixture(true), events = [event("EventOffered", 0), event("Chosen", 1)];
  assert.deepEqual(filterLogEvents(events, state, "important", world), events);
  assert.deepEqual(eventsLog(events, state, world).map(row => row.text), ["自訂提示。", "自訂選擇。"]);
});

test("啟航通知：保留起訖確認而不重複舊估時，自訂包模板仍可使用原始days", () => {
  const { state, world } = fixture();
  const event = { seq: 0, day: 0, type: "Sailed", payload: { node: "base:place/dhaka", to: "base:place/chittagong", days: 4 } };
  const before = structuredClone(event), row = eventLog(event, state, world);
  assert.equal(row.text, "候鳥號離開達卡，船頭轉向吉大港。");
  assert.ok(!row.text.includes("4"));
  const templates = Object.fromEntries(world.all("templates").map(def => [def.id, def]));
  const custom = createWorldDB([...world.packs, { id: "custom", version: "0.1.0", depends: ["base"] }], { templates: {
    ...templates, "custom:templates/sailing": { id: "custom:templates/sailing", entries: { Sailed: { text: "自訂航程：{days} 天。", kind: "info" } } },
  } });
  assert.equal(eventLog(event, state, custom).text, "自訂航程：4 天。");
  assert.deepEqual(event, before);
});
