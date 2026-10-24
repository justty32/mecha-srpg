import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPacks, readPackDir } from "../content/loader.ts";
import type { EffectDef, HookAction } from "../core/types-def.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import { makeUnit, newRuntime, person, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { applyEffect, effectsOf } from "./effects.ts";
import { commandHandler, dispatchHook, onSignal, registerCommand, registerVerb, runActions, signal } from "./hooks.ts";

function effect(name: string, overrides: Partial<EffectDef> = {}): EffectDef {
  return { id: `effect/${name}`, name, scope: "mech", clock: { kind: "permanent" }, stack: { policy: "separate" },
    contribs: [], hooks: {}, tags: ["probe"], ui: { badge: name }, ...overrides };
}
function setup(defs: EffectDef[] = []): Ctx {
  const pack = readPackDir("content/base");
  for (const def of defs) pack.files[`effects/${def.id.split("/")[1]}.json`] = def;
  const { db, errors } = loadPacks([pack, readPackDir("test/scenarios/pack")]); assert.deepEqual(errors, []);
  const ctx: Ctx = { db, s: { round: 0, order: [], units: {}, persons: {},
    map: { def: "test", width: 1, height: 1, terrain: [], featureHp: {} }, factions: {}, knowledge: {},
    rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
  makeUnit(ctx, { id: "u", owner: "a", pos: { x: 0, y: 0 }, frame: "frame/hound-mk2",
    persons: [{ id: "p", def: "person/ren-kasai", seat: "pilot" }] });
  return ctx;
}

test("鉤子依 order→id→uid 排序，onHit/onBeingHit 消費 uses", () => {
  const defs = [effect("z", { order: 1 }), effect("b"), effect("a"),
    effect("uses", { clock: { kind: "uses", n: 2 }, hooks: { onHit: [{ do: "emit", event: "Used" }], onBeingHit: [{ do: "emit", event: "Used" }] } })];
  for (const d of defs.slice(0, 3)) d.hooks.onTurnStart = [{ do: "emit", event: d.name }];
  const ctx = setup(defs);
  for (const name of ["b", "a", "z", "a", "uses"]) applyEffect(ctx, `effect/${name}`, { unit: "u" }, "source");
  const seen: number[] = [];
  const previous = registerVerb("spawn", (_c, _a, hc) => { seen.push(hc.inst!.uid); });
  try {
    dispatchHook(ctx, "onTurnStart", { unit: "u" });
    assert.deepEqual(ctx.s.log.events.filter(e => ["a", "b", "z"].includes(e.type)).map(e => e.type), ["z", "a", "a", "b"]);
    const uses = effectsOf(ctx, { unit: "u" }).find(e => e.effect.endsWith("/uses"))!;
    dispatchHook(ctx, "onHit", { unit: "u" }); assert.equal(uses.remaining, 1);
    dispatchHook(ctx, "onBeingHit", { unit: "u" }); assert.equal(effectsOf(ctx, { unit: "u" }).includes(uses), false);
    assert.equal(ctx.s.pending.length, 0);
  } finally { registerVerb("spawn", previous ?? (() => {})); }
});

test("鉤子新增效果進 pending、同鍵忽略且本次不補跑", () => {
  const ctx = setup([
    effect("parent", { hooks: { onTurnStart: [{ do: "apply", to: "self", effects: ["effect/child", "effect/child"] },
      { do: "spawn", species: "species/tidewolf", grade: "C", at: "adjacent" }] } }),
    effect("child", { hooks: { onApply: [{ do: "emit", event: "ChildApplied" }], onTurnStart: [{ do: "emit", event: "ChildTick" }] } }),
  ]);
  let pending = 0, installed = 0;
  // 同一行程跑全套時，測試結束須恢復正式 spawn 的全域登記。
  const previous = registerVerb("spawn", (c) => {
    pending = c.s.pending.filter(e => e.uid >= 0 && e.effect.endsWith("/child")).length;
    installed = effectsOf(c, { unit: "u" }).filter(e => e.effect.endsWith("/child")).length;
  });
  try {
    applyEffect(ctx, "effect/parent", { unit: "u" }, "source");
    dispatchHook(ctx, "onTurnStart", { unit: "u" });
    assert.equal(pending, 1); assert.equal(installed, 0); assert.equal(ctx.s.pending.length, 0);
    assert.equal(effectsOf(ctx, { unit: "u" }).length, 2);
    assert.equal(ctx.s.log.events.filter(e => e.type === "ChildApplied").length, 1);
    assert.equal(ctx.s.log.events.filter(e => e.type === "ChildTick").length, 0);
    dispatchHook(ctx, "onTurnStart", { unit: "u" });
    assert.equal(ctx.s.log.events.filter(e => e.type === "ChildTick").length, 1);
  } finally { registerVerb("spawn", previous ?? (() => {})); }
});

test("未登記動詞寫 HookSkipped；內建 pool/apply/remove/emit 與指令覆寫", () => {
  const ctx = setup([effect("gift", { scope: "person" })]);
  const hc = { inst: null, self: { unit: "u" }, source: "u" };
  runActions(ctx, [{ do: "unregistered" } as unknown as HookAction], hc);
  assert.deepEqual(ctx.s.log.events[0]!.payload, { verb: "unregistered" });
  assert.equal(ctx.s.log.events[0]!.type, "HookSkipped");
  runActions(ctx, [{ do: "pool", owner: "mech", pool: "heat", delta: 5 }, { do: "apply", to: "seats", effects: ["effect/gift"] },
    { do: "emit", event: "Number", payload: { heat: { ref: "self.pools.heat.cur" } } }], hc);
  assert.equal(unit(ctx, "u").pools.heat!.cur, 5); assert.equal(person(ctx, "p").effects.length, 1);
  assert.deepEqual(ctx.s.log.events.at(-1)!.payload, { heat: 5 });
  runActions(ctx, [{ do: "remove", tags: ["probe"] }], { ...hc, self: { person: "p" } });
  assert.equal(person(ctx, "p").effects.length, 0);
  const old = commandHandler("wait");
  try {
    registerCommand("wait", () => ({ code: "unsupported" }));
    assert.deepEqual(commandHandler("wait")!(ctx, { kind: "wait", actor: "u" }), { code: "unsupported" });
    registerCommand("wait", () => null); assert.equal(commandHandler("wait")!(ctx, { kind: "wait", actor: "u" }), null);
  } finally { registerCommand("wait", old ?? (() => ({ code: "unsupported" }))); }
});

test("signal 依 order/key 呼叫，同 key 重登記覆蓋", () => {
  const ctx = setup(), seen: string[] = [];
  const handler = (key: string) => (c: Ctx) => { if (c === ctx) seen.push(key); };
  onSignal("roundEnd", "hooks-b", 5, handler("old"));
  onSignal("roundEnd", "hooks-b", 5, handler("b"));
  onSignal("roundEnd", "hooks-a", 5, handler("a"));
  onSignal("roundEnd", "hooks-z", -1, handler("z"));
  signal(ctx, "roundEnd", { round: 0 });
  assert.deepEqual(seen, ["z", "a", "b"]);
});
