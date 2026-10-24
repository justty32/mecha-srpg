import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPacks, readPackDir } from "../content/loader.ts";
import type { EffectDef, StackPolicy } from "../core/types-def.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import { makeUnit, newRuntime, person, rt } from "./state.ts";
import type { Ctx } from "./state.ts";
import { personAttr } from "./contribs.ts";
import { applyEffect, consumeUse, effectsOf, hasEffectTag, removeBySource, removeByTags, removeEffect, tickEffects } from "./effects.ts";

function setup(overrides: Partial<EffectDef> = {}): Ctx {
  const pack = readPackDir("content/base");
  pack.files["effects/probe.json"] = { id: "effect/probe", name: "測試", scope: "person", clock: { kind: "ownerTurns", n: 2 },
    stack: { policy: "refresh" }, contribs: [], hooks: {}, tags: ["probe"], ui: { badge: "測試" }, ...overrides };
  const { db, errors } = loadPacks([pack, readPackDir("test/scenarios/pack")]); assert.deepEqual(errors, []);
  const ctx: Ctx = { db, s: { round: 0, order: [], units: {}, persons: {},
    map: { def: "test", width: 1, height: 1, terrain: [], featureHp: {} }, factions: {}, knowledge: {},
    rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
  makeUnit(ctx, { id: "u", owner: "a", pos: { x: 0, y: 0 }, frame: "frame/hound-mk2",
    persons: [{ id: "p", def: "person/ren-kasai", seat: "pilot" }, { id: "s", def: "person/unit-07", seat: "soul" }] });
  return ctx;
}

test("DC-T05 五種疊加政策表格，merge 三運算與 perPartSeparate", () => {
  const cases: { policy: StackPolicy; count: number; remaining: number; magnitude: number }[] = [
    { policy: "refresh", count: 1, remaining: 2, magnitude: 3 },
    { policy: "stack", count: 2, remaining: 1, magnitude: 3 },
    { policy: "merge", count: 1, remaining: 1, magnitude: 9 },
    { policy: "ignore", count: 1, remaining: 1, magnitude: 3 },
    { policy: "separate", count: 3, remaining: 1, magnitude: 3 },
  ];
  for (const row of cases) {
    const ctx = setup({ stack: { policy: row.policy, max: 2, mergeOp: "sumMag" }, magnitude: 3 });
    const a = applyEffect(ctx, "effect/probe", { person: "p" }, "one")!; a.remaining = 1;
    applyEffect(ctx, "effect/probe", { person: "p" }, "two"); applyEffect(ctx, "effect/probe", { person: "p" }, "three");
    assert.equal(effectsOf(ctx, { person: "p" }).length, row.count);
    assert.equal(a.remaining, row.remaining); assert.equal(a.magnitude, row.magnitude);
  }
  for (const mergeOp of ["sumDur", "maxMag"] as const) {
    const ctx = setup({ stack: { policy: "merge", mergeOp }, magnitude: 3 });
    const a = applyEffect(ctx, "effect/probe", { person: "p" }, "one")!;
    a.magnitude = 5; applyEffect(ctx, "effect/probe", { person: "p" }, "two");
    assert.equal(a.remaining, mergeOp === "sumDur" ? 4 : 2); assert.equal(a.magnitude, 5);
  }
  const ctx = setup({ scope: "part", perPartSeparate: true });
  applyEffect(ctx, "effect/probe", { unit: "u", part: "left-arm" }, "one");
  applyEffect(ctx, "effect/probe", { unit: "u", part: "right-arm" }, "one");
  assert.equal(effectsOf(ctx, { unit: "u" }).length, 2);
  assert.equal(effectsOf(ctx, { unit: "u", part: "left-arm" }).length, 1);
});

test("part scope 未給 part 時 owner 省略該鍵，事件仍記 null", () => {
  const ctx = setup({ scope: "part" });
  const inst = applyEffect(ctx, "effect/probe", { unit: "u" }, "a")!;
  assert.equal(Object.hasOwn(inst.owner, "part"), false);
  assert.deepEqual(inst.owner, { unit: "u" });
  assert.deepEqual(structuredClone(inst), JSON.parse(JSON.stringify(inst)));
  assert.deepEqual(ctx.s.log.events.at(-1)!.payload, {
    uid: inst.uid, effect: inst.effect, owner: "u", part: null, source: "a",
  });
});

test("layer scope 未給 layer 時 owner 省略該鍵並保留 part", () => {
  const ctx = setup({ scope: "layer" });
  const inst = applyEffect(ctx, "effect/probe", { unit: "u", part: "left-arm" }, "a")!;
  assert.equal(Object.hasOwn(inst.owner, "layer"), false);
  assert.deepEqual(inst.owner, { unit: "u", part: "left-arm" });
  assert.deepEqual(structuredClone(inst), JSON.parse(JSON.stringify(inst)));
  assert.deepEqual(ctx.s.log.events.at(-1)!.payload, {
    uid: inst.uid, effect: inst.effect, owner: "u", part: "left-arm", source: "a",
  });
});

test("DC-T04 ownerTurns 只遞減目標時鐘、到零撤除並回復貢獻", () => {
  const ctx = setup({ contribs: [{ path: "self.attrs.resolve", op: "add", value: -8, source: "probe" }],
    hooks: { onApply: [{ do: "emit", event: "AppliedHook" }], onExpire: [{ do: "emit", event: "ExpiredHook" }] } });
  const a = applyEffect(ctx, "effect/probe", { person: "p" }, "one")!;
  applyEffect(ctx, "effect/probe", { person: "s" }, "two");
  assert.equal(personAttr(ctx, "p", "resolve"), 40);
  tickEffects(ctx, "rounds", { person: "p" }); assert.equal(a.remaining, 2);
  tickEffects(ctx, "ownerTurns", { person: "p" }); assert.equal(a.remaining, 1);
  tickEffects(ctx, "ownerTurns", { person: "p" }); assert.equal(personAttr(ctx, "p", "resolve"), 48);
  assert.equal(effectsOf(ctx, { person: "p" }).length, 0); assert.equal(effectsOf(ctx, { person: "s" })[0]!.remaining, 2);
  assert.deepEqual(ctx.s.log.events.at(-1)!.payload, { uid: a.uid, effect: "base:effect/probe", owner: "p", reason: "expired" });
  assert.deepEqual(ctx.s.log.events.slice(0, 2).map(e => e.type), ["AppliedHook", "EffectApplied"]);
  assert.equal(ctx.s.log.events.at(-2)!.type, "ExpiredHook");
});

test("DC-T05 whileSource 不隨時間消失，來源撤除只退自己的 contribIds", () => {
  const ctx = setup({ clock: { kind: "whileSource" }, stack: { policy: "separate" },
    contribs: [{ path: "self.attrs.accuracy", op: "add", value: 4, source: "probe" }] });
  const a = applyEffect(ctx, "effect/probe", { person: "p" }, "a")!;
  applyEffect(ctx, "effect/probe", { person: "p" }, "b");
  tickEffects(ctx, "ownerTurns", { person: "p" }); tickEffects(ctx, "rounds", { person: "p" });
  assert.equal(a.remaining, null); assert.equal(personAttr(ctx, "p", "accuracy"), 63);
  assert.equal(person(ctx, "p").contribs[0]!.source, `fx:${a.uid}`);
  assert.equal(removeBySource(ctx, "a"), 1); assert.equal(personAttr(ctx, "p", "accuracy"), 59);
  assert.equal(removeBySource(ctx, "a"), 0); assert.equal(removeEffect(ctx, a.uid, "again"), false);
});

test("immuneTags、chance 與 save 抵抗不安裝效果", () => {
  const immune = setup({ immuneTags: ["soul"] });
  assert.equal(applyEffect(immune, "effect/probe", { person: "s" }, "a"), null);
  assert.ok(applyEffect(immune, "effect/probe", { person: "p" }, "a"));
  const ctx = setup();
  assert.equal(applyEffect(ctx, { effect: "effect/probe", chance: 0 }, { person: "p" }, "a"), null);
  assert.ok(applyEffect(ctx, { effect: "effect/probe", chance: 1 }, { person: "p" }, "a"));
  const saved = setup({ save: { attr: "resolve", dc: -100 } });
  assert.equal(applyEffect(saved, "effect/probe", { person: "p" }, "a"), null);
  assert.equal(rt(saved.s).nextUid, 0); assert.equal(saved.s.log.events.length, 0);
});

test("field scope 統一 rounds，cell/faction 查詢及 layer 容器", () => {
  for (const scope of ["cell", "faction", "battle"] as const) {
    const ctx = setup({ scope, clock: { kind: "permanent", n: 2 } });
    const target = scope === "cell" ? { cell: { x: 0, y: 0 } } : scope === "faction" ? { faction: "a" } : {};
    const a = applyEffect(ctx, "effect/probe", target, "a")!;
    assert.equal(rt(ctx.s).fieldEffects.length, 1); assert.equal(effectsOf(ctx, target).length, 1);
    if (scope === "cell") assert.equal(effectsOf(ctx, { cell: { x: 1, y: 0 } }).length, 0);
    if (scope === "faction") assert.equal(effectsOf(ctx, { faction: "b" }).length, 0);
    tickEffects(ctx, "ownerTurns", "field"); assert.equal(a.remaining, 2);
    tickEffects(ctx, "rounds", "field"); tickEffects(ctx, "rounds", "field"); assert.equal(rt(ctx.s).fieldEffects.length, 0);
    assert.equal(ctx.s.log.events[0]!.payload.owner, "field");
  }
  const ctx = setup({ scope: "layer" });
  applyEffect(ctx, "effect/probe", { unit: "u", part: "left-arm", layer: 0 }, "a");
  assert.equal(effectsOf(ctx, { unit: "u", part: "left-arm", layer: 0 }).length, 1);
  assert.equal(effectsOf(ctx, { unit: "u", part: "left-arm", layer: 1 }).length, 0);
});

test("params 求值、uses 消費及 tags 清除永久效果", () => {
  const ctx = setup({ clock: { kind: "uses", n: 2 } });
  const a = applyEffect(ctx, { effect: "effect/probe", params: { amount: { ref: "self.attrs.resolve" } } }, { unit: "u", person: "p" }, "a")!;
  assert.deepEqual(a.params, { amount: 48 }); assert.equal(hasEffectTag(ctx, { person: "p" }, "probe"), true);
  consumeUse(ctx, a.uid); assert.equal(a.remaining, 1);
  consumeUse(ctx, a.uid); assert.equal(hasEffectTag(ctx, { person: "p" }, "probe"), false);
  const permanent = setup({ clock: { kind: "permanent" } });
  applyEffect(permanent, "effect/probe", { person: "p" }, "a");
  assert.equal(removeByTags(permanent, { person: "p" }, ["missing"]), 0);
  assert.equal(removeByTags(permanent, { person: "p" }, ["probe"]), 1);
});
