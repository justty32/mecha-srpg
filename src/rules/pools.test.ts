import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPacks, readPackDir } from "../content/loader.ts";
import type { FrameDef, PoolDecl } from "../core/types-def.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import { makeUnit, newRuntime, person, unit } from "./state.ts";
import type { Ctx } from "./state.ts";
import { canPay, changePool, pay, poolDecls, recomputePool, regenTick, updateBand } from "./pools.ts";
import { onSignal } from "./hooks.ts";

function setup(extra: PoolDecl[] = []): Ctx {
  const pack = readPackDir("content/base");
  (pack.files["frames/hound-mk2.json"] as FrameDef).pools.push(...extra);
  const { db, errors } = loadPacks([pack, readPackDir("test/scenarios/pack")]); assert.deepEqual(errors, []);
  const ctx: Ctx = { db, s: { round: 0, order: [], units: {}, persons: {},
    map: { def: "test", width: 1, height: 1, terrain: [], featureHp: {} }, factions: {}, knowledge: {},
    rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
  makeUnit(ctx, { id: "u", owner: "a", pos: { x: 0, y: 0 }, frame: "frame/hound-mk2",
    components: { "left-weapon": "component/autocannon-30", "right-weapon": "component/autocannon-30" },
    persons: [{ id: "p", def: "person/ren-kasai", seat: "pilot" }] });
  return ctx;
}

test("DN-M-08 未毀部件池合併；部件層毀損重算可用上限", () => {
  const ctx = setup(), u = unit(ctx, "u");
  assert.deepEqual(poolDecls(ctx, { unit: "u" }).map(d => d.id), ["ammo-30", "heat"]);
  u.pools["ammo-30"]!.cur = 24;
  u.parts["left-arm"]!.layers.at(-1)!.broken = true;
  recomputePool(ctx, { unit: "u" }, "ammo-30");
  assert.equal(u.pools["ammo-30"]!.max, 12); assert.equal(u.pools["ammo-30"]!.cur, 12);
  u.parts["right-arm"]!.broken = true;
  recomputePool(ctx, { unit: "u" }, "ammo-30");
  assert.equal(u.pools["ammo-30"]!.max, 0); assert.equal(u.pools["ammo-30"]!.cur, 0);
});

test("DC-T02 DC-T03 regenTick ①再生②decay③夾限④帶⑤見底，soft 保留超載", () => {
  const ctx = setup([{ id: "decay", name: "衰減", min: 0, max: 10, capKind: "hard", inverted: false,
    initial: 10, regen: 10, decayCurve: { kind: "toward", baseline: 0, rate: 0.5 }, bands: [] }]);
  const u = unit(ctx, "u"); u.pools.heat!.cur = 145;
  regenTick(ctx, { unit: "u" });
  assert.equal(u.pools.decay!.cur, 10); // 若先夾限再 decay 就會錯成 5。
  assert.equal(u.pools.heat!.cur, 130); assert.equal(u.pools.heat!.band, 1);
  assert.equal(u.effects[0]!.effect, "base:effect/overheat-2");
  person(ctx, "p").pools.ap!.cur = 8; person(ctx, "p").pools.hp!.cur = 0;
  regenTick(ctx, { person: "p" });
  assert.equal(person(ctx, "p").pools.ap!.cur, 9);
  assert.equal(person(ctx, "p").effects[0]!.effect, "base:effect/dead");
  assert.deepEqual(ctx.s.log.events.filter(e => e.type === "PoolChanged" && e.payload.owner === "u").map(e => e.payload.pool), ["ammo-30", "decay", "heat"]);
});

test("DC-T03 canPay 合併所有成本，inverted 只有 soft+allowOverload 可超載", () => {
  const ctx = setup(); unit(ctx, "u").pools.heat!.cur = 95; person(ctx, "p").pools.fatigue!.cur = 95;
  assert.equal(canPay(ctx, "u", "p", [{ owner: "mech", pool: "heat", amount: 6 }]), false);
  assert.equal(canPay(ctx, "u", "p", [{ owner: "mech", pool: "heat", amount: 6, allowOverload: true }]), true);
  assert.equal(canPay(ctx, "u", "p", [{ owner: "person", pool: "fatigue", amount: 6, allowOverload: true }]), false);
  assert.equal(canPay(ctx, "u", "p", [{ owner: "person", pool: "ap", amount: 5 }, { owner: "person", pool: "ap", amount: 5 }]), false);
  assert.equal(canPay(ctx, "u", "p", [{ owner: "mech", pool: "heat", amount: 3 }, { owner: "mech", pool: "heat", amount: 3 }]), false);
  assert.equal(canPay(ctx, "u", null, [{ owner: "person", pool: "ap", amount: 1 }]), false);
  assert.equal(canPay(ctx, "u", "p", [{ owner: "mech", pool: "missing", amount: 0 }]), false);
  assert.equal(canPay(ctx, "u", "p", [{ owner: "mech", pool: "heat", amount: -1 }]), false);
});

test("pay 一般池扣而 inverted 加，changePool 回實際值與固定事件欄位", () => {
  const ctx = setup();
  pay(ctx, "u", "p", [{ owner: "person", pool: "ap", amount: 3 }, { owner: "mech", pool: "heat", amount: 7 }], "cost");
  assert.equal(person(ctx, "p").pools.ap!.cur, 6); assert.equal(unit(ctx, "u").pools.heat!.cur, 7);
  assert.deepEqual(ctx.s.log.events[0]!.payload, { owner: "p", pool: "ap", from: 9, to: 6, reason: "cost" });
  assert.equal(changePool(ctx, { person: "p" }, "ap", 99, "gain"), 3);
  assert.equal(changePool(ctx, { unit: "u" }, "heat", -99, "cool"), -7);
  const before = structuredClone(ctx.s);
  assert.throws(() => pay(ctx, "u", "p", [{ owner: "person", pool: "ap", amount: 10 }], "cost"));
  assert.deepEqual(ctx.s, before);
});

test("DC-T05 帶切換精確撤掛 overheat-1→overheat-2，離帶即撤來源", () => {
  const ctx = setup(), owner = { unit: "u" }, u = unit(ctx, "u");
  changePool(ctx, owner, "heat", 100, "heat");
  assert.equal(u.effects[0]!.effect, "base:effect/overheat-1");
  const uid = u.effects[0]!.uid; updateBand(ctx, owner, "heat"); assert.equal(u.effects[0]!.uid, uid);
  changePool(ctx, owner, "heat", 25, "heat");
  assert.equal(u.effects.length, 1); assert.equal(u.effects[0]!.effect, "base:effect/overheat-2");
  assert.equal(u.effects[0]!.source, "band:u:heat");
  changePool(ctx, owner, "heat", -26, "cool"); assert.equal(u.effects.length, 0); assert.equal(u.pools.heat!.band, -1);
  assert.equal(ctx.s.log.events.filter(e => e.type === "EffectExpired").length, 2);
});

test("onDepleted 變化僅跨過 min 觸發、regen 見底觸發，signal 帶 owner/kind/pool", () => {
  const ctx = setup(), seen: unknown[] = [];
  onSignal("poolDepleted", "pools-test", 0, (c, p) => { if (c === ctx) seen.push(p); });
  changePool(ctx, { person: "p" }, "hp", -70, "damage");
  changePool(ctx, { person: "p" }, "hp", -1, "damage");
  assert.equal(person(ctx, "p").effects[0]!.effect, "base:effect/dead");
  assert.deepEqual(seen, [{ owner: "p", kind: "person", pool: "hp" }]);
  regenTick(ctx, { person: "p" });
  assert.equal(seen.filter(p => (p as { pool: string }).pool === "hp").length, 2);
  assert.equal(person(ctx, "p").effects.length, 1);
});
