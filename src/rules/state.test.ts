import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import { NumExprError } from "../core/numexpr.ts";
import { newRuntime, rt, makeUnit, makePerson, frameView, layerDefs, seatsOf, commanderOf, evalCtxFor,
  unitTags, personTags, unit, person, constant, emit, distance, inBounds, unitAt, terrainAt, hostile, isActive } from "./state.ts";
import type { Ctx } from "./state.ts";

const db = loadContentDirs(["content/base", "test/scenarios/pack"]).db;
function setup(): Ctx {
  return { db, s: { round: 0, order: [], units: {}, persons: {},
    map: { def: "test", width: 3, height: 3, terrain: Array(9).fill(db.ids("terrain")[0]), featureHp: {} },
    factions: {}, knowledge: {}, rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
}

test("DN-M-08 makeUnit 合併機體與兩門部件池，部件層置於最內且不改 Def", () => {
  const ctx = setup();
  const u = makeUnit(ctx, { id: "u", frame: "frame/hound-mk2", owner: "player", pos: { x: 0, y: 0 },
    components: { "right-weapon": "component/autocannon-30", "left-weapon": "component/autocannon-30" } });
  assert.equal(u.pools.heat!.max, 100);
  assert.equal(u.pools["ammo-30"]!.max, 24);
  assert.equal(u.pools["ammo-30"]!.cur, 12);
  assert.deepEqual(layerDefs(ctx, "u", "left-arm").at(-1), { type: "component", hp: 20, ablative: true, resist: {}, passThrough: {}, structural: false });
  assert.equal(u.parts["left-arm"]!.layers.at(-1)!.hp, 20);
  assert.equal(db.require("bodyplan", "bodyplan/biped-light").parts[1]!.layers.length, 1);
  assert.equal(u.controlMode, "none");
  assert.equal(ctx.s.log.events.length, 0);
});

test("怪獸 tidewolf C 的 frameView 使用物種屬性與能力", () => {
  const ctx = setup();
  makeUnit(ctx, { id: "wolf", monster: { species: "species/tidewolf", grade: "C" }, owner: "enemy", pos: { x: 1, y: 1 } });
  const f = frameView(ctx, "wolf");
  assert.equal(f.cls, "bio"); assert.equal(f.grade, "C"); assert.equal(f.baseAttrs.initiative, 9);
  assert.deepEqual(f.innateAbilities, db.require("species", "species/tidewolf").abilities);
  assert.equal(unit(ctx, "wolf").frame, "base:species/tidewolf");
  assert.equal(evalCtxFor(ctx, { unit: "wolf" }).ref("self.grade"), 1);
  assert.deepEqual(unitTags(ctx, "wolf"), ["beast", "kaiju"]);
});

test("人物入座、指令權與同名池覆寫，DC-C01 引用以人物優先", () => {
  const ctx = setup();
  makeUnit(ctx, { id: "u", frame: "frame/hound-mk2", owner: "player", pos: { x: 0, y: 0 },
    persons: [{ id: "s", def: "person/unit-07", seat: "soul" }, { id: "p", def: "person/ren-kasai", seat: "pilot" }], pools: { ap: 4 } });
  assert.equal(unit(ctx, "u").controlMode, "pilot");
  assert.deepEqual(seatsOf(ctx, "u").map(s => s.person), ["p", "s"]);
  assert.equal(commanderOf(ctx, "u"), "p");
  person(ctx, "p").will.resonance[unit(ctx, "u").frame] = 0.7;
  const ev = evalCtxFor(ctx, { unit: "u", person: "p" }, { person: "s" });
  assert.equal(ev.ref("self.attrs.initiative"), 7); assert.equal(ev.ref("target.attrs.accuracy"), 50);
  assert.equal(ev.ref("self.pools.ap.cur"), 4); assert.equal(ev.ref("self.pools.heat.max"), 100);
  assert.equal(ev.ref("self.resonance"), 0.7); assert.equal(ev.ref("battle.round"), 0);
  assert.deepEqual(personTags(ctx, "s"), ["soul"]);
  assert.throws(() => ev.ref("self.missing"), NumExprError);
  rt(ctx.s).commander.u = null; assert.equal(commanderOf(ctx, "u"), null);
});

test("地圖、敵我、存活狀態與佔格查詢保持純讀", () => {
  const ctx = setup();
  for (const id of ["a", "b"]) makeUnit(ctx, { id, frame: "frame/hound-mk2", owner: id, pos: { x: id === "a" ? 0 : 1, y: 0 } });
  assert.equal(distance({ x: 0, y: 0 }, { x: 2, y: 1 }), 2);
  assert.equal(inBounds(ctx.s, { x: 3, y: 0 }), false);
  assert.equal(unitAt(ctx, { x: 0, y: 0 }), "a"); assert.equal(isActive(ctx, "a"), true);
  assert.equal(hostile(ctx, "a", "b"), true);
  unit(ctx, "b").owner = "a"; assert.equal(hostile(ctx, "a", "b"), false);
  unit(ctx, "b").owner = "berserk"; assert.equal(hostile(ctx, "a", "b"), true);
  rt(ctx.s).unitStatus.a = "derelict"; assert.equal(unitAt(ctx, { x: 0, y: 0 }), "a");
  rt(ctx.s).unitStatus.a = "dead"; assert.equal(unitAt(ctx, { x: 0, y: 0 }), null);
  assert.equal(terrainAt(ctx, { x: 0, y: 0 }).id, db.ids("terrain")[0]);
  assert.throws(() => terrainAt(ctx, { x: -1, y: 0 }));
});

test("runtime 與事件 metadata、缺鍵錯誤及獨立人物初始化", () => {
  const ctx = setup();
  assert.equal(rt(ctx.s).maxRounds, null);
  assert.equal(makePerson(ctx, "p", "person/ren-kasai").pools.ap!.cur, 9);
  assert.equal(constant(ctx, "defaultEffectOrder"), db.rules.constants.defaultEffectOrder);
  assert.throws(() => constant(ctx, "missing")); assert.throws(() => unit(ctx, "missing")); assert.throws(() => person(ctx, "missing"));
  assert.equal(emit(ctx, "Probe").turn, undefined);
  rt(ctx.s).active = "u"; ctx.s.round = 3;
  assert.deepEqual(emit(ctx, "Probe", { amount: 2 }), { seq: 1, round: 3, turn: "u", type: "Probe", payload: { amount: 2 } });
  delete ctx.s.rt; assert.throws(() => rt(ctx.s));
});
